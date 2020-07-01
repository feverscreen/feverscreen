import { ROIFeature } from "@/feature-detection";

function accumulatePixel(
  dest: Float32Array,
  x: number,
  y: number,
  amount: number,
  width: number,
  height: number
) {
  x = ~~x;
  y = ~~y;
  if (x < 0 || y < 0) {
    return;
  }
  if (x >= width || y >= height) {
    return;
  }
  const index = y * width + x;
  dest[index] += amount;
}

function addCircle(
  dest: Float32Array,
  cx: number,
  cy: number,
  radius: number,
  amount: number,
  width: number,
  height: number
) {
  accumulatePixel(dest, cx + radius, cy, amount, width, height);
  accumulatePixel(dest, cx - radius, cy, amount, width, height);
  accumulatePixel(dest, cx, cy + radius, amount, width, height);
  accumulatePixel(dest, cx, cy - radius, amount, width, height);
  let d = 3 - 2 * radius;
  let ix = 1;
  let iy = radius;
  while (ix < iy) {
    //Bresenham
    if (d < 0) {
      d += 4 * ix + 6;
    } else {
      iy = iy - 1;
      d += 4 * (ix - iy) + 10;
    }
    accumulatePixel(dest, cx + ix, cy + iy, amount, width, height);
    accumulatePixel(dest, cx - ix, cy + iy, amount, width, height);
    accumulatePixel(dest, cx + ix, cy - iy, amount, width, height);
    accumulatePixel(dest, cx - ix, cy - iy, amount, width, height);
    accumulatePixel(dest, cx + iy, cy + ix, amount, width, height);
    accumulatePixel(dest, cx - iy, cy + ix, amount, width, height);
    accumulatePixel(dest, cx + iy, cy - ix, amount, width, height);
    accumulatePixel(dest, cx - iy, cy - ix, amount, width, height);
    ix += 1;
  }
}

export function edgeDetect(
  source: Float32Array,
  frameWidth: number,
  frameHeight: number
) {
  const width = frameWidth;
  const height = frameHeight;
  const dest = new Float32Array(width * height);
  for (let y = 2; y < height - 2; y++) {
    for (let x = 2; x < width - 2; x++) {
      const index = y * width + x;
      const value =
        source[index] * 4 -
        source[index - 1] -
        source[index + 1] -
        source[index + width] -
        source[index - width];
      dest[index] = Math.max(value - 40, 0);
    }
  }

  return dest;
}

export function circleDetectRadius(
  source: Float32Array,
  dest: Float32Array,
  radius: number,
  width: number,
  height: number,
  wx0: number,
  wy0: number,
  wx1: number,
  wy1: number
): [number, number, number] {
  radius = Math.max(radius, 0.00001);
  for (let i = 0; i < width * height; i++) {
    dest[i] = 0;
  }

  wx0 = Math.max(wx0, 2);
  wy0 = Math.max(wy0, 2);
  wx1 = Math.min(wx1, width - 2);
  wy1 = Math.min(wy1, height - 2);

  for (let y = wy0; y < wy1; y++) {
    for (let x = wx0; x < wx1; x++) {
      const index = y * width + x;
      const value = source[index];
      if (value < 1) {
        continue;
      }
      addCircle(dest, x, y, radius, 1, width, height);
    }
  }
  let result = 0;
  let rx = 0;
  let ry = 0;
  for (let y = wy0; y < wy1; y++) {
    for (let x = wx0; x < wx1; x++) {
      const index = y * width + x;
      if (result < dest[index]) {
        result = dest[index];
        rx = x;
        ry = y;
      }
    }
  }
  return [result / (2 + radius), rx, ry];
}

export function circleDetect(
  source: Float32Array,
  frameWidth: number,
  frameHeight: number
): [number, number, number] {
  const dest = new Float32Array(frameWidth * frameHeight);
  let radius = 3.0;
  let bestRadius = -1;
  let bestValue = 2;
  let bestX = 0;
  let bestY = 0;

  while (radius < 20) {
    let value = 0;
    let cx = 0;
    let cy = 0;
    [value, cx, cy] = circleDetectRadius(
      source,
      dest,
      radius,
      frameWidth,
      frameHeight,
      2,
      2,
      frameWidth - 2,
      frameHeight - 2
    );
    if (bestValue < value) {
      bestValue = value;
      bestRadius = radius;
      bestX = cx;
      bestY = cy;
    }
    radius = ~~(radius * 1.03 + 1);
  }
  return [bestRadius, bestX, bestY];
}

function pointIsInCircle(
  px: number,
  py: number,
  cx: number,
  cy: number,
  r: number
): boolean {
  const dx = Math.abs(px - cx);
  const dy = Math.abs(py - cy);
  return Math.sqrt(dx * dx + dy * dy) < r;
}

export function extractSensorValueForCircle(
  r: ROIFeature,
  source: Float32Array,
  width: number
): number {
  const x0 = ~~r.x0;
  const y0 = ~~r.y0;
  const x1 = ~~r.x1;
  const y1 = ~~r.y1;
  const values: number[] = [];
  const centerX = Math.floor(r.x0 + (r.x1 - r.x0) / 2);
  const centerY = Math.floor(r.y0 + (r.y1 - r.y0) / 2);
  const radius = r.width() / 2;
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      if (pointIsInCircle(x, y, centerX, centerY, radius)) {
        const index = y * width + x;
        values.push(source[index]);
      }
    }
  }
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
  }
  return sum / values.length;
}
