export function moduleTemperatureAnomaly(timeSinceFFC: number) {
  const v0 = timeSinceFFC * 0.006 + 0.12;
  const v1 = Math.exp(-0.0075 * timeSinceFFC - 1.16);
  const ev0 = Math.exp(-15 * v0);
  const ev1 = Math.exp(-15 * v1);
  return (ev0 * v0 + ev1 * v1) / (ev0 + ev1);
}

export function sensorAnomaly(timeSinceFFC: number) {
  const v0 = timeSinceFFC * 0.06 - 0.3;
  const v1 = Math.exp(-0.022 * timeSinceFFC - 0.2);
  const ev0 = Math.exp(-2 * v0);
  const ev1 = Math.exp(-2 * v1);
  return ((ev0 * v0 + ev1 * v1) / (ev0 + ev1)) * 100;
}

export const fahrenheitToCelsius = (f: number) => (f - 32.0) * (5.0 / 9);
export const celsiusToFahrenheit = (c: number) => c * (9.0 / 5) + 32;

export enum FeatureState {
  LeftEdge,
  RightEdge,
  TopEdge,
  BottomEdge,
  Inside,
  Outside,
  None,
  Top,
  Bottom
}

export class ROIFeature {
  constructor() {
    this.flavor = "None";
    this.x0 = 0;
    this.y0 = 0;
    this.x1 = 0;
    this.y1 = 0;
    this.mergeCount = 1;
    this.sensorAge = 0;
    this.sensorMissing = 0;
    this.sensorValue = 0;
    this.sensorValueLowPass = 0;
    this.sensorX = 0;
    this.sensorY = 0;
    this.state = FeatureState.None;
  }

  extend(value: number, maxWidth: number, maxHeight: number): ROIFeature {
    let roi = new ROIFeature();
    roi.x0 = Math.max(0, this.x0 - value);
    roi.x1 = Math.min(maxWidth, this.x1 + value);
    roi.y0 = Math.max(0, this.y0 - value);
    roi.y1 = Math.min(maxHeight, this.y1 + value);
    roi.flavor = this.flavor;
    return roi;
  }

  onEdge(): boolean {
    return (
      this.state == FeatureState.BottomEdge ||
      this.state == FeatureState.TopEdge ||
      this.state == FeatureState.LeftEdge ||
      this.state == FeatureState.RightEdge
    );
  }
  wider(other: ROIFeature | null | undefined): boolean {
    return !other || this.width() > other.width();
  }

  higher(other: ROIFeature | null | undefined): boolean {
    return !other || this.height() > other.height();
  }

  hasXValues() {
    return this.x0 != -1 && this.x1 != -1;
  }

  hasYValues() {
    return this.y0 != -1 && this.y1 != -1;
  }

  midX() {
    return (this.x0 + this.x1) / 2;
  }
  midY() {
    return (this.y0 + this.y1) / 2;
  }

  width() {
    return this.x1 - this.x0;
  }

  height() {
    return this.y1 - this.y0;
  }

  midDiff(other: ROIFeature): number {
    return euclDistance(this.midX(), this.midY(), other.midX(), other.midY());
  }

  overlapsROI(other: ROIFeature): boolean {
    return this.overlap(other.x0, other.y0, other.x1, other.y1);
  }

  overlap(x0: number, y0: number, x1: number, y1: number) {
    if (x1 <= this.x0) {
      return false;
    }
    if (y1 <= this.y0) {
      return false;
    }
    if (this.x1 <= x0) {
      return false;
    }
    if (this.y1 <= y0) {
      return false;
    }
    return true;
  }

  contains(x: number, y: number) {
    if (x <= this.x0) {
      return false;
    }
    if (y <= this.y0) {
      return false;
    }
    if (this.x1 < x) {
      return false;
    }
    if (this.y1 < y) {
      return false;
    }
    return true;
  }

  tryMerge(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    mergeCount: number = 1
  ) {
    if (!this.overlap(x0, y0, x1, y1)) {
      return false;
    }
    const newMerge = mergeCount + this.mergeCount;
    this.x0 = (this.x0 * this.mergeCount + x0 * mergeCount) / newMerge;
    this.y0 = (this.y0 * this.mergeCount + y0 * mergeCount) / newMerge;
    this.x1 = (this.x1 * this.mergeCount + x1 * mergeCount) / newMerge;
    this.y1 = (this.y1 * this.mergeCount + y1 * mergeCount) / newMerge;
    this.mergeCount = newMerge;
    return true;
  }

  state: FeatureState;
  flavor: string;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  mergeCount: number;
  sensorValue: number;
  sensorValueLowPass: number;
  sensorAge: number;
  sensorMissing: number;
  sensorX: number;
  sensorY: number;
}

//  uses the sobel operator, to return the intensity and direction of edge at
// index
export function sobelEdge(
  source: Float32Array,
  index: number,
  width: number
): [number, number] {
  const x = sobelX(source, index, width);
  const y = sobelY(source, index, width);

  return [Math.sqrt(x * x + y * y), Math.atan(y / x)];
}

export function sobelY(
  source: Float32Array,
  index: number,
  width: number
): number {
  return (
    -source[index - 1 - width] -
    2 * source[index - width] -
    source[index - width + 1] +
    source[index - 1 + width] +
    2 * source[index + width] +
    source[index + width + 1]
  );
}

export function sobelX(
  source: Float32Array,
  index: number,
  width: number
): number {
  return (
    -source[index - 1 - width] +
    source[index + 1 - width] -
    2 * source[index - 1] +
    2 * source[index + 1] -
    source[index - 1 + width] +
    source[index + 1 + width]
  );
}

export function featureLine(x: number, y: number): ROIFeature {
  let line = new ROIFeature();
  line.y0 = y;
  line.y1 = y;
  line.x0 = x;
  line.x1 = x;
  line.state = FeatureState.None;
  line.flavor = "line";
  return line;
}

export function euclDistance(
  x: number,
  y: number,
  x2: number,
  y2: number
): number {
  return Math.sqrt(Math.pow(x - x2, 2) + Math.pow(y - y2, 2));
}
