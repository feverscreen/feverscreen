import Vue from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import { AppState, ScreeningState } from "@/types";
import { CameraConnectionState } from "@/camera";
import { DegreesCelsius } from "@/utils";

Vue.config.productionTip = false;
export const DEFAULT_THRESHOLD_MIN_FEVER = 37.8;
export const WARMUP_TIME_SECONDS = 30 * 60; // 30 mins
export const FFC_SAFETY_DURATION_SECONDS = 5;

// A global that stores the current interpolation state - can probably become part of the vue components.
export const LerpAmount = { amount: 0 };
export const State: AppState = {
  currentFrame: null,
  cameraConnectionState: CameraConnectionState.Disconnected,
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
    thermalRefTemperature: new DegreesCelsius(0)
  },
  currentScreeningEvent: null,
  currentScreeningState: ScreeningState.INIT,
  currentScreeningStateFrameCount: -1,
  lastFrameTime: 0,
  uuid: 0,
  analysisResult: {
    thresholdSum: 0,
    motionThresholdSum: 0,
    heatStats: {
      max: 0,
      min: 0,
      threshold: 0
    },
    face: {
      isValid: false,
      headLock: 0,
      halfwayRatio: 0.0,
      samplePoint: { x: 0, y: 0 },
      sampleValue: 0,
      sampleTemp: 0,
      head: {
        topLeft: { x: 0, y: 0 },
        topRight: { x: 0, y: 0 },
        bottomLeft: { x: 0, y: 0 },
        bottomRight: { x: 0, y: 0 }
      }
    },
    thermalRef: {
      geom: {
        center: {
          x: 0,
          y: 0
        },
        radius: 0
      },
      val: 0,
      temp: 0
    },
    hasBody: false,
    nextState: ScreeningState.INIT,
    motionSum: 0,
    frameBottomSum: 0
  }
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
