use crate::types::{LineSegment, Point, SolidShape, Span};

use crate::init::FACE_SHAPE;
#[allow(unused)]
use crate::{get_frame_num, Timer, BODY_SHAPE};
#[allow(unused)]
use log::{info, trace, warn};
use std::cmp::Ordering;

pub fn clear_body_shape() {
    BODY_SHAPE.with(|arr_ref| {
        let mut hull = arr_ref.borrow_mut();
        while hull.len() != 0 {
            hull.pop();
        }
    });
}

pub fn clear_face_shape() {
    FACE_SHAPE.with(|arr_ref| {
        let mut hull = arr_ref.borrow_mut();
        while hull.len() != 0 {
            hull.pop();
        }
    });
}

pub fn get_neck(body_shape: &SolidShape, approx_head_width: u8) -> LineSegment {
    let _p = Timer::new("Get neck");
    // start head_width spans down, so we ignore the square at the top:
    let start = u8::min(approx_head_width, body_shape.len() as u8 - 1) as usize;
    // Assume a head is max 1.7x as long as it is wide.  Is this a valid assumption?
    let end = u8::min(
        f32::ceil(approx_head_width as f32 * 1.7) as u8,
        body_shape.len() as u8 - 1,
    ) as usize;
    let search_area = &body_shape.inner[start..end];
    // We might be better starting half-way through the neck search slice?

    let (left, right) = narrowest_slanted(search_area, approx_head_width as f32);
    let neck_line = LineSegment {
        start: left,
        end: right,
    };
    // debug_assert!(neck_line.len() <= approx_head_width as f32);
     info!(
         "Neck Len: {} approx head: {} start: {} end: {} body: {}",
         neck_line.len(),
         approx_head_width,
         start,
         end,
         body_shape.len()
    );

    neck_line
}

pub fn narrowest_slanted(shape: &[Span], max_distance: f32) -> (Point, Point) {
    if shape.len() != 0 {
        let mut distances = Vec::new();
        for i in 0..shape.len() {
            for j in 0..shape.len() {
                if i != j {
                    let d = shape[i].start().distance_to(shape[j].end());
                    if d < max_distance * 1.2 {
                        distances.push((
                            d,
                            shape[i],
                            shape[j],
                            i8::abs(shape[i].y as i8 - shape[j].y as i8) as u8,
                        ));
                    }
                }
            }
        }
        distances.sort_by(|a, b| {
            let a_left = &a.1;
            let a_right = &a.2;
            let b_left = &b.1;
            let b_right = &b.2;

            // Ignore spans that are on the edges of the frame
            if a_left.x0 == 0 || a_right.x1 == 119 || b_left.x0 == 0 || b_right.x1 == 119 {
                return Ordering::Less;
            }
            // Assume no NaNs
            a.0.partial_cmp(&b.0).unwrap()
        });
        // info!("Neck Distances: {}", distances.len());
        if let Some(init) = distances.get(0) {
            // For all the distances close to the best distance, take the one with the least skew.
            let best_d = init.0;
            let (_, left, right, _) = distances[1..]
                .iter()
                .filter(|&a| f32::abs(a.0 - best_d) < 1.0)
                .fold(init, |acc, item| if item.3 <= acc.3 { item } else { acc });
            (left.start(), right.end())
        } else {
            (Point::default(), Point::default())
        }
    } else {
        (Point::default(), Point::default())
    }
}

pub fn guess_approx_head_width(mut body_shape: SolidShape) -> u8 {
    let _p = Timer::new("Guess head width");
    // Expand so that the shape is convex

    if body_shape.len() > 10 {
        let mut prev = body_shape.inner[0];
        for curr in &mut body_shape.inner[1..] {
            curr.x0 = u8::min(curr.x0, prev.x0);
            curr.x1 = u8::max(curr.x1, prev.x1);
            prev = curr.clone();
        }
        let max_width = body_shape.inner.last().unwrap().width();
        let mut hist = [0u8; 120];
        for span_width in body_shape
            .inner
            .iter()
            .map(|s| s.width())
            .filter(|&w| w != max_width && w as f32 >= (max_width as f32 / 3.5))
        {
            hist[span_width as usize] += 1;
        }

        // Try and find the smallest duplicate width with at least a count of 3

        if let Some(min_width) = hist
            .iter()
            .enumerate()
            .filter(|(_, &x)| x >= 3)
            .min_by(|(a, _), (b, _)| a.cmp(b))
        {
            min_width.0 as u8
        } else {
            0
        }
    } else {
        0
    }
}
