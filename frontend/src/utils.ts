import { PADDING_TOP_OFFSET } from "@/types";

export const BlobReader = (function(): {
  arrayBuffer: (blob: Blob) => Promise<ArrayBuffer>;
} {
  // For comparability with older browsers/iOS that don't yet support arrayBuffer()
  // directly off the blob object
  const arrayBuffer: (blob: Blob) => Promise<ArrayBuffer> =
    "arrayBuffer" in Blob.prototype &&
    typeof (Blob.prototype as Blob)["arrayBuffer"] === "function"
      ? (blob: Blob) => blob["arrayBuffer"]()
      : (blob: Blob) =>
          new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.addEventListener("load", () => {
              resolve(fileReader.result as ArrayBuffer);
            });
            fileReader.addEventListener("error", () => {
              reject();
            });
            fileReader.readAsArrayBuffer(blob);
          });

  return {
    arrayBuffer
  };
})();

export class DegreesCelsius {
  public val: number;
  constructor(val: number) {
    this.val = val;
  }
  public toString(): string {
    return `${this.val.toFixed(1)}°`;
  }
}

export const getHistogram = (
  data: Float32Array,
  numBuckets: number
): { histogram: Uint16Array; min: number; max: number } => {
  // Find find the total range of the data
  let max = 0;
  let min = Number.MAX_SAFE_INTEGER;
  for (let i = 0; i < data.length; i++) {
    const f32Val = data[i];
    if (f32Val < min) {
      min = f32Val;
    }
    if (f32Val > max) {
      max = f32Val;
    }
  }

  // A histogram with 16 buckets seems sufficiently coarse for this
  // The histogram is usually bi-modal, so we want to find the trough between the two peaks as our threshold value
  const histogram = new Uint16Array(numBuckets);
  for (let i = 0; i < data.length; i++) {
    // If within a few degrees of constant heat-source white else black.
    const v = ((data[i] - min) / (max - min)) * numBuckets;
    histogram[Math.floor(v)] += 1;
  }
  return {
    histogram,
    min,
    max
  };
};

export const getAdaptiveThreshold = (data: Float32Array): number => {
  const { histogram, min, max } = getHistogram(data, 16);
  let peak0Max = 0;
  let peak1Max = 0;
  let peak0Index = 0;
  let peak1Index = 0;
  // First, find the peak value, which is usually in the background temperature range.
  for (let i = 0; i < histogram.length; i++) {
    if (histogram[i] > peak0Max) {
      peak0Max = histogram[i];
      peak0Index = i;
    }
  }

  // Need to look for a valley in between the two bimodal peaks, so
  // keep descending from the first peak till we find a local minimum.
  let prevIndex = peak0Index;
  let index = peak0Index + 1;
  while (histogram[index] < histogram[prevIndex]) {
    prevIndex++;
    index++;
  }
  // Now climb up from that valley to find the second peak.
  for (let i = prevIndex; i < histogram.length; i++) {
    if (histogram[i] > peak1Max) {
      peak1Max = histogram[i];
      peak1Index = i;
    }
  }

  // Find the lowest point between the two peaks.
  let valleyMin = peak1Max;
  let valleyIndex = 0;
  for (let i = peak0Index + 1; i < peak1Index; i++) {
    if (histogram[i] < valleyMin) {
      valleyMin = histogram[i];
      valleyIndex = i;
    }
  }
  const range = max - min;
  return min + (range / histogram.length) * valleyIndex + 1;
};

export const temperatureForSensorValue = (
  savedThermalRefValue: number,
  rawValue: number,
  currentThermalRefValue: number
): DegreesCelsius => {
  return new DegreesCelsius(
    savedThermalRefValue + (rawValue - currentThermalRefValue) * 0.01
  );
};
export const ZeroCelsiusInKelvin = 273.15;
export const mKToCelsius: (val: number) => DegreesCelsius = (mkVal: number) =>
  new DegreesCelsius(mkVal * 0.01 - ZeroCelsiusInKelvin);
