import { FaceInfo } from "@/body-detection";
import { ROIFeature } from "@/worker-fns";
import { Shape } from "@/shape-processing";
import { RawShape } from "@/types";

export const WIDTH = 120;
export const HEIGHT = 160;

export interface Span {
  x0: number;
  x1: number;
  y: number;
  h: number; // bit marker
}
export interface Rect {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface Vec2 {
  x: number;
  y: number;
}

export const startP = ({ x0, y }: Span): Point => ({ x: x0, y });
export const endP = ({ x1, y }: Span): Point => ({ x: x1, y });
export const distanceSq = (a: Point, b: Point): number => {
  const dX = a.x - b.x;
  const dY = a.y - b.y;
  return dX * dX + dY * dY;
};
export const distance = (a: Point, b: Point): number =>
  Math.sqrt(distanceSq(a, b));

export const distanceSq2 = (
  a: [number, number],
  b: [number, number]
): number => {
  const dX = a[0] - b[0];
  const dY = a[1] - b[1];
  return dX * dX + dY * dY;
};

export const spanWidth = (span: Span): number => span.x1 - span.x0;

export function shapeArea(shape: Shape): number {
  return shape.reduce((acc, span) => acc + spanWidth(span), 0);
}

export function rawShapeArea(shape: RawShape): number {
  return Object.values(shape).reduce((acc, span) => acc + shapeArea(span), 0);
}

export function largestShape(shapes: Shape[]): Shape {
  return shapes.reduce((prevBestShape: Shape, shape: Shape) => {
    const best = shapeArea(prevBestShape);
    const area = shapeArea(shape);
    return area > best ? shape : prevBestShape;
  }, []);
}

export function rectDims(rect: Rect): { w: number; h: number } {
  return { w: rect.x1 - rect.x0, h: rect.y1 - rect.y0 };
}

export function boundsForShape(shape: Shape): Rect {
  const y0 = shape[0].y;
  const y1 = shape[shape.length - 1].y;
  const x0 = Math.min(...shape.map(({ x0 }) => x0));
  const x1 = Math.max(...shape.map(({ x1 }) => x1));
  return { x0, x1, y0, y1 };
}

export function boundsForRawShape(shape: RawShape): Rect {
  let minY = Number.MAX_SAFE_INTEGER;
  let maxY = 0;
  let minX = Number.MAX_SAFE_INTEGER;
  let maxX = 0;
  for (const row of Object.values(shape)) {
    for (const span of row) {
      minY = Math.min(span.y, minY);
      maxY = Math.max(span.y, maxY);
      minX = Math.min(span.x0, minX);
      maxX = Math.max(span.x1, maxX);
    }
  }
  return { x0: minX, y0: minY, y1: maxY, x1: maxX };
}

export function widestSpan(shape: Span[]): Span {
  let maxWidthSpan = shape[0];
  for (const span of shape) {
    if (spanWidth(span) > spanWidth(maxWidthSpan)) {
      maxWidthSpan = span;
    }
  }
  return maxWidthSpan;
}

export function narrowestSpan(shape: Shape): Span {
  let minWidthSpan;
  minWidthSpan = shape.find(x => x.x0 !== 0 && x.x1 !== WIDTH - 1);
  if (!minWidthSpan) {
    minWidthSpan = shape[0];
  }
  // TODO(jon): Ideally the narrowest span doesn't hit the frame edges.
  for (const span of shape) {
    if (spanWidth(span) <= spanWidth(minWidthSpan)) {
      if (span.x0 !== 0 && span.x1 !== WIDTH - 1) {
        minWidthSpan = span;
      }
    }
  }
  return minWidthSpan;
}

export function narrowestSlanted(shape: Shape, start: Span): [Span, Span] {
  const nIndex = shape.indexOf(start);
  // From the narrowest, wiggle about on each side to try to find a shorter distance between spans.
  const startIndex = Math.max(0, nIndex - 13);
  const endIndex = Math.min(shape.length - 1, nIndex + 13);
  const distances = [];
  for (let i = startIndex; i < endIndex; i++) {
    for (let j = startIndex; j < endIndex; j++) {
      if (i !== j) {
        const d = distanceSq(startP(shape[i]), endP(shape[j]));
        distances.push({
          d,
          skew: Math.abs(shape[i].y - shape[j].y),
          left: shape[i],
          right: shape[j]
        });
      }
    }
  }
  // If there are a bunch that are similar, prefer the least slanted one.
  distances.sort((a, b) => {
    // NOTE(defer spans where x0 or x1 is on the edge of the frame.
    if (a.left.x0 === 0 || a.right.x1 === WIDTH - 1) {
      return 1;
    } else if (b.left.x0 === 0 || b.right.x1 === WIDTH - 1) {
      return -1;
    }

    if (a.d < b.d) {
      return -1;
    } else if (a.d > b.d) {
      return 1;
    } else {
      if (a.skew < b.skew) {
        return -1;
      } else if (a.skew > a.skew) {
        return 1;
      } else {
        return b.right.y + b.left.y - (a.right.y + a.left.y);
      }
    }
  });
  if (distances.length) {
    let { left, right, skew: bestSkew } = distances[0];
    const { d: bestD } = distances[0];

    let i = 1;

    while (Math.abs(Math.sqrt(distances[i].d) - Math.sqrt(bestD)) < 1) {
      if (distances[i].skew < bestSkew) {
        bestSkew = distances[i].skew;
        left = distances[i].left;
        right = distances[i].right;
      }
      i++;
      if (i === distances.length) {
        break;
      }
    }
    return [left, right];
  }
  return [start, start];
}

export function narrowestSpans(shape: Shape): [Span, Span] {
  const narrowest = narrowestSpan(shape);
  return narrowestSlanted(shape, narrowest);
}

export function magnitude(vec: Vec2): number {
  return Math.sqrt(vec.x * vec.x + vec.y * vec.y);
}

export function normalise(vec: Vec2): Vec2 {
  const len = magnitude(vec);
  return {
    x: vec.x / len,
    y: vec.y / len
  };
}

export function scale(vec: Vec2, scale: number): Vec2 {
  return {
    x: vec.x * scale,
    y: vec.y * scale
  };
}

export function perp(vec: Vec2): Vec2 {
  // noinspection JSSuspiciousNameCombination
  return {
    x: vec.y,
    y: -vec.x
  };
}

export function add(a: Vec2, b: Vec2): Vec2 {
  return {
    x: a.x + b.x,
    y: a.y + b.y
  };
}

export function sub(a: Vec2, b: Vec2): Vec2 {
  return {
    x: a.x - b.x,
    y: a.y - b.y
  };
}

export const isLeft = (l0: Point, l1: Point, p: Point): number =>
  // Use cross-product to determine which side of a line a point is on.
  (l1.x - l0.x) * (p.y - l0.y) - (l1.y - l0.y) * (p.x - l0.x);

export const pointIsLeftOfOrOnLine = (
  l0: Point,
  l1: Point,
  p: Point
): boolean =>
  // Use cross-product to determine which side of a line a point is on.
  isLeft(l0, l1, p) >= 0;

export const pointIsLeftOfLine = (l0: Point, l1: Point, p: Point): boolean =>
  // Use cross-product to determine which side of a line a point is on.
  isLeft(l0, l1, p) > 0;

export function isNotCeilingHeat(shape: Shape): boolean {
  return !(shape[0].y === 0 && shape.length < 80);
}

export interface Quad {
  topLeft: Point;
  topRight: Point;
  bottomLeft: Point;
  bottomRight: Point;
}

export function pointIsInQuad(p: Point, quad: Quad): boolean {
  return (
    pointIsLeftOfLine(quad.bottomLeft, quad.topLeft, p) &&
    pointIsLeftOfLine(quad.topRight, quad.bottomRight, p) &&
    pointIsLeftOfLine(quad.bottomRight, quad.bottomLeft, p) &&
    pointIsLeftOfLine(quad.topLeft, quad.topRight, p)
  );
}

export function faceIntersectsThermalRef(
  face: FaceInfo,
  thermalReference: ROIFeature | null
): boolean {
  if (thermalReference === null) {
    return false;
  }
  const quad = {
    topLeft: face.head.topLeft,
    topRight: face.head.topRight,
    bottomLeft: face.head.bottomLeft,
    bottomRight: face.head.bottomRight
  };
  return (
    pointIsInQuad({ x: thermalReference.x0, y: thermalReference.y0 }, quad) ||
    pointIsInQuad({ x: thermalReference.x0, y: thermalReference.y1 }, quad) ||
    pointIsInQuad({ x: thermalReference.x1, y: thermalReference.y0 }, quad) ||
    pointIsInQuad({ x: thermalReference.x1, y: thermalReference.y1 }, quad)
  );
}

export function shapesOverlap(a: RawShape, b: RawShape): boolean {
  for (const [y, rowA] of Object.entries(a)) {
    if (b[Number(y)]) {
      for (const spanB of b[Number(y)]) {
        for (const spanA of rowA) {
          if (!(spanA.x1 < spanB.x0 || spanA.x0 >= spanB.x1)) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

export function drawRawShapesIntoMask(
  shapes: RawShape[],
  data: Uint8Array,
  bit: number,
  width = 120
) {
  for (const shape of shapes) {
    for (const row of Object.values(shape)) {
      for (const span of row) {
        let i = span.x0;
        if (span.x0 >= span.x1) {
          console.warn("Weird spans", span.x0, span.x1);
          continue;
        }
        do {
          data[span.y * width + i] |= bit;
          i++;
        } while (i < span.x1);
      }
    }
  }
}

export function drawShapesIntoMask(
  shapes: Shape[],
  data: Uint8Array,
  bit: number,
  width = 120
) {
  for (const shape of shapes) {
    for (const span of shape) {
      let i = span.x0;
      if (span.x0 >= span.x1) {
        console.warn("Weird spans", span.x0, span.x1);
        continue;
      }
      do {
        data[span.y * width + i] |= bit;
        i++;
      } while (i < span.x1);
    }
  }
}

export function getSolidShapes(
  frameShapes: Array<Record<number, Shape>>
): Shape[] {
  const solidShapes = [];
  // Infills vertical cracks.
  for (const shape of frameShapes) {
    const solidShape: Shape = [];
    for (const [row, spans] of Object.entries(shape)) {
      const minX0 = spans.reduce(
        (acc, span) => Math.min(acc, span.x0),
        Number.MAX_SAFE_INTEGER
      );
      const maxX1 = spans.reduce((acc, span) => Math.max(acc, span.x1), 0);
      solidShape.push({
        x0: minX0,
        x1: maxX1,
        y: Number(row),
        h: 0
      });
    }
    solidShape.sort((a, b) => a.y - b.y);
    solidShapes.push(solidShape);
  }
  return solidShapes;
}

export function shapeIsNotCircular(shape: Shape): boolean {
  const dims = rectDims(boundsForShape(shape));
  return Math.abs(dims.w - dims.h) > 4;
}

export function shapeIsOnSide(shape: Shape): boolean {
  for (const { x0, x1 } of shape) {
    if (x0 === 0 || x1 === WIDTH - 1) {
      return true;
    }
  }
  return false;
}

export function extendToBottom(shape: Shape): Shape {
  const halfway = Math.floor(shape.length / 2);
  let prevSpan = shape[halfway];
  for (let i = halfway + 1; i < shape.length; i++) {
    const span = shape[i];
    // Basically, if it's past halfway down the shape, and it's narrowing too much,
    // don't let it.
    const width = spanWidth(span);
    const prevWidth = spanWidth(prevSpan);
    if (Math.abs(prevWidth - width) > 1) {
      // Make sure x0 and x1 are always at least as far out as the previous span:
      span.x0 = Math.min(span.x0, prevSpan.x0);
      span.x1 = Math.max(span.x1, prevSpan.x1);
    }

    prevSpan = span;
  }
  const inc = 0;
  while (prevSpan.y < HEIGHT) {
    const dup = {
      y: prevSpan.y + 1,
      x0: prevSpan.x0 - inc,
      x1: prevSpan.x1 + inc,
      h: 0
    };
    // Add all the duplicate spans:
    shape.push(dup);
    prevSpan = dup;
  }
  return shape;
}

export function spanOverlapsShape(span: Span, shape: RawShape): boolean {
  if (shape[span.y - 1]) {
    for (const upperSpan of shape[span.y - 1]) {
      if (!(upperSpan.x1 < span.x0 || upperSpan.x0 >= span.x1)) {
        return true;
      }
    }
  }
  if (shape[span.y + 1]) {
    for (const lowerSpan of shape[span.y + 1]) {
      if (!(lowerSpan.x1 < span.x0 || lowerSpan.x0 >= span.x1)) {
        return true;
      }
    }
  }
  return false;
}

export function mergeShapes(shape: RawShape, other: RawShape) {
  const rows = [...Object.keys(shape), ...Object.keys(other)];
  for (const row of rows) {
    const rowN = Number(row);
    if (shape[rowN] && other[rowN]) {
      shape[rowN].push(...other[rowN]);
    } else if (other[rowN]) {
      shape[rowN] = other[rowN];
    }
  }
}

export function getRawShapes(
  thresholded: Uint8Array,
  width: number,
  height: number,
  maskBit: number
): RawShape[] {
  const shapes = [];
  for (let y = 0; y < height; y++) {
    let span = { x0: -1, x1: width, y, h: 0 };
    for (let x = 0; x < width; x++) {
      const index = y * width + x;
      if (thresholded[index] & maskBit && span.x0 === -1) {
        span.x0 = x;
      }
      if (
        span.x0 !== -1 &&
        (!(thresholded[index] & maskBit) || x === width - 1)
      ) {
        if (x === width - 1 && thresholded[index] & maskBit) {
          span.x1 = width;
        } else {
          span.x1 = x;
        }

        // Either put the span in an existing open shape, or start a new shape with it
        let assignedSpan = false;
        let n = shapes.length;
        let assignedShape;
        while (n !== 0) {
          const shape = shapes.shift() as RawShape;
          const overlap = shape && spanOverlapsShape(span, shape);
          if (overlap) {
            // Merge shapes
            if (!assignedSpan) {
              assignedSpan = true;
              if (shape[y]) {
                (shape[y] as Span[]).push(span);
              } else {
                shape[y] = [span];
              }
              assignedShape = shape;
              shapes.push(shape);
            } else {
              // Merge this shape with the shape the span was assigned to.
              mergeShapes(assignedShape as RawShape, shape);
            }
          } else {
            shapes.push(shape);
          }
          n--;
        }
        if (!assignedSpan) {
          shapes.push({ [y]: [span] });
        }
        span = { x0: -1, x1: width, y, h: 0 };
      }
    }
  }
  return shapes;
}

export function offsetRawShape(shapes: RawShape[], offset: Point): RawShape[] {
  const newShapes = [];
  for (const shape of shapes) {
    const newShape: Record<number, Span[]> = {};
    for (const row of Object.values(shape)) {
      for (const span of row) {
        if (!newShape[span.y + offset.y]) {
          newShape[span.y + offset.y] = [];
        }
        newShape[span.y + offset.y].push({
          x0: span.x0 + offset.x,
          x1: span.x1 + offset.x,
          y: span.y + offset.y,
          h: span.h
        });
      }
    }
    newShapes.push(newShape);
  }
  return newShapes;
}
export function boundsForConvexHull(hull: ConvexHull): Rect {
  const x0 = hull.reduce(
    (minX, point) => (point.x < minX ? point.x : minX),
    hull[0].x
  );
  const x1 = hull.reduce(
    (maxX, point) => (point.x > maxX ? point.x : maxX),
    hull[0].x
  );
  const y0 = hull.reduce(
    (minY, point) => (point.y < minY ? point.y : minY),
    hull[0].y
  );
  const y1 = hull.reduce(
    (maxY, point) => (point.y > maxY ? point.y : maxY),
    hull[0].y
  );
  return { x0, x1, y0, y1 };
}

export function joinShapes(top: Shape, bottom: Shape, quad: Quad): Shape {
  const s: Record<number, Span[]> = {};
  for (const span of top) {
    if (s[span.y]) {
      s[span.y].push(span);
    } else {
      s[span.y] = [span];
    }
  }

  // TODO(jon): Need to rasterize the quad and add it.
  // First get the quad bounds, then test every point inside the bounds.
  const quadBounds = boundsForConvexHull([
    quad.bottomLeft,
    quad.bottomRight,
    quad.topLeft,
    quad.topRight
  ]);
  const width = quadBounds.x1 - quadBounds.x0;
  const height = quadBounds.y1 - quadBounds.y0;
  const bitmap = new Uint8Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = { x: quadBounds.x0 + x, y: quadBounds.y0 + y };
      if (pointIsInQuad(p, quad)) {
        const index = y * width + x;
        bitmap[index] = 255;
      }
    }
  }

  // FIXME(jon): This probably doesn't work anymore
  const rr = getRawShapes(bitmap, width, height, 255);
  const raw = offsetRawShape(rr, { x: quadBounds.x0, y: quadBounds.y0 });
  const r = getSolidShapes(raw);
  if (r.length) {
    for (const span of r[0]) {
      if (s[span.y]) {
        s[span.y].push(span);
      } else {
        s[span.y] = [span];
      }
    }
  }

  for (const span of bottom) {
    if (s[span.y]) {
      s[span.y].push(span);
    } else {
      s[span.y] = [span];
    }
  }

  // TODO(jon): Join shapes needs to fill in the gaps with something
  //const shapes =
  return getSolidShapes([s])[0];
}

export type RawPoint = [number, number];
export type ConvexHull = Point[];

export function closestPoint(point: Point, points: Point[]): Point {
  let bestP;
  let bestD = Number.MAX_SAFE_INTEGER;
  for (const p of points) {
    const d = distanceSq(p, point);
    if (d < bestD) {
      bestD = d;
      bestP = p;
    }
  }
  return bestP as Point;
}

export function allNeighboursEqual(
  x: number,
  y: number,
  data: Uint8Array,
  bit: number
): boolean {
  const w = 120;
  const top = data[(y - 1) * w + x];
  const topLeft = data[(y - 1) * w + (x - 1)];
  const topRight = data[(y - 1) * w + (x + 1)];
  const left = data[y * w + (x - 1)];
  const right = data[y * w + (x + 1)];
  const bottom = data[(y + 1) * w + x];
  const bottomLeft = data[(y + 1) * w + (x - 1)];
  const bottomRight = data[(y + 1) * w + (x + 1)];
  return (
    top === bit &&
    topRight === bit &&
    right === bit &&
    bottomRight === bit &&
    bottom === bit &&
    bottomLeft === bit &&
    left === bit &&
    topLeft === bit
  );
}

export function localDensity(
  x: number,
  y: number,
  data: Uint8Array,
  bit: number
): number {
  const x0 = Math.max(x - 2, 0);
  const x1 = Math.min(x + 2, WIDTH - 1);
  const y0 = Math.max(y - 2, 0);
  const y1 = Math.min(y + 2, HEIGHT - 1);
  let sum = 0;
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const index = y * WIDTH + x;
      if (data[index] & bit) {
        sum++;
      }
    }
  }
  return sum;
}

export function distToSegmentSquared(p: Point, v: Vec2, w: Vec2): number {
  const l2 = distanceSq(v, w);
  if (l2 == 0) {
    return distanceSq(p, v);
  }
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return distanceSq(p, { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) });
}

export function directionOfSet(set: Point[]): { v: Vec2; y: number } {
  // What's a good way to get the current average direction?
  // This is "least squares"
  const meanX = set.reduce((acc, { x }) => acc + x, 0) / set.length;
  const meanY = set.reduce((acc, { y }) => acc + y, 0) / set.length;
  let num = 0;
  let den = 0;
  for (const p of set) {
    num += (p.x - meanX) * (p.y - meanY);
    den += (p.x - meanX) ** 2;
  }
  const gradient = num / den;
  const yIntercept = meanY - gradient * meanX;
  //return {x: gradient, y: yIntercept};
  return { v: normalise({ x: 1, y: gradient }), y: yIntercept };
}

export const pointsAreEqual = (a: Point, b: Point): boolean =>
  a.x === b.x && a.y === b.y;
export const pointIsInSet = (pt: Point, set: Point[]): boolean =>
  set.find(x => pointsAreEqual(x, pt)) !== undefined;

const maxSliceLength = 5;
export const minYIndex = (arr: Point[]): number => {
  let lowestY = Number.MAX_SAFE_INTEGER;
  let lowestIndex = 0;
  for (let i = 0; i < arr.length; i++) {
    const y = arr[i].y;
    if (y < lowestY) {
      lowestY = y;
      lowestIndex = i;
    }
  }
  return lowestIndex;
};
export const head = (arr: Point[]): Point[] =>
  arr.slice(0, Math.min(maxSliceLength, arr.length - 1));
export const tail = (arr: Point[]): Point[] =>
  arr.slice(
    arr.length - 1 - Math.min(maxSliceLength, arr.length) + 1,
    Math.min(maxSliceLength, arr.length) + 1
  );

export function fillVerticalCracks(shape: Shape) {
  // Fill gaps?
  for (let i = 0; i < shape.length; i++) {
    const startSpan = shape[i];
    const startWidth = spanWidth(startSpan);
    let shouldFill = false;
    const startFillIndex = i;
    if (i + 1 >= shape.length) {
      break;
    }
    while (i + 1 < shape.length && startWidth / spanWidth(shape[i + 1]) > 2) {
      shouldFill = true;
      i++;
    }

    if (shouldFill) {
      const endSpan = shape[i];
      for (let j = startFillIndex + 1; j < i + 1; j++) {
        shape[j].x0 = Math.min(startSpan.x0, endSpan.x0);
        shape[j].x1 = Math.max(startSpan.x1, endSpan.x1);
      }
    }
  }
}

// Convex hull:

function pointInPolygon(point: RawPoint, vs: RawPoint[]) {
  // ray-casting algorithm based on
  // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0],
      yi = vs[i][1];
    const xj = vs[j][0],
      yj = vs[j][1];

    const intersect =
      yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) {
      inside = !inside;
    }
  }
  return inside;
}
const e = 134217729,
  n = 33306690738754706e-32;
