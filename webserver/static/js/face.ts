import {
  ROIFeature,
  FeatureState,
  sobelEdge,
  featureLine
} from "./processing.js";
const FaceTrackingMaxDelta = 10;
const ForeheadPercent = 0.3;
const ForeheadPadding = 2;
const ForeheadEdgeThresh = 200;
const MaxErrors = 2;
const MaxWidthDeviation = 4;
const MaxMidDeviation = 2;
const MaxWidthIncrease = 5;
const MaxDeviation = 3;
const MaxStartDeviation = 2;
let frameWidth = 160;
let frameHeight = 120;

const sizeDelta = 5;
const centerMaxDelta = 5;
const maxFrameSkipNS = 6; //~6 frames
const maxFrameSkip = 6; //~6 frames

let FaceID = 1;

class Window {
  values: number[];
  constructor(public size: number) {
    this.values = [];
  }

  add(value: number) {
    if (this.values.length < this.size) {
      this.values.push(value);
    } else {
      this.values.shift();
      this.values.push(value);
    }
  }

  deviation(): number {
    const mean = this.average();
    return Math.sqrt(
      this.values.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) /
        this.values.length
    );
  }
  average(): number {
    return this.values.reduce((a, b) => a + b) / this.values.length;
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
  mismatch:number;
  widthDelta:Delta;
  widthDeviation:number;
  startDeviation:number;


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
    this.widthDeviation =0
    this.startDeviation =0

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
      this.widthDeviation = this.widthWindow.deviation()
      this.startDeviation = this.startWindow.deviation()
      this.stable = true;
      this.startX = feature.x0;
      this.width = feature.width();
      this.maxWidth = Math.max(feature.width(), this.maxWidth);
    }


    if (this.facePosition  == FeatureState.None && this.widthDelta.increasingState()) {
      this.facePosition = FeatureState.Top;
    } else if (
      // once face stops increasing lets set a tart width and mid point
      (this.medianMid == null && this.widthDelta.decreasingState()) ||
      (this.widthDelta.state() == Gradient.Neutral && this.count() > 8)
    ) {
      this.medianMidX();
    }

    if (this.facePosition == FeatureState.Top && this.widthDelta.decreasingState()) {
      this.facePosition = FeatureState.Bottom;
    }
  }

  matched(feature: ROIFeature): boolean{

    if (this.medianMid) {
      if (Math.abs(feature.midX() - this.medianMid.midX()) > MaxMidDeviation) {
        this.mismatch++;
        console.log("MidX deviated")

        return false;
      }
      if (feature.width() - this.maxWidth > MaxWidthDeviation) {
        this.mismatch++;
        console.log("Max Width deviated")

        return false;
      }
    }
    if(this.stable){
      if(Math.abs(this.startX - feature.x0) > this.startDeviation + MaxStartDeviation){
        this.mismatch++;
        console.log("Start deviated")
        return false;
      }
      if(Math.abs(this.width - feature.width()) > this.widthDeviation + MaxWidthDeviation*2){
        this.mismatch++;
        console.log("Width increased more than deviation allows")

        return false;
      }
    }
    if (this.facePosition == FeatureState.Bottom && this.widthDelta.increasingState()) {
      this.mismatch++;
      console.log("On bottom of face but now width increasing")
      return false;
    }
    return true;
  }

  medianMidX(): number {
    this.features.sort((a, b) => a.midX() - b.midX());
    this.medianMid = this.features[~~(0.5 * this.features.length)];
    return this.medianMid.midX();
  }

  count(): number {
    return this.features.length;
  }
}

export enum Gradient {
  Decreasing,
  Neutral,
  Increasing
}
// meausre the change in values over the last 3 values
class Delta {
  deltas: number[];
  states: Gradient[];
  previous: number;

  constructor() {
    this.deltas = [0, 0, 0];
    this.states = [Gradient.Neutral, Gradient.Neutral, Gradient.Neutral];
    this.previous = 0;
  }
  smaller(value: number): boolean {
    return (
      this.deltas[2] < value &&
      (this.deltas[1] < value || this.deltas[0] < value)
    );
  }

  add(value: number) {
    this.deltas[0] = this.deltas[1];
    this.deltas[1] = this.deltas[2];
    this.deltas[2] = value - this.previous;

    this.states[0] = this.states[1];
    this.states[1] = this.states[2];
    this.previous = value;
    if (this.increasing()) {
      this.states[2] = Gradient.Increasing;
    } else if (this.decreasing()) {
      this.states[2] = Gradient.Decreasing;
    } else {
      this.states[2] = Gradient.Neutral;
    }
  }

  decreasingState(): boolean {
    return (
      (this.states[2] == Gradient.Decreasing &&
        this.states[1] <= Gradient.Neutral) ||
      (this.states[2] == Gradient.Neutral &&
        this.states[1] == Gradient.Decreasing)
    );
  }

  increasingState(): boolean {
    return (
      (this.state() == Gradient.Increasing &&
        this.states[1] >= Gradient.Neutral) ||
      (this.state() == Gradient.Neutral &&
        this.states[1] == Gradient.Increasing)
    );
  }
  state(): Gradient {
    return this.states[2];
  }
  // allow for 1 of the last 2 values to not be increasing i.e. noise
  increasing(): boolean {
    return this.deltas[2] > 0 && (this.deltas[1] > 0 || this.deltas[0] > 0);
  }

  // allow for 1 of the last 2 values to not be decreasing i.e. noise
  decreasing(): boolean {
    return this.deltas[2] < 0 && (this.deltas[1] < 0 || this.deltas[0] < 0);
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
  // haarFace: ROIFeature | null;
  numFrames: number;
  framesMissing: number;
  id: number;
  haarAge: number;
  haarLastSeen: number;
  hotspot: Hotspot;

  roi: ROIFeature | null;
  forehead: ROIFeature | null;
  constructor(public haarFace: ROIFeature, public frameTime: number) {
    this.roi = null;
    this.forehead = null;
    this.id = 0;
    this.framesMissing = 0;
    this.haarAge = 1;
    this.haarLastSeen = 0;

    this.hotspot = new Hotspot();
    this.numFrames = 0;
    this.assignID();
  }
  updateHaar(haar: ROIFeature) {
    this.haarFace = haar;
    this.haarAge++;
    this.haarLastSeen = this.numFrames+1
  }
  haarActive(): boolean {
    return this.haarAge == this.numFrames;
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
    return this.framesMissing <= maxFrameSkip;
  }

  stillCurrent(currentTime: number): boolean {
    return this.framesSince(currentTime) <= maxFrameSkipNS;
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

    let [faceX, endY] = xScan(source, roi, roi);
    if (!faceX) {
      faceX = roi;
    }
    let faceY = yScan(source, faceX, roi, endY);
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
    if (direction > -Math.PI / 4 + 0.5 && direction < Math.PI / 4 - 0.5) {
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
      if (endFaceY && faceY.state == FeatureState.Inside) {
        faceY.y1 = endFaceY;
        break;
      }
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
    // edges will be in a horizontal direction +/- 45degrees
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
  let maxY = null;
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

      let matched = xTracking.matched(faceX);
      if(!matched){
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
  return [longestLine, maxY];
}
