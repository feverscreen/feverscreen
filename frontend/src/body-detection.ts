import { RawShape, ScreeningAcceptanceStates, ScreeningState } from "@/types";
import {
  distance,
  faceIntersectsThermalRef,
  HEIGHT,
  narrowestSlanted,
  Point,
  WIDTH,
  add,
  allNeighboursEqual,
  boundsForConvexHull,
  boundsForRawShape,
  boundsForShape,
  closestPoint,
  convexHullForShape,
  distanceSq2,
  drawRawShapesIntoMask,
  drawShapesIntoMask,
  getRawShapes,
  getSolidShapes,
  isNotCeilingHeat,
  joinShapes,
  largestShape,
  localDensity,
  magnitude,
  normalise,
  perp,
  pointIsLeftOfLine,
  RawPoint,
  rawShapeArea,
  scale,
  shapeArea,
  shapesOverlap,
  spanWidth,
  sub,
  widestSpan,
  fastConvexHull
} from "@/geom";
import { ROIFeature } from "@/worker-fns";
import { getHottestSpotInBounds, Shape } from "@/shape-processing";

import DBScan from "./dbscan";
import { raymarchFaceDims } from "./face-detection";
import { edgeDetect } from "@/circle-detection";

export interface FaceInfo {
  halfwayRatio: number;
  headLock: number;
  forehead: {
    bottom: Point;
    bottomLeft: Point;
    bottomRight: Point;
    top: Point;
    topLeft: Point;
    topRight: Point;
  };
  vertical: {
    bottom: Point;
    top: Point;
  };
  horizontal: {
    left: Point;
    right: Point;
    middle: Point;
  };
  head: {
    topLeft: Point;
    topRight: Point;
    bottomLeft: Point;
    bottomRight: Point;
    leftNeckSpan: Point;
    rightNeckSpan: Point;
  };
}

interface MotionStats {
  motion: number;
  thresholded: number;
  motionPlusThreshold: number;
  actionInBottomHalf: number;
}

function advanceScreeningState(
  nextState: ScreeningState,
  prevState: ScreeningState,
  currentCount: number
): { state: ScreeningState; count: number } {
  // We can only move from certain states to certain other states.
  if (prevState !== nextState) {
    const allowedNextState = ScreeningAcceptanceStates[prevState];
    if ((allowedNextState as ScreeningState[]).includes(nextState)) {
      // console.log("Advanced to state", nextState);
      return {
        state: nextState,
        count: 1
      };
    }
  }
  return {
    state: prevState,
    count: currentCount + 1
  };
}

// Face specific stuff

export function faceIsFrontOn(face: FaceInfo): boolean {
  // Face should be full inside frame, or at least forehead should be.
  // Face should be front-on symmetry wise
  return face.headLock !== 0;
}