function r(
  t: number,
  e: Float64Array,
  n: number,
  r: Float64Array,
  o: Float64Array
) {
  let f,
    i,
    u,
    c,
    s = e[0],
    a = r[0],
    d = 0,
    l = 0;
  a > s == a > -s ? ((f = s), (s = e[++d])) : ((f = a), (a = r[++l]));
  let p = 0;
  if (d < t && l < n)
    for (
      a > s == a > -s
        ? ((u = f - ((i = s + f) - s)), (s = e[++d]))
        : ((u = f - ((i = a + f) - a)), (a = r[++l])),
        f = i,
        0 !== u && (o[p++] = u);
      d < t && l < n;

    )
      a > s == a > -s
        ? ((u = f - ((i = f + s) - (c = i - f)) + (s - c)), (s = e[++d]))
        : ((u = f - ((i = f + a) - (c = i - f)) + (a - c)), (a = r[++l])),
        (f = i),
        0 !== u && (o[p++] = u);
  for (; d < t; )
    (u = f - ((i = f + s) - (c = i - f)) + (s - c)),
      (s = e[++d]),
      (f = i),
      0 !== u && (o[p++] = u);
  for (; l < n; )
    (u = f - ((i = f + a) - (c = i - f)) + (a - c)),
      (a = r[++l]),
      (f = i),
      0 !== u && (o[p++] = u);
  return (0 === f && 0 !== p) || (o[p++] = f), p;
}
function o(t: number) {
  return new Float64Array(t);
}
const f = 33306690738754716e-32,
  i = 22204460492503146e-32,
  u = 11093356479670487e-47,
  c = o(4),
  s = o(8),
  a = o(12),
  d = o(16),
  l = o(4);
