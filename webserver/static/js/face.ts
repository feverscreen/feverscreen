import {
  ROIFeature,
  FeatureState,
  sobelEdge,
  featureLine
} from "./processing.js";

const UseEdgeDirection =false;
const FaceTrackingMaxDelta = 10;
const ForeheadPercent = 0.3;
const ForeheadPadding = 2;
const ForeheadEdgeThresh = 200;
const MaxErrors = 2;
const MaxWidthDeviation = 2;
const MaxMidDeviation = 4;
const MaxWidthIncrease = 5;
const MaxDeviation = 3;
const MaxStartDeviation = 4;
let frameWidth = 160;
let frameHeight = 120;

const maxFrameSkip = 6; //~6 frames

let FaceID = 1;

class Window {
  values: number[];
  savedDeviation: number;
  savedAverage: number;

  constructor(public size: number) {
    this.values = [];
    this.savedDeviation = -1;
    this.savedAverage = -1;
  }

  reset() {
    this.savedDeviation = -1;
    this.savedAverage = -1;
  }
  add(value: number) {
    this.reset();
    if (this.values.length < this.size) {
      this.values.push(value);
    } else {
      this.values.shift();
      this.values.push(value);
    }
  }

  deviation(): number {
    if (this.savedAverage == -1) {
      const mean = this.average();
      this.savedDeviation = Math.sqrt(
        this.values.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) /
          this.values.length
      );
    }
    return this.savedDeviation;
  }
  average(): number {
    if (this.savedAverage == -1) {
      this.savedAverage =
        this.values.reduce((a, b) => a + b) / this.values.length;
    }
    return this.savedAverage;
  }
}
class Tracking {
  features: ROIFeature[];
  startX: number;
  width: number;
  facePosition: FeatureState;
  stable: boolean;
  widthWindow: Window;
  startWindow: Window;
  medianMid: ROIFeature | null;
  maxWidth: number;
  mismatch: number;
  widthDelta: Delta;
  widthDeviation: number;
  startDeviation: number;

  constructor() {
    this.facePosition = FeatureState.None;

    this.widthDelta = new Delta();
    this.maxWidth = 0;
    this.medianMid = null;
    this.features = [];
    this.startX = 0;
    this.mismatch = 0;
    this.width = 0;
    this.stable = false;
    this.widthWindow = new Window(3);
    this.startWindow = new Window(3);
    this.widthDeviation = 0;
    this.startDeviation = 0;
  }

  addFeature(feature: ROIFeature) {
    this.features.push(feature);
    this.widthWindow.add(feature.width());
    this.startWindow.add(feature.x0);
    this.widthDelta.add(feature.width());

    if (
      this.features.length > 3 &&
      this.widthWindow.deviation() < MaxDeviation &&
      this.startWindow.deviation() < MaxDeviation
    ) {
      this.stable = true;
      this.widthDeviation = this.widthWindow.deviation();
      this.startDeviation = this.startWindow.deviation();

      this.startX = feature.x0;
      this.width = feature.width();
      this.maxWidth = Math.max(feature.width(), this.maxWidth);
    }

    if (
      this.facePosition == FeatureState.Top &&
      this.widthDelta.decreasingState()
    ) {
      this.facePosition = FeatureState.Bottom;
    } else if (
      this.facePosition == FeatureState.None &&
      this.widthDelta.increasingState()
    ) {
      this.facePosition = FeatureState.Top;
    }
    if (
      // once face stops increasing lets set a mid point
      (this.medianMid == null && this.widthDelta.decreasingState()) ||
      (this.widthDelta.state() == Gradient.Neutral && this.count() > 8)
    ) {
      this.features.sort((a, b) => a.midX() - b.midX());
      this.medianMid = this.features[~~(0.5 * this.features.length)];
    }
  }

  // compares this feature to what we have learnt so far, and decides if it fits within a normal deviation of
  // mid point, maximum width, expected width, expected start x, doesn't increase in width after decreasing (i.e shoulders)
  matched(feature: ROIFeature): boolean {
    if (this.medianMid) {
      if (Math.abs(feature.midX() - this.medianMid.midX()) > MaxMidDeviation) {
        this.mismatch++;
        console.log("MidX deviated");

        return false;
      }
      if (feature.width() - this.maxWidth > MaxWidthDeviation) {
        this.mismatch++;
        console.log("Max Width deviated");

        return false;
      }
    }

    if (this.stable) {
      if (
        Math.abs(this.startX - feature.x0) >
        this.startDeviation + MaxStartDeviation
      ) {
        this.mismatch++;
        console.log("Start deviated");
        return false;
      }
      if (
        Math.abs(this.width - feature.width()) >
        this.widthDeviation + MaxWidthIncrease * 2
      ) {
        this.mismatch++;
        console.log("Width increased more than deviation allows");
        return false;
      }
    }
    if (
      this.facePosition == FeatureState.Bottom &&
      this.widthDelta.increasingState()
    ) {
      this.mismatch++;
      console.log("On bottom of face but now width increasing");
      return false;
    }
    return true;
  }

