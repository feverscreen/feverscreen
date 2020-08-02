import Vue from "vue";
import App from "./App.vue";
//import "./registerServiceWorker";
import vuetify from "./plugins/vuetify";
import { AppState, ScreeningState } from "@/types";
import { CameraConnectionState } from "@/camera";
import { DegreesCelsius } from "@/utils";

Vue.config.productionTip = false;
export const DEFAULT_THRESHOLD_MIN_NORMAL = 32.5;
export const DEFAULT_THRESHOLD_MIN_FEVER = 37.8;
export const State: AppState = {
  currentFrame: null,
  cameraConnectionState: CameraConnectionState.Disconnected,
  thermalReference: null,
  thermalReferenceStats: null,
  faces: [],
  face: null,
  paused: false,
  currentCalibration: {
    calibrationTemperature: new DegreesCelsius(36),
    thermalReferenceRawValue: 30000,
    hotspotRawTemperatureValue: 31000,
    timestamp: new Date(),
    cropBox: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    },
    thresholdMinFever: DEFAULT_THRESHOLD_MIN_FEVER,
    thresholdMinNormal: DEFAULT_THRESHOLD_MIN_NORMAL,
    thermalRefTemperature: new DegreesCelsius(0)
  },
  currentScreeningEvent: null,
  currentScreeningState: ScreeningState.READY,
  currentScreeningStateFrameCount: -1,
  faceModel: null,
  lastFrameTime: 0,
  uuid: 0
};

/*
//these are the *lowest* temperature in celsius for each category
let GThreshold_error = 42.5;
let GThreshold_fever = 37.8;
let GThreshold_check = 37.4;
let GThreshold_normal = 35.7;
 */

new Vue({
  vuetify,
  render: h => h(App)
}).$mount("#app");
