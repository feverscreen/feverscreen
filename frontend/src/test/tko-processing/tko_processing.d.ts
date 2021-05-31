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
export function reinitialize(): void;
