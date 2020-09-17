/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/static/dist/";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "d26a");
/******/ })
/************************************************************************/
/******/ ({

/***/ "d26a":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// CONCATENATED MODULE: ./smooth/smooth.js
let wasm_bindgen;

(function () {
  const __exports = {};
  let wasm;
  const heap = new Array(32).fill(undefined);
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

  function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];
    heap[idx] = obj;
    return idx;
  }

  let cachedTextDecoder = new TextDecoder('utf-8', {
    ignoreBOM: true,
    fatal: true
  });
  cachedTextDecoder.decode();
  let cachegetUint8Memory0 = null;

  function getUint8Memory0() {
    if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
      cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }

    return cachegetUint8Memory0;
  }

  function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
  }

  function isLikeNone(x) {
    return x === undefined || x === null;
  }

  let cachegetFloat64Memory0 = null;

  function getFloat64Memory0() {
    if (cachegetFloat64Memory0 === null || cachegetFloat64Memory0.buffer !== wasm.memory.buffer) {
      cachegetFloat64Memory0 = new Float64Array(wasm.memory.buffer);
    }

    return cachegetFloat64Memory0;
  }

  let cachegetInt32Memory0 = null;

  function getInt32Memory0() {
    if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== wasm.memory.buffer) {
      cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }

    return cachegetInt32Memory0;
  }

  let stack_pointer = 32;

  function addBorrowedObject(obj) {
    if (stack_pointer == 1) throw new Error('out of js stack');
    heap[--stack_pointer] = obj;
    return stack_pointer;
  }
  /**
  * @param {Uint16Array} input_frame
  * @param {any} calibrated_temp_c
  * @returns {AnalysisResult}
  */


  __exports.analyse = function (input_frame, calibrated_temp_c) {
    try {
      var ret = wasm.analyse(addBorrowedObject(input_frame), addBorrowedObject(calibrated_temp_c));
      return AnalysisResult.__wrap(ret);
    } finally {
      heap[stack_pointer++] = undefined;
      heap[stack_pointer++] = undefined;
    }
  };
  /**
  * @returns {Float32Array}
  */


  __exports.getMedianSmoothed = function () {
    var ret = wasm.getMedianSmoothed();
    return takeObject(ret);
  };
  /**
  * @returns {Uint8Array}
  */


  __exports.getThresholded = function () {
    var ret = wasm.getThresholded();
    return takeObject(ret);
  };
  /**
  * @returns {Uint8Array}
  */


  __exports.getBodyShape = function () {
    var ret = wasm.getBodyShape();
    return takeObject(ret);
  };
  /**
  * @returns {HeatStats}
  */


  __exports.getHeatStats = function () {
    var ret = wasm.getHeatStats();
    return HeatStats.__wrap(ret);
  };
  /**
  * @returns {Array<any>}
  */


  __exports.getHistogram = function () {
    var ret = wasm.getHistogram();
    return takeObject(ret);
  };
  /**
  * @returns {Float32Array}
  */


  __exports.getRadialSmoothed = function () {
    var ret = wasm.getRadialSmoothed();
    return takeObject(ret);
  };
  /**
  * @returns {Float32Array}
  */


  __exports.getEdges = function () {
    var ret = wasm.getEdges();
    return takeObject(ret);
  };
  /**
  * @param {any} width
  * @param {any} height
  */


  __exports.initialize = function (width, height) {
    wasm.initialize(addHeapObject(width), addHeapObject(height));
  };

  function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
      throw new Error(`expected instance of ${klass.name}`);
    }

    return instance.ptr;
  }

  let WASM_VECTOR_LEN = 0;
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

  function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
      const buf = cachedTextEncoder.encode(arg);

      const _ptr = malloc(buf.length);

      getUint8Memory0().subarray(_ptr, _ptr + buf.length).set(buf);
      WASM_VECTOR_LEN = buf.length;
      return _ptr;
    }

    let len = arg.length;
    let ptr = malloc(len);
    const mem = getUint8Memory0();
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

      ptr = realloc(ptr, len, len = offset + arg.length * 3);
      const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
      const ret = encodeString(arg, view);
      offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
  }
  /**
  */


  __exports.ScreeningState = Object.freeze({
    WarmingUp: 0,
    "0": "WarmingUp",
    Ready: 1,
    "1": "Ready",
    HeadLock: 2,
    "2": "HeadLock",
    TooFar: 3,
    "3": "TooFar",
    HasBody: 4,
    "4": "HasBody",
    FaceLock: 5,
    "5": "FaceLock",
    FrontalLock: 6,
    "6": "FrontalLock",
    StableLock: 7,
    "7": "StableLock",
    Leaving: 8,
    "8": "Leaving",
    MissingThermalRef: 9,
    "9": "MissingThermalRef"
  });
  /**
  */

  __exports.HeadLockConfidence = Object.freeze({
    Bad: 0,
    "0": "Bad",
    Partial: 1,
    "1": "Partial",
    Stable: 2,
    "2": "Stable"
  });
  /**
  */

  class AnalysisResult {
    static __wrap(ptr) {
      const obj = Object.create(AnalysisResult.prototype);
      obj.ptr = ptr;
      return obj;
    }

    free() {
      const ptr = this.ptr;
      this.ptr = 0;

      wasm.__wbg_analysisresult_free(ptr);
    }
    /**
    * @returns {number}
    */


    get motion_sum() {
      var ret = wasm.__wbg_get_analysisresult_motion_sum(this.ptr);

      return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */


    set motion_sum(arg0) {
      wasm.__wbg_set_analysisresult_motion_sum(this.ptr, arg0);
    }
    /**
    * @returns {number}
    */


    get motion_threshold_sum() {
      var ret = wasm.__wbg_get_analysisresult_motion_threshold_sum(this.ptr);

      return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */


    set motion_threshold_sum(arg0) {
      wasm.__wbg_set_analysisresult_motion_threshold_sum(this.ptr, arg0);
    }
    /**
    * @returns {number}
    */


    get threshold_sum() {
      var ret = wasm.__wbg_get_analysisresult_threshold_sum(this.ptr);

      return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */


    set threshold_sum(arg0) {
      wasm.__wbg_set_analysisresult_threshold_sum(this.ptr, arg0);
    }
    /**
    * @returns {number}
    */


    get frame_bottom_sum() {
      var ret = wasm.__wbg_get_analysisresult_frame_bottom_sum(this.ptr);

      return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */


    set frame_bottom_sum(arg0) {
      wasm.__wbg_set_analysisresult_frame_bottom_sum(this.ptr, arg0);
    }
    /**
    * @returns {boolean}
    */


    get has_body() {
      var ret = wasm.__wbg_get_analysisresult_has_body(this.ptr);

      return ret !== 0;
    }
    /**
    * @param {boolean} arg0
    */


    set has_body(arg0) {
      wasm.__wbg_set_analysisresult_has_body(this.ptr, arg0);
    }
    /**
    * @returns {HeatStats}
    */


    get heat_stats() {
      var ret = wasm.__wbg_get_analysisresult_heat_stats(this.ptr);

      return HeatStats.__wrap(ret);
    }
    /**
    * @param {HeatStats} arg0
    */


    set heat_stats(arg0) {
      _assertClass(arg0, HeatStats);

      var ptr0 = arg0.ptr;
      arg0.ptr = 0;

      wasm.__wbg_set_analysisresult_heat_stats(this.ptr, ptr0);
    }
    /**
    * @returns {FaceInfo}
    */


    get face() {
      var ret = wasm.__wbg_get_analysisresult_face(this.ptr);

      return FaceInfo.__wrap(ret);
    }
    /**
    * @param {FaceInfo} arg0
    */


    set face(arg0) {
      _assertClass(arg0, FaceInfo);

      var ptr0 = arg0.ptr;
      arg0.ptr = 0;

      wasm.__wbg_set_analysisresult_face(this.ptr, ptr0);
    }
    /**
    * @returns {number}
    */


    get next_state() {
      var ret = wasm.__wbg_get_analysisresult_next_state(this.ptr);

      return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */


    set next_state(arg0) {
      wasm.__wbg_set_analysisresult_next_state(this.ptr, arg0);
    }
    /**
    * @returns {ThermalReference}
    */


    get thermal_ref() {
      var ret = wasm.__wbg_get_analysisresult_thermal_ref(this.ptr);

      return ThermalReference.__wrap(ret);
    }
    /**
    * @param {ThermalReference} arg0
    */


    set thermal_ref(arg0) {
      _assertClass(arg0, ThermalReference);

      var ptr0 = arg0.ptr;
      arg0.ptr = 0;

      wasm.__wbg_set_analysisresult_thermal_ref(this.ptr, ptr0);
    }

  }

  __exports.AnalysisResult = AnalysisResult;
  /**
  */

  class Circle {
    static __wrap(ptr) {
      const obj = Object.create(Circle.prototype);
      obj.ptr = ptr;
      return obj;
    }

    free() {
      const ptr = this.ptr;
      this.ptr = 0;

      wasm.__wbg_circle_free(ptr);
    }
    /**
    * @returns {Point}
    */


    get center() {
      var ret = wasm.__wbg_get_circle_center(this.ptr);

      return Point.__wrap(ret);
    }
    /**
    * @param {Point} arg0
    */


    set center(arg0) {
      _assertClass(arg0, Point);

      var ptr0 = arg0.ptr;
      arg0.ptr = 0;

      wasm.__wbg_set_circle_center(this.ptr, ptr0);
    }
    /**
    * @returns {number}
    */


    get radius() {
      var ret = wasm.__wbg_get_circle_radius(this.ptr);

      return ret;
    }
    /**
    * @param {number} arg0
    */


    set radius(arg0) {
      wasm.__wbg_set_circle_radius(this.ptr, arg0);
    }

  }

  __exports.Circle = Circle;
  /**
  */

  class FaceInfo {
    static __wrap(ptr) {
      const obj = Object.create(FaceInfo.prototype);
      obj.ptr = ptr;
      return obj;
    }

    free() {
      const ptr = this.ptr;
      this.ptr = 0;

      wasm.__wbg_faceinfo_free(ptr);
    }
    /**
    * @returns {boolean}
    */


    get is_valid() {
      var ret = wasm.__wbg_get_faceinfo_is_valid(this.ptr);

      return ret !== 0;
    }
    /**
    * @param {boolean} arg0
    */


    set is_valid(arg0) {
      wasm.__wbg_set_faceinfo_is_valid(this.ptr, arg0);
    }
    /**
    * @returns {number}
    */


    get halfway_ratio() {
      var ret = wasm.__wbg_get_faceinfo_halfway_ratio(this.ptr);

      return ret;
    }
    /**
    * @param {number} arg0
    */


    set halfway_ratio(arg0) {
      wasm.__wbg_set_faceinfo_halfway_ratio(this.ptr, arg0);
    }
    /**
    * @returns {number}
    */


    get head_lock() {
      var ret = wasm.__wbg_get_faceinfo_head_lock(this.ptr);

      return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */


    set head_lock(arg0) {
      wasm.__wbg_set_faceinfo_head_lock(this.ptr, arg0);
    }
    /**
    * @returns {Quad}
    */


    get head() {
      var ret = wasm.__wbg_get_faceinfo_head(this.ptr);

      return Quad.__wrap(ret);
    }
    /**
    * @param {Quad} arg0
    */


    set head(arg0) {
      _assertClass(arg0, Quad);

      var ptr0 = arg0.ptr;
      arg0.ptr = 0;

      wasm.__wbg_set_faceinfo_head(this.ptr, ptr0);
    }
    /**
    * @returns {Point}
    */


    get sample_point() {
      var ret = wasm.__wbg_get_faceinfo_sample_point(this.ptr);

      return Point.__wrap(ret);
    }
    /**
    * @param {Point} arg0
    */


    set sample_point(arg0) {
      _assertClass(arg0, Point);

      var ptr0 = arg0.ptr;
      arg0.ptr = 0;

      wasm.__wbg_set_faceinfo_sample_point(this.ptr, ptr0);
    }
    /**
    * @returns {number}
    */


    get sample_value() {
      var ret = wasm.__wbg_get_faceinfo_sample_value(this.ptr);

      return ret;
    }
    /**
    * @param {number} arg0
    */


    set sample_value(arg0) {
      wasm.__wbg_set_faceinfo_sample_value(this.ptr, arg0);
    }
    /**
    * @returns {number}
    */


    get sample_temp() {
      var ret = wasm.__wbg_get_faceinfo_sample_temp(this.ptr);

      return ret;
    }
    /**
    * @param {number} arg0
    */


    set sample_temp(arg0) {
      wasm.__wbg_set_faceinfo_sample_temp(this.ptr, arg0);
    }

  }

  __exports.FaceInfo = FaceInfo;
  /**
  */

  class HeatStats {
    static __wrap(ptr) {
      const obj = Object.create(HeatStats.prototype);
      obj.ptr = ptr;
      return obj;
    }

    free() {
      const ptr = this.ptr;
      this.ptr = 0;

      wasm.__wbg_heatstats_free(ptr);
    }
    /**
    * @returns {number}
    */


    get min() {
      var ret = wasm.__wbg_get_heatstats_min(this.ptr);

      return ret;
    }
    /**
    * @param {number} arg0
    */


    set min(arg0) {
      wasm.__wbg_set_heatstats_min(this.ptr, arg0);
    }
    /**
    * @returns {number}
    */


    get max() {
      var ret = wasm.__wbg_get_heatstats_max(this.ptr);

      return ret;
    }
    /**
    * @param {number} arg0
    */


    set max(arg0) {
      wasm.__wbg_set_heatstats_max(this.ptr, arg0);
    }
    /**
    * @returns {number}
    */


    get threshold() {
      var ret = wasm.__wbg_get_faceinfo_halfway_ratio(this.ptr);

      return ret;
    }
    /**
    * @param {number} arg0
    */


    set threshold(arg0) {
      wasm.__wbg_set_faceinfo_halfway_ratio(this.ptr, arg0);
    }

  }

  __exports.HeatStats = HeatStats;
  /**
  */

  class Point {
    static __wrap(ptr) {
      const obj = Object.create(Point.prototype);
      obj.ptr = ptr;
      return obj;
    }

    free() {
      const ptr = this.ptr;
      this.ptr = 0;

      wasm.__wbg_point_free(ptr);
    }
    /**
    * @returns {number}
    */


    get x() {
      var ret = wasm.__wbg_get_point_x(this.ptr);

      return ret;
    }
    /**
    * @param {number} arg0
    */


    set x(arg0) {
      wasm.__wbg_set_point_x(this.ptr, arg0);
    }
    /**
    * @returns {number}
    */


    get y() {
      var ret = wasm.__wbg_get_point_y(this.ptr);

      return ret;
    }
    /**
    * @param {number} arg0
    */


    set y(arg0) {
      wasm.__wbg_set_point_y(this.ptr, arg0);
    }

  }

  __exports.Point = Point;
  /**
  */

  class Quad {
    static __wrap(ptr) {
      const obj = Object.create(Quad.prototype);
      obj.ptr = ptr;
      return obj;
    }

    free() {
      const ptr = this.ptr;
      this.ptr = 0;

      wasm.__wbg_quad_free(ptr);
    }
    /**
    * @returns {Point}
    */


    get top_left() {
      var ret = wasm.__wbg_get_circle_center(this.ptr);

      return Point.__wrap(ret);
    }
    /**
    * @param {Point} arg0
    */


    set top_left(arg0) {
      _assertClass(arg0, Point);

      var ptr0 = arg0.ptr;
      arg0.ptr = 0;

      wasm.__wbg_set_circle_center(this.ptr, ptr0);
    }
    /**
    * @returns {Point}
    */


    get top_right() {
      var ret = wasm.__wbg_get_quad_top_right(this.ptr);

      return Point.__wrap(ret);
    }
    /**
    * @param {Point} arg0
    */


    set top_right(arg0) {
      _assertClass(arg0, Point);

      var ptr0 = arg0.ptr;
      arg0.ptr = 0;

      wasm.__wbg_set_quad_top_right(this.ptr, ptr0);
    }
    /**
    * @returns {Point}
    */


    get bottom_left() {
      var ret = wasm.__wbg_get_quad_bottom_left(this.ptr);

      return Point.__wrap(ret);
    }
    /**
    * @param {Point} arg0
    */


    set bottom_left(arg0) {
      _assertClass(arg0, Point);

      var ptr0 = arg0.ptr;
      arg0.ptr = 0;

      wasm.__wbg_set_quad_bottom_left(this.ptr, ptr0);
    }
    /**
    * @returns {Point}
    */


    get bottom_right() {
      var ret = wasm.__wbg_get_quad_bottom_right(this.ptr);

      return Point.__wrap(ret);
    }
    /**
    * @param {Point} arg0
    */


    set bottom_right(arg0) {
      _assertClass(arg0, Point);

      var ptr0 = arg0.ptr;
      arg0.ptr = 0;

      wasm.__wbg_set_quad_bottom_right(this.ptr, ptr0);
    }

  }

  __exports.Quad = Quad;
  /**
  */

  class ThermalReference {
    static __wrap(ptr) {
      const obj = Object.create(ThermalReference.prototype);
      obj.ptr = ptr;
      return obj;
    }

    free() {
      const ptr = this.ptr;
      this.ptr = 0;

      wasm.__wbg_thermalreference_free(ptr);
    }
    /**
    * @returns {Circle}
    */


    get geom() {
      var ret = wasm.__wbg_get_thermalreference_geom(this.ptr);

      return Circle.__wrap(ret);
    }
    /**
    * @param {Circle} arg0
    */


    set geom(arg0) {
      _assertClass(arg0, Circle);

      var ptr0 = arg0.ptr;
      arg0.ptr = 0;

      wasm.__wbg_set_thermalreference_geom(this.ptr, ptr0);
    }
    /**
    * @returns {number}
    */


    get val() {
      var ret = wasm.__wbg_get_thermalreference_val(this.ptr);

      return ret;
    }
    /**
    * @param {number} arg0
    */


    set val(arg0) {
      wasm.__wbg_set_thermalreference_val(this.ptr, arg0);
    }
    /**
    * @returns {number}
    */


    get temp() {
      var ret = wasm.__wbg_get_thermalreference_temp(this.ptr);

      return ret;
    }
    /**
    * @param {number} arg0
    */


    set temp(arg0) {
      wasm.__wbg_set_thermalreference_temp(this.ptr, arg0);
    }

  }

  __exports.ThermalReference = ThermalReference;

  async function load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
      if (typeof WebAssembly.instantiateStreaming === 'function') {
        try {
          return await WebAssembly.instantiateStreaming(module, imports);
        } catch (e) {
          if (module.headers.get('Content-Type') != 'application/wasm') {
            console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);
          } else {
            throw e;
          }
        }
      }

      const bytes = await module.arrayBuffer();
      return await WebAssembly.instantiate(bytes, imports);
    } else {
      const instance = await WebAssembly.instantiate(module, imports);

      if (instance instanceof WebAssembly.Instance) {
        return {
          instance,
          module
        };
      } else {
        return instance;
      }
    }
  }

  async function init(input) {
    if (typeof input === 'undefined') {
      let src;

      if (typeof document === 'undefined') {
        src = location.href;
      } else {
        src = document.currentScript.src;
      }

      input = src.replace(/\.js$/, '_bg.wasm');
    }

    const imports = {};
    imports.wbg = {};

    imports.wbg.__wbindgen_object_drop_ref = function (arg0) {
      takeObject(arg0);
    };

    imports.wbg.__wbindgen_number_new = function (arg0) {
      var ret = arg0;
      return addHeapObject(ret);
    };

    imports.wbg.__wbindgen_string_new = function (arg0, arg1) {
      var ret = getStringFromWasm0(arg0, arg1);
      return addHeapObject(ret);
    };

    imports.wbg.__wbg_debug_ef2b78738889619f = function (arg0) {
      console.debug(getObject(arg0));
    };

    imports.wbg.__wbg_error_7dcc755846c00ef7 = function (arg0) {
      console.error(getObject(arg0));
    };

    imports.wbg.__wbg_info_43f70b84e943346e = function (arg0) {
      console.info(getObject(arg0));
    };

    imports.wbg.__wbg_log_61ea781bd002cc41 = function (arg0) {
      console.log(getObject(arg0));
    };

    imports.wbg.__wbg_warn_502e53bc79de489a = function (arg0) {
      console.warn(getObject(arg0));
    };

    imports.wbg.__wbg_new_59cb74e423758ede = function () {
      var ret = new Error();
      return addHeapObject(ret);
    };

    imports.wbg.__wbg_stack_558ba5917b466edd = function (arg0, arg1) {
      var ret = getObject(arg1).stack;
      var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      var len0 = WASM_VECTOR_LEN;
      getInt32Memory0()[arg0 / 4 + 1] = len0;
      getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };

    imports.wbg.__wbg_error_4bb6c2a97407129a = function (arg0, arg1) {
      try {
        console.error(getStringFromWasm0(arg0, arg1));
      } finally {
        wasm.__wbindgen_free(arg0, arg1);
      }
    };

    imports.wbg.__wbg_new_17534eac4df3cd22 = function () {
      var ret = new Array();
      return addHeapObject(ret);
    };

    imports.wbg.__wbg_push_7114ccbf1c58e41f = function (arg0, arg1) {
      var ret = getObject(arg0).push(getObject(arg1));
      return ret;
    };

    imports.wbg.__wbg_buffer_88f603259d7a7b82 = function (arg0) {
      var ret = getObject(arg0).buffer;
      return addHeapObject(ret);
    };

    imports.wbg.__wbg_newwithbyteoffsetandlength_a048d126789a272b = function (arg0, arg1, arg2) {
      var ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
      return addHeapObject(ret);
    };

    imports.wbg.__wbg_length_dee2c9630b806734 = function (arg0) {
      var ret = getObject(arg0).length;
      return ret;
    };

    imports.wbg.__wbg_new_7741b4c15e9a2dbe = function (arg0) {
      var ret = new Uint16Array(getObject(arg0));
      return addHeapObject(ret);
    };

    imports.wbg.__wbg_set_5b74ad916846f628 = function (arg0, arg1, arg2) {
      getObject(arg0).set(getObject(arg1), arg2 >>> 0);
    };

    imports.wbg.__wbg_newwithbyteoffsetandlength_66305c055ad2f047 = function (arg0, arg1, arg2) {
      var ret = new Float32Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
      return addHeapObject(ret);
    };

    imports.wbg.__wbindgen_number_get = function (arg0, arg1) {
      const obj = getObject(arg1);
      var ret = typeof obj === 'number' ? obj : undefined;
      getFloat64Memory0()[arg0 / 8 + 1] = isLikeNone(ret) ? 0 : ret;
      getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
    };

    imports.wbg.__wbindgen_throw = function (arg0, arg1) {
      throw new Error(getStringFromWasm0(arg0, arg1));
    };

    imports.wbg.__wbindgen_memory = function () {
      var ret = wasm.memory;
      return addHeapObject(ret);
    };

    if (typeof input === 'string' || typeof Request === 'function' && input instanceof Request || typeof URL === 'function' && input instanceof URL) {
      input = fetch(input);
    }

    const {
      instance,
      module
    } = await load(await input, imports);
    wasm = instance.exports;
    init.__wbindgen_wasm_module = module;
    return wasm;
  }

  wasm_bindgen = Object.assign(init, __exports);
})();

/* harmony default export */ var smooth = (wasm_bindgen);
// CONCATENATED MODULE: ./src/types.ts
var ScreeningState;

(function (ScreeningState) {
  ScreeningState["INIT"] = "INIT";
  ScreeningState["WARMING_UP"] = "WARMING_UP";
  ScreeningState["READY"] = "READY";
  ScreeningState["HEAD_LOCK"] = "HEAD_LOCK";
  ScreeningState["TOO_FAR"] = "TOO_FAR";
  ScreeningState["LARGE_BODY"] = "LARGE_BODY";
  ScreeningState["MULTIPLE_HEADS"] = "MULTIPLE_HEADS";
  ScreeningState["FACE_LOCK"] = "FACE_LOCK";
  ScreeningState["FRONTAL_LOCK"] = "FRONTAL_LOCK";
  ScreeningState["STABLE_LOCK"] = "STABLE_LOCK";
  ScreeningState["LEAVING"] = "LEAVING";
  ScreeningState["MISSING_THERMAL_REF"] = "MISSING_REF";
})(ScreeningState || (ScreeningState = {})); // This describes the state machine of allowed state transitions for the screening event.


const ScreeningAcceptanceStates = {
  [ScreeningState.INIT]: [ScreeningState.WARMING_UP, ScreeningState.READY, ScreeningState.MISSING_THERMAL_REF],
  [ScreeningState.WARMING_UP]: [ScreeningState.READY, ScreeningState.MISSING_THERMAL_REF],
  [ScreeningState.MULTIPLE_HEADS]: [ScreeningState.READY, ScreeningState.HEAD_LOCK, ScreeningState.FACE_LOCK, ScreeningState.FRONTAL_LOCK, ScreeningState.MISSING_THERMAL_REF],
  [ScreeningState.LARGE_BODY]: [ScreeningState.READY, ScreeningState.HEAD_LOCK, ScreeningState.MULTIPLE_HEADS, ScreeningState.FACE_LOCK, ScreeningState.FRONTAL_LOCK, ScreeningState.TOO_FAR, ScreeningState.MISSING_THERMAL_REF],
  [ScreeningState.TOO_FAR]: [ScreeningState.READY, ScreeningState.HEAD_LOCK, ScreeningState.MULTIPLE_HEADS, ScreeningState.FACE_LOCK, ScreeningState.FRONTAL_LOCK, ScreeningState.MISSING_THERMAL_REF],
  [ScreeningState.READY]: [ScreeningState.TOO_FAR, ScreeningState.LARGE_BODY, ScreeningState.HEAD_LOCK, ScreeningState.MULTIPLE_HEADS, ScreeningState.FACE_LOCK, ScreeningState.FRONTAL_LOCK, ScreeningState.MISSING_THERMAL_REF],
  [ScreeningState.FACE_LOCK]: [ScreeningState.TOO_FAR, ScreeningState.LARGE_BODY, ScreeningState.HEAD_LOCK, ScreeningState.MULTIPLE_HEADS, ScreeningState.FRONTAL_LOCK, ScreeningState.READY, ScreeningState.MISSING_THERMAL_REF],
  [ScreeningState.FRONTAL_LOCK]: [ScreeningState.TOO_FAR, ScreeningState.LARGE_BODY, ScreeningState.STABLE_LOCK, ScreeningState.FACE_LOCK, ScreeningState.MULTIPLE_HEADS, ScreeningState.HEAD_LOCK, ScreeningState.READY, ScreeningState.MISSING_THERMAL_REF],
  [ScreeningState.HEAD_LOCK]: [ScreeningState.TOO_FAR, ScreeningState.LARGE_BODY, ScreeningState.FACE_LOCK, ScreeningState.FRONTAL_LOCK, ScreeningState.READY, ScreeningState.MULTIPLE_HEADS, ScreeningState.MISSING_THERMAL_REF],
  [ScreeningState.STABLE_LOCK]: [ScreeningState.LEAVING],
  [ScreeningState.LEAVING]: [ScreeningState.READY],
  [ScreeningState.MISSING_THERMAL_REF]: [ScreeningState.READY, ScreeningState.TOO_FAR, ScreeningState.LARGE_BODY]
};

function getScreeningState(state) {
  let screeningState = ScreeningState.INIT;

  switch (state) {
    case 0:
      screeningState = ScreeningState.WARMING_UP;
      break;

    case 1:
      screeningState = ScreeningState.READY;
      break;

    case 2:
      screeningState = ScreeningState.HEAD_LOCK;
      break;

    case 3:
      screeningState = ScreeningState.TOO_FAR;
      break;

    case 4:
      screeningState = ScreeningState.LARGE_BODY;
      break;

    case 5:
      screeningState = ScreeningState.FACE_LOCK;
      break;

    case 6:
      screeningState = ScreeningState.FRONTAL_LOCK;
      break;

    case 7:
      screeningState = ScreeningState.STABLE_LOCK;
      break;

    case 8:
      screeningState = ScreeningState.LEAVING;
      break;

    case 9:
      screeningState = ScreeningState.MISSING_THERMAL_REF;
      break;
  }

  return screeningState;
}

function extractResult(analysisResult) {
  const f = analysisResult.face;
  const h = f.head;
  const tL = h.top_left;
  const tR = h.top_right;
  const bL = h.bottom_left;
  const bR = h.bottom_right;
  const sP = f.sample_point;
  const hS = analysisResult.heat_stats;
  const ref = analysisResult.thermal_ref;
  const geom = ref.geom;
  const cP = geom.center;
  const copiedAnalysisResult = {
    face: {
      headLock: f.head_lock,
      head: {
        topLeft: {
          x: tL.x,
          y: tL.y
        },
        topRight: {
          x: tR.x,
          y: tR.y
        },
        bottomLeft: {
          x: bL.x,
          y: bL.y
        },
        bottomRight: {
          x: bR.x,
          y: bR.y
        }
      },
      samplePoint: {
        x: sP.x,
        y: sP.y
      },
      sampleTemp: f.sample_temp,
      sampleValue: f.sample_value,
      halfwayRatio: f.halfway_ratio,
      isValid: f.is_valid
    },
    frameBottomSum: analysisResult.frame_bottom_sum,
    motionSum: analysisResult.motion_sum,
    heatStats: {
      threshold: hS.threshold,
      min: hS.min,
      max: hS.max
    },
    motionThresholdSum: analysisResult.motion_threshold_sum,
    thresholdSum: analysisResult.threshold_sum,
    nextState: getScreeningState(analysisResult.next_state),
    hasBody: analysisResult.has_body,
    thermalRef: {
      geom: {
        center: {
          x: cP.x,
          y: cP.y
        },
        radius: geom.radius
      },
      val: ref.val,
      temp: ref.temp
    }
  };
  f.free();
  h.free();
  tL.free();
  tR.free();
  bL.free();
  bR.free();
  sP.free();
  hS.free();
  cP.free();
  geom.free();
  ref.free();
  analysisResult.free();
  return copiedAnalysisResult;
}
// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--13-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/ts-loader??ref--13-3!./src/smoothing-worker.ts


const {
  initialize,
  getBodyShape,
  analyse
} = smooth;
const ctx = self;

(async function run() {
  // NOTE: The wasm file needs to be in the public folder so that it can be resolved at runtime,
  //  since webpacks' web-worker loader doesn't seem to be able to resolve wasm inside workers.
  await smooth(`${"/static/dist/"}smooth_bg.wasm`);
  let inited = false;
  ctx.addEventListener("message", async event => {
    const {
      frame,
      calibrationTempC
    } = event.data;

    if (!inited) {
      initialize(120, 160);
      inited = true;
    }

    const analysisResult = analyse(frame, calibrationTempC);
    const bodyShape = getBodyShape();
    const result = extractResult(analysisResult);
    ctx.postMessage({
      bodyShape,
      analysisResult: result
    });
    return;
  });
})();

/***/ })

/******/ });
//# sourceMappingURL=35500005e4f2678a6a90.worker.js.map