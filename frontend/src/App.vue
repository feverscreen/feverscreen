<template>
  <v-app id="app" @skip-warmup="skipWarmup">
    <UserFacingScreening
      :on-reference-device="isReferenceDevice"
      :state="appState.currentScreeningState"
      :screening-event="appState.currentScreeningEvent"
      :calibration="appState.currentCalibration"
      :face="face"
      :warmup-seconds-remaining="remainingWarmupTime"
      :shapes="[prevShape, nextShape]"
      :isTesting="!useLiveCamera"
      :thermal-ref-side="thermalRefSide"
      @new-message="onNewUserMessage($event)"
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
    <v-overlay v-model="isNotGettingFrames" absolute width="500">
      <v-card>
        <v-card-title> Waiting for camera input... </v-card-title>
      </v-card>
    </v-overlay>
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
        :crop-box="{ Left: 0, Right: 0, Top: 0, Bottom: 0 }"
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
import { FrameInfo } from "@/api/types";
import {
  ExternalDeviceSettingsApi as DeviceSettings,
  ScreeningApi
} from "@/api/api";
import {
  AppState,
  CalibrationInfo,
  FaceInfo,
  FactoryDefaultCalibration,
  ScreeningEvent,
  ScreeningState,
  ThermalReference
} from "@/types";
import { checkForSoftwareUpdates, DegreesCelsius } from "@/utils";
import {
  FFC_SAFETY_DURATION_SECONDS,
  FFC_MAX_INTERVAL_MS,
  LerpAmount,
  State,
  ObservableDeviceApi as DeviceApi,
  WARMUP_TIME_SECONDS
} from "@/main";
import VideoStream from "@/components/VideoStream.vue";
import { FrameMessage } from "@/frame-listener";
import { TestInfo } from "@/test-helper";
import { ImmutableShape } from "@/geom";
import FrameHandler from "@/frame-handler";
@Component({
  components: {
    UserFacingScreening,
    VideoStream
  }
})
export default class App extends Vue {
  private deviceID = "";
  private deviceName = "";
  private piSerial = "";
  private appVersion = "";

  private appState: AppState = State;
  private isNotFullscreen = true;
  private showUpdatedCalibrationSnackbar = false;
  private testInfo = new TestInfo();
  private frameHandler = FrameHandler();

  get isReferenceDevice(): boolean {
    return (
      window.navigator.userAgent.includes("Lenovo TB-X605LC") ||
      this.isRunningInAndroidWebview
    );
  }

  get face(): FaceInfo | null {
    return this.appState.currentFrame?.analysisResult.face || null;
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

  private startTimeInFrame = 0;
  private startTimeOutFrame = Infinity;
  private isRecording = false;
  private skippedWarmup = false;
  private thermalRefSide: "left" | "right" = "left";
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
    this.appState.currentCalibration.head = {
      tL: { x: nextCalibration.HeadTLX, y: nextCalibration.HeadTLY },
      tR: { x: nextCalibration.HeadTRX, y: nextCalibration.HeadTRY },
      bL: { x: nextCalibration.HeadBLX, y: nextCalibration.HeadBLY },
      bR: { x: nextCalibration.HeadBRX, y: nextCalibration.HeadBRY }
    };
    this.appState.currentCalibration.playNormalSound =
      nextCalibration.UseNormalSound;
    this.appState.currentCalibration.playWarningSound =
      nextCalibration.UseWarningSound;
    this.appState.currentCalibration.playErrorSound =
      nextCalibration.UseErrorSound;
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
    // Did we receive any frames in the past second?  // Did we just trigger an FFC event?
    return this.appState.lastFrameTime > new Date().getTime() - 1000;
  }

