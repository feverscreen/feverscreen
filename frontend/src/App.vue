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
    <div class="debug-video" v-if="!isReferenceDevice">
      <VideoStream
        v-if="appState.currentFrame"
        :frame="appState.currentFrame.frame"
        :face="appState.face"
        :min="appState.currentFrame.analysisResult.heatStats.min"
        :max="appState.currentFrame.analysisResult.heatStats.max"
        :crop-box="appState.currentCalibration.cropBox"
        :crop-enabled="false"
        :draw-overlays="false"
        :show-coords="false"
      />
    </div>
  </v-app>
</template>

<script lang="ts">
import UserFacingScreening from "@/components/UserFacingScreening.vue";
import { Component, Vue } from "vue-property-decorator";
import { CameraConnectionState, Frame } from "@/camera";
import FrameListenerWorker from "worker-loader!./frame-listener";
import { CalibrationInfo, FrameInfo } from "@/api/types";
import { DeviceApi, ScreeningApi } from "@/api/api";
import {
  AppState,
  BoundingBox,
  CropBox,
  FaceInfo,
  ScreeningEvent,
  ScreeningState,
  ThermalReference
} from "@/types";
import { checkForSoftwareUpdates, DegreesCelsius } from "@/utils";
import {
  FFC_SAFETY_DURATION_SECONDS,
  LerpAmount,
  State,
  WARMUP_TIME_SECONDS
} from "@/main";
import VideoStream from "@/components/VideoStream.vue";
import { FrameMessage } from "@/frame-listener";
import { ImmutableShape } from "@/geom";

@Component({
  components: {
    UserFacingScreening,
    VideoStream
  }
})
export default class App extends Vue {
  private deviceID = 0;
  private deviceName = "";
  private appVersion = "";

  private appState: AppState = State;
  private isNotFullscreen = true;
  private showUpdatedCalibrationSnackbar = false;

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

  private skippedWarmup = false;
  private prevShape: ImmutableShape[] = [];
  private nextShape: ImmutableShape[] = [];

  $refs!: {
    debugCanvas: HTMLCanvasElement;
  };

  private skipWarmup() {
    this.skippedWarmup = true;
  }

