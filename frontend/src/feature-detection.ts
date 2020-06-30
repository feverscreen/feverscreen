import {
  circleDetect,
  circleDetectRadius,
  edgeDetect
} from "@/circle-detection";
import { buildSAT, HaarCascade, scanHaarParallel } from "@/haar-cascade";
import { Face } from "@/face";
const MinFaceAge = 10;
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
    this.sensorX = 0;
    this.sensorY = 0;
    this.state = FeatureState.None;
  }

  wholeValues() {
    this.x0 = ~~this.x0;
    this.x1 = ~~this.x1;
    this.y0 = ~~this.y0;
    this.y1 = ~~this.y1;
  }

  midDiff(other: ROIFeature): number {
    return euclDistance(this.midX(), this.midY(), other.midX(), other.midY());
  }

  extend(value: number, maxWidth: number, maxHeight: number): ROIFeature {
    const roi = new ROIFeature();
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
  tryMerge(x0: number, y0: number, x1: number, y1: number, mergeCount = 1) {
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
  // checks if this roi fits completely inside a sqaure (x0,y0) - (x1,y1)
  isContainedBy(x0: number, y0: number, x1: number, y1: number): boolean {
    if (this.x0 > x0 && this.x1 < x1 && this.y0 > y0 && this.y1 < y1) {
      return true;
    }
    return false;
  }

  state: FeatureState;
  flavor: string;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  mergeCount: number;
  sensorValue: number;
  sensorAge: number;
  sensorMissing: number;
  sensorX: number;
  sensorY: number;
}

function circleStillPresent(
  r: ROIFeature,
  saltPepperData: Float32Array,
  edgeData: Float32Array,
  frameWidth: number,
  frameHeight: number
) {
  const width = frameWidth;
  const height = frameHeight;
  const dest = new Float32Array(width * height);
  const radius = r.width() * 0.5;
  const [value, cx, cy] = circleDetectRadius(
    edgeData,
    dest,
    radius,
    width,
    height,
    r.midX() - radius * 2,
    r.midY() - radius * 2,
    r.midX() + radius * 2,
    r.midY() + radius * 2
  );
  if (!r.contains(cx, cy)) {
    r.sensorMissing = Math.max(r.sensorMissing - 1, 0);
    return r.sensorMissing > 0;
  }
  r.sensorMissing = Math.min(r.sensorMissing + 1, 20);
  return true;
}

export function detectThermalReference(
  saltPepperData: Float32Array,
  smoothedData: Float32Array,
  previousThermalReference: ROIFeature | null,
  frameWidth: number,
  frameHeight: number
): ROIFeature | null {
  performance.mark("ed start");
  const edgeData = edgeDetect(smoothedData, frameWidth, frameHeight);
  performance.mark("ed end");
  performance.measure("edge detection", "ed start", "ed end");

  performance.mark("cd start");
  if (
    previousThermalReference &&
    circleStillPresent(
      previousThermalReference,
      saltPepperData,
      edgeData,
      frameWidth,
      frameHeight
    )
  ) {
    return previousThermalReference;
  }

  const [bestRadius, bestX, bestY] = circleDetect(
    edgeData,
    frameWidth,
    frameHeight
  );

  if (bestRadius <= 0) {
    return null;
  }
  const r = new ROIFeature();
  r.flavor = "Circle";
  r.x0 = bestX - bestRadius;
  r.y0 = bestY - bestRadius;
  r.x1 = bestX + bestRadius;
  r.y1 = bestY + bestRadius;
  performance.mark("cd end");
  performance.measure("circle detection", "cd start", "cd end");
  return r;
}

export function featureLine(x: number, y: number): ROIFeature {
  const line = new ROIFeature();
  line.y0 = y;
  line.y1 = y;
  line.x0 = x;
  line.x1 = x;
  line.state = FeatureState.None;
  line.flavor = "line";
  return line;
}

export async function findFacesInFrame(
  smoothedData: Float32Array,
  frameWidth: number,
  frameHeight: number,
  model: HaarCascade,
  existingFaces: Face[],
  thermalReference: ROIFeature
) {
  // Now extract the faces(s), and their hotspots.
  performance.mark("buildSat start");
  const satData = buildSAT(
    smoothedData,
    frameWidth,
    frameHeight,
    thermalReference
  );
  performance.mark("buildSat end");
  performance.measure("build SAT", "buildSat start", "buildSat end");
  const faceBoxes = await scanHaarParallel(
    model,
    satData,
    frameWidth,
    frameHeight
  );

  // Ignoring faces detected that overlap the thermal reference - probably want to remove this.
  //let faces = faceBoxes.filter(box => !box.overlapsROI(thermalReference));
  const newFaces: Face[] = [];
  for (const haarFace of faceBoxes) {
    const existingFace = existingFaces.find(face =>
      haarFace.overlapsROI(face.haarFace)
    );

    if (existingFace) {
      existingFace.updateHaar(haarFace);
    } else {
      const face = new Face(haarFace, 0);
      //face.trackFace(smoothedData, frameWidth, frameHeight);
      face.trackFace(smoothedData, thermalReference, frameWidth, frameHeight);
      // TODO(jon): UncorrectedHotspot = face.hotspot.sensorValue;
      newFaces.push(face);
    }
  }
  // track faces from last frame
  for (const face of existingFaces) {
    face.trackFace(smoothedData, thermalReference, frameWidth, frameHeight);
    if (face.active()) {
      if (face.haarAge < MinFaceAge && !face.haarActive()) {
        continue;
      }
      newFaces.push(face);
    }
  }
  return newFaces;
}

export function euclDistance(
  x: number,
  y: number,
  x2: number,
  y2: number
): number {
  return Math.sqrt(Math.pow(x - x2, 2) + Math.pow(y - y2, 2));
}