export function faceArea(face: FaceInfo): number {
  // TODO(jon): Could give actual pixel area of face too?
  const width = distance(face.horizontal.left, face.horizontal.right);
  const height = distance(face.vertical.top, face.vertical.bottom);
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

function advanceState(
  prevMotionStats: MotionStats,
  motionStats: MotionStats,
  face: FaceInfo | null,
  body: Shape | null,
  prevFace: FaceInfo | null,
  screeningState: ScreeningState,
  screeningStateCount: number,
  threshold: number,
  radialSmoothed: Float32Array,
  thermalReference: ROIFeature | null
): {
  prevFace: FaceInfo | null;
  state: ScreeningState;
  count: number;
  event: string;
} {
  let next;
  let event = "";
  //const prevAllMotion = prevMotionStats.motion + prevMotionStats.hotInnerEdge + prevMotionStats.hotInner + prevMotionStats.edge;
  //const allMotion = motionStats.motion + motionStats.hotInnerEdge + motionStats.hotInner + motionStats.edge;
  if (thermalReference === null) {
    next = advanceScreeningState(
      ScreeningState.MISSING_THERMAL_REF,
      screeningState,
      screeningStateCount
    );
  } else if (face !== null) {
    if (screeningState === ScreeningState.MISSING_THERMAL_REF) {
      if (faceArea(face) < 1500) {
        next = advanceScreeningState(
          ScreeningState.TOO_FAR,
          screeningState,
          screeningStateCount
        );
      } else {
        next = advanceScreeningState(
          ScreeningState.LARGE_BODY,
          screeningState,
          screeningStateCount
        );
      }
    } else if (faceArea(face) < 1500) {
      next = advanceScreeningState(
        ScreeningState.TOO_FAR,
        screeningState,
        screeningStateCount
      );
    } else if (faceIntersectsThermalRef(face, thermalReference)) {
      next = advanceScreeningState(
        ScreeningState.LARGE_BODY,
        screeningState,
        screeningStateCount
      );
    } else if (face.headLock !== 0) {
      const temperatureSamplePoint = getHottestSpotInBounds(
        face,
        threshold,
        WIDTH,
        HEIGHT,
        radialSmoothed
      );
      if (
        faceIsFrontOn(face)
        // &&
        // samplePointIsInsideCroppingArea({
        //     x: temperatureSamplePoint.x,
        //     y: temperatureSamplePoint.y
        // })
      ) {
        const faceMoved = faceHasMovedOrChangedInSize(face, prevFace);
        if (faceMoved) {
          screeningStateCount--;
        }
        if (
          screeningState === ScreeningState.FRONTAL_LOCK &&
          !faceMoved &&
          face.headLock === 1 &&
          screeningStateCount > 2 // Needs to be on this state for at least two frames.
        ) {
          next = advanceScreeningState(
            ScreeningState.STABLE_LOCK,
            screeningState,
            screeningStateCount
          );
          if (next.state !== screeningState) {
            // Capture the screening event here
            event = "Captured";
          }
        } else if (screeningState === ScreeningState.STABLE_LOCK) {
          next = advanceScreeningState(
            ScreeningState.LEAVING,
            screeningState,
            screeningStateCount
          );
        } else {
          next = advanceScreeningState(
            ScreeningState.FRONTAL_LOCK,
            screeningState,
            screeningStateCount
          );
        }
      } else {
        // NOTE: Could stay here a while if we're in an FFC event.
        next = advanceScreeningState(
          ScreeningState.FACE_LOCK,
          screeningState,
          screeningStateCount
        );
      }
    } else {
      next = advanceScreeningState(
        ScreeningState.HEAD_LOCK,
        screeningState,
        screeningStateCount
      );
    }
    prevFace = face;
  } else {
    // TODO(jon): Ignore stats around FFC, just say that it's thinking...
    const hasBody =
      motionStats.actionInBottomHalf && motionStats.motionPlusThreshold > 45;
    const prevFrameHasBody =
      prevMotionStats.actionInBottomHalf &&
      prevMotionStats.motionPlusThreshold > 45;
    // TODO(jon): OR the threshold bounds are taller vertically than horizontally?
    if (hasBody) {
      next = advanceScreeningState(
        ScreeningState.LARGE_BODY,
        screeningState,
        screeningStateCount
      );
    } else {
      // Require 2 frames without a body before triggering leave event.
      if (!prevFrameHasBody) {
        if (screeningState === ScreeningState.LEAVING) {
          // Record event now that we have lost the face?
          event = "Recorded";
        }
        next = advanceScreeningState(
          ScreeningState.READY,
          screeningState,
          screeningStateCount
        );
      } else {
        next = advanceScreeningState(
          ScreeningState.LARGE_BODY,
          screeningState,
          screeningStateCount
        );
      }
    }
    prevFace = null;
  }
  return {
    prevFace,
    state: next.state,
    count: next.count,
    event
  };
}
export const motionBit = 1 << 7;
export const thresholdBit = 1 << 6;
export const edgeBit = 1 << 5;

function subtractFrame(
  frame: Float32Array,
  prevFrame: Float32Array | null,
  motionBit: number
): Uint8Array {
  const THRESHOLD_DIFF = 20;
  if (!prevFrame) {
    return new Uint8Array(frame);
  } else {
    const subtracted = new Uint8Array(WIDTH * HEIGHT);
    for (let i = 0; i < subtracted.length; i++) {
      // Also compare with sobel edges?
      // Then do a shrink-wrapped convex hull around the points we have.
      if (Math.abs(frame[i] - prevFrame[i]) > THRESHOLD_DIFF) {
        subtracted[i] |= motionBit;
      }
    }
    return subtracted;
  }
}

export function detectBody(
  sobel: Float32Array,
  thermalReference: ROIFeature | null,
  medianSmoothed: Float32Array,
  radialSmoothed: Float32Array,
  prevRadialSmoothed: Float32Array | null,
  min: number,
  max: number,
  threshold: number,
  thermalRefC: number,
  thermalRefRaw: number
) {
  // IDEA(jon): We can avoid smoothing altogether, and just smooth when we actually take a sample, when it's really cheap.
  // Now take only the edges over a certain intensity?
  let thermalRefRect = { x0: 0, x1: 0, y0: 0, y1: 0 };
  if (thermalReference) {
    const thermalRefCircleWidth = thermalReference.x1 - thermalReference.x0;
    const fudgeFactor = 1;
    const radius = thermalRefCircleWidth * 0.5;

    const thermalRefIsOnLeft = thermalReference.x0 < WIDTH / 2;
    if (thermalRefIsOnLeft) {
      thermalRefRect = {
        x0: Math.max(0, thermalReference.x0 - radius - fudgeFactor),
        x1: Math.min(WIDTH - 1, thermalReference.x1 + radius + fudgeFactor),
        y0: Math.max(0, thermalReference.y0 - radius - fudgeFactor),
        y1: Math.min(HEIGHT - 1, thermalReference.y1 + radius * 5 + fudgeFactor)
      };
    } else {
      thermalRefRect = {
        x0: Math.max(0, thermalReference.x0 - (radius * 1.8 + fudgeFactor)),
        x1: Math.min(
          WIDTH - 1,
          thermalReference.x1 + radius * 1.8 + fudgeFactor
        ),
        y0: Math.max(0, thermalReference.y0 - (radius * 8 + fudgeFactor)),
        y1: HEIGHT - 1
      };
    }
  }
  const thermalRefWidth = thermalRefRect.x1 - thermalRefRect.x0;

  const motionMask = subtractFrame(
    radialSmoothed,
    prevRadialSmoothed,
    motionBit
  );

  //let th = new Uint8Array(120 * 160);
  // Adjust threshold down if higher than the max of 34degrees
  let adjustedThreshold = threshold;
  if (thermalReference) {
    const thresholdTemp = thermalRefC + (threshold - thermalRefRaw) * 0.01;
    if (thresholdTemp > 33) {
      adjustedThreshold = thermalRefRaw - 500;
      // FIXME(jon) Make sure there is enough pixels above the threshold, using the histogram:
    }
  }

  // Remove motion mask bits for motion lines that don't abut thresholds bits
  // for (let y = 0; y < 120; y++) {
  //     for (let x = 0; x < 160; x++) {
  //         const i = y * 120 + x;
  //         const v = motionMask[i];
  //
  //     }
  // }

  // for (let i = 0; i < frame.length; i++) {
  //     if (radialSmoothed[i] > adjustedThreshold) {
  //        motionMask[i] |= thresholdBit;
  //     }
  // }

  // Only apply the threshold bit where the thresholded row contains some motion, if the thresholded row spans the full frame width.
  for (let y = 0; y < HEIGHT; y++) {
    let thresholdSpansWholeRow = true;
    let hasMotion = false;
    for (let x = 0; x < WIDTH; x++) {
      const i = y * WIDTH + x;
      if (!hasMotion && motionMask[i] & motionBit) {
        hasMotion = true;
        if (!thresholdSpansWholeRow) {
          break;
        }
      }
      if (medianSmoothed[i] <= adjustedThreshold) {
        thresholdSpansWholeRow = false;
        if (hasMotion) {
          break;
        }
      }
    }
    if ((thresholdSpansWholeRow && hasMotion) || !thresholdSpansWholeRow) {
      for (let x = 0; x < WIDTH; x++) {
        const i = y * WIDTH + x;
        if (medianSmoothed[i] > adjustedThreshold) {
          motionMask[i] |= thresholdBit;
        }
      }
    }
  }

  if (thermalReference) {
    //const thermalRefWidth = WIDTH - 95;
    // Remove known thermal ref from mask (make this a factory calibration step)
    for (let y = thermalRefRect.y0; y < thermalRefRect.y1; y++) {
      for (let x = thermalRefRect.x0; x < thermalRefRect.x1; x++) {
        const i = y * WIDTH + x;
        motionMask[i] = 0;
      }
    }
  }

  const motionShapes = getRawShapes(motionMask, WIDTH, HEIGHT, motionBit);
  const thresholdShapes = getRawShapes(motionMask, WIDTH, HEIGHT, thresholdBit);
  console.log(
    "Motion",
    motionShapes.length,
    "Threshold",
    thresholdShapes.length
  );

  const filteredMotion = new Set();
  const filteredThreshold = new Set();
  for (const motionShape of motionShapes) {
    for (const thresholdShape of thresholdShapes) {
      if (shapesOverlap(motionShape, thresholdShape)) {
        // Make sure the areas are not long thin horizontal boxes taking up the full frame width,
        const motionShapeArea = rawShapeArea(motionShape);
        const motionShapeBounds = boundsForRawShape(motionShape);
        const motionBoundsFilled =
          (motionShapeBounds.x1 - motionShapeBounds.x0) *
          (motionShapeBounds.y1 + 1 - motionShapeBounds.y0);
        if (
          motionShapeArea / motionBoundsFilled > 0.98 &&
          motionShapeBounds.x0 === 0 &&
          motionShapeBounds.x1 === WIDTH
        ) {
          continue;
        }
        const thresholdShapeArea = rawShapeArea(thresholdShape);
        const thresholdShapeBounds = boundsForRawShape(thresholdShape);
        const thresholdBoundsFilled =
          (thresholdShapeBounds.x1 - thresholdShapeBounds.x0) *
          (thresholdShapeBounds.y1 + 1 - thresholdShapeBounds.y0);
        if (
          thresholdShapeArea / thresholdBoundsFilled > 0.98 &&
          thresholdShapeBounds.x0 === 0 &&
          thresholdShapeBounds.x1 === WIDTH
        ) {
          continue;
        }
        if (thresholdShapeArea > 300) {
          // At least one of the shapes should pass a size threshold:
          filteredMotion.add(motionShape);
          filteredThreshold.add(thresholdShape);
        }
      }
    }
  }
  // If there's no motion in the bottom half of the frame, but there is plenty of threshold, just add the threshold?
  if (filteredMotion.size === 0 && filteredThreshold.size === 0) {
    for (const thresholdShape of thresholdShapes) {
      const thresholdShapeArea = rawShapeArea(thresholdShape);
      const thresholdShapeBounds = boundsForRawShape(thresholdShape);
      const thresholdBoundsFilled =
        (thresholdShapeBounds.x1 - thresholdShapeBounds.x0) *
        (thresholdShapeBounds.y1 + 1 - thresholdShapeBounds.y0);
      if (
        thresholdShapeArea / thresholdBoundsFilled > 0.98 &&
        thresholdShapeBounds.x0 === 0 &&
        thresholdShapeBounds.x1 === WIDTH
      ) {
        continue;
      }
      if (
        thresholdShapeArea > 300 &&
        !thresholdShape[0] &&
        thresholdShapeBounds.x1 - thresholdShapeBounds.x0 <
          WIDTH - thermalRefWidth
      ) {
        // At least one of the shapes should pass a size threshold:
        filteredThreshold.add(thresholdShape);
      }
    }
  }

  // Draw the filtered mask back into a canvas?
  const data = new Uint8Array(WIDTH * HEIGHT);
  const filteredMotionArray = Array.from(filteredMotion) as RawShape[];
  drawRawShapesIntoMask(filteredMotionArray, data, motionBit);
  const solidThresholds = getSolidShapes(
    Array.from(filteredThreshold) as RawShape[]
  );
  drawShapesIntoMask(solidThresholds, data, thresholdBit);
  let mSum = 0;
  let mPlusTSum = 0;
  let tSum = 0;
  let actionInBottomOfFrame = 0;

  if (thermalReference) {
    //const thermalRefWidth = WIDTH - 95;
    // Remove known thermal ref from mask (make this a factory calibration step)
    for (let y = thermalRefRect.y0; y < thermalRefRect.y1; y++) {
      for (let x = thermalRefRect.x0; x < thermalRefRect.x1; x++) {
        const i = y * WIDTH + x;
        data[i] = 0;
      }
    }
  }

  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const i = y * WIDTH + x;
      const v = data[i];

      if (sobel[i] !== 0) {
        data[i] |= edgeBit;
      }

      if (v & motionBit) {
        mSum++;
      }
      if (v & thresholdBit) {
        tSum++;
      }
      if (v & motionBit && v & thresholdBit) {
        mPlusTSum++;
      }
      if (y > 80 && v !== 0) {
        actionInBottomOfFrame++;
      }
    }
  }

  if (thermalReference) {
    // Remove known thermal ref from mask (make this a factory calibration step)
    for (let y = thermalRefRect.y0; y < thermalRefRect.y1; y++) {
      for (let x = thermalRefRect.x0; x < thermalRefRect.x1; x++) {
        const i = y * WIDTH + x;
        data[i] = 0;
      }
    }
  }

  const hasBody = actionInBottomOfFrame && mPlusTSum > 45;
  return {
    hasBody,
    data,
    adjustedThreshold,
    motionStats: {
      motion: mSum,
      thresholded: tSum,
      motionPlusThreshold: mPlusTSum,
      actionInBottomHalf: actionInBottomOfFrame
    }
  };
}

