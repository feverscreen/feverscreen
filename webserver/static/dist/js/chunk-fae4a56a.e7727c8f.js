(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["chunk-fae4a56a"],{

/***/ "327f":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "initBufferWithSize", function() { return initBufferWithSize; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "insertChunkAtOffset", function() { return insertChunkAtOffset; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "initWithCptvData", function() { return initWithCptvData; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getNumFrames", function() { return getNumFrames; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getWidth", function() { return getWidth; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getHeight", function() { return getHeight; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getFrameRate", function() { return getFrameRate; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getFramesPerIframe", function() { return getFramesPerIframe; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getMinValue", function() { return getMinValue; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getMaxValue", function() { return getMaxValue; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getHeader", function() { return getHeader; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "queueFrame", function() { return queueFrame; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getFrame", function() { return getFrame; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getRawFrame", function() { return getRawFrame; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FrameHeaderV2", function() { return FrameHeaderV2; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__wbindgen_string_new", function() { return __wbindgen_string_new; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__wbindgen_object_drop_ref", function() { return __wbindgen_object_drop_ref; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__wbg_new_59cb74e423758ede", function() { return __wbg_new_59cb74e423758ede; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__wbg_stack_558ba5917b466edd", function() { return __wbg_stack_558ba5917b466edd; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__wbg_error_4bb6c2a97407129a", function() { return __wbg_error_4bb6c2a97407129a; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__wbindgen_throw", function() { return __wbindgen_throw; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__widl_f_debug_1_", function() { return __widl_f_debug_1_; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__widl_f_error_1_", function() { return __widl_f_error_1_; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__widl_f_info_1_", function() { return __widl_f_info_1_; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__widl_f_log_1_", function() { return __widl_f_log_1_; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__widl_f_warn_1_", function() { return __widl_f_warn_1_; });
/* harmony import */ var _cptv_player_bg_wasm__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("499d");
/* eslint-disable */

/**
* @param {number} size
*/

function initBufferWithSize(size) {
  _cptv_player_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* initBufferWithSize */ "w"](size);
}
let cachegetUint8Memory = null;

function getUint8Memory() {
  if (cachegetUint8Memory === null || cachegetUint8Memory.buffer !== _cptv_player_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* memory */ "z"].buffer) {
    cachegetUint8Memory = new Uint8Array(_cptv_player_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* memory */ "z"].buffer);
  }

  return cachegetUint8Memory;
}

let WASM_VECTOR_LEN = 0;

function passArray8ToWasm(arg) {
  const ptr = _cptv_player_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbindgen_malloc */ "k"](arg.length * 1);

  getUint8Memory().set(arg, ptr / 1);
  WASM_VECTOR_LEN = arg.length;
  return ptr;
}
/**
* @param {Uint8Array} chunk
* @param {number} offset
*/


function insertChunkAtOffset(chunk, offset) {
  _cptv_player_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* insertChunkAtOffset */ "y"](passArray8ToWasm(chunk), WASM_VECTOR_LEN, offset);
}
/**
* @param {Uint8Array} input
*/

function initWithCptvData(input) {
  _cptv_player_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* initWithCptvData */ "x"](passArray8ToWasm(input), WASM_VECTOR_LEN);
}
/**
* @returns {number}
*/

function getNumFrames() {
  const ret = _cptv_player_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* getNumFrames */ "t"]();
  return ret >>> 0;
}
/**
* @returns {number}
*/

function getWidth() {
  const ret = _cptv_player_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* getWidth */ "v"]();
  return ret >>> 0;
}
/**
* @returns {number}
*/

function getHeight() {
  const ret = _cptv_player_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* getHeight */ "q"]();
  return ret >>> 0;
}
/**
* @returns {number}
*/

function getFrameRate() {
  const ret = _cptv_player_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* getFrameRate */ "n"]();
  return ret;
}
/**
* @returns {number}
*/

function getFramesPerIframe() {
  const ret = _cptv_player_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* getFramesPerIframe */ "o"]();
  return ret;
}
/**
* @returns {number}
*/

function getMinValue() {
  const ret = _cptv_player_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* getMinValue */ "s"]();
  return ret;
}
/**
* @returns {number}
*/

function getMaxValue() {
  const ret = _cptv_player_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* getMaxValue */ "r"]();
  return ret;
}
const heap = new Array(32);
heap.fill(undefined);
heap.push(undefined, null, true, false);

function getObject(idx) {
  return heap[idx];
}

let heap_next = heap.length;

function dropObject(idx) {
  if (idx < 36) return;
  heap[idx] = heap_next;
  heap_next = idx;
}

function takeObject(idx) {
  const ret = getObject(idx);
  dropObject(idx);
  return ret;
}
/**
* @returns {any}
*/


function getHeader() {
  const ret = _cptv_player_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* getHeader */ "p"]();
  return takeObject(ret);
}

function addHeapObject(obj) {
  if (heap_next === heap.length) heap.push(heap.length + 1);
  const idx = heap_next;
  heap_next = heap[idx];
  heap[idx] = obj;
  return idx;
}
/**
* @param {number} number
* @param {any} callback
* @returns {boolean}
*/


function queueFrame(number, callback) {
  const ret = _cptv_player_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* queueFrame */ "A"](number, addHeapObject(callback));
  return ret !== 0;
}
/**
* @param {number} number
* @param {Uint8Array} image_data
* @returns {boolean}
*/

