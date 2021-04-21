/* tslint:disable */
/* eslint-disable */
/**
*/
export class CptvPlayerContext {
  free(): void;
/**
* @param {any} stream
* @param {number} size
* @returns {any}
*/
  static newWithStream(stream: any, size: number): any;
/**
* @returns {boolean}
*/
  streamComplete(): boolean;
/**
* @param {CptvPlayerContext} context
* @param {number} frame_num
* @returns {any}
*/
  static seekToFrame(context: CptvPlayerContext, frame_num: number): any;
/**
* @returns {number}
*/
  totalFrames(): number;
/**
* @returns {number}
*/
  bytesLoaded(): number;
/**
* @param {number} n
* @returns {any}
*/
  getFrameHeader(n: number): any;
/**
* @param {number} n
* @returns {Uint16Array}
*/
  getRawFrameN(n: number): Uint16Array;
/**
* @returns {Uint16Array}
*/
  getBackgroundFrame(): Uint16Array;
/**
* @returns {number}
*/
  getNumFrames(): number;
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
* @returns {number}
*/
  getMinValue(): number;
/**
* @returns {number}
*/
  getMaxValue(): number;
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

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_cptvplayercontext_free: (a: number) => void;
  readonly cptvplayercontext_newWithStream: (a: number, b: number) => number;
  readonly cptvplayercontext_streamComplete: (a: number) => number;
  readonly cptvplayercontext_seekToFrame: (a: number, b: number) => number;
  readonly cptvplayercontext_totalFrames: (a: number) => number;
  readonly cptvplayercontext_bytesLoaded: (a: number) => number;
  readonly cptvplayercontext_getFrameHeader: (a: number, b: number) => number;
  readonly cptvplayercontext_getRawFrameN: (a: number, b: number) => number;
  readonly cptvplayercontext_getBackgroundFrame: (a: number) => number;
  readonly cptvplayercontext_getNumFrames: (a: number) => number;
  readonly cptvplayercontext_getWidth: (a: number) => number;
  readonly cptvplayercontext_getHeight: (a: number) => number;
  readonly cptvplayercontext_getFrameRate: (a: number) => number;
  readonly cptvplayercontext_getFramesPerIframe: (a: number) => number;
  readonly cptvplayercontext_getMinValue: (a: number) => number;
  readonly cptvplayercontext_getMaxValue: (a: number) => number;
  readonly cptvplayercontext_fetchHeader: (a: number) => number;
  readonly cptvplayercontext_getHeader: (a: number) => number;
  readonly __wbindgen_malloc: (a: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number) => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly _dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__ha16047fe2b41f5b3: (a: number, b: number, c: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __wbindgen_free: (a: number, b: number) => void;
  readonly wasm_bindgen__convert__closures__invoke2_mut__he36f630fe7d7c075: (a: number, b: number, c: number, d: number) => void;
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
