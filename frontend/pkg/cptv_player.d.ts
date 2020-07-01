/* tslint:disable */
/**
 * @param {number} size
 */
export function initBufferWithSize(size: number): void;
/**
 * @param {Uint8Array} chunk
 * @param {number} offset
 */
export function insertChunkAtOffset(chunk: Uint8Array, offset: number): void;
/**
 * @param {Uint8Array} input
 */
export function initWithCptvData(input: Uint8Array): void;
/**
 * @returns {number}
 */
export function getNumFrames(): number;
/**
 * @returns {number}
 */
export function getWidth(): number;
/**
 * @returns {number}
 */
export function getHeight(): number;
/**
 * @returns {number}
 */
export function getFrameRate(): number;
/**
 * @returns {number}
 */
export function getFramesPerIframe(): number;
/**
 * @returns {number}
 */
export function getMinValue(): number;
/**
 * @returns {number}
 */
export function getMaxValue(): number;
/**
 * @returns {any}
 */
export function getHeader(): any;
/**
 * @param {number} number
 * @param {any} callback
 * @returns {boolean}
 */
export function queueFrame(number: number, callback: any): boolean;
/**
 * @param {number} number
 * @param {Uint8Array} image_data
 * @returns {boolean}
 */
export function getFrame(number: number, image_data: Uint8Array): boolean;
/**
 * @param {Uint8Array} image_data
 * @returns {FrameHeaderV2}
 */
export function getRawFrame(image_data: Uint8Array): FrameHeaderV2;
/**
 */
export class FrameHeaderV2 {
  free(): void;
  frame_number: number;
  has_next_frame: boolean;
  last_ffc_time: number;
  time_on: number;
}
