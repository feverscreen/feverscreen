/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 359:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "i": () => (/* binding */ CameraConnection)
});

// UNUSED EXPORTS: CameraConnectionState

;// CONCATENATED MODULE: ./src/utils.ts
const BlobReader = function () {
  // For comparability with older browsers/iOS that don't yet support arrayBuffer()
  // directly off the blob object
  const arrayBuffer = "arrayBuffer" in Blob.prototype && typeof Blob.prototype["arrayBuffer"] === "function" ? blob => blob["arrayBuffer"]() : blob => new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.addEventListener("load", () => {
      resolve(fileReader.result);
    });
    fileReader.addEventListener("error", () => {
      reject();
    });
    fileReader.readAsArrayBuffer(blob);
  });
  return {
    arrayBuffer
  };
}();
class DegreesCelsius {
  constructor(val) {
    this.val = val;
  }

  toString() {
    if (this.val === undefined) {
      debugger;
    }

    return `${this.val.toFixed(1)}°`;
  }

}
const temperatureForSensorValue = (savedThermalRefValue, rawValue, currentThermalRefValue) => {
  return new DegreesCelsius(savedThermalRefValue + (rawValue - currentThermalRefValue) * 0.01);
};
function saveCurrentVersion(binaryVersion, appVersion) {
  window.localStorage.setItem("softwareVersion", JSON.stringify({
    appVersion,
    binaryVersion
  }));
}
function checkForSoftwareUpdates(binaryVersion, appVersion, shouldReloadIfChanged = true) {
  const prevVersionJSON = window.localStorage.getItem("softwareVersion");

  if (prevVersionJSON) {
    try {
      const prevVersion = JSON.parse(prevVersionJSON);

      if (binaryVersion && appVersion && (prevVersion.binaryVersion != binaryVersion || prevVersion.appVersion != appVersion)) {
        if (shouldReloadIfChanged) {
          console.log("reload because version changed", JSON.stringify(prevVersion), binaryVersion, appVersion);
          window.location.reload();
        } else {
          saveCurrentVersion(binaryVersion, appVersion); // Display info that the software has updated since last started up.

          return true;
        }
      }
    } catch (e) {
      saveCurrentVersion(binaryVersion, appVersion);
      return false;
    }
  } else {
    saveCurrentVersion(binaryVersion, appVersion);
  }

  return false;
}
// EXTERNAL MODULE: ./src/types.ts
var types = __webpack_require__(897);
;// CONCATENATED MODULE: ./src/camera.ts
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }



var CameraConnectionState;

(function (CameraConnectionState) {
  CameraConnectionState[CameraConnectionState["Connecting"] = 0] = "Connecting";
  CameraConnectionState[CameraConnectionState["Connected"] = 1] = "Connected";
  CameraConnectionState[CameraConnectionState["Disconnected"] = 2] = "Disconnected";
})(CameraConnectionState || (CameraConnectionState = {}));

const UUID = new Date().getTime();
class CameraConnection {
  constructor(host, port, onFrame, onConnectionStateChange) {
    this.host = host;
    this.onFrame = onFrame;
    this.onConnectionStateChange = onConnectionStateChange;
    this.state = {
      socket: null,
      UUID: new Date().getTime(),
      stats: {
        skippedFramesServer: 0,
        skippedFramesClient: 0
      },
      pendingFrame: null,
      prevFrameNum: -1,
      heartbeatInterval: 0,
      frames: []
    };

    if ((port === "8080" || port === "5000") && "production" === "development") {
      // If we're running in development mode, find the remote camera server
      //this.host = "192.168.178.21";
      this.host = "192.168.0.181"; //this.host = "192.168.0.82";
      //this.host = "192.168.0.41";
    }

    this.connect();
  }

  retryConnection(retryTime) {
    if (retryTime > 0) {
      setTimeout(() => this.retryConnection(retryTime - 1), 1000);
    } else {
      this.connect();
    }
  }

  register() {
    if (this.state.socket !== null) {
      if (this.state.socket.readyState === WebSocket.OPEN) {
        // We are waiting for frames now.
        this.state.socket.send(JSON.stringify({
          type: "Register",
          data: navigator.userAgent,
          uuid: UUID
        }));
        this.onConnectionStateChange(CameraConnectionState.Connected);
        this.state.heartbeatInterval = setInterval(() => {
          this.state.socket && this.state.socket.send(JSON.stringify({
            type: "Heartbeat",
            uuid: UUID
          }));
        }, 5000);
      } else {
        setTimeout(this.register.bind(this), 100);
      }
    }
  }

  connect() {
    var _this = this;

    this.state.socket = new WebSocket(`ws://${this.host}/ws`);
    this.onConnectionStateChange(CameraConnectionState.Connecting);
    this.state.socket.addEventListener("error", e => {
      console.warn("Websocket Connection error", e); //...
    }); // Connection opened

    this.state.socket.addEventListener("open", this.register.bind(this));
    this.state.socket.addEventListener("close", () => {
      // When we do reconnect, we need to treat it as a new connection
      console.warn("Websocket closed");
      this.state.socket = null;
      this.onConnectionStateChange(CameraConnectionState.Disconnected);
      clearInterval(this.state.heartbeatInterval);
      this.retryConnection(5);
    });
    this.state.socket.addEventListener("message", async function (event) {
      if (event.data instanceof Blob) {
        // TODO(jon): Only do this if we detect that we're dropping frames?
        const droppingFrames = false;

        if (droppingFrames) {
          _this.state.frames.push(await _this.parseFrame(event.data)); // Process the latest frame, after waiting half a frame delay
          // to see if there are any more frames hot on its heels.


          _this.state.pendingFrame = setTimeout(_this.useLatestFrame.bind(_this), 1);
        } else {
          _this.onFrame(await _this.parseFrame(event.data));
        } // Every time we get a frame, set a new timeout for when we decide that the camera has stalled sending us new frames.

      }
    });
  }

