let wasm_bindgen;
(function() {
    const __exports = {};
    let wasm;

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

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

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
* @returns {Uint8Array}
*/
__exports.getPointCloud = function() {
    var ret = wasm.getPointCloud();
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

function handleError(f) {
    return function () {
        try {
            return f.apply(this, arguments);

        } catch (e) {
            wasm.__wbindgen_exn_store(addHeapObject(e));
        }
    };
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
    imports.wbg.__wbindgen_number_new = function(arg0) {
        var ret = arg0;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
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
    imports.wbg.__wbg_now_acfa6ea53a7be2c2 = function(arg0) {
        var ret = getObject(arg0).now();
        return ret;
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
    imports.wbg.__wbg_get_2e96a823c1c5a5bd = handleError(function(arg0, arg1) {
        var ret = Reflect.get(getObject(arg0), getObject(arg1));
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_call_e9f0ce4da840ab94 = handleError(function(arg0, arg1) {
        var ret = getObject(arg0).call(getObject(arg1));
        return addHeapObject(ret);
    });
    imports.wbg.__wbindgen_object_clone_ref = function(arg0) {
        var ret = getObject(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_17534eac4df3cd22 = function() {
        var ret = new Array();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_push_7114ccbf1c58e41f = function(arg0, arg1) {
        var ret = getObject(arg0).push(getObject(arg1));
        return ret;
    };
    imports.wbg.__wbg_newnoargs_e2fdfe2af14a2323 = function(arg0, arg1) {
        var ret = new Function(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_self_179e8c2a5a4c73a3 = handleError(function() {
        var ret = self.self;
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_window_492cfe63a6e41dfa = handleError(function() {
        var ret = window.window;
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_globalThis_8ebfea75c2dd63ee = handleError(function() {
        var ret = globalThis.globalThis;
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_global_62ea2619f58bf94d = handleError(function() {
        var ret = global.global;
        return addHeapObject(ret);
    });
    imports.wbg.__wbindgen_is_undefined = function(arg0) {
        var ret = getObject(arg0) === undefined;
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
    imports.wbg.__wbindgen_debug_string = function(arg0, arg1) {
        var ret = debugString(getObject(arg1));
        var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
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
