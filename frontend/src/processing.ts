import { Frame } from "./camera";
import SmoothingWorker from "worker-loader!./smoothing-worker";
import { ROIFeature } from "@/worker-fns";
import { MotionStats } from "@/types";

export interface SmoothedImages {
  medianSmoothed: Float32Array;
  radialSmoothed: Float32Array;
  motionStats: MotionStats;
  edgeData: Float32Array;
  headHull: Uint8Array;
  bodyHull: Uint8Array;
}
const smoothingWorkers = [
  new SmoothingWorker(),
  new SmoothingWorker(),
  new SmoothingWorker()
];
let workerIndex = 0;
// TODO(jon): Ping-pong the workers, and terminate them if they get too long

export const processSensorData = async (
  frame: Frame,
  thermalRef: ROIFeature | null,
  thermalRefC: number
): Promise<SmoothedImages> => {
  workerIndex = (workerIndex + 1) % 3;
  return new Promise(function(resolve, reject) {
    smoothingWorkers[workerIndex].onmessage = r => {
      resolve(r.data as SmoothedImages);
    };
    let width = frame.frameInfo.Camera.ResX;
    let height = frame.frameInfo.Camera.ResY;
    if (!frame.rotated) {
      // noinspection JSSuspiciousNameCombination
      width = frame.frameInfo.Camera.ResY;
      // noinspection JSSuspiciousNameCombination
      height = frame.frameInfo.Camera.ResX;
    }
    smoothingWorkers[workerIndex].postMessage({
      frame: frame.frame,
      width,
      height,
      thermalRef: thermalRef || new ROIFeature(),
      thermalRefC,
      rotate: !frame.rotated
    });
  });
};
