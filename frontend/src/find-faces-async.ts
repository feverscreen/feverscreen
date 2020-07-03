import { buildSAT, HaarCascade } from "./haar-cascade";
import { Face } from "./face";
import { FrameInfo } from "./api/types";
import { scanHaarParallel } from "./scan-haar-parallel";
import { MinFaceAge } from "./feature-detection";
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

export async function findFacesInFrameAsync(
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
  // performance.mark("buildSat start");
  const satData = buildSAT(
    smoothedData,
    frameWidth,
    frameHeight,
    thermalReference
  );
  performance.mark("buildSat end");
  performance.measure("build SAT", "buildSat start", "buildSat end");
  performance.mark("scanHaar");
  const faceBoxes = await scanHaarParallel(
    model,
    satData,
    frameWidth,
    frameHeight
  );
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