  async parseFrame(blob) {
    // NOTE(jon): On iOS. it seems slow to do multiple fetches from the blob, so let's do it all at once.
    const data = await BlobReader.arrayBuffer(blob);
    const frameInfoLength = new Uint16Array(data.slice(0, 2))[0];
    const frameStartOffset = 2 + frameInfoLength;

    try {
      const frameInfo = JSON.parse(String.fromCharCode(...new Uint8Array(data.slice(2, frameStartOffset))));

      if (frameInfo.Calibration === null) {
        frameInfo.Calibration = _objectSpread({}, types/* FactoryDefaultCalibration */.tL);
        frameInfo.Calibration.UuidOfUpdater = UUID;
        frameInfo.Calibration.CalibrationBinaryVersion = frameInfo.BinaryVersion;
      }

      const frameNumber = frameInfo.Telemetry.FrameCount;

      if (frameNumber % 20 === 0) {
        performance.clearMarks();
        performance.clearMeasures();
        performance.clearResourceTimings();
      }

      performance.mark(`start frame ${frameNumber}`);

      if (this.state.prevFrameNum !== -1 && this.state.prevFrameNum + 1 !== frameInfo.Telemetry.FrameCount) {
        this.state.stats.skippedFramesServer += frameInfo.Telemetry.FrameCount - this.state.prevFrameNum; // Work out an fps counter.
      }

      this.state.prevFrameNum = frameInfo.Telemetry.FrameCount;
      const frameSizeInBytes = frameInfo.Camera.ResX * frameInfo.Camera.ResY * 2; // TODO(jon): Some perf optimisations here.

      const frame = new Uint16Array(data.slice(frameStartOffset, frameStartOffset + frameSizeInBytes));
      return {
        frameInfo,
        frame
      };
    } catch (e) {
      console.error("Malformed JSON payload", e);
    }

    return null;
  }

  async useLatestFrame() {
    if (this.state.pendingFrame) {
      clearTimeout(this.state.pendingFrame);
    }

    let latestFrameTimeOnMs = 0;
    let latestFrame = null; // Turns out that we don't always get the messages in order from the pi, so make sure we take the latest one.

    const framesToDrop = [];

    while (this.state.frames.length !== 0) {
      const frame = this.state.frames.shift();
      const frameHeader = frame.frameInfo;
      const timeOn = frameHeader.Telemetry.TimeOn / 1000 / 1000;

      if (timeOn > latestFrameTimeOnMs) {
        if (latestFrame !== null) {
          framesToDrop.push(latestFrame);
        }

        latestFrameTimeOnMs = timeOn;
        latestFrame = frame;
      }
    } // Clear out and log any old frames that need to be dropped


    while (framesToDrop.length !== 0) {
      const dropFrame = framesToDrop.shift();
      const timeOn = dropFrame.frameInfo.Telemetry.TimeOn / 1000 / 1000;
      this.state.stats.skippedFramesClient++;

      if (this.state.socket) {
        this.state.socket.send(JSON.stringify({
          type: "Dropped late frame",
          data: `${latestFrameTimeOnMs - timeOn}ms behind current: frame#${dropFrame.frameInfo.Telemetry.FrameCount}`,
          uuid: UUID
        }));
      } else {
        console.warn("Lost web socket connection");
      }
    } // Take the latest frame and process it.


    if (latestFrame !== null) {
      await this.onFrame(latestFrame); // if (DEBUG_MODE) {
      //   updateFpsCounter(skippedFramesServer, skippedFramesClient);
      // } else if (fpsCount.innerText !== "") {
      //   fpsCount.innerText = "";
      // }
    }

    this.state.stats.skippedFramesClient = 0;
    this.state.stats.skippedFramesServer = 0;
  }

}

/***/ }),

