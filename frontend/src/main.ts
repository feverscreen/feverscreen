import Vue from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import {
  AppState,
  MotionStats,
  ScreeningAcceptanceStates,
  ScreeningState
} from "@/types";
import { CameraConnectionState } from "@/camera";
import { DegreesCelsius } from "@/utils";
import {
  faceArea,
  faceHasMovedOrChangedInSize,
  FaceInfo,
  faceIsFrontOn
} from "@/body-detection";
import { ROIFeature } from "@/worker-fns";
import { faceIntersectsThermalRef } from "@/geom";

Vue.config.productionTip = false;
export const DEFAULT_THRESHOLD_MIN_NORMAL = 32.5;
export const DEFAULT_THRESHOLD_MIN_FEVER = 37.8;
export const WARMUP_TIME_SECONDS = 30 * 60; // 30 mins
export const FFC_SAFETY_DURATION_SECONDS = 5;

export const State: AppState = {
  currentFrame: null,
  prevFrame: null,
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
    thermalRefTemperature: new DegreesCelsius(0)
  },
  currentScreeningEvent: null,
  currentScreeningState: ScreeningState.INIT,
  currentScreeningStateFrameCount: -1,
  faceModel: null,
  lastFrameTime: 0,
  uuid: 0,
  motionStats: {
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
      head: {
        topLeft: { x: 0, y: 0 },
        topRight: { x: 0, y: 0 },
        bottomLeft: { x: 0, y: 0 },
        bottomRight: { x: 0, y: 0 }
      }
    },

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

function advanceScreeningState(
  nextState: ScreeningState,
  prevState: ScreeningState,
  currentCount: number
): { state: ScreeningState; count: number } {
  // We can only move from certain states to certain other states.
  if (prevState !== nextState) {
    const allowedNextState = ScreeningAcceptanceStates[prevState];
    if ((allowedNextState as ScreeningState[]).includes(nextState)) {
      // console.log("Advanced to state", nextState);
      return {
        state: nextState,
        count: 1
      };
    }
  }
  return {
    state: prevState,
    count: currentCount + 1
  };
}

export function advanceState(
  prevMotionStats: MotionStats,
  motionStats: MotionStats,
  face: FaceInfo | null,
  prevFace: FaceInfo | null,
  screeningState: ScreeningState,
  screeningStateCount: number,
  threshold: number,
  thermalReference: ROIFeature
): {
  prevFace: FaceInfo | null;
  state: ScreeningState;
  count: number;
  event: string;
} {
  let next;
  let event = "";
  if (face !== null) {
    if (screeningState === ScreeningState.MISSING_THERMAL_REF) {
      if (faceArea(face) < 1500) {
        next = advanceScreeningState(
          ScreeningState.TOO_FAR,
          screeningState,
          screeningStateCount
        );
      } else {
        next = advanceScreeningState(
          ScreeningState.LARGE_BODY,
          screeningState,
          screeningStateCount
        );
      }
    } else if (faceArea(face) < 1500) {
      next = advanceScreeningState(
        ScreeningState.TOO_FAR,
        screeningState,
        screeningStateCount
      );
    } else if (faceIntersectsThermalRef(face, thermalReference)) {
      next = advanceScreeningState(
        ScreeningState.LARGE_BODY,
        screeningState,
        screeningStateCount
      );
    } else if (face.headLock !== 0) {
      if (faceIsFrontOn(face)) {
        const faceMoved = faceHasMovedOrChangedInSize(face, prevFace);
        if (faceMoved) {
          screeningStateCount--;
        }
        if (
          screeningState === ScreeningState.FRONTAL_LOCK &&
          !faceMoved &&
          face.headLock === 2 &&
          screeningStateCount > 1 // Needs to be on this state for at least two frames.
        ) {
          next = advanceScreeningState(
            ScreeningState.STABLE_LOCK,
            screeningState,
            screeningStateCount
          );
          if (next.state !== screeningState) {
            // Capture the screening event here
            event = "Captured";
            console.log("---- Captured");
          }
        } else if (screeningState === ScreeningState.STABLE_LOCK) {
          next = advanceScreeningState(
            ScreeningState.LEAVING,
            screeningState,
            screeningStateCount
          );
        } else {
          next = advanceScreeningState(
            ScreeningState.FRONTAL_LOCK,
            screeningState,
            screeningStateCount
          );
        }
      } else {
        // NOTE: Could stay here a while if we're in an FFC event.
        next = advanceScreeningState(
          ScreeningState.FACE_LOCK,
          screeningState,
          screeningStateCount
        );
      }
    } else {
      next = advanceScreeningState(
        ScreeningState.HEAD_LOCK,
        screeningState,
        screeningStateCount
      );
    }
    prevFace = face;
  } else {
    // TODO(jon): Ignore stats around FFC, just say that it's thinking...
    const hasBody =
      motionStats.frameBottomSum !== 0 && motionStats.motionThresholdSum > 45;
    const prevFrameHasBody =
      prevMotionStats.frameBottomSum !== 0 &&
      prevMotionStats.motionThresholdSum > 45;
    // TODO(jon): OR the threshold bounds are taller vertically than horizontally?
    if (hasBody) {
      next = advanceScreeningState(
        ScreeningState.LARGE_BODY,
        screeningState,
        screeningStateCount
      );
    } else {
      // Require 2 frames without a body before triggering leave event.
      if (!prevFrameHasBody) {
        if (
          screeningState === ScreeningState.LEAVING &&
          screeningStateCount > 15
        ) {
          // Record event now that we have lost the face?
          event = "Recorded";
          next = advanceScreeningState(
            ScreeningState.READY,
            screeningState,
            screeningStateCount
          );
        } else if (screeningState !== ScreeningState.LEAVING) {
          next = advanceScreeningState(
            ScreeningState.READY,
            screeningState,
            screeningStateCount
          );
        } else {
          next = advanceScreeningState(
            ScreeningState.LEAVING,
            screeningState,
            screeningStateCount
          );
        }
      } else {
        next = advanceScreeningState(
          ScreeningState.LARGE_BODY,
          screeningState,
          screeningStateCount
        );
      }
    }
    prevFace = null;
  }
  return {
    prevFace,
    state: next.state,
    count: next.count,
    event
  };
}

new Vue({
  vuetify,
  render: h => h(App)
}).$mount("#app");
