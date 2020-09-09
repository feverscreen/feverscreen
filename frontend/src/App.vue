<template>
  <v-app id="app" @skip-warmup="skipWarmup">
    <UserFacingScreening
      :on-reference-device="isReferenceDevice"
      :state="appState.currentScreeningState"
      :screening-event="appState.currentScreeningEvent"
      :calibration="appState.currentCalibration"
      :face="appState.face"
      :warmup-seconds-remaining="remainingWarmupTime"
      :shapes="[prevShape, nextShape]"
    />
    <v-dialog v-model="showSoftwareVersionUpdatedPrompt" width="500">
      <v-card>
        <v-card-title>
          This software has been updated. {{ appVersion }}
        </v-card-title>
        <v-card-actions center>
          <v-btn text @click="e => (showSoftwareVersionUpdatedPrompt = false)">
            Proceed
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="showUpdatedCalibrationSnackbar">
      Calibration was updated
    </v-snackbar>
    <div class="debug-video">
      <VideoStream
        v-if="!isReferenceDevice && appState.currentFrame"
        :frame="appState.currentFrame.smoothed"
        :thermal-reference="appState.thermalReference"
        :thermal-reference-stats="appState.thermalReferenceStats"
        :face="appState.face"
        :crop-box="cropBoxPixelBounds"
        :crop-enabled="false"
        :draw-overlays="true"
        :hull="hull"
      />
    </div>
  </v-app>
</template>

<script lang="ts">
import AdminScreening from "@/components/AdminScreening.vue";
import UserFacingScreening from "@/components/UserFacingScreening.vue";
import { Component, Vue } from "vue-property-decorator";
import { CameraConnection, CameraConnectionState, Frame } from "@/camera";
import {
  advanceWorker,
  extractBodyInfo,
  ImageInfo,
  processSensorData,
  SmoothedImages
} from "@/processing";
import { detectThermalReference } from "@/feature-detection";
import { extractSensorValueForCircle } from "@/circle-detection";
import { Hotspot } from "@/face";
import FakeThermalCameraControls from "@/components/FakeThermalCameraControls.vue";
import { CalibrationInfo, FrameInfo, TemperatureSource } from "@/api/types";
import { DeviceApi, ScreeningApi } from "@/api/api";
import {
  AppState,
  BoundingBox,
  CropBox,
  MotionStats,
  ScreeningAcceptanceStates,
  ScreeningEvent,
  ScreeningState
} from "@/types";
import FpsCounter from "@/components/FpsCounter.vue";
import { FrameHeaderV2 } from "../cptv-player";
import { ROIFeature } from "@/worker-fns";
import {
  checkForSoftwareUpdates,
  DegreesCelsius,
  mKToCelsius,
  temperatureForSensorValue
} from "@/utils";
import Histogram from "@/components/Histogram.vue";
import {
  getHottestSpotInBounds,
  ImmutableShape,
  LerpAmount,
  Point
} from "@/shape-processing";
import {
  advanceState,
  FFC_SAFETY_DURATION_SECONDS,
  State,
  WARMUP_TIME_SECONDS
} from "@/main";
import { FaceInfo } from "@/body-detection";
import VideoStream from "@/components/VideoStream.vue";
import { extendToBottom, shapeArea } from "@/geom";