  get isNotGettingFrames(): boolean {
    // Did we receive any frames in the past second?
    return !(this.appState.lastFrameTime > new Date().getTime() - 1000);
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
      frame.frameInfo.AppVersion,
      this.gotFirstFrame
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
    this.testInfo.setFrameNumber(frame.frameInfo.Telemetry.FrameCount);
    this.checkForSoftwareUpdatesThisFrame(frame);
    this.checkForCalibrationUpdatesThisFrame(frame);
    this.updateBodyOutline(frame.bodyShape);
    this.appState.lastFrameTime = new Date().getTime();

    if (DeviceApi.RecordUserActivity) {
      this.frameHandler.process(frame);
    }

    if (frame.analysisResult.thermalRef.geom.center.x < 60) {
      this.thermalRefSide = "left";
    } else {
      this.thermalRefSide = "right";
    }

    if (this.isWarmingUp) {
      this.appState.currentScreeningState = ScreeningState.WARMING_UP;
    } else {
      // See if we want to pre-emptively trigger an FFC:
      let msSinceLastFFC =
        frame.frameInfo.Telemetry.TimeOn -
        frame.frameInfo.Telemetry.LastFFCTime;
      if (this.useLiveCamera) {
        // Nanoseconds rather than milliseconds if live
        msSinceLastFFC = msSinceLastFFC / 1000 / 1000;
      }

      const timeTillFFC = FFC_MAX_INTERVAL_MS - msSinceLastFFC;
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
          if (timeTillFFC < 30 * 1000) {
            // Someone just left the frame, and we need to do an FFC in the next 30 seconds,
            // so now is a great time to do it early and hide it from the user.
            DeviceApi.runFFC();
          }
          ScreeningApi.recordScreeningEvent(
            this.deviceID,
            this.piSerial,
            this.appState.currentScreeningEvent as ScreeningEvent,
            this.appState.currentCalibration.thresholdMinFever
          );
        }
        if (!this.useLiveCamera) {
          this.testInfo.recordScreeningEvent(
            this.appState.currentScreeningEvent as ScreeningEvent
          );
          this.testInfo.sendRecordedEvents();
        }

        this.appState.currentScreeningEvent = null;
      } else if (this.isReferenceDevice && timeTillFFC < 30 * 1000) {
        // Someone just entered the frame, but we need to do an FFC in the next 30 seconds,
        // so do it as soon as they have entered and make them wait then, rather than in the middle of trying to
        // screen them.
        DeviceApi.runFFC();
      }
      this.appState.currentScreeningState = nextScreeningState;
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

  private onNewUserMessage(event: string) {
    this.testInfo.recordEvent(event);
  }

  private checkForSettingsChanges(deviceID: string) {
    DeviceSettings.getDevice(deviceID).then((device: any) => {
      if (device !== undefined) {
        const enable = device.recordUserActivity["BOOL"];
        DeviceApi.RecordUserActivity = enable;
        DeviceApi.DisableRecordUserActivity = !enable;
      } else {
        DeviceApi.DisableRecordUserActivity = false;
        DeviceApi.RecordUserActivity =
          window.localStorage.getItem("recordUserActivity") === "false"
            ? false
            : true;
      }
    });
  }

  private showSoftwareVersionUpdatedPrompt = false;
  private useLiveCamera = true;
  private gotFirstFrame = false;

  async created() {
    let cptvFilename = "/cptv-files/0.7.5beta recording-1 2708.cptv";
    //let cptvFilename = "/cptv-files/bunch of people in small meeting room 20200812.134427.735.cptv";
    const uri = window.location.search.substring(1);
    const params = new URLSearchParams(uri);
    if (params.get("cptvfile")) {
      cptvFilename = `/cptv-files/${params.get("cptvfile")}.cptv`;
      this.useLiveCamera = false;
    }

    // Update the AppState:
    if (this.useLiveCamera) {
      this.appState.uuid = new Date().getTime();
      await DeviceApi.stopRecording(false);
      DeviceApi.getCalibration().then(existingCalibration => {
        if (existingCalibration === null) {
          existingCalibration = { ...FactoryDefaultCalibration };
        }
        this.updateCalibration(existingCalibration, true);
        DeviceApi.softwareVersion().then(({ appVersion, binaryVersion }) => {
          DeviceApi.deviceInfo().then(({ deviceID, devicename, serial }) => {
            this.deviceID = deviceID;
            this.deviceName = devicename;
            this.piSerial = serial;
            const newLine = appVersion.indexOf("\n");
            let newAppVersion = appVersion;
            this.checkForSettingsChanges(deviceID);
            setInterval(() => {
              this.checkForSettingsChanges(deviceID);
            }, 1000 * 60 * 30); // Every 30 Minutes
            if (newLine !== -1) {
              newAppVersion = newAppVersion.substring(0, newLine);
            }
            this.appVersion = newAppVersion;
            if (
              checkForSoftwareUpdates(
                binaryVersion,
                newAppVersion,
                this.gotFirstFrame
              )
            ) {
              this.showSoftwareVersionUpdatedPrompt = true;
            }
          });
        });
      });
    }
    const frameListener = new FrameListenerWorker();
    frameListener.onmessage = message => {
      const frameMessage = message.data as FrameMessage;
      switch (frameMessage.type) {
        case "gotFrame":
          this.onFrame(frameMessage.payload as Frame);
          this.gotFirstFrame = true;
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
      cptvFileToPlayback: cptvFilename
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