export function orient(
  t: number,
  o: number,
  p: number,
  b: number,
  y: number,
  h: number
) {
  const M = (o - h) * (p - y),
    x = (t - y) * (b - h),
    j = M - x;
  if (0 === M || 0 === x || M > 0 != x > 0) return j;
  const m = Math.abs(M + x);
  return Math.abs(j) >= f * m
    ? j
    : -(function(t, o, f, p, b, y, h) {
        let M, x, j, m, _, v, w, A, F, O, P, g, k, q, z, B, C, D;
        const E = t - b,
          G = f - b,
          H = o - y,
          I = p - y;
        (_ =
          (z =
            (A = E - (w = (v = e * E) - (v - E))) *
              (O = I - (F = (v = e * I) - (v - I))) -
            ((q = E * I) - w * F - A * F - w * O)) -
          (P =
            z -
            (C =
              (A = H - (w = (v = e * H) - (v - H))) *
                (O = G - (F = (v = e * G) - (v - G))) -
              ((B = H * G) - w * F - A * F - w * O)))),
          (c[0] = z - (P + _) + (_ - C)),
          (_ = (k = q - ((g = q + P) - (_ = g - q)) + (P - _)) - (P = k - B)),
          (c[1] = k - (P + _) + (_ - B)),
          (_ = (D = g + P) - g),
          (c[2] = g - (D - _) + (P - _)),
          (c[3] = D);
        let J = (function(t, e) {
            let n = e[0];
            for (let r = 1; r < t; r++) n += e[r];
            return n;
          })(4, c),
          K = i * h;
        if (J >= K || -J >= K) return J;
        if (
          ((M = t - (E + (_ = t - E)) + (_ - b)),
          (j = f - (G + (_ = f - G)) + (_ - b)),
          (x = o - (H + (_ = o - H)) + (_ - y)),
          (m = p - (I + (_ = p - I)) + (_ - y)),
          0 === M && 0 === x && 0 === j && 0 === m)
        )
          return J;
        if (
          ((K = u * h + n * Math.abs(J)),
          (J += E * m + I * M - (H * j + G * x)) >= K || -J >= K)
        )
          return J;
        (_ =
          (z =
            (A = M - (w = (v = e * M) - (v - M))) *
              (O = I - (F = (v = e * I) - (v - I))) -
            ((q = M * I) - w * F - A * F - w * O)) -
          (P =
            z -
            (C =
              (A = x - (w = (v = e * x) - (v - x))) *
                (O = G - (F = (v = e * G) - (v - G))) -
              ((B = x * G) - w * F - A * F - w * O)))),
          (l[0] = z - (P + _) + (_ - C)),
          (_ = (k = q - ((g = q + P) - (_ = g - q)) + (P - _)) - (P = k - B)),
          (l[1] = k - (P + _) + (_ - B)),
          (_ = (D = g + P) - g),
          (l[2] = g - (D - _) + (P - _)),
          (l[3] = D);
        const L = r(4, c, 4, l, s);
        (_ =
          (z =
            (A = E - (w = (v = e * E) - (v - E))) *
              (O = m - (F = (v = e * m) - (v - m))) -
            ((q = E * m) - w * F - A * F - w * O)) -
          (P =
            z -
            (C =
              (A = H - (w = (v = e * H) - (v - H))) *
                (O = j - (F = (v = e * j) - (v - j))) -
              ((B = H * j) - w * F - A * F - w * O)))),
          (l[0] = z - (P + _) + (_ - C)),
          (_ = (k = q - ((g = q + P) - (_ = g - q)) + (P - _)) - (P = k - B)),
          (l[1] = k - (P + _) + (_ - B)),
          (_ = (D = g + P) - g),
          (l[2] = g - (D - _) + (P - _)),
          (l[3] = D);
        const N = r(L, s, 4, l, a);
        (_ =
          (z =
            (A = M - (w = (v = e * M) - (v - M))) *
              (O = m - (F = (v = e * m) - (v - m))) -
            ((q = M * m) - w * F - A * F - w * O)) -
          (P =
            z -
            (C =
              (A = x - (w = (v = e * x) - (v - x))) *
                (O = j - (F = (v = e * j) - (v - j))) -
              ((B = x * j) - w * F - A * F - w * O)))),
          (l[0] = z - (P + _) + (_ - C)),
          (_ = (k = q - ((g = q + P) - (_ = g - q)) + (P - _)) - (P = k - B)),
          (l[1] = k - (P + _) + (_ - B)),
          (_ = (D = g + P) - g),
          (l[2] = g - (D - _) + (P - _)),
          (l[3] = D);
        const Q = r(N, a, 4, l, d);
        return d[Q - 1];
      })(t, o, p, b, y, h, m);
}