function getFrame(number, image_data) {
  const ptr0 = passArray8ToWasm(image_data);
  const len0 = WASM_VECTOR_LEN;

  try {
    const ret = _cptv_player_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* getFrame */ "m"](number, ptr0, len0);
    return ret !== 0;
  } finally {
    image_data.set(getUint8Memory().subarray(ptr0 / 1, ptr0 / 1 + len0));

    _cptv_player_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbindgen_free */ "j"](ptr0, len0 * 1);
  }
}
/**
* @param {Uint8Array} image_data
* @returns {FrameHeaderV2}
*/

function getRawFrame(image_data) {
  const ptr0 = passArray8ToWasm(image_data);
  const len0 = WASM_VECTOR_LEN;

  try {
    const ret = _cptv_player_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* getRawFrame */ "u"](ptr0, len0);
    return FrameHeaderV2.__wrap(ret);
  } finally {
    image_data.set(getUint8Memory().subarray(ptr0 / 1, ptr0 / 1 + len0));

    _cptv_player_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbindgen_free */ "j"](ptr0, len0 * 1);
  }
}
let cachedTextDecoder = new TextDecoder('utf-8', {
  ignoreBOM: true,
  fatal: true
});
cachedTextDecoder.decode();

function getStringFromWasm(ptr, len) {
  return cachedTextDecoder.decode(getUint8Memory().subarray(ptr, ptr + len));
}

let cachedTextEncoder = new TextEncoder('utf-8');
const encodeString = typeof cachedTextEncoder.encodeInto === 'function' ? function (arg, view) {
  return cachedTextEncoder.encodeInto(arg, view);
} : function (arg, view) {
  const buf = cachedTextEncoder.encode(arg);
  view.set(buf);
  return {
    read: arg.length,
    written: buf.length
  };
};

function passStringToWasm(arg) {
  let len = arg.length;

  let ptr = _cptv_player_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbindgen_malloc */ "k"](len);

  const mem = getUint8Memory();
  let offset = 0;

  for (; offset < len; offset++) {
    const code = arg.charCodeAt(offset);
    if (code > 0x7F) break;
    mem[ptr + offset] = code;
  }

  if (offset !== len) {
    if (offset !== 0) {
      arg = arg.slice(offset);
    }

    ptr = _cptv_player_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbindgen_realloc */ "l"](ptr, len, len = offset + arg.length * 3);
    const view = getUint8Memory().subarray(ptr + offset, ptr + len);
    const ret = encodeString(arg, view);
    offset += ret.written;
  }

  WASM_VECTOR_LEN = offset;
  return ptr;
}

let cachegetInt32Memory = null;

function getInt32Memory() {
  if (cachegetInt32Memory === null || cachegetInt32Memory.buffer !== _cptv_player_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* memory */ "z"].buffer) {
    cachegetInt32Memory = new Int32Array(_cptv_player_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* memory */ "z"].buffer);
  }

  return cachegetInt32Memory;
}
/**
*/


class FrameHeaderV2 {
  static __wrap(ptr) {
    const obj = Object.create(FrameHeaderV2.prototype);
    obj.ptr = ptr;
    return obj;
  }

