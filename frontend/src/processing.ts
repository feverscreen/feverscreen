import { Frame } from "./camera";
import SmoothingWorker from "worker-loader!./smoothing-worker";
import { ROIFeature } from "@/worker-fns";
import { MotionStats } from "@/types";

export interface SmoothedImages {
  medianSmoothed: Float32Array;
  radialSmoothed: Float32Array;
  thresholded: Uint8Array;
  motionStats: MotionStats;
  edgeData: Float32Array;
  pointCloud: Uint8Array;
}
const smoothingWorker = new SmoothingWorker();

export const processSensorData = async (
  frame: Frame,
  thermalRef: ROIFeature | null,
  thermalRefC: number
): Promise<SmoothedImages> => {
  return new Promise(function(resolve, reject) {
    smoothingWorker.onmessage = r => {
      resolve(r.data as SmoothedImages);
    };
    smoothingWorker.postMessage({
      frame: frame.frame,
      width: frame.frameInfo.Camera.ResX,
      height: frame.frameInfo.Camera.ResY,
      thermalRef: thermalRef || new ROIFeature(),
      thermalRefC,
      rotate: !frame.rotated
    });
  });
};

const rotate90 = (src: Float32Array, dest: Float32Array): Float32Array => {
  let i = 0;
  const width = 160;
  const height = 120;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      dest[x * height + y] = src[i];
      i++;
    }
  }
  return dest;
};

export function rotateFrame(frame: Frame) {
  if (!frame.rotated) {
    frame.frameInfo.Camera.ResX = 120;
    frame.frameInfo.Camera.ResY = 160;
    frame.frame = rotate90(
      frame.frame,
      new Float32Array(
        frame.frameInfo.Camera.ResX * frame.frameInfo.Camera.ResY
      )
    );

    // TODO(jon): If thermal ref is always in the same place, maybe mask out the entire bottom of the frame?
    // Just for visualisation purposes?
    frame.rotated = true;
  }
}
