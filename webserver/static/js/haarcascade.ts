import { ROIFeature } from "./processing.js";

export class HaarWeakClassifier {
  constructor(
    public internalNodes: number[],
    public leafValues: number[],
    public feature: HaarFeature
  ) {
    this.internalNodes = internalNodes;
    this.leafValues = leafValues;
    this.feature = feature;
  }
}

export class HaarStage {
  constructor() {
    this.stageThreshold = 0;
    this.weakClassifiers = [];
  }
  stageThreshold: number;
  weakClassifiers: HaarWeakClassifier[];
}

export class HaarRect {
  constructor() {
    this.x0 = 0;
    this.y0 = 0;
    this.x1 = 0;
    this.y1 = 0;
    this.weight = 1;
  }
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  weight: number;
}

export class HaarFeature {
  constructor() {
    this.rects = [];
    this.tilted = false;
  }
  rects: HaarRect[];
  tilted: Boolean;
}

export class HaarCascade {
  constructor() {
    this.stages = [];
    this.features = [];
  }

  stages: HaarStage[];
  features: HaarFeature[];
}

export function buildSAT(
  source: Float32Array,
  width: number,
  height: number,
  sensorCorrection: number
): [Float32Array, Float32Array, Float32Array] {
  if (window.SharedArrayBuffer === undefined) {
    // Having the array buffers able to be shared across workers should be faster
    // where available.
    window.SharedArrayBuffer = window.ArrayBuffer as any;
  }
  const sizeOfFloat = 4;
  const dest = new Float32Array(
    new SharedArrayBuffer((width + 2) * (height + 3) * sizeOfFloat)
  );
  const destSq = new Float32Array(
    new SharedArrayBuffer((width + 2) * (height + 3) * sizeOfFloat)
  );
  const destTilt = new Float32Array(
    new SharedArrayBuffer((width + 2) * (height + 3) * sizeOfFloat)
  );
  const w2 = width + 2;

  //Todo: pass in reasonable values for min/max
  let vMin = source[0];
  let vMax = source[0];
  for (let i = 0; i < width * height; i++) {
    vMin = Math.min(vMin, source[i]);
    vMax = Math.max(vMax, source[i]);
  }
  vMin += sensorCorrection;
  vMax += sensorCorrection;

  let rescale = 1; //255/(vMax-vMin);

  for (let y = 0; y <= height; y++) {
    let runningSum = 0;
    let runningSumSq = 0;
    for (let x = 0; x <= width; x++) {
      const indexS = Math.min(y, height - 1) * width + Math.min(x, width - 1);
      const indexD = (y + 2) * w2 + (x + 1);
      const value = (source[indexS] + sensorCorrection - vMin) * rescale;

      runningSum += value;
      runningSumSq += value * value;

      dest[indexD] = dest[indexD - w2] + runningSum;
      destSq[indexD] = destSq[indexD - w2] + runningSumSq;
      let tiltValue = value;
      tiltValue -= destTilt[indexD - w2 - w2];
      tiltValue += destTilt[indexD - w2 - 1];
      tiltValue += destTilt[indexD - w2 + 1];
      if (y > 0) {
        tiltValue +=
          (source[indexS - width] + sensorCorrection - vMin) * rescale;
      }
      destTilt[indexD] = tiltValue;
    }
  }
  return [dest, destSq, destTilt];
}

const WorkerPool: Worker[] = [];