const InitialFrameInfo = {
  Camera: {
    ResX: 160,
    ResY: 120,
    FPS: 9,
    Brand: "flir",
    Model: "lepton3.5",
    Firmware: "3.3.26",
    CameraSerial: 12345
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
  AppVersion: "",
  BinaryVersion: "",
  Calibration: {
    ThermalRefTemp: 38,
    SnapshotTime: 0,
    TemperatureCelsius: 34,
    SnapshotValue: 0,
    SnapshotUncertainty: 0,
    BodyLocation: TemperatureSource.FOREHEAD,
    ThresholdMinFever: 0,
    Bottom: 0,
    Top: 0,
    Left: 0,
    Right: 0,
    CalibrationBinaryVersion: "fsdfd",
    UuidOfUpdater: 432423432432
  }
};

let cptvPlayer: any;

const c = document.createElement("canvas") as HTMLCanvasElement;
c.width = 120;
c.height = 160;

// let outputJSON = false;
// How much we pad out the top for helping haar cascade to work.  We don't need this if we get rid of haar.

@Component({
  components: {
    Histogram,
    FakeThermalCameraControls,
    AdminScreening,
    UserFacingScreening,
    FpsCounter,
    VideoStream
  }
})
export default class App extends Vue {
  private deviceID = 0;
  private deviceName = "";
  private appState: AppState = State;
  private appVersion = "";
  private isNotFullscreen = true;
  private showUpdatedCalibrationSnackbar = false;
  private prevFrameInfo: FrameInfo | null = null;
  private droppedDebugFile = false;
  private frameCounter = 0;
  private frameTimeout = 0;
  get isReferenceDevice(): boolean {
    return (
      window.navigator.userAgent.includes("Lenovo TB-X605LC") ||
      this.isRunningInAndroidWebview
    );
  }

  get isRunningInAndroidWebview(): boolean {
    return window.navigator.userAgent === "feverscreen-app";
  }

  get isFakeReferenceDevice(): boolean {
    return window.navigator.userAgent.includes("Fake");
  }
  async enableFullscreen() {
    try {
      await document.body.requestFullscreen();
      this.isNotFullscreen = false;
    } catch (e) {
      return;
    }
  }
  get isAdminScreen(): boolean {
    return true;
  }

  private thresholdValue = 0;
  private skippedWarmup = false;
  private prevShape: ImmutableShape[] = [];
  private nextShape: ImmutableShape[] = [];

  onThresholdChange(val: number) {
    this.thresholdValue = val;
  }

  public get playingLocal(): boolean {
    return this.droppedDebugFile;
  }

  $refs!: {
    debugCanvas: HTMLCanvasElement;
  };

  private skipWarmup() {
    this.skippedWarmup = true;
  }

  public advanceScreeningState(nextState: ScreeningState) {
    // We can only move from certain states to certain other states.
    const prevState = this.appState.currentScreeningState;
    if (prevState !== nextState) {
      const allowedNextState = ScreeningAcceptanceStates[prevState];
      if ((allowedNextState as ScreeningState[]).includes(nextState)) {
        this.appState.currentScreeningState = nextState;
        this.appState.currentScreeningStateFrameCount = 1;
      }
    } else {
      this.appState.currentScreeningStateFrameCount++;
    }
  }

  public get thermalReferenceRawValue(): number {
    return (
      (this.appState.thermalReference &&
        this.appState.thermalReference.sensorValue) ||
      0
    );
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
    //return 5000;
    if (this.appState.currentFrame) {
      return 1000 / 9; //this.appState.currentFrame.frameInfo.Camera.FPS;
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

  updateCalibration(nextCalibration: CalibrationInfo, firstLoad = false) {
    if (!firstLoad && this.appState.uuid !== nextCalibration.UuidOfUpdater) {
      this.showUpdatedCalibrationSnackbar = true;
      setTimeout(() => {
        this.showUpdatedCalibrationSnackbar = false;
      }, 3000);
    }
    this.appState.currentCalibration.thermalRefTemperature = new DegreesCelsius(
      nextCalibration.ThermalRefTemp
    );
    this.appState.currentCalibration.calibrationTemperature = new DegreesCelsius(
      nextCalibration.TemperatureCelsius
    );
    this.appState.currentCalibration.thresholdMinFever =
      nextCalibration.ThresholdMinFever;
    this.appState.currentCalibration.cropBox = {
      top: nextCalibration.Top,
      right: nextCalibration.Right,
      bottom: nextCalibration.Bottom,
      left: nextCalibration.Left
    };
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
      let rotated = false;
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

      const { appVersion, binaryVersion } = JSON.parse(
        window.localStorage.getItem("softwareVersion") || '""'
      );
      this.appState.currentFrame = {
        frame: new Float32Array(new Uint16Array(frameBuffer)),
        rotated,
        frameInfo:
          (frameInfo! && {
            ...InitialFrameInfo,
            AppVersion: appVersion,
            BinaryVersion: binaryVersion,
            Telemetry: {
              ...InitialFrameInfo.Telemetry,
              LastFFCTime: frameInfo!.last_ffc_time,
              FrameCount: frameInfo!.frame_number,
              TimeOn: frameInfo!.time_on
            }
          }) ||
          this.appState.currentFrame!.frameInfo,
        smoothed: new Float32Array(),
        medianed: new Float32Array(),
        threshold: 0,
        min: 0,
        max: 0
      };
      // Rotate the frame.
      //rotateFrame(this.appState.currentFrame);

      // TODO(jon): If thermal ref is always in the same place, maybe mask out the entire bottom of the frame?
      // Just for visualisation purposes?

      if (!this.appState.paused) {
        this.onFrame(this.appState.currentFrame);
        if (this.startFrame !== 0) {
          this.appState.paused = true;
        }
      }
      this.frameTimeout = (setTimeout(
        getNextFrame,
        this.frameInterval
      ) as unknown) as number;
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

  get thermalReferenceTemp(): DegreesCelsius {
    return mKToCelsius(this.thermalReferenceRawValue);
  }

  get currentFrame(): Frame {
    return this.appState.currentFrame as Frame;
  }

  get hasThermalReference(): boolean {
    return this.appState.thermalReference !== null;
  }

  get timeOnInSeconds(): number {
    if (this.prevFrameInfo) {
      const telemetry = this.prevFrameInfo.Telemetry;
      let timeOnSecs;
      // NOTE: TimeOn is in nanoseconds when coming from the camera server, but in milliseconds when coming
      // from a CPTV file - should make these the same.
      if (this.useLiveCamera) {
        timeOnSecs = telemetry.TimeOn / 1000 / 1000 / 1000;
      } else {
        timeOnSecs = telemetry.TimeOn / 1000;
      }
      return timeOnSecs;
    }
    return WARMUP_TIME_SECONDS;
  }

  get isWarmingUp(): boolean {
    return !this.skippedWarmup && this.timeOnInSeconds < WARMUP_TIME_SECONDS;
  }

  get remainingWarmupTime(): number {
    if (this.skippedWarmup) {
      return 0;
    }
    return Math.max(0, WARMUP_TIME_SECONDS - this.timeOnInSeconds);
  }

  get isDuringFFCEvent(): boolean {
    if (!this.isWarmingUp && this.prevFrameInfo) {
      const telemetry = this.prevFrameInfo.Telemetry;
      // TODO(jon): This needs to change based on whether camera is live or not
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

  get hasFace(): boolean {
    return false; //this.appState.face !== null;
  }

  get hotspot(): Hotspot | null {
    // TODO(jon): Extract this from the radial smoothed data.
    if (this.hasFace) {
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

  public hull: { head: Uint8Array; body: Uint8Array } = {
    head: new Uint8Array(0),
    body: new Uint8Array(0)
  };

  get hasHotspot(): boolean {
    return this.hotspot !== null;
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

  private updateBodyOutline(
    headHull: Uint8Array,
    bodyHull: Uint8Array
  ): number {
    this.prevShape = this.nextShape;
    // rasterise the hulls
    const context = c.getContext("2d") as CanvasRenderingContext2D;
    context.clearRect(0, 0, 120, 160);
    if (headHull.length) {
      const h = headHull;
      context.fillStyle = "red";
      context.beginPath();
      context.moveTo(h[0], h[1]);
      for (let i = 2; i < h.length; i++) {
        context.lineTo(h[i], h[i + 1]);
        i++;
      }
      context.lineTo(h[0], h[1]);
      context.fill();
    }
    if (bodyHull.length) {
      const h = bodyHull;
      context.fillStyle = "red";
      context.beginPath();
      context.moveTo(h[0], h[1]);
      for (let i = 2; i < h.length; i++) {
        context.lineTo(h[i], h[i + 1]);
        i++;
      }
      context.lineTo(h[0], h[1]);
      context.fill();
    }

    // Get the raw shapes, solid shapes
    const img = context.getImageData(0, 0, 120, 160);
    const data = new Uint32Array(img.data.buffer);
    const shape = [];
    for (let y = 0; y < 160; y++) {
      let span = null;
      for (let x = 0; x < 120; x++) {
        const index = y * 120 + x;
        if (data[index] & 0x000000ff) {
          // Filled.
          if (!span) {
            span = { x0: x, x1: 120, y };
          }
        } else if (span) {
          span.x1 = x;
          break;
        }
      }
      if (span) {
        shape.push(span);
      }
    }
    LerpAmount.amount = 0.0;
    if (shape.length) {
      this.nextShape = [Object.freeze(extendToBottom(shape))];
    } else {
      this.nextShape = [];
    }
    return shapeArea(shape);
  }

  samplePointIsInsideCroppingArea(point: Point): boolean {
    const cropBoxPx = this.cropBoxPixelBounds;
    return (
      cropBoxPx.x0 < point.x &&
      cropBoxPx.x1 >= point.x &&
      cropBoxPx.y0 < point.y &&
      cropBoxPx.y1 >= point.y
    );
  }

  private checkForSoftwareUpdatesThisFrame(frame: Frame) {
    const newLine = frame.frameInfo.AppVersion.indexOf("\n");
    if (newLine !== -1) {
      frame.frameInfo.AppVersion = frame.frameInfo.AppVersion.substring(
        0,
        newLine
      );
    }
    // Did the software get updated?
    checkForSoftwareUpdates(
      frame.frameInfo.BinaryVersion,
      frame.frameInfo.AppVersion
    );
  }

  private checkForCalibrationUpdatesThisFrame(frame: Frame) {
    if (this.prevFrameInfo) {
      const prevCalibration = JSON.stringify(this.prevFrameInfo.Calibration);
      const nextCalibration = JSON.stringify(frame.frameInfo.Calibration);
      if (prevCalibration !== nextCalibration) {
        this.updateCalibration(frame.frameInfo.Calibration);
      }
    }
  }

  private updateThermalReference(
    medianSmoothed: Float32Array,
    edgeData: Float32Array,
    prevThermalRef: ROIFeature | null,
    width: number,
    height: number
  ) {
    const thermalReference = detectThermalReference(
      medianSmoothed,
      edgeData,
      prevThermalRef,
      width,
      height
    );
    if (thermalReference) {
      this.appState.thermalReferenceStats = Object.freeze(
        extractSensorValueForCircle(thermalReference, medianSmoothed, width)
      );
      thermalReference.sensorValue = this.appState.thermalReferenceStats.median;
    }
    this.appState.thermalReference = thermalReference;
  }

  private hasBodyThisFrame(
    bodyArea: number,
    prevBodyArea: number,
    motionStats: MotionStats,
    prevMotionStats: MotionStats
  ): boolean {
    const prevHasBody =
      prevMotionStats.face.isValid ||
      (prevMotionStats.frameBottomSum !== 0 &&
        prevMotionStats.motionThresholdSum > 45);

    let hasBody =
      motionStats.face.isValid ||
      (motionStats.frameBottomSum !== 0 && motionStats.motionThresholdSum > 45);
    if (
      !hasBody &&
      prevHasBody &&
      prevBodyArea > 2000 &&
      motionStats.motionSum < 500
    ) {
      hasBody = true;
    } else {
      this.prevBodyArea = bodyArea;
    }
    this.appState.motionStats = motionStats;
    return hasBody;
  }

  private prevBodyArea = 0;
  private prevSmoothed = new Float32Array(120 * 160);
  private async onFrame(frame: Frame) {
    advanceWorker();
    const frameNumber = frame.frameInfo.Telemetry.FrameCount;
    this.checkForSoftwareUpdatesThisFrame(frame);
    this.checkForCalibrationUpdatesThisFrame(frame);
    this.appState.lastFrameTime = new Date().getTime();
    this.prevFrameInfo = frame.frameInfo;

    const prevThermalRef = this.appState.thermalReference;
    const thermalRefC = temperatureForSensorValue(
      this.appState.currentCalibration.calibrationTemperature.val,
      prevThermalRef?.sensorValue || 0,
      prevThermalRef?.sensorValue || 0
    ).val;

    // TODO(jon): Split this up into smoothing + processing.

    // Do all the processing in a wasm worker
    const { medianSmoothed, radialSmoothed } = (await processSensorData(
      frame,
      this.prevSmoothed
    )) as SmoothedImages;
    this.prevSmoothed = radialSmoothed;
    const {
      motionStats,
      edgeData,
      headHull,
      bodyHull
    } = (await extractBodyInfo(prevThermalRef, thermalRefC)) as ImageInfo;
    const face = motionStats.face;
    const width = 120;
    const height = 160;

    this.hull = { head: headHull, body: bodyHull };
    frame.smoothed = radialSmoothed;
    frame.medianed = medianSmoothed;
    frame.threshold = motionStats.heatStats.threshold;
    frame.min = motionStats.heatStats.min;
    frame.max = motionStats.heatStats.max;
    this.appState.prevFrame = frame;
    this.updateThermalReference(
      medianSmoothed,
      edgeData,
      prevThermalRef,
      width,
      height
    );

    if (this.isWarmingUp) {
      this.advanceScreeningState(ScreeningState.WARMING_UP);
    } else if (!this.appState.thermalReference) {
      this.advanceScreeningState(ScreeningState.MISSING_THERMAL_REF);
    } else {
      const bodyArea = this.updateBodyOutline(headHull, bodyHull);
      const hasBody = this.hasBodyThisFrame(
        bodyArea,
        this.prevBodyArea,
        motionStats,
        this.appState.motionStats
      );
      if (hasBody) {
        if (this.nextShape.length === 0) {
          this.nextShape = this.prevShape;
        }
        // STATE MANAGEMENT
        const { event, state, count } = advanceState(
          this.appState.motionStats,
          motionStats,
          face,
          this.appState.face,
          this.appState.currentScreeningState,
          this.appState.currentScreeningStateFrameCount,
          motionStats.heatStats.threshold,
          this.appState.thermalReference
        );
        this.appState.currentScreeningState = state;
        this.appState.currentScreeningStateFrameCount = count;
        this.appState.face = face;
        if (event === "Captured" && face) {
          this.snapshotScreeningEvent(
            this.appState.thermalReference,
            face,
            frame, // Should be rotated?
            { ...face.samplePoint, v: face.sampleValue }
          );
        } else if (event === "Recorded") {
          console.log("-- recorded");
          if (this.isReferenceDevice) {
            ScreeningApi.recordScreeningEvent(
              this.deviceName,
              this.deviceID,
              this.appState.currentScreeningEvent as ScreeningEvent
            );
          }
          this.appState.currentScreeningEvent = null;
        }
      } else {
        if (this.appState.currentScreeningState === ScreeningState.LEAVING) {
          this.appState.currentScreeningStateFrameCount++;
        }
        if (
          this.appState.currentScreeningState !== ScreeningState.LEAVING ||
          (this.appState.currentScreeningState === ScreeningState.LEAVING &&
            this.appState.currentScreeningStateFrameCount > 15)
        ) {
          this.advanceScreeningState(ScreeningState.READY);
        }
      }
    }
    this.appState.currentFrame = frame;
    this.frameCounter++;
  }

  snapshotScreeningEvent(
    thermalReference: ROIFeature,
    face: FaceInfo,
    frame: Frame,
    sample: { x: number; y: number; v: number }
  ) {
    this.appState.currentScreeningEvent = {
      rawTemperatureValue: sample.v,
      sampleX: sample.x,
      sampleY: sample.y,
      frame, // Really, we should be able to recreate the temperature value just from the frame + telemetry?
      timestamp: new Date(),
      thermalReferenceRawValue: thermalReference.sensorValue,
      thermalReference,
      face
    };
    // console.log("Record screening event", frame, face);
    return;
  }

  onConnectionStateChange(connection: CameraConnectionState) {
    this.appState.cameraConnectionState = connection;
  }

  private startFrame = 0; //130; //0; //39; //116;
  private showSoftwareVersionUpdatedPrompt = false;
  private useLiveCamera = true;

  async beforeMount() {
    // Update the AppState:
    /*
    this.appState.uuid = new Date().getTime();

    const existingCalibration = await DeviceApi.getCalibration();
    this.updateCalibration(existingCalibration, true);
    const { appVersion, binaryVersion } = await DeviceApi.softwareVersion();
    const { deviceID, devicename } = await DeviceApi.deviceInfo();
    this.deviceID = deviceID;
    this.deviceName = devicename;
    const newLine = appVersion.indexOf("\n");
    let newAppVersion = appVersion;
    if (newLine !== -1) {
      newAppVersion = newAppVersion.substring(0, newLine);
    }

    this.appVersion = newAppVersion;


    if (checkForSoftwareUpdates(binaryVersion, newAppVersion, false)) {
      this.showSoftwareVersionUpdatedPrompt = true;
    }
     */
    clearTimeout(this.frameTimeout);
    this.useLiveCamera = false;
    if (this.useLiveCamera) {
      // FIXME(jon): Add the proper camera url
      // FIXME(jon): Get rid of browser full screen toggle
      new CameraConnection(
        window.location.hostname,
        this.onFrame,
        this.onConnectionStateChange
      );
    } else {
      // TODO(jon): Queue multiple files
      cptvPlayer = await import("../cptv-player/cptv_player");
      ///const cptvFile = await fetch("/cptv-files/twopeople-calibration.cptv");
      //const cptvFile = await fetch();
      //"cptv-files/bunch of people in small meeting room 20200812.134427.735.cptv",
      //"/cptv-files/bunch of people downstairs walking towards camera 20200812.161144.768.cptv"
      // const cptvFile = await fetch(
      //   "/cptv-files/0.7.5beta recording-1 2708.cptv"
      // ); //
      //const cptvFile = await fetch("/cptv-files/20200716.153342.441.cptv");
      const cptvFile = await fetch("/cptv-files/20200716.153342.441.cptv"); // Jon (too high in frame)
      //const cptvFile = await fetch("/cptv-files/20200718.130624.941.cptv"); // Sara

      //const cptvFile = await fetch("/cptv-files/20200718.130606.382.cptv"); // Sara
      //const cptvFile = await fetch("/cptv-files/20200718.130536.950.cptv"); // Sara (fringe)
      //const cptvFile = await fetch("/cptv-files/20200718.130508.586.cptv"); // Sara (fringe)
      //const cptvFile = await fetch("/cptv-files/20200718.130059.393.cptv"); // Jon
      //const cptvFile = await fetch("/cptv-files/20200718.130017.220.cptv"); // Jon
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

      // Shauns office:
      //const cptvFile = await fetch("/cptv-files/20200729.104543.646.cptv");
      //const cptvFile = await fetch("/cptv-files/20200729.104622.519.cptv");
      //const cptvFile = await fetch("/cptv-files/20200729.104815.556.cptv"); // Proximity

      //const cptvFile = await fetch("/cptv-files/20200729.105022.389.cptv");
      // 20200729.105038.847
      //const cptvFile = await fetch("/cptv-files/20200729.105038.847.cptv");
      //const cptvFile = await fetch("/cptv-files/20200729.105053.858.cptv");
      const buffer = await cptvFile.arrayBuffer();
      // 30, 113, 141
      await this.playLocalCptvFile(buffer, this.startFrame);
    }
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

.debug-video {
  position: absolute;
  top: 800px;
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
