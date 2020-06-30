import { threshold, crop, getContourData } from "./opencvfilters.js";
import { ROIFeature, FeatureState, featureLine } from "./processing.js";

const MaxFaceAreaPercent = 0.9;

//the oval has to cover MinFaceOvalCoverage percent of detected edges to be considered a face
const MinFaceOvalCoverage = 80;
//once an oval differs by CoverageErrorDiff percent from the best coverage
//it is considered a mismatch
const CoverageErrorDiff = 3;

const FaceTrackingMaxDelta = 10;
const ForeheadPercent = 0.2;
const ForeheadPadding = 2;
const MaxErrors = 2;
const MaxWidthDeviationPercent = 1.2;

// when tracking faces, once we have a std dev less than 3, we are tracking
const MaxDeviation = 3;

// when tracking edges top to bottom, new edges x0 shouldn't differ by more than this
const MaxStartDeviation = 4;

// New Faces mid point cant be greater than this from previous
const MaxMidDeviation = 10;
let frameWidth = 160;
const maxFrameSkip = 6;

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

  length(): number {
    return this.values.length;
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
  maxY: number;
  minY: number;
  oval: ROIFeature;
  tempStats: TempStats;
  area: number;
  ovalMatch: number;
  ovalCalcStart: number;
  constructor() {
    this.area = 0;
    this.facePosition = FeatureState.None;
    this.maxY = -1;
    this.minY = -1;
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
    this.oval = new ROIFeature();
    this.oval.y0 = -1;
    this.ovalCalcStart = -1;
    this.ovalMatch = 0;
    this.tempStats = new TempStats();
  }

  yLine(): ROIFeature {
    let yFace = featureLine(-1, this.minY);
    yFace.y1 = this.maxY;
    return yFace;
  }

  addFeature(feature: ROIFeature, source: Float32Array) {
    if (this.minY == -1) {
      this.minY = feature.y0;
      this.oval.y0 = feature.y0;
    }

    this.maxY = feature.y1;
    this.features.push(feature);
    this.widthWindow.add(feature.width());
    this.startWindow.add(feature.x0);
    this.widthDelta.add(feature.width());

    if (
      this.features.length > 3 &&
      this.widthWindow.deviation() < MaxDeviation &&
      this.startWindow.deviation() < MaxDeviation
    ) {
      if (this.ovalCalcStart == -1) {
        this.ovalCalcStart = feature.y0;
      }

      this.stable = true;
      this.widthDeviation = this.widthWindow.deviation();
      this.startDeviation = this.startWindow.deviation();

      this.startX = feature.x0;
      this.width = feature.width();
      this.maxWidth = Math.max(feature.width(), this.maxWidth);
    }
    if (this.stable) {
      this.area += feature.width();
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
      if (!this.medianMid || feature.width() > this.medianMid.width()) {
        this.medianMid = feature;
        this.oval.x0 = this.medianMid.x0;
        this.oval.x1 = this.medianMid.x1;
      }
    }

    let y = ~~feature.y0 * frameWidth;
    for (let x = ~~feature.x0; x < feature.x1; x++) {
      this.tempStats.add(source[y + x], x, feature.y0);
    }
  }

  // grow an oval inside the face until it doesn't fit
  matchOval(y: number): boolean {
    if (this.ovalCalcStart == -1) {
      return true;
    }
    this.oval.y1 = y;
    let h = this.oval.midX();
    let k = this.oval.midY();
    let a = Math.pow(this.oval.width() / 2.0, 2);
    let b = Math.pow(this.oval.height() / 2.0, 2);
    let percentCover = 0;
    for (
      let i = this.ovalCalcStart - this.minY;
      i < this.features.length;
      i++
    ) {
      let r = this.features[i];
      //x location of oval edge at at r.y0
      let xDiff = Math.sqrt(a * (1 - Math.pow(r.y0 - k, 2) / b));
      let x0 = h - xDiff;
      let x1 = h + xDiff;
      let areaCovered = Math.min(x1, r.x1) - Math.max(x0, r.x0);
      if (areaCovered > 0) {
        percentCover += areaCovered;
      }
    }

    let cover = ~~((100 * percentCover) / this.area);
    this.ovalMatch = Math.max(cover, this.ovalMatch);

    if (this.ovalMatch - cover > CoverageErrorDiff) {
      // once we decrease we have found our optimum
      return false;
    }
    return true;
  }

  // compares this feature to what we have learnt so far, and decides if it fits within a normal deviation of
  // mid point, maximum width, expected width, expected start x, doesn't increase in width after decreasing (i.e shoulders)
  matched(feature: ROIFeature): boolean {
    if (this.medianMid) {
      if (!this.matchOval(feature.y1) && this.ovalMatch > 50) {
        this.mismatch++;
        console.log("oval coverage worsened best cover - ", this.ovalMatch);
        return false;
      }
    }
    return true;
  }

  lastFeature(): ROIFeature {
    return this.features[this.features.length - 1];
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
export class TempStats {
  hotspot: Hotspot;
  foreheadHotspot: Hotspot | null;
  backgroundAvg: number;
  minTemp: number;
  maxTemp: number;
  avgTemp: number;
  count: number;
  constructor() {
    this.backgroundAvg = 0;
    this.foreheadHotspot = null;
    this.hotspot = new Hotspot();
    this.minTemp = 0;
    this.maxTemp = 0;
    this.avgTemp = 0;
    this.count = 0;
  }
  add(value: number, x: number, y: number) {
    if (this.count == 0) {
      this.minTemp = value;
      this.maxTemp = value;
      this.hotspot.sensorValue = value;
      this.hotspot.sensorX = x;
      this.hotspot.sensorY = y;
    } else {
      this.minTemp = Math.min(value, this.minTemp);
      this.maxTemp = Math.max(value, this.maxTemp);
      if (value > this.hotspot.sensorValue) {
        this.hotspot.sensorValue = value;
        this.hotspot.sensorX = x;
        this.hotspot.sensorY = y;
      }
    }

    this.avgTemp += value;
    this.count += 1;
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
  // hotspot: Hotspot;
  roi: ROIFeature | null;
  forehead: ROIFeature | null;
  haarAge: number;
  haarLastSeen: number;
  xFeatures: any[];
  yFeatures: ROIFeature[];
  widthWindow: Window;
  heightWindow: Window;
  faceWidth: number;
  faceHeight: number;
  oval: ROIFeature;
  heatStats: TempStats;
  constructor(public haarFace: ROIFeature, public frameTime: number) {
    this.roi = null;
    this.forehead = null;
    this.id = 0;
    this.framesMissing = 0;
    this.haarAge = 1;
    this.haarLastSeen = 0;
    this.heatStats = new TempStats();
    this.numFrames = 0;
    this.widthWindow = new Window(3);
    this.heightWindow = new Window(3);
    this.faceWidth = 0;
    this.faceHeight = 0;
    //debugging
    this.xFeatures = [];
    this.yFeatures = [];
    this.oval = new ROIFeature();
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

  update(forehead: ROIFeature | null, roi: ROIFeature | null) {
    this.forehead = forehead;
    this.roi = roi;
    if (this.tracked()) {
      roi = roi as ROIFeature;
      this.framesMissing = 0;

      // give a rolling average of face width
      this.widthWindow.add(roi.width());
      this.heightWindow.add(roi.height());
      if (
        this.widthWindow.length() >= 3 &&
        this.widthWindow.deviation() < MaxDeviation &&
        this.heightWindow.deviation() < MaxDeviation
      ) {
        this.faceWidth = this.widthWindow.average();
        this.faceHeight = this.heightWindow.average();
      }
    } else {
      this.heatStats.foreheadHotspot = null;
      this.framesMissing++;
    }
  }

  // from the array of countours found, find the most likely face
  findFace(shapes: any[], source: Float32Array): any {
    let bestScore = -1;
    let bestOval = null;
    let heatStats = null;
    for (const shape of shapes) {
      const keys = getSortedKeys(shape);
      let xTracking = new Tracking();
      let longestLine;

      for (const key of keys) {
        if (xTracking.mismatch >= MaxErrors) {
          break;
        }
        let faceX = shape[key];
        let matched = xTracking.matched(faceX);
        if (!matched) {
          continue;
        }
        xTracking.addFeature(faceX, source);
        if (faceX.wider(longestLine)) {
          longestLine = faceX;
        }
      }

      if (
        xTracking.ovalMatch > bestScore &&
        xTracking.ovalMatch > MinFaceOvalCoverage &&
        xTracking.features.length >= 4
      ) {
        let oval = xTracking.oval;
        if (!this.matchesPrevious(oval)) {
          console.log("New oval differs too much in width/height/midpoint");
        } else {
          bestOval = oval;
          bestScore = xTracking.ovalMatch;
          heatStats = xTracking.tempStats;
        }
      }
    }
    return [bestOval, heatStats];
  }

  matchesPrevious(oval: ROIFeature): boolean {
    if (!this.roi) {
      return true;
    }
    if (this.roi.midDiff(oval) > MaxMidDeviation) {
      return false;
    }
    if (
      this.faceWidth != 0 &&
      this.faceHeight != 0 &&
      (oval.width() > this.faceWidth * MaxWidthDeviationPercent ||
        oval.height() > this.faceHeight * MaxWidthDeviationPercent)
    ) {
      return false;
    }
    return true;
  }

  trackFace(
    source: Float32Array,
    thermalRef: ROIFeature | null,
    frameWidth: number,
    frameHeight: number
  ): boolean {
    this.xFeatures = [];
    this.yFeatures = [];
    this.numFrames += 1;
    if (!this.tracked()) {
      if (this.haarActive()) {
        return this.detectForehead(
          this.haarFace,
          source,
          thermalRef,
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
    return this.detectForehead(
      expanedRegion,
      source,
      thermalRef,
      frameWidth,
      frameHeight
    );
  }

  setForeheadHotspot(source: Float32Array, frameWidth: number) {
    let r = this.forehead;
    if (!r) {
      this.heatStats.foreheadHotspot = null;
      return;
    }
    let hotspot = new Hotspot();
    hotspot.sensorValue = 0;
    for (let y = ~~r.y0; y < ~~r.y1; y++) {
      for (let x = ~~r.x0; x < ~~r.x1; x++) {
        let index = y * frameWidth + x;
        let current = source[index];
        if (hotspot.sensorValue < current) {
          hotspot.sensorValue = current;
          hotspot.sensorX = x;
          hotspot.sensorY = y;
        }
      }
    }
    this.heatStats.foreheadHotspot = hotspot;
  }

  // scan the haar detected rectangle along y axis, to find range of x values,
  // then along the x axis to find the range of y values
  // choose the biggest x and y value to define xRad and yRad of the head
  detectForehead(
    roi: ROIFeature,
    source: Float32Array,
    thermalRef: ROIFeature | null,
    frameWidth: number,
    frameHeight: number
  ): boolean {
    frameWidth = frameWidth;
    frameHeight = frameHeight;
    roi.wholeValues();
    let roiCrop = crop(source, frameHeight, frameWidth, roi);
    let minTemp = 0;

    // something weird with this, it should be fine to just use backgroundAvg
    // if (
    //   this.heatStats &&
    //   this.heatStats.minTemp - this.heatStats.backgroundAvg > 400
    // ) {
    //   minTemp = this.heatStats.backgroundAvg - 100;
    // }
    roiCrop = threshold(roiCrop, minTemp, roi, thermalRef);
    const contours = getContourData(roiCrop);
    const shapes = shapeData(contours, roi.x0, roi.y0);
    contours.delete();

    const valid = validShapes(shapes, roi);
    if (!valid) {
      this.update(null, null);
      return false;
    }
    const [oval, heatStats] = this.findFace(shapes, source);

    this.xFeatures = [];
    for (const shape of shapes) {
      for (const feature of Object.values(shape)) {
        let f = (feature as ROIFeature).extend(0, frameWidth, frameHeight);
        this.xFeatures.push(f);
      }
    }
    if (oval) {
      heatStats.backgroundAvg = backgroundTemp(
        source,
        roiCrop,
        roi.x0,
        roi.y0,
        frameWidth,
        heatStats.minTemp
      );
    }
    roiCrop.delete();
    if (!oval) {
      this.update(null, null);
      return false;
    }

    let detectedROI = oval.extend(oval.width() * 0.1, frameWidth, frameHeight);
    let forehead = new ROIFeature();
    forehead.y0 = detectedROI.y0 - ForeheadPadding;
    forehead.y1 =
      forehead.y0 + detectedROI.height() * ForeheadPercent + ForeheadPadding;
    forehead.x0 = detectedROI.x0 - ForeheadPadding;
    forehead.x1 = detectedROI.x1 + ForeheadPadding;
    this.update(forehead, detectedROI);
    this.heatStats = heatStats;
    if (this.heatStats.count > 0) {
      this.heatStats.avgTemp /= this.heatStats.count;
    }
    this.setForeheadHotspot(source, frameWidth);
    console.log("Face", detectedROI, heatStats);
    return true;
  }
}

//checks that the shapes dont take more than MaxFaceAreaPercent of the area
function validShapes(shapes: any, roi: ROIFeature): boolean {
  let roiArea = roi.width() * roi.height();
  for (const shape of shapes) {
    let area = 0;
    for (const feature of Object.values(shape)) {
      area += (feature as ROIFeature).width();
    }
    if (area / roiArea > MaxFaceAreaPercent) {
      console.log("face edges exceed maximum area percent", area / roiArea);
      return false;
    }
  }
  return true;
}
function backgroundTemp(
  source: Float32Array,
  roi: any,
  offsetX: number,
  offsetY: number,
  sourceWidth: number,
  max: number
): number {
  let backSum = 0;
  let count = 0;
  let minTemp = -1;
  for (let y = 0; y < roi.rows; y++) {
    for (let x = 0; x < roi.cols; x++) {
      if (roi.data[y * roi.rows + x] == 0) {
        let index = y + offsetY * sourceWidth + x + offsetX;
        let val = source[index];
        if (val < max) {
          backSum += val;
          count += 1;
          if (minTemp == -1 || val < minTemp) {
            minTemp = val;
          }
        }
      }
    }
  }
  if (count == 0) {
    return 0;
  }

  let avg = backSum / count;
  return (avg + minTemp) / 2.0;
}

//for each independent edge detected, take array of edge coordinates
//and get a set of horizontal lines
function shapeData(contours: any, offsetX: number, offsetY: number): any[] {
  let shapes = [];
  let line: ROIFeature;
  for (let i = 0; i < contours.size(); ++i) {
    let faceFeatures: any = {};
    let cont = contours.get(i);
    for (let y = 0; y < cont.rows; y++) {
      let row = cont.row(y);
      let [xP, yP] = row.data32S;
      xP += offsetX;
      yP += offsetY;
      if (yP in faceFeatures) {
        line = faceFeatures[yP];
        if (line.x1 == -1) {
          if (line.x0 < xP) {
            line.x1 = xP;
          } else {
            line.x1 = line.x0;
            line.x0 = xP;
          }
        } else if (xP < line.x0) {
          line.x0 = xP;
        } else {
          line.x1 = xP;
        }
      } else {
        let roi = new ROIFeature();
        roi.y0 = yP;
        roi.x0 = xP;
        roi.y1 = yP;
        roi.x1 = -1;
        faceFeatures[yP] = roi;
      }
    }
    shapes.push(faceFeatures);
  }
  return shapes;
}

function getSortedKeys(obj: any): any[] {
  var keys = Object.keys(obj);
  return keys.sort(function(a, b) {
    return Number(a) - Number(b);
  });
}
