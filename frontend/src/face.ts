import { featureLine, FeatureState } from "./feature-detection";
import { threshold, crop, getContourData } from "./opencv-filters";
import { ROIFeature } from "./worker-fns";

export enum Gradient {
  Decreasing = -1,
  Neutral = 0,
  Increasing = 1
}

const MaxFaceAreaPercent = 0.9;

//the oval has to cover MinFaceOvalCoverage percent of detected edges to be considered a face
const MinFaceOvalCoverage = 80;
//once an oval differs by CoverageErrorDiff percent from the best coverage
//it is considered a mismatch
const CoverageErrorDiff = 3;

const DEBUG = false;
const FaceTrackingMaxDelta = 10;
const ForeheadPercent = 0.28;
const ForeheadPadding = 2;
const MaxErrors = 2;
const MaxWidthDeviationPercent = 1.2;

// when tracking faces, once we have a std dev less than 3, we are tracking
const MaxDeviation = 3;
// New Faces mid point cant be greater than this from previous
const MaxMidDeviation = 10;
const maxFrameSkip = 6;

let FaceID = 1;

//checks that the shapes dont take more than MaxFaceAreaPercent of the area
function validShapes(shapes: Shape[], roi: ROIFeature): boolean {
  const roiArea = roi.width() * roi.height();

  // If we have lines abutting the top of the haar shape, we definitely don't have a face.

  for (const shape of shapes) {
    let area = 0;
    let numAbutting = 0;
    let numAbuttingTop = 0;
    for (const feature of Object.values(shape)) {
      if (
        Math.abs(feature.x1 - roi.x1) < 2 ||
        Math.abs(feature.x0 - roi.x0) < 2
      ) {
        if (Math.abs(feature.y0 - roi.y0) < 2) {
          numAbuttingTop++;
        }
        numAbutting++;
      }
      area += feature.width();
    }
    if (numAbuttingTop) {
      if (DEBUG) {
        console.warn("top abutting shape");
      }
      return false;
    }
    if (numAbutting > roi.height() * 0.75) {
      if (DEBUG) {
        console.log("probably got ourselves a rectangle");
      }
      return false;
    }

    // TODO(jon): Also check that all of the feature edges aren't lined up against the edge of the box...

    if (area / roiArea > MaxFaceAreaPercent) {
      if (DEBUG) {
        console.log("face edges exceed maximum area percent", area / roiArea);
      }
      return false;
    }
  }
  return true;
}
function backgroundTemp(
  source: Float32Array,
  roi: Mat,
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
        const index = y + offsetY * sourceWidth + x + offsetX;
        const val = source[index];
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

  const avg = backSum / count;
  return (avg + minTemp) / 2.0;
}

interface Mat {
  rows: number;
  cols: number;
  data: Float32Array;
}

type Shape = Record<number, ROIFeature>;

interface Row {
  data32S: [number, number];
}

interface Contour {
  rows: number;
  row: (index: number) => Row;
}
export interface Contours {
  get: (index: number) => Contour;
  size: () => number;
  delete: () => void;
}
//for each independent edge detected, take array of edge coordinates
//and get a set of horizontal lines
export function shapeData(
  contours: Contours,
  offsetX: number,
  offsetY: number
): Shape[] {
  const shapes = [];
  let line: ROIFeature;
  for (let i = 0; i < contours.size(); ++i) {
    // If there are two lines on the same y axis, remove the shorter one?

    const faceFeatures: Shape = {};
    const cont = contours.get(i);

    // NOTE: cont.rows / 4 is how many scanlines the feature takes.
    // We can discard small features.

    for (let y = 0; y < cont.rows; y++) {
      const row = cont.row(y);
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
        const roi = new ROIFeature();
        roi.y0 = yP;
        roi.x0 = xP;
        roi.y1 = yP;
        roi.x1 = -1;
        faceFeatures[yP] = roi;
      }
    }
    shapes.push(faceFeatures);
  }

  let bestArea = 0;
  let bestShape;
  for (const shape of shapes) {
    const area = Object.values(shape).reduce(
      (acc: number, item: ROIFeature) => {
        acc += item.width();
        return acc;
      },
      0
    );
    if (area > bestArea) {
      bestArea = area as number;
      bestShape = shape;
    }
  }
  return bestShape ? [bestShape] : [];
}