  free() {
    const ptr = this.ptr;
    this.ptr = 0;

    _cptv_player_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_frameheaderv2_free */ "a"](ptr);
  }
  /**
  * @returns {number}
  */


  get time_on() {
    const ret = _cptv_player_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_get_frameheaderv2_time_on */ "e"](this.ptr);

    return ret >>> 0;
  }
  /**
  * @param {number} arg0
  */


  set time_on(arg0) {
    _cptv_player_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_set_frameheaderv2_time_on */ "i"](this.ptr, arg0);
  }
  /**
  * @returns {number}
  */


  get last_ffc_time() {
    const ret = _cptv_player_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_get_frameheaderv2_last_ffc_time */ "d"](this.ptr);

    return ret >>> 0;
  }
  /**
  * @param {number} arg0
  */


  set last_ffc_time(arg0) {
    _cptv_player_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_set_frameheaderv2_last_ffc_time */ "h"](this.ptr, arg0);
  }
  /**
  * @returns {number}
  */


  get frame_number() {
    const ret = _cptv_player_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_get_frameheaderv2_frame_number */ "b"](this.ptr);

    return ret >>> 0;
  }
  /**
  * @param {number} arg0
  */


  set frame_number(arg0) {
    _cptv_player_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_set_frameheaderv2_frame_number */ "f"](this.ptr, arg0);
  }
  /**
  * @returns {boolean}
  */


  get has_next_frame() {
    const ret = _cptv_player_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_get_frameheaderv2_has_next_frame */ "c"](this.ptr);

    return ret !== 0;
  }
  /**
  * @param {boolean} arg0
  */


  set has_next_frame(arg0) {
    _cptv_player_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_set_frameheaderv2_has_next_frame */ "g"](this.ptr, arg0);
  }

}
const __wbindgen_string_new = function __wbindgen_string_new(arg0, arg1) {
  const ret = getStringFromWasm(arg0, arg1);
  return addHeapObject(ret);
};
const __wbindgen_object_drop_ref = function __wbindgen_object_drop_ref(arg0) {
  takeObject(arg0);
};
const __wbg_new_59cb74e423758ede = function __wbg_new_59cb74e423758ede() {
  const ret = new Error();
  return addHeapObject(ret);
};
const __wbg_stack_558ba5917b466edd = function __wbg_stack_558ba5917b466edd(arg0, arg1) {
  const ret = getObject(arg1).stack;
  const ret0 = passStringToWasm(ret);
  const ret1 = WASM_VECTOR_LEN;
  getInt32Memory()[arg0 / 4 + 0] = ret0;
  getInt32Memory()[arg0 / 4 + 1] = ret1;
};
const __wbg_error_4bb6c2a97407129a = function __wbg_error_4bb6c2a97407129a(arg0, arg1) {
  const v0 = getStringFromWasm(arg0, arg1).slice();

  _cptv_player_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbindgen_free */ "j"](arg0, arg1 * 1);

  console.error(v0);
};
const __wbindgen_throw = function __wbindgen_throw(arg0, arg1) {
  throw new Error(getStringFromWasm(arg0, arg1));
};
const __widl_f_debug_1_ = function __widl_f_debug_1_(arg0) {
  console.debug(getObject(arg0));
};
const __widl_f_error_1_ = function __widl_f_error_1_(arg0) {
  console.error(getObject(arg0));
};
const __widl_f_info_1_ = function __widl_f_info_1_(arg0) {
  console.info(getObject(arg0));
};
const __widl_f_log_1_ = function __widl_f_log_1_(arg0) {
  console.log(getObject(arg0));
};
const __widl_f_warn_1_ = function __widl_f_warn_1_(arg0) {
  console.warn(getObject(arg0));
};

/***/ }),

/***/ "499d":
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Instantiate WebAssembly module
var wasmExports = __webpack_require__.w[module.i];

// export exports from WebAssembly module
module.exports = wasmExports;
// exec imports from WebAssembly module (for esm order)
/* harmony import */ var m0 = __webpack_require__("327f");


// exec wasm module
wasmExports["B"]()

/***/ })

}]);
//# sourceMappingURL=chunk-fae4a56a.e7727c8f.js.map