import {
  circleDetect,
  circleDetectRadius,
  edgeDetect
} from "./circle-detection";
import { buildSAT, HaarCascade, scanHaarSerial } from "./haar-cascade";
import { Face } from "./face";
import { FrameInfo } from "./api/types";
import { ROIFeature } from "./worker-fns";

const PERF_TEST = false;
let performance = {
  mark: (arg: string): void => {
    return;
  },
  measure: (arg0: string, arg1: string, arg2: string): void => {
    return;
  },
  now: () => {
    return;
  }
};
if (PERF_TEST) {
  performance = window.performance;
}

export const MinFaceAge = 2;
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

export function euclDistance(
  x: number,
  y: number,
  x2: number,
  y2: number
): number {
  return Math.sqrt(Math.pow(x - x2, 2) + Math.pow(y - y2, 2));
}

export class Rect {
  constructor(
    public x0: number,
    public x1: number,
    public y0: number,
    public y1: number
  ) {}
}
//
// export class ROIFeature {
//   constructor() {
//     this.x0 = 0;
//     this.y0 = 0;
//     this.x1 = 0;
//     this.y1 = 0;
//     this.mergeCount = 1;
//     this.sensorMissing = 0;
//     this.sensorValue = 0;
//     this.sensorX = 0;
//     this.sensorY = 0;
//   }
//
//   wholeValues() {
//     const roundedRoi = new ROIFeature();
//     roundedRoi.x0 = ~~this.x0;
//     roundedRoi.x1 = ~~this.x1;
//     roundedRoi.y0 = ~~this.y0;
//     roundedRoi.y1 = ~~this.y1;
//     return roundedRoi;
//   }
//   extend(value: number, maxWidth: number, maxHeight: number): ROIFeature {
//     const roi = new ROIFeature();
//     roi.x0 = Math.max(0, this.x0 - value);
//     roi.x1 = Math.min(maxWidth, this.x1 + value);
//     roi.y0 = Math.max(0, this.y0 - value);
//     roi.y1 = Math.min(maxHeight, this.y1 + value);
//     return roi;
//   }
//
//   wider(other: ROIFeature | null | undefined): boolean {
//     return !other || this.width() > other.width();
//   }
//
//   higher(other: ROIFeature | null | undefined): boolean {
//     return !other || this.height() > other.height();
//   }
//
//   hasXValues() {
//     return this.x0 != -1 && this.x1 != -1;
//   }
//
//   hasYValues() {
//     return this.y0 != -1 && this.y1 != -1;
//   }
//
//   midX() {
//     return (this.x0 + this.x1) / 2;
//   }
//   midY() {
//     return (this.y0 + this.y1) / 2;
//   }
//
//   width() {
//     return this.x1 - this.x0;
//   }
//
//   height() {
//     return this.y1 - this.y0;
//   }
//
//   midDiff(other: ROIFeature): number {
//     return euclDistance(this.midX(), this.midY(), other.midX(), other.midY());
//   }
//
//   overlapsROI(other: ROIFeature): boolean {
//     return this.overlap(other.x0, other.y0, other.x1, other.y1);
//   }
//
//   overlap(x0: number, y0: number, x1: number, y1: number) {
//     if (x1 <= this.x0) {
//       return false;
//     }
//     if (y1 <= this.y0) {
//       return false;
//     }
//     if (this.x1 <= x0) {
//       return false;
//     }
//     if (this.y1 <= y0) {
//       return false;
//     }
//     return true;
//   }
//
//   contains(x: number, y: number) {
//     if (x <= this.x0) {
//       return false;
//     }
//     if (y <= this.y0) {
//       return false;
//     }
//     if (this.x1 < x) {
//       return false;
//     }
//     if (this.y1 < y) {
//       return false;
//     }
//     return true;
//   }
//
//   // checks if this roi fits completely inside a sqaure (x0,y0) - (x1,y1)
//   isContainedBy(x0: number, y0: number, x1: number, y1: number): boolean {
//     if (this.x0 > x0 && this.x1 < x1 && this.y0 > y0 && this.y1 < y1) {
//       return true;
//     }
//     return false;
//   }
//
//   tryMerge(x0: number, y0: number, x1: number, y1: number, mergeCount = 1) {
//     if (!this.overlap(x0, y0, x1, y1)) {
//       return false;
//     }
//     const newMerge = mergeCount + this.mergeCount;
//     this.x0 = (this.x0 * this.mergeCount + x0 * mergeCount) / newMerge;
//     this.y0 = (this.y0 * this.mergeCount + y0 * mergeCount) / newMerge;
//     this.x1 = (this.x1 * this.mergeCount + x1 * mergeCount) / newMerge;
//     this.y1 = (this.y1 * this.mergeCount + y1 * mergeCount) / newMerge;
//     this.mergeCount = newMerge;
//     return true;
//   }
//
//   x0: number;
//   y0: number;
//   x1: number;
//   y1: number;
//   mergeCount: number;
//   sensorValue: number;
//   sensorMissing: number;
//   sensorX: number;
//   sensorY: number;
// }

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
): { r: ROIFeature | null; edgeData: Float32Array } {
  const edgeData = edgeDetect(smoothedData, frameWidth, frameHeight);
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
    return { r: previousThermalReference, edgeData };
  }

  const [bestRadius, bestX, bestY] = circleDetect(
    edgeData,
    frameWidth,
    frameHeight
  );

  if (bestRadius <= 4 || bestRadius > 7) {
    return { r: null, edgeData };
  }
  const r = new ROIFeature();
  r.x0 = bestX - bestRadius;
  r.y0 = bestY - bestRadius;
  r.x1 = bestX + bestRadius;
  r.y1 = bestY + bestRadius;
  return { edgeData, r };
}

