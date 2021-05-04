import * as wasm from './tko_processing_bg.wasm';

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

const lTextDecoder = typeof TextDecoder === 'undefined' ? (0, module.require)('util').TextDecoder : TextDecoder;

let cachedTextDecoder = new lTextDecoder('utf-8', { ignoreBOM: true, fatal: true });

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
export function analyse(input_frame, calibrated_thermal_ref_temp_c, ms_since_last_ffc) {
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
export function getMedianSmoothed() {
    var ret = wasm.getMedianSmoothed();
    return takeObject(ret);
}

/**
* @returns {Float32Array}
*/
export function getDebug() {
    var ret = wasm.getDebug();
    return takeObject(ret);
}

/**
* @returns {Uint8Array}
*/
export function getThresholded() {
    var ret = wasm.getThresholded();
    return takeObject(ret);
}

/**
* @returns {Uint8Array}
*/
export function getBodyShape() {
    var ret = wasm.getBodyShape();
    return takeObject(ret);
}

/**
* @returns {Uint8Array}
*/
export function getFaceShape() {
    var ret = wasm.getFaceShape();
    return takeObject(ret);
}

/**
* @returns {Float32Array}
*/
export function getRadialSmoothed() {
    var ret = wasm.getRadialSmoothed();
    return takeObject(ret);
}

/**
* @returns {Float32Array}
*/
export function getEdges() {
    var ret = wasm.getEdges();
    return takeObject(ret);
}

/**
* @param {any} _width
* @param {any} _height
*/
export function initialize(_width, _height) {
    wasm.initialize(addHeapObject(_width), addHeapObject(_height));
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
    return instance.ptr;
}

let WASM_VECTOR_LEN = 0;

const lTextEncoder = typeof TextEncoder === 'undefined' ? (0, module.require)('util').TextEncoder : TextEncoder;

let cachedTextEncoder = new lTextEncoder('utf-8');

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
export const HeadLockConfidence = Object.freeze({ Bad:0,"0":"Bad",Partial:1,"1":"Partial",Stable:2,"2":"Stable", });
/**
*/
export const InvalidReason = Object.freeze({ Unknown:0,"0":"Unknown",Valid:1,"1":"Valid",TooMuchTilt:2,"2":"TooMuchTilt", });
/**
*/
export const ScreeningState = Object.freeze({ WarmingUp:0,"0":"WarmingUp",Ready:1,"1":"Ready",HeadLock:2,"2":"HeadLock",TooFar:3,"3":"TooFar",HasBody:4,"4":"HasBody",FaceLock:5,"5":"FaceLock",FrontalLock:6,"6":"FrontalLock",StableLock:7,"7":"StableLock",Measured:8,"8":"Measured",MissingThermalRef:9,"9":"MissingThermalRef",Blurred:10,"10":"Blurred",AfterFfcEvent:11,"11":"AfterFfcEvent", });
/**
*/
export class AnalysisResult {

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
export class Circle {

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
export class FaceInfo {

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
export class HeatStats {

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
export class Point {

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
export class Quad {

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
export class ThermalReference {

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

export const __wbindgen_object_drop_ref = function(arg0) {
    takeObject(arg0);
};

export const __wbindgen_string_new = function(arg0, arg1) {
    var ret = getStringFromWasm0(arg0, arg1);
    return addHeapObject(ret);
};

export const __wbg_debug_3c0b82934d1dd91e = function(arg0) {
    console.debug(getObject(arg0));
};

export const __wbg_error_9ff84d33a850b1ef = function(arg0) {
    console.error(getObject(arg0));
};

export const __wbg_info_3b2058a219fa31b9 = function(arg0) {
    console.info(getObject(arg0));
};

export const __wbg_log_386a8115a84a780d = function(arg0) {
    console.log(getObject(arg0));
};

export const __wbg_warn_5fc232d538408d4a = function(arg0) {
    console.warn(getObject(arg0));
};

export const __wbg_new_59cb74e423758ede = function() {
    var ret = new Error();
    return addHeapObject(ret);
};

export const __wbg_stack_558ba5917b466edd = function(arg0, arg1) {
    var ret = getObject(arg1).stack;
    var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

export const __wbg_error_4bb6c2a97407129a = function(arg0, arg1) {
    try {
        console.error(getStringFromWasm0(arg0, arg1));
    } finally {
        wasm.__wbindgen_free(arg0, arg1);
    }
};

export const __wbg_buffer_ebc6c8e75510eae3 = function(arg0) {
    var ret = getObject(arg0).buffer;
    return addHeapObject(ret);
};

export const __wbg_newwithbyteoffsetandlength_ca3d3d8811ecb569 = function(arg0, arg1, arg2) {
    var ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};

export const __wbg_length_d984ad757a338649 = function(arg0) {
    var ret = getObject(arg0).length;
    return ret;
};

export const __wbg_new_3df503b9c443e990 = function(arg0) {
    var ret = new Uint16Array(getObject(arg0));
    return addHeapObject(ret);
};

export const __wbg_set_b629c9b89ba1d25c = function(arg0, arg1, arg2) {
    getObject(arg0).set(getObject(arg1), arg2 >>> 0);
};

export const __wbg_newwithbyteoffsetandlength_ab2b53c614369e0e = function(arg0, arg1, arg2) {
    var ret = new Float32Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
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

