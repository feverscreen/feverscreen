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
      <canvas ref="debugCanvas" id="debug-canvas" width="120" height="160" />
      <canvas ref="debugCanvas2" id="debug-canvas-2" width="120" height="185" />
      <canvas ref="debugCanvas3" id="debug-canvas-3" width="256" height="120" />
      <FakeThermalCameraControls
        :paused="appState.paused"
        :playing-local="playingLocal"
        @toggle-playback="onTogglePlayback"
      />
      <div class="frame-controls">
        <v-btn @click="stepFrame">Step</v-btn>
        <v-btn @click="processFrame">Process</v-btn>
      </div>
      <div v-if="false && isAdminScreen" class="connection-info">
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
          Thermal ref value: {{ Math.round(thermalReferenceRawValue) }}
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
import { extractSensorValueForCircle } from "@/circle-detection";
import { Contours, Face, Hotspot, shapeData } from "@/face";
import FakeThermalCameraControls from "@/components/FakeThermalCameraControls.vue";
import { FrameInfo, TemperatureSource } from "@/api/types";
import {
  AppState,
  BezierCtrlPoint,
  BoundingBox,
  CropBox,
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
  mKToCelsius,
  temperatureForSensorValue
} from "@/utils";
import fitCurve from "fit-curve";

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
  thermalReference: null,
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

