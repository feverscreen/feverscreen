<template>
  <v-app id="app">
    <div
      @drop="e => playLocalCptvFile(e)"
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
      <div v-if="isAdminScreen">
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
          Thermal ref value: {{ thermalReferenceRawValue }}
        </div>
        <div>Found {{ numFaces }} face(s)</div>
        <div v-if="hasFaces">
          Face raw value
          {{ JSON.stringify(appState.faces[0].heatStats.hotspot.sensorValue) }}
        </div>
        <div>Temperature {{ hotspotTemp }}</div>
      </div>
      <FakeThermalCameraControls
        :paused="appState.paused"
        :playing-local="playingLocal"
        @toggle-playback="onTogglePlayback"
      />
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
import {
  detectThermalReference,
  findFacesInFrame,
  ROIFeature
} from "@/feature-detection";
import { extractSensorValueForCircle } from "@/circle-detection";
import { HaarCascade, loadFaceRecognitionModel } from "@/haar-cascade";
import { Face, Hotspot } from "@/face";
import FakeThermalCameraControls from "@/components/FakeThermalCameraControls.vue";
import { FrameInfo, TemperatureSource } from "@/api/types";
import { BoundingBox, CropBox } from "@/types";
import FpsCounter from "@/components/FpsCounter.vue";
let FaceRecognitionModel: HaarCascade | null = null;
const ZeroCelsiusInKelvin = 273.15;

const InitialFrameInfo = {
  Camera: {
    ResX: 160,
    ResY: 120,
    FPS: 9,
    Brand: "flir",
    Model: "lepton35"
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

interface AppState {
  currentFrame: Frame | null;
  cameraConnectionState: CameraConnectionState;
  thermalReference: ROIFeature | null;
  faces: Face[];
  paused: boolean;
  faceModel: HaarCascade | null;
  lastFrameTime: number;
  cropBox: CropBox;
}

export const State: AppState = {
  currentFrame: null,
  cameraConnectionState: CameraConnectionState.Disconnected,
  thermalReference: null,
  faces: [],
  paused: true,
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
  private thermalReferenceRawValue = 0;
  private savedThermalReferenceRawValue = 38;
  private mirrored = true;
  private prevFrameInfo: FrameInfo | null = null;
  private droppedDebugFile = false;
  private frameCounter = 0;

  public get playingLocal(): boolean {
    return this.droppedDebugFile;
  }

  public get currentFrameCount(): number {
    // NOTE(jon): This is always zero if it's the fake thermal camera.
    if ((this.appState.currentFrame as Frame).frameInfo) {
      return (this.appState.currentFrame as Frame).frameInfo.Telemetry
        .FrameCount;
    }
    return 0;
  }

  private holdCurrentFrame() {
    if (this.appState.paused && this.appState.currentFrame) {
      this.onFrame(this.appState.currentFrame);
      setTimeout(this.holdCurrentFrame.bind(this), this.frameInterval);
    }
  }

  private get frameInterval(): number {
    if (this.appState.currentFrame) {
      return 1000 / this.appState.currentFrame.frameInfo.Camera.FPS;
    }
    return 1000 / 9;
  }

  public async playLocalCptvFile(event: DragEvent) {
    event.preventDefault();
    this.droppedDebugFile = true;
    const frameBuffer = new ArrayBuffer(160 * 120 * 2);
    let filledFrameBuffer = false;
    if (event.dataTransfer && event.dataTransfer.items) {
      for (let i = 0; i < event.dataTransfer.items.length; i++) {
        if (event.dataTransfer.items[i].kind === "file") {
          const file = event.dataTransfer.items[i].getAsFile() as File;
          const buffer = await file.arrayBuffer();
          cptvPlayer.initWithCptvData(new Uint8Array(buffer));
          const getNextFrame = () => {
            if (!this.appState.paused || !filledFrameBuffer) {
              filledFrameBuffer = true;
              // If we're paused, we'll keep sending through the same frame each time.
              cptvPlayer.getRawFrame(0, new Uint8Array(frameBuffer));
            }
            this.appState.currentFrame = {
              frame: new Float32Array(new Uint16Array(frameBuffer)),
              frameInfo: InitialFrameInfo
            };
            this.onFrame(this.appState.currentFrame);
            setTimeout(getNextFrame, this.frameInterval);
          };
          setTimeout(getNextFrame, this.frameInterval);
        }
      }
    }
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
  get hotspotTemp(): DegreesCelsius {
    const hotspot = this.hotspot;
    if (hotspot !== null) {
      return temperatureForSensorValue(
        this.savedThermalReferenceRawValue,
        hotspot.sensorValue,
        this.thermalReferenceRawValue
      );
    }
    return new DegreesCelsius(0);
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
      const hotspotsInBounds = this.appState.faces
        .map(face => face.heatStats.hotspot)
        .filter(hotspot => {
          if (
            hotspot.sensorX >= cropBox.x0 &&
            hotspot.sensorX < cropBox.x1 &&
            hotspot.sensorY >= cropBox.y0 &&
            hotspot.sensorY < cropBox.y1
          ) {
            return true;
          }
        });
      if (hotspotsInBounds.length !== 0) {
        return hotspotsInBounds[0];
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
      this.thermalReferenceRawValue = extractSensorValueForCircle(
        thermalReference,
        saltPepperData,
        width,
        height
      );
      this.appState.faces = await findFacesInFrame(
        smoothedData,
        width,
        height,
        FaceRecognitionModel as HaarCascade,
        this.appState.faces,
        thermalReference
      );
      // TODO(jon): Use face.tracked() to get faces that have forehead tracking.

      // TODO(jon): Filter out any that aren't inside the cropbox
    }
    this.frameCounter++;
  }

  onConnectionStateChange(connection: CameraConnectionState) {
    this.appState.cameraConnectionState = connection;
  }

  async beforeMount() {
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

    // On startup:
    console.log("Init");
    // Load the face recognition model
    // NOTE: Don't add this to the Vue state tree, since its state never changes.
    FaceRecognitionModel = await loadFaceRecognitionModel("/cascade_stg17.xml");
    // Open the camera connection

    new CameraConnection(
      "http://localhost:2041",
      this.onFrame,
      this.onConnectionStateChange
    );

    cptvPlayer = await import("../pkg/cptv_player");
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
