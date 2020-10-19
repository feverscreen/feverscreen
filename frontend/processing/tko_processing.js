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
* @returns {AnalysisResult}
*/
__exports.analyse = function(input_frame, calibrated_thermal_ref_temp_c) {
    try {
        var ret = wasm.analyse(addBorrowedObject(input_frame), addBorrowedObject(calibrated_thermal_ref_temp_c));
        return AnalysisResult.__wrap(ret);
    } finally {
        heap[stack_pointer++] = undefined;
        heap[stack_pointer++] = undefined;
    }
};

/**
* @returns {Float32Array}
*/
__exports.getMedianSmoothed = function() {
    var ret = wasm.getMedianSmoothed();
    return takeObject(ret);
};

/**
* @returns {Float32Array}
*/
__exports.getDebug = function() {
    var ret = wasm.getDebug();
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
__exports.getBodyShape = function() {
    var ret = wasm.getBodyShape();
    return takeObject(ret);
};

/**
* @returns {Uint8Array}
*/
__exports.getFaceShape = function() {
    var ret = wasm.getFaceShape();
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

/**
* @param {any} _width
* @param {any} _height
*/
__exports.initialize = function(_width, _height) {
    wasm.initialize(addHeapObject(_width), addHeapObject(_height));
};

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
    return instance.ptr;
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
*/
__exports.ScreeningState = Object.freeze({ WarmingUp:0,"0":"WarmingUp",Ready:1,"1":"Ready",HeadLock:2,"2":"HeadLock",TooFar:3,"3":"TooFar",HasBody:4,"4":"HasBody",FaceLock:5,"5":"FaceLock",FrontalLock:6,"6":"FrontalLock",StableLock:7,"7":"StableLock",Measured:8,"8":"Measured",MissingThermalRef:9,"9":"MissingThermalRef",Blurred:10,"10":"Blurred", });
/**
*/
__exports.HeadLockConfidence = Object.freeze({ Bad:0,"0":"Bad",Partial:1,"1":"Partial",Stable:2,"2":"Stable", });
/**
*/
__exports.InvalidReason = Object.freeze({ Unknown:0,"0":"Unknown",Valid:1,"1":"Valid",TooMuchTilt:2,"2":"TooMuchTilt", });
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
        return ret;
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
    get motion_sum_current_only() {
        var ret = wasm.__wbg_get_analysisresult_motion_sum_current_only(this.ptr);
        return ret;
    }
    /**
    * @param {number} arg0
    */
    set motion_sum_current_only(arg0) {
        wasm.__wbg_set_analysisresult_motion_sum_current_only(this.ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get motion_threshold_sum() {
        var ret = wasm.__wbg_get_analysisresult_motion_threshold_sum(this.ptr);
        return ret;
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
        return ret;
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
        return ret;
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
    /**
    * @returns {Point}
    */
    get ideal_sample_point() {
        var ret = wasm.__wbg_get_faceinfo_ideal_sample_point(this.ptr);
        return Point.__wrap(ret);
    }
    /**
    * @param {Point} arg0
    */
    set ideal_sample_point(arg0) {
        _assertClass(arg0, Point);
        var ptr0 = arg0.ptr;
        arg0.ptr = 0;
        wasm.__wbg_set_faceinfo_ideal_sample_point(this.ptr, ptr0);
    }
    /**
    * @returns {number}
    */
    get ideal_sample_value() {
        var ret = wasm.__wbg_get_faceinfo_ideal_sample_value(this.ptr);
        return ret;
    }
    /**
    * @param {number} arg0
    */
    set ideal_sample_value(arg0) {
        wasm.__wbg_set_faceinfo_ideal_sample_value(this.ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get ideal_sample_temp() {
        var ret = wasm.__wbg_get_faceinfo_ideal_sample_temp(this.ptr);
        return ret;
    }
    /**
    * @param {number} arg0
    */
    set ideal_sample_temp(arg0) {
        wasm.__wbg_set_faceinfo_ideal_sample_temp(this.ptr, arg0);
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
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        var ret = getStringFromWasm0(arg0, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_debug_b443de592faba09f = function(arg0) {
        console.debug(getObject(arg0));
    };
    imports.wbg.__wbg_error_7f083efc6bc6752c = function(arg0) {
        console.error(getObject(arg0));
    };
    imports.wbg.__wbg_info_6d4a86f0fd590270 = function(arg0) {
        console.info(getObject(arg0));
    };
    imports.wbg.__wbg_log_3bafd82835c6de6d = function(arg0) {
        console.log(getObject(arg0));
    };
    imports.wbg.__wbg_warn_d05e82888b7fad05 = function(arg0) {
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
    imports.wbg.__wbg_buffer_49131c283a06686f = function(arg0) {
        var ret = getObject(arg0).buffer;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_c0f38401daad5a22 = function(arg0, arg1, arg2) {
        var ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_length_61e185fe1c3633f0 = function(arg0) {
        var ret = getObject(arg0).length;
        return ret;
    };
    imports.wbg.__wbg_new_6163f4677d099230 = function(arg0) {
        var ret = new Uint16Array(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_set_7dc299c314366736 = function(arg0, arg1, arg2) {
        getObject(arg0).set(getObject(arg1), arg2 >>> 0);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_205200207c0c1946 = function(arg0, arg1, arg2) {
        var ret = new Float32Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_number_get = function(arg0, arg1) {
        const obj = getObject(arg1);
        var ret = typeof(obj) === 'number' ? obj : undefined;
        getFloat64Memory0()[arg0 / 8 + 1] = isLikeNone(ret) ? 0 : ret;
        getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
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
