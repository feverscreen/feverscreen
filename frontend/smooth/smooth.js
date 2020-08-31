let wasm_bindgen;
(function() {
    const __exports = {};
    let wasm;

    const heap = new Array(32).fill(undefined);

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

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
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
/**
* @param {any} width
* @param {any} height
*/
__exports.initialize = function(width, height) {
    wasm.initialize(addHeapObject(width), addHeapObject(height));
};

let stack_pointer = 32;

function addBorrowedObject(obj) {
    if (stack_pointer == 1) throw new Error('out of js stack');
    heap[--stack_pointer] = obj;
    return stack_pointer;
}
/**
* @param {Float32Array} input_frame
* @param {any} num_buckets
* @param {any} should_rotate
* @param {any} thermal_ref_c
* @param {any} thermal_ref_raw
* @param {any} thermal_ref_x0
* @param {any} thermal_ref_y0
* @param {any} thermal_ref_x1
* @param {any} thermal_ref_y1
* @returns {MotionStats}
*/
__exports.smooth = function(input_frame, num_buckets, should_rotate, thermal_ref_c, thermal_ref_raw, thermal_ref_x0, thermal_ref_y0, thermal_ref_x1, thermal_ref_y1) {
    try {
        var ret = wasm.smooth(addBorrowedObject(input_frame), addHeapObject(num_buckets), addHeapObject(should_rotate), addHeapObject(thermal_ref_c), addHeapObject(thermal_ref_raw), addHeapObject(thermal_ref_x0), addHeapObject(thermal_ref_y0), addHeapObject(thermal_ref_x1), addHeapObject(thermal_ref_y1));
        return MotionStats.__wrap(ret);
    } finally {
        heap[stack_pointer++] = undefined;
    }
};

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
    return instance.ptr;
}
/**
* @returns {Float32Array}
*/
__exports.getMedianSmoothed = function() {
    var ret = wasm.getMedianSmoothed();
    return takeObject(ret);
};

/**
* @returns {Uint8Array}
*/
__exports.getThresholded = function() {
    var ret = wasm.getThresholded();
    return takeObject(ret);
};

/**
* @returns {HeatStats}
*/
__exports.getHeatStats = function() {
    var ret = wasm.getHeatStats();
    return HeatStats.__wrap(ret);
};

/**
* @returns {Array<any>}
*/
__exports.getHistogram = function() {
    var ret = wasm.getHistogram();
    return takeObject(ret);
};

/**
* @returns {Float32Array}
*/
__exports.getRadialSmoothed = function() {
    var ret = wasm.getRadialSmoothed();
    return takeObject(ret);
};

/**
* @returns {Float32Array}
*/
__exports.getEdges = function() {
    var ret = wasm.getEdges();
    return takeObject(ret);
};

let WASM_VECTOR_LEN = 0;

let cachedTextEncoder = new TextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length);
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
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
__exports.HeatStats = HeatStats;
/**
*/
class MotionStats {

