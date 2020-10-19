#[allow(unused)]
use crate::get_frame_num;
use crate::init::{ImageBuffers, WIDTH};
use crate::types::{Circle, Point, Rect, ThermalRefStats};
use imgref::Img;
#[allow(unused)]
use log::{info, trace, warn};

pub const THERMAL_REF_WIDTH: usize = 42;

pub fn extract_sensor_value_for_circle(
    circle: Circle,
    median_smoothed: Img<&[f32]>,
) -> ThermalRefStats {
    let bounds = circle.bounds();
    let mut values = Vec::with_capacity(
        (std::f64::consts::PI * circle.radius as f64 * circle.radius as f64) as usize,
    );

    for y in (bounds.y0 as usize)..(bounds.y1 as usize) {
        for x in (bounds.x0 as usize)..(bounds.x1 as usize) {
            let test_p = Point {
                x: x as f32 + 0.5,
                y: y as f32 + 0.5,
            };
            if circle.contains_point(test_p) {
                values.push((test_p, median_smoothed[(x, y)]));
            }
        }
    }
    values.sort_by(|(_, a), (_, b)| a.partial_cmp(b).unwrap());
    let sum: f32 = values.iter().map(|(_, v)| *v).sum();
    assert_ne!(values.len(), 0);
    ThermalRefStats {
        p: values[values.len() / 2].0,
        mean: sum / values.len() as f32,
        median: values[values.len() / 2].1,
        min: values.first().unwrap().1,
        max: values.last().unwrap().1,
        count: values.len(),
    }
}

pub fn detect_thermal_ref(prev_ref: Option<Circle>, buffer_ctx: &ImageBuffers) -> Option<Circle> {
    match prev_ref {
        Some(prev_ref) => {
            let existing_thermal_ref = circle_still_present(prev_ref, 120, 160, buffer_ctx);
            if existing_thermal_ref.is_none() {
                circle_detect(120, 160, buffer_ctx, Some(prev_ref))
            } else {
                existing_thermal_ref
            }
        }
        None => circle_detect(120, 160, buffer_ctx, None),
    }
}

pub fn get_extended_thermal_ref_rect(thermal_ref_rect: Rect, width: isize, height: isize) -> Rect {
    let thermal_ref_circumference = thermal_ref_rect.width();
    let thermal_ref_radius = thermal_ref_circumference / 2;
    let thermal_ref_is_on_left = thermal_ref_rect.x0 < (width / 2) as usize;
    let fudge_factor = 1;
    if thermal_ref_is_on_left {
        Rect {
            x0: 0,
            x1: usize::min(
                width as usize,
                thermal_ref_rect.x1 + thermal_ref_radius + fudge_factor,
            ),
            y0: usize::max(0, thermal_ref_rect.y0 - thermal_ref_radius - fudge_factor),
            y1: usize::min(
                height as usize,
                thermal_ref_rect.y1 + (thermal_ref_radius * 6) + fudge_factor,
            ),
        }
    } else {
        Rect {
            x0: usize::max(
                0,
                thermal_ref_rect.x0 - ((thermal_ref_radius as f32 * 1.8) as usize + fudge_factor),
            ),
            x1: width as usize,
            y0: usize::max(
                0,
                thermal_ref_rect.y0 - (thermal_ref_radius as f32 * 8.5) as usize + fudge_factor,
            ),
            y1: height as usize,
        }
    }
}

pub fn get_extended_thermal_ref_rect_full_clip(
    thermal_ref_rect: Rect,
    width: isize,
    height: isize,
) -> Rect {
    let thermal_ref_is_on_left = thermal_ref_rect.x0 < (width / 2) as usize;
    if thermal_ref_is_on_left {
        Rect {
            x0: 0,
            x1: THERMAL_REF_WIDTH,
            y0: 0,
            y1: height as usize,
        }
    } else {
        Rect {
            x0: width as usize - THERMAL_REF_WIDTH,
            x1: width as usize,
            y0: 0,
            y1: height as usize,
        }
    }
}

#[inline]
fn accumulate_pixel(dest: &mut [f32], x: isize, y: isize, width: isize) {
    unsafe { *dest.get_unchecked_mut((y * width + x) as usize) += 1.0 };
}

fn add_circle(scratch: &mut [f32], cx: isize, cy: isize, radius: isize, width: isize) {
    accumulate_pixel(scratch, cx + radius, cy, width);
    accumulate_pixel(scratch, cx - radius, cy, width);
    accumulate_pixel(scratch, cx, cy + radius, width);
    accumulate_pixel(scratch, cx, cy - radius, width);
    let mut d = 3 - (2 * radius);
    let mut ix = 1;
    let mut iy = radius;
    while ix < iy {
        //Bresenham
        if d < 0 {
            d += 4 * ix + 6;
        } else {
            iy = iy - 1;
            d += 4 * (ix - iy) + 10;
        }
        accumulate_pixel(scratch, cx + ix, cy + iy, width);
        accumulate_pixel(scratch, cx - ix, cy + iy, width);
        accumulate_pixel(scratch, cx + ix, cy - iy, width);
        accumulate_pixel(scratch, cx - ix, cy - iy, width);

        accumulate_pixel(scratch, cx + iy, cy + ix, width);
        accumulate_pixel(scratch, cx - iy, cy + ix, width);
        accumulate_pixel(scratch, cx + iy, cy - ix, width);
        accumulate_pixel(scratch, cx - iy, cy - ix, width);
        ix += 1;
    }
}

