<template>
  <v-app id="app">
    <div
      @drop="e => dropLocalCptvFile(e)"
      @dragover="e => e.preventDefault()"
      id="app-inner"
    >
      <FpsCounter :frame-count="frameCounter" />
      <AdminScreening
        v-if="isAdminScreen"
        :frame="currentFrame"
        :thermal-reference="appState.thermalReference"
        :faces="appState.faces"
        :crop-box="appState.currentCalibration.cropBox"
        :calibration="appState.currentCalibration.calibrationTemperature"
        :screening-state="appState.currentScreeningState"
        :latest-screening-event="appState.currentScreeningEvent"
        @crop-changed="onCropChanged"
        @save-crop-changes="saveCropChanges"
        @calibration-updated="updateCalibration"
      />
      <Histogram
        v-if="appState.currentFrame"
        :frame="appState.currentFrame"
        :thermal-reference-stats="thermalReferenceStats"
        :calibrated-temp="calibratedTemp"
      />
      <canvas ref="debugCanvas" id="debug-canvas" width="120" height="160" />
      <!--      <canvas ref="debugCanvas2" id="debug-canvas-2" width="120" height="185" />-->

      <FakeThermalCameraControls
        :paused="appState.paused"
        :playing-local="playingLocal"
        @toggle-playback="onTogglePlayback"
      />
      <div class="frame-controls">
        <v-btn @click="stepFrame">Step</v-btn>
        <v-btn @click="processFrame">Process</v-btn>
      </div>
      <div v-if="isAdminScreen" class="connection-info">
        <div>
          Camera is
          {{
            isConnected
              ? "connected"
              : isConnecting
              ? "connecting"
              : "disconnected"
          }}
        </div>
        <div>Getting feed? {{ isGettingFrames }}</div>
        <div>
          Thermal reference {{ hasThermalReference ? "found" : "not found" }}
        </div>
        <div v-if="hasThermalReference">
          <span
            >Thermal ref mean:
            {{ Math.round(thermalReferenceStats.mean) }}</span
          >
          <span
            >Thermal ref median:
            {{ Math.round(thermalReferenceStats.median) }}</span
          >
          <span
            >Thermal ref range:
            {{
              Math.round(thermalReferenceStats.max - thermalReferenceStats.min)
            }}</span
          >
        </div>
        <div>Found {{ numFaces }} face(s)</div>
        <div v-if="hasFaces">
          Forehead raw value
          {{
            appState.faces[0].heatStats.foreheadHotspot &&
              Math.round(
                appState.faces[0].heatStats.foreheadHotspot.sensorValue
              )
          }}
        </div>
        <div class="temperature">
          Temperature {{ (hasFaces && hotspotTemp) || "-" }}
        </div>
      </div>
    </div>
    <UserFacingScreening
      :state="appState.currentScreeningState"
      :screening-event="appState.currentScreeningEvent"
      :calibration="appState.currentCalibration"
      :beziers="[prevBezierOutline, nextBezierOutline]"
      :shapes="[prevShape, nextShape]"
    />
  </v-app>
</template>

<script lang="ts">
import AdminScreening from "@/components/AdminScreening.vue";
import UserFacingScreening from "@/components/UserFacingScreening.vue";
import { Component, Vue } from "vue-property-decorator";
import { CameraConnection, CameraConnectionState, Frame } from "@/camera";
import { processSensorData } from "@/processing";
import { detectThermalReference } from "@/feature-detection";
import {
  extractSensorValueForCircle,
  ThermalRefValues
} from "@/circle-detection";
import { Contours, Face, Hotspot, shapeData } from "@/face";
import FakeThermalCameraControls from "@/components/FakeThermalCameraControls.vue";
import { FrameInfo, TemperatureSource } from "@/api/types";
import {
  AppState,
  BezierCtrlPoint,
  BoundingBox,
  CropBox,
  PADDING_TOP,
  PADDING_TOP_OFFSET,
  ScreeningAcceptanceStates,
  ScreeningState,
  Shape,
  SolidShape,
  Span
} from "@/types";
import FpsCounter from "@/components/FpsCounter.vue";
import { FrameHeaderV2 } from "../pkg";
import { FaceRecognitionModel } from "@/haar-converted";
import { findFacesInFrameAsync } from "@/find-faces-async";
import { ROIFeature } from "@/worker-fns";
import {
  DegreesCelsius,
  getAdaptiveThreshold,
  mKToCelsius,
  temperatureForSensorValue
} from "@/utils";
import Histogram from "@/components/Histogram.vue";

