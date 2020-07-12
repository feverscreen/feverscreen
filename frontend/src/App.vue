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
        @crop-changed="onCropChanged"
        @save-crop-changes="saveCropChanges"
        @calibration-updated="updateCalibration"
      />
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
    <div>
      <UserFacingScreening
        :state="appState.currentScreeningState"
        :screening-event="appState.currentScreeningEvent"
        :calibration="appState.currentCalibration"
      />
    </div>
  </v-app>
</template>

<script lang="ts">
import AdminScreening from "@/components/AdminScreening.vue";
import UserFacingScreening from "@/components/UserFacingScreening.vue";
import { Component, Vue } from "vue-property-decorator";
import { CameraConnectionState, Frame } from "@/camera";
import { processSensorData } from "@/processing";
import { detectThermalReference } from "@/feature-detection";
import { extractSensorValueForCircle } from "@/circle-detection";
import { Face, Hotspot } from "@/face";
import FakeThermalCameraControls from "@/components/FakeThermalCameraControls.vue";
import { FrameInfo, TemperatureSource } from "@/api/types";
import {
  AppState,
  BoundingBox,
  CropBox,
  ScreeningAcceptanceStates,
  ScreeningState
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
  private savedThermalReferenceRawValue = 38;
  private mirrored = true;
  private prevFrameInfo: FrameInfo | null = null;
  private droppedDebugFile = false;
  private frameCounter = 0;

  public get playingLocal(): boolean {
    return this.droppedDebugFile;
  }

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
      let frameInfo: FrameHeaderV2;
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
      }
      if (frameInfo! && frameInfo!.frame_number === pauseOn) {
        this.appState.paused = true;
      }
      this.appState.currentFrame = {
        frame: new Float32Array(new Uint16Array(frameBuffer)),
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
      if (!this.appState.paused) {
        this.onFrame(this.appState.currentFrame);
        this.appState.paused = true;
      }
      setTimeout(getNextFrame, this.frameInterval);
    };
    setTimeout(getNextFrame, this.frameInterval);
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
    let width = 160;
    let height = 120;
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
    this.appState.currentFrame = frame;
    this.appState.lastFrameTime = new Date().getTime();
    this.prevFrameInfo = frame.frameInfo;
    const { ResX: width, ResY: height } = frame.frameInfo.Camera;
    /* --- Process frame and extract features: --- */
    // We want to get out:
    // Smoothed versions.
    // Features, hotspots
    const { smoothedData, saltPepperData } = processSensorData(frame);

    if (this.isWarmingUp) {
      this.advanceScreeningState(ScreeningState.WARMING_UP);
    } else {
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
        // console.log(JSON.stringify(...this.appState.faces, null, "\t"));
        // TODO(jon): Use face.tracked() to get faces that have forehead tracking.
        // TODO(jon): Filter out any that aren't inside the cropbox
        // NOTE: Filter out any faces that are wider than they are tall.
        faces = faces.filter(face => face.width() <= face.height());

        if (faces.length !== 0) {
          if (faces.length === 1) {
            const face = faces[0];
            if (face.roi !== null) {
              if (face.isFrontOn && this.faceIsInsideCroppingArea(face)) {
                console.assert(
                  this.hasFaces && this.hasSingleFace,
                  "Should already have a face from previous frame"
                );

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

  async beforeMount() {
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
    */

    cptvPlayer = await import("../pkg/cptv_player");
    const cptvFile = await fetch("/cptv-files/twopeople-calibration.cptv");
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
    await this.playLocalCptvFile(buffer, 20);
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
</style>