function getSortedKeys(obj: Shape): number[] {
  const keys = Object.keys(obj);
  return keys
    .sort(function(a, b) {
      return Number(a) - Number(b);
    })
    .map(x => Number(x));
}

export class Hotspot {
  sensorValue: number;
  sensorX: number;
  sensorY: number;
  constructor() {
    this.sensorValue = 0;
    this.sensorX = 0;
    this.sensorY = 0;
  }
}

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

// measure the change in values over the last 3 values
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
    this.maxY = -1;
    this.minY = -1;
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
    this.oval = new ROIFeature();
    this.oval.y0 = -1;
    this.ovalCalcStart = -1;
    this.ovalMatch = 0;
    this.tempStats = new TempStats();
  }

  yLine(): ROIFeature {
    const yFace = featureLine(-1, this.minY);
    yFace.y1 = this.maxY;
    return yFace;
  }

  addFeature(feature: ROIFeature, source: Float32Array, frameWidth: number) {
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

    const y = ~~feature.y0 * frameWidth;
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
    const h = this.oval.midX();
    const k = this.oval.midY();
    const a = Math.pow(this.oval.width() / 2.0, 2);
    const b = Math.pow(this.oval.height() / 2.0, 2);
    let percentCover = 0;
    for (
      let i = this.ovalCalcStart - this.minY;
      i < this.features.length;
      i++
    ) {
      const r = this.features[i];
      //x location of oval edge at at r.y0
      const xDiff = Math.sqrt(a * (1 - Math.pow(r.y0 - k, 2) / b));
      const x0 = h - xDiff;
      const x1 = h + xDiff;
      const areaCovered = Math.min(x1, r.x1) - Math.max(x0, r.x0);
      if (areaCovered > 0) {
        percentCover += areaCovered;
      }
    }

    const cover = ~~((100 * percentCover) / this.area);
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
        if (DEBUG) {
          console.log("oval coverage worsened best cover - ", this.ovalMatch);
        }
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
export class Face {
  numFrames: number;
  framesMissing: number;
  id: number;
  roi: ROIFeature | null;
  forehead: ROIFeature | null;
  haarAge: number;
  haarLastSeen: number;
  xFeatures: ROIFeature[];
  widthWindow: Window;
  frontOnRatio: number;
  foreheadX: number;
  foreheadY: number;
  heightWindow: Window;
  faceWidth: number;
  faceHeight: number;
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
    this.frontOnRatio = 0;
    this.foreheadX = 0;
    this.foreheadY = 0;
    //debugging
    this.xFeatures = [];
    this.assignID();
  }

  hasMovedOrChangedInSize(oldFace: ROIFeature): boolean {
    const movement = this.roi!.midDiff(oldFace);
    const oldArea = oldFace.width() * oldFace.height();
    const newArea = this.width() * this.height();
    const areaChange = Math.abs(oldArea - newArea);
    console.log(movement, areaChange);
    return movement > 3 || areaChange > 40;
  }

  get isFrontOn(): boolean {
    return this.frontOnRatio < 0.02;
  }

  get frontOnPercentage(): string {
    return (100 * (1 - this.frontOnRatio)).toFixed(2);
  }
  // TODO(jon): Inspect the logic around updateHaar and haarActive.
  //  Seems like haarLastSeen is maybe redundant
  updateHaar(haar: ROIFeature) {
    this.haarFace = haar;
    this.haarAge++;
    this.haarLastSeen = this.numFrames + 1;
  }

  haarActive(): boolean {
    return this.haarAge === 1 || this.haarLastSeen == this.numFrames;
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

  clear() {
    this.forehead = null;
    this.roi = null;
    this.heatStats.foreheadHotspot = null;
    this.framesMissing++;
  }

  update(forehead: ROIFeature, roi: ROIFeature) {
    this.forehead = forehead;
    this.roi = roi;
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

  findFace(
    shapes: Shape[],
    source: Float32Array,
    frameWidth: number
  ): [ROIFeature | null, TempStats | null] {
    let bestScore = -1;
    let bestOval: ROIFeature | null = null;
    let heatStats: TempStats | null = null;
    for (const shape of shapes) {
      const keys = getSortedKeys(shape);
      const xTracking = new Tracking();
      let longestLine: ROIFeature | null = null;

      for (const key of keys) {
        if (xTracking.mismatch >= MaxErrors) {
          break;
        }
        const faceX = shape[key];
        const matched = xTracking.matched(faceX);
        if (!matched) {
          continue;
        }
        xTracking.addFeature(faceX, source, frameWidth);
        if (faceX.wider(longestLine)) {
          longestLine = faceX;
        }
      }

      // TODO(jon): Improve where we are getting the oval

      if (
        xTracking.ovalMatch > bestScore &&
        xTracking.ovalMatch > MinFaceOvalCoverage &&
        xTracking.features.length >= 4
      ) {
        const oval = xTracking.oval;
        if (!this.matchesPrevious(oval)) {
          if (DEBUG) {
            console.log("New oval differs too much in width/height/midpoint");
          }

          // NOTE(jon): Don't let the face get to long.  Could also have a max face width/height ratio that we cap face length at?
          if (this.roi) {
            if (
              Math.abs(oval.midY() - this.roi!.midY()) >
              this.roi.height() * 0.1
            ) {
              if (DEBUG) {
                console.log("height changed to much, using last height");
              }
              oval.y1 = this.roi!.y1;
            }
            if (
              Math.abs(oval.midX() - this.roi!.midX()) >
              this.roi.width() * 0.8
            ) {
              if (DEBUG) {
                console.log("Too much movement on X, aborting tracking");
              }
              return [null, null];
            }
          }
        }
        bestOval = oval;
        bestScore = xTracking.ovalMatch;
        heatStats = xTracking.tempStats;
      }
    }
    return [bestOval, heatStats];
  }

  trackFace(
    source: Float32Array,
    values: Float32Array,
    thermalRef: ROIFeature | null,
    frameWidth: number,
    frameHeight: number
  ): void {
    this.xFeatures = [];
    this.numFrames += 1;
    if (!this.tracked()) {
      this.framesMissing++;
    }
    this.detectForehead(
      this.haarFace,
      source,
      values,
      thermalRef,
      frameWidth,
      frameHeight
    );
  }

  setForeheadHotspot(source: Float32Array, frameWidth: number) {
    const r = this.forehead;
    if (!r) {
      this.heatStats.foreheadHotspot = null;
      return;
    }
    const hotspot = new Hotspot();
    hotspot.sensorValue = 0;
    for (let y = ~~r.y0; y < ~~r.y1; y++) {
      for (let x = ~~r.x0; x < ~~r.x1; x++) {
        const index = y * frameWidth + x;
        const current = source[index];
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
    values: Float32Array,
    thermalRef: ROIFeature | null,
    frameWidth: number,
    frameHeight: number
  ): void {
    roi = roi.wholeValues();
    let roiCrop = crop(source, frameHeight, frameWidth, roi);
    roiCrop = threshold(roiCrop, roi, thermalRef);
    const contours = (getContourData(roiCrop) as unknown) as Contours;
    const shapes = shapeData(contours, roi.x0, roi.y0);
    contours.delete();

    //TODO(jon): What if some shapes are valid and others aren't?
    // Why do we need this?  Seems to mostly filter out synthetic cases where areas are square
    // after a face disappears from one frame to the next?  Can this fail on square heads?

    const valid = validShapes(shapes, roi);
    if (!valid) {
      this.clear();
      return;
    }
    const [oval, heatStats] = this.findFace(shapes, source, frameWidth);
    this.xFeatures = [];
    for (const shape of shapes) {
      this.xFeatures.push(...Object.values(shape));
    }
    if (oval && heatStats) {
      // NOTE(jon): We never use backgroundAvg for anything, it's just for debug purposes?
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
      if (DEBUG) {
        console.log(
          "lost oval, maybe we should try using the one from the last frame?"
        );
      }
      this.clear();
      return;
    }

    // Recenter oval onto xFeatures center of mass.
    let centerX = 0;
    let num = 0;

    // TODO(jon): Should we clamp the x0,x1 values of the features to the bounds of the oval?

    const featuresInOval = this.xFeatures.filter(
      feature => feature.y0 >= oval.y0 && feature.y1 <= oval.y1
    );
    for (const feature of featuresInOval) {
      if (feature.y0 >= oval.y0 && feature.y1 <= oval.y1) {
        centerX += feature.midX();
        num++;
      }
    }
    centerX = centerX / num;
    const halfWidth = oval.width() / 2;
    oval.x0 = centerX - halfWidth;
    oval.x1 = centerX + halfWidth;

    // Now guess if the face is front-on, based on the symmetry of the xFeatures around the centerX.
    // Evaluate the features up until the point where they flare out and don't go back in.

    // TODO(jon): Maybe just consider the symmetry *below* the forehead box.
    let leftSum = 0;
    let rightSum = 0;
    for (const feature of featuresInOval) {
      if (feature.x0 < centerX) {
        leftSum += Math.min(feature.x1, centerX) - feature.x0;
      }
      if (feature.x1 >= centerX) {
        rightSum += feature.x1 - Math.max(feature.x0, centerX);
      }
    }
    // Ratio or percent difference between left and right weights can indicate how front-on the face is.
    this.frontOnRatio = Math.abs(1.0 - leftSum / rightSum);

    // If we have a bunch of features abutting the edge on one side of the bottom, but not the other, we're also
    // probably not front-on.

    // Take the last six scanlines or so.  Might need to scale this based on the size of the face box.
    let unevenEdges = 0;
    for (const feature of featuresInOval.filter(
      feature => Math.abs(feature.y1 - oval.y1) <= 10
    )) {
      const dX0 = Math.abs(Math.max(feature.x0, oval.x0) - oval.x0);
      const dX1 = Math.abs(Math.min(feature.x1, oval.x1) - oval.x1);
      if ((dX0 < 2 && dX1 >= 2) || (dX1 < 2 && dX0 >= 2)) {
        unevenEdges++;
      }
    }
    if (unevenEdges > 7) {
      this.frontOnRatio = 1;
      if (DEBUG) {
        console.log("uneven edges", unevenEdges);
      }
    }

    const detectedROI = oval;
    const forehead = new ROIFeature();
    forehead.y0 = detectedROI.y0 - ForeheadPadding;
    forehead.y1 =
      forehead.y0 + detectedROI.height() * ForeheadPercent + ForeheadPadding;
    forehead.x0 = detectedROI.x0 - ForeheadPadding;
    forehead.x1 = detectedROI.x1 + ForeheadPadding;
    this.update(forehead, detectedROI);

    // Get the features in the forehead box.
    // Weight them to either side of the center of the roi.
    const featuresInForehead = this.xFeatures.filter(
      feature => feature.y1 < forehead.y1
    );
    centerX = 0;
    num = 0;
    for (const feature of featuresInForehead) {
      centerX += feature.midX();
      num++;
    }
    this.foreheadX = centerX / num;
    this.foreheadY = forehead.y1 - 2;
    //console.log("foreheadX", centerX);

    if (heatStats) {
      // NOTE(jon): heatStats are just for debugging purposes, not functional.
      this.heatStats = heatStats;
      if (this.heatStats.count > 0) {
        this.heatStats.avgTemp /= this.heatStats.count;
      }
    }
    //this.setForeheadHotspot(source, frameWidth);
    this.heatStats.foreheadHotspot = new Hotspot();
    this.heatStats.foreheadHotspot.sensorX = this.foreheadX;
    this.heatStats.foreheadHotspot.sensorY = this.foreheadY;
    // NOTE(jon): Get the hotspot from the median-smoothed data, not the radial smoothed data.
    this.heatStats.foreheadHotspot.sensorValue =
      values[~~this.foreheadY * frameWidth + ~~this.foreheadX];
    if (DEBUG) {
      console.log("Face", detectedROI, heatStats);
    }
  }
}
