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
*/
export function smooth(input_frame: Float32Array, num_buckets: any): void;
/**
* @returns {Float32Array}
*/
export function getMedianSmoothed(): Float32Array;
/**
* @returns {Uint8Array}
*/
export function getThresholded(): Uint8Array;
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
  readonly smooth: (a: number, b: number) => void;
  readonly getMedianSmoothed: () => number;
  readonly getThresholded: () => number;
  readonly getHeatStats: () => number;
  readonly getHistogram: () => number;
  readonly getRadialSmoothed: () => number;
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
        