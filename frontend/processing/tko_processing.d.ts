/* tslint:disable */
/* eslint-disable */
/**
* @param {Uint16Array} input_frame
* @param {any} calibrated_thermal_ref_temp_c
* @param {any} ms_since_last_ffc
* @returns {AnalysisResult}
*/
export function analyse(input_frame: Uint16Array, calibrated_thermal_ref_temp_c: any, ms_since_last_ffc: any): AnalysisResult;
/**
* @returns {Float32Array}
*/
export function getMedianSmoothed(): Float32Array;
/**
* @returns {Float32Array}
*/
export function getDebug(): Float32Array;
/**
* @returns {Uint8Array}
*/
export function getThresholded(): Uint8Array;
/**
* @returns {Uint8Array}
*/
export function getBodyShape(): Uint8Array;
/**
* @returns {Uint8Array}
*/
export function getFaceShape(): Uint8Array;
/**
* @returns {Float32Array}
*/
export function getRadialSmoothed(): Float32Array;
/**
* @returns {Float32Array}
*/
export function getEdges(): Float32Array;
/**
* @param {any} _width
* @param {any} _height
*/
export function initialize(_width: any, _height: any): void;
/**
*/
export enum ScreeningState {
  WarmingUp,
  Ready,
  HeadLock,
  TooFar,
  HasBody,
  FaceLock,
  FrontalLock,
  StableLock,
  Measured,
  MissingThermalRef,
  Blurred,
  AfterFfcEvent,
}
/**
*/
export enum HeadLockConfidence {
  Bad,
  Partial,
  Stable,
}
/**
*/
export enum InvalidReason {
  Unknown,
  Valid,
  TooMuchTilt,
}
/**
*/
export class AnalysisResult {
  free(): void;
/**
* @returns {FaceInfo}
*/
  face: FaceInfo;
/**
* @returns {number}
*/
  frameBottomSum: number;
/**
* @returns {boolean}
*/
  hasBody: boolean;
/**
* @returns {HeatStats}
*/
  heatStats: HeatStats;
/**
* @returns {number}
*/
  motionSum: number;
/**
* @returns {number}
*/
  motionThresholdSum: number;
/**
* @returns {number}
*/
  nextState: number;
/**
* @returns {ThermalReference}
*/
  thermalReference: ThermalReference;
/**
* @returns {number}
*/
  thresholdSum: number;
}
/**
*/
export class Circle {
  free(): void;
/**
* @returns {Point}
*/
  center: Point;
/**
* @returns {number}
*/
  radius: number;
}
/**
*/
export class FaceInfo {
  free(): void;
/**
* @returns {number}
*/
  halfwayRatio: number;
/**
* @returns {Quad}
*/
  head: Quad;
/**
* @returns {number}
*/
  headLock: number;
/**
* @returns {Point}
*/
  idealSamplePoint: Point;
/**
* @returns {number}
*/
  idealSampleTemp: number;
/**
* @returns {number}
*/
  idealSampleValue: number;
/**
* @returns {boolean}
*/
  isValid: boolean;
/**
* @returns {number}
*/
  reason: number;
/**
* @returns {Point}
*/
  samplePoint: Point;
/**
* @returns {number}
*/
  sampleTemp: number;
/**
* @returns {number}
*/
  sampleValue: number;
}
/**
*/
export class HeatStats {
  free(): void;
/**
* @returns {number}
*/
  max: number;
/**
* @returns {number}
*/
  min: number;
/**
* @returns {number}
*/
  threshold: number;
}
/**
*/
export class Point {
  free(): void;
/**
* @returns {number}
*/
  x: number;
/**
* @returns {number}
*/
  y: number;
}
/**
*/
export class Quad {
  free(): void;
/**
* @returns {Point}
*/
  bottomLeft: Point;
/**
* @returns {Point}
*/
  bottomRight: Point;
/**
* @returns {Point}
*/
  topLeft: Point;
/**
* @returns {Point}
*/
  topRight: Point;
}
/**
*/
export class ThermalReference {
  free(): void;
/**
* @returns {Circle}
*/
  geom: Circle;
/**
* @returns {number}
*/
  temp: number;
/**
* @returns {number}
*/
  val: number;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly analyse: (a: number, b: number, c: number) => number;
  readonly getMedianSmoothed: () => number;
  readonly getDebug: () => number;
  readonly getThresholded: () => number;
  readonly getBodyShape: () => number;
  readonly getFaceShape: () => number;
  readonly getRadialSmoothed: () => number;
  readonly getEdges: () => number;
  readonly initialize: (a: number, b: number) => void;
  readonly __wbg_heatstats_free: (a: number) => void;
  readonly __wbg_get_heatstats_min: (a: number) => number;
  readonly __wbg_set_heatstats_min: (a: number, b: number) => void;
  readonly __wbg_get_heatstats_max: (a: number) => number;
  readonly __wbg_set_heatstats_max: (a: number, b: number) => void;
  readonly __wbg_get_heatstats_threshold: (a: number) => number;
  readonly __wbg_set_heatstats_threshold: (a: number, b: number) => void;
  readonly __wbg_quad_free: (a: number) => void;
  readonly __wbg_get_quad_topRight: (a: number) => number;
  readonly __wbg_set_quad_topRight: (a: number, b: number) => void;
  readonly __wbg_get_quad_bottomLeft: (a: number) => number;
  readonly __wbg_set_quad_bottomLeft: (a: number, b: number) => void;
  readonly __wbg_get_quad_bottomRight: (a: number) => number;
  readonly __wbg_set_quad_bottomRight: (a: number, b: number) => void;
  readonly __wbg_faceinfo_free: (a: number) => void;
  readonly __wbg_get_faceinfo_isValid: (a: number) => number;
  readonly __wbg_set_faceinfo_isValid: (a: number, b: number) => void;
  readonly __wbg_get_faceinfo_halfwayRatio: (a: number) => number;
  readonly __wbg_set_faceinfo_halfwayRatio: (a: number, b: number) => void;
  readonly __wbg_get_faceinfo_headLock: (a: number) => number;
  readonly __wbg_set_faceinfo_headLock: (a: number, b: number) => void;
  readonly __wbg_get_faceinfo_head: (a: number) => number;
  readonly __wbg_set_faceinfo_head: (a: number, b: number) => void;
  readonly __wbg_get_faceinfo_samplePoint: (a: number) => number;
  readonly __wbg_set_faceinfo_samplePoint: (a: number, b: number) => void;
  readonly __wbg_get_faceinfo_sampleValue: (a: number) => number;
  readonly __wbg_set_faceinfo_sampleValue: (a: number, b: number) => void;
  readonly __wbg_get_faceinfo_sampleTemp: (a: number) => number;
  readonly __wbg_set_faceinfo_sampleTemp: (a: number, b: number) => void;
  readonly __wbg_get_faceinfo_idealSamplePoint: (a: number) => number;
  readonly __wbg_set_faceinfo_idealSamplePoint: (a: number, b: number) => void;
  readonly __wbg_get_faceinfo_idealSampleValue: (a: number) => number;
  readonly __wbg_set_faceinfo_idealSampleValue: (a: number, b: number) => void;
  readonly __wbg_get_faceinfo_idealSampleTemp: (a: number) => number;
  readonly __wbg_set_faceinfo_idealSampleTemp: (a: number, b: number) => void;
  readonly __wbg_get_faceinfo_reason: (a: number) => number;
  readonly __wbg_set_faceinfo_reason: (a: number, b: number) => void;
  readonly __wbg_get_point_x: (a: number) => number;
  readonly __wbg_set_point_x: (a: number, b: number) => void;
  readonly __wbg_get_point_y: (a: number) => number;
  readonly __wbg_set_point_y: (a: number, b: number) => void;
  readonly __wbg_thermalreference_free: (a: number) => void;
  readonly __wbg_get_thermalreference_geom: (a: number) => number;
  readonly __wbg_set_thermalreference_geom: (a: number, b: number) => void;
  readonly __wbg_get_thermalreference_val: (a: number) => number;
  readonly __wbg_set_thermalreference_val: (a: number, b: number) => void;
  readonly __wbg_get_thermalreference_temp: (a: number) => number;
  readonly __wbg_set_thermalreference_temp: (a: number, b: number) => void;
  readonly __wbg_analysisresult_free: (a: number) => void;
  readonly __wbg_get_analysisresult_motionSum: (a: number) => number;
  readonly __wbg_set_analysisresult_motionSum: (a: number, b: number) => void;
  readonly __wbg_get_analysisresult_motionThresholdSum: (a: number) => number;
  readonly __wbg_set_analysisresult_motionThresholdSum: (a: number, b: number) => void;
  readonly __wbg_get_analysisresult_thresholdSum: (a: number) => number;
  readonly __wbg_set_analysisresult_thresholdSum: (a: number, b: number) => void;
  readonly __wbg_get_analysisresult_frameBottomSum: (a: number) => number;
  readonly __wbg_set_analysisresult_frameBottomSum: (a: number, b: number) => void;
  readonly __wbg_get_analysisresult_hasBody: (a: number) => number;
  readonly __wbg_set_analysisresult_hasBody: (a: number, b: number) => void;
  readonly __wbg_get_analysisresult_heatStats: (a: number) => number;
  readonly __wbg_set_analysisresult_heatStats: (a: number, b: number) => void;
  readonly __wbg_get_analysisresult_face: (a: number) => number;
  readonly __wbg_set_analysisresult_face: (a: number, b: number) => void;
  readonly __wbg_get_analysisresult_nextState: (a: number) => number;
  readonly __wbg_set_analysisresult_nextState: (a: number, b: number) => void;
  readonly __wbg_get_analysisresult_thermalReference: (a: number) => number;
  readonly __wbg_set_analysisresult_thermalReference: (a: number, b: number) => void;
  readonly __wbg_circle_free: (a: number) => void;
  readonly __wbg_get_circle_center: (a: number) => number;
  readonly __wbg_set_circle_center: (a: number, b: number) => void;
  readonly __wbg_get_circle_radius: (a: number) => number;
  readonly __wbg_set_circle_radius: (a: number, b: number) => void;
  readonly __wbg_get_quad_topLeft: (a: number) => number;
  readonly __wbg_set_quad_topLeft: (a: number, b: number) => void;
  readonly __wbg_point_free: (a: number) => void;
  readonly __wbindgen_free: (a: number, b: number) => void;
  readonly __wbindgen_malloc: (a: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number) => number;
}

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
