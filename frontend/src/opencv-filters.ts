// @ts-nocheck
import { ROIFeature } from "@/feature-detection";
export function crop(
  data: Float32Array,
  height: number,
  width: number,
  rect: ROIFeature
): cv.Mat {
  const orig = cv.matFromArray(height, width, cv.CV_32FC1, data);
  const cropRect = new cv.Rect(rect.x0, rect.y0, rect.width(), rect.height());

  const cropped = orig.roi(cropRect);
  orig.delete();
  return cropped;
}

export function threshold(
  roi: cv.Mat,
  rect: ROIFeature,
  thermalRef: ROIFeature | null
): cv.Mat {
  const normed = new cv.Mat();
  cv.normalize(roi, normed, 0, 255, cv.NORM_MINMAX, cv.CV_8UC1);

  // black out the thermal ref
  if (thermalRef && rect.overlapsROI(thermalRef)) {
    const enlarge = 5;
    const startX = ~~(Math.max(thermalRef.x0 - enlarge, rect.x0) - rect.x0);
    const endX = ~~(Math.min(thermalRef.x1 + enlarge, rect.x1) - rect.x0);
    const startY = ~~(Math.max(thermalRef.y0 - enlarge, rect.y0) - rect.y0);
    const endY = ~~(Math.min(thermalRef.y1 + enlarge, rect.y1) - rect.y0);
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        normed.data[y * normed.rows + x] = 0;
      }
    }
  }

  cv.threshold(normed, normed, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);
  const kernel = cv.Mat.ones(5, 5, cv.CV_8U);
  cv.morphologyEx(normed, normed, cv.MORPH_OPEN, kernel);

  // test canvas
  // cv.imshow("grey_canvas", normed);

  roi.delete();
  kernel.delete();
  return normed;
}

export function getContourData(roi: cv.Mat): cv.Mat {
  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();

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
