import {
  add,
  HEIGHT,
  magnitude,
  normalise,
  perp,
  Point,
  scale,
  sub,
  Vec2,
  WIDTH
} from "./geom";
import { Shape } from "@/shape-processing";

export function raymarchFaceDims(
  l1: Point,
  neckBaseMiddleP: Point,
  body: Shape
): {
  normMidline: Vec2;
  leftSymmetry: number[];
  rightSymmetry: number[];
  scaleFactor: number;
  perpLeft: Vec2;
  perpRight: Vec2;
  maxLeftScale: number;
  maxRightScale: number;
  heightProbeP: Point;
} {
  const normMidline = normalise(sub(l1, neckBaseMiddleP));
  // TODO(jon): Discard boxes that are too long/wide ratio-wise.

  const perpLeft = normalise(perp(normMidline));
  const perpRight = normalise(perp(perp(perp(normMidline))));

  // TODO(jon): From the middle of the lower part of the face, march across and try to find the coldest point close
  //  to the center, this is probably the nose, and we can use it to help find the center line of the face.

  const startY = body[0].y;
  // Keep going until there are no spans to the left or right, so ray-march left and then right.
  let scaleFactor = 0;
  let heightProbeP = neckBaseMiddleP;
  let maxLeftScale = 0;
  let maxRightScale = 0;
  const maxHeightScale = magnitude({ x: WIDTH, y: HEIGHT });
  const leftSymmetry = [];
  const rightSymmetry = [];

  while (scaleFactor < maxHeightScale) {
    const scaled = scale(normMidline, scaleFactor);
    heightProbeP = add(neckBaseMiddleP, scaled);
    let foundLeft = false;
    let foundRight = false;

    for (let incLeft = 1; incLeft < 50; incLeft++) {
      const probeP = add(heightProbeP, scale(perpLeft, incLeft));
      const xInBounds = probeP.x >= 0 && probeP.x < WIDTH;
      const probeY = Math.round(probeP.y);
      const shapeIndex = probeY - startY;
      if (shapeIndex < 0 || shapeIndex > body.length - 1) {
        break;
      }

      if (xInBounds && body[shapeIndex]) {
        if (body[shapeIndex].x0 < probeP.x && body[shapeIndex].x1 > probeP.x) {
          //
          foundLeft = true;
          maxLeftScale = Math.max(incLeft, maxLeftScale);
        }
        if (body[shapeIndex].x0 > probeP.x) {
          break;
        }
      }
    }
    for (let incRight = 1; incRight < 50; incRight++) {
      const probeP = add(heightProbeP, scale(perpRight, incRight));
      const xInBounds = probeP.x >= 0 && probeP.x < WIDTH;
      const probeY = Math.round(probeP.y);
      const shapeIndex = probeY - startY;

      if (shapeIndex < 0 || shapeIndex > body.length - 1) {
        break;
      }
      if (xInBounds && body[shapeIndex]) {
        if (body[shapeIndex].x1 > probeP.x && body[shapeIndex].x0 < probeP.x) {
          foundRight = true;
          maxRightScale = Math.max(incRight, maxRightScale);
        }
        if (body[shapeIndex].x1 < probeP.x) {
          break;
        }
      }
    }
    leftSymmetry.push(maxLeftScale);
    rightSymmetry.push(maxRightScale);
    // symmetry.push([maxLeftScale, maxRightScale]);
    if (!(foundLeft || foundRight)) {
      break;
    }
    scaleFactor += 1;
  }
  return {
    normMidline,
    leftSymmetry,
    rightSymmetry,
    scaleFactor,
    perpLeft,
    perpRight,
    maxLeftScale,
    maxRightScale,
    heightProbeP
  };
}