/***/ 352:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__) => {
/* unused harmony export processSensorData */
/* harmony import */ var _camera__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(359);
/* harmony import */ var _cptv_player__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(347);
/* harmony import */ var _processing__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(620);
/* harmony import */ var _types__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(897);
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

 // import { WasmTracingAllocator } from "@/tracing-allocator";




const {
  initWithCptvData,
  getRawFrame
} = _cptv_player__WEBPACK_IMPORTED_MODULE_1__/* .default */ .Z;
let usingLiveCamera = false;
const frameProcessor = await (0,_processing__WEBPACK_IMPORTED_MODULE_2__/* .FrameProcessor */ .T)();
const processSensorData = async frame => {
  var _frame$frameInfo$Cali, _frame$frameInfo$Cali2;

  let msSinceLastFFC = frame.frameInfo.Telemetry.TimeOn - frame.frameInfo.Telemetry.LastFFCTime;

  if (usingLiveCamera) {
    msSinceLastFFC = msSinceLastFFC / 1000 / 1000;
  }

  frameProcessor.analyse(frame.frame, (_frame$frameInfo$Cali = (_frame$frameInfo$Cali2 = frame.frameInfo.Calibration) === null || _frame$frameInfo$Cali2 === void 0 ? void 0 : _frame$frameInfo$Cali2.ThermalRefTemp) !== null && _frame$frameInfo$Cali !== void 0 ? _frame$frameInfo$Cali : 37, msSinceLastFFC);
  return frameProcessor.getFrame();
};
const workerContext = self;
let frameBuffer = new Uint8Array(0);

async function processFrame(frame) {
  // console.log("got frame", frame);
  // Do the frame processing, then postMessage the relevant payload to the view app.
  // Do this in yet another worker(s)?
  const imageInfo = await processSensorData(frame);
  workerContext.postMessage({
    type: "gotFrame",
    payload: {
      frameInfo: frame.frameInfo,
      frame: frame.frame,
      bodyShape: imageInfo.bodyShape,
      analysisResult: imageInfo.analysisResult
    }
  });
}

function onConnectionStateChange(connectionState) {
  workerContext.postMessage({
    type: "connectionStateChange",
    payload: connectionState
  });
}

function getNextFrame(startFrame = -1, endFrame = -1) {
  let frameInfo = getRawFrame(frameBuffer);

  while (frameInfo.frame_number < startFrame || endFrame != -1 && frameInfo.frame_number > endFrame) {
    frameInfo = getRawFrame(frameBuffer);
  }

  const appVersion = "";
  const binaryVersion = "";
  const currentFrame = {
    frame: new Uint16Array(frameBuffer.buffer),
    frameInfo: _objectSpread(_objectSpread({}, _types__WEBPACK_IMPORTED_MODULE_3__/* .InitialFrameInfo */ .Pk), {}, {
      AppVersion: appVersion,
      BinaryVersion: binaryVersion,
      Telemetry: _objectSpread(_objectSpread({}, _types__WEBPACK_IMPORTED_MODULE_3__/* .InitialFrameInfo.Telemetry */ .Pk.Telemetry), {}, {
        LastFFCTime: frameInfo.last_ffc_time,
        FrameCount: frameInfo.frame_number,
        TimeOn: frameInfo.time_on
      })
    })
  };
  frameInfo.free();
  setTimeout(getNextFrame, 1000 / 9);
  processFrame(currentFrame);
}

function playLocalCptvFile(cptvFileBytes, startFrame = 0, endFrame = -1) {
  frameBuffer = new Uint8Array(160 * 120 * 2);
  initWithCptvData(new Uint8Array(cptvFileBytes));
  getNextFrame();
}

(async function run() {
  workerContext.addEventListener("message", async event => {
    const message = event.data;
    usingLiveCamera = message.useLiveCamera || false;

    if (message.useLiveCamera) {
      new _camera__WEBPACK_IMPORTED_MODULE_0__/* .CameraConnection */ .i(message.hostname, message.port, processFrame, onConnectionStateChange); // Init live camera web-socket connection
    } else if (message.cptvFileToPlayback) {
      // Init CPTV file playback
      await (0,_cptv_player__WEBPACK_IMPORTED_MODULE_1__/* .default */ .Z)(`${"/static/dist/"}cptv_player_bg.wasm`);
      const cptvFile = await fetch(message.cptvFileToPlayback);
      const buffer = await cptvFile.arrayBuffer();
      playLocalCptvFile(buffer, message.startFrame || 0, message.endFrame || -1);
    }

    return;
  });
})();
__webpack_handle_async_dependencies__();
}, 1);

/***/ }),

/***/ 620:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "T": () => (/* binding */ FrameProcessor)
});

;// CONCATENATED MODULE: ./processing/tko_processing.js
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

