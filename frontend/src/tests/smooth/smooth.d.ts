/* tslint:disable */
/* eslint-disable */
/**
* @param {any} width
* @param {any} height
*/
export function initialize(width: any, height: any): void;
/**
* @param {Uint16Array} input_frame
* @param {any} calibrated_temp_c
* @returns {AnalysisResult}
*/
export function analyse(input_frame: Uint16Array, calibrated_temp_c: any): AnalysisResult;
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
export enum ScreeningState {
  WarmingUp,
  Ready,
  HeadLock,
  TooFar,
  HasBody,
  FaceLock,
  FrontalLock,
  StableLock,
  Leaving,
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