export function mergeHeadParts(
  shapes: Shape[]
): { shapes: Shape[]; didMerge: boolean } {
  const mergedShapes: Shape[] = [];
  if (shapes.length) {
    const largest = largestShape(shapes);
    const hullA = convexHullForShape(largest);

    // FIXME(jon): Seems like in a lot of cases the corners of the image are more correct?
    //const boundsA = boundsForConvexHull(hullA);
    // Would this be better as closest points to bounding box corners?
    //const lTopLeft = closestPoint({x: boundsA.x0, y: boundsA.y0 }, hullA);
    const lTopLeft = closestPoint({ x: 0, y: 0 }, hullA);
    //const lTopRight = closestPoint({x: boundsA.x1, y: boundsA.y0 }, hullA);

    const lTopRight = closestPoint({ x: WIDTH, y: 0 }, hullA);
    // const lBottomLeft = closestPoint({x: boundsA.x0, y: boundsA.y1 }, hullA);
    // const lBottomRight = closestPoint({x: boundsA.x1, y: boundsA.y1 }, hullA);
    const lBottomLeft = closestPoint({ x: 0, y: HEIGHT }, hullA);
    const lBottomRight = closestPoint({ x: WIDTH, y: HEIGHT }, hullA);
    //const {left: lTopLeft, right: lTopRight} = topPoints(hullA);
    //const {left: lBottomLeft, right: lBottomRight} = bottomPoints(hullA);
    let merged = false;
    for (const shape of shapes) {
      const shapeA = shapeArea(shape);
      if (shape !== largest && shapeA > 100) {
        const hullB = convexHullForShape(shape);
        const boundsB = boundsForConvexHull(hullB);
        const d = 20 * shapeA;
        const maxDX = 30; // * Math.floor(shapeA / 100);
        {
          // const {left: bottomLeft, right: bottomRight} = bottomPoints(hullB);
          const bottomLeft = closestPoint(
            { x: boundsB.x0, y: boundsB.y1 },
            hullB
          );
          const bottomRight = closestPoint(
            { x: boundsB.x1, y: boundsB.y1 },
            hullB
          );
          if (
            distance(lTopLeft, bottomLeft) < d &&
            distance(lTopRight, bottomRight) < d &&
            Math.abs(lTopLeft.x - bottomLeft.x) < maxDX &&
            Math.abs(lTopRight.x - bottomRight.x) < maxDX
          ) {
            mergedShapes.push(
              joinShapes(shape, largest, {
                topLeft: bottomLeft,
                topRight: bottomRight,
                bottomLeft: lTopLeft,
                bottomRight: lTopRight
              })
            );
            merged = true;
          }
        }
        {
          //const {left: topLeft, right: topRight} = topPoints(hullB);
          const topLeft = closestPoint({ x: boundsB.x0, y: boundsB.y0 }, hullB);
          const topRight = closestPoint(
            { x: boundsB.x1, y: boundsB.y0 },
            hullB
          );
          if (
            !merged &&
            distance(topLeft, lBottomLeft) < d &&
            distance(topRight, lBottomRight) < d &&
            Math.abs(topLeft.x - lBottomLeft.x) < maxDX &&
            Math.abs(topRight.x - lBottomRight.x) < maxDX
          ) {
            mergedShapes.push(
              joinShapes(largest, shape, {
                topLeft,
                topRight,
                bottomRight: lBottomRight,
                bottomLeft: lBottomLeft
              })
            );
            merged = true;
          }
        }
      }
    }
    return merged
      ? { shapes: mergedShapes, didMerge: true }
      : { shapes: [largest], didMerge: false };
  }
  return { shapes: mergedShapes, didMerge: false };
}

