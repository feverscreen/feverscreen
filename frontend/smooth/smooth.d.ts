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
export function getPointCloud(): Uint8Array;
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

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_heatstats_free: (a: number) => void;
  readonly __wbg_get_heatstats_min: (a: number) => number;
  readonly __wbg_set_heatstats_min: (a: number, b: number) => void;
  readonly __wbg_get_heatstats_max: (a: number) => number;
  readonly __wbg_set_heatstats_max: (a: number, b: number) => void;
  readonly __wbg_get_heatstats_threshold: (a: number) => number;
  readonly __wbg_set_heatstats_threshold: (a: number, b: number) => void;
  readonly initialize: (a: number, b: number) => void;
  readonly smooth: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number) => number;
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
  readonly getMedianSmoothed: () => number;
  readonly getThresholded: () => number;
  readonly getPointCloud: () => number;
  readonly getHeatStats: () => number;
  readonly getHistogram: () => number;
  readonly getRadialSmoothed: () => number;
  readonly getEdges: () => number;
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
        