@Component({
  components: {
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

  public get playingLocal(): boolean {
    return this.droppedDebugFile;
  }

  $refs!: {
    debugCanvas: HTMLCanvasElement;
    debugCanvas3: HTMLCanvasElement;
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
    return this.appState.thermalReference?.sensorValue || 0;
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
          this.appState.currentFrame!.frameInfo
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

  get thermalReferenceTemp(): DegreesCelsius {
    return mKToCelsius(this.thermalReferenceRawValue);
  }

  get currentFrame(): Frame {
    return this.appState.currentFrame as Frame;
  }

  get hasThermalReference(): boolean {
    return this.appState.thermalReference !== null;
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
    const paddingTop = 25;
    if (!frame.rotated) {
      frame.frameInfo.Camera.ResX = 120;
      frame.frameInfo.Camera.ResY = 160 + paddingTop;
      frame.frame = rotate90(
        frame.frame,
        new Float32Array(
          frame.frameInfo.Camera.ResX * frame.frameInfo.Camera.ResY
        ),
        paddingTop
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
      const { smoothedData, saltPepperData } = processSensorData(frame);
      // TODO(jon): Sanity check - if the thermal reference is moving from frame to frame,
      //  it's probably someones head...
      this.appState.thermalReference = detectThermalReference(
        saltPepperData,
        smoothedData,
        this.appState.thermalReference,
        width,
        height
      );
      if (this.hasThermalReference) {
        const thermalReference = this.appState.thermalReference as ROIFeature;
        thermalReference.sensorValue = extractSensorValueForCircle(
          thermalReference,
          saltPepperData,
          width
        );

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
          const roi = new ROIFeature();
          const cv = (window as any).cv as any;
          roi.x1 = width;
          roi.y1 = height;

          // TODO(jon): Move all this processing into UserFacingScreening
          // Get min and max of frame.
          let max = 0;
          let min = Number.MAX_SAFE_INTEGER;
          for (let i = 0; i < smoothedData.length; i++) {
            const f32Val = smoothedData[i];
            if (f32Val < min) {
              min = f32Val;
            }
            if (f32Val > max) {
              max = f32Val;
            }
          }

          const histogram = new Uint16Array(256);
          const newData = new Uint8Array(smoothedData.length);
          // TODO(jon): Find an adaptive threshold within the known range of useful temperatures.

          // The histogram is usually bi-modal.
          // Try to isolate the second smaller hump.

          const padding = paddingTop * width;
          for (let i = padding; i < smoothedData.length; i++) {
            // If within a few degrees of constant heatsource white else black.
            const v = ((smoothedData[i] - min) / (max - min)) * 255.0;
            histogram[Math.floor(v)] += 1;
            // TODO(jon): Maybe allow ourselves to keep going unless we hit an edge?
            if (
              Math.abs(thermalReference.sensorValue - smoothedData[i]) < 800
            ) {
              newData[i] = 255; //smoothedData[i];
            }
          }
          // Remove contiguous blobs that have less than x area:
          // Basically flood fill
          // Get a bunch of spans.  If the spans overlap in x0..x1, they belong to a shape.
          this.prevShape = this.nextShape;
          let shapes: Shape[] = [];
          for (let y = paddingTop; y < height; y++) {
            let span = { x0: -1, x1: width, y: y - paddingTop };
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
                      if (shape[y - paddingTop]) {
                        (shape[y - paddingTop] as Span[]).push(span);
                      } else {
                        shape[y - paddingTop] = [span];
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
                  shapes.push({ [y - paddingTop]: [span] });
                }
                span = { x0: -1, x1: width, y: y - paddingTop };
              }
            }
          }
          // Remove too small shapes
          shapes = shapes.filter(s => getAreaForShape(s) > 600);

          // Infill vertical cracks.
          const solidShapes = [];
          for (const shape of shapes) {
            const solidShape: Record<number, Span> = {};
            for (const [row, spans] of Object.entries(shape)) {
              const minX0 = spans.reduce(
                (acc, span) => Math.min(acc, span.x0),
                Number.MAX_SAFE_INTEGER
              );
              const maxX1 = spans.reduce(
                (acc, span) => Math.max(acc, span.x1),
                0
              );
              solidShape[Number(row)] = {
                x0: minX0,
                x1: maxX1,
                y: Number(row)
              };
            }
            solidShapes.push(solidShape);
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

            for (const shape of shapes) {
              const colour = colours.shift() as number;
              for (const row of Object.values(shape)) {
                for (const span of row) {
                  let i = span.x0;
                  do {
                    data[span.y * width + i] = colour;
                    i++;
                  } while (i < span.x1);
                }
              }
            }
            ctx.putImageData(img, 0, 0);
          }

          {
            const canvas = document.getElementById(
              "debug-canvas-3"
            ) as HTMLCanvasElement;
            const ctx2 = canvas.getContext("2d") as CanvasRenderingContext2D;
            ctx2.clearRect(0, 0, canvas.width, canvas.height);
            const max = Math.max(...histogram);
            ctx2.fillStyle = "red";
            ctx2.beginPath();
            for (let x = 0; x < histogram.length; x++) {
              const bucket = histogram[x];
              const v = (bucket / max) * canvas.height;
              ctx2.rect(x, canvas.height - v, 1, v);
            }
            ctx2.fill();
          }

          const orig = cv.matFromArray(
            height,
            width,
            cv.CV_32FC1,
            smoothedData
          );
          const normed = new cv.Mat();
          cv.normalize(orig, orig, 0, 255, cv.NORM_MINMAX, cv.CV_8UC1);
          cv.threshold(orig, normed, 70, 255, cv.THRESH_BINARY);
          //const kernel = cv.Mat.ones(5, 5, cv.CV_8U);
          //cv.morphologyEx(normed, normed, cv.MORPH_OPEN, kernel);
          cv.imshow("debug-canvas-2", normed);
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
          orig.delete();
          // Draw the silhouette
          //contours.delete();
        }

        let faces = await findFacesInFrameAsync(
          smoothedData,
          saltPepperData,
          width,
          height,
          FaceRecognitionModel(),
          this.appState.faces,
          thermalReference,
          frame.frameInfo
        );
        // NOTE: Filter out any faces that are wider than they are tall.
        faces = faces.filter(face => face.width() <= face.height());

        faces = faces.filter(face => face.width() > 22);
        // TODO(jon): At this stage we can say that there are faces, and tell people to come closer/stand on the mark.

        // Remove faces that overlap thermal ref
        faces = faces.filter(
          face => !face.haarFace.overlapsROI(thermalReference)
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
                    this.recordScreeningEvent(thermalReference, face, frame);
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
      //const cptvFile = await fetch("/cptv-files/20200718.130536.950.cptv"); // Sara
      //const cptvFile = await fetch("/cptv-files/20200718.130508.586.cptv"); // Sara
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
#debug-canvas-2,
#debug-canvas-3 {
  zoom: 3;
  border: 1px solid orange;
  background: black;
  image-rendering: pixelated;
}
</style>