export function preprocessShapes(
  frameShapes: RawShape[],
  thermalReference: ROIFeature | null
): { shapes: Shape[]; didMerge: boolean } {
  let shapes = getSolidShapes(frameShapes);
  // Find the largest shape, and then see if there are any other reasonable sized shapes directly
  // above or below that shape.  If there are, they may be the other half of a head cut in half by glasses,
  // and should be merged.
  if (thermalReference) {
    shapes = shapes.filter(shape => {
      const shapeBounds = boundsForShape(shape);
      const area = shapeArea(shape);
      const boundsFilled =
        (shapeBounds.x1 + 1 - shapeBounds.x0) *
        (shapeBounds.y1 + 1 - shapeBounds.y0);
      const ratioFilled = area / boundsFilled;

      // TODO(jon): Can also check to see if the top of a shape is flat, or if the side is flat too etc.
      // if (ratioFilled > 0.9) {
      //     return false;
      // }

      const maxVariance = 5;
      return !(
        distance(
          { x: shapeBounds.x0, y: shapeBounds.y0 },
          { x: thermalReference.x0, y: thermalReference.y0 }
        ) < maxVariance &&
        distance(
          { x: shapeBounds.x1, y: shapeBounds.y0 },
          { x: thermalReference.x1, y: thermalReference.y0 }
        ) < maxVariance &&
        distance(
          { x: shapeBounds.x0, y: shapeBounds.y1 },
          { x: thermalReference.x0, y: thermalReference.y1 }
        ) < maxVariance &&
        distance(
          { x: shapeBounds.x1, y: shapeBounds.y1 },
          { x: thermalReference.x1, y: thermalReference.y1 }
        ) < maxVariance
      );
    });
  }
  shapes = shapes.filter(isNotCeilingHeat);

  // TODO(jon): Exclude the thermal reference first.
  const { shapes: mergedShapes, didMerge } = mergeHeadParts(shapes);
  return {
    shapes: mergedShapes
      // .filter(shape => {
      //     const area = shapeArea(shape);
      //     const noLargeShapes =
      //         shapes.filter(x => shapeArea(x) > 300).length === 0;
      //     const isLargest = shape == largestShape(mergedShapes);
      //     return (
      //         area > 600 ||
      //         (noLargeShapes &&
      //             isLargest &&
      //             shapeIsOnSide(shape) &&
      //             shapeIsNotCircular(shape))
      //     );
      // })
      //.filter(isNotCeilingHeat)
      // .map(markWidest)
      // .map(markNarrowest)
      .filter(mergedShapes => mergedShapes.length),
    didMerge
  };
}

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

