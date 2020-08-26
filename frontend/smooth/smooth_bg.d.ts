/* tslint:disable */
/* eslint-disable */
export const memory: WebAssembly.Memory;
export function __wbg_heatstats_free(a: number): void;
export function __wbg_get_heatstats_min(a: number): number;
export function __wbg_set_heatstats_min(a: number, b: number): void;
export function __wbg_get_heatstats_max(a: number): number;
export function __wbg_set_heatstats_max(a: number, b: number): void;
export function __wbg_get_heatstats_threshold(a: number): number;
export function __wbg_set_heatstats_threshold(a: number, b: number): void;
export function initialize(a: number, b: number): void;
export function smooth(a: number, b: number): void;
export function getMedianSmoothed(): number;
export function getThresholded(): number;
export function getHeatStats(): number;
export function getHistogram(): number;
export function getRadialSmoothed(): number;
export function __wbindgen_free(a: number, b: number): void;
export function __wbindgen_malloc(a: number): number;
export function __wbindgen_realloc(a: number, b: number, c: number): number;
