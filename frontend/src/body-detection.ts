import { distance, Point } from "@/geom";
export interface FaceInfo {
  halfwayRatio: number;
  headLock: number;
  isValid: boolean;
  samplePoint: Point;
  sampleValue: number;
  head: {
    topLeft: Point;
    topRight: Point;
    bottomLeft: Point;
    bottomRight: Point;
  };
}

interface MotionStats {
  motion: number;
  thresholded: number;
  motionPlusThreshold: number;
  actionInBottomHalf: number;
}
// Face specific stuff

export function faceIsFrontOn(face: FaceInfo): boolean {
  // Face should be full inside frame, or at least forehead should be.
  // Face should be front-on symmetry wise
  return face.headLock !== 0;
}

export function faceArea(face: FaceInfo): number {
  // TODO(jon): Could give actual pixel area of face too?
  const width = distance(face.head.bottomLeft, face.head.bottomRight);
  const height = distance(face.head.bottomLeft, face.head.topLeft);
  return width * height;
}

export function faceHasMovedOrChangedInSize(
  face: FaceInfo,
  prevFace: FaceInfo | null
): boolean {
  if (!prevFace) {
    return true;
  }
  if (!faceIsFrontOn(prevFace)) {
    return true;
  }
  // Now check relative sizes of faces.
  const prevArea = faceArea(prevFace);
  const nextArea = faceArea(face);
  const diffArea = Math.abs(nextArea - prevArea);
  const changedArea = diffArea > 150;
  if (changedArea) {
    /// console.log('area changed too much');
    return true;
  }
  const dTL = distance(face.head.topLeft, prevFace.head.topLeft);
  const dTR = distance(face.head.topRight, prevFace.head.topRight);
  const dBL = distance(face.head.bottomLeft, prevFace.head.bottomLeft);
  const dBR = distance(face.head.bottomRight, prevFace.head.bottomRight);
  const maxMovement = Math.max(dTL, dTR, dBL, dBR);
  if (maxMovement > 10) {
    /// console.log('moved too much', maxMovement);
    return true;
  }
  return false;
}

export const motionBit = 1 << 7;
export const thresholdBit = 1 << 6;
export const edgeBit = 1 << 5;
