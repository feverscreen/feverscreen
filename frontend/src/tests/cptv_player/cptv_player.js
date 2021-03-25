let wasm;
const { TextDecoder } = require(String.raw`util`);

const e = {};
/**
 * @param {number} size
 */
e.initBufferWithSize = function(size) {
  wasm.initBufferWithSize(size);
};

let cachegetUint8Memory = null;
function getUint8Memory() {
  if (
    cachegetUint8Memory === null ||
    cachegetUint8Memory.buffer !== wasm.memory.buffer
  ) {
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
e.insertChunkAtOffset = function(chunk, offset) {
  wasm.insertChunkAtOffset(passArray8ToWasm(chunk), WASM_VECTOR_LEN, offset);
};

/**
 * @param {Uint8Array} input
 */
e.initWithCptvData = function(input) {
  wasm.initWithCptvData(passArray8ToWasm(input), WASM_VECTOR_LEN);
};
export function initWithCptvData(input) {
  wasm.initWithCptvData(passArray8ToWasm(input), WASM_VECTOR_LEN);
}
/**
 * @returns {number}
 */
e.getNumFrames = function() {
  const ret = wasm.getNumFrames();
  return ret >>> 0;
};

/**
 * @returns {number}
 */
e.getWidth = function() {
  const ret = wasm.getWidth();
  return ret >>> 0;
};

/**
 * @returns {number}
 */
e.getHeight = function() {
  const ret = wasm.getHeight();
  return ret >>> 0;
};

/**
 * @returns {number}
 */
e.getFrameRate = function() {
  const ret = wasm.getFrameRate();
  return ret;
};

/**
 * @returns {number}
 */
e.getFramesPerIframe = function() {
  const ret = wasm.getFramesPerIframe();
  return ret;
};

/**
 * @returns {number}
 */
e.getMinValue = function() {
  const ret = wasm.getMinValue();
  return ret;
};

/**
 * @returns {number}
 */
e.getMaxValue = function() {
  const ret = wasm.getMaxValue();
  return ret;
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
 * @returns {any}
 */
e.getHeader = function() {
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
e.queueFrame = function(number, callback) {
  const ret = wasm.queueFrame(number, addHeapObject(callback));
  return ret !== 0;
};

/**
 * @param {number} number
 * @param {Uint8Array} image_data
 * @returns {boolean}
 */
e.getFrame = function(number, image_data) {
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
e.getRawFrame = function(image_data) {
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
export function getRawFrame(image_data) {
  const ptr0 = passArray8ToWasm(image_data);
  const len0 = WASM_VECTOR_LEN;
  try {
    const ret = wasm.getRawFrame(ptr0, len0);
    return FrameHeaderV2.__wrap(ret);
  } finally {
    image_data.set(getUint8Memory().subarray(ptr0 / 1, ptr0 / 1 + len0));
    wasm.__wbindgen_free(ptr0, len0 * 1);
  }
}

const cachedTextDecoder = new TextDecoder("utf-8", {
  ignoreBOM: true,
  fatal: true
});

cachedTextDecoder.decode();

function getStringFromWasm(ptr, len) {
  return cachedTextDecoder.decode(getUint8Memory().subarray(ptr, ptr + len));
}

let cachegetNodeBufferMemory = null;
function getNodeBufferMemory() {
  if (
    cachegetNodeBufferMemory === null ||
    cachegetNodeBufferMemory.buffer !== wasm.memory.buffer
  ) {
    cachegetNodeBufferMemory = Buffer.from(wasm.memory.buffer);
  }
  return cachegetNodeBufferMemory;
}

function passStringToWasm(arg) {
  const len = Buffer.byteLength(arg);
  const ptr = wasm.__wbindgen_malloc(len);
  getNodeBufferMemory().write(arg, ptr, len);
  WASM_VECTOR_LEN = len;
  return ptr;
}

let cachegetInt32Memory = null;
function getInt32Memory() {
  if (
    cachegetInt32Memory === null ||
    cachegetInt32Memory.buffer !== wasm.memory.buffer
  ) {
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
e.FrameHeaderV2 = FrameHeaderV2;

e.__wbindgen_string_new = function(arg0, arg1) {
  const ret = getStringFromWasm(arg0, arg1);
  return addHeapObject(ret);
};

e.__wbindgen_object_drop_ref = function(arg0) {
  takeObject(arg0);
};

e.__wbg_new_59cb74e423758ede = function() {
  const ret = new Error();
  return addHeapObject(ret);
};

e.__wbg_stack_558ba5917b466edd = function(arg0, arg1) {
  const ret = getObject(arg1).stack;
  const ret0 = passStringToWasm(ret);
  const ret1 = WASM_VECTOR_LEN;
  getInt32Memory()[arg0 / 4 + 0] = ret0;
  getInt32Memory()[arg0 / 4 + 1] = ret1;
};

e.__wbg_error_4bb6c2a97407129a = function(arg0, arg1) {
  const v0 = getStringFromWasm(arg0, arg1).slice();
  wasm.__wbindgen_free(arg0, arg1 * 1);
  console.error(v0);
};

e.__wbindgen_throw = function(arg0, arg1) {
  throw new Error(getStringFromWasm(arg0, arg1));
};

e.__widl_f_debug_1_ = function(arg0) {
  console.debug(getObject(arg0));
};

e.__widl_f_error_1_ = function(arg0) {
  console.error(getObject(arg0));
};

e.__widl_f_info_1_ = function(arg0) {
  console.info(getObject(arg0));
};

e.__widl_f_log_1_ = function(arg0) {
  console.log(getObject(arg0));
};

e.__widl_f_warn_1_ = function(arg0) {
  console.warn(getObject(arg0));
};

const path = require("path").join(__dirname, "./cptv_player_bg.wasm");
const bytes = require("fs").readFileSync(path);
const wasmModule = new WebAssembly.Module(bytes);
const wasmInstance = new WebAssembly.Instance(wasmModule, {
  "./cptv_player.js": e
});
wasm = wasmInstance.exports;
export default e;