  count(): number {
    return this.features.length;
  }
}

export enum Gradient {
  Decreasing = -1,
  Neutral = 0,
  Increasing = 1
}

// meausre the change in values over the last 3 values
class Delta {
  deltas: Window;
  states: Window;
  previous: number;

  constructor() {
    this.deltas = new Window(3);
    this.states = new Window(3);
    this.previous = 0;
  }

  add(value: number) {
    this.deltas.add(value - this.previous);
    this.previous = value;
    if (this.increasing()) {
      this.states.add(Gradient.Increasing);
    } else if (this.decreasing()) {
      this.states.add(Gradient.Decreasing);
    } else {
      this.states.add(Gradient.Neutral);
    }
  }

  decreasingState(): boolean {
    return (
      (this.state() == Gradient.Decreasing &&
        this.previousState() <= Gradient.Neutral) ||
      (this.state() == Gradient.Neutral &&
        this.previousState() == Gradient.Decreasing)
    );
  }

  increasingState(): boolean {
    return (
      (this.state() == Gradient.Increasing &&
        this.previousState() >= Gradient.Neutral) ||
      (this.state() == Gradient.Neutral &&
        this.previousState() == Gradient.Increasing)
    );
  }
  previousState(): Gradient {
    if (this.states.values.length > 1) {
      return this.states.values[this.states.values.length - 2];
    }
    return 0;
  }

  state(): Gradient {
    return this.states.values[this.states.values.length - 1];
  }

  // allow for 1 of the last 2 values to not be increasing i.e. noise
  increasing(): boolean {
    if (this.deltas.values.length < 3) {
      return false;
    }
    return (
      this.deltas.values[2] > 0 &&
      (this.deltas.values[1] > 0 || this.deltas.values[0] > 0)
    );
  }

  // allow for 1 of the last 2 values to not be decreasing i.e. noise
  decreasing(): boolean {
    if (this.deltas.values.length < 3) {
      return false;
    }
    return (
      this.deltas.values[2] < 0 &&
      (this.deltas.values[1] < 0 || this.deltas.values[0] < 0)
    );
  }
}

export class Hotspot {
  sensorValue: number;
  sensorX: number;
  sensorY: number;
  sensorCorrection: number;
  constructor() {
    this.sensorCorrection = 0;
    this.sensorValue = 0;
    this.sensorX = 0;
    this.sensorY = 0;
  }
}
export class Face {
  numFrames: number;
  framesMissing: number;
  id: number;
  hotspot: Hotspot;
  roi: ROIFeature | null;
  forehead: ROIFeature | null;
  haarAge: number;
  haarLastSeen: number;
  xFeatures: ROIFeature[];
  yFeatures: ROIFeature[];
  constructor(public haarFace: ROIFeature, public frameTime: number) {
    this.roi = null;
    this.forehead = null;
    this.id = 0;
    this.framesMissing = 0;
    this.haarAge = 1;
    this.haarLastSeen = 0;
    this.hotspot = new Hotspot();
    this.numFrames = 0;

    //debugging
    this.xFeatures = [];
    this.yFeatures = [];
    this.assignID();
  }

  updateHaar(haar: ROIFeature) {
    this.haarFace = haar;
    this.haarAge++;
    this.haarLastSeen = this.numFrames + 1;
  }

  haarActive(): boolean {
    return this.haarLastSeen == this.numFrames;
  }

  tracked(): boolean {
    return this.roi != null && this.forehead != null;
  }

  assignID() {
    this.id = FaceID;
    FaceID++;
  }

  height(): number {
    if (this.roi) {
      return this.roi.height();
    }
    return 0;
  }

  width(): number {
    if (this.roi) {
      return this.roi.width();
    }
    return 0;
  }

  active(): boolean {
    return this.framesMissing < maxFrameSkip;
  }

  update(other: Face) {
    this.roi = other.roi;
    this.forehead = other.roi;
    this.framesMissing = 0;
  }

  framesSince(currentTime: number): number {
    return currentTime - this.frameTime;
  }

  setHotspot(source: Float32Array, sensorCorrection: number) {
    let r;
    if (this.tracked()) {
      r = this.forehead as ROIFeature;
    } else {
      r = this.haarFace;
    }
    this.hotspot.sensorValue = 0;
    for (let y = ~~r.y0; y < ~~r.y1; y++) {
      for (let x = ~~r.x0; x < ~~r.x1; x++) {
        let index = y * frameWidth + x;
        let current = source[index];
        if (this.hotspot.sensorValue < current) {
          this.hotspot.sensorValue = current;
          this.hotspot.sensorX = x;
          this.hotspot.sensorY = y;
        }
      }
    }
    this.hotspot.sensorCorrection = sensorCorrection;
  }