function addHeapObject(obj) {
  if (heap_next === heap.length) heap.push(heap.length + 1);
  const idx = heap_next;
  heap_next = heap[idx];
  heap[idx] = obj;
  return idx;
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
* @param {any} calibrated_thermal_ref_temp_c
* @param {any} ms_since_last_ffc
* @returns {AnalysisResult}
*/


function analyse(input_frame, calibrated_thermal_ref_temp_c, ms_since_last_ffc) {
  try {
    var ret = wasm.analyse(addBorrowedObject(input_frame), addBorrowedObject(calibrated_thermal_ref_temp_c), addBorrowedObject(ms_since_last_ffc));
    return AnalysisResult.__wrap(ret);
  } finally {
    heap[stack_pointer++] = undefined;
    heap[stack_pointer++] = undefined;
    heap[stack_pointer++] = undefined;
  }
}
/**
* @returns {Float32Array}
*/

function getMedianSmoothed() {
  var ret = wasm.getMedianSmoothed();
  return takeObject(ret);
}
/**
* @returns {Float32Array}
*/

function getDebug() {
  var ret = wasm.getDebug();
  return takeObject(ret);
}
/**
* @returns {Uint8Array}
*/

function getThresholded() {
  var ret = wasm.getThresholded();
  return takeObject(ret);
}
/**
* @returns {Uint8Array}
*/

function getBodyShape() {
  var ret = wasm.getBodyShape();
  return takeObject(ret);
}
/**
* @returns {Uint8Array}
*/

function getFaceShape() {
  var ret = wasm.getFaceShape();
  return takeObject(ret);
}
/**
* @returns {Float32Array}
*/

function getRadialSmoothed() {
  var ret = wasm.getRadialSmoothed();
  return takeObject(ret);
}
/**
* @returns {Float32Array}
*/

function getEdges() {
  var ret = wasm.getEdges();
  return takeObject(ret);
}
/**
* @param {any} _width
* @param {any} _height
*/

function initialize(_width, _height) {
  wasm.initialize(addHeapObject(_width), addHeapObject(_height));
}

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


const ScreeningState = Object.freeze({
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
  Measured: 8,
  "8": "Measured",
  MissingThermalRef: 9,
  "9": "MissingThermalRef",
  Blurred: 10,
  "10": "Blurred",
  AfterFfcEvent: 11,
  "11": "AfterFfcEvent"
});
/**
*/

const HeadLockConfidence = Object.freeze({
  Bad: 0,
  "0": "Bad",
  Partial: 1,
  "1": "Partial",
  Stable: 2,
  "2": "Stable"
});
/**
*/

const InvalidReason = Object.freeze({
  Unknown: 0,
  "0": "Unknown",
  Valid: 1,
  "1": "Valid",
  TooMuchTilt: 2,
  "2": "TooMuchTilt"
});
/**
*/

class AnalysisResult {
  static __wrap(ptr) {
    const obj = Object.create(AnalysisResult.prototype);
    obj.ptr = ptr;
    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.ptr;
    this.ptr = 0;
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();

    wasm.__wbg_analysisresult_free(ptr);
  }
  /**
  * @returns {number}
  */


  get motionSum() {
    var ret = wasm.__wbg_get_analysisresult_motionSum(this.ptr);

    return ret;
  }
  /**
  * @param {number} arg0
  */


  set motionSum(arg0) {
    wasm.__wbg_set_analysisresult_motionSum(this.ptr, arg0);
  }
  /**
  * @returns {number}
  */


  get motionThresholdSum() {
    var ret = wasm.__wbg_get_analysisresult_motionThresholdSum(this.ptr);

    return ret;
  }
  /**
  * @param {number} arg0
  */


  set motionThresholdSum(arg0) {
    wasm.__wbg_set_analysisresult_motionThresholdSum(this.ptr, arg0);
  }
  /**
  * @returns {number}
  */


  get thresholdSum() {
    var ret = wasm.__wbg_get_analysisresult_thresholdSum(this.ptr);

    return ret;
  }
  /**
  * @param {number} arg0
  */


  set thresholdSum(arg0) {
    wasm.__wbg_set_analysisresult_thresholdSum(this.ptr, arg0);
  }
  /**
  * @returns {number}
  */


  get frameBottomSum() {
    var ret = wasm.__wbg_get_analysisresult_frameBottomSum(this.ptr);

    return ret;
  }
  /**
  * @param {number} arg0
  */


  set frameBottomSum(arg0) {
    wasm.__wbg_set_analysisresult_frameBottomSum(this.ptr, arg0);
  }
  /**
  * @returns {boolean}
  */


  get hasBody() {
    var ret = wasm.__wbg_get_analysisresult_hasBody(this.ptr);

    return ret !== 0;
  }
  /**
  * @param {boolean} arg0
  */


  set hasBody(arg0) {
    wasm.__wbg_set_analysisresult_hasBody(this.ptr, arg0);
  }
  /**
  * @returns {HeatStats}
  */


  get heatStats() {
    var ret = wasm.__wbg_get_analysisresult_heatStats(this.ptr);

    return HeatStats.__wrap(ret);
  }
  /**
  * @param {HeatStats} arg0
  */


  set heatStats(arg0) {
    _assertClass(arg0, HeatStats);

    var ptr0 = arg0.ptr;
    arg0.ptr = 0;

    wasm.__wbg_set_analysisresult_heatStats(this.ptr, ptr0);
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


  get nextState() {
    var ret = wasm.__wbg_get_analysisresult_nextState(this.ptr);

    return ret >>> 0;
  }
  /**
  * @param {number} arg0
  */


  set nextState(arg0) {
    wasm.__wbg_set_analysisresult_nextState(this.ptr, arg0);
  }
  /**
  * @returns {ThermalReference}
  */


  get thermalReference() {
    var ret = wasm.__wbg_get_analysisresult_thermalReference(this.ptr);

    return ThermalReference.__wrap(ret);
  }
  /**
  * @param {ThermalReference} arg0
  */


  set thermalReference(arg0) {
    _assertClass(arg0, ThermalReference);

    var ptr0 = arg0.ptr;
    arg0.ptr = 0;

    wasm.__wbg_set_analysisresult_thermalReference(this.ptr, ptr0);
  }

}
/**
*/

class Circle {
  static __wrap(ptr) {
    const obj = Object.create(Circle.prototype);
    obj.ptr = ptr;
    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.ptr;
    this.ptr = 0;
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();

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
/**
*/

class FaceInfo {
  static __wrap(ptr) {
    const obj = Object.create(FaceInfo.prototype);
    obj.ptr = ptr;
    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.ptr;
    this.ptr = 0;
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();

    wasm.__wbg_faceinfo_free(ptr);
  }
  /**
  * @returns {boolean}
  */


  get isValid() {
    var ret = wasm.__wbg_get_faceinfo_isValid(this.ptr);

    return ret !== 0;
  }
  /**
  * @param {boolean} arg0
  */


  set isValid(arg0) {
    wasm.__wbg_set_faceinfo_isValid(this.ptr, arg0);
  }
  /**
  * @returns {number}
  */


  get halfwayRatio() {
    var ret = wasm.__wbg_get_faceinfo_halfwayRatio(this.ptr);

    return ret;
  }
  /**
  * @param {number} arg0
  */


  set halfwayRatio(arg0) {
    wasm.__wbg_set_faceinfo_halfwayRatio(this.ptr, arg0);
  }
  /**
  * @returns {number}
  */


  get headLock() {
    var ret = wasm.__wbg_get_faceinfo_headLock(this.ptr);

    return ret >>> 0;
  }
  /**
  * @param {number} arg0
  */


  set headLock(arg0) {
    wasm.__wbg_set_faceinfo_headLock(this.ptr, arg0);
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


  get samplePoint() {
    var ret = wasm.__wbg_get_faceinfo_samplePoint(this.ptr);

    return Point.__wrap(ret);
  }
  /**
  * @param {Point} arg0
  */


  set samplePoint(arg0) {
    _assertClass(arg0, Point);

    var ptr0 = arg0.ptr;
    arg0.ptr = 0;

    wasm.__wbg_set_faceinfo_samplePoint(this.ptr, ptr0);
  }
  /**
  * @returns {number}
  */


  get sampleValue() {
    var ret = wasm.__wbg_get_faceinfo_sampleValue(this.ptr);

    return ret;
  }
  /**
  * @param {number} arg0
  */


  set sampleValue(arg0) {
    wasm.__wbg_set_faceinfo_sampleValue(this.ptr, arg0);
  }
  /**
  * @returns {number}
  */


  get sampleTemp() {
    var ret = wasm.__wbg_get_faceinfo_sampleTemp(this.ptr);

    return ret;
  }
  /**
  * @param {number} arg0
  */


  set sampleTemp(arg0) {
    wasm.__wbg_set_faceinfo_sampleTemp(this.ptr, arg0);
  }
  /**
  * @returns {Point}
  */


  get idealSamplePoint() {
    var ret = wasm.__wbg_get_faceinfo_idealSamplePoint(this.ptr);

    return Point.__wrap(ret);
  }
  /**
  * @param {Point} arg0
  */


  set idealSamplePoint(arg0) {
    _assertClass(arg0, Point);

    var ptr0 = arg0.ptr;
    arg0.ptr = 0;

    wasm.__wbg_set_faceinfo_idealSamplePoint(this.ptr, ptr0);
  }
  /**
  * @returns {number}
  */


  get idealSampleValue() {
    var ret = wasm.__wbg_get_faceinfo_idealSampleValue(this.ptr);

    return ret;
  }
  /**
  * @param {number} arg0
  */


  set idealSampleValue(arg0) {
    wasm.__wbg_set_faceinfo_idealSampleValue(this.ptr, arg0);
  }
  /**
  * @returns {number}
  */


  get idealSampleTemp() {
    var ret = wasm.__wbg_get_faceinfo_idealSampleTemp(this.ptr);

    return ret;
  }
  /**
  * @param {number} arg0
  */


  set idealSampleTemp(arg0) {
    wasm.__wbg_set_faceinfo_idealSampleTemp(this.ptr, arg0);
  }
  /**
  * @returns {number}
  */


  get reason() {
    var ret = wasm.__wbg_get_faceinfo_reason(this.ptr);

    return ret >>> 0;
  }
  /**
  * @param {number} arg0
  */


  set reason(arg0) {
    wasm.__wbg_set_faceinfo_reason(this.ptr, arg0);
  }

}
/**
*/

class HeatStats {
  static __wrap(ptr) {
    const obj = Object.create(HeatStats.prototype);
    obj.ptr = ptr;
    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.ptr;
    this.ptr = 0;
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();

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
    var ret = wasm.__wbg_get_heatstats_threshold(this.ptr);

    return ret;
  }
  /**
  * @param {number} arg0
  */


  set threshold(arg0) {
    wasm.__wbg_set_heatstats_threshold(this.ptr, arg0);
  }

}
/**
*/

class Point {
  static __wrap(ptr) {
    const obj = Object.create(Point.prototype);
    obj.ptr = ptr;
    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.ptr;
    this.ptr = 0;
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();

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
/**
*/

class Quad {
  static __wrap(ptr) {
    const obj = Object.create(Quad.prototype);
    obj.ptr = ptr;
    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.ptr;
    this.ptr = 0;
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();

    wasm.__wbg_quad_free(ptr);
  }
  /**
  * @returns {Point}
  */


  get topLeft() {
    var ret = wasm.__wbg_get_circle_center(this.ptr);

    return Point.__wrap(ret);
  }
  /**
  * @param {Point} arg0
  */


  set topLeft(arg0) {
    _assertClass(arg0, Point);

    var ptr0 = arg0.ptr;
    arg0.ptr = 0;

    wasm.__wbg_set_circle_center(this.ptr, ptr0);
  }
  /**
  * @returns {Point}
  */


  get topRight() {
    var ret = wasm.__wbg_get_quad_topRight(this.ptr);

    return Point.__wrap(ret);
  }
  /**
  * @param {Point} arg0
  */


  set topRight(arg0) {
    _assertClass(arg0, Point);

    var ptr0 = arg0.ptr;
    arg0.ptr = 0;

    wasm.__wbg_set_quad_topRight(this.ptr, ptr0);
  }
  /**
  * @returns {Point}
  */


  get bottomLeft() {
    var ret = wasm.__wbg_get_quad_bottomLeft(this.ptr);

    return Point.__wrap(ret);
  }
  /**
  * @param {Point} arg0
  */


  set bottomLeft(arg0) {
    _assertClass(arg0, Point);

    var ptr0 = arg0.ptr;
    arg0.ptr = 0;

    wasm.__wbg_set_quad_bottomLeft(this.ptr, ptr0);
  }
  /**
  * @returns {Point}
  */


  get bottomRight() {
    var ret = wasm.__wbg_get_quad_bottomRight(this.ptr);

    return Point.__wrap(ret);
  }
  /**
  * @param {Point} arg0
  */


  set bottomRight(arg0) {
    _assertClass(arg0, Point);

    var ptr0 = arg0.ptr;
    arg0.ptr = 0;

    wasm.__wbg_set_quad_bottomRight(this.ptr, ptr0);
  }

}
/**
*/

class ThermalReference {
  static __wrap(ptr) {
    const obj = Object.create(ThermalReference.prototype);
    obj.ptr = ptr;
    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.ptr;
    this.ptr = 0;
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();

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
    input = new URL('tko_processing_bg.wasm', "/static/dist/");
  }

  const imports = {};
  imports.wbg = {};

  imports.wbg.__wbindgen_object_drop_ref = function (arg0) {
    takeObject(arg0);
  };

  imports.wbg.__wbindgen_string_new = function (arg0, arg1) {
    var ret = getStringFromWasm0(arg0, arg1);
    return addHeapObject(ret);
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

  imports.wbg.__wbg_debug_3c0b82934d1dd91e = function (arg0) {
    console.debug(getObject(arg0));
  };

  imports.wbg.__wbg_error_9ff84d33a850b1ef = function (arg0) {
    console.error(getObject(arg0));
  };

  imports.wbg.__wbg_info_3b2058a219fa31b9 = function (arg0) {
    console.info(getObject(arg0));
  };

  imports.wbg.__wbg_log_386a8115a84a780d = function (arg0) {
    console.log(getObject(arg0));
  };

  imports.wbg.__wbg_warn_5fc232d538408d4a = function (arg0) {
    console.warn(getObject(arg0));
  };

  imports.wbg.__wbg_buffer_ebc6c8e75510eae3 = function (arg0) {
    var ret = getObject(arg0).buffer;
    return addHeapObject(ret);
  };

  imports.wbg.__wbg_newwithbyteoffsetandlength_ca3d3d8811ecb569 = function (arg0, arg1, arg2) {
    var ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
  };

  imports.wbg.__wbg_length_d984ad757a338649 = function (arg0) {
    var ret = getObject(arg0).length;
    return ret;
  };

  imports.wbg.__wbg_new_3df503b9c443e990 = function (arg0) {
    var ret = new Uint16Array(getObject(arg0));
    return addHeapObject(ret);
  };

  imports.wbg.__wbg_set_b629c9b89ba1d25c = function (arg0, arg1, arg2) {
    getObject(arg0).set(getObject(arg1), arg2 >>> 0);
  };

  imports.wbg.__wbg_newwithbyteoffsetandlength_ab2b53c614369e0e = function (arg0, arg1, arg2) {
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

/* harmony default export */ const tko_processing = (init);
// EXTERNAL MODULE: ./src/types.ts
var types = __webpack_require__(897);
;// CONCATENATED MODULE: ./src/processing.ts
 //import {initialize, getBodyShape, analyse } from "../processing";


async function FrameProcessor() {
  await tko_processing(`${"/static/dist/"}tko_processing_bg.wasm`);
  initialize(120, 160);
  let frameCount = 0;
  const analysisRace = [];
  return {
    analyse(frame, calibrationTempC, msSinceLastFFC) {
      const currFrame = frameCount;
      const analysis = new Promise(resolve => {
        const analysisResult = analyse(frame, calibrationTempC, msSinceLastFFC);
        const bodyShape = getBodyShape().slice(0);
        const result = (0,types/* extractResult */.kQ)(analysisResult);
        const index = analysisRace.findIndex(val => val.frame === currFrame);

        if (index !== 0) {
          analysisRace.splice(0, index);
        }

        resolve({
          bodyShape,
          analysisResult: result
        });
      });
      frameCount += 1;
      analysisRace.push({
        frame: currFrame,
        image: analysis
      });
    },

    async getFrame() {
      const image = await Promise.race(analysisRace.map(val => val.image));
      analysisRace.splice(0, analysisRace.length);
      return image;
    }

  };
}

/***/ }),

/***/ 897:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "tL": () => (/* binding */ FactoryDefaultCalibration),
/* harmony export */   "Pk": () => (/* binding */ InitialFrameInfo),
/* harmony export */   "kQ": () => (/* binding */ extractResult)
/* harmony export */ });
/* unused harmony exports DEFAULT_THRESHOLD_MIN_FEVER, ScreeningState */
const DEFAULT_THRESHOLD_MIN_FEVER = 37.5;
const FactoryDefaultCalibration = {
  ThermalRefTemp: 37.87441329956055,
  SnapshotTime: 0,
  TemperatureCelsius: 37.5,
  SnapshotValue: 30197.9765625,
  ThresholdMinFever: DEFAULT_THRESHOLD_MIN_FEVER,
  HeadBLX: 0,
  HeadBLY: 0,
  HeadBRX: 0,
  HeadBRY: 0,
  HeadTLX: 0,
  HeadTLY: 0,
  HeadTRX: 0,
  HeadTRY: 0,
  CalibrationBinaryVersion: "abcde",
  UuidOfUpdater: 432423432432,
  UseNormalSound: true,
  UseWarningSound: true,
  UseErrorSound: true
};
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
  ScreeningState["MEASURED"] = "MEASURED";
  ScreeningState["MISSING_THERMAL_REF"] = "MISSING_REF";
  ScreeningState["BLURRED"] = "BLURRED";
  ScreeningState["AFTER_FFC_EVENT"] = "AFTER_FFC_EVENT";
})(ScreeningState || (ScreeningState = {}));

const InitialFrameInfo = {
  Camera: {
    ResX: 160,
    ResY: 120,
    FPS: 9,
    Brand: "flir",
    Model: "lepton3.5",
    Firmware: "3.3.26",
    CameraSerial: 12345
  },
  Telemetry: {
    FrameCount: 1,
    TimeOn: 1,
    FFCState: "On",
    FrameMean: 0,
    TempC: 0,
    LastFFCTempC: 0,
    LastFFCTime: 0
  },
  AppVersion: "",
  BinaryVersion: "",
  Calibration: FactoryDefaultCalibration
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
      screeningState = ScreeningState.MEASURED;
      break;

    case 9:
      screeningState = ScreeningState.MISSING_THERMAL_REF;
      break;

    case 10:
      screeningState = ScreeningState.BLURRED;
      break;

    case 11:
      screeningState = ScreeningState.AFTER_FFC_EVENT;
      break;
  }

  return screeningState;
}

function extractResult(analysisResult) {
  const f = analysisResult.face;
  const h = f.head;
  const tL = h.topLeft;
  const tR = h.topRight;
  const bL = h.bottomLeft;
  const bR = h.bottomRight;
  const sP = f.samplePoint;
  const hS = analysisResult.heatStats;
  const ref = analysisResult.thermalReference;
  const geom = analysisResult.thermalReference.geom;
  const cP = geom.center;
  const copiedAnalysisResult = {
    face: {
      headLock: f.headLock,
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
      sampleTemp: f.sampleTemp,
      sampleValue: f.sampleValue,
      halfwayRatio: f.halfwayRatio,
      isValid: f.isValid
    },
    frameBottomSum: analysisResult.frameBottomSum,
    motionSum: analysisResult.motionSum,
    heatStats: {
      threshold: hS.threshold,
      min: hS.min,
      max: hS.max
    },
    motionThresholdSum: analysisResult.motionThresholdSum,
    thresholdSum: analysisResult.thresholdSum,
    nextState: getScreeningState(analysisResult.nextState),
    hasBody: analysisResult.hasBody,
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

/***/ }),

/***/ 347:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
(function () {
  const __exports = {};
  let wasm;
  /**
  * @param {number} size
  */

  __exports.initBufferWithSize = function (size) {
    wasm.initBufferWithSize(size);
  };

  let cachegetUint8Memory = null;

  function getUint8Memory() {
    if (cachegetUint8Memory === null || cachegetUint8Memory.buffer !== wasm.memory.buffer) {
      cachegetUint8Memory = new Uint8Array(wasm.memory.buffer);
    }

    return cachegetUint8Memory;
  }

  let WASM_VECTOR_LEN = 0;

  function passArray8ToWasm(arg) {
    const ptr = wasm.__wbindgen_malloc(arg.length * 1);

    getUint8Memory().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
  }
  /**
  * @param {Uint8Array} chunk
  * @param {number} offset
  */


  __exports.insertChunkAtOffset = function (chunk, offset) {
    wasm.insertChunkAtOffset(passArray8ToWasm(chunk), WASM_VECTOR_LEN, offset);
  };

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
  * @param {Uint8Array} input
  * @returns {any}
  */


  __exports.initWithCptvData = function (input) {
    const ret = wasm.initWithCptvData(passArray8ToWasm(input), WASM_VECTOR_LEN);
    return takeObject(ret);
  };
  /**
  * @returns {number}
  */


  __exports.getNumFrames = function () {
    const ret = wasm.getNumFrames();
    return ret >>> 0;
  };
  /**
  * @returns {number}
  */


  __exports.getWidth = function () {
    const ret = wasm.getWidth();
    return ret >>> 0;
  };
  /**
  * @returns {number}
  */


  __exports.getHeight = function () {
    const ret = wasm.getHeight();
    return ret >>> 0;
  };
  /**
  * @returns {number}
  */


  __exports.getFrameRate = function () {
    const ret = wasm.getFrameRate();
    return ret;
  };
  /**
  * @returns {number}
  */


  __exports.getFramesPerIframe = function () {
    const ret = wasm.getFramesPerIframe();
    return ret;
  };
  /**
  * @returns {number}
  */


  __exports.getMinValue = function () {
    const ret = wasm.getMinValue();
    return ret;
  };
  /**
  * @returns {number}
  */


  __exports.getMaxValue = function () {
    const ret = wasm.getMaxValue();
    return ret;
  };
  /**
  * @returns {any}
  */


  __exports.getHeader = function () {
    const ret = wasm.getHeader();
    return takeObject(ret);
  };

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


  __exports.queueFrame = function (number, callback) {
    const ret = wasm.queueFrame(number, addHeapObject(callback));
    return ret !== 0;
  };
  /**
  * @param {number} number
  * @param {Uint8Array} image_data
  * @returns {boolean}
  */


  __exports.getFrame = function (number, image_data) {
    const ptr0 = passArray8ToWasm(image_data);
    const len0 = WASM_VECTOR_LEN;

    try {
      const ret = wasm.getFrame(number, ptr0, len0);
      return ret !== 0;
    } finally {
      image_data.set(getUint8Memory().subarray(ptr0 / 1, ptr0 / 1 + len0));

      wasm.__wbindgen_free(ptr0, len0 * 1);
    }
  };
  /**
  * @param {Uint8Array} image_data
  * @returns {FrameHeaderV2}
  */


  __exports.getRawFrame = function (image_data) {
    const ptr0 = passArray8ToWasm(image_data);
    const len0 = WASM_VECTOR_LEN;

    try {
      const ret = wasm.getRawFrame(ptr0, len0);
      return FrameHeaderV2.__wrap(ret);
    } finally {
      image_data.set(getUint8Memory().subarray(ptr0 / 1, ptr0 / 1 + len0));

      wasm.__wbindgen_free(ptr0, len0 * 1);
    }
  };

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

    let ptr = wasm.__wbindgen_malloc(len);

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

      ptr = wasm.__wbindgen_realloc(ptr, len, len = offset + arg.length * 3);
      const view = getUint8Memory().subarray(ptr + offset, ptr + len);
      const ret = encodeString(arg, view);
      offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
  }

  let cachegetInt32Memory = null;

  function getInt32Memory() {
    if (cachegetInt32Memory === null || cachegetInt32Memory.buffer !== wasm.memory.buffer) {
      cachegetInt32Memory = new Int32Array(wasm.memory.buffer);
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

      wasm.__wbg_frameheaderv2_free(ptr);
    }
    /**
    * @returns {number}
    */


    get time_on() {
      const ret = wasm.__wbg_get_frameheaderv2_time_on(this.ptr);

      return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */


    set time_on(arg0) {
      wasm.__wbg_set_frameheaderv2_time_on(this.ptr, arg0);
    }
    /**
    * @returns {number}
    */


    get last_ffc_time() {
      const ret = wasm.__wbg_get_frameheaderv2_last_ffc_time(this.ptr);

      return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */


    set last_ffc_time(arg0) {
      wasm.__wbg_set_frameheaderv2_last_ffc_time(this.ptr, arg0);
    }
    /**
    * @returns {number}
    */


    get frame_number() {
      const ret = wasm.__wbg_get_frameheaderv2_frame_number(this.ptr);

      return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */


    set frame_number(arg0) {
      wasm.__wbg_set_frameheaderv2_frame_number(this.ptr, arg0);
    }
    /**
    * @returns {boolean}
    */


    get has_next_frame() {
      const ret = wasm.__wbg_get_frameheaderv2_has_next_frame(this.ptr);

      return ret !== 0;
    }
    /**
    * @param {boolean} arg0
    */


    set has_next_frame(arg0) {
      wasm.__wbg_set_frameheaderv2_has_next_frame(this.ptr, arg0);
    }

  }

  __exports.FrameHeaderV2 = FrameHeaderV2;

  function init(module) {
    let result;
    const imports = {};
    imports.wbg = {};

    imports.wbg.__wbindgen_object_drop_ref = function (arg0) {
      takeObject(arg0);
    };

    imports.wbg.__wbindgen_string_new = function (arg0, arg1) {
      const ret = getStringFromWasm(arg0, arg1);
      return addHeapObject(ret);
    };

    imports.wbg.__widl_f_debug_1_ = function (arg0) {
      console.debug(getObject(arg0));
    };

    imports.wbg.__widl_f_error_1_ = function (arg0) {
      console.error(getObject(arg0));
    };

    imports.wbg.__widl_f_info_1_ = function (arg0) {
      console.info(getObject(arg0));
    };

    imports.wbg.__widl_f_log_1_ = function (arg0) {
      console.log(getObject(arg0));
    };

    imports.wbg.__widl_f_warn_1_ = function (arg0) {
      console.warn(getObject(arg0));
    };

    imports.wbg.__wbg_new_59cb74e423758ede = function () {
      const ret = new Error();
      return addHeapObject(ret);
    };

    imports.wbg.__wbg_stack_558ba5917b466edd = function (arg0, arg1) {
      const ret = getObject(arg1).stack;
      const ret0 = passStringToWasm(ret);
      const ret1 = WASM_VECTOR_LEN;
      getInt32Memory()[arg0 / 4 + 0] = ret0;
      getInt32Memory()[arg0 / 4 + 1] = ret1;
    };

    imports.wbg.__wbg_error_4bb6c2a97407129a = function (arg0, arg1) {
      const v0 = getStringFromWasm(arg0, arg1).slice();

      wasm.__wbindgen_free(arg0, arg1 * 1);

      console.error(v0);
    };

    imports.wbg.__wbindgen_throw = function (arg0, arg1) {
      throw new Error(getStringFromWasm(arg0, arg1));
    };

    imports.wbg.__wbindgen_rethrow = function (arg0) {
      throw takeObject(arg0);
    };

    if (typeof URL === 'function' && module instanceof URL || typeof module === 'string' || typeof Request === 'function' && module instanceof Request) {
      const response = fetch(module);

      if (typeof WebAssembly.instantiateStreaming === 'function') {
        result = WebAssembly.instantiateStreaming(response, imports).catch(e => {
          return response.then(r => {
            if (r.headers.get('Content-Type') != 'application/wasm') {
              console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);
              return r.arrayBuffer();
            } else {
              throw e;
            }
          }).then(bytes => WebAssembly.instantiate(bytes, imports));
        });
      } else {
        result = response.then(r => r.arrayBuffer()).then(bytes => WebAssembly.instantiate(bytes, imports));
      }
    } else {
      result = WebAssembly.instantiate(module, imports).then(result => {
        if (result instanceof WebAssembly.Instance) {
          return {
            instance: result,
            module
          };
        } else {
          return result;
        }
      });
    }

    return result.then(({
      instance,
      module
    }) => {
      wasm = instance.exports;
      init.__wbindgen_wasm_module = module;
      return wasm;
    });
  }

  self.wasm_bindgen = Object.assign(init, __exports);
})();

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (self.wasm_bindgen);

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/async module */
/******/ 	(() => {
/******/ 		var webpackThen = typeof Symbol === "function" ? Symbol("webpack then") : "__webpack_then__";
/******/ 		var webpackExports = typeof Symbol === "function" ? Symbol("webpack exports") : "__webpack_exports__";
/******/ 		var completeQueue = (queue) => {
/******/ 			if(queue) {
/******/ 				queue.forEach((fn) => (fn.r--));
/******/ 				queue.forEach((fn) => (fn.r-- ? fn.r++ : fn()));
/******/ 			}
/******/ 		}
/******/ 		var completeFunction = (fn) => (!--fn.r && fn());
/******/ 		var queueFunction = (queue, fn) => (queue ? queue.push(fn) : completeFunction(fn));
/******/ 		var wrapDeps = (deps) => (deps.map((dep) => {
/******/ 			if(dep !== null && typeof dep === "object") {
/******/ 				if(dep[webpackThen]) return dep;
/******/ 				if(dep.then) {
/******/ 					var queue = [];
/******/ 					dep.then((r) => {
/******/ 						obj[webpackExports] = r;
/******/ 						completeQueue(queue);
/******/ 						queue = 0;
/******/ 					});
/******/ 					var obj = {};
/******/ 												obj[webpackThen] = (fn, reject) => (queueFunction(queue, fn), dep.catch(reject));
/******/ 					return obj;
/******/ 				}
/******/ 			}
/******/ 			var ret = {};
/******/ 								ret[webpackThen] = (fn) => (completeFunction(fn));
/******/ 								ret[webpackExports] = dep;
/******/ 								return ret;
/******/ 		}));
/******/ 		__webpack_require__.a = (module, body, hasAwait) => {
/******/ 			var queue = hasAwait && [];
/******/ 			var exports = module.exports;
/******/ 			var currentDeps;
/******/ 			var outerResolve;
/******/ 			var reject;
/******/ 			var isEvaluating = true;
/******/ 			var nested = false;
/******/ 			var whenAll = (deps, onResolve, onReject) => {
/******/ 				if (nested) return;
/******/ 				nested = true;
/******/ 				onResolve.r += deps.length;
/******/ 				deps.map((dep, i) => (dep[webpackThen](onResolve, onReject)));
/******/ 				nested = false;
/******/ 			};
/******/ 			var promise = new Promise((resolve, rej) => {
/******/ 				reject = rej;
/******/ 				outerResolve = () => (resolve(exports), completeQueue(queue), queue = 0);
/******/ 			});
/******/ 			promise[webpackExports] = exports;
/******/ 			promise[webpackThen] = (fn, rejectFn) => {
/******/ 				if (isEvaluating) { return completeFunction(fn); }
/******/ 				if (currentDeps) whenAll(currentDeps, fn, rejectFn);
/******/ 				queueFunction(queue, fn);
/******/ 				promise.catch(rejectFn);
/******/ 			};
/******/ 			module.exports = promise;
/******/ 			body((deps) => {
/******/ 				if(!deps) return outerResolve();
/******/ 				currentDeps = wrapDeps(deps);
/******/ 				var fn, result;
/******/ 				var promise = new Promise((resolve, reject) => {
/******/ 					fn = () => (resolve(result = currentDeps.map((d) => (d[webpackExports]))));
/******/ 					fn.r = 0;
/******/ 					whenAll(currentDeps, fn, reject);
/******/ 				});
/******/ 				return fn.r ? promise : result;
/******/ 			}).then(outerResolve, reject);
/******/ 			isEvaluating = false;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module used 'module' so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(352);
/******/ 	
/******/ })()
;
//# sourceMappingURL=26e3da6088f10446f7f9.worker.js.map