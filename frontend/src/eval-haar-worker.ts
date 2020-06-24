// NOTE: These classes need to be duplicated here, because the worker needs to be fully self-contained, or webpack hangs...

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
  tilted: Boolean;
}
enum FeatureState {
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
class ROIFeature {
  constructor() {
    this.flavor = "None";
    this.x0 = 0;
    this.y0 = 0;
    this.x1 = 0;
    this.y1 = 0;
    this.mergeCount = 1;
    this.sensorAge = 0;
    this.sensorMissing = 0;
    this.sensorValue = 0;
    this.sensorValueLowPass = 0;
    this.sensorX = 0;
    this.sensorY = 0;
    this.state = FeatureState.None;
  }

  extend(value: number, maxWidth: number, maxHeight: number): ROIFeature {
    let roi = new ROIFeature();
    roi.x0 = Math.max(0, this.x0 - value);
    roi.x1 = Math.min(maxWidth, this.x1 + value);
    roi.y0 = Math.max(0, this.y0 - value);
    roi.y1 = Math.min(maxHeight, this.y1 + value);
    roi.flavor = this.flavor;
    return roi;
  }

  onEdge(): boolean {
    return (
      this.state == FeatureState.BottomEdge ||
      this.state == FeatureState.TopEdge ||
      this.state == FeatureState.LeftEdge ||
      this.state == FeatureState.RightEdge
    );
  }
  wider(other: ROIFeature | null | undefined): boolean {
    return !other || this.width() > other.width();
  }

  higher(other: ROIFeature | null | undefined): boolean {
    return !other || this.height() > other.height();
  }

  hasXValues() {
    return this.x0 != -1 && this.x1 != -1;
  }

  hasYValues() {
    return this.y0 != -1 && this.y1 != -1;
  }

  midX() {
    return (this.x0 + this.x1) / 2;
  }
  midY() {
    return (this.y0 + this.y1) / 2;
  }

  width() {
    return this.x1 - this.x0;
  }

  height() {
    return this.y1 - this.y0;
  }

  overlapsROI(other: ROIFeature): boolean {
    return this.overlap(other.x0, other.y0, other.x1, other.y1);
  }

  overlap(x0: number, y0: number, x1: number, y1: number) {
    if (x1 <= this.x0) {
      return false;
    }
    if (y1 <= this.y0) {
      return false;
    }
    if (this.x1 <= x0) {
      return false;
    }
    if (this.y1 <= y0) {
      return false;
    }
    return true;
  }

  contains(x: number, y: number) {
    if (x <= this.x0) {
      return false;
    }
    if (y <= this.y0) {
      return false;
    }
    if (this.x1 < x) {
      return false;
    }
    if (this.y1 < y) {
      return false;
    }
    return true;
  }
  tryMerge(x0: number, y0: number, x1: number, y1: number, mergeCount: number = 1) {
    if (!this.overlap(x0, y0, x1, y1)) {
      return false;
    }
    const newMerge = mergeCount + this.mergeCount;
    this.x0 = (this.x0 * this.mergeCount + x0 * mergeCount) / newMerge;
    this.y0 = (this.y0 * this.mergeCount + y0 * mergeCount) / newMerge;
    this.x1 = (this.x1 * this.mergeCount + x1 * mergeCount) / newMerge;
    this.y1 = (this.y1 * this.mergeCount + y1 * mergeCount) / newMerge;
    this.mergeCount = newMerge;
    return true;
  }
  state: FeatureState;
  flavor: string;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  mergeCount: number;
  sensorValue: number;
  sensorValueLowPass: number;
  sensorAge: number;
  sensorMissing: number;
  sensorX: number;
  sensorY: number;
}

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

class HaarCascade {
  constructor() {
    this.stages = [];
    this.features = [];
  }

  stages: HaarStage[];
  features: HaarFeature[];
}

const ctx: Worker = self as any;
let Cascade: HaarCascade;

function evalHaar(
  satData: Float32Array[],
  mx: number,
  my: number,
  scale: number,
  frameWidth: number,
  frameHeight: number
) {
  let w2 = frameWidth + 2;
  let bx0 = ~~(mx + 1 - scale);
  let by0 = ~~(my + 2 - scale);
  let bx1 = ~~(mx + 1 + scale);
  let by1 = ~~(my + 2 + scale);
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

  let sd = Math.sqrt(Math.max(10, determinant));

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
      let x0 = ~~(mx + 1 + r.x0 * scale);
      let y0 = ~~(my + 2 + r.y0 * scale);
      let x1 = ~~(mx + 1 + r.x1 * scale);
      let y1 = ~~(my + 2 + r.y1 * scale);

      value += sat[x0 + y0 * w2];
      value -= sat[x0 + y1 * w2];
      value -= sat[x1 + y0 * w2];
      value += sat[x1 + y1 * w2];

      result += value * r.weight;
    }
  }
  return result;
}
ctx.addEventListener("message", event => {
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
      ctx.postMessage(result);
      break;
    case "init":
      Cascade = event.data.cascade;
      break;
  }
  return;
});

function evalAtScale(
  scale: number,
  frameWidth: number,
  frameHeight: number,
  satData: Float32Array[]
): ROIFeature[] {
  // console.log(`work startup time ${new Date().getTime() - s}`);
  const result = [];
  const border = 2;
  const skipper = scale * 0.05;
  for (let x = border + scale; x + scale + border < frameWidth; x += skipper) {
    for (
      let y = border + scale;
      y + scale + border < frameHeight;
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
