/* tslint:disable */
/* eslint-disable */
/**
* @param {any} width
* @param {any} height
*/
export function initialize(width: any, height: any): void;
/**
* @param {Float32Array} input_frame
* @param {any} num_buckets
* @param {any} should_rotate
* @param {any} thermal_ref_c
* @param {any} thermal_ref_raw
* @param {any} thermal_ref_x0
* @param {any} thermal_ref_y0
* @param {any} thermal_ref_x1
* @param {any} thermal_ref_y1
* @returns {MotionStats}
*/
export function smooth(input_frame: Float32Array, num_buckets: any, should_rotate: any, thermal_ref_c: any, thermal_ref_raw: any, thermal_ref_x0: any, thermal_ref_y0: any, thermal_ref_x1: any, thermal_ref_y1: any): MotionStats;
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
export function getHeadHull(): Uint8Array;
/**
* @returns {Uint8Array}
*/
export function getBodyHull(): Uint8Array;
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
*/
export enum HeadLockConfidence {
  Bad,
  Partial,
  Stable,
}
/**
*/
export class FaceInfo {
  free(): void;
/**
* @returns {Quad}
*/
  forehead: Quad;
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
export class MotionStats {
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
  threshold_sum: number;
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

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_heatstats_free: (a: number) => void;
  readonly __wbg_get_heatstats_min: (a: number) => number;
  readonly __wbg_set_heatstats_min: (a: number, b: number) => void;
  readonly __wbg_get_heatstats_max: (a: number) => number;
  readonly __wbg_set_heatstats_max: (a: number, b: number) => void;
  readonly initialize: (a: number, b: number) => void;
  readonly smooth: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number) => number;
  readonly __wbg_quad_free: (a: number) => void;
  readonly __wbg_get_quad_top_left: (a: number) => number;
  readonly __wbg_set_quad_top_left: (a: number, b: number) => void;
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
  readonly __wbg_get_faceinfo_forehead: (a: number) => number;
  readonly __wbg_set_faceinfo_forehead: (a: number, b: number) => void;
  readonly __wbg_get_faceinfo_head: (a: number) => number;
  readonly __wbg_set_faceinfo_head: (a: number, b: number) => void;
  readonly __wbg_get_faceinfo_sample_point: (a: number) => number;
  readonly __wbg_set_faceinfo_sample_point: (a: number, b: number) => void;
  readonly __wbg_get_faceinfo_sample_value: (a: number) => number;
  readonly __wbg_set_faceinfo_sample_value: (a: number, b: number) => void;
  readonly __wbg_get_point_x: (a: number) => number;
  readonly __wbg_set_point_x: (a: number, b: number) => void;
  readonly __wbg_get_point_y: (a: number) => number;
  readonly __wbg_set_point_y: (a: number, b: number) => void;
  readonly __wbg_motionstats_free: (a: number) => void;
  readonly __wbg_get_motionstats_motion_sum: (a: number) => number;
  readonly __wbg_set_motionstats_motion_sum: (a: number, b: number) => void;
  readonly __wbg_get_motionstats_motion_threshold_sum: (a: number) => number;
  readonly __wbg_set_motionstats_motion_threshold_sum: (a: number, b: number) => void;
  readonly __wbg_get_motionstats_threshold_sum: (a: number) => number;
  readonly __wbg_set_motionstats_threshold_sum: (a: number, b: number) => void;
  readonly __wbg_get_motionstats_frame_bottom_sum: (a: number) => number;
  readonly __wbg_set_motionstats_frame_bottom_sum: (a: number, b: number) => void;
  readonly __wbg_get_motionstats_heat_stats: (a: number) => number;
  readonly __wbg_set_motionstats_heat_stats: (a: number, b: number) => void;
  readonly __wbg_get_motionstats_face: (a: number) => number;
  readonly __wbg_set_motionstats_face: (a: number, b: number) => void;
  readonly getMedianSmoothed: () => number;
  readonly getThresholded: () => number;
  readonly getHeadHull: () => number;
  readonly getBodyHull: () => number;
  readonly getHeatStats: () => number;
  readonly getHistogram: () => number;
  readonly getRadialSmoothed: () => number;
  readonly getEdges: () => number;
  readonly __wbg_set_heatstats_threshold: (a: number, b: number) => void;
  readonly __wbg_point_free: (a: number) => void;
  readonly __wbg_get_heatstats_threshold: (a: number) => number;
  readonly __wbindgen_malloc: (a: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number) => number;
  readonly __wbindgen_free: (a: number, b: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
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
        