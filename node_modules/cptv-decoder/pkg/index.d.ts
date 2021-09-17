/* tslint:disable */
/* eslint-disable */
/**
*/
export class CptvPlayerContext {
  free(): void;
/**
* @param {any} stream
* @returns {any}
*/
  static newWithStream(stream: any): any;
/**
* @returns {boolean}
*/
  streamComplete(): boolean;
/**
* @param {CptvPlayerContext} context
* @returns {any}
*/
  static countTotalFrames(context: CptvPlayerContext): any;
/**
* @param {CptvPlayerContext} context
* @returns {any}
*/
  static fetchNextFrame(context: CptvPlayerContext): any;
/**
* @returns {any}
*/
  totalFrames(): any;
/**
* @returns {number}
*/
  bytesLoaded(): number;
/**
* @returns {Uint16Array}
*/
  getNextFrame(): Uint16Array;
/**
* @returns {any}
*/
  getFrameHeader(): any;
/**
* @returns {number}
*/
  getWidth(): number;
/**
* @returns {number}
*/
  getHeight(): number;
/**
* @returns {number}
*/
  getFrameRate(): number;
/**
* @returns {number}
*/
  getFramesPerIframe(): number;
/**
* @param {CptvPlayerContext} context
* @returns {any}
*/
  static fetchHeader(context: CptvPlayerContext): any;
/**
* @returns {any}
*/
  getHeader(): any;
}
