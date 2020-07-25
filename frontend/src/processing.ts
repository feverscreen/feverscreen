import { Frame } from "./camera";

// radial smoothing kernel.
const kernel = new Float32Array(7);
const radius = 3;
let i = 0;
for (let r = -radius; r <= radius; r++) {
  kernel[i++] = Math.exp((-8 * (r * r)) / radius / radius);
}

function medianThree(a: number, b: number, c: number): number {
  if (a <= b && b <= c) return b;
  if (c <= b && b <= a) return b;

  if (b <= a && a <= c) return a;
  if (c <= a && a <= b) return a;
  return c;
}

function medianSmoothPass(
  source: Float32Array,
  delta: number,
  swizzle: number,
  frameWidth: number,
  frameHeight: number
): Float32Array {
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
      const index = y * frameWidth + x;
      const current = source[index];
      const value = medianThree(
        source[index - delta],
        current,
        source[index + delta]
      );
      source[index] = (current * 3 + value) / 4;
    }
  }
  return source;
}

function medianSmooth(
  source: Float32Array,
  frameWidth: number,
  frameHeight: number
): Float32Array {
  source = medianSmoothPass(source, 1, 0, frameWidth, frameHeight);
  source = medianSmoothPass(source, frameWidth, 0, frameWidth, frameHeight);
  source = medianSmoothPass(source, frameWidth, 3, frameWidth, frameHeight);
  source = medianSmoothPass(source, 1, 3, frameWidth, frameHeight);
  return source;
}

function radialSmoothHalf(
  source: Float32Array,
  width: number,
  height: number
): Float32Array {
  const dest = new Float32Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const indexSource = y * width + x;
      const indexDest = x * height + y;
      let value = 0;
      let kernelSum = 0;

      const r0 = Math.max(-x, -radius);
      const r1 = Math.min(width - x, radius + 1);
      for (let r = r0; r < r1; r++) {
        const kernelValue = kernel[r + radius];
        value += source[indexSource + r] * kernelValue;
        kernelSum += kernelValue;
      }
      dest[indexDest] = value / kernelSum;
    }
  }
  return dest;
}

function radialSmooth(
  source: Float32Array,
  frameWidth: number,
  frameHeight: number
): Float32Array {
  const temp = radialSmoothHalf(source, frameWidth, frameHeight);
  // noinspection JSSuspiciousNameCombination
  return radialSmoothHalf(temp, frameHeight, frameWidth);
}

export const processSensorData = (sensorData: Frame) => {
  const saltPepperData = medianSmooth(
    sensorData.frame,
    sensorData.frameInfo.Camera.ResX,
    sensorData.frameInfo.Camera.ResY
  );
  //next, a radial blur, this averages out surrounding pixels, trading accuracy for effective resolution
  const smoothedData = radialSmooth(
    saltPepperData,
    sensorData.frameInfo.Camera.ResX,
    sensorData.frameInfo.Camera.ResY
  );
  sensorData.smoothed = smoothedData;
  sensorData.medianed = saltPepperData;
};
