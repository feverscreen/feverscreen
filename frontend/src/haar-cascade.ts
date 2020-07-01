import { ROIFeature } from "@/feature-detection";
import HaarWorker from "worker-loader!./eval-haar-worker";

const DEBUG = false;

class HaarWeakClassifier {
  constructor(
    public internalNodes: number[],
    public leafValues: number[],
    public feature: HaarFeature
  ) {}
}

class HaarStage {
  constructor() {
    this.stageThreshold = 0;
    this.weakClassifiers = [];
  }
  stageThreshold: number;
  weakClassifiers: HaarWeakClassifier[];
}

class HaarRect {
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

class HaarFeature {
  constructor() {
    this.rects = [];
    this.tilted = false;
  }
  rects: HaarRect[];
  tilted: boolean;
}

export class HaarCascade {
  constructor() {
    this.stages = [];
    this.features = [];
  }

  stages: HaarStage[];
  features: HaarFeature[];
}

function convertCascadeXML(source: Document): HaarCascade {
  const result = new HaarCascade();
  const stages = source.getElementsByTagName("stages").item(0);
  const features = source.getElementsByTagName("features").item(0);

  if (stages == null || features == null) {
    throw new Error("Invalid HaarCascade XML Data");
  }
  const widthElement = source.getElementsByTagName("width")[0];
  const heightElement = source.getElementsByTagName("height")[0];
  const width = widthElement ? Number(widthElement.textContent) : 10;
  const height = heightElement ? Number(heightElement.textContent) : 10;

  for (
    let featureIndex = 0;
    featureIndex < features.childNodes.length;
    featureIndex++
  ) {
    const currentFeature = features.childNodes[featureIndex] as HTMLElement;
    if (currentFeature.childElementCount === undefined) {
      continue;
    }

    const feature: HaarFeature = new HaarFeature();
    if (currentFeature.getElementsByTagName("tilted").length > 0) {
      const tiltedNode = currentFeature.getElementsByTagName("tilted")[0];
      feature.tilted = tiltedNode.textContent == "1";
    }

    const rectsNode = currentFeature.getElementsByTagName("rects")[0];
    for (let i = 0; i < rectsNode.childNodes.length; i++) {
      const cc = rectsNode.childNodes[i];
      if (cc.textContent == null) {
        continue;
      }
      const qq = cc.textContent.trim().split(" ");
      if (qq.length != 5) {
        continue;
      }
      const halfWidth = width / 2;
      const halfHeight = height / 2;
      const haarRect: HaarRect = new HaarRect();
      haarRect.x0 = Number(qq[0]) / halfWidth - 1.0;
      haarRect.y0 = Number(qq[1]) / halfHeight - 1.0;
      haarRect.x1 = haarRect.x0 + Number(qq[2]) / halfWidth;
      haarRect.y1 = haarRect.y0 + Number(qq[3]) / halfHeight;
      haarRect.weight = Number(qq[4]);
      feature.rects.push(haarRect);
    }
    result.features.push(feature);
  }

  for (
    let stageIndex = 0;
    stageIndex < stages.childNodes.length;
    stageIndex++
  ) {
    const currentStage = stages.childNodes[stageIndex] as HTMLElement;
    if (currentStage.childElementCount === undefined) {
      continue;
    }
    const stage: HaarStage = new HaarStage();

    const stageThresholdNode = currentStage.getElementsByTagName(
      "stageThreshold"
    )[0];
    stage.stageThreshold = Number(stageThresholdNode.textContent);

    const weakClassifiersNode = currentStage.getElementsByTagName(
      "weakClassifiers"
    )[0];
    const internalNodesNode = weakClassifiersNode.getElementsByTagName(
      "internalNodes"
    );
    const leafValuesNode = weakClassifiersNode.getElementsByTagName(
      "leafValues"
    );
    for (let i = 0; i < internalNodesNode.length; i++) {
      const txc1 = internalNodesNode[i].textContent;
      const txc2 = leafValuesNode[i].textContent;
      if (txc1 == null) {
        continue;
      }
      if (txc2 == null) {
        continue;
      }

      const internalNodes = txc1
        .trim()
        .split(" ")
        .map(Number);
      const leafValues = txc2
        .trim()
        .split(" ")
        .map(Number);
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

export async function loadFaceRecognitionModel(
  source: string
): Promise<HaarCascade> {
  const modelResponse = await fetch(source);
  const xmlDoc = new DOMParser().parseFromString(
    await modelResponse.text(),
    "text/xml"
  );
  return convertCascadeXML(xmlDoc);
}

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

export function buildSAT(
  source: Float32Array,
  width: number,
  height: number,
  thermalReference: ROIFeature
): [Float32Array, Float32Array, Float32Array] {
  if (window.SharedArrayBuffer === undefined) {
    // Having the array buffers able to be shared across workers should be faster
    // where available.

    window.SharedArrayBuffer = window.ArrayBuffer as any;
  }

  let thermalRefTemp = 0;

  if (thermalReference) {
    thermalReference = thermalReference.extend(5, height, width);
    // get the values on edge and use them to "black out" the thermal ref
    let count = 0;
    for (let y = thermalReference.y0; y <= ~~thermalReference.y1; y++) {
      thermalRefTemp += source[y * width + ~~thermalReference.x0];
      thermalRefTemp += source[y * width + ~~thermalReference.x1];
      count += 2;
    }

    if (count > 0) {
      thermalRefTemp = thermalRefTemp / count;
    }
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
  let vMin = source[0];
  let vMax = source[0];
  for (let i = 0; i < width * height; i++) {
    vMin = Math.min(vMin, source[i]);
    vMax = Math.max(vMax, source[i]);
  }
  // repeat top row twice
  for (let y = -2; y <= height; y++) {
    let runningSum = 0;
    let runningSumSq = 0;
    for (let x = -1; x <= width; x++) {
      const indexD = (y + 2) * w2 + x + 1;
      const sourceY = Math.min(Math.max(y, 0), height - 1);
      const sourceX = Math.min(Math.max(x, 0), width - 1);

      const indexS = sourceY * width + sourceX;

      let value;
      if (thermalReference && thermalReference.contains(sourceX, sourceY)) {
        value = thermalRefTemp - vMin; //set to min
      } else {
        value = source[indexS] - vMin;
      }

      runningSum += value;
      runningSumSq += value * value;

      const prevValue = y > -2 ? dest[indexD - w2] : 0;
      const prevSquared = y > -2 ? destSq[indexD - w2] : 0;
      dest[indexD] = prevValue + runningSum;
      destSq[indexD] = prevSquared + runningSumSq;
      let tiltValue = value;
      let valueAbove = 0;
      if (y > -2) {
        //gp missing something here about the rotated titl values feels
        //like this should +=
        tiltValue -= y >= 0 ? destTilt[indexD - w2 - w2] : 0;
        tiltValue += x > -1 ? destTilt[indexD - w2 - 1] : 0;
        tiltValue += destTilt[indexD - w2 + 1];
        if (
          thermalReference &&
          thermalReference.contains(sourceX, Math.max(sourceY - 1, 0))
        ) {
          valueAbove = value;
        } else {
          valueAbove = y > 0 ? source[indexS - width] : source[indexS];
          valueAbove = valueAbove - vMin;
        }
      }
      tiltValue += valueAbove;
      destTilt[indexD] = tiltValue;
    }
  }
  return [dest, destSq, destTilt];
}