const InitialFrameInfo = {
  Camera: {
    ResX: 160,
    ResY: 120,
    FPS: 9,
    Brand: "flir",
    Model: "lepton3.5"
  },
  Telemetry: {
    FrameCount: 1,
    TimeOn: 1,
    FFCState: "On",
    FrameMean: 0,
    TempC: 0,
    LastFFCTempC: 0,
    LastFFCTime: 0
  },
  AppVersion: "Foo1.2.3",
  BinaryVersion: "hduighu",
  Calibration: {
    ThermalRefTemp: 38,
    SnapshotTime: 0,
    TemperatureCelsius: 34,
    SnapshotValue: 0,
    SnapshotUncertainty: 0,
    BodyLocation: TemperatureSource.FOREHEAD,
    ThresholdMinNormal: 0,
    ThresholdMinFever: 0,
    Bottom: 0,
    Top: 0,
    Left: 0,
    Right: 0,
    CalibrationBinaryVersion: "fsdfd",
    UuidOfUpdater: 432423432432
  }
};

export const State: AppState = {
  currentFrame: null,
  cameraConnectionState: CameraConnectionState.Disconnected,
  thermalReference: {
    roi: null,
    stats: {
      coords: [],
      mean: 0,
      median: 0,
      max: 0,
      min: 0,
      count: 0
    }
  },
  faces: [],
  paused: false,
  currentCalibration: {
    calibrationTemperature: new DegreesCelsius(38),
    thermalReferenceRawValue: 30000,
    rawTemperatureValue: 31000,
    timestamp: new Date().getTime(),
    cropBox: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    }
  },
  currentScreeningEvent: null,
  currentScreeningState: ScreeningState.WARMING_UP,
  faceModel: null,
  lastFrameTime: 0
};

let cptvPlayer: any;

const WARMUP_TIME_SECONDS = 10; //30 * 60; // 30 mins
const FFC_SAFETY_DURATION_SECONDS = 5;

const rotate90 = (
  src: Float32Array,
  dest: Float32Array,
  paddingTop: number
): Float32Array => {
  let i = 0;
  const width = 160;
  const height = 120;
  const padding = paddingTop * height;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      dest[padding + (x * height + y)] = src[i];
      i++;
    }
  }
  // TODO(jon): Padding should be a neutral temp, not face repeated upwards
  //let min = Number.MAX_SAFE_INTEGER;
  const top = [];
  for (let x = 0; x < height; x++) {
    top.push(dest[padding + x]);
  }
  top.sort();
  const base = top[Math.floor(top.length / 2)];
  for (let y = 0; y < paddingTop; y++) {
    for (let x = 0; x < height; x++) {
      let px = dest[padding + x];
      if (px > base) {
        px = base;
      }
      dest[y * height + x] = px;
    }
  }
  return dest;
};

function getAreaForShape(shape: Shape): number {
  return Object.values(shape).reduce(
    (acc, row) => acc + row.reduce((acc, span) => acc + (span.x1 - span.x0), 0),
    0
  );
}

