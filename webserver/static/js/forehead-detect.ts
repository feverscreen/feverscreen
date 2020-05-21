import { ROIFeature, FeatureState } from "./processing.js";
import { Face } from "./tracking.js";

// top percent to be considered forehead
const ForeheadPercent = 0.3;
const ForeheadPadding = 2;
const ForeheadEdgeThresh = 200;

let frameWidth = 160;
let frameHeight = 120;

// meausre the change in values over the last 3 values
class Delta {
  deltas: number[];
  previous: number;
  state: number;
  prevState: number;

  constructor() {
    this.deltas = [0, 0, 0];
    this.previous = 0;
    this.state = 0;
    this.prevState = 0;
  }

  add(value: number) {
    this.prevState = this.state;
    this.deltas[0] = this.deltas[1];
    this.deltas[1] = this.deltas[2];
    this.deltas[2] = value - this.previous;
    this.previous = value;
    if (this.increasing()) {
      this.state = 1;
    } else if (this.decreasing()) {
      this.state = -1;
    }
  }

  // allow for 1 of the last 2 values to not be increasing i.e. noise
  increasing(): boolean {
    return this.deltas[2] > 0 && (this.deltas[1] > 0 || this.deltas[0] >= 0);
  }

  // allow for 1 of the last 2 values to not be decreasing i.e. noise
  decreasing(): boolean {
    return this.deltas[2] < 0 && (this.deltas[1] < 0 || this.deltas[0] < 0);
  }
}

//  uses the sobel operator, to return the intensity and direction of edge at
// index
function sobelEdge(
  source: Float32Array,
  index: number,
  width: number
): [number, number] {
  const x = sobelX(source, index, width);
  const y = sobelY(source, index, width);

  return [Math.sqrt(x * x + y * y), Math.atan(y / x)];
}

function sobelY(source: Float32Array, index: number, width: number): number {
  return (
    -source[index - 1 - width] -
    2 * source[index - width] -
    source[index - width + 1] +
    source[index - 1 + width] +
    2 * source[index + width] +
    source[index + width + 1]
  );
}

function sobelX(source: Float32Array, index: number, width: number): number {
  return (
    -source[index - 1 - width] +
    source[index + 1 - width] -
    2 * source[index - 1] +
    2 * source[index + 1] -
    source[index - 1 + width] +
    source[index + 1 + width]
  );
}

function featureLine(x: number, y: number): ROIFeature {
  let line = new ROIFeature();
  line.y0 = y;
  line.y1 = y;
  line.x0 = x;
  line.x1 = x;
  line.state = FeatureState.None;
  return line;
}

// for the line defined by faceY
// check if the edge  values (intensity, direction) justify an edge
function detectYEdge(
  faceY: ROIFeature,
  y: number,
  intensity: number,
  direction: number
) {
  if (intensity - ForeheadEdgeThresh < 0) {
    return false;
  }

  if (faceY.state == FeatureState.None || faceY.state == FeatureState.TopEdge) {
    if (direction > -Math.PI / 4 - 0.5 && direction < Math.PI / 4 - 0.5) {
      return false;
    }

    //get strongest gradient of topmost edge
    if (faceY.y0 == -1) {
      faceY.y0 = y;
      faceY.sensorY = intensity;
    } else if (faceY.onEdge() && intensity > faceY.sensorY) {
      faceY.sensorY = intensity;
      faceY.y0 = y;
    }
  } else {
    if (direction < -Math.PI / 4 - 0.5 || direction > Math.PI / 4 + 0.5) {
      return false;
    }

    //get strongest gradient of bottommost edge
    if (faceY.onEdge()) {
      if (intensity > faceY.sensorY) {
        faceY.sensorY = intensity;
        faceY.y1 = y;
      }
    } else {
      faceY.y1 = y;
      faceY.sensorY = intensity;
    }
  }
  return true;
}

function nextYState(r: ROIFeature, edge: boolean) {
  if (r.state == FeatureState.None && edge) {
    r.state = FeatureState.TopEdge;
  } else if (r.state == FeatureState.TopEdge && !edge) {
    r.state = FeatureState.Inside;
  } else if (r.state == FeatureState.Inside && edge) {
    r.state = FeatureState.BottomEdge;
  } else if (r.state == FeatureState.BottomEdge && !edge) {
    r.state = FeatureState.Outside;
  } else if (r.state == FeatureState.Outside && edge) {
    r.state = FeatureState.BottomEdge;
  }
}

