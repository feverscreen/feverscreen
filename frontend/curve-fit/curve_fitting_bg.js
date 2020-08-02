/* eslint-disable */
import * as wasm from './curve_fitting_bg.wasm';

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

function getObject(idx) { return heap[idx]; }

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
export function fitCurveThroughPoints(points) {
    try {
        var ptr0 = passArray8ToWasm0(points, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.fitCurveThroughPoints(ptr0, len0);
        return takeObject(ret);
    } finally {
        points.set(getUint8Memory0().subarray(ptr0 / 1, ptr0 / 1 + len0));
        wasm.__wbindgen_free(ptr0, len0 * 1);
    }
}

export const __wbindgen_number_new = function(arg0) {
    var ret = arg0;
    return addHeapObject(ret);
};

export const __wbindgen_object_drop_ref = function(arg0) {
    takeObject(arg0);
};

export const __wbg_new_6b6f346b4912cdae = function() {
    var ret = new Array();
    return addHeapObject(ret);
};

export const __wbg_push_f353108e20ec67a0 = function(arg0, arg1) {
    var ret = getObject(arg0).push(getObject(arg1));
    return ret;
};

export const __wbindgen_throw = function(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

