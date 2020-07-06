/* tslint:disable */
/* eslint-disable */
/**
* @param {any} width 
* @param {any} height 
*/
export function initialize(width: any, height: any): void;
/**
* @param {any} input_frame 
*/
export function smooth(input_frame: any): void;
/**
* @returns {any} 
*/
export function get_median_smoothed(): any;
/**
* @returns {any} 
*/
export function get_radial_smoothed(): any;
/**
* @returns {any} 
*/
export function get_edges(): any;
/**
* @param {any} input_frame 
* @returns {any} 
*/
export function median_smooth(input_frame: any): any;
/**
* @param {any} input_frame 
* @returns {any} 
*/
export function radial_smooth(input_frame: any): any;
/**
* @param {number} width 
* @param {number} height 
* @returns {CircleDetect} 
*/
export function circle_detect(width: number, height: number): CircleDetect;
/**
*/
export class CircleDetect {
  free(): void;
/**
* @returns {number} 
*/
  r(): number;
/**
* @returns {Point} 
*/
  p(): Point;
}
/**
*/
export class Point {
  free(): void;
/**
* @returns {number} 
*/
  x(): number;
/**
* @returns {number} 
*/
  y(): number;
}