function cross(p1: RawPoint, p2: RawPoint, p3: RawPoint) {
  return orient(p1[0], p1[1], p2[0], p2[1], p3[0], p3[1]);
}

function compareByX(a: RawPoint, b: RawPoint) {
  return a[0] === b[0] ? a[1] - b[1] : a[0] - b[0];
}

function convexHull(points: RawPoint[]): RawPoint[] {
  points.sort(compareByX);
  const lower = [];
  for (let i = 0; i < points.length; i++) {
    while (
      lower.length >= 2 &&
      cross(lower[lower.length - 2], lower[lower.length - 1], points[i]) <= 0
    ) {
      lower.pop();
    }
    lower.push(points[i]);
  }

  const upper = [];
  for (let ii = points.length - 1; ii >= 0; ii--) {
    while (
      upper.length >= 2 &&
      cross(upper[upper.length - 2], upper[upper.length - 1], points[ii]) <= 0
    ) {
      upper.pop();
    }
    upper.push(points[ii]);
  }

  upper.pop();
  lower.pop();
  return lower.concat(upper);
}

// speed up convex hull by filtering out points inside quadrilateral formed by 4 extreme points
export function fastConvexHull(points: RawPoint[]): RawPoint[] {
  let left = points[0];
  let top = points[0];
  let right = points[0];
  let bottom = points[0];

  // find the leftmost, rightmost, topmost and bottommost points
  for (const p of points) {
    if (p[0] < left[0]) {
      left = p;
    }
    if (p[0] > right[0]) {
      right = p;
    }
    if (p[1] < top[1]) {
      top = p;
    }
    if (p[1] > bottom[1]) {
      bottom = p;
    }
  }

  // filter out points that are inside the resulting quadrilateral
  const cull = [left, top, right, bottom];
  const filtered = cull.slice();
  for (const p of points) {
    if (!pointInPolygon(p, cull)) filtered.push(p);
  }

  // get convex hull around the filtered points
  return convexHull(filtered);
}

export function convexHullForShape(shape: Shape): ConvexHull {
  const points: RawPoint[] = [];
  for (const span of shape) {
    points.push([span.x0, span.y]);
    points.push([span.x1, span.y]);
  }
  return fastConvexHull(points).map(([x, y]: RawPoint) => ({ x, y }));
}

export function convexHullForPoints(points: RawPoint[]): ConvexHull {
  return fastConvexHull(points).map(([x, y]: RawPoint) => ({ x, y }));
  // TODO(jon): Need to "rasterize" the convex hull back to our span based form.
  //  Get the bounds of the convex hull, then iterate through each pixel and check whether or not they are outside
  //  the shape (maybe divide into triangles, and use pointInsideTriangle?)
}

export function cloneShape(shape: Shape): Shape {
  const newShape = [];
  for (const span of shape) {
    newShape.push({ ...span });
  }
  return newShape;
}
