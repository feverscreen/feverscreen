import { Frame } from "./camera";
import SmoothingWorker from "worker-loader!./smoothing-worker";
import { AnalysisResult } from "@/types";
import { ImageInfo } from "@/smoothing-worker";

const smoothingWorkers = [
  {
    worker: new SmoothingWorker(),
    pending: {},
    index: 0
  },
  {
    worker: new SmoothingWorker(),
    pending: {},
    index: 1
  },
  {
    worker: new SmoothingWorker(),
    pending: {},
    index: 2
  }
];

for (let i = 0; i < smoothingWorkers.length; i++) {
  const s = smoothingWorkers[i];
  s.worker.onmessage = result => {
    if ((s.pending as any)[result.data.type]) {
      (s.pending as any)[result.data.type](result.data);
      delete (s.pending as any)[result.data.type];
    } else {
      console.error("Couldn't find callback for", result.data.type, s.index);
    }
  };
}

let workerIndex = 0;
// TODO(jon): Ping-pong the workers, and terminate them if they get too long

const processSensorData = async (
  frame: Frame,
  prevFrame: Float32Array
): Promise<ImageInfo> => {
  const index = workerIndex;
  return new Promise((resolve, reject) => {
    (smoothingWorkers[index].pending as any)["smooth"] = resolve;
    smoothingWorkers[index].worker.postMessage({
      type: "smooth",
      frame: frame.frame,
      prevFrame
    });
  });
};

export const advanceWorker = () => {
  workerIndex = (workerIndex + 1) % smoothingWorkers.length;
};
