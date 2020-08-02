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