export function guessApproximateHeadWidth(body: Shape): number {
  let last = body[0];
  for (let i = 1; i < body.length; i++) {
    const span = body[i];
    span.x0 = Math.min(last.x0, span.x0);
    span.x1 = Math.max(last.x1, span.x1);
    last = span;
  }
  body.sort((a, b) => spanWidth(a) - spanWidth(b));
  const hist: Record<number, number> = {};
  const maxWidth = spanWidth(widestSpan(body));
  for (const span of body) {
    const w = spanWidth(span);
    if (w !== maxWidth) {
      if (!hist[w]) {
        hist[w] = 1;
      } else {
        hist[w]++;
      }
    }
  }
  for (const [key, val] of Object.entries(hist)) {
    if (val < 3) {
      delete hist[Number(key)];
    }
  }
  // Try and find the smallest duplicate width with at least a count of 10
  return Math.min(...Object.keys(hist).map(Number));
}

export function refineHeadThresholdData(
  data: Uint8Array,
  neck: { left: Point; right: Point },
  pointCloud: RawPoint[]
) {
  // scale out neck left and right 10px.
  const neckVec = sub(neck.right, neck.left);

  const extendAmount = distance(neck.left, neck.right) * 0.1; // - 0.3
  const downToChin = scale(normalise(perp(perp(perp(neckVec)))), extendAmount);

  const p0 = sub(neck.left, scale(normalise(neckVec), 15));
  const p1 = add(neck.right, scale(normalise(neckVec), 15));

  const neckLeft = add(p0, scale(normalise(perp(neckVec)), 100));
  const neckRight = add(p1, scale(normalise(perp(neckVec)), 100));

  const extendedNeckLeft = add(neck.left, downToChin);
  const extendedNeckRight = add(neck.right, downToChin);

  // Now halve point-cloud above neck, make convex hull of head:
  const headPoints: RawPoint[] = [
    [extendedNeckLeft.x, extendedNeckLeft.y],
    [extendedNeckRight.x, extendedNeckRight.y]
  ];
  for (const p of pointCloud.map(([x, y]) => ({ x, y }))) {
    if (pointIsLeftOfLine(extendedNeckRight, extendedNeckLeft, p)) {
      // Discard points too far to the left of neck.left, or too far to the right of neck.right
      if (
        pointIsLeftOfLine(p0, neckLeft, p) &&
        pointIsLeftOfLine(neckRight, p1, p)
      ) {
        headPoints.push([p.x, p.y]);
      }
    }
  }

  const headHull = fastConvexHull(headPoints);

  // TODO(jon): May actually be faster to rasterise this myself. (point is in polygon etc)

  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  ctx.beginPath();
  ctx.fillStyle = "rgba(255, 0, 0, 0.1)";
  ctx.moveTo(headHull[0][0], headHull[0][1]);
  for (const [x, y] of headHull.slice(1)) {
    ctx.lineTo(x, y);
  }
  ctx.lineTo(headHull[0][0], headHull[0][1]);
  ctx.fill();

  const imData = ctx.getImageData(0, 0, WIDTH, HEIGHT);
  const d = new Uint32Array(imData.data.buffer);
  for (let i = 0; i < d.length; i++) {
    if (!(d[i] & 0x000000ff)) {
      data[i] &= ~thresholdBit;
    }
  }
}

