<template>
  <div
    id="user-facing-screening"
    class="user-state"
    @click="interacted = true"
    :class="[
      classNameForState,
      screeningResultClass,
      { 'mini-view': !onReferenceDevice }
    ]"
  >
    <canvas ref="beziers" id="beziers" width="810" height="1080"></canvas>
    <div class="center">
      <div v-if="hasScreeningResult" class="result">
        {{ temperature }}
      </div>
      <div v-else>
        Ready
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
    <v-card
      dark
      flat
      height="44"
      tile
      class="settings-toggle-button"
      :class="{ interacted }"
      color="transparent"
      v-if="onReferenceDevice || isLocal"
    >
      <v-card-actions>
        <v-btn
          absolute
          dark
          fab
          bottom
          right
          elevation="0"
          color="transparent"
          @click="
            e => {
              if (interacted) {
                showSettings = true;
                hasSettings = true;
              }
            }
          "
        >
          <v-icon color="rgba(255, 255, 255, 0.5)" large>{{ cogIcon }}</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
    <v-dialog
      v-model="showSettings"
      hide-overlay
      attach="#user-facing-screening"
      fullscreen
      transition="dialog-bottom-transition"
    >
      <AdminSettings v-if="hasSettings" @closed="closedAdminSettings" />
    </v-dialog>
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
import { mdiCog } from "@mdi/js";
import {
  CalibrationConfig,
  ScreeningEvent,
  ScreeningState,
  Span
} from "@/types";
import { DegreesCelsius, temperatureForSensorValue } from "@/utils";
import { FaceInfo, LerpAmount, Shape } from "@/shape-processing";
import AdminSettings from "@/components/AdminSettings.vue";

function lerp(a: number, amt: number, b: number): number {
  return a * amt + b * (1 - amt);
}

function closestY(prev: Span[], y: number): Span | undefined {
  const best = prev
    .map(x => ({ d: Math.abs(Number(x.y) - y), x }))
    .sort((a, b) => b.d - a.d)
    .pop() as { x: Span; d: number };
  return prev.find(x => x.y === best.x.y);
}

function interpolateShapes(prev: Shape, amt: number, next: Shape): Shape {
  // For each row with the same y, interpolate x0 and x0 and x1 and x1 linearly on x.
  // Then it's a matter of figuring out what to do with the rest.
  amt = 1 - amt;
  const result = [];
  // TODO(jon): Start at the bottom.

  for (let i = 0; i < next.length; i++) {
    const rowNext = next[i];
    const y = rowNext.y;
    if (prev[i]) {
      // Move others across in x the same amount as the adjacent ones that *do* exist.
      const rowPrev = prev[i];
      result.push({
        x0: lerp(rowPrev.x0, amt, rowNext.x0),
        x1: lerp(rowPrev.x1, amt, rowNext.x1),
        y: Number(y),
        h: 0
      });
    } else {
      // What's the closest point on prev?
      // Let's use that.
      const rowPrev = (closestY(prev, y) as unknown) as Span;
      // Should actually be the amount that rowPrev moved compared with
      // it's corresponding row in rowNext.
      result.push({
        x0: lerp(rowPrev.x0, amt, rowNext.x0),
        x1: lerp(rowPrev.x1, amt, rowNext.x1),
        y: Number(y),
        h: 0
      });
    }
  }
  return result;
}

const frameNum = 0;

let curveFitting: { fitCurveThroughPoints: (pts: Uint8Array) => number[] };

interface Message {
  message: string;
  count: number;
}

const Sound = new Audio();

@Component({
  components: {
    AdminSettings
  }
})
export default class UserFacingScreening extends Vue {
  @Prop({ required: true }) state!: ScreeningState;
  @Prop({ required: true }) screeningEvent!: ScreeningEvent;
  @Prop({ required: true }) calibration!: CalibrationConfig;
  @Prop({ required: true }) onReferenceDevice!: boolean;
  @Prop({ required: true }) face!: FaceInfo | null;
  @Prop({ required: true }) shapes!: [Shape[], Shape[]];

  get isLocal(): boolean {
    return (
      (window.location.port === "5000") | (window.location.port === "8080")
    );
  }

  private didInteract = false;

  private showSettings = false;
  private hasSettings = false;

  $refs!: {
    beziers: HTMLCanvasElement;
  };

  stateQueue: Message[] = [];

  closedAdminSettings() {
    this.showSettings = false;
    setTimeout(() => {
      this.hasSettings = false;
    }, 300);
  }

  set interacted(val: boolean) {
    this.didInteract = val;
    setTimeout(() => (this.didInteract = false), 5000);
  }

  get interacted(): boolean {
    return this.didInteract;
  }

  get cogIcon() {
    return mdiCog;
  }

  async beforeMount() {
    curveFitting = await import("../../curve-fit");
  }

  mounted() {
    window.requestAnimationFrame(this.drawBezierOutline.bind(this));
  }