  public get currentFrameCount(): number {
    // NOTE(jon): This is always zero if it's the fake thermal camera.
    if ((this.appState.currentFrame as Frame).frameInfo) {
      return (this.appState.currentFrame as Frame).frameInfo.Telemetry
        .FrameCount;
    }
    return 0;
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

  onCropChanged(cropBox: CropBox) {
    this.appState.currentCalibration.cropBox = cropBox;
  }

  saveCropChanges() {
    console.log(
      "save crop changes",
      JSON.parse(JSON.stringify(this.appState.currentCalibration.cropBox))
    );
  }

  get currentFrame(): Frame {
    return this.appState.currentFrame as Frame;
  }

  get timeOnInSeconds(): number {
    const telemetry = this.frameInfo?.Telemetry;
    if (telemetry) {
      let timeOnSecs;
      // NOTE: TimeOn is in nanoseconds when coming from the camera server,
      //  but in milliseconds when coming from a CPTV file - should make these the same.
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
    const telemetry = this.frameInfo?.Telemetry;
    if (!this.isWarmingUp && telemetry) {
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

  get cropBoxPixelBounds(): BoundingBox {
    const cropBox = this.appState.currentCalibration.cropBox;
    let width = 120;
    let height = 160;

    if (this.frameInfo) {
      const { ResX, ResY } = this.frameInfo.Camera;
      width = ResY;
      height = ResX;
    }
    const onePercentWidth = width / 100;
    const onePercentHeight = height / 100;

    const bounds = {
      x0: Math.floor(onePercentWidth * cropBox.left),
      x1: width - Math.floor(onePercentWidth * cropBox.right),
      y0: Math.floor(onePercentHeight * cropBox.top),
      y1: height - Math.floor(onePercentHeight * cropBox.bottom)
    };
    return bounds;
  }

  private updateBodyOutline(body: Uint8Array) {
    this.prevShape = this.nextShape;
    const shape = [];
    for (let i = 0; i < body.length; i += 3) {
      const y = body[i];
      const x0 = body[i + 1];
      const x1 = body[i + 2];
      shape.push({ x0, x1, y });
    }
    LerpAmount.amount = 0.0;
    if (shape.length) {
      this.nextShape = [Object.freeze(shape)];
    } else {
      this.nextShape = [];
    }
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
    if (this.frameInfo) {
      const prevCalibration = JSON.stringify(this.frameInfo.Calibration);
      const nextCalibration = JSON.stringify(frame.frameInfo.Calibration);
      if (prevCalibration !== nextCalibration) {
        this.updateCalibration(frame.frameInfo.Calibration);
      }
    }
  }

  private async onFrame(frame: Frame) {
    const frameNumber = frame.frameInfo.Telemetry.FrameCount;
    this.checkForSoftwareUpdatesThisFrame(frame);
    this.checkForCalibrationUpdatesThisFrame(frame);
    this.updateBodyOutline(frame.bodyShape);
    this.appState.lastFrameTime = new Date().getTime();
    if (!this.isWarmingUp) {
      const prevScreeningState = this.appState.currentScreeningState;
      const nextScreeningState = frame.analysisResult.nextState;
      if (
        prevScreeningState === ScreeningState.STABLE_LOCK &&
        nextScreeningState === ScreeningState.MEASURED
      ) {
        const face = frame.analysisResult.face;
        const thermalRef = frame.analysisResult.thermalRef;
        this.snapshotScreeningEvent(thermalRef, face, frame, {
          ...face.samplePoint,
          v: face.sampleValue,
          t: face.sampleTemp
        });
      } else if (
        prevScreeningState === ScreeningState.MEASURED &&
        nextScreeningState === ScreeningState.READY
      ) {
        if (this.isReferenceDevice) {
          ScreeningApi.recordScreeningEvent(
            this.deviceName,
            this.deviceID,
            this.appState.currentScreeningEvent as ScreeningEvent
          );
        }
        this.appState.currentScreeningEvent = null;
      }
      this.appState.currentScreeningState = nextScreeningState;
    } else {
      this.appState.currentScreeningState = ScreeningState.WARMING_UP;
    }
    this.appState.currentFrame = frame;
  }

  get frameInfo(): FrameInfo | undefined {
    return this.appState.currentFrame?.frameInfo;
  }

  snapshotScreeningEvent(
    thermalReference: ThermalReference,
    face: FaceInfo,
    frame: Frame,
    sample: { x: number; y: number; v: number; t: number }
  ) {
    this.appState.currentScreeningEvent = {
      rawTemperatureValue: sample.v,
      calculatedValue: sample.t,
      sampleX: sample.x,
      sampleY: sample.y,
      frame, // Really, we should be able to recreate the temperature value just from the frame + telemetry?
      timestamp: new Date(),
      thermalReference,
      face
    };
    return;
  }

  onConnectionStateChange(connection: CameraConnectionState) {
    this.appState.cameraConnectionState = connection;
  }

  private showSoftwareVersionUpdatedPrompt = false;
  private useLiveCamera = false;

  async created() {
    // Update the AppState:
    if (this.useLiveCamera) {
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
    }
    const frameListener = new FrameListenerWorker();
    frameListener.onmessage = message => {
      const frameMessage = message.data as FrameMessage;
      switch (frameMessage.type) {
        case "gotFrame":
          {
            this.onFrame(frameMessage.payload as Frame);
          }
          break;
        case "connectionStateChange":
          this.onConnectionStateChange(
            frameMessage.payload as CameraConnectionState
          );
          break;
      }
    };
    frameListener.postMessage({
      useLiveCamera: this.useLiveCamera,
      hostname: window.location.hostname,
      port: window.location.port,
      cptvFileToPlayback: "/cptv-files/0.7.5beta recording-1 2708.cptv"
    });
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
