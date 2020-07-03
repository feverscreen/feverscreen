import HaarWorker from "worker-loader!./eval-haar-worker";
import { HaarCascade } from "./haar-cascade";
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

const DEBUG = false;
const WorkerPool: Worker[] = [];

export async function scanHaarParallel(
  cascade: HaarCascade,
  satData: Float32Array[],
  frameWidth: number,
  frameHeight: number
): Promise<ROIFeature[]> {
  //https://stackoverflow.com/questions/41887868/haar-cascade-for-face-detection-xml-file-code-explanation-opencv
  //https://github.com/opencv/opencv/blob/master/modules/objdetect/src/cascadedetect.hpp
  const result = [];
  const scales: number[] = [];
  let scale = 10;
  while (scale < frameHeight / 2) {
    scale *= 1.25;
    scales.push(scale);
  }
  performance.mark("ev start");

  // We want to try and divide this into workers, roughly the same as the number of hardware threads available:
  // 16,882 passes each
  const workerPromises = [];
  for (const scale of scales) {
    workerPromises.push(
      new Promise(function(resolve, reject) {
        let terminationTimer = -1;
        // Kill the worker if it takes longer than a frame
        let timeout = 1000 / 8.7;
        if (WorkerPool.length === 0) {
          const worker = new HaarWorker();
          // Copying the HaarCascade data to the worker each frame has significant overhead,
          // so it's better to just do it once when we init the worker, as the data is constant.
          worker.postMessage({ type: "init", cascade });
          WorkerPool.push(worker);
          // Allow a longer timeout before terminating if the worker has just been created.
          timeout = 1000;
        }
        const worker = WorkerPool.pop() as Worker;
        const timestamp: number = new Date().getTime();
        worker.onmessage = r => {
          clearTimeout(terminationTimer);
          // Mark resolved and return worker to pool.
          // console.log(`resolved worker after ${new Date().getTime() - s}, return to pool`);
          WorkerPool.push(worker);
          resolve(r.data as ROIFeature[]);
        };

        // NOTE(jon): The work can be reasonably evenly divided by each scale we want to search for
        //  features at.  It's possible that we could make some of the scales happen in serial in a
        //  single worker, and have less workers, as some scales always take much longer than others.
        worker.postMessage({
          type: "eval",
          scale,
          frameWidth,
          frameHeight,
          satData,
          s: timestamp
        });
        // Terminate the worker if it takes too long?
        terminationTimer = window.setTimeout(() => {
          if (DEBUG) {
            console.log(
              `terminating slow worker after ${new Date().getTime() -
                timestamp}`
            );
          }
          worker.terminate();
          reject([]);
        }, timeout);
      })
    );
  }
  try {
    const results: ROIFeature[][] = await Promise.all(
      workerPromises as Promise<ROIFeature[]>[]
    );
    const allResults = results.reduce(
      (acc: ROIFeature[], curr: ROIFeature[]) => {
        acc.push(...curr);
        return acc;
      },
      []
    );
    // Merge all boxes.  I *think* this has the same result as doing this work in serial.
    for (const r of allResults) {
      let didMerge = false;
      for (const mergedResult of result) {
        // seems we get a lot of padding lets try find the smallest box
        // could cause problems if a box contains 2 smaller independent boxes
        if (mergedResult.isContainedBy(r.x0, r.y0, r.x1, r.y1)) {
          didMerge = true;
          break;
        }

        if (mergedResult.tryMerge(r.x0, r.y0, r.x1, r.y1, r.mergeCount)) {
          didMerge = true;
          break;
        }
      }

      if (!didMerge) {
        const roi = new ROIFeature();
        roi.x0 = r.x0;
        roi.y0 = r.y0;
        roi.x1 = r.x1;
        roi.y1 = r.y1;
        roi.mergeCount = r.mergeCount;
        result.push(roi);
      }
    }
    // Now try to merge the results of each scale.
    performance.mark("ev end");
    performance.measure(`evalHaar: ${scales.length}`, "ev start", "ev end");
    return result;
  } catch (e) {
    // We timed out, and terminated early, so return no regions of interest.
    return [];
  }
}
