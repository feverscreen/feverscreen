import { PADDING_TOP, PADDING_TOP_OFFSET, RawShape } from "@/types";

interface Span {
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
const WIDTH = 120;
const HEIGHT = 160;
export type Shape = Span[];
export type ImmutableShape = readonly Span[];

const pointIsLeftOfLine = (l0: Point, l1: Point, p: Point): boolean =>
  // Use cross-product to determine which side of a line a point is on.
  (l1.x - l0.x) * (p.y - l0.y) - (l1.y - l0.y) * (p.x - l0.x) > 0;

function isNotCeilingHeat(shape: Shape): boolean {
  return !(shape[0].y === 0 && shape.length < 80);
}

function magnitude(vec: Vec2): number {
  return Math.sqrt(vec.x * vec.x + vec.y * vec.y);
}

function normalise(vec: Vec2): Vec2 {
  const len = magnitude(vec);
  return {
    x: vec.x / len,
    y: vec.y / len
  };
}

function scale(vec: Vec2, scale: number): Vec2 {
  return {
    x: vec.x * scale,
    y: vec.y * scale
  };
}

function perp(vec: Vec2): Vec2 {
  // noinspection JSSuspiciousNameCombination
  return {
    x: vec.y,
    y: -vec.x
  };
}

function add(a: Vec2, b: Vec2): Vec2 {
  return {
    x: a.x + b.x,
    y: a.y + b.y
  };
}

function sub(a: Vec2, b: Vec2): Vec2 {
  return {
    x: a.x - b.x,
    y: a.y - b.y
  };
}

function getSolidShapes(frameShapes: Array<Record<number, Shape>>): Shape[] {
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

const spanWidth = (span: Span): number => span.x1 - span.x0;

function shapeArea(shape: Shape): number {
  return shape.reduce((acc, span) => acc + spanWidth(span), 0);
}

function largestShape(shapes: Shape[]): Shape {
  return shapes.reduce((prevBestShape: Shape, shape: Shape) => {
    const best = shapeArea(prevBestShape);
    const area = shapeArea(shape);
    return area > best ? shape : prevBestShape;
  }, []);
}

function rectDims(rect: Rect): { w: number; h: number } {
  return { w: rect.x1 - rect.x0, h: rect.y1 - rect.y0 };
}

function boundsForShape(shape: Shape): Rect {
  const y0 = shape[0].y;
  const y1 = shape[shape.length - 1].y;
  const x0 = Math.min(...shape.map(({ x0 }) => x0));
  const x1 = Math.max(...shape.map(({ x1 }) => x1));
  return { x0, x1, y0, y1 };
}

function shapeIsNotCircular(shape: Shape): boolean {
  const dims = rectDims(boundsForShape(shape));
  return Math.abs(dims.w - dims.h) > 4;
}

function shapeIsOnSide(shape: Shape): boolean {
  for (const { x0, x1 } of shape) {
    if (x0 === 0 || x1 === WIDTH - 1) {
      return true;
    }
  }
  return false;
}

function smoothKnobblyBits(shape: Shape): Shape {
  const halfway = Math.floor(shape.length / 2);
  let prev = shape[halfway];
  for (let i = halfway + 1; i < shape.length; i++) {
    const span = shape[i];
    const dx0 = Math.abs(span.x0 - prev.x0);
    const dx1 = Math.abs(span.x1 - prev.x1);
    if (dx0 > 2) {
      span.x0 = prev.x0;
    }
    if (dx1 > 2) {
      span.x1 = prev.x1;
    }
    prev = span;
  }
  return shape;
}

const startP = ({ x0, y }: Span): Point => ({ x: x0, y });
const endP = ({ x1, y }: Span): Point => ({ x: x1, y });
const distance = (a: Point, b: Point): number => {
  const dX = a.x - b.x;
  const dY = a.y - b.y;
  return Math.sqrt(dX * dX + dY * dY);
};

function widestSpan(shape: Span[]): Span {
  let maxWidthSpan = shape[0];
  for (const span of shape) {
    if (spanWidth(span) > spanWidth(maxWidthSpan)) {
      maxWidthSpan = span;
    }
  }
  return maxWidthSpan;
}

function narrowestSpan(shape: Shape): Span {
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

function narrowestSlanted(shape: Shape, start: Span): [Span, Span] {
  const nIndex = shape.indexOf(start);
  // From the narrowest, wiggle about on each side to try to find a shorter distance between spans.
  const startIndex = Math.max(0, nIndex - 10);
  const endIndex = Math.min(shape.length - 1, nIndex + 10);
  const distances = [];
  for (let i = startIndex; i < endIndex; i++) {
    for (let j = startIndex; j < endIndex; j++) {
      if (i !== j) {
        const d = distance(startP(shape[i]), endP(shape[j]));
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
      // Give greatest skew first, then prefer highest y sum?
      if (a.skew < b.skew) {
        return -1;
      } else if (a.skew > a.skew) {
        return 1;
      } else {
        return b.right.y + b.left.y - (a.right.y + a.left.y);
      }
    }
  });
  const { left, right } = distances[0];
  return [left, right];
}

function narrowestSpans(shape: Shape): [Span, Span] {
  const narrowest = narrowestSpan(shape.slice(10));
  return narrowestSlanted(shape, narrowest);
}

function markWidest(shape: Shape): Shape {
  // Take just the bottom 2/3rds
  widestSpan(shape.slice(Math.round((shape.length / 3) * 2))).h |= 1 << 2;
  return shape;
}

function markNarrowest(shape: Shape): Shape {
  narrowestSpan(shape.slice(10)).h |= 1 << 3;
  return shape;
}

function markShoulders(shapes: Shape[]): Shape[] {
  // TODO(jon): This might actually work best starting at the bottom and working our way up.
  //  But maybe we can try both and see if they are very mismatched?

  // Mark the narrowest point that's not part of the head tapering in at the top.
  for (const shape of shapes) {
    const prev = shape[shape.length - 1];
    let min = Number.MAX_SAFE_INTEGER;
    let minSpan;
    for (let i = shape.length - 2; i > -1; i--) {
      const curr = shape[i];
      min = Math.min(spanWidth(curr), min);
    }
    // Check if we flare out at the left and right.
    // Take a running average of spans.

    // Note that this might fail if we have people wearing coats etc.

    // Once we find a narrow point, search around it up to about 30 degrees each way for tilted narrowest points.

    if (shape.length > 10) {
      shape[10].h |= 1 << 1;
    }
  }
  return shapes;
}

function extendToBottom(shape: Shape): Shape {
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

export interface FaceInfo {
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
  };
}

export function extractFaceInfo(shapes: Shape[]): FaceInfo | null {
  const shape = largestShape(shapes);
  const widest = widestSpan(shape.slice(Math.round((shape.length / 3) * 2)));
  const widestIndex = shape.indexOf(widest);
  const widestWidth = spanWidth(widest);
  let halfWidth;
  // Work from bottom and find first span that is past widest point, and is around 1/2 of the width.
  for (let i = widestIndex; i > 10; i--) {
    const span = shape[i];
    if (widestWidth / 2 > spanWidth(span)) {
      halfWidth = span;
      break;
    }
  }
  let left, right;
  if (halfWidth) {
    [left, right] = narrowestSlanted(shape.slice(10), halfWidth);
  } else {
    [left, right] = narrowestSpans(shape.slice(10));
  }

  const vec = { x: right.x1 - left.x0, y: right.y - left.y };
  const start = { x: left.x0, y: left.y };
  const halfway = scale(vec, 0.5);
  const perpV = scale(perp(vec), 3);
  const neckBaseMiddleP = add(start, halfway);
  const l1 = add(neckBaseMiddleP, perpV);
  // NOTE(jon): March down this line with a perp vector, and stop when we don't hit any pixels on either side.
  //  Then go halfway-down the line created by this joining line, and march out to either side to get the width
  //  of the middle of the face.  Now we should be able to get the forehead box, which we'll only use if
  //  we think the face is front-on.
  const normMidline = normalise(sub(l1, neckBaseMiddleP));
  // TODO(jon): Discard boxes that are too long/wide ratio-wise.

  const perpLeft = normalise(perp(normMidline));
  const perpRight = normalise(perp(perp(perp(normMidline))));

  const startY = shape[0].y;
  // Keep going until there are no spans to the left or right, so ray-march left and then right.
  let scaleFactor = 0;
  let heightProbeP = neckBaseMiddleP;
  let maxLeftScale = 0;
  let maxRightScale = 0;
  const maxHeightScale = magnitude({ x: WIDTH, y: HEIGHT });
  const leftSymmetry = [];
  const rightSymmetry = [];
  const symmetry = [];

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
      if (shapeIndex < 0 || shapeIndex > shape.length - 1) {
        break;
      }

      if (xInBounds && shape[shapeIndex]) {
        if (
          shape[shapeIndex].x0 < probeP.x &&
          shape[shapeIndex].x1 > probeP.x
        ) {
          //
          foundLeft = true;
          maxLeftScale = Math.max(incLeft, maxLeftScale);
        }
        if (shape[shapeIndex].x0 > probeP.x) {
          break;
        }
      }
    }
    for (let incRight = 1; incRight < 50; incRight++) {
      const probeP = add(heightProbeP, scale(perpRight, incRight));
      const xInBounds = probeP.x >= 0 && probeP.x < WIDTH;
      const probeY = Math.round(probeP.y);
      const shapeIndex = probeY - startY;

      if (shapeIndex < 0 || shapeIndex > shape.length - 1) {
        break;
      }
      if (xInBounds && shape[shapeIndex]) {
        if (
          shape[shapeIndex].x1 > probeP.x &&
          shape[shapeIndex].x0 < probeP.x
        ) {
          //
          foundRight = true;
          maxRightScale = Math.max(incRight, maxRightScale);
        }
        if (shape[shapeIndex].x1 < probeP.x) {
          break;
        }
      }
    }
    leftSymmetry.push(maxLeftScale);
    rightSymmetry.push(maxRightScale);
    symmetry.push(Math.abs(maxLeftScale - maxRightScale));
    if (!(foundLeft || foundRight)) {
      break;
    }
    scaleFactor += 1;
  }

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
    const bottomLeftP = add(neckBaseMiddleP, scale(perpLeft, maxLeftScale));
    const bottomRightP = add(neckBaseMiddleP, scale(perpRight, maxRightScale));
    const topLeftP = add(heightProbeP, scale(perpLeft, maxLeftScale));
    const topRightP = add(heightProbeP, scale(perpRight, maxRightScale));

    const headWidth = magnitude(sub(bottomLeftP, bottomRightP));
    const headHeight = magnitude(sub(topLeftP, bottomLeftP));
    const widthHeightRatio = headWidth / headHeight;
    const isValidHead = headHeight > headWidth && widthHeightRatio > 0.5;

    // TODO(jon): remove too small head areas.

    if (isValidHead) {
      // We only care about symmetry of the below forehead portion of the face, since above the eyes
      //  symmetry can be affected by hair parting to one side etc.
      const symmetryScore = ssym
        .slice(0, Math.floor(symmetry.length / 2))
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
      // console.log("areaDiff", areaDiff);

      if (symmetryScore < 2 && areaDiff < 50) {
        headLock = 1.0;
      } else if (areaDiff >= 50) {
        headLock = 0.5;
      } else {
        headLock = 0.0;
      }
      // TODO(jon): Could also find center of mass in bottom part of the face, and compare with actual center.

      // Draw midline, draw forehead, colour forehead pixels.
      const midP = add(neckBaseMiddleP, scale(normMidline, scaleFactor * 0.5));
      const midLeftP = add(midP, scale(perpLeft, maxLeftScale));
      const midRightP = add(midP, scale(perpRight, maxRightScale));

      const foreheadTopP = add(
        neckBaseMiddleP,
        scale(normMidline, scaleFactor * 0.8)
      );
      const foreheadBottomP = add(
        neckBaseMiddleP,
        scale(normMidline, scaleFactor * 0.65)
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
          bottomRight: bottomRightP
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

export function drawShapes(shapes: Shape[], canvas: HTMLCanvasElement): any {
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  const img = ctx.getImageData(0, 0, width, height);
  const data = new Uint32Array(img.data.buffer);
  const colours = [
    0x33ffff00,
    0x33ff00ff,
    0x3300ffff,
    0x33ffff00,
    0x3300ffff,
    0x33ff00ff,
    0xffff66ff,
    0xff6633ff,
    0xff0000ff
  ];
  const faceInfo = {};
  const shape = largestShape(shapes);
  {
    const widest = widestSpan(shape.slice(Math.round((shape.length / 3) * 2)));
    const widestIndex = shape.indexOf(widest);
    const widestWidth = spanWidth(widest);
    let halfWidth;
    // Work from bottom and find first span that is past widest point, and is around 1/2 of the width.
    for (let i = widestIndex; i > 10; i--) {
      const span = shape[i];
      if (widestWidth / 2 > spanWidth(span)) {
        halfWidth = span;
        break;
      }
    }
    let left, right;
    if (halfWidth) {
      [left, right] = narrowestSlanted(shape.slice(10), halfWidth);
    } else {
      [left, right] = narrowestSpans(shape.slice(10));
    }

    const vec = { x: right.x1 - left.x0, y: right.y - left.y };
    const start = { x: left.x0, y: left.y };
    const halfway = scale(vec, 0.5);
    const perpV = scale(perp(vec), 3);
    const neckBaseMiddleP = add(start, halfway);
    const l1 = add(neckBaseMiddleP, perpV);

    {
      // TODO(jon): Categorise the head pixels as on the left or right side of the "center line"
      //  Sum up the pixels on each side, but also look for symmetry in terms of how far each edge is
      //  from the center line.  Ignore the portion above the eyes for this.  The eyes can be inferred
      //  as being half-way up the face.  We can do some more thresholding on the actual pixels there
      //  to try and identify eyes/glasses.
      const colour = colours[0 % colours.length];
      for (const span of shape) {
        let i = span.x0;
        if (span.x0 >= span.x1) {
          console.warn("Weird spans", span.x0, span.x1);
          continue;
        }
        do {
          const p = { x: i, y: span.y };
          if (
            !pointIsLeftOfLine(
              { x: left.x0, y: left.y },
              { x: right.x1, y: right.y },
              p
            )
          ) {
            if (pointIsLeftOfLine(neckBaseMiddleP, l1, p)) {
              //data[span.y * width + i] = 0xffff0000;
            } else {
              //data[span.y * width + i] = 0xffff00ff;
            }
            data[span.y * width + i] = 0x66666666;
          } else if (span.h === 0) {
            data[span.y * width + i] = colour;
          } else if (span.h === 3) {
            data[span.y * width + i] =
              (255 << 24) | (200 << 16) | (200 << 8) | 0;
          } else if (span.h === 4) {
            data[span.y * width + i] =
              (255 << 24) | (200 << 16) | (200 << 8) | 255;
          } else if (span.h === 8) {
            data[span.y * width + i] =
              (255 << 24) | (100 << 16) | (100 << 8) | 255;
          } else if (span.h === 1) {
            data[span.y * width + i] = (255 << 24) | (0 << 16) | (0 << 8) | 200;
          } else if (span.h === 2) {
            data[span.y * width + i] = (255 << 24) | (0 << 16) | (200 << 8) | 0;
          }
          i++;
        } while (i < span.x1);
      }
      ctx.putImageData(img, 0, 0);
    }

    ctx.lineWidth = 1;
    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.moveTo(left.x0, left.y);
    ctx.lineTo(right.x1, right.y);
    ctx.stroke();

    //ctx.moveTo(halfwayP.x - 2, halfwayP.y - 2);
    // ctx.fillStyle = 'yellow';
    // ctx.fillRect(l0.x - 1, l0.y - 1, 2, 2);

    // TODO(jon): March down this line with a perp vector, and stop when we don't hit any pixels on either side.
    //  Then go halfway-down the line created by this joining line, and march out to either side to get the width
    //  of the middle of the face.  Now we should be able to get the forehead box, which we'll only use if
    //  we think the face is front-on.
    const normMidline = normalise(sub(l1, neckBaseMiddleP));
    // TODO(jon): Discard boxes that are too long/wide ratio-wise.

    const perpLeft = normalise(perp(normMidline));
    const perpRight = normalise(perp(perp(perp(normMidline))));

    const startY = shape[0].y;
    // Keep going until there are no spans to the left or right, so ray-march left and then right.
    let scaleFactor = 0;
    let heightProbeP = neckBaseMiddleP;
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";

    let maxLeftScale = 0;
    let maxRightScale = 0;
    const maxHeightScale = magnitude({ x: WIDTH, y: HEIGHT });
    const leftSymmetry = [];
    const rightSymmetry = [];
    const symmetry = [];

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
        // ctx.fillRect(probeP.x - 0.5, probeP.y - 0.5, 1, 1);
        if (shapeIndex < 0 || shapeIndex > shape.length - 1) {
          break;
        }

        if (xInBounds && shape[shapeIndex]) {
          if (
            shape[shapeIndex].x0 < probeP.x &&
            shape[shapeIndex].x1 > probeP.x
          ) {
            //
            foundLeft = true;
            maxLeftScale = Math.max(incLeft, maxLeftScale);
          }
          if (shape[shapeIndex].x0 > probeP.x) {
            break;
          }
        }
      }
      for (let incRight = 1; incRight < 50; incRight++) {
        const probeP = add(heightProbeP, scale(perpRight, incRight));
        const xInBounds = probeP.x >= 0 && probeP.x < WIDTH;
        const probeY = Math.round(probeP.y);
        const shapeIndex = probeY - startY;
        // ctx.fillRect(probeP.x - 0.5, probeP.y - 0.5, 1, 1);

        if (shapeIndex < 0 || shapeIndex > shape.length - 1) {
          break;
        }
        if (xInBounds && shape[shapeIndex]) {
          if (
            shape[shapeIndex].x1 > probeP.x &&
            shape[shapeIndex].x0 < probeP.x
          ) {
            //
            foundRight = true;
            maxRightScale = Math.max(incRight, maxRightScale);
          }
          if (shape[shapeIndex].x1 < probeP.x) {
            break;
          }
        }
      }
      leftSymmetry.push(maxLeftScale);
      rightSymmetry.push(maxRightScale);
      symmetry.push(Math.abs(maxLeftScale - maxRightScale));
      if (!(foundLeft || foundRight)) {
        break;
      }
      scaleFactor += 1;
    }

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
      ctx.lineWidth = 1;
      ctx.strokeStyle = "orange";
      ctx.moveTo(neckBaseMiddleP.x, neckBaseMiddleP.y);
      ctx.lineTo(heightProbeP.x, heightProbeP.y);
      ctx.stroke();

      const bottomLeftP = add(neckBaseMiddleP, scale(perpLeft, maxLeftScale));
      const bottomRightP = add(
        neckBaseMiddleP,
        scale(perpRight, maxRightScale)
      );
      const topLeftP = add(heightProbeP, scale(perpLeft, maxLeftScale));
      const topRightP = add(heightProbeP, scale(perpRight, maxRightScale));

      const headWidth = magnitude(sub(bottomLeftP, bottomRightP));
      const headHeight = magnitude(sub(topLeftP, bottomLeftP));
      const widthHeightRatio = headWidth / headHeight;
      const isValidHead = headHeight > headWidth && widthHeightRatio > 0.5;

      // TODO(jon): remove too small head areas.

      if (isValidHead) {
        // We only care about symmetry of the below forehead portion of the face, since above the eyes
        //  symmetry can be affected by hair parting to one side etc.
        const symmetryScore = ssym
          .slice(0, Math.floor(symmetry.length / 2))
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
        console.log("symmetry score", symmetryScore);
        //console.log(ssym.slice(0, Math.floor(symmetry.length / 2)));
        //console.log(symmetry.slice(0, Math.floor(symmetry.length / 2)));
        const areaDiff = Math.abs(areaLeft - areaRight);
        const isValidSymmetry = symmetryScore < 2; // && areaDiff < 50;

        console.log("areaDiff", areaDiff);

        if (symmetryScore < 2 && areaDiff < 50) {
          ctx.strokeStyle = "red";
        } else if (areaDiff >= 50) {
          ctx.strokeStyle = "blue";
        } else {
          ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
        }

        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(topLeftP.x, topLeftP.y);
        ctx.lineTo(topRightP.x, topRightP.y);
        ctx.lineTo(bottomRightP.x, bottomRightP.y);
        ctx.lineTo(bottomLeftP.x, bottomLeftP.y);
        ctx.lineTo(topLeftP.x, topLeftP.y);
        ctx.stroke();

        // TODO(jon): Could also find center of mass in bottom part of the face, and compare with actual center.

        // Draw midline, draw forehead, colour forehead pixels.
        const midP = add(
          neckBaseMiddleP,
          scale(normMidline, scaleFactor * 0.5)
        );
        const midLeftP = add(midP, scale(perpLeft, maxLeftScale));
        const midRightP = add(midP, scale(perpRight, maxRightScale));

        ctx.moveTo(midLeftP.x, midLeftP.y);
        ctx.lineTo(midRightP.x, midRightP.y);
        ctx.stroke();

        const foreheadTopP = add(
          neckBaseMiddleP,
          scale(normMidline, scaleFactor * 0.8)
        );
        const foreheadTopLeftP = add(
          foreheadTopP,
          scale(perpLeft, maxLeftScale)
        );
        const foreheadTopRightP = add(
          foreheadTopP,
          scale(perpRight, maxRightScale)
        );

        ctx.beginPath();
        ctx.moveTo(foreheadTopLeftP.x, foreheadTopLeftP.y);
        ctx.lineTo(foreheadTopRightP.x, foreheadTopRightP.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(foreheadTopP.x, foreheadTopP.y, 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
      }
    }
    // TODO(jon): Draw a line perpendicular to this line.
    // Then we can find the top of the head, and then the widest part of the head.
    // Then we can draw an oval.
    // The angle of the neck also helps us know if the head is front-on.

    // If the face is front-on, the width of the neck is roughly a third the width of shoulders, if visible.

    // TODO(jon): Separate case for animated outlines where we paint in irregularities in the head.
  }
  return faceInfo;
}

export function areEqual(a: Span, b: Span): boolean {
  return a.x0 === b.x0 && a.x1 === b.x1 && a.y === b.y;
}

export function preprocessShapes(frameShapes: RawShape[]): Shape[] {
  const shapes = getSolidShapes(frameShapes);
  return (
    shapes
      .filter(shape => {
        const area = shapeArea(shape);
        const noLargeShapes =
          shapes.filter(x => shapeArea(x) > 300).length === 0;
        const isLargest = shape == largestShape(shapes);
        return (
          area > 600 ||
          (noLargeShapes &&
            isLargest &&
            shapeIsOnSide(shape) &&
            shapeIsNotCircular(shape))
        );
      })
      .filter(isNotCeilingHeat)
      .map(smoothKnobblyBits)
      .map(extendToBottom)
      //.map(markShoulders)
      .map(markWidest)
      .map(markNarrowest)
      .filter(shapes => shapes.length)
  );
}

function spanOverlapsShape(span: Span, shape: RawShape): boolean {
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
function mergeShapes(shape: RawShape, other: RawShape) {
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
  height: number
): RawShape[] {
  const shapes = [];
  for (let y = 0; y < height - PADDING_TOP; y++) {
    let span = { x0: -1, x1: width, y, h: 0 };
    for (let x = 0; x < width; x++) {
      const index = y * width + x;
      if (thresholded[index] === 255 && span.x0 === -1) {
        span.x0 = x;
      }
      if (span.x0 !== -1 && (thresholded[index] === 0 || x === width - 1)) {
        if (x === width - 1 && thresholded[index] !== 0) {
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
export const LerpAmount = { amount: 0 };

export function faceHasMovedOrChangedInSize(
  face: FaceInfo,
  prevFace: FaceInfo | null
): boolean {
  // FIXME
  if (prevFace === null) {
    return true;
  }
  return false;
}

export function faceIsFrontOn(face: FaceInfo): boolean {
  return face.headLock > 0.4;
}

export function getHottestSpotInBounds(
  face: FaceInfo,
  threshold: number,
  width: number,
  height: number,
  imageData: Float32Array
): { x: number; y: number; v: number } {
  const forehead = face.forehead;
  const x0 = Math.floor(Math.min(forehead.topLeft.x, forehead.bottomLeft.x));
  const x1 = Math.ceil(Math.max(forehead.topRight.x, forehead.bottomRight.x));
  const y0 = Math.floor(Math.min(forehead.topLeft.y, forehead.topRight.y));
  const y1 = Math.ceil(Math.max(forehead.bottomLeft.y, forehead.bottomRight.y));

  const idealCenter = add(
    forehead.top,
    scale(
      normalise(sub(forehead.bottom, forehead.top)),
      distance(forehead.bottom, forehead.top) * 0.5
    )
  );
  let bestDistance = Number.MAX_SAFE_INTEGER;
  let bestPoint = { x: 0, y: 0 };
  let bestVal = 0;

  // NOTE: Sometimes the point we want is covered by hair, and we don't want to sample that, so
  //  take the closest point to that ideal point from the area that we know actually has passed our
  //  threshold temperature test.
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const p = { x, y };
      if (
        pointIsLeftOfLine(forehead.bottomLeft, forehead.topLeft, p) &&
        pointIsLeftOfLine(forehead.topRight, forehead.bottomRight, p) &&
        pointIsLeftOfLine(forehead.bottomRight, forehead.bottomLeft, p) &&
        pointIsLeftOfLine(forehead.topLeft, forehead.topRight, p)
      ) {
        const index = PADDING_TOP_OFFSET + (y * width + x);
        const temp = imageData[index];
        if (temp > threshold) {
          const d = distance(idealCenter, p);
          if (d < bestDistance) {
            bestDistance = d;
            bestPoint = p;
            bestVal = temp;
          }
        }
      }
    }
  }
  return { x: bestPoint.x, y: bestPoint.y, v: bestVal };
}
