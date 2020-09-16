import { CameraConnectionState, Frame } from "./camera";
import { Face } from "./face";
import { HaarCascade } from "./haar-cascade";
import { ROIFeature } from "./worker-fns";
import { DegreesCelsius } from "@/utils";
import { Span } from "@/shape-processing";
import { Point } from "@/geom";

export type BoxOffset = "left" | "right" | "top" | "bottom";
export interface CropBox {
  left: number;
  right: number;
  top: number;
  bottom: number;
}
export interface BoundingBox {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

export interface TestAppState {
  thermalReference: ROIFeature | null;
  faces: Face[];
  cropBox: CropBox;
}

export enum ScreeningState {
  INIT = "INIT",
  WARMING_UP = "WARMING_UP",
  READY = "READY", // no face
  HEAD_LOCK = "HEAD_LOCK",
  TOO_FAR = "TOO_FAR",
  LARGE_BODY = "LARGE_BODY",
  MULTIPLE_HEADS = "MULTIPLE_HEADS",
  FACE_LOCK = "FACE_LOCK", // has face
  FRONTAL_LOCK = "FRONTAL_LOCK", // Face is front-on
  STABLE_LOCK = "STABLE_LOCK", // Face has not changed in size or position for a couple of frames.
  LEAVING = "LEAVING", // has face, but not front-on
  MISSING_THERMAL_REF = "MISSING_REF"
}

// This describes the state machine of allowed state transitions for the screening event.
export const ScreeningAcceptanceStates = {
  [ScreeningState.INIT]: [
    ScreeningState.WARMING_UP,
    ScreeningState.READY,
    ScreeningState.MISSING_THERMAL_REF
  ],
  [ScreeningState.WARMING_UP]: [
    ScreeningState.READY,
    ScreeningState.MISSING_THERMAL_REF
  ],
  [ScreeningState.MULTIPLE_HEADS]: [
    ScreeningState.READY,
    ScreeningState.HEAD_LOCK,
    ScreeningState.FACE_LOCK,
    ScreeningState.FRONTAL_LOCK,
    ScreeningState.MISSING_THERMAL_REF
  ],
  [ScreeningState.LARGE_BODY]: [
    ScreeningState.READY,
    ScreeningState.HEAD_LOCK,
    ScreeningState.MULTIPLE_HEADS,
    ScreeningState.FACE_LOCK,
    ScreeningState.FRONTAL_LOCK,
    ScreeningState.TOO_FAR,
    ScreeningState.MISSING_THERMAL_REF
  ],
  [ScreeningState.TOO_FAR]: [
    ScreeningState.READY,
    ScreeningState.HEAD_LOCK,
    ScreeningState.MULTIPLE_HEADS,
    ScreeningState.FACE_LOCK,
    ScreeningState.FRONTAL_LOCK,
    ScreeningState.MISSING_THERMAL_REF
  ],
  [ScreeningState.READY]: [
    ScreeningState.TOO_FAR,
    ScreeningState.LARGE_BODY,
    ScreeningState.HEAD_LOCK,
    ScreeningState.MULTIPLE_HEADS,
    ScreeningState.FACE_LOCK,
    ScreeningState.FRONTAL_LOCK,
    ScreeningState.MISSING_THERMAL_REF
  ],
  [ScreeningState.FACE_LOCK]: [
    ScreeningState.TOO_FAR,
    ScreeningState.LARGE_BODY,
    ScreeningState.HEAD_LOCK,
    ScreeningState.MULTIPLE_HEADS,
    ScreeningState.FRONTAL_LOCK,
    ScreeningState.READY,
    ScreeningState.MISSING_THERMAL_REF
  ],
  [ScreeningState.FRONTAL_LOCK]: [
    ScreeningState.TOO_FAR,
    ScreeningState.LARGE_BODY,
    ScreeningState.STABLE_LOCK,
    ScreeningState.FACE_LOCK,
    ScreeningState.MULTIPLE_HEADS,
    ScreeningState.HEAD_LOCK,
    ScreeningState.READY,
    ScreeningState.MISSING_THERMAL_REF
  ],
  [ScreeningState.HEAD_LOCK]: [
    ScreeningState.TOO_FAR,
    ScreeningState.LARGE_BODY,
    ScreeningState.FACE_LOCK,
    ScreeningState.FRONTAL_LOCK,
    ScreeningState.READY,
    ScreeningState.MULTIPLE_HEADS,
    ScreeningState.MISSING_THERMAL_REF
  ],
  [ScreeningState.STABLE_LOCK]: [ScreeningState.LEAVING],
  [ScreeningState.LEAVING]: [ScreeningState.READY],
  [ScreeningState.MISSING_THERMAL_REF]: [
    ScreeningState.READY,
    ScreeningState.TOO_FAR,
    ScreeningState.LARGE_BODY
  ]
};

export interface CalibrationConfig {
  cropBox: CropBox;
  timestamp: Date;
  thermalReferenceRawValue: number;
  hotspotRawTemperatureValue: number;
  calibrationTemperature: DegreesCelsius;
  thermalRefTemperature: DegreesCelsius;
  thresholdMinFever: number;
  // TODO(jon): Custom temperature range.
}

export interface Circle {
  center: Point;
  radius: number;
}

export interface ThermalReference {
  geom: Circle;
  val: number;
  temp: number;
}

export interface ScreeningEvent {
  timestamp: Date;
  rawTemperatureValue: number;
  calculatedValue: number;
  sampleX: number;
  sampleY: number;
  frame: Frame;
  thermalReference: ThermalReference;
  face: FaceInfo;
}

export interface FaceInfo {
  halfwayRatio: number;
  headLock: number;
  isValid: boolean;
  samplePoint: Point;
  sampleValue: number;
  sampleTemp: number;
  head: {
    topLeft: Point;
    topRight: Point;
    bottomLeft: Point;
    bottomRight: Point;
  };
}

export interface AnalysisResult {
  motionSum: number;
  motionThresholdSum: number;
  thresholdSum: number;
  frameBottomSum: number;
  heatStats: {
    min: number;
    max: number;
    threshold: number;
  };
  face: FaceInfo;
  nextState: ScreeningState;
  hasBody: boolean;
  thermalRef: ThermalReference;
}

export interface AppState {
  currentFrame: Frame | null;
  cameraConnectionState: CameraConnectionState;
  face: FaceInfo | null;
  currentCalibration: CalibrationConfig;
  currentScreeningEvent: ScreeningEvent | null;
  currentScreeningState: ScreeningState;
  currentScreeningStateFrameCount: number;
  paused: boolean;
  lastFrameTime: number;
  uuid: number;
  analysisResult: AnalysisResult;
}

export type RawShape = Record<number, Span[]>;

function getScreeningState(state: number): ScreeningState {
  let screeningState = ScreeningState.INIT;
  switch (state) {
    case 0:
      screeningState = ScreeningState.WARMING_UP;
      break;
    case 1:
      screeningState = ScreeningState.READY;
      break;
    case 2:
      screeningState = ScreeningState.HEAD_LOCK;
      break;
    case 3:
      screeningState = ScreeningState.TOO_FAR;
      break;
    case 4:
      screeningState = ScreeningState.LARGE_BODY;
      break;
    case 5:
      screeningState = ScreeningState.FACE_LOCK;
      break;
    case 6:
      screeningState = ScreeningState.FRONTAL_LOCK;
      break;
    case 7:
      screeningState = ScreeningState.STABLE_LOCK;
      break;
    case 8:
      screeningState = ScreeningState.LEAVING;
      break;
    case 9:
      screeningState = ScreeningState.MISSING_THERMAL_REF;
      break;
  }
  return screeningState;
}


export function extractResult(analysisResult: any) {
  const f = analysisResult.face;
  const h = f.head;
  const tL = h.top_left;
  const tR = h.top_right;
  const bL = h.bottom_left;
  const bR = h.bottom_right;
  const sP = f.sample_point;
  const hS = analysisResult.heat_stats;
  const ref = analysisResult.thermal_ref;
  const geom = ref.geom;
  const cP = geom.center;
  const copiedAnalysisResult: AnalysisResult = {
    face: {
      headLock: f.head_lock,
      head: {
        topLeft: {
          x: tL.x,
          y: tL.y
        },
        topRight: {
          x: tR.x,
          y: tR.y
        },
        bottomLeft: {
          x: bL.x,
          y: bL.y
        },
        bottomRight: {
          x: bR.x,
          y: bR.y
        }
      },
      samplePoint: {
        x: sP.x,
        y: sP.y
      },
      sampleTemp: f.sample_temp,
      sampleValue: f.sample_value,
      halfwayRatio: f.halfway_ratio,
      isValid: f.is_valid
    },
    frameBottomSum: analysisResult.frame_bottom_sum,
    motionSum: analysisResult.motion_sum,
    heatStats: {
      threshold: hS.threshold,
      min: hS.min,
      max: hS.max
    },
    motionThresholdSum: analysisResult.motion_threshold_sum,
    thresholdSum: analysisResult.threshold_sum,
    nextState: getScreeningState(analysisResult.next_state),
    hasBody: analysisResult.has_body,
    thermalRef: {
      geom: {
        center: {
          x: cP.x,
          y: cP.y
        },
        radius: geom.radius
      },
      val: ref.val,
      temp: ref.temp
    }
  };

  f.free();
  h.free();
  tL.free();
  tR.free();
  bL.free();
  bR.free();
  sP.free();
  hS.free();
  cP.free();
  geom.free();
  ref.free();
  analysisResult.free();
  return copiedAnalysisResult;
}
