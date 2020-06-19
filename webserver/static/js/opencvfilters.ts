// @ts-nocheck
import { BlobReader } from "./utils.js";

// export function otsus(data: Float32Array, height: number, width: number) {
//   let orig = cv.matFromArray(height, width, cv.CV_32FC1, data);
//   // let gray = cv.matFromArray(height, width, cv.CV_32FC1, data);
//   let kernel = new cv.Mat.ones(3, 3, cv.CV_8U);
//   let gray = new cv.Mat();
//   cv.normalize(orig, orig, 0, 255, cv.NORM_MINMAX);
//   orig.convertTo(orig, cv.CV_8UC1);
//   cv.threshold(orig, gray, 128, 255, cv.THRESH_BINARY & cv.THRESH_OTSU);
//   cv.morphologyEx(gray, gray, cv.MORPH_OPEN, kernel);
//   cv.bitwise_not(orig, gray, gray);
//   cv.normalize(gray, gray, 0, 255, cv.NORM_MINMAX);
//   cv.imshow("main_canvas", gray);
//   // throw "Exepct";
//   return gray.data;
// }
export function otsus(data: Float32Array, height: number, width: number) {
  let orig = cv.matFromArray(height, width, cv.CV_32FC1, data);
  // let gray = cv.matFromArray(height, width, cv.CV_32FC1, data);
  let kernel = new cv.Mat.ones(3, 3, cv.CV_8U);
  cv.normalize(orig, orig, 0, 255, cv.NORM_MINMAX);
  orig.convertTo(orig, cv.CV_8UC1);
  cv.threshold(orig, orig, 128, 255, cv.THRESH_BINARY & cv.THRESH_OTSU);
  cv.morphologyEx(orig, orig, cv.MORPH_OPEN, kernel);
  // cv.bitwise_not(orig, gray, gray);
  // cv.normalize(gray, gray, 0, 255, cv.NORM_MINMAX);
  // cv.imshow("main_canvas", gray);
  // throw "Exepct";
  return orig.data;
}
