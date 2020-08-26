import { Frame } from "./camera";
import SmoothingWorker from "worker-loader!./smoothing-worker";

interface SmoothedImages {
  medianSmoothed: Float32Array;
  radialSmoothed: Float32Array;
  thresholded: Uint8Array;
  threshold: number;
  min: number;
  max: number;
}
const smoothingWorker = new SmoothingWorker();

export const processSensorData = async (
  sensorData: Frame
): Promise<SmoothedImages> => {
  return new Promise(function(resolve, reject) {
    smoothingWorker.onmessage = r => {
      resolve(r.data as SmoothedImages);
    };
    smoothingWorker.postMessage({
      frame: sensorData.frame,
      width: sensorData.frameInfo.Camera.ResX,
      height: sensorData.frameInfo.Camera.ResY
    });
  });
};

const rotate90u8 = (
  src: Uint8Array,
  dest: Uint8Array,
  width: number,
  height: number
): Uint8Array => {
  let i = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      dest[x * height + y] = src[i];
      i++;
    }
  }
  return dest;
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
