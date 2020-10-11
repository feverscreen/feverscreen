const KERNEL: [f32; 7] = [
    0.00033546262790251185,
    0.028565500784550377,
    0.41111229050718745,
    1.0,
    0.41111229050718745,
    0.028565500784550377,
    0.00033546262790251185,
];

#[inline(always)]
fn median_three(a: f32, b: f32, c: f32) -> f32 {
    if (a < b && b < c) || (c < b && b < a) {
        return b;
    }
    if (b < a && a < c) || (c < a && a < b) {
        return a;
    }
    c
}

pub fn median_smooth_pass(
    source: &mut [f32],
    stride: usize,
    swizzle: usize,
    width: usize,
    height: usize,
) {
    let mut x0 = 2isize;
    let mut x1 = width as isize - 2;
    let mut dx = 1isize;
    let mut y0 = 2isize;
    let mut y1 = height as isize - 2;
    let mut dy = 1isize;
    if swizzle & 1 != 0 {
        std::mem::swap(&mut x0, &mut x1);
        dx = -1;
    }
    if swizzle & 2 != 0 {
        std::mem::swap(&mut y0, &mut y1);
        dy = -1;
    }
    let mut y = y0;
    while y != y1 {
        let mut x = x0;
        while x != x1 {
            let index = (y * width as isize + x) as usize;
            let current = unsafe { *source.get_unchecked(index) };
            let value = median_three(
                unsafe { *source.get_unchecked(index - stride) },
                current,
                unsafe { *source.get_unchecked(index + stride) },
            );
            unsafe { *source.get_unchecked_mut(index) = (current * 3.0 + value) / 4.0 };
            x += dx;
        }
        y += dy
    }
}

pub fn rotate(source: &[f32], dest: &mut [f32], width: usize, height: usize) {
    let mut i = 0;
    for y in 0..height {
        for x in 0..width {
            unsafe { *dest.get_unchecked_mut(x * height + y) = *source.get_unchecked(i) }
            i += 1;
        }
    }
}

pub fn radial_smooth_half(source: &[f32], dest: &mut [f32], width: usize) {
    source
        .chunks(width)
        .zip(dest.chunks_mut(width))
        .for_each(|(src, dst)| {
            for x in 0..width as isize {
                let mut value: f32 = 0.0;
                let mut kernel_sum: f32 = 0.0;
                let r0 = isize::max(-x, -3);
                let r1 = isize::min(width as isize - x, 4);
                for r in r0..r1 {
                    let kernel_value = unsafe { *KERNEL.get_unchecked((r + 3) as usize) };
                    value += unsafe { *src.get_unchecked((x + r) as usize) } * kernel_value;
                    kernel_sum += kernel_value;
                }
                unsafe {
                    *dst.get_unchecked_mut(x as usize) = value / kernel_sum;
                }
            }
        });
}
