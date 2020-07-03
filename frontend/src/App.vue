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
        :crop-box="appState.cropBox"
        @crop-changed="onCropChanged"
        @save-crop-changes="saveCropChanges"
      />
      <UserFacingScreening v-else />
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
  </v-app>
</template>

<script lang="ts">
import AdminScreening from "@/components/AdminScreening.vue";
import UserFacingScreening from "@/components/UserFacingScreening.vue";
import { Component, Vue } from "vue-property-decorator";
import {
  CameraConnection,
  CameraConnectionState,
  Frame,
  LocalCameraConnection
} from "@/camera";
import { processSensorData } from "@/processing";
import { detectThermalReference } from "@/feature-detection";
import { extractSensorValueForCircle } from "@/circle-detection";
import { HaarCascade } from "@/haar-cascade";
import { Face, Hotspot } from "@/face";
import FakeThermalCameraControls from "@/components/FakeThermalCameraControls.vue";
import { FrameInfo, TemperatureSource } from "@/api/types";
import { AppState, BoundingBox, CropBox } from "@/types";
import FpsCounter from "@/components/FpsCounter.vue";
import { FrameHeaderV2 } from "../pkg";
import { FaceRecognitionModel } from "@/haar-converted";
import { findFacesInFrameAsync } from "@/find-faces-async";
import { ROIFeature } from "@/worker-fns";

const ZeroCelsiusInKelvin = 273.15;

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

class DegreesCelsius {
  public val: number;
  constructor(val: number) {
    this.val = val;
  }
  public toString(): string {
    return `${this.val.toFixed(2)}°C`;
  }
}

const temperatureForSensorValue = (
  savedThermalRefValue: number,
  rawValue: number,
  currentThermalRefValue: number
): DegreesCelsius => {
  return new DegreesCelsius(
    savedThermalRefValue + (rawValue - currentThermalRefValue) * 0.01
  );
};

const mKToCelsius: (val: number) => DegreesCelsius = (mkVal: number) =>
  new DegreesCelsius(mkVal * 0.01 - ZeroCelsiusInKelvin);

export const State: AppState = {
  currentFrame: null,
  cameraConnectionState: CameraConnectionState.Disconnected,
  thermalReference: null,
  faces: [],
  paused: false,
  cropBox: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
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
    this.appState.cropBox = cropBox;
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
      JSON.parse(JSON.stringify(this.appState.cropBox))
    );
  }

  // private saveAppState() {
  //     console.log('saving crop box', this.appState.cropBox)
  // }

  // TODO(jon): Setting to get temperature from hotspot on faces vs overall hotspot (excluding thermal ref)
  get hotspotTemp(): DegreesCelsius | null {
    const hotspot = this.hotspot;
    if (hotspot !== null) {
      return temperatureForSensorValue(
        this.savedThermalReferenceRawValue,
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

  get hotspot(): Hotspot | null {
    // TODO(jon): Also heatStats.foreheadHotspot
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
    const cropBox = this.appState.cropBox;
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
      this.appState.faces = await findFacesInFrameAsync(
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
      // TODO(jon): Filter out any faces that are wider than they are tall.
      this.appState.faces = this.appState.faces.filter(
        face => face.width() <= face.height()
      );
    }
    this.frameCounter++;
  }

  onConnectionStateChange(connection: CameraConnectionState) {
    this.appState.cameraConnectionState = connection;
  }

  async beforeMount() {
    /*
    // Scan for cameras on the local network, assuming we know what our default gateway is:
    const ipBase = "192.168.178.";
    interface ScanRequest {
      request: Promise<void>;
      controller: AbortController;
    }
    const requests: ScanRequest[] = [];

    const onSuccess = (r: Response) => {
      console.log("resolved r", r);
      for (const request of requests) {
        request.controller.abort();
      }
    };

    for (let i = 0; i <= 255; i++) {
      requests.push(
        (() => {
          const controller = new AbortController();
          const signal = controller.signal;
          return {
            request: fetch(`http://${ipBase}${i}/api/version`, {
              signal,
              method: "OPTIONS"
            })
              .then(onSuccess)
              .catch(() => {
                return;
              }),
            controller
          };
        })()
      );
    }
*/
    // On startup:
    console.log("Init");
    // Load the face recognition model
    // NOTE: Don't add this to the Vue state tree, since its state never changes.
    //FaceRecognitionModel = await loadFaceRecognitionModel("/cascade_stg17.xml");

    //console.log(JSON.stringify(FaceRecognitionModel, null, "\t"));

    // Open the camera connection

    /*
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
    await this.playLocalCptvFile(buffer, 30);
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
#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