export async function scanHaarParallel(
  cascade: HaarCascade,
  satData: Float32Array[],
  frameWidth: number,
  frameHeight: number,
  sensorCorrection: number
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
      new Promise(function (resolve, reject) {
        let terminationTimer = -1;
        // Kill the worker if it takes longer than a frame
        let timeout = 1000 / 8.7;
        if (WorkerPool.length === 0) {
          const worker = new Worker("../js/eval-haar-worker.js", {
            type: "module",
          });
          // Copying the HaarCascade data to the worker each frame has significant overhead,
          // so it's better to just do it once when we init the worker, as the data is constant.
          worker.postMessage({ type: "init", cascade });
          WorkerPool.push(worker);
          // Allow a longer timeout before terminating if the worker has just been created.
          timeout = 1000;
        }
        let worker = WorkerPool.pop() as Worker;
        let s: number;
        worker.onmessage = (r) => {
          clearTimeout(terminationTimer);
          // Mark resolved and return worker to pool.
          // console.log(`resolved worker after ${new Date().getTime() - s}, return to pool`);
          WorkerPool.push(worker);
          resolve(r.data as ROIFeature[]);
        };
        s = new Date().getTime();

        // NOTE(jon): The work can be reasonably evenly divided by each scale we want to search for
        //  features at.  It's possible that we could make some of the scales happen in serial in a
        //  single worker, and have less workers, as some scales always take much longer than others.
        worker.postMessage({
          type: "eval",
          scale,
          frameWidth,
          frameHeight,
          satData,
          s,
        });
        // Terminate the worker if it takes too long?
        terminationTimer = setTimeout(() => {
          console.log(
            `terminating slow worker after ${new Date().getTime() - s}`
          );
          worker.terminate();
          reject([]);
        }, timeout);
      })
    );
  }
  try {
    let results: ROIFeature[][] = await Promise.all(
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
        // The result that comes back from the worker is just a plain JS object, so we
        // need to recreate the ROIFeature from it to use its methods.  Maybe just better
        // to have some standalone function to do the merge?
        const m = new ROIFeature();
        m.x0 = mergedResult.x0;
        m.y0 = mergedResult.y0;
        m.x1 = mergedResult.x1;
        m.y1 = mergedResult.y1;
        m.mergeCount = mergedResult.mergeCount;

        // NOTE(jon): I don't quite understand what tryMerge is trying to do, with its mergeCount etc.
        if (m.tryMerge(r.x0, r.y0, r.x1, r.y1)) {
          didMerge = true;
          break;
        }
      }

      if (!didMerge) {
        result.push(r);
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

export function ConvertCascadeXML(source: Document): HaarCascade | null {
  let result = new HaarCascade();
  let stages = source.getElementsByTagName("stages").item(0);
  let features = source.getElementsByTagName("features").item(0);

  if (stages == null || features == null) {
    return null;
  }

  for (
    let featureIndex = 0;
    featureIndex < features.childNodes.length;
    featureIndex++
  ) {
    let currentFeature = features.childNodes[featureIndex] as HTMLElement;
    if (currentFeature.childElementCount === undefined) {
      continue;
    }

    let feature: HaarFeature = new HaarFeature();
    let tiltedNode = currentFeature.getElementsByTagName("tilted")[0];
    feature.tilted = tiltedNode.textContent == "1";

    let rectsNode = currentFeature.getElementsByTagName("rects")[0];
    for (let i = 0; i < rectsNode.childNodes.length; i++) {
      let cc = rectsNode.childNodes[i];
      if (cc.textContent == null) {
        continue;
      }
      let qq = cc.textContent.trim().split(" ");
      if (qq.length != 5) {
        continue;
      }
      let halfWidth = 10 / 2;
      let halfHeight = 10 / 2;
      let haarRect: HaarRect = new HaarRect();
      haarRect.x0 = Number(qq[0]) / halfWidth - 1.0;
      haarRect.y0 = Number(qq[1]) / halfHeight - 1.0;
      haarRect.x1 = haarRect.x0 + Number(qq[2]) / halfWidth;
      haarRect.y1 = haarRect.y0 + Number(qq[3]) / halfHeight;
      haarRect.weight = Number(qq[4]);
      feature.rects.push(haarRect);
    }
    // if (feature.tilted) {
    //   result.featuresTilted.push(feature);
    // } else {
    result.features.push(feature);
    //}
  }

  for (
    let stageIndex = 0;
    stageIndex < stages.childNodes.length;
    stageIndex++
  ) {
    let currentStage = stages.childNodes[stageIndex] as HTMLElement;
    if (currentStage.childElementCount === undefined) {
      continue;
    }
    let stage: HaarStage = new HaarStage();

    let stageThresholdNode = currentStage.getElementsByTagName(
      "stageThreshold"
    )[0];
    stage.stageThreshold = Number(stageThresholdNode.textContent);

    let weakClassifiersNode = currentStage.getElementsByTagName(
      "weakClassifiers"
    )[0];
    let internalNodesNode = weakClassifiersNode.getElementsByTagName(
      "internalNodes"
    );
    let leafValuesNode = weakClassifiersNode.getElementsByTagName("leafValues");
    for (let i = 0; i < internalNodesNode.length; i++) {
      let txc1 = internalNodesNode[i].textContent;
      let txc2 = leafValuesNode[i].textContent;
      if (txc1 == null) {
        continue;
      }
      if (txc2 == null) {
        continue;
      }

      const internalNodes = txc1.trim().split(" ").map(Number);
      const leafValues = txc2.trim().split(" ").map(Number);
      stage.weakClassifiers.push(
        new HaarWeakClassifier(
          internalNodes,
          leafValues,
          result.features[internalNodes[2]]
        )
      );
    }
    result.stages.push(stage);
  }

  return result;
}