    static __wrap(ptr) {
        const obj = Object.create(MotionStats.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_motionstats_free(ptr);
    }
    /**
    * @returns {number}
    */
    get motion_sum() {
        var ret = wasm.__wbg_get_motionstats_motion_sum(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set motion_sum(arg0) {
        wasm.__wbg_set_motionstats_motion_sum(this.ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get motion_threshold_sum() {
        var ret = wasm.__wbg_get_motionstats_motion_threshold_sum(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set motion_threshold_sum(arg0) {
        wasm.__wbg_set_motionstats_motion_threshold_sum(this.ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get threshold_sum() {
        var ret = wasm.__wbg_get_motionstats_threshold_sum(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set threshold_sum(arg0) {
        wasm.__wbg_set_motionstats_threshold_sum(this.ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get frame_bottom_sum() {
        var ret = wasm.__wbg_get_motionstats_frame_bottom_sum(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set frame_bottom_sum(arg0) {
        wasm.__wbg_set_motionstats_frame_bottom_sum(this.ptr, arg0);
    }
    /**
    * @returns {HeatStats}
    */
    get heat_stats() {
        var ret = wasm.__wbg_get_motionstats_heat_stats(this.ptr);
        return HeatStats.__wrap(ret);
    }
    /**
    * @param {HeatStats} arg0
    */
    set heat_stats(arg0) {
        _assertClass(arg0, HeatStats);
        var ptr0 = arg0.ptr;
        arg0.ptr = 0;
        wasm.__wbg_set_motionstats_heat_stats(this.ptr, ptr0);
    }
}
__exports.MotionStats = MotionStats;

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
            return { instance, module };

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
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
    };
    imports.wbg.__wbindgen_number_new = function(arg0) {
        var ret = arg0;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        var ret = getStringFromWasm0(arg0, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_debug_ef2b78738889619f = function(arg0) {
        console.debug(getObject(arg0));
    };
    imports.wbg.__wbg_error_7dcc755846c00ef7 = function(arg0) {
        console.error(getObject(arg0));
    };
    imports.wbg.__wbg_info_43f70b84e943346e = function(arg0) {
        console.info(getObject(arg0));
    };
    imports.wbg.__wbg_log_61ea781bd002cc41 = function(arg0) {
        console.log(getObject(arg0));
    };
    imports.wbg.__wbg_warn_502e53bc79de489a = function(arg0) {
        console.warn(getObject(arg0));
    };
    imports.wbg.__wbg_new_59cb74e423758ede = function() {
        var ret = new Error();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_stack_558ba5917b466edd = function(arg0, arg1) {
        var ret = getObject(arg1).stack;
        var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_error_4bb6c2a97407129a = function(arg0, arg1) {
        try {
            console.error(getStringFromWasm0(arg0, arg1));
        } finally {
            wasm.__wbindgen_free(arg0, arg1);
        }
    };
    imports.wbg.__wbg_new_17534eac4df3cd22 = function() {
        var ret = new Array();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_push_7114ccbf1c58e41f = function(arg0, arg1) {
        var ret = getObject(arg0).push(getObject(arg1));
        return ret;
    };
    imports.wbg.__wbg_buffer_88f603259d7a7b82 = function(arg0) {
        var ret = getObject(arg0).buffer;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_a048d126789a272b = function(arg0, arg1, arg2) {
        var ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_66305c055ad2f047 = function(arg0, arg1, arg2) {
        var ret = new Float32Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_length_5ed9637f0c91cf31 = function(arg0) {
        var ret = getObject(arg0).length;
        return ret;
    };
    imports.wbg.__wbg_new_97dfb1e289e6c216 = function(arg0) {
        var ret = new Float32Array(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_set_02fc6472d777f843 = function(arg0, arg1, arg2) {
        getObject(arg0).set(getObject(arg1), arg2 >>> 0);
    };
    imports.wbg.__wbindgen_number_get = function(arg0, arg1) {
        const obj = getObject(arg1);
        var ret = typeof(obj) === 'number' ? obj : undefined;
        getFloat64Memory0()[arg0 / 8 + 1] = isLikeNone(ret) ? 0 : ret;
        getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
    };
    imports.wbg.__wbindgen_boolean_get = function(arg0) {
        const v = getObject(arg0);
        var ret = typeof(v) === 'boolean' ? (v ? 1 : 0) : 2;
        return ret;
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbindgen_memory = function() {
        var ret = wasm.memory;
        return addHeapObject(ret);
    };

    if (typeof input === 'string' || (typeof Request === 'function' && input instanceof Request) || (typeof URL === 'function' && input instanceof URL)) {
        input = fetch(input);
    }

    const { instance, module } = await load(await input, imports);

    wasm = instance.exports;
    init.__wbindgen_wasm_module = module;

    return wasm;
}

wasm_bindgen = Object.assign(init, __exports);

})();
export default wasm_bindgen;
