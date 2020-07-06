import * as wasm from './smooth_bg.wasm';

const heap = new Array(32);

heap.fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

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

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

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
/**
* @param {any} width
* @param {any} height
*/
export function initialize(width, height) {
    wasm.initialize(addHeapObject(width), addHeapObject(height));
}

let stack_pointer = 32;

function addBorrowedObject(obj) {
    if (stack_pointer == 1) throw new Error('out of js stack');
    heap[--stack_pointer] = obj;
    return stack_pointer;
}
/**
* @param {any} input_frame
*/
export function smooth(input_frame) {
    try {
        wasm.smooth(addBorrowedObject(input_frame));
    } finally {
        heap[stack_pointer++] = undefined;
    }
}

/**
* @returns {any}
*/
export function get_median_smoothed() {
    var ret = wasm.get_median_smoothed();
    return takeObject(ret);
}

/**
* @returns {any}
*/
export function get_radial_smoothed() {
    var ret = wasm.get_radial_smoothed();
    return takeObject(ret);
}

/**
* @returns {any}
*/
export function get_edges() {
    var ret = wasm.get_edges();
    return takeObject(ret);
}

/**
* @param {any} input_frame
* @returns {any}
*/
export function median_smooth(input_frame) {
    try {
        var ret = wasm.median_smooth(addBorrowedObject(input_frame));
        return takeObject(ret);
    } finally {
        heap[stack_pointer++] = undefined;
    }
}

/**
* @param {any} input_frame
* @returns {any}
*/
export function radial_smooth(input_frame) {
    try {
        var ret = wasm.radial_smooth(addBorrowedObject(input_frame));
        return takeObject(ret);
    } finally {
        heap[stack_pointer++] = undefined;
    }
}

/**
* @param {number} width
* @param {number} height
* @returns {CircleDetect}
*/
export function circle_detect(width, height) {
    var ret = wasm.circle_detect(width, height);
    return CircleDetect.__wrap(ret);
}

/**
*/
export class CircleDetect {

    static __wrap(ptr) {
        const obj = Object.create(CircleDetect.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_circledetect_free(ptr);
    }
    /**
    * @returns {number}
    */
    r() {
        var ret = wasm.circledetect_r(this.ptr);
        return ret >>> 0;
    }
    /**
    * @returns {Point}
    */
    p() {
        var ret = wasm.circledetect_p(this.ptr);
        return Point.__wrap(ret);
    }
}
/**
*/
export class Point {

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
    x() {
        var ret = wasm.point_x(this.ptr);
        return ret >>> 0;
    }
    /**
    * @returns {number}
    */
    y() {
        var ret = wasm.point_y(this.ptr);
        return ret >>> 0;
    }
}

export const __wbindgen_object_drop_ref = function(arg0) {
    takeObject(arg0);
};

export const __wbg_buffer_1bb127df6348017b = function(arg0) {
    var ret = getObject(arg0).buffer;
    return addHeapObject(ret);
};

export const __wbg_newwithbyteoffsetandlength_07654e7af606fce0 = function(arg0, arg1, arg2) {
    var ret = new Float32Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};

export const __wbg_length_4505c57c216b6917 = function(arg0) {
    var ret = getObject(arg0).length;
    return ret;
};

export const __wbg_new_2f80ca95bc180a3c = function(arg0) {
    var ret = new Float32Array(getObject(arg0));
    return addHeapObject(ret);
};

export const __wbg_set_0e4bea19d9b9d783 = function(arg0, arg1, arg2) {
    getObject(arg0).set(getObject(arg1), arg2 >>> 0);
};

export const __wbindgen_number_get = function(arg0, arg1) {
    const obj = getObject(arg1);
    var ret = typeof(obj) === 'number' ? obj : undefined;
    getFloat64Memory0()[arg0 / 8 + 1] = isLikeNone(ret) ? 0 : ret;
    getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
};

export const __wbindgen_throw = function(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

export const __wbindgen_memory = function() {
    var ret = wasm.memory;
    return addHeapObject(ret);
};

