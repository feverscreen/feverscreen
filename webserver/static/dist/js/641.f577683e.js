"use strict";
(globalThis["webpackChunkfrontend"] = globalThis["webpackChunkfrontend"] || []).push([[641],{

/***/ 3641:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "__wbg_new_6b6f346b4912cdae": () => (/* reexport safe */ _curve_fitting_bg_js__WEBPACK_IMPORTED_MODULE_0__.w_),
/* harmony export */   "__wbg_push_f353108e20ec67a0": () => (/* reexport safe */ _curve_fitting_bg_js__WEBPACK_IMPORTED_MODULE_0__.TJ),
/* harmony export */   "__wbindgen_number_new": () => (/* reexport safe */ _curve_fitting_bg_js__WEBPACK_IMPORTED_MODULE_0__.pT),
/* harmony export */   "__wbindgen_object_drop_ref": () => (/* reexport safe */ _curve_fitting_bg_js__WEBPACK_IMPORTED_MODULE_0__.ug),
/* harmony export */   "__wbindgen_throw": () => (/* reexport safe */ _curve_fitting_bg_js__WEBPACK_IMPORTED_MODULE_0__.Or),
/* harmony export */   "fitCurveThroughPoints": () => (/* reexport safe */ _curve_fitting_bg_js__WEBPACK_IMPORTED_MODULE_0__.Vc)
/* harmony export */ });
/* harmony import */ var _curve_fitting_bg_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(476);
/* eslint-disable */



/***/ }),

/***/ 476:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Vc": () => (/* binding */ fitCurveThroughPoints),
/* harmony export */   "pT": () => (/* binding */ __wbindgen_number_new),
/* harmony export */   "ug": () => (/* binding */ __wbindgen_object_drop_ref),
/* harmony export */   "w_": () => (/* binding */ __wbg_new_6b6f346b4912cdae),
/* harmony export */   "TJ": () => (/* binding */ __wbg_push_f353108e20ec67a0),
/* harmony export */   "Or": () => (/* binding */ __wbindgen_throw)
/* harmony export */ });
/* harmony import */ var _curve_fitting_bg_wasm__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(9534);
/* eslint-disable */

const heap = new Array(32).fill(undefined);
heap.push(undefined, null, true, false);
let heap_next = heap.length;

function addHeapObject(obj) {
  if (heap_next === heap.length) heap.push(heap.length + 1);
  const idx = heap_next;
  heap_next = heap[idx];
  heap[idx] = obj;
  return idx;
}

function getObject(idx) {
  return heap[idx];
}

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

let cachedTextDecoder = new TextDecoder('utf-8', {
  ignoreBOM: true,
  fatal: true
});
cachedTextDecoder.decode();
let cachegetUint8Memory0 = null;

function getUint8Memory0() {
  if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== _curve_fitting_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.memory.buffer) {
    cachegetUint8Memory0 = new Uint8Array(_curve_fitting_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.memory.buffer);
  }

  return cachegetUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
  return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

let WASM_VECTOR_LEN = 0;

function passArray8ToWasm0(arg, malloc) {
  const ptr = malloc(arg.length * 1);
  getUint8Memory0().set(arg, ptr / 1);
  WASM_VECTOR_LEN = arg.length;
  return ptr;
}
/**
* @param {Uint8Array} points
* @returns {Array<any>}
*/


function fitCurveThroughPoints(points) {
  try {
    var ptr0 = passArray8ToWasm0(points, _curve_fitting_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_malloc);
    var len0 = WASM_VECTOR_LEN;
    var ret = _curve_fitting_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.fitCurveThroughPoints(ptr0, len0);
    return takeObject(ret);
  } finally {
    points.set(getUint8Memory0().subarray(ptr0 / 1, ptr0 / 1 + len0));

    _curve_fitting_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_free(ptr0, len0 * 1);
  }
}
const __wbindgen_number_new = function __wbindgen_number_new(arg0) {
  var ret = arg0;
  return addHeapObject(ret);
};
const __wbindgen_object_drop_ref = function __wbindgen_object_drop_ref(arg0) {
  takeObject(arg0);
};
const __wbg_new_6b6f346b4912cdae = function __wbg_new_6b6f346b4912cdae() {
  var ret = new Array();
  return addHeapObject(ret);
};
const __wbg_push_f353108e20ec67a0 = function __wbg_push_f353108e20ec67a0(arg0, arg1) {
  var ret = getObject(arg0).push(getObject(arg1));
  return ret;
};
const __wbindgen_throw = function __wbindgen_throw(arg0, arg1) {
  throw new Error(getStringFromWasm0(arg0, arg1));
};

/***/ }),

/***/ 9534:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// Instantiate WebAssembly module
var wasmExports = __webpack_require__.w[module.id];

// export exports from WebAssembly module
module.exports = wasmExports;
// exec imports from WebAssembly module (for esm order)
/* harmony import */ var m0 = __webpack_require__(476);


// exec wasm module
wasmExports[""]()

/***/ })

}]);
//# sourceMappingURL=641.f577683e.js.map