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
  // cv.bitwise_not(orig, gray, gray);

  let cropRect = new cv.Rect(rect.x0, rect.y0, rect.width(), rect.height());

  let cropped = orig.roi(cropRect);
  orig.delete();
  return cropped;
}

export function threshold(
  roi: cv.Mat,
  minTemp: number,
  rect: ROIFeature,
  thermalRef: ROIFeature
) {
  let normed = new cv.Mat();
  cv.normalize(roi, normed, 0, 255, cv.NORM_MINMAX, cv.CV_8UC1);

  // normalize first otherwise messes up the normalization
  if (minTemp) {
    for (let i = 0; i < roi.data32F.length; i++) {
      if (roi.data32F[i] < minTemp) {
        normed.data[i] = 0;
      }
    }
  }

  // black out the thermal
  if (thermalRef && rect.overlapsROI(thermalRef)) {
    const enlarge = 5;
    let startX = ~~(Math.max(thermalRef.x0 - enlarge, rect.x0) - rect.x0);
    let endX = ~~(Math.min(thermalRef.x1 + enlarge, rect.x1) - rect.x0);
    let startY = ~~(Math.max(thermalRef.y0 - enlarge, rect.y0) - rect.y0);
    let endY = ~~(Math.min(thermalRef.y1 + enlarge, rect.y1) - rect.y0);
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        normed.data[y * normed.rows + x] = 0;
      }
    }
    console.log("zero the thermal ref", normed);
  }

  cv.threshold(normed, normed, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);
  let kernel = new cv.Mat.ones(3, 3, cv.CV_8U);
  cv.morphologyEx(normed, normed, cv.MORPH_OPEN, kernel);
  cv.imshow("grey_canvas", normed);

  roi.delete();
  kernel.delete();
  return normed;
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
  hierarchy.delete();
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
