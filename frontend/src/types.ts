import { CameraConnectionState, Frame } from "./camera";
import { Face } from "./face";
import { HaarCascade } from "./haar-cascade";
import { ROIFeature } from "./worker-fns";
import { DegreesCelsius } from "@/utils";
import { ThermalRefValues } from "@/circle-detection";
import { TemperatureSource } from "@/api/types";
import { FaceInfo } from "@/body-detection";
import { Span } from "@/shape-processing";

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
  thresholdMinNormal: number;
  thresholdMinFever: number;
  // TODO(jon): Custom temperature range.
}

export interface ScreeningEvent {
  timestamp: Date;
  rawTemperatureValue: number;
  sampleX: number;
  sampleY: number;
  frame: Frame;
  thermalReferenceRawValue: number;
  thermalReference: ROIFeature;
  face: FaceInfo;
}

export interface MotionStats {
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
}

export interface AppState {
  currentFrame: Frame | null;
  prevFrame: Frame | null;
  cameraConnectionState: CameraConnectionState;
  thermalReference: ROIFeature | null;
  thermalReferenceStats: ThermalRefValues | null;
  faces: Face[];
  face: FaceInfo | null;
  currentCalibration: CalibrationConfig;
  currentScreeningEvent: ScreeningEvent | null;
  currentScreeningState: ScreeningState;
  currentScreeningStateFrameCount: number;
  paused: boolean;
  faceModel: HaarCascade | null;
  lastFrameTime: number;
  uuid: number;
  motionStats: MotionStats;
}

export type RawShape = Record<number, Span[]>;
