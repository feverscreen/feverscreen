import { HaarCascade, HaarFeature } from "./haarcascade.js";
import { ROIFeature } from "./processing.js";

const XBorder = 1;
const YBorder = 2;
let Cascade: HaarCascade;

function evalHaar(
  satData: Float32Array[],
  mx: number,
  my: number,
  scale: number,
  frameWidth: number,
  frameHeight: number
) {
  let w2 = frameWidth + YBorder;
  let bx0 = ~~(mx + XBorder - scale);
  let by0 = ~~(my + YBorder - scale);
  let bx1 = ~~(mx + XBorder + scale);
  let by1 = ~~(my + YBorder + scale);
  let sat = satData[0];
  let satSq = satData[1];
  let recipArea = 1.0 / ((bx1 - bx0) * (by1 - by0));
  let sumB =
    recipArea *
    (sat[bx1 + by1 * w2] -
      sat[bx0 + by1 * w2] -
      sat[bx1 + by0 * w2] +
      sat[bx0 + by0 * w2]);
  let sumBSq =
    recipArea *
    (satSq[bx1 + by1 * w2] -
      satSq[bx0 + by1 * w2] -
      satSq[bx1 + by0 * w2] +
      satSq[bx0 + by0 * w2]);

  let determinant = sumBSq - sumB * sumB;
  if (determinant < 1024) {
    return -1;
  }

  let sd = Math.sqrt(determinant);

  for (let i = 0; i < Cascade.stages.length; i++) {
    let stage = Cascade.stages[i];
    let stageSum = 0;
    for (const weakClassifier of stage.weakClassifiers) {
      let ev = evaluateFeature(
        weakClassifier.feature,
        satData,
        frameWidth,
        frameHeight,
        mx,
        my,
        scale
      );

      if (ev * recipArea < weakClassifier.internalNodes[3] * sd) {
        stageSum += weakClassifier.leafValues[0];
      } else {
        stageSum += weakClassifier.leafValues[1];
      }
    }
    if (stageSum < stage.stageThreshold) {
      return i;
    }
  }
  return 1000;
}

function evaluateFeature(
  feature: HaarFeature,
  satData: Float32Array[],
  width: number,
  height: number,
  mx: number,
  my: number,
  scale: number
) {
  const w2 = width + 2;
  let result: number = 0;
  let sat = satData[0];
  if (feature.tilted) {
    let tilted = satData[2];
    for (const r of feature.rects) {
      let value = 0;
      let rw = r.x1 - r.x0;
      let rh = r.y1 - r.y0;
      let x1 = ~~(mx + 1 + scale * r.x0);
      let y1 = ~~(my + 1 + scale * r.y0);
      let x2 = ~~(mx + 1 + scale * (r.x0 + rw));
      let y2 = ~~(my + 1 + scale * (r.y0 + rw));
      let x3 = ~~(mx + 1 + scale * (r.x0 - rh));
      let y3 = ~~(my + 1 + scale * (r.y0 + rh));
      let x4 = ~~(mx + 1 + scale * (r.x0 + rw - rh));
      let y4 = ~~(my + 1 + scale * (r.y0 + rw + rh));

      value += tilted[x4 + y4 * w2];
      value -= tilted[x3 + y3 * w2];
      value -= tilted[x2 + y2 * w2];
      value += tilted[x1 + y1 * w2];
      result += value * r.weight;
    }
  } else {
    for (const r of feature.rects) {
      let value = 0;
      let x0 = ~~(mx + XBorder + r.x0 * scale);
      let y0 = ~~(my + YBorder + r.y0 * scale);
      let x1 = ~~(mx + XBorder + r.x1 * scale);
      let y1 = ~~(my + YBorder + r.y1 * scale);

      value += sat[x0 + y0 * w2];
      value -= sat[x0 + y1 * w2];
      value -= sat[x1 + y0 * w2];
      value += sat[x1 + y1 * w2];

      result += value * r.weight;
    }
  }
  return result;
}

onmessage = function(event) {
  switch (event.data.type) {
    case "eval":
      const {
        scale,
        frameWidth,
        frameHeight,
        satData,
        s
      }: {
        scale: number;
        frameWidth: number;
        frameHeight: number;
        satData: Float32Array[];
        s: number;
      } = event.data;
      // console.log(`message passing took ${new Date().getTime() - s}`);
      const result = evalAtScale(scale, frameWidth, frameHeight, satData);
      // @ts-ignore
      postMessage(result);
      break;
    case "init":
      Cascade = event.data.cascade;
      break;
  }
  return;
};

function evalAtScale(
  scale: number,
  frameWidth: number,
  frameHeight: number,
  satData: Float32Array[]
): ROIFeature[] {
  // console.log(`work startup time ${new Date().getTime() - s}`);
  const result = [];
  const skipper = Math.max(1, scale * 0.05);
  for (
    let x = XBorder + scale;
    x + scale + XBorder < frameWidth;
    x += skipper
  ) {
    for (
      let y = YBorder + scale;
      y + scale + YBorder < frameHeight;
      y += skipper
    ) {
      let ev = evalHaar(satData, x, y, scale, frameWidth, frameHeight);
      // Merging can be done later?
      if (ev > 999) {
        let r = new ROIFeature();
        r.flavor = "Face";
        r.x0 = x - scale;
        r.y0 = y - scale;
        r.x1 = x + scale;
        r.y1 = y + scale;
        let didMerge = false;

        for (let k = 0; k < result.length; k++) {
          if (result[k].tryMerge(r.x0, r.y0, r.x1, r.y1)) {
            didMerge = true;
            break;
          }
        }

        if (!didMerge) {
          result.push(r);
        }
      }
    }
  }
  // console.log(`work took ${new Date().getTime() - s}`);
  return result;
}
