
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

let cachegetInt32Memory0 = null;
function getInt32Memory0() {
    if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== wasm.memory.buffer) {
        cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachegetInt32Memory0;
}

function makeMutClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            if (--state.cnt === 0) {
                wasm.__wbindgen_export_2.get(state.dtor)(a, state.b);

            } else {
                state.a = a;
            }
        }
    };
    real.original = state;

    return real;
}
function __wbg_adapter_20(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__ha16047fe2b41f5b3(arg0, arg1, addHeapObject(arg2));
}

function handleError(f) {
    return function () {
        try {
            return f.apply(this, arguments);

        } catch (e) {
            wasm.__wbindgen_exn_store(addHeapObject(e));
        }
    };
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
    return instance.ptr;
}
function __wbg_adapter_52(arg0, arg1, arg2, arg3) {
    wasm.wasm_bindgen__convert__closures__invoke2_mut__he36f630fe7d7c075(arg0, arg1, addHeapObject(arg2), addHeapObject(arg3));
}

/**
*/
export class CptvPlayerContext {

    static __wrap(ptr) {
        const obj = Object.create(CptvPlayerContext.prototype);
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
        wasm.__wbg_cptvplayercontext_free(ptr);
    }
    /**
    * @param {any} stream
    * @param {number} size
    * @returns {any}
    */
    static newWithStream(stream, size) {
        var ret = wasm.cptvplayercontext_newWithStream(addHeapObject(stream), size);
        return takeObject(ret);
    }
    /**
    * @returns {boolean}
    */
    streamComplete() {
        var ret = wasm.cptvplayercontext_streamComplete(this.ptr);
        return ret !== 0;
    }
    /**
    * @param {CptvPlayerContext} context
    * @param {number} frame_num
    * @returns {any}
    */
    static seekToFrame(context, frame_num) {
        _assertClass(context, CptvPlayerContext);
        var ptr0 = context.ptr;
        context.ptr = 0;
        var ret = wasm.cptvplayercontext_seekToFrame(ptr0, frame_num);
        return takeObject(ret);
    }
    /**
    * @returns {number}
    */
    totalFrames() {
        var ret = wasm.cptvplayercontext_totalFrames(this.ptr);
        return ret >>> 0;
    }
    /**
    * @returns {number}
    */
    bytesLoaded() {
        var ret = wasm.cptvplayercontext_bytesLoaded(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} n
    * @returns {any}
    */
    getFrameHeader(n) {
        var ret = wasm.cptvplayercontext_getFrameHeader(this.ptr, n);
        return takeObject(ret);
    }
    /**
    * @param {number} n
    * @returns {Uint16Array}
    */
    getRawFrameN(n) {
        var ret = wasm.cptvplayercontext_getRawFrameN(this.ptr, n);
        return takeObject(ret);
    }
    /**
    * @returns {Uint16Array}
    */
    getBackgroundFrame() {
        var ret = wasm.cptvplayercontext_getBackgroundFrame(this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {number}
    */
    getNumFrames() {
        var ret = wasm.cptvplayercontext_getNumFrames(this.ptr);
        return ret >>> 0;
    }
    /**
    * @returns {number}
    */
    getWidth() {
        var ret = wasm.cptvplayercontext_getWidth(this.ptr);
        return ret >>> 0;
    }
    /**
    * @returns {number}
    */
    getHeight() {
        var ret = wasm.cptvplayercontext_getHeight(this.ptr);
        return ret >>> 0;
    }
    /**
    * @returns {number}
    */
    getFrameRate() {
        var ret = wasm.cptvplayercontext_getFrameRate(this.ptr);
        return ret;
    }
    /**
    * @returns {number}
    */
    getFramesPerIframe() {
        var ret = wasm.cptvplayercontext_getFramesPerIframe(this.ptr);
        return ret;
    }
    /**
    * @returns {number}
    */
    getMinValue() {
        var ret = wasm.cptvplayercontext_getMinValue(this.ptr);
        return ret;
    }
    /**
    * @returns {number}
    */
    getMaxValue() {
        var ret = wasm.cptvplayercontext_getMaxValue(this.ptr);
        return ret;
    }
    /**
    * @param {CptvPlayerContext} context
    * @returns {any}
    */
    static fetchHeader(context) {
        _assertClass(context, CptvPlayerContext);
        var ptr0 = context.ptr;
        context.ptr = 0;
        var ret = wasm.cptvplayercontext_fetchHeader(ptr0);
        return takeObject(ret);
    }
    /**
    * @returns {any}
    */
    getHeader() {
        var ret = wasm.cptvplayercontext_getHeader(this.ptr);
        return takeObject(ret);
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
            return { instance, module };

        } else {
            return instance;
        }
    }
}

async function init(input) {
    if (typeof input === 'undefined') {
        input = new URL('index_bg.wasm', import.meta.url);
    }
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
    };
    imports.wbg.__wbg_new_3ea8490cd276c848 = function(arg0, arg1) {
        try {
            var state0 = {a: arg0, b: arg1};
            var cb0 = (arg0, arg1) => {
                const a = state0.a;
                state0.a = 0;
                try {
                    return __wbg_adapter_52(a, state0.b, arg0, arg1);
                } finally {
                    state0.a = a;
                }
            };
            var ret = new Promise(cb0);
            return addHeapObject(ret);
        } finally {
            state0.a = state0.b = 0;
        }
    };
    imports.wbg.__wbg_new_68adb0d58759a4ed = function() {
        var ret = new Object();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_set_2e79e744454afade = function(arg0, arg1, arg2) {
        getObject(arg0)[takeObject(arg1)] = takeObject(arg2);
    };
    imports.wbg.__wbg_newwithlength_90fbb2b2d057a3c0 = function(arg0) {
        var ret = new Uint16Array(arg0 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        var ret = getStringFromWasm0(arg0, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_number_new = function(arg0) {
        var ret = arg0;
        return addHeapObject(ret);
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
    imports.wbg.__wbg_read_2516fe8e4e56274e = handleError(function(arg0) {
        var ret = getObject(arg0).read();
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_then_ac66ca61394bfd21 = function(arg0, arg1, arg2) {
        var ret = getObject(arg0).then(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_boolean_get = function(arg0) {
        const v = getObject(arg0);
        var ret = typeof(v) === 'boolean' ? (v ? 1 : 0) : 2;
        return ret;
    };
    imports.wbg.__wbg_instanceof_Uint8Array_d7349a138407a31e = function(arg0) {
        var ret = getObject(arg0) instanceof Uint8Array;
        return ret;
    };
    imports.wbg.__wbg_byteLength_7d55aca7ec6c42cb = function(arg0) {
        var ret = getObject(arg0).byteLength;
        return ret;
    };
    imports.wbg.__wbg_length_317f0dd77f7a6673 = function(arg0) {
        var ret = getObject(arg0).length;
        return ret;
    };
    imports.wbg.__wbindgen_memory = function() {
        var ret = wasm.memory;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_buffer_ebc6c8e75510eae3 = function(arg0) {
        var ret = getObject(arg0).buffer;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_135e963dedf67b22 = function(arg0) {
        var ret = new Uint8Array(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_set_4a5072a31008e0cb = function(arg0, arg1, arg2) {
        getObject(arg0).set(getObject(arg1), arg2 >>> 0);
    };
    imports.wbg.__wbg_cptvplayercontext_new = function(arg0) {
        var ret = CptvPlayerContext.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_call_f5e0576f61ee7461 = handleError(function(arg0, arg1, arg2) {
        var ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_newwithbyteoffsetandlength_9eb3327abeac2c52 = function(arg0, arg1, arg2) {
        var ret = new Uint16Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_get_0c6963cbab34fbb6 = handleError(function(arg0, arg1) {
        var ret = Reflect.get(getObject(arg0), getObject(arg1));
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_new_7031805939a80203 = function(arg0, arg1) {
        var ret = new Error(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_object_clone_ref = function(arg0) {
        var ret = getObject(arg0);
        return addHeapObject(ret);
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
    imports.wbg.__wbindgen_cb_drop = function(arg0) {
        const obj = takeObject(arg0).original;
        if (obj.cnt-- == 1) {
            obj.a = 0;
            return true;
        }
        var ret = false;
        return ret;
    };
    imports.wbg.__wbg_then_367b3e718069cfb9 = function(arg0, arg1) {
        var ret = getObject(arg0).then(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_resolve_778af3f90b8e2b59 = function(arg0) {
        var ret = Promise.resolve(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_debug_3c0b82934d1dd91e = function(arg0) {
        console.debug(getObject(arg0));
    };
    imports.wbg.__wbg_error_9ff84d33a850b1ef = function(arg0) {
        console.error(getObject(arg0));
    };
    imports.wbg.__wbg_info_3b2058a219fa31b9 = function(arg0) {
        console.info(getObject(arg0));
    };
    imports.wbg.__wbg_log_386a8115a84a780d = function(arg0) {
        console.log(getObject(arg0));
    };
    imports.wbg.__wbg_warn_5fc232d538408d4a = function(arg0) {
        console.warn(getObject(arg0));
    };
    imports.wbg.__wbindgen_closure_wrapper238 = function(arg0, arg1, arg2) {
        var ret = makeMutClosure(arg0, arg1, 53, __wbg_adapter_20);
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

export default init;

