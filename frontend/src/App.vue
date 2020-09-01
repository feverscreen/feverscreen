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
        <v-card-title
          >This software has been updated. {{ appVersion }}</v-card-title
        >
        <v-card-actions center>
          <v-btn text @click="e => (showSoftwareVersionUpdatedPrompt = false)"
            >Proceed</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="showUpdatedCalibrationSnackbar"
      >Calibration was updated</v-snackbar
    >
  </v-app>
</template>

<script lang="ts">
import AdminScreening from "@/components/AdminScreening.vue";
import UserFacingScreening from "@/components/UserFacingScreening.vue";
import { Component, Vue } from "vue-property-decorator";
import { CameraConnection, CameraConnectionState, Frame } from "@/camera";
import { processSensorData, rotateFrame } from "@/processing";
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
import {
  extractFaceInfo,
  FaceInfo,
  getNeck,
  guessApproximateHeadWidth,
  refineHeadThresholdData,
  thresholdBit
} from "@/body-detection";
import {
  cloneShape,
  extendToBottom,
  fillVerticalCracks,
  getRawShapes,
  getSolidShapes,
  largestShape,
  RawPoint
} from "@/geom";

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

let cptvPlayer: any;

// let outputJSON = false;
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

  public advanceScreeningState(nextState: ScreeningState): boolean {
    // We can only move from certain states to certain other states.
    const prevState = this.appState.currentScreeningState;
    if (prevState !== nextState) {
      const allowedNextState = ScreeningAcceptanceStates[prevState];
      if ((allowedNextState as ScreeningState[]).includes(nextState)) {
        this.appState.currentScreeningState = nextState;
        this.appState.currentScreeningStateFrameCount = 1;
        return true;
      }
    } else {
      this.appState.currentScreeningStateFrameCount++;
    }
    return false;
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
    this.appState.currentCalibration.thresholdMinNormal =
      nextCalibration.ThresholdMinNormal;
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
      rotateFrame(this.appState.currentFrame);

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

  samplePointIsInsideCroppingArea(point: Point): boolean {
    const cropBoxPx = this.cropBoxPixelBounds;
    return (
      cropBoxPx.x0 < point.x &&
      cropBoxPx.x1 >= point.x &&
      cropBoxPx.y0 < point.y &&
      cropBoxPx.y1 >= point.y
    );
  }

  private async onFrame(frame: Frame) {
    //console.log("---", frame.frameInfo.Telemetry.FrameCount);
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

    if (this.prevFrameInfo) {
      const prevCalibration = JSON.stringify(this.prevFrameInfo.Calibration);
      const nextCalibration = JSON.stringify(frame.frameInfo.Calibration);
      if (prevCalibration !== nextCalibration) {
        console.log(
          "updating calibration",
          JSON.stringify(frame.frameInfo.Calibration, null, "\t")
        );
        this.updateCalibration(frame.frameInfo.Calibration);
      }
    }
    rotateFrame(frame);
    this.appState.lastFrameTime = new Date().getTime();
    this.prevFrameInfo = frame.frameInfo;
    const { ResX: width, ResY: height } = frame.frameInfo.Camera;

    const prevThermalRef = this.appState.thermalReference;
    const thermalRefC = temperatureForSensorValue(
      this.appState.currentCalibration.calibrationTemperature.val,
      prevThermalRef?.sensorValue || 0,
      prevThermalRef?.sensorValue || 0
    ).val;

    const {
      medianSmoothed,
      radialSmoothed,
      thresholded,
      motionStats,
      edgeData,
      pointCloud
    } = await processSensorData(frame, prevThermalRef, thermalRefC);

    // if (frame.frameInfo.Telemetry.FrameCount % 60 === 0) {
    //   console.log(motionStats);
    // }

    // Process sensor data can do a lot more:
    const data = thresholded;
    frame.smoothed = radialSmoothed;
    frame.medianed = medianSmoothed;
    frame.threshold = motionStats.heatStats.threshold;
    frame.min = motionStats.heatStats.min;
    frame.max = motionStats.heatStats.max;
    // TODO(jon): Sanity check - if the thermal reference is moving from frame to frame,
    //  it's probably someones head...
    const { r: thermalReference } = detectThermalReference(
      medianSmoothed,
      edgeData,
      this.appState.thermalReference,
      width,
      height
    );

    //console.log(thermalReference);
    if (this.isWarmingUp) {
      this.appState.thermalReference = thermalReference;
      this.advanceScreeningState(ScreeningState.WARMING_UP);
    } else {
      if (thermalReference) {
        this.appState.thermalReferenceStats = Object.freeze(
          extractSensorValueForCircle(thermalReference, medianSmoothed, width)
        );
        thermalReference.sensorValue = this.appState.thermalReferenceStats.median;

        this.prevShape = this.nextShape;

        // Use thermal ref values from last frame, they will be good enough.

        // Process frame to see if there's a body.
        this.appState.thermalReference = thermalReference;
        this.appState.prevFrame = frame;
        const hasBody =
          motionStats.frameBottomSum !== 0 &&
          motionStats.motionThresholdSum > 45;
        if (hasBody) {
          let approxHeadWidth = 0;
          const rawShapes = getRawShapes(data, width, height, thresholdBit);
          const shapes = getSolidShapes(rawShapes);
          // const { shapes, didMerge: maybeHasGlasses } = preprocessShapes(
          //   rawShapes
          // );
          let body = null;
          let face = null;
          if (shapes.length) {
            body = largestShape(shapes);
            fillVerticalCracks(body);
            if (
              this.appState.currentScreeningState !== ScreeningState.LEAVING
            ) {
              /// NOTE(jon): Don't spend time processing head features if we already captured something and are leaving.
              approxHeadWidth = guessApproximateHeadWidth(cloneShape(body));
              let neck = null;
              if (approxHeadWidth > 0) {
                // FIXME(jon) - this method of guessing head width doesn't always work, ie. if the person has long hair or a hood,
                // and they don't have a bit where their face dips in again after flaring out.

                // Maybe get the possible range that the neck can be in from the width at the top of the body convex hull?
                const searchStart = Math.min(
                  Math.ceil(approxHeadWidth),
                  body.length - 1
                );
                const searchEnd = Math.min(
                  Math.ceil(approxHeadWidth * 1.7),
                  body.length - 1
                );
                const slice = body.slice(searchStart, searchEnd);
                if (slice.length) {
                  neck = getNeck(slice);
                }
              }
              if (neck) {
                const pts: RawPoint[] = [];
                for (let i = 0; i < pointCloud.length; i++) {
                  pts.push([pointCloud[i], pointCloud[i + 1]]);
                  i++;
                }
                refineHeadThresholdData(data, neck, pts);
                // Draw head hull into canvas context, mask out threshold bits we care about:
                const rawShapes = getRawShapes(
                  data,
                  width,
                  height,
                  thresholdBit
                );
                // const {
                //   shapes: faceShapes,
                //   didMerge: maybeHasGlasses
                // } = preprocessShapes(rawShapes);

                const faceShape = largestShape(getSolidShapes(rawShapes));
                if (faceShape.length) {
                  face = extractFaceInfo(neck, faceShape, radialSmoothed);
                }
              }
            }
            // TODO(jon): If half the face is off-frame, null out face.
            if (hasBody) {
              // TODO(jon): Infill ovals on faces that look dodgey, so we get a nice silhouette.
              this.nextShape = [extendToBottom(body)].map(shape =>
                Object.freeze(shape)
              );
              LerpAmount.amount = 0;
            } else {
              this.nextShape = [];
            }
          }

          // STATE MANAGEMENT
          const { event, state, count } = advanceState(
            this.appState.motionStats,
            motionStats,
            face,
            body,
            this.appState.face,
            this.appState.currentScreeningState,
            this.appState.currentScreeningStateFrameCount,
            motionStats.heatStats.threshold,
            radialSmoothed,
            thermalReference
          );
          this.appState.motionStats = motionStats;
          this.appState.currentScreeningState = state;
          this.appState.currentScreeningStateFrameCount = count;
          this.appState.face = face;
          if (event === "Captured" && face) {
            const temperatureSamplePoint = getHottestSpotInBounds(
              face,
              motionStats.heatStats.threshold,
              width,
              height,
              radialSmoothed
            );
            this.snapshotScreeningEvent(
              thermalReference,
              face,
              frame,
              temperatureSamplePoint
            );
          } else if (event === "Recorded") {
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
          this.advanceScreeningState(ScreeningState.READY);

          this.nextShape = [];
        }
      } else {
        // TODO(jon): Possibly thermal reference error?
        this.advanceScreeningState(ScreeningState.MISSING_THERMAL_REF);
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
    this.useLiveCamera = true;
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
      const cptvFile = await fetch(
        "/cptv-files/0.7.5beta recording-1 2708.cptv"
      ); //
      //const cptvFile = await fetch("/cptv-files/20200716.153342.441.cptv");
      //const cptvFile = await fetch("/cptv-files/20200716.153342.441.cptv"); // Jon (too high in frame)
      //const cptvFile = await fetch("/cptv-files/20200718.130624.941.cptv"); // Sara

      //const cptvFile = await fetch("/cptv-files/20200718.130606.382.cptv"); // Sara
      //const cptvFile = await fetch("/cptv-files/20200718.130536.950.cptv"); // Sara (fringe)
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
