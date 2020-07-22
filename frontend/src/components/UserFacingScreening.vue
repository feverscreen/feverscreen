<template>
  <div class="user-state" :class="[classNameForState, screeningResultClass]">
    <canvas ref="beziers" id="beziers" width="810" height="1080"></canvas>
    <div class="center">
      <div v-if="hasScreeningResult" class="result">
        {{ temperature }}
      </div>
      <div
        v-for="(msg, index) of stateQueue"
        class="message"
        :class="`msg-${index}`"
        :key="msg.message"
      >
        {{ msg.message }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// Possible states:
// - Camera is still warming up
//  (this should still want to find the constant heat source, because we want to make
//   sure that's warming up at the same time)
// - Frame is empty, no head detected.
// - Head detected, but not centered.
// - More than one head detected in frame.
// - No constant heat-source detected.
// - Head detected, and forehead isolated.
// - Head has been front-on for x frames, with stable forehead lock.

// - Other states:
//      - Wifi has been lost (maybe don't care about this case now if we're wired?)
//      - FFC is happening
//      - Period *after* FFC, which we need to hide.
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import {
  BezierCtrlPoint,
  CalibrationConfig,
  ScreeningEvent,
  ScreeningState,
  Shape,
  SolidShape,
  Span
} from "@/types";
import { DegreesCelsius, temperatureForSensorValue } from "@/utils";
import fitCurve from "fit-curve";

function lerp(a: number, amount: number, b: number): number {
  return a * amount + b * (1 - amount);
}

function closestY(prev: Span[], y: number): Span | undefined {
  const best = prev
    .map(x => ({ d: Math.abs(Number(x.y) - y), x }))
    .sort((a, b) => b.d - a.d)
    .pop() as { x: Span; d: number };
  return prev.find(x => x.y === best.x.y);
}

function interpolateShapes(prev: Span[], amount: number, next: Span[]): Span[] {
  // For each row with the same y, interpolate x0 and x0 and x1 and x1 linearly on x.
  // Then it's a matter of figuring out what to do with the rest.
  amount = 1 - amount;
  const result = [];
  // TODO(jon): Start at the bottom.
  for (let i = 0; i < next.length; i++) {
    const rowNext = next[i];
    const y = rowNext.y;
    if (prev[i]) {
      // Move others across in x the same amount as the adjacent ones that *do* exist.
      const rowPrev = prev[i];
      result.push({
        x0: lerp(rowPrev.x0, amount, rowNext.x0),
        x1: lerp(rowPrev.x1, amount, rowNext.x1),
        y: Number(y)
      });
    } else {
      // What's the closest point on prev?
      // Let's use that.
      const rowPrev = (closestY(prev, y) as unknown) as Span;
      // Should actually be the amount that rowPrev moved compared with
      // it's corresponding row in rowNext.
      result.push({
        x0: lerp(rowPrev.x0, amount, rowNext.x0),
        x1: lerp(rowPrev.x1, amount, rowNext.x1),
        y: Number(y)
      });
    }
  }
  return result;
}

let amount = 0;
const frameNum = 0;
let sortedSpans: [Span[], Span[]] = [[], []];
function processShapes(sortedShapes: [Span[], Span[]]): [Span[], Span[]] {
  for (const sortedSpans of sortedShapes) {
    if (sortedSpans.length > 1) {
      let prevSpan = sortedSpans[0];
      // Skip the first
      const widestSpan = sortedSpans.reduce((acc, val) => {
        const width = val.x1 - val.x0;
        return width > acc ? width : acc;
      }, 0);
      let pastWidest = false;
      for (let i = 1; i < sortedSpans.length; i++) {
        const span = sortedSpans[i];

        // TODO(jon): Basically, if it's past halfway down the shape, and it's narrowing too much,
        // don't let it.

        // Find the maximum width span, and make sure that subsequent spans don't narrow in too much from that.
        const width = span.x1 - span.x0;
        const prevWidth = prevSpan.x1 - prevSpan.x0;
        const dx0 = Math.abs(span.x0 - prevSpan.x0);
        const dx1 = Math.abs(span.x1 - prevSpan.x1);
        // if (span.y > (sortedSpans.length / 5) * 3) {
        //   if (dx0 > 1) {
        //     span.x0 = prevSpan.x0; //Math.min(span.x0, prevSpan.x0);
        //   }
        //   if (dx1 > 1) {
        //     span.x1 = prevSpan.x1; //Math.max(span.x1, prevSpan.x1);
        //   }
        // }
        if (Math.abs(prevWidth - width) > 1) {
          // TODO(jon): Can do something smarter here, like only do this once we're past the widest span.
          span.x0 = Math.min(span.x0, prevSpan.x0);
          span.x1 = Math.max(span.x1, prevSpan.x1);
        }
        // Make sure x0 and x1 are always at least as far out as the previous span:
        prevSpan = span;
        if (width === widestSpan) {
          pastWidest = true;
        }
      }
      const remaining = 160 / prevSpan.y;
      const inc = 0; //Math.min(0.5, 5 / remaining);
      while (prevSpan.y < 160) {
        const dup = {
          y: prevSpan.y + 1,
          x0: prevSpan.x0 - inc,
          x1: prevSpan.x1 + inc
        };
        // Add all the duplicate spans:
        sortedSpans.push(dup);
        prevSpan = dup;
      }
    }
  }
  return sortedShapes;
}

function areEqual(a: Span, b: Span): boolean {
  return a.x0 === b.x0 && a.x1 === b.x1 && a.y === b.y;
}

function isValidShape(shape: SolidShape): boolean {
  const sorted = Object.entries(shape)
    .sort(([k0, a], [k1, b]): number => Number(k0) - Number(k1))
    .map(a => ({ ...a[1] }));
  if (sorted[0].y === 0 && sorted.length < 80) {
    return false;
  }
  return true;
}

let lastTopSpan: Span | undefined;

interface Message {
  message: string;
  count: number;
}

@Component
export default class UserFacingScreening extends Vue {
  @Prop({ required: true }) state!: ScreeningState;
  @Prop({ required: true }) screeningEvent!: ScreeningEvent;
  @Prop({ required: true }) calibration!: CalibrationConfig;
  @Prop({ required: true }) beziers!: [BezierCtrlPoint[], BezierCtrlPoint[]];
  @Prop({ required: true }) shapes!: [SolidShape[], SolidShape[]];

  $refs!: {
    beziers: HTMLCanvasElement;
  };

  stateQueue: Message[] = [];

  @Watch("shapes")
  updatedShapes() {
    // Remove shapes that start at the top of the video, but don't continue till half-way down
    const prevShape = this.shapes[0].filter(isValidShape);
    const nextShape = this.shapes[1].filter(isValidShape);

    if (prevShape.length && nextShape.length) {
      sortedSpans = processShapes([
        Object.entries(prevShape[0])
          .sort(([k0, a], [k1, b]): number => Number(k0) - Number(k1))
          .map(a => ({ ...a[1] })),
        Object.entries(nextShape[0])
          .sort(([k0, a], [k1, b]): number => Number(k0) - Number(k1))
          .map(a => ({ ...a[1] }))
      ]);

      // TODO(jon): Could do a prepass on the spans here to smooth out bumps.
      if (!lastTopSpan || !areEqual(lastTopSpan, sortedSpans[0][0])) {
        lastTopSpan = sortedSpans[0][0];
        amount = 0;
      }
    } else {
      sortedSpans = [[], []];
    }
  }

  mounted() {
    window.requestAnimationFrame(this.drawBezierOutline.bind(this));
  }

  drawBezierOutline() {
    // Maybe we give the start and end shapes, and interpolate those, and convert to beziers each frame?

    const toRemove = [];
    for (const message of this.stateQueue) {
      message.count--;
      if (message.count === 0) {
        toRemove.push(message);
      }
    }
    for (const message of toRemove) {
      if (this.stateQueue.length !== 1) {
        //console.log("removing", message.message);
        this.stateQueue.splice(this.stateQueue.indexOf(message), 1);
      }
    }

    // If this is 9fps, we should interpolate ~5 frames in between.
    // Let's try and draw a nice curve around the shape:
    // Get the edge of the shape:
    let ctx;
    if (this.$refs.beziers) {
      ctx = this.$refs.beziers.getContext("2d") as CanvasRenderingContext2D;
    }
    if (ctx) {
      ctx.clearRect(0, 0, 810, 1080);
      ctx.save();
      //ctx.translate(0, 10);
      ctx.scale(6.75, 6.75);
      if (sortedSpans.length) {
        const prevShape = sortedSpans[0];
        const nextShape = sortedSpans[1];
        if (prevShape.length && nextShape.length) {
          const points = [];

          const sortedRows = interpolateShapes(prevShape, amount, nextShape);
          amount += 0.142;
          if (amount > 1) {
            amount = 1;
          }

          for (const row of sortedRows) {
            points.push([row.x1, row.y]);
          }

          for (const row of sortedRows.reverse()) {
            points.push([row.x0, row.y]);
          }

          const bezier = (fitCurve(
            points,
            0.5
          ) as unknown) as BezierCtrlPoint[];

          // TODO(jon): Run a smoothing pass on this to smooth out longer lines?
          // Maybe have adaptive error for different parts of the curve?

          if (bezier.length) {
            ctx.beginPath();

            const drawRows = false;
            if (drawRows) {
              ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
              for (const span of sortedRows) {
                ctx.fillRect(span.x0, span.y, span.x1 - span.x0, 0.5);
              }
            }

            ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
            ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
            ctx.lineWidth = 2;
            ctx.lineCap = "round";
            // frameNum++;
            if (frameNum % 2 === 0) {
              ctx.setLineDash([3, 6]);
            } else {
              ctx.setLineDash([3, 4]);
            }
            ctx.moveTo(bezier[0][0][0], bezier[0][0][1]);
            for (const ctrl of bezier) {
              ctx.bezierCurveTo(
                ctrl[1][0],
                ctrl[1][1],
                ctrl[2][0],
                ctrl[2][1],
                ctrl[3][0],
                ctrl[3][1]
              );
            }
            // ctx.lineTo(bezier[0][0][0], bezier[0][0][1]);
            //ctx.fill();
            ctx.stroke();
            ctx.save();

            // TODO(jon): Bake this alpha mask to a texture if things seem slow.
            ctx.globalCompositeOperation = "destination-out";
            const leftGradient = ctx.createLinearGradient(0, 0, 20, 0);
            leftGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
            leftGradient.addColorStop(0.25, "rgba(0, 0, 0, 230)");
            leftGradient.addColorStop(0, "rgba(0, 0, 0, 255)");
            const rightGradient = ctx.createLinearGradient(100, 0, 120, 0);
            rightGradient.addColorStop(1, "rgba(0, 0, 0, 255)");
            rightGradient.addColorStop(0.75, "rgba(0, 0, 0, 230)");
            rightGradient.addColorStop(0, "rgba(0, 0, 0, 0)");

            const topGradient = ctx.createLinearGradient(0, 0, 0, 10);
            topGradient.addColorStop(0, "rgba(0, 0, 0, 255)");
            topGradient.addColorStop(0.45, "rgba(0, 0, 0, 230)");
            topGradient.addColorStop(1, "rgba(0, 0, 0, 0)");

            const bottomGradient = ctx.createLinearGradient(0, 150, 0, 160);
            bottomGradient.addColorStop(1, "rgba(0, 0, 0, 255)");
            bottomGradient.addColorStop(0.75, "rgba(0, 0, 0, 230)");
            bottomGradient.addColorStop(0, "rgba(0, 0, 0, 0)");

            ctx.fillStyle = leftGradient;
            ctx.fillRect(0, 0, 20, 160);
            ctx.fillStyle = rightGradient;
            ctx.fillRect(100, 0, 20, 160);
            ctx.fillStyle = topGradient;
            ctx.fillRect(0, 0, 120, 10);
            ctx.fillStyle = bottomGradient;
            ctx.fillRect(0, 150, 120, 10);
            ctx.restore();
          }
        }

        // Draw corner indicators:
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
        ctx.setLineDash([]);

        const inset = 15;
        const len = 10;
        const width = 120;
        const height = 160;
        ctx.beginPath();
        ctx.moveTo(inset + len, inset);
        ctx.lineTo(inset, inset);
        ctx.lineTo(inset, inset + len);

        ctx.moveTo(inset + len, height - inset);
        ctx.lineTo(inset, height - inset);
        ctx.lineTo(inset, height - (inset + len));

        ctx.moveTo(width - (inset + len), inset);
        ctx.lineTo(width - inset, inset);
        ctx.lineTo(width - inset, inset + len);

        ctx.moveTo(width - (inset + len), height - inset);
        ctx.lineTo(width - inset, height - inset);
        ctx.lineTo(width - inset, height - (inset + len));
        ctx.stroke();
        ctx.restore();
      }
    }

    window.requestAnimationFrame(this.drawBezierOutline.bind(this));
  }

  get temperature(): DegreesCelsius {
    return temperatureForSensorValue(
      this.calibration.calibrationTemperature.val,
      this.screeningEvent.rawTemperatureValue,
      this.screeningEvent.thermalReferenceRawValue
    );
  }

  get temperatureIsNormal(): boolean {
    return true;
  }

  get temperatureIsHigherThanNormal(): boolean {
    return false;
  }

  get temperatureIsProbablyAnError(): boolean {
    return false;
  }

  get classNameForState() {
    return this.state.toLowerCase().replace("_", "-");
  }

  get screeningResultClass() {
    if (
      this.state === ScreeningState.STABLE_LOCK ||
      this.state === ScreeningState.LEAVING
    ) {
      return "okay"; // or possible-fever, or error-temp
    }
    return null;
  }

  get hasScreeningResult(): boolean {
    return this.screeningResultClass !== null;
  }

  @Watch("state")
  onStateChanged() {
    const existingMessage = this.stateQueue.find(
      msg => msg.message === this.message.message
    );

    if (!existingMessage) {
      this.stateQueue.unshift(this.message);
    } else {
      //existingMessage.count = 30;
    }
  }

  get message(): Message {
    switch (this.state) {
      case ScreeningState.WARMING_UP:
        return { message: "Please wait", count: Number.MAX_SAFE_INTEGER };
      case ScreeningState.MULTIPLE_HEADS:
        return {
          message: "Only one person should be in front of the camera",
          count: 60
        };

      case ScreeningState.HEAD_LOCK:
      case ScreeningState.FACE_LOCK:
        return {
          message: "Please stand on the mark and look straight ahead",
          count: 60
        };
      case ScreeningState.FRONTAL_LOCK:
        return { message: "Great, now hold still a moment", count: 60 };
      case ScreeningState.STABLE_LOCK:
        if (this.temperatureIsNormal) {
          return { message: `Your temperature is normal`, count: 60 };
        } else if (this.temperatureIsHigherThanNormal) {
          return {
            message:
              "Your temperature is higher than normal, please don't enter",
            count: 180
          };
        } else if (this.temperatureIsProbablyAnError) {
          return {
            message: "Temperature anomaly, please check equipment",
            count: 360
          };
        }
        break;
      case ScreeningState.LEAVING:
        if (this.temperatureIsNormal) {
          return { message: "You're good to go!", count: 60 };
        } else {
          return {
            message: "You can go, but you need to get a follow-up",
            count: 180
          };
        }
      case ScreeningState.READY:
      default:
        return { message: "Ready to screen", count: Number.MAX_SAFE_INTEGER };
    }
    return { message: "", count: 0 };
  }
}
</script>

<style scoped lang="scss">
@import url("https://fonts.googleapis.com/css2?family=Open+Sans:wght@700&display=swap");
.user-state {
  //position: relative;
  position: absolute;
  top: 30px;
  left: 1000px;
  width: 1920px;
  height: 1080px;
  zoom: 0.49;
  background: #0096d7;
  transition: background-color 0.3s ease-in-out;
  &.okay {
    background: #11a84c;
  }
  &.possible-fever {
    background: #a81c11;
  }
}
#beziers {
  transform: scaleX(-1);
  position: absolute;
  left: 60px;
}
.center {
  user-select: none;
  position: absolute;
  top: 50%;
  left: 75%;
  transform: translate(-66%, -50%);
  max-width: 90%;
  min-width: 50%;
  text-align: center;
  color: white;

  font-family: "Open Sans", sans-serif;
  font-size: 80px;
  font-weight: 700;
  > .result {
    font-size: 200px;
  }
  .msg-0 {
    opacity: 1;
  }
  .msg-1 {
    opacity: 0.7;
    font-size: 70%;
  }
  .msg-2 {
    opacity: 0.5;
    font-size: 60%;
  }
  .msg-3 {
    opacity: 0.3;
    font-size: 50%;
  }
  .msg-4 {
    opacity: 0.1;
    font-size: 40%;
  }
}
</style>