// scan left to right of the range of faceX
// at each x detect edges of the face with a vertical line
// returns the longest y line
function yScan(
  source: Float32Array,
  faceX: ROIFeature,
  roi: ROIFeature,
  endFaceY: number | null
): ROIFeature | undefined {
  let endY;

  if (endFaceY) {
    endY = Math.min(frameHeight - 1, endFaceY);
  } else {
    endY = Math.min(frameHeight - 1, ~~roi.y1 - 1);
  }
  let longestLine;

  for (let x = ~~faceX.x0 + 1; x < ~~faceX.x1 - 1; x++) {
    let faceY = featureLine(x, -1);
    for (let y = ~~roi.y0 + 1; y < endY; y++) {
      let index = y * frameWidth + x;
      let [intensity, direction] = sobelEdge(source, index, frameWidth);

      let edge = detectYEdge(faceY, y, intensity, direction);
      nextYState(faceY, edge);
    }

    if (faceY.hasYValues() && faceY.higher(longestLine)) {
      longestLine = faceY;
    }
  }
  return longestLine;
}

function nextXState(r: ROIFeature, edge: boolean) {
  if (r.state == FeatureState.None && edge) {
    r.state = FeatureState.LeftEdge;
  } else if (r.state == FeatureState.LeftEdge && !edge) {
    r.state = FeatureState.Inside;
  } else if (r.state == FeatureState.Inside && edge) {
    r.state = FeatureState.RightEdge;
  } else if (r.state == FeatureState.RightEdge && !edge) {
    r.state = FeatureState.Outside;
  } else if (r.state == FeatureState.Outside && edge) {
    r.state = FeatureState.RightEdge;
  }
}

// for the line defined by faceY
// check if the edge  values (intensity, direction) justify an edge
function detectXEdge(
  faceX: ROIFeature,
  x: number,
  intensity: number,
  direction: number
): boolean {
  if (intensity - ForeheadEdgeThresh < 0) {
    return false;
  }
  if (
    faceX.state == FeatureState.None ||
    faceX.state == FeatureState.LeftEdge
  ) {
    if (direction < -0.5 || direction > Math.PI / 2 + 0.5) {
      return false;
    }

    // get strong gradient of left most edge
    if (faceX.state == FeatureState.None) {
      faceX.x0 = x;
      faceX.sensorX = intensity;
    } else if (faceX.onEdge() && intensity > faceX.sensorX) {
      faceX.sensorX = intensity;
      faceX.x0 = x;
    }
  } else {
    if (direction > 0.5 && direction < Math.PI / 2 - 0.5) {
      return false;
    }

    // get strongest gradient of right most edge
    if (faceX.onEdge()) {
      if (intensity > faceX.sensorX) {
        faceX.sensorX = intensity;
        faceX.x1 = x;
      }
    } else {
      faceX.x1 = x;
      faceX.sensorX = intensity;
    }
  }
  return true;
}

// scan top to bottom of the range of faceY
// at each y detect edges of the face with a horizontal line
// attempts to find the end of the face by the width decreasing then increasing
// returns the longest horizontal line, and suspected end of the face y
function xScan(
  source: Float32Array,
  faceY: ROIFeature,
  roi: ROIFeature
): [ROIFeature | undefined, number | null] {
  let longestLine;
  let deltaIncreased = false;
  let widthDelta = new Delta();
  for (let y = ~~faceY.y0 + 1; y < ~~faceY.y1 - 1; y++) {
    let faceX = featureLine(-1, y);
    for (let x = ~~roi.x0 + 1; x < ~~roi.x1 - 1; x++) {
      let index = y * frameWidth + x;
      let [intensity, diretion] = sobelEdge(source, index, frameWidth);
      let edgeDetected = detectXEdge(faceX, x, intensity, diretion);
      nextXState(faceX, edgeDetected);
    }

    if (faceX.hasXValues()) {
      widthDelta.add(faceX.width());

      if (
        deltaIncreased &&
        widthDelta.state == 1 &&
        widthDelta.prevState == -1
      ) {
        return [longestLine as ROIFeature, y];
      } else if (widthDelta.state == 1) {
        // gotta get bigger first
        deltaIncreased = true;
      }

      if (faceX.wider(longestLine)) {
        longestLine = faceX;
      }
    }
  }
  return [longestLine, null];
}

// scan the haar detected rectangle along y axis, to find range of x values,
// then along the x axis to find the range of y values
// choose the biggest x and y value to define xRad and yRad of the head
export function detectForehead(
  roi: ROIFeature,
  source: Float32Array,
  frameWidth: number,
  frameHeight: number
): Face  | null {
  frameWidth = frameWidth;
  frameHeight = frameHeight;

  let [faceX, endY] = xScan(source, roi, roi);
  if (!faceX) {
    faceX = roi;
  }
  let faceY = yScan(source, faceX, roi, endY);
  if (!faceY) {
    return  null;
  }
  faceY.x0 = faceX.x0
  faceY.x1 = faceX.x1

  let forehead = new ROIFeature();
  forehead.y0 = faceY.y0 - ForeheadPadding;
  forehead.y1 = faceY.y0 + faceY.height() * ForeheadPercent + ForeheadPadding;
  forehead.x0 = faceX.x0 - ForeheadPadding;
  forehead.x1 = faceX.x1 + ForeheadPadding;
  const face = new Face(faceY,forehead,0)

  return face;
}
