<template>
  <div id="app">
    <div class="home">
      <AdminScreening v-if="isAdminScreen" :frame="currentFrame" />
      <UserFacingScreening v-else />
      <div v-if="!hasThermalReference">ERROR: No thermal reference found</div>
    </div>
  </div>
</template>

<script lang="ts">
// import { DeviceApi } from "@/api/api";

import AdminScreening from "@/components/AdminScreening.vue";
import UserFacingScreening from "@/components/UserFacingScreening.vue";
import { Component, Vue } from "vue-property-decorator";
import { CameraConnection, Frame } from "@/camera";
import { processSensorData } from "@/processing";
import {
  detectThermalReference,
  findFacesInFrame,
  ROIFeature
} from "@/feature-detection";
import { extractSensorValueForCircle } from "@/circle-detection";
import { HaarCascade, loadFaceRecognitionModel } from "@/haar-cascade";
import { Face } from "@/face";

let FaceRecognitionModel: HaarCascade | null = null;

interface AppState {
  currentFrame: Frame | null;
  thermalReference: ROIFeature | null;
  faces: Face[];
  faceModel: HaarCascade | null;
}

export const State: AppState = {
  currentFrame: null,
  thermalReference: null,
  faces: [],
  faceModel: null
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

  get currentFrame(): Frame {
    return this.appState.currentFrame as Frame;
  }

  get hasThermalReference(): boolean {
    return this.appState.thermalReference !== null;
  }

  private async onFrame(frame: Frame) {
    this.appState.currentFrame = frame;
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

  async beforeMount() {
    // On startup:
    console.log("Init app");

    // Load the face recognition model
    // NOTE: Don't add this to the Vue state tree, since its state never changes.
    FaceRecognitionModel = await loadFaceRecognitionModel("/cascade_stg17.xml");
    // Open the camera connection
    new CameraConnection("http://localhost:2041", this.onFrame);
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
