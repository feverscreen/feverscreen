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

export function crop(
  data: Float32Array,
  height: number,
  width: number,
  rect: ROIFeature
): cv.Mat {
  let orig = cv.matFromArray(height, width, cv.CV_32FC1, data);
  let cropRect = new cv.Rect(rect.x0, rect.y0, rect.width(), rect.height());
  return orig.roi(cropRect);
}

export function otsus(roi: cv.Mat, minTemp: number) {
  // let gray = cv.matFromArray(height, width, cv.CV_32FC1, data);
  let kernel = new cv.Mat.ones(3, 3, cv.CV_8U);
  if (minTemp) {
    for (let i = 0; i < roi.data32F.length; i++) {
      if (roi.data32F[i] < minTemp) {
        roi.data32F[i] = 0;
      }
    }
  }
  cv.normalize(roi, roi, 0, 255, cv.NORM_MINMAX);
  roi.convertTo(roi, cv.CV_8UC1);

  cv.threshold(roi, roi, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);
  cv.morphologyEx(roi, roi, cv.MORPH_OPEN, kernel);
  // cv.bitwise_not(orig, gray, gray);
  // cv.normalize(gray, gray, 0, 255, cv.NORM_MINMAX);
  // cv.imshow("main_canvas", roi);
  // throw "Exepct";
  return roi;
}

export function getContourData(roi: cv.Mat) {
  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();

  cv.findContours(
    roi,
    contours,
    hierarchy,
    cv.RETR_EXTERNAL,
    cv.CHAIN_APPROX_NONE
  );
  // let dst = cv.Mat.zeros(roi.rows, roi.cols, cv.CV_8UC3);
  // for (let i = 0; i < contours.size(); ++i) {
  //   let color = new cv.Scalar(
  //     Math.round(Math.random() * 255),
  //     Math.round(Math.random() * 255),
  //     Math.round(Math.random() * 255)
  //   );
  //   cv.drawContours(dst, contours, i, color, 1, 8, hierarchy, 0);
  // }
  return contours;
}
//
// export function otsus(data: Float32Array, height: number, width: number) {
//   let orig = cv.matFromArray(height, width, cv.CV_32FC1, data);
//   // let gray = cv.matFromArray(height, width, cv.CV_32FC1, data);
//   let kernel = new cv.Mat.ones(3, 3, cv.CV_8U);
//   cv.normalize(orig, orig, 0, 255, cv.NORM_MINMAX);
//   orig.convertTo(orig, cv.CV_8UC1);
//   cv.threshold(orig, orig, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);
//   cv.morphologyEx(orig, orig, cv.MORPH_OPEN, kernel);
//   // cv.bitwise_not(orig, gray, gray);
//   // cv.normalize(gray, gray, 0, 255, cv.NORM_MINMAX);
//   cv.imshow("main_canvas", orig);
//   // throw "Exepct";
//   return orig.data;
// }