export function featureLine(x: number, y: number): ROIFeature {
  const line = new ROIFeature();
  line.y0 = y;
  line.y1 = y;
  line.x0 = x;
  line.x1 = x;
  return line;
}

export function findFacesInFrameSync(
  smoothedData: Float32Array,
  saltPepperData: Float32Array,
  frameWidth: number,
  frameHeight: number,
  model: HaarCascade,
  existingFaces: Face[],
  thermalReference: ROIFeature,
  info: FrameInfo
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
  performance.mark("scanHaar");
  const faceBoxes = scanHaarSerial(model, satData, frameWidth, frameHeight);
  performance.mark("scanHaar end");
  performance.measure("scanHaarParallel", "scanHaar", "scanHaar end");

  performance.mark("track faces");

  // TODO(jon): May want to loop through this a few times until is stabilises.
  const newFaces: Face[] = [];
  for (const haarFace of faceBoxes) {
    const existingFace = existingFaces.find(face =>
      haarFace.overlapsROI(face.haarFace)
    );

    if (existingFace) {
      existingFace.updateHaar(haarFace);
    } else {
      const face = new Face(haarFace, 0);
      face.trackFace(
        smoothedData,
        saltPepperData,
        thermalReference,
        frameWidth,
        frameHeight
      );
      newFaces.push(face);
    }
  }
  // track faces from last frame
  for (const face of existingFaces) {
    face.trackFace(
      smoothedData,
      saltPepperData,
      thermalReference,
      frameWidth,
      frameHeight
    );
    //console.log(face.id, face.haarActive());
    //console.assert(face.haarActive(), info.Telemetry.FrameCount);
    if (face.active()) {
      // If the haar age is less than 10 frames, and
      if (face.haarAge < MinFaceAge && !face.haarActive()) {
        console.log("dropping face", face.id);
        continue;
      }
      newFaces.push(face);
    }
  }
  performance.mark("track faces end");
  performance.measure("track faces", "track faces", "track faces end");
  return newFaces;
}
