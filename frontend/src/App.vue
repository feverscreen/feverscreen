<template>
  <div id="app">
    <div class="home">
      <AdminScreening v-if="isAdminScreen" :frame="currentFrame" />
      <UserFacingScreening v-else />
      <div>
        Camera is {{isConnected ? "connected" : isConnecting ? "connecting" : "disconnected" }}
      </div>
      <div>Getting feed? {{isGettingFrames}}</div>
      <div>Thermal reference {{hasThermalReference ? "found" : "not found"}}</div>
      <div v-if="hasThermalReference">Thermal ref value: {{thermalReferenceRawValue}}, {{thermalReferenceTemp}}</div>
      <div>Found {{numFaces}} face(s)</div>
      <div v-if="hasFaces">Face raw value {{appState.faces[0].forehead.sensorValue}}, {{appState.faces[0].sensorValue}}</div>
    </div>
  </div>
</template>

<script lang="ts">
// import { DeviceApi } from "@/api/api";

import AdminScreening from "@/components/AdminScreening.vue";
import UserFacingScreening from "@/components/UserFacingScreening.vue";
import {Component, Vue} from "vue-property-decorator";
import {CameraConnection, CameraConnectionState, Frame} from "@/camera";
import {processSensorData} from "@/processing";
import {detectThermalReference, findFacesInFrame, ROIFeature} from "@/feature-detection";
import {extractSensorValueForCircle} from "@/circle-detection";
import {HaarCascade, loadFaceRecognitionModel} from "@/haar-cascade";
import {Face} from "@/face";

let FaceRecognitionModel: HaarCascade | null = null;
const ZeroCelsiusInKelvin = 273.15;
class DegreesCelsius {
  private val: number;
  constructor(val: number) {
    this.val = val;
  }
  public toString(): string {
    return `${this.val.toFixed(2)}°C`;
  }
}
const mKToCelsius: (val:number) => DegreesCelsius = (mkVal: number) => (new DegreesCelsius(mkVal * 0.01 - ZeroCelsiusInKelvin));

interface AppState {
  currentFrame: Frame | null;
  cameraConnectionState: CameraConnectionState;
  thermalReference: ROIFeature | null;
  faces: Face[];
  faceModel: HaarCascade | null;
  lastFrameTime: number;
}

export const State: AppState = {
  currentFrame: null,
  cameraConnectionState: CameraConnectionState.Disconnected,
  thermalReference: null,
  faces: [],
  faceModel: null,
  lastFrameTime: 0,
};

@Component({
  components: { AdminScreening, UserFacingScreening }
})
export default class App extends Vue {
  get isAdminScreen(): boolean {
    return true;
  }
  private appState: AppState = State;
  private thermalReferenceRawValue = 0;

  public get currentFrameCount(): number {
    // NOTE(jon): This is always zero if it's the fake thermal camera.
    if ((this.appState.currentFrame as Frame).frameInfo) {
      return (this.appState.currentFrame as Frame).frameInfo.Telemetry
        .FrameCount;
    }
    return 0;
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
    return this.appState.cameraConnectionState === CameraConnectionState.Connected;
  }

  get isConnecting(): boolean {
    return this.appState.cameraConnectionState === CameraConnectionState.Connecting;
  }

  get hasFaces(): boolean {
    return this.appState.faces.length !== 0;
  }

  get numFaces(): number {
    return this.appState.faces.length;
  }

  private async onFrame(frame: Frame) {
    this.appState.currentFrame = frame;
    this.appState.lastFrameTime = new Date().getTime();
    const { ResX: width, ResY: height } = frame.frameInfo.Camera;
    /* --- Process frame and extract features: --- */
    // We want to get out:
    // Smoothed versions.
    // Features, hotspots
    const { smoothedData, saltPepperData } = processSensorData(frame);
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
        this.appState.faces
      );
    }
  }

  onConnectionStateChange(connection: CameraConnectionState) {
    this.appState.cameraConnectionState = connection;
  }

  async beforeMount() {
    // On startup:
    console.log("Init");
    // Load the face recognition model
    // NOTE: Don't add this to the Vue state tree, since its state never changes.
    FaceRecognitionModel = await loadFaceRecognitionModel("/cascade_stg17.xml");
    // Open the camera connection
    new CameraConnection("http://localhost:2041", this.onFrame, this.onConnectionStateChange);
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