fn circle_detect_radius(
    edges: &[f32],
    scratch: &mut [f32],
    radius: u8,
    width: isize,
    height: isize,
    x0: isize,
    y0: isize,
    x1: isize,
    y1: isize,
) -> Circle {
    // NOTE(jon): This becomes a memset
    let radius = radius as isize;
    for px in scratch.iter_mut() {
        *px = 0.0;
    }
    let inset = isize::max(2, radius);
    let x0 = isize::max(x0, inset);
    let y0 = isize::max(y0, inset);
    let x1 = isize::min(x1, width - inset);
    let y1 = isize::min(y1, height - inset);

    for y in y0..y1 {
        for x in x0..x1 {
            let index = y * width + x;
            // Really we just want to set a bit-map here, doesn't need to be full float precision
            let value = unsafe { *edges.get_unchecked(index as usize) };
            // Right, the edge detection has left this looking a certain way
            if value == 0.0 {
                // What is 0.0 in this case?  It's basically black?
                continue;
            }
            add_circle(scratch, x, y, radius, width)
        }
    }

    let mut result = 0.0f32;
    let mut center = Point::new(0, 0);
    // Try to find the coordinates of the brightest pixel?
    // Could use a fold here?
    for y in y0..y1 {
        for x in x0..x1 {
            let index = y * width + x;
            let px = unsafe { *scratch.get_unchecked(index as usize) };
            if result < px {
                result = px;
                center = Point::new(x as usize, y as usize);
            }
        }
    }
    Circle {
        // NOTE(jon): Why the division?
        radius: result / radius as f32,
        center,
    }
}

pub fn circle_detect(
    width: isize,
    height: isize,
    buffer_ctx: &ImageBuffers,
    prev_ref: Option<Circle>,
) -> Option<Circle> {
    let mut scratch = buffer_ctx.scratch.borrow_mut();
    let edges = buffer_ctx.edges.borrow();

    let mut best_radius = 0.0;
    let mut best_value = 2.0;
    let mut best_p = Point::new(0, 0);

    // Don't ever let the thermal reference swap sides once it's been found:
    let was_on_left = match prev_ref {
        Some(prev_ref) => (prev_ref.center.x as usize) < WIDTH / 2,
        None => false,
    };

    // We're looking for circles with a radius of *up to* 8px.
    // Surely it's better to start bigger and early out?
    for radius in 3..8 {
        // Check on the two 30px left and right borders of the image, in the lower half
        if prev_ref.is_none() || was_on_left {
            let circle = circle_detect_radius(
                edges.buf(),
                scratch.buf_mut(),
                radius,
                width,
                height,
                0,
                75,
                42,
                height,
            );
            if best_value < circle.radius {
                best_value = circle.radius;
                best_radius = circle.radius;
                best_p = circle.center;
            }
        }
        if prev_ref.is_none() || !was_on_left {
            let circle = circle_detect_radius(
                edges.buf(),
                scratch.buf_mut(),
                radius,
                width,
                height,
                width - 42,
                75,
                width,
                height,
            );
            if best_value < circle.radius {
                best_value = circle.radius;
                best_radius = circle.radius;
                best_p = circle.center;
            }
        }
    }
    if best_radius >= 4.0 {
        Some(Circle {
            radius: best_radius,
            center: best_p,
        })
    } else {
        None
    }
}

fn circle_still_present(
    prev_ref: Circle,
    width: isize,
    height: isize,
    buffer_ctx: &ImageBuffers,
) -> Option<Circle> {
    let mut scratch = buffer_ctx.scratch.borrow_mut();
    let edges = buffer_ctx.edges.borrow();

    let bounds = prev_ref.bounds();
    let radius = prev_ref.radius as isize;
    let grow = radius + 5;
    let circle = circle_detect_radius(
        edges.buf(),
        scratch.buf_mut(),
        radius as u8,
        width,
        height,
        bounds.x0 as isize - grow,
        bounds.y0 as isize - grow,
        bounds.x1 as isize + grow,
        bounds.y1 as isize + grow,
    );

    // FIXME(jon): Why always detecting a smaller radius?
    if circle.radius > 4.0 && prev_ref.contains_point(circle.center) {
        return Some(circle);
    } else {
        None
    }
}
