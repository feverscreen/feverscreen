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