  @Watch("screeningEvent")
  onScreeningEventChange() {
    if (this.temperatureIsNormal) {
      const shouldPlay = JSON.parse(
        window.localStorage.getItem("playNormalSound") || "true"
      );
      if (shouldPlay) {
        Sound.src = `${process.env.BASE_URL}sounds/341695_5858296-lq.mp3`;
        Sound.play();
      }
    } else if (this.temperatureIsHigherThanNormal) {
      const shouldPlay = JSON.parse(
        window.localStorage.getItem("playWarningSound") || "true"
      );
      if (shouldPlay) {
        Sound.src = `${process.env.BASE_URL}sounds/445978_9159316-lq.mp3`;
        Sound.play();
      }
    } else if (this.temperatureIsProbablyAnError) {
      const shouldPlay = JSON.parse(
        window.localStorage.getItem("playErrorSound") || "true"
      );
      if (shouldPlay) {
        Sound.src = `${process.env.BASE_URL}sounds/142608_1840739-lq.mp3`;
        Sound.play();
      }
    }
  }

  drawBezierOutline() {
    // Maybe we give the start and end shapes, and interpolate those, and convert to beziers each frame?
    performance.mark("bezs");
    // const toRemove = [];
    // for (const message of this.stateQueue) {
    //   message.count--;
    //   if (message.count === 0) {
    //     toRemove.push(message);
    //   }
    // }
    // for (const message of toRemove) {
    //   if (this.stateQueue.length !== 1) {
    //     //console.log("removing", message.message);
    //     this.stateQueue.splice(this.stateQueue.indexOf(message), 1);
    //   }
    // }

    // If this is 9fps, we should interpolate ~5 frames in between.
    // Let's try and draw a nice curve around the shape:
    // Get the edge of the shape:
    let ctx;
    let canvasWidth = 810;
    let canvasHeight = 1080;
    if (this.$refs.beziers) {
      const aspectRatio = 4 / 3;
      if (navigator.userAgent.includes("Lenovo TB-X605LC")) {
        canvasHeight = document.body.getBoundingClientRect().height;
      } else {
        canvasHeight = (this.$refs.beziers
          .parentElement as HTMLElement).getBoundingClientRect().height;
      }
      canvasWidth = canvasHeight / aspectRatio;
      this.$refs.beziers.style.width = `${canvasWidth}px`;
      this.$refs.beziers.style.height = `${canvasHeight}px`;
      ctx = this.$refs.beziers.getContext("2d") as CanvasRenderingContext2D;
    }
    if (ctx) {
      ctx.clearRect(0, 0, 810, 1080);
      ctx.save();
      ctx.scale(6.75, 6.75);
      if (this.shapes.length === 2) {
        // TODO(jon): Would Object.freeze be a better strategy for opting out of reactivity?
        const prevShape = this.shapes[0];
        const nextShape = this.shapes[1];
        if (prevShape && nextShape && prevShape.length && nextShape.length) {
          const interpolatedShape = interpolateShapes(
            prevShape[0],
            LerpAmount.amount,
            nextShape[0]
          );
          // TODO(jon): This lerp amount should be frame-rate independent, so time duration between frames.
          LerpAmount.amount += 0.166;
          LerpAmount.amount = Math.min(1, LerpAmount.amount);

          const pointsArray = new Uint8Array(interpolatedShape.length * 4);
          let i = 0;
          for (const row of interpolatedShape) {
            pointsArray[i++] = row.x1;
            pointsArray[i++] = row.y;
          }
          for (const row of interpolatedShape.reverse()) {
            pointsArray[i++] = row.x0;
            pointsArray[i++] = row.y;
          }

          const bezierPts = curveFitting.fitCurveThroughPoints(pointsArray);
          // TODO(jon): Run a smoothing pass on this to smooth out longer lines?
          // Maybe have adaptive error for different parts of the curve?

          if (bezierPts.length) {
            {
              {
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
                ctx.beginPath();
                ctx.moveTo(bezierPts[0], bezierPts[1]);
                for (let i = 2; i < bezierPts.length; i += 6) {
                  ctx.bezierCurveTo(
                    bezierPts[i],
                    bezierPts[i + 1],
                    bezierPts[i + 2],
                    bezierPts[i + 3],
                    bezierPts[i + 4],
                    bezierPts[i + 5]
                  );
                }
                ctx.stroke();
              }
            }
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
    performance.mark("beze");
    performance.measure("beziers", "bezs", "beze");
    window.requestAnimationFrame(this.drawBezierOutline.bind(this));
  }

  get temperature(): DegreesCelsius {
    if (this.screeningEvent) {
      return temperatureForSensorValue(
        this.calibration.calibrationTemperature.val,
        this.screeningEvent.rawTemperatureValue,
        this.screeningEvent.thermalReferenceRawValue
      );
    }
    return new DegreesCelsius(0);
  }

  get temperatureIsNormal(): boolean {
    const temperature = this.temperature.val;
    return (
      temperature >= this.calibration.thresholdMinNormal &&
      temperature < this.calibration.thresholdMinFever
    );
  }

  get temperatureIsHigherThanNormal(): boolean {
    const temperature = this.temperature.val;
    return temperature >= this.calibration.thresholdMinFever;
  }

  get temperatureIsProbablyAnError(): boolean {
    const temperature = this.temperature.val;
    // TODO(jon)
    return temperature > 42.5;
  }

  get classNameForState() {
    return this.state.toLowerCase().replace("_", "-");
  }

  get screeningResultClass() {
    if (
      this.state === ScreeningState.STABLE_LOCK ||
      this.state === ScreeningState.LEAVING
    ) {
      if (this.temperatureIsNormal) {
        return "okay"; // or possible-fever, or error-temp
      } else if (this.temperatureIsHigherThanNormal) {
        return "possible-fever";
      } else if (this.temperatureIsProbablyAnError) {
        return "error";
      }
    }
    return null;
  }

  get hasScreeningResult(): boolean {
    return this.screeningResultClass !== null;
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
          message: "Please look straight ahead",
          count: -1
        };
      case ScreeningState.FRONTAL_LOCK:
        return { message: "Great, now hold still a moment", count: 120 };
      case ScreeningState.STABLE_LOCK:
        if (this.screeningEvent) {
          if (this.temperatureIsNormal) {
            return { message: `Your temperature is normal`, count: 460 };
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
        }
        break;
      case ScreeningState.LEAVING:
        if (this.screeningEvent) {
          if (this.temperatureIsNormal) {
            return { message: "You're good to go!", count: -1 };
          } else {
            return {
              message: "You can go, but you need to get a follow-up",
              count: -1
            };
          }
        } else {
          return {
            message: "",
            count: -1
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
/* cyrillic-ext */
@font-face {
  font-family: "Open Sans";
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: local("Open Sans Bold"), local("OpenSans-Bold"),
    url(../assets/fonts/mem5YaGs126MiZpBA-UN7rgOUehpOqc.woff2) format("woff2");
  unicode-range: U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F,
    U+FE2E-FE2F;
}
/* cyrillic */
@font-face {
  font-family: "Open Sans";
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: local("Open Sans Bold"), local("OpenSans-Bold"),
    url(../assets/fonts/mem5YaGs126MiZpBA-UN7rgOVuhpOqc.woff2) format("woff2");
  unicode-range: U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
}
/* greek-ext */
@font-face {
  font-family: "Open Sans";
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: local("Open Sans Bold"), local("OpenSans-Bold"),
    url(../assets/fonts/mem5YaGs126MiZpBA-UN7rgOXuhpOqc.woff2) format("woff2");
  unicode-range: U+1F00-1FFF;
}
/* greek */
@font-face {
  font-family: "Open Sans";
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: local("Open Sans Bold"), local("OpenSans-Bold"),
    url(../assets/fonts/mem5YaGs126MiZpBA-UN7rgOUehpOqc.woff2) format("woff2");
  unicode-range: U+0370-03FF;
}
/* vietnamese */
@font-face {
  font-family: "Open Sans";
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: local("Open Sans Bold"), local("OpenSans-Bold"),
    url(../assets/fonts/mem5YaGs126MiZpBA-UN7rgOXehpOqc.woff2) format("woff2");
  unicode-range: U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1,
    U+01AF-01B0, U+1EA0-1EF9, U+20AB;
}
/* latin-ext */
@font-face {
  font-family: "Open Sans";
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: local("Open Sans Bold"), local("OpenSans-Bold"),
    url(../assets/fonts/mem5YaGs126MiZpBA-UN7rgOXOhpOqc.woff2) format("woff2");
  unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB,
    U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
/* latin */
@font-face {
  font-family: "Open Sans";
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: local("Open Sans Bold"), local("OpenSans-Bold"),
    url(../assets/fonts/mem5YaGs126MiZpBA-UN7rgOUuhp.woff2) format("woff2");
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA,
    U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215,
    U+FEFF, U+FFFD;
}

.user-state {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: #0096d7;
  transition: background-color 0.3s ease-in-out;
  &.okay {
    background: #11a84c;
  }
  &.possible-fever {
    background: #a81c11;
  }
  &.error {
    background: darkgoldenrod;
  }

  .center {
    user-select: none;
    position: absolute;
    top: 50vh;
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
  &.mini-view {
    position: absolute;
    //top: 30px;
    //left: 1000px;
    width: 1280px;
    height: 800px;
    //zoom: 0.49;
    .center {
      top: 50%;
    }
  }
}
.settings-toggle-button {
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
  &.interacted {
    opacity: 1;
  }
}

#beziers {
  position: absolute;
  left: 60px;
}
</style>