function spanOverlapsShape(span: Span, shape: Shape): boolean {
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
function mergeShapes(shape: Shape, other: Shape) {
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

const frameShapes = {};
let outputJSON = false;
// How much we pad out the top for helping haar cascade to work.  We don't need this if we get rid of haar.

@Component({
  components: {
    Histogram,
    FakeThermalCameraControls,
    AdminScreening,
    UserFacingScreening,
    FpsCounter
  }
})
export default class App extends Vue {
  get isReferenceDevice(): boolean {
    return window.navigator.userAgent.includes("Lenovo TB-X605LC");
  }
  get isAdminScreen(): boolean {
    return true;
  }
  private appState: AppState = State;

  // TODO(jon): This is a localStorage property which is set per viewing device.
  private mirrored = true;
  private prevFrameInfo: FrameInfo | null = null;
  private droppedDebugFile = false;
  private frameCounter = 0;
  private frameTimeout = 0;

  private nextBezierOutline: BezierCtrlPoint[] = [];
  private prevBezierOutline: BezierCtrlPoint[] = [];
  private prevShape: SolidShape[] = [];
  private nextShape: SolidShape[] = [];
  private thresholdValue = 0;

  onThresholdChange(val: number) {
    this.thresholdValue = val;
  }

  public get playingLocal(): boolean {
    return this.droppedDebugFile;
  }

  $refs!: {
    debugCanvas: HTMLCanvasElement;
    //    debugCanvas3: HTMLCanvasElement;
  };

  public advanceScreeningState(nextState: ScreeningState): boolean {
    // We can only move from certain states to certain other states.
    const prevState = this.appState.currentScreeningState;
    if (prevState !== nextState) {
      const allowedNextState = ScreeningAcceptanceStates[prevState];
      if ((allowedNextState as ScreeningState[]).includes(nextState)) {
        this.appState.currentScreeningState = nextState;
        console.log("Advanced to state", nextState);
        return true;
      }
    }
    return false;
  }

  public get thermalReferenceRawValue(): number {
    return this.appState.thermalReference.roi?.sensorValue || 0;
  }

  public get currentFrameCount(): number {
    // NOTE(jon): This is always zero if it's the fake thermal camera.
    if ((this.appState.currentFrame as Frame).frameInfo) {
      return (this.appState.currentFrame as Frame).frameInfo.Telemetry
        .FrameCount;
    }
    return 0;
  }

  private stepFrame() {
    this.appState.paused = false;
  }

  private processFrame() {
    this.onFrame(this.appState.currentFrame!);
  }

  private holdCurrentFrame() {
    if (this.appState.paused && this.appState.currentFrame) {
      this.onFrame(this.appState.currentFrame);
      setTimeout(this.holdCurrentFrame.bind(this), this.frameInterval);
    }
  }

  private get frameInterval(): number {
    if (this.appState.currentFrame) {
      return 1000 / 9; // this.appState.currentFrame.frameInfo.Camera.FPS;
    }
    return 1000 / 9;
  }

  public async dropLocalCptvFile(event: DragEvent) {
    event.preventDefault();
    this.droppedDebugFile = true;
    if (event.dataTransfer && event.dataTransfer.items) {
      for (let i = 0; i < event.dataTransfer.items.length; i++) {
        if (event.dataTransfer.items[i].kind === "file") {
          const file = event.dataTransfer.items[i].getAsFile() as File;
          const buffer = await file.arrayBuffer();
          await this.playLocalCptvFile(buffer);
        }
      }
    }
  }

  updateCalibration(value: DegreesCelsius) {
    this.appState.currentCalibration.calibrationTemperature = value;
    this.appState.currentCalibration.cropBox = {
      ...this.appState.currentCalibration.cropBox
    };
    //this.appState.currentCalibration.
    // TODO(jon): Save.
  }

  public async playLocalCptvFile(
    buffer: ArrayBuffer,
    startFrame = 0,
    endFrame = -1,
    pauseOn = -1
  ) {
    const frameBuffer = new ArrayBuffer(160 * 120 * 2);
    let filledFrameBuffer = false;
    cptvPlayer.initWithCptvData(new Uint8Array(buffer));
    const getNextFrame = () => {
      clearTimeout(this.frameTimeout);
      let frameInfo: FrameHeaderV2;
      let rotated = true;
      if (!this.appState.paused || !filledFrameBuffer) {
        filledFrameBuffer = true;
        // If we're paused, we'll keep sending through the same frame each time.
        frameInfo = cptvPlayer.getRawFrame(new Uint8Array(frameBuffer));
        while (
          frameInfo.frame_number < startFrame ||
          (endFrame != -1 && frameInfo.frame_number > endFrame)
        ) {
          frameInfo = cptvPlayer.getRawFrame(new Uint8Array(frameBuffer));
        }
        rotated = false;
      }
      if (frameInfo! && frameInfo!.frame_number === pauseOn) {
        this.appState.paused = true;
      }

      this.appState.currentFrame = {
        frame: new Float32Array(new Uint16Array(frameBuffer)),
        rotated,
        frameInfo:
          (frameInfo! && {
            ...InitialFrameInfo,
            Telemetry: {
              ...InitialFrameInfo.Telemetry,
              LastFFCTime: frameInfo!.last_ffc_time,
              FrameCount: frameInfo!.frame_number,
              TimeOn: frameInfo!.time_on
            }
          }) ||
          this.appState.currentFrame!.frameInfo,
        smoothed: new Float32Array(),
        medianed: new Float32Array()
      };
      {
        // Rotate the frame.
        const frame = this.appState.currentFrame;
        const paddingTop = 25;
        frame.frameInfo.Camera.ResX = 120;
        frame.frameInfo.Camera.ResY = 160 + paddingTop;
        frame.frame = rotate90(
          frame.frame,
          new Float32Array(
            frame.frameInfo.Camera.ResX * frame.frameInfo.Camera.ResY
          ),
          paddingTop
        );
        frame.rotated = true;
      }
      // TODO(jon): If thermal ref is always in the same place, maybe mask out the entire bottom of the frame?
      // Just for visualisation purposes?

      if (!this.appState.paused) {
        this.onFrame(this.appState.currentFrame);
        if (this.startFrame !== 0) {
          this.appState.paused = true;
        }
      }
      this.frameTimeout = setTimeout(getNextFrame, this.frameInterval);
    };
    clearTimeout(this.frameTimeout);
    getNextFrame();
  }

  onCropChanged(cropBox: CropBox) {
    this.appState.currentCalibration.cropBox = cropBox;
  }

  onTogglePlayback(paused: boolean) {
    if (paused && !this.droppedDebugFile) {
      // Repeat the current frame
      setTimeout(this.holdCurrentFrame.bind(this), this.frameInterval);
    }
    this.appState.paused = paused;
  }

  saveCropChanges() {
    console.log(
      "save crop changes",
      JSON.parse(JSON.stringify(this.appState.currentCalibration.cropBox))
    );
  }

  get calibratedTemp(): DegreesCelsius {
    return this.appState.currentCalibration.calibrationTemperature;
  }

  // TODO(jon): Setting to get temperature from hotspot on faces vs overall hotspot (excluding thermal ref)
  get hotspotTemp(): DegreesCelsius | null {
    const hotspot = this.hotspot;
    if (hotspot !== null) {
      return temperatureForSensorValue(
        this.appState.currentCalibration.calibrationTemperature.val,
        hotspot.sensorValue,
        this.thermalReferenceRawValue
      );
    }
    return null;
  }

  get thermalReferenceStats(): ThermalRefValues {
    return this.appState.thermalReference.stats;
  }

  get thermalReferenceTemp(): DegreesCelsius {
    return mKToCelsius(this.thermalReferenceRawValue);
  }

  get currentFrame(): Frame {
    return this.appState.currentFrame as Frame;
  }

  get hasThermalReference(): boolean {
    return this.appState.thermalReference.roi !== null;
  }

  get isWarmingUp(): boolean {
    return false;
    /*
    if (this.prevFrameInfo) {
      const telemetry = this.prevFrameInfo.Telemetry;
      // NOTE: TimeOn is in nanoseconds when coming from the camera server, but in milliseconds when coming
      // from a CPTV file - should make these the same.
      const timeOnSecs = telemetry.TimeOn / 1000;
      return timeOnSecs < WARMUP_TIME_SECONDS;
    }
    return true;
    */
  }

  get remainingWarmupTime(): string {
    if (this.isWarmingUp && this.prevFrameInfo) {
      const telemetry = this.prevFrameInfo.Telemetry;
      const timeOnSecs = telemetry.TimeOn / 1000;
      const secondsRemaining = 60 * 30 - timeOnSecs;
      const minsRemaining = Math.floor(secondsRemaining / 60);
      const seconds = secondsRemaining - minsRemaining * 60;
      return ` ${String(minsRemaining).padStart(2, "0")}:${String(
        Math.floor(seconds)
      ).padStart(2, "0")}`;
    }
    return "00:00";
  }

  get isDuringFFCEvent(): boolean {
    if (!this.isWarmingUp && this.prevFrameInfo) {
      const telemetry = this.prevFrameInfo.Telemetry;
      return (
        (telemetry.TimeOn - telemetry.LastFFCTime) / 1000 <
        FFC_SAFETY_DURATION_SECONDS
      );
    }
    return false;
  }

  get isGettingFrames(): boolean {
    // Did we receive any frames in the past second?
    return this.appState.lastFrameTime > new Date().getTime() - 1000;
  }

  get isConnected(): boolean {
    return (
      this.appState.cameraConnectionState === CameraConnectionState.Connected
    );
  }

  get isConnecting(): boolean {
    return (
      this.appState.cameraConnectionState === CameraConnectionState.Connecting
    );
  }

  get hasFaces(): boolean {
    return this.appState.faces.length !== 0;
  }

  get hasSingleFace(): boolean {
    return (
      this.appState.faces.length === 1 && this.appState.faces[0].roi !== null
    );
  }

  get hotspot(): Hotspot | null {
    if (this.hasFaces) {
      const cropBox = this.cropBoxPixelBounds;
      const hotspot = this.appState.faces[0].heatStats.foreheadHotspot;
      if (!hotspot) {
        return null;
      }
      if (
        hotspot.sensorX >= cropBox.x0 &&
        hotspot.sensorX < cropBox.x1 &&
        hotspot.sensorY >= cropBox.y0 &&
        hotspot.sensorY < cropBox.y1
      ) {
        return hotspot;
      }
    }
    return null;
  }

  get hasHotspot(): boolean {
    return this.hotspot !== null;
  }

  get numFaces(): number {
    return this.appState.faces.length;
  }

  get cropBoxPixelBounds(): BoundingBox {
    const cropBox = this.appState.currentCalibration.cropBox;
    let width = 120;
    let height = 160;
    if (this.prevFrameInfo) {
      const { ResX, ResY } = this.prevFrameInfo.Camera;
      width = ResX;
      height = ResY;
    }
    const onePercentWidth = width / 100;
    const onePercentHeight = height / 100;
    return {
      x0: Math.floor(onePercentWidth * cropBox.left),
      x1: width - Math.floor(onePercentWidth * cropBox.right),
      y0: Math.floor(onePercentHeight * cropBox.top),
      y1: height - Math.floor(onePercentHeight * cropBox.bottom)
    };
  }

  faceIsInsideCroppingArea(face: Face): boolean {
    const cropBoxPx = this.cropBoxPixelBounds;
    // TODO(jon): How much overlap do we allow?  Do we just need to encure that the forehead box
    // is inside the cropbox?
    return true;
  }

  private async onFrame(frame: Frame) {
    if (!frame.rotated) {
      frame.frameInfo.Camera.ResX = 120;
      frame.frameInfo.Camera.ResY = 160 + PADDING_TOP;
      frame.frame = rotate90(
        frame.frame,
        new Float32Array(
          frame.frameInfo.Camera.ResX * frame.frameInfo.Camera.ResY
        ),
        PADDING_TOP
      );

      // TODO(jon): If thermal ref is always in the same place, maybe mask out the entire bottom of the frame?
      // Just for visualisation purposes?
      frame.rotated = true;
    }
    this.appState.currentFrame = frame;
    this.appState.lastFrameTime = new Date().getTime();
    this.prevFrameInfo = frame.frameInfo;
    const { ResX: width, ResY: height } = frame.frameInfo.Camera;
    if (this.isWarmingUp) {
      this.advanceScreeningState(ScreeningState.WARMING_UP);
    } else {
      processSensorData(frame);
      // TODO(jon): Sanity check - if the thermal reference is moving from frame to frame,
      //  it's probably someones head...
      this.appState.thermalReference.roi = detectThermalReference(
        frame.medianed,
        frame.smoothed,
        this.appState.thermalReference.roi,
        width,
        height
      );
      if (this.hasThermalReference) {
        const thermalReference = this.appState.thermalReference;
        const thermalReferenceRoi = thermalReference.roi as ROIFeature;
        thermalReference.stats = extractSensorValueForCircle(
          thermalReferenceRoi,
          frame.medianed,
          width
        );
        thermalReferenceRoi.sensorValue = thermalReference.stats.median;

        const prevFace = new ROIFeature();
        if (this.hasFaces && this.hasSingleFace) {
          // Copy out prev face before it gets updated this frame, for later comparison
          const prev = this.appState.faces[0].roi as ROIFeature;
          prevFace.x0 = prev.x0;
          prevFace.x1 = prev.x1;
          prevFace.y0 = prev.y0;
          prevFace.y1 = prev.y1;
        }
        const debug = true;
        if (debug) {
          // TODO(jon): Maaaaaybe ditch haar altogether, and just look for silhouettes that look like head/shoulders
          //  at a certain scale.
          const roi = new ROIFeature();
          roi.x1 = width;
          roi.y1 = height;
          const newData = new Uint8Array(frame.smoothed.length);
          const threshold = getAdaptiveThreshold(
            frame.smoothed.slice(PADDING_TOP_OFFSET)
          );

          for (let i = PADDING_TOP_OFFSET; i < frame.smoothed.length; i++) {
            if (frame.smoothed[i] > threshold) {
              newData[i] = 255;
            }
          }
          // Remove contiguous blobs that have less than x area:
          // Basically flood fill
          // Get a bunch of spans.  If the spans overlap in x0..x1, they belong to a shape.
          this.prevShape = this.nextShape;
          let shapes: Shape[] = [];
          for (let y = PADDING_TOP; y < height; y++) {
            let span = { x0: -1, x1: width, y: y - PADDING_TOP, h: 0 };
            for (let x = 0; x < width; x++) {
              const index = y * width + x;
              if (newData[index] === 255 && span.x0 === -1) {
                span.x0 = x;
              }
              if (span.x0 !== -1 && (newData[index] === 0 || x === width - 1)) {
                if (x === width - 1 && newData[index] !== 0) {
                  span.x1 = width;
                } else {
                  span.x1 = x;
                }

                // Either put the span in an existing open shape, or start a new shape with it
                let assignedSpan = false;
                let n = shapes.length;
                let assignedShape;
                while (n !== 0) {
                  const shape = shapes.shift() as Shape;
                  const overlap = shape && spanOverlapsShape(span, shape);
                  if (overlap) {
                    // Merge shapes
                    if (!assignedSpan) {
                      assignedSpan = true;
                      if (shape[y - PADDING_TOP]) {
                        (shape[y - PADDING_TOP] as Span[]).push(span);
                      } else {
                        shape[y - PADDING_TOP] = [span];
                      }
                      assignedShape = shape;
                      shapes.push(shape);
                    } else {
                      // Merge this shape with the shape the span was assigned to.
                      mergeShapes(assignedShape as Shape, shape);
                    }
                  } else {
                    shapes.push(shape);
                  }
                  n--;
                }
                if (!assignedSpan) {
                  shapes.push({ [y - PADDING_TOP]: [span] });
                }
                span = { x0: -1, x1: width, y: y - PADDING_TOP, h: 0 };
              }
            }
          }
          if (!frameShapes[frame.frameInfo.Telemetry.FrameCount]) {
            frameShapes[frame.frameInfo.Telemetry.FrameCount] = JSON.parse(
              JSON.stringify(shapes)
            );
          } else if (!outputJSON) {
            outputJSON = true;
            console.log(JSON.stringify(frameShapes, null, "\t"));
          }
          // Remove too small shapes
          // TODO(jon): May want to make exceptions for small shapes at the left and right of the view, since they
          //  are likely to be people entering.
          shapes = shapes.filter(s => getAreaForShape(s) > 600);
          //shapes = shapes.filter(x => true);

          // TODO(jon): Special casing to add the thermal ref box in if it's inside the shape,
          // or to exclude it if it's outside the shape.

          // Infill vertical cracks.
          const solidShapes = [];
          for (const shape of shapes) {
            const solidShape: Span[] = [];
            for (const [row, spans] of Object.entries(shape)) {
              const minX0 = spans.reduce(
                (acc, span) => Math.min(acc, span.x0),
                Number.MAX_SAFE_INTEGER
              );
              const maxX1 = spans.reduce(
                (acc, span) => Math.max(acc, span.x1),
                0
              );
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

          // TODO(jon): Infill horizontal cracks.
          // TODO(jon): Mark where the shoulders flare out, and treat everything above that as a head.

          for (const shape of solidShapes) {
            // Check the intensity on either side of the threshold line.  If it's less than a certain threshold
            // we can greedily extend the span.
            /*
            for (const span of ordered) {
              let index = span.y * width + span.x1;
              let startVal = frame.smoothed[PADDING_TOP_OFFSET + (index - 1)];
              while (span.x1 < width) {
                index = span.y * width + span.x1;
                if (
                  Math.abs(
                    startVal - frame.smoothed[PADDING_TOP_OFFSET + index]
                  ) > 100
                ) {
                  // TODO(jon): Tune this threshold?
                  break;
                } else {
                  span.x1++;
                }
              }

              index = span.y * width + span.x0;
              startVal = frame.smoothed[PADDING_TOP_OFFSET + (index + 1)];
              while (span.x0 > 0) {
                index = span.y * width + span.x0;
                if (
                  Math.abs(
                    startVal - frame.smoothed[PADDING_TOP_OFFSET + index]
                  ) > 100
                ) {
                  break;
                } else {
                  span.x0--;
                }
              }
            }
            */

            // Maintain a rolling average of the x values, and if they suddenly diverge too much, smooth them out?
            {
              const changeThreshold = 3;
              for (let i = 1; i < shape.length; i++) {
                const prev = shape[i - 1];
                const curr = shape[i];
                // TODO(jon): Look at the average rate of change over the last X spans, and then see if we suddenly deviate from that.
                let hPrev = 0;
                let hCurr = 0;

                // TODO(jon): Mark the discontinuities, then do a second pass to join them up.
                if (prev.x0 - curr.x0 > changeThreshold) {
                  // Prev is bigger, mark prev
                  hCurr |= 1 << 0;
                }
                if (curr.x0 - prev.x0 > changeThreshold) {
                  hPrev |= 1 << 0;
                }
                if (curr.x1 - prev.x1 > changeThreshold) {
                  hCurr |= 1 << 1;
                }
                if (prev.x1 - curr.x1 > changeThreshold) {
                  hCurr |= 1 << 1;
                  hPrev |= 1 << 1;
                }
                prev.h |= hPrev;
                curr.h |= hCurr;
              }

              let leftOpen = null;
              let rightOpen = null;
              const firstY = shape[0].y;
              for (const span of shape) {
                //console.log(span.h);
                if (span.h === 2 || span.h === 3) {
                  if (rightOpen) {
                    // Join up with previous open and the close the
                    const dY = Math.abs(span.y - rightOpen.y) + 1;
                    if (dY < 20) {
                      const dX = span.x1 - rightOpen.x1;
                      const incX = dX / dY;
                      let inc = 1;
                      for (
                        let i = rightOpen.y - firstY + 1;
                        i < span.y - firstY;
                        i++
                      ) {
                        shape[i].x1 = Math.round(rightOpen.x1 + incX * inc);
                        inc++;
                      }
                    }
                    if (span.h === 2) {
                      rightOpen = null;
                    }
                  } else {
                    rightOpen = span;
                  }
                }
                if (span.h === 1 || span.h == 3) {
                  if (leftOpen) {
                    // Join up with previous open and the close the
                    const dY = Math.abs(span.y - leftOpen.y) + 1;
                    if (dY < 20) {
                      const dX = span.x0 - leftOpen.x0;
                      const incX = dX / dY;
                      let inc = 1;
                      for (
                        let i = leftOpen.y - firstY + 1;
                        i < span.y - firstY;
                        i++
                      ) {
                        shape[i].x0 = Math.round(leftOpen.x0 + incX * inc);
                        inc++;
                      }
                    }
                    if (span.h === 1) {
                      leftOpen = null;
                    }
                  } else {
                    leftOpen = span;
                  }
                }
              }
            }

            // If it's a person, we want the shape to go all the way to the bottom of the frame.
            // The width of the bottom span should not be too different from the width of the widest span.

            //If we're on the left-hand side of the shape,

            // If a span sticks out more than the one above and the one below, smooth it.
            // for (let i = 1; i < ordered.length - 1; i++) {
            //   const prev = ordered[i - 1];
            //   const curr = ordered[i];
            //   const next = ordered[i + 1];
            //   if (prev.x1 === next.x1 && curr.x1 !== next.x1) {
            //     curr.x1 = next.x1;
            //   }
            //   if (prev.x0 === next.x0 && curr.x0 !== next.x0) {
            //     curr.x0 = next.x0;
            //   }
            // }
          }

          if (solidShapes.length) {
            this.nextShape = solidShapes;
          } else {
            this.nextShape = [];
          }

          if (this.$refs.debugCanvas) {
            // Colour shapes:
            const ctx = this.$refs.debugCanvas.getContext(
              "2d"
            ) as CanvasRenderingContext2D;
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
              0xff0000ff,
              0xff0000ff,
              0xff0000ff,
              0xff0000ff,
              0xff0000ff,
              0xff0000ff,
              0xff0000ff,
              0xff0000ff
            ];

            for (const shape of solidShapes) {
              const colour = colours.shift() as number;
              for (const span of shape) {
                //for (const span of row) {
                let i = span.x0;
                if (span.x0 >= span.x1) {
                  console.warn("Weird spans", span.x0, span.x1);
                  //debugger;
                  continue;
                }
                do {
                  if (span.h === 0) {
                    data[span.y * width + i] = colour;
                  } else if (span.h === 3) {
                    data[span.y * width + i] =
                      (255 << 24) | (200 << 16) | (200 << 8) | 0;
                  } else if (span.h === 1) {
                    data[span.y * width + i] =
                      (255 << 24) | (0 << 16) | (0 << 8) | 200;
                  } else if (span.h === 2) {
                    data[span.y * width + i] =
                      (255 << 24) | (0 << 16) | (200 << 8) | 0;
                  }
                  i++;
                } while (i < span.x1);
              }
            }
            ctx.putImageData(img, 0, 0);
          }

          // const orig = cv.matFromArray(
          //   height,
          //   width,
          //   cv.CV_32FC1,
          //   frame.smoothed
          // );
          // const normed = new cv.Mat();
          // cv.normalize(orig, orig, 0, 255, cv.NORM_MINMAX, cv.CV_8UC1);
          // cv.threshold(orig, normed, 70, 255, cv.THRESH_BINARY);
          // // const kernel = cv.Mat.ones(5, 5, cv.CV_8U);
          // // cv.morphologyEx(normed, normed, cv.MORPH_CLOSE, kernel);
          // // kernel.delete();
          // cv.imshow("debug-canvas-2", normed);
          // const kernel = cv.Mat.ones(5, 5, cv.CV_8U);
          // cv.morphologyEx(normed, normed, cv.MORPH_OPEN, kernel);
          // kernel.delete();
          //const contours = (getContourData(roiCrop) as unknown) as Contours;
          //
          // const ctx = this.$refs.debugCanvas.getContext("2d");
          // const data = ctx.getImageData(0, 0, 160, 120);
          // //for (let i = 0; i < roiCrop)
          // ctx.putImageData(data, 0, 0);
          // const shapes = shapeData(contours, roi.x0, roi.y0);
          // console.log(shapes);
          //
          //cv.imshow("debug-canvas", orig);
          // orig.delete();
          // normed.delete();

          // Draw the silhouette
          //contours.delete();
        }
        let faces = await findFacesInFrameAsync(
          frame.smoothed,
          frame.frame,
          width,
          height,
          FaceRecognitionModel(),
          this.appState.faces,
          thermalReferenceRoi,
          frame.frameInfo
        );
        // NOTE: Filter out any faces that are wider than they are tall.
        faces = faces.filter(face => face.width() <= face.height());

        //faces = faces.filter(face => face.width() > 22);
        // TODO(jon): At this stage we can say that there are faces, and tell people to come closer/stand on the mark.

        // Remove faces that overlap thermal ref
        faces = faces.filter(
          face => !face.haarFace.overlapsROI(thermalReferenceRoi)
        );

        if (faces.length !== 0) {
          if (faces.length === 1) {
            const face = faces[0];
            if (face.roi !== null) {
              if (
                face.isFrontOn &&
                this.faceIsInsideCroppingArea(face) &&
                !this.isDuringFFCEvent
              ) {
                // console.assert(
                //   this.hasFaces && this.hasSingleFace,
                //   "Should already have a face from previous frame"
                // );

                if (
                  this.appState.currentScreeningState ===
                    ScreeningState.FRONTAL_LOCK &&
                  !face.hasMovedOrChangedInSize(prevFace)
                ) {
                  if (this.advanceScreeningState(ScreeningState.STABLE_LOCK)) {
                    // Take the screening event here
                    this.recordScreeningEvent(thermalReferenceRoi, face, frame);
                  }
                } else if (
                  this.appState.currentScreeningState ===
                  ScreeningState.STABLE_LOCK
                ) {
                  this.advanceScreeningState(ScreeningState.LEAVING);
                } else {
                  this.advanceScreeningState(ScreeningState.FRONTAL_LOCK);
                }
              } else {
                // NOTE: Could stay here a while if we're in an FFC event.
                this.advanceScreeningState(ScreeningState.FACE_LOCK);
              }
            } else {
              this.advanceScreeningState(ScreeningState.HEAD_LOCK);
            }
          } else {
            this.advanceScreeningState(ScreeningState.MULTIPLE_HEADS);
          }
        } else {
          this.advanceScreeningState(ScreeningState.READY);
        }
        this.appState.faces = faces;
      } else {
        // TODO(jon): Possibly thermal reference error?
        this.advanceScreeningState(ScreeningState.WARMING_UP);
      }
    }
    this.frameCounter++;
  }

  recordScreeningEvent(thermalReference: ROIFeature, face: Face, frame: Frame) {
    this.appState.currentScreeningEvent = {
      rawTemperatureValue: this.hotspot!.sensorValue,
      frame, // Really, we should be able to recreate the temperature value just from the frame + telemetry?
      timestamp: new Date().getTime(),
      thermalReferenceRawValue: thermalReference.sensorValue
    };
    console.log("Record screening event", frame, face);
    return;
  }

  onConnectionStateChange(connection: CameraConnectionState) {
    this.appState.cameraConnectionState = connection;
  }

  private startFrame = 0; //130; //0; //39; //116;
  async beforeMount() {
    clearTimeout(this.frameTimeout);
    /*
    // On startup:
    // Load the face recognition model
    // NOTE: Don't add this to the Vue state tree, since its state never changes.
    FaceRecognitionModel = await loadFaceRecognitionModel("/cascade_stg17.xml");

    console.log(JSON.stringify(FaceRecognitionModel, null, "\t"));

    // Open the camera connection


    new CameraConnection(
      "http://localhost:2041",
      this.onFrame,
      this.onConnectionStateChange
    );
    );
    */
    const useLiveCamera = false;
    if (useLiveCamera) {
      new CameraConnection(
        "http://192.168.178.37",
        this.onFrame,
        this.onConnectionStateChange
      );
    } else {
      // TODO(jon): Queue multiple files
      cptvPlayer = await import("../pkg/cptv_player");
      //const cptvFile = await fetch("/cptv-files/twopeople-calibration.cptv");
      const cptvFile = await fetch("cptv-files/20200716.153101.633.cptv"); // Jon
      //const cptvFile = await fetch("/cptv-files/20200716.153342.441.cptv"); // Jon (too high in frame)
      //const cptvFile = await fetch("/cptv-files/20200718.130624.941.cptv"); // Sara

      //const cptvFile = await fetch("/cptv-files/20200718.130606.382.cptv"); // Sara
      // const cptvFile = await fetch("/cptv-files/20200718.130536.950.cptv"); // Sara (fringe)
      //const cptvFile = await fetch("/cptv-files/20200718.130508.586.cptv"); // Sara (fringe)
      //const cptvFile = await fetch("/cptv-files/20200718.130059.393.cptv"); // Jon
      // const cptvFile = await fetch("/cptv-files/20200718.130017.220.cptv"); // Jon
      //
      //const cptvFile = await fetch("/cptv-files/walking through Shaun.cptv");
      //const cptvFile = await fetch("/cptv-files/looking_down.cptv");
      // const cptvFile = await fetch(
      //   "/cptv-files/detecting part then whole face repeatedly.cptv"
      // );
      //frontend\public\cptv-files\detecting part then whole face repeatedly.cptv
      // const cptvFile = await fetch(
      //   "/cptv-files/walking towards camera - calibrated at 2m.cptv"
      // );
      const buffer = await cptvFile.arrayBuffer();
      // 30, 113, 141
      await this.playLocalCptvFile(buffer, this.startFrame);
      //if (this.appState.paused) {
      //this.processFrame();
    }

    //new LocalCameraConnection(this.onFrame, this.onConnectionStateChange);
  }
}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  background: #999;
}

.frame-controls {
  position: absolute;
  top: 480px;
  right: 10px;
}
.connection-info {
  text-align: left;
  padding: 10px;
}
.temperature {
  font-size: 20px;
  font-weight: bold;
}

#debug-canvas,
#debug-canvas-2 {
  transform: scaleX(-1);
}

#debug-canvas,
#debug-canvas-2 {
  zoom: 4;
  background: black;
  image-rendering: pixelated;
}
</style>
