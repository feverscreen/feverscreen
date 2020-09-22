/* tslint:disable */
/* eslint-disable */
/**
* @param {Uint16Array} input_frame
* @param {any} calibrated_thermal_ref_temp_c
* @returns {AnalysisResult}
*/
export function analyse(input_frame: Uint16Array, calibrated_thermal_ref_temp_c: any): AnalysisResult;
/**
* @returns {Float32Array}
*/
export function getMedianSmoothed(): Float32Array;
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
export function getHull(): Uint8Array;
/**
* @returns {HeatStats}
*/
export function getHeatStats(): HeatStats;
/**
* @returns {Array<any>}
*/
export function getHistogram(): Array<any>;
/**
* @returns {Float32Array}
*/
export function getRadialSmoothed(): Float32Array;
/**
* @returns {Float32Array}
*/
export function getEdges(): Float32Array;
/**
* @param {any} width
* @param {any} height
*/
export function initialize(width: any, height: any): void;
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
export class AnalysisResult {
  free(): void;
/**
* @returns {FaceInfo}
*/
  face: FaceInfo;
/**
* @returns {number}
*/
  frame_bottom_sum: number;
/**
* @returns {boolean}
*/
  has_body: boolean;
/**
* @returns {HeatStats}
*/
  heat_stats: HeatStats;
/**
* @returns {number}
*/
  motion_sum: number;
/**
* @returns {number}
*/
  motion_threshold_sum: number;
/**
* @returns {number}
*/
  next_state: number;
/**
* @returns {ThermalReference}
*/
  thermal_ref: ThermalReference;
/**
* @returns {number}
*/
  threshold_sum: number;
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
  halfway_ratio: number;
/**
* @returns {Quad}
*/
  head: Quad;
/**
* @returns {number}
*/
  head_lock: number;
/**
* @returns {boolean}
*/
  is_valid: boolean;
/**
* @returns {Point}
*/
  sample_point: Point;
/**
* @returns {number}
*/
  sample_temp: number;
/**
* @returns {number}
*/
  sample_value: number;
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
  bottom_left: Point;
/**
* @returns {Point}
*/
  bottom_right: Point;
/**
* @returns {Point}
*/
  top_left: Point;
/**
* @returns {Point}
*/
  top_right: Point;
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
  readonly analyse: (a: number, b: number) => number;
  readonly getMedianSmoothed: () => number;
  readonly getThresholded: () => number;
  readonly getBodyShape: () => number;
  readonly getHull: () => number;
  readonly getHeatStats: () => number;
  readonly getHistogram: () => number;
  readonly getRadialSmoothed: () => number;
  readonly getEdges: () => number;
  readonly initialize: (a: number, b: number) => void;
  readonly __wbg_heatstats_free: (a: number) => void;
  readonly __wbg_get_heatstats_min: (a: number) => number;
  readonly __wbg_set_heatstats_min: (a: number, b: number) => void;
  readonly __wbg_get_heatstats_max: (a: number) => number;
  readonly __wbg_set_heatstats_max: (a: number, b: number) => void;
  readonly __wbg_quad_free: (a: number) => void;
  readonly __wbg_get_quad_top_right: (a: number) => number;
  readonly __wbg_set_quad_top_right: (a: number, b: number) => void;
  readonly __wbg_get_quad_bottom_left: (a: number) => number;
  readonly __wbg_set_quad_bottom_left: (a: number, b: number) => void;
  readonly __wbg_get_quad_bottom_right: (a: number) => number;
  readonly __wbg_set_quad_bottom_right: (a: number, b: number) => void;
  readonly __wbg_faceinfo_free: (a: number) => void;
  readonly __wbg_get_faceinfo_is_valid: (a: number) => number;
  readonly __wbg_set_faceinfo_is_valid: (a: number, b: number) => void;
  readonly __wbg_get_faceinfo_halfway_ratio: (a: number) => number;
  readonly __wbg_set_faceinfo_halfway_ratio: (a: number, b: number) => void;
  readonly __wbg_get_faceinfo_head_lock: (a: number) => number;
  readonly __wbg_set_faceinfo_head_lock: (a: number, b: number) => void;
  readonly __wbg_get_faceinfo_head: (a: number) => number;
  readonly __wbg_set_faceinfo_head: (a: number, b: number) => void;
  readonly __wbg_get_faceinfo_sample_point: (a: number) => number;
  readonly __wbg_set_faceinfo_sample_point: (a: number, b: number) => void;
  readonly __wbg_get_faceinfo_sample_value: (a: number) => number;
  readonly __wbg_set_faceinfo_sample_value: (a: number, b: number) => void;
  readonly __wbg_get_faceinfo_sample_temp: (a: number) => number;
  readonly __wbg_set_faceinfo_sample_temp: (a: number, b: number) => void;
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
  readonly __wbg_get_analysisresult_motion_sum: (a: number) => number;
  readonly __wbg_set_analysisresult_motion_sum: (a: number, b: number) => void;
  readonly __wbg_get_analysisresult_motion_threshold_sum: (a: number) => number;
  readonly __wbg_set_analysisresult_motion_threshold_sum: (a: number, b: number) => void;
  readonly __wbg_get_analysisresult_threshold_sum: (a: number) => number;
  readonly __wbg_set_analysisresult_threshold_sum: (a: number, b: number) => void;
  readonly __wbg_get_analysisresult_frame_bottom_sum: (a: number) => number;
  readonly __wbg_set_analysisresult_frame_bottom_sum: (a: number, b: number) => void;
  readonly __wbg_get_analysisresult_has_body: (a: number) => number;
  readonly __wbg_set_analysisresult_has_body: (a: number, b: number) => void;
  readonly __wbg_get_analysisresult_heat_stats: (a: number) => number;
  readonly __wbg_set_analysisresult_heat_stats: (a: number, b: number) => void;
  readonly __wbg_get_analysisresult_face: (a: number) => number;
  readonly __wbg_set_analysisresult_face: (a: number, b: number) => void;
  readonly __wbg_get_analysisresult_next_state: (a: number) => number;
  readonly __wbg_set_analysisresult_next_state: (a: number, b: number) => void;
  readonly __wbg_get_analysisresult_thermal_ref: (a: number) => number;
  readonly __wbg_set_analysisresult_thermal_ref: (a: number, b: number) => void;
  readonly __wbg_circle_free: (a: number) => void;
  readonly __wbg_get_circle_center: (a: number) => number;
  readonly __wbg_set_circle_center: (a: number, b: number) => void;
  readonly __wbg_get_circle_radius: (a: number) => number;
  readonly __wbg_set_circle_radius: (a: number, b: number) => void;
  readonly __wbg_point_free: (a: number) => void;
  readonly __wbg_get_heatstats_threshold: (a: number) => number;
  readonly __wbg_get_quad_top_left: (a: number) => number;
  readonly __wbg_set_quad_top_left: (a: number, b: number) => void;
  readonly __wbg_set_heatstats_threshold: (a: number, b: number) => void;
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
        