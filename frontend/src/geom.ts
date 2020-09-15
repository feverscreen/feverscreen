import { Shape, Span } from "@/shape-processing";
import { RawShape } from "@/types";

export const WIDTH = 120;
export const HEIGHT = 160;

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

export function distToSegmentSquared(p: Point, v: Vec2, w: Vec2): number {
  const l2 = distanceSq(v, w);
  if (l2 == 0) {
    return distanceSq(p, v);
  }
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return distanceSq(p, { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) });
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
