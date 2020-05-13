// JS version of image smoothing pre-processing, currently unused because too slow on older iOS safari devices.

// radial smoothing kernel.
const kernel = new Float32Array(7);
const radius = 3;
let i = 0;
for (let r = -radius; r <= radius; r++) {
    kernel[i++] = Math.exp((-4 * (r * r)) / radius / radius);
}

function median_three(a: number, b: number, c: number): number {
    if (a <= b && b <= c) return b;
    if (c <= b && b <= a) return b;

    if (b <= a && a <= c) return a;
    if (c <= a && a <= b) return a;

    return c;
}

function median_smooth_pass(source: Float32Array, delta: number, swizzle: number, frameWidth: number, frameHeight: number): Float32Array {
    let x0 = 2;
    let x1 = frameWidth - 2;
    let dx = 1;
    let y0 = 2;
    let y1 = frameHeight - 2;
    let dy = 1;
    if (swizzle & 1) {
        [x0, x1] = [x1, x0];
        dx = -dx;
    }
    if (swizzle & 2) {
        [y0, y1] = [y1, y0];

        dy = -dy;
    }
    for (let y = y0; y !== y1; y += dy) {
        for (let x = x0; x !== x1; x += dx) {
            let index = y * frameWidth + x;
            let current = source[index];
            const value = median_three(
                source[index - delta],
                current,
                source[index + delta]
            );
            source[index] = (current * 3 + value) / 4;
        }
    }
    return source;
}

function median_smooth(source: Float32Array, frameWidth: number, frameHeight: number): Float32Array {
    source = median_smooth_pass(source, 1, 0, frameWidth, frameHeight);
    source = median_smooth_pass(source, frameWidth, 0, frameWidth, frameHeight);
    source = median_smooth_pass(source, frameWidth, 3, frameWidth, frameHeight);
    source = median_smooth_pass(source, 1, 3, frameWidth, frameHeight);
    return source;
}

// Allocate the intermediate arrays for radial smoothing once, saves quite a lot of GC time on iOS.
const d1 = new Float32Array(160 * 120);
const d2 = new Float32Array(160 * 120);
function radial_smooth_half(source: Float32Array, dest: Float32Array, width: number, height: number): Float32Array {
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let indexS = y * width + x;
            let indexD = x * height + y;
            let value = 0;
            let kernel_sum = 0;

            let r0 = Math.max(-x, -3);
            let r1 = Math.min(width - x, 4);
            for (let r = r0; r < r1; r++) {
                let kernel_value = kernel[r + 3];
                value += source[indexS + r] * kernel_value;
                kernel_sum += kernel_value;
            }
            dest[indexD] = value / kernel_sum;
        }
    }
    return dest;
}

function radial_smooth(source: Float32Array, frameWidth: number, frameHeight: number): Float32Array {
    radial_smooth_half(source, d1, frameWidth, frameHeight);
    // noinspection JSSuspiciousNameCombination
    radial_smooth_half(d1, d2, frameHeight, frameWidth);
    return d2;
}