export function refineThresholdData(data: Uint8Array): RawPoint[] {
  const points: RawPoint[] = [];
  const edgePlusThreshold = 1 << 4;
  const edgePlusMotion = 1 << 3;
  const pointCloud: RawPoint[] = [];

  for (let y = 1; y < HEIGHT - 1; y++) {
    let prev = 0;
    for (let x = 1; x < WIDTH - 1; x++) {
      const i = y * WIDTH + x;
      const v = data[i];

      // TODO(jon): Optimise
      if (x > 0 && prev === 0 && v & thresholdBit) {
        //
      } else if (prev & thresholdBit && v === 0) {
        //
      } else if (
        v & edgeBit &&
        v & thresholdBit &&
        !allNeighboursEqual(x, y, data, edgeBit)
      ) {
        data[i] |= edgePlusThreshold;
      } else if (
        v & edgeBit &&
        v & motionBit &&
        !allNeighboursEqual(x, y, data, motionBit)
      ) {
        data[i] |= edgePlusMotion;
      }
      prev = v;
    }
  }
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const i = y * WIDTH + x;
      if (
        data[i] & edgePlusThreshold &&
        localDensity(x, y, data, edgePlusThreshold) >= 3
      ) {
        points.push([x, y]);
      } else if (
        data[i] === edgePlusMotion &&
        localDensity(x, y, data, edgePlusMotion) >= 3
      ) {
        points.push([x, y]);
      }
    }
  }

  if (points.length > 10) {
    //console.log("p", points.length);
    const clusters = DBScan({
      dataset: points,
      epsilon: 5 * 5,
      distanceFunction: distanceSq2,
      minimumPoints: 3
    });

    if (clusters.clusters.length) {
      let i = 0;
      for (const cluster of clusters.clusters) {
        if (cluster.length < 15) {
          let anyPointIsOnThresholdPlusMotion = false;
          for (const pointIndex of cluster) {
            const point = points[pointIndex];
            const index = WIDTH * point[1] + point[0];
            const v = data[index];
            if (v & motionBit && v & thresholdBit) {
              anyPointIsOnThresholdPlusMotion = true;
              break;
            }
          }
          for (const pointIndex of cluster) {
            const point = points[pointIndex];
            if (anyPointIsOnThresholdPlusMotion) {
              pointCloud.push(point);
            }
          }
        } else {
          for (const pointIndex of cluster) {
            const point = points[pointIndex];
            pointCloud.push(point);
          }
        }
        i++;
      }
    }
    if (pointCloud.length > 15) {
      let hull = fastConvexHull(pointCloud);
      // Take the leftmost and right most points, and extend to the bottom:
      let minX = Number.MAX_SAFE_INTEGER;
      let maxX = 0;
      let leftIndex = 0;
      let rightIndex = 0;
      for (let i = 0; i < hull.length; i++) {
        const p = hull[i];
        if (p[0] < minX) {
          minX = p[0];
          leftIndex = i;
        }
        if (p[0] > maxX) {
          maxX = p[0];
          rightIndex = i;
        }
      }
      hull.splice(1, rightIndex - 1);
      hull.splice(1, 0, [hull[0][0], HEIGHT - 1], [hull[1][0], HEIGHT - 1]);

      const first = hull.findIndex(
        ([x, y]: [number, number]) => y === HEIGHT - 1
      );
      hull = [...hull.slice(first + 1), ...hull.slice(0, first + 1)].reverse();

      // Draw the hull to a canvas
      const canvas = document.createElement("canvas");
      canvas.width = WIDTH;
      canvas.height = HEIGHT;
      const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
      ctx.beginPath();
      //ctx.strokeStyle = 'blue';
      ctx.fillStyle = "rgba(0, 255, 0, 0.1)";
      ctx.moveTo(hull[0][0], hull[0][1]);
      for (const [x, y] of hull.slice(1)) {
        ctx.lineTo(x, y);
      }
      ctx.lineTo(hull[0][0], hull[0][1]);
      ctx.fill();
      //ctx.stroke();
      // Draw the convex hull, then take a mask from it:

      const imData = ctx.getImageData(0, 0, WIDTH, HEIGHT);
      const d = new Uint32Array(imData.data.buffer);
      for (let i = 0; i < d.length; i++) {
        if (!(d[i] & 0x0000ff00)) {
          // TODO(jon): Make sure the pixel is not inside the thermal ref box
          data[i] &= ~thresholdBit;
        }
      }
    }
  }
  return pointCloud;
}

