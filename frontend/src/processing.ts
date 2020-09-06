import { Frame } from "./camera";
import SmoothingWorker from "worker-loader!./smoothing-worker";
import { ROIFeature } from "@/worker-fns";
import { MotionStats } from "@/types";

export interface SmoothedImages {
  medianSmoothed: Float32Array;
  radialSmoothed: Float32Array;
}

export interface ImageInfo {
  motionStats: MotionStats;
  edgeData: Float32Array;
  headHull: Uint8Array;
  bodyHull: Uint8Array;
}

const smoothingWorkers = [
  {
    worker: new SmoothingWorker(),
    pending: {}
  },
  {
    worker: new SmoothingWorker(),
    pending: {}
  },
  {
    worker: new SmoothingWorker(),
    pending: {}
  }
];

for (const s of smoothingWorkers) {
  s.worker.onmessage = result => {
    if ((s.pending as any)[result.data.type]) {
      (s.pending as any)[result.data.type](result.data);
      delete (s.pending as any)[result.data.type];
    } else {
      console.error("Couldn't find callback for", result.data.type);
    }
  };
}

let workerIndex = 0;
// TODO(jon): Ping-pong the workers, and terminate them if they get too long

export const processSensorData = async (
  frame: Frame,
  prevFrame: Float32Array
): Promise<SmoothedImages> => {
  const index = workerIndex;
  // workerIndex = (workerIndex + 1) % 3;
  return new Promise((resolve, reject) => {
    (smoothingWorkers[index].pending as any)["smooth"] = resolve;
    let width = frame.frameInfo.Camera.ResX;
    let height = frame.frameInfo.Camera.ResY;
    if (!frame.rotated) {
      // noinspection JSSuspiciousNameCombination
      width = frame.frameInfo.Camera.ResY;
      // noinspection JSSuspiciousNameCombination
      height = frame.frameInfo.Camera.ResX;
    }
    smoothingWorkers[index].worker.postMessage({
      type: "smooth",
      frame: frame.frame,
      prevFrame: prevFrame || new Float32Array(120 * 160),
      width,
      height,
      rotate: !frame.rotated
    });
  });
};

export const extractBodyInfo = async (
  thermalRef: ROIFeature | null,
  thermalRefC: number
): Promise<ImageInfo> => {
  const index = workerIndex;
  return new Promise((resolve, reject) => {
    (smoothingWorkers[index].pending as any)["extract"] = resolve;
    smoothingWorkers[index].worker.postMessage({
      type: "extract",
      thermalRef: thermalRef || new ROIFeature(),
      thermalRefC
    });
  });
};

export const advanceWorker = () => {
  workerIndex = (workerIndex + 1) % smoothingWorkers.length;
};