  trackFace(
    source: Float32Array,
    frameWidth: number,
    frameHeight: number
  ): boolean {
    this.xFeatures = []
    this.yFeatures = []
    this.numFrames += 1;
    if (!this.tracked()) {
      if (this.haarActive()) {
        return this.detectForehead(
          this.haarFace,
          source,
          frameWidth,
          frameHeight
        );
      }
      this.framesMissing++;
      return false;
    }
    const expanedRegion = (this.roi as ROIFeature).extend(
      FaceTrackingMaxDelta,
      frameWidth,
      frameHeight
    );
    return this.detectForehead(expanedRegion, source, frameWidth, frameHeight);
  }

  // scan the haar detected rectangle along y axis, to find range of x values,
  // then along the x axis to find the range of y values
  // choose the biggest x and y value to define xRad and yRad of the head
  detectForehead(
    roi: ROIFeature,
    source: Float32Array,
    frameWidth: number,
    frameHeight: number
  ): boolean {
    frameWidth = frameWidth;
    frameHeight = frameHeight;

    let [faceX, endY, xFeatures] = xScan(source, roi, roi);
    if (!faceX) {
      faceX = roi;
    }
    let [faceY, yFeatures] = yScan(source, faceX, roi, endY);
    this.yFeatures = yFeatures;
    this.xFeatures = xFeatures;
    if (!faceY) {
      this.forehead = null;
      this.roi = null;
      this.framesMissing++;
      return false;
    }
    faceY.x0 = faceX.x0;
    faceY.x1 = faceX.x1;

    let forehead = new ROIFeature();
    forehead.y0 = faceY.y0 - ForeheadPadding;
    forehead.y1 = faceY.y0 + faceY.height() * ForeheadPercent + ForeheadPadding;
    forehead.x0 = faceX.x0 - ForeheadPadding;
    forehead.x1 = faceX.x1 + ForeheadPadding;
    this.forehead = forehead;
    this.roi = faceY;
    this.framesMissing = 0;

    return true;
  }
}

// top percent to be considered forehead

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
    if (UseEdgeDirection && direction > -Math.PI / 4 + 0.5 && direction < Math.PI / 4 - 0.5) {
      return false;
    }

    //get strongest gradient of topmost edge
    if (faceY.y0 == -1) {
      faceY.y0 = y;
      faceY.sensorY = intensity;
    }
  } else {
    faceY.y1 = y;
    faceY.sensorY = intensity;

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
): [ROIFeature | undefined, ROIFeature[]] {
  let endY;

  let yFeatures = [];
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
      if (endFaceY && faceY.state == FeatureState.Inside) {
        // bottom of a face doesn't have good edges, so if we have a hint from the xscan lets take it
        faceY.y1 = endFaceY;
        break;
      }
    }
    if(faceY.hasYValues()){
      yFeatures.push(faceY);
    }
    if (faceY.hasYValues() && faceY.higher(longestLine)) {
      longestLine = faceY;
    }
  }
  return [longestLine, yFeatures];
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
    // edges will be in a horizontal direction +/- 45degrees
    if (UseEdgeDirection && direction < -0.5 || direction > Math.PI / 2 + 0.5) {
      return false;
    }

    // get strong gradient of left most edge
    if (faceX.state == FeatureState.None) {
      faceX.x0 = x;
      faceX.sensorX = intensity;
    }
  } else {
    if (UseEdgeDirection && direction > 0.5 && direction < Math.PI / 2 - 0.5) {
      return false;
    }

    faceX.x1 = x;
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
): [ROIFeature | undefined, number | null, ROIFeature[]] {
  let longestLine;
  let maxY = null;
  let xFeatures = [];
  let xTracking = new Tracking();
  for (let y = ~~faceY.y0 + 1; y < ~~faceY.y1 - 1; y++) {
    if (xTracking.mismatch >= MaxErrors) {
      maxY = y - MaxErrors;
      break;
    }
    let faceX = featureLine(-1, y);
    for (let x = ~~roi.x0 + 1; x < ~~roi.x1 - 1; x++) {
      let index = y * frameWidth + x;
      let [intensity, diretion] = sobelEdge(source, index, frameWidth);
      let edgeDetected = detectXEdge(faceX, x, intensity, diretion);
      nextXState(faceX, edgeDetected);
    }

    if (faceX.hasXValues()) {
      xFeatures.push(faceX);
      let matched = xTracking.matched(faceX);
      if (!matched) {
        continue;
      }
      xTracking.addFeature(faceX);

      if (faceX.wider(longestLine)) {
        longestLine = faceX;
      }
    }
  }

  if (xTracking.mismatch >= MaxErrors && !maxY) {
    maxY = ~~faceY.y1 - MaxErrors;
  }
  return [longestLine, maxY, xFeatures];
}