export function extractFaceInfo(
  neck: { left: Point; right: Point },
  faceShape: Shape,
  radialSmoothed: Float32Array,
  maybeHasGlasses = false
): FaceInfo | null {
  const { left, right } = neck;
  const startY = faceShape[0].y;
  const vec = sub(right, left);
  // Move down a little bit to accomodate the chin:

  //vec = sub(add(downToChin, right), add(downToChin, left));
  const extendAmount = distance(neck.left, neck.right) * 0.1; // ... 0.3
  const downToChin = scale(normalise(perp(perp(perp(vec)))), extendAmount);

  const start = left;
  const halfway = scale(vec, 0.5);
  const perpV = scale(perp(vec), 3);
  let neckBaseMiddleP = add(start, halfway);
  let l1 = add(neckBaseMiddleP, perpV);
  const halfwayRatio = 1;
  // NOTE(jon): March down this line with a perp vector, and stop when we don't hit any pixels on either side.
  //  Then go halfway-down the line created by this joining line, and march out to either side to get the width
  //  of the middle of the face.  Now we should be able to get the forehead box, which we'll only use if
  //  we think the face is front-on.
  let perpLeft,
    perpRight,
    normMidline,
    scaleFactor,
    maxLeftScale,
    maxRightScale,
    leftSymmetry,
    rightSymmetry,
    heightProbeP;
  {
    const dims = raymarchFaceDims(l1, neckBaseMiddleP, faceShape);
    perpLeft = dims.perpLeft;
    perpRight = dims.perpRight;
    normMidline = dims.normMidline;
    scaleFactor = dims.scaleFactor;
    maxLeftScale = dims.maxLeftScale;
    maxRightScale = dims.maxRightScale;
    leftSymmetry = dims.leftSymmetry;
    rightSymmetry = dims.rightSymmetry;
    heightProbeP = dims.heightProbeP;

    // if (false && !maybeHasGlasses) {
    //   // Let's try and adjust the midline based on colder noses.
    //   const noseP = add(neckBaseMiddleP, scale(normMidline, scaleFactor * 0.4));
    //   const noseLeftP = add(noseP, scale(perpLeft, maxLeftScale));
    //   const noseRightP = add(noseP, scale(perpRight, maxRightScale));
    //   let foundLeft = false;
    //   let coldest = Number.MAX_SAFE_INTEGER;
    //   let coldestP = { x: 0, y: 0 };
    //   let coldestI = 0;
    //   const faceWidth = Math.ceil(distance(noseLeftP, noseRightP));
    //   for (
    //     let i = Math.floor(faceWidth * 0.1);
    //     i < Math.ceil(faceWidth * 0.9);
    //     i++
    //   ) {
    //     const probeP = add(noseLeftP, scale(perpRight, i));
    //     const xInBounds = probeP.x >= 0 && probeP.x < WIDTH;
    //     const probeY = Math.round(probeP.y);
    //     const shapeIndex = probeY - startY;
    //     if (shapeIndex < 0 || shapeIndex > faceShape.length - 1) {
    //       break;
    //     }
    //     if (xInBounds && faceShape[shapeIndex]) {
    //       if (
    //         faceShape[shapeIndex].x1 > probeP.x &&
    //         faceShape[shapeIndex].x0 < probeP.x
    //       ) {
    //         foundLeft = true;
    //         // Sample the pixel.
    //         const index = 120 * probeY + Math.round(probeP.x);
    //         const val = radialSmoothed[index];
    //         if (val < coldest) {
    //           coldest = val;
    //           coldestP = probeP;
    //           coldestI = i;
    //         }
    //       }
    //       if (faceShape[shapeIndex].x1 < probeP.x) {
    //         break;
    //       }
    //     }
    //   }
    //   //drawPoint(coldestP, canvas, "pink", 2);
    //   let coldestHalfway = scale(vec, coldestI / faceWidth);
    //   neckBaseMiddleP = add(start, coldestHalfway);
    //   halfwayRatio = coldestI / faceWidth;
    // }
  }
  if (!maybeHasGlasses) {
    l1 = add(neckBaseMiddleP, perpV);
    const dims = raymarchFaceDims(l1, neckBaseMiddleP, faceShape);
    perpLeft = dims.perpLeft;
    perpRight = dims.perpRight;
    normMidline = dims.normMidline;
    scaleFactor = dims.scaleFactor;
    maxLeftScale = dims.maxLeftScale;
    maxRightScale = dims.maxRightScale;
    leftSymmetry = dims.leftSymmetry;
    rightSymmetry = dims.rightSymmetry;
    heightProbeP = dims.heightProbeP;
  }
  // Adjust left and right symmetry, based on how much we're offset from the original neck base center point.
  //drawPoint(neckBaseMiddleP, canvas, "pink", 4);

  const ssym = [];
  // Divide left and right symmetry by maxLeftScale, maxRightScale;
  for (let i = 0; i < scaleFactor; i++) {
    ssym.push(
      Math.abs(
        leftSymmetry[i] / maxLeftScale - rightSymmetry[i] / maxRightScale
      )
    );
  }

  // TODO(jon): Detect "fringe" cases where there's not enough forehead.
  if (heightProbeP) {
    neckBaseMiddleP = add(downToChin, neckBaseMiddleP);
    const bottomLeftP = add(neckBaseMiddleP, scale(perpLeft, maxLeftScale));
    const bottomRightP = add(neckBaseMiddleP, scale(perpRight, maxRightScale));
    const topLeftP = add(heightProbeP, scale(perpLeft, maxLeftScale));
    const topRightP = add(heightProbeP, scale(perpRight, maxRightScale));

    const headWidth = magnitude(sub(bottomLeftP, bottomRightP));
    const headHeight = magnitude(sub(topLeftP, bottomLeftP));
    const widthHeightRatio = headWidth / headHeight;
    const closestAllowedToEdge = 5;
    const isValidHead =
      widthHeightRatio > 0.5 &&
      topLeftP.x - closestAllowedToEdge > 0 &&
      topRightP.x + closestAllowedToEdge < WIDTH &&
      bottomLeftP.x - closestAllowedToEdge > 0 &&
      bottomRightP.x + closestAllowedToEdge < WIDTH;

    // TODO(jon): remove too small head areas.
    if (isValidHead) {
      // We only care about symmetry of the below forehead portion of the face, since above the eyes
      //  symmetry can be affected by hair parting to one side etc.
      const symmetryScore = ssym
        .slice(0, Math.floor(ssym.length / 2))
        .reduce((a, x) => a + x, 0);
      const areaLeft = leftSymmetry
        .slice(0, Math.floor(leftSymmetry.length / 2))
        .reduce((a, x) => a + x, 0);
      const areaRight = rightSymmetry
        .slice(0, Math.floor(rightSymmetry.length / 2))
        .reduce((a, x) => a + x, 0);
      // Use maxLeftScale and maxRightScale to get the face side edges.
      //console.log('area left, right', areaLeft, areaRight);
      //console.log('head width, height, ratio', headWidth, headHeight, headWidth / headHeight);
      // console.log("symmetry score", symmetryScore);
      //console.log(ssym.slice(0, Math.floor(symmetry.length / 2)));
      //console.log(symmetry.slice(0, Math.floor(symmetry.length / 2)));
      const areaDiff = Math.abs(areaLeft - areaRight);
      const isValidSymmetry = symmetryScore < 2; // && areaDiff < 50;

      let headLock = 0;

      if (Math.abs(bottomLeftP.y - bottomRightP.y) > 5) {
        headLock = 0;
      }

      // TODO(jon): I think we can relax this quite a bit and still get good results.
      else if (
        symmetryScore < 1.2 ||
        (symmetryScore < 3 && areaDiff < 60) ||
        (halfwayRatio > 0.4 && halfwayRatio < 0.6)
      ) {
        headLock = 1.0;
      } else if (areaDiff >= 60) {
        headLock = 0.5;
      } else {
        headLock = 0.0;
      }
      // TODO(jon): Could also find center of mass in bottom part of the face, and compare with actual center.

      // Draw midline, draw forehead, colour forehead pixels.
      const midP = add(
        neckBaseMiddleP,
        scale(normMidline, distance(topLeftP, bottomLeftP) * 0.5)
      );
      const midLeftP = add(midP, scale(perpLeft, maxLeftScale));
      const midRightP = add(midP, scale(perpRight, maxRightScale));

      const foreheadTopP = add(
        neckBaseMiddleP,
        scale(normMidline, scaleFactor * 0.85)
      );
      const foreheadBottomP = add(
        neckBaseMiddleP,
        scale(normMidline, scaleFactor * 0.75)
      );
      const foreheadAmount = 0.4;
      const foreheadTopLeftP = add(
        foreheadTopP,
        scale(perpLeft, maxLeftScale * foreheadAmount)
      );
      const foreheadTopRightP = add(
        foreheadTopP,
        scale(perpRight, maxRightScale * foreheadAmount)
      );
      const foreheadBottomLeftP = add(
        foreheadBottomP,
        scale(perpLeft, maxLeftScale * foreheadAmount)
      );
      const foreheadBottomRightP = add(
        foreheadBottomP,
        scale(perpRight, maxRightScale * foreheadAmount)
      );

      // TODO(jon): Gather array of forehead pixels.

      return Object.freeze({
        halfwayRatio,
        headLock,
        forehead: {
          top: foreheadTopP,
          bottom: foreheadBottomP,
          bottomLeft: foreheadBottomLeftP,
          bottomRight: foreheadBottomRightP,
          topLeft: foreheadTopLeftP,
          topRight: foreheadTopRightP
        },
        vertical: {
          bottom: neckBaseMiddleP,
          top: heightProbeP
        },
        horizontal: {
          left: midLeftP,
          right: midRightP,
          middle: midP
        },
        head: {
          topLeft: topLeftP,
          topRight: topRightP,
          bottomLeft: bottomLeftP,
          bottomRight: bottomRightP,
          rightNeckSpan: { ...(right as Point) }, // Was rightNeckSpan, leftNeckSpan
          leftNeckSpan: { ...(left as Point) }
        }
      });
    }
  }
  return null;
  // TODO(jon): Draw a line perpendicular to this line.
  // Then we can find the top of the head, and then the widest part of the head.
  // Then we can draw an oval.
  // The angle of the neck also helps us know if the head is front-on.

  // If the face is front-on, the width of the neck is roughly a third the width of shoulders, if visible.

  // TODO(jon): Separate case for animated outlines where we paint in irregularities in the head.
}

export function getNeck(body: Shape): { left: Point; right: Point } | null {
  //, maxYForNeck: number
  // Find the widest span from the last two thirds of the body.
  const startSpan = body[Math.max(0, body.length - 14)];
  const [left, right] = narrowestSlanted(body, startSpan);
  return {
    left: { x: left.x0, y: left.y },
    right: { x: right.x1, y: right.y }
  };
}
