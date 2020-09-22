/******/ (function(modules) { // webpackBootstrap
/******/ 	// install a JSONP callback for chunk loading
/******/ 	function webpackJsonpCallback(data) {
/******/ 		var chunkIds = data[0];
/******/ 		var moreModules = data[1];
/******/ 		var executeModules = data[2];
/******/
/******/ 		// add "moreModules" to the modules object,
/******/ 		// then flag all "chunkIds" as loaded and fire callback
/******/ 		var moduleId, chunkId, i = 0, resolves = [];
/******/ 		for(;i < chunkIds.length; i++) {
/******/ 			chunkId = chunkIds[i];
/******/ 			if(Object.prototype.hasOwnProperty.call(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 				resolves.push(installedChunks[chunkId][0]);
/******/ 			}
/******/ 			installedChunks[chunkId] = 0;
/******/ 		}
/******/ 		for(moduleId in moreModules) {
/******/ 			if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
/******/ 				modules[moduleId] = moreModules[moduleId];
/******/ 			}
/******/ 		}
/******/ 		if(parentJsonpFunction) parentJsonpFunction(data);
/******/
/******/ 		while(resolves.length) {
/******/ 			resolves.shift()();
/******/ 		}
/******/
/******/ 		// add entry modules from loaded chunk to deferred list
/******/ 		deferredModules.push.apply(deferredModules, executeModules || []);
/******/
/******/ 		// run deferred modules when all chunks ready
/******/ 		return checkDeferredModules();
/******/ 	};
/******/ 	function checkDeferredModules() {
/******/ 		var result;
/******/ 		for(var i = 0; i < deferredModules.length; i++) {
/******/ 			var deferredModule = deferredModules[i];
/******/ 			var fulfilled = true;
/******/ 			for(var j = 1; j < deferredModule.length; j++) {
/******/ 				var depId = deferredModule[j];
/******/ 				if(installedChunks[depId] !== 0) fulfilled = false;
/******/ 			}
/******/ 			if(fulfilled) {
/******/ 				deferredModules.splice(i--, 1);
/******/ 				result = __webpack_require__(__webpack_require__.s = deferredModule[0]);
/******/ 			}
/******/ 		}
/******/
/******/ 		return result;
/******/ 	}
/******/
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// object to store loaded and loading chunks
/******/ 	// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 	// Promise = chunk loading, 0 = chunk loaded
/******/ 	var installedChunks = {
/******/ 		"app": 0
/******/ 	};
/******/
/******/ 	var deferredModules = [];
/******/
/******/ 	// script path function
/******/ 	function jsonpScriptSrc(chunkId) {
/******/ 		return __webpack_require__.p + "js/" + ({}[chunkId]||chunkId) + "." + {"chunk-2d843444":"e21bc1d7"}[chunkId] + ".js"
/******/ 	}
/******/
/******/ 	// object to store loaded and loading wasm modules
/******/ 	var installedWasmModules = {};
/******/
/******/ 	function promiseResolve() { return Promise.resolve(); }
/******/
/******/ 	var wasmImportObjects = {
/******/ 		"3826": function() {
/******/ 			return {
/******/ 				"./curve_fitting_bg.js": {
/******/ 					"__wbindgen_number_new": function(p0f64) {
/******/ 						return installedModules["f470"].exports["c"](p0f64);
/******/ 					},
/******/ 					"__wbindgen_object_drop_ref": function(p0i32) {
/******/ 						return installedModules["f470"].exports["d"](p0i32);
/******/ 					},
/******/ 					"__wbg_new_6b6f346b4912cdae": function() {
/******/ 						return installedModules["f470"].exports["a"]();
/******/ 					},
/******/ 					"__wbg_push_f353108e20ec67a0": function(p0i32,p1i32) {
/******/ 						return installedModules["f470"].exports["b"](p0i32,p1i32);
/******/ 					},
/******/ 					"__wbindgen_throw": function(p0i32,p1i32) {
/******/ 						return installedModules["f470"].exports["e"](p0i32,p1i32);
/******/ 					}
/******/ 				}
/******/ 			};
/******/ 		},
/******/ 	};
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
/******/ 	// This file contains only the entry chunk.
/******/ 	// The chunk loading function for additional chunks
/******/ 	__webpack_require__.e = function requireEnsure(chunkId) {
/******/ 		var promises = [];
/******/
/******/
/******/ 		// JSONP chunk loading for javascript
/******/
/******/ 		var installedChunkData = installedChunks[chunkId];
/******/ 		if(installedChunkData !== 0) { // 0 means "already installed".
/******/
/******/ 			// a Promise means "currently loading".
/******/ 			if(installedChunkData) {
/******/ 				promises.push(installedChunkData[2]);
/******/ 			} else {
/******/ 				// setup Promise in chunk cache
/******/ 				var promise = new Promise(function(resolve, reject) {
/******/ 					installedChunkData = installedChunks[chunkId] = [resolve, reject];
/******/ 				});
/******/ 				promises.push(installedChunkData[2] = promise);
/******/
/******/ 				// start chunk loading
/******/ 				var script = document.createElement('script');
/******/ 				var onScriptComplete;
/******/
/******/ 				script.charset = 'utf-8';
/******/ 				script.timeout = 120;
/******/ 				if (__webpack_require__.nc) {
/******/ 					script.setAttribute("nonce", __webpack_require__.nc);
/******/ 				}
/******/ 				script.src = jsonpScriptSrc(chunkId);
/******/
/******/ 				// create error before stack unwound to get useful stacktrace later
/******/ 				var error = new Error();
/******/ 				onScriptComplete = function (event) {
/******/ 					// avoid mem leaks in IE.
/******/ 					script.onerror = script.onload = null;
/******/ 					clearTimeout(timeout);
/******/ 					var chunk = installedChunks[chunkId];
/******/ 					if(chunk !== 0) {
/******/ 						if(chunk) {
/******/ 							var errorType = event && (event.type === 'load' ? 'missing' : event.type);
/******/ 							var realSrc = event && event.target && event.target.src;
/******/ 							error.message = 'Loading chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')';
/******/ 							error.name = 'ChunkLoadError';
/******/ 							error.type = errorType;
/******/ 							error.request = realSrc;
/******/ 							chunk[1](error);
/******/ 						}
/******/ 						installedChunks[chunkId] = undefined;
/******/ 					}
/******/ 				};
/******/ 				var timeout = setTimeout(function(){
/******/ 					onScriptComplete({ type: 'timeout', target: script });
/******/ 				}, 120000);
/******/ 				script.onerror = script.onload = onScriptComplete;
/******/ 				document.head.appendChild(script);
/******/ 			}
/******/ 		}
/******/
/******/ 		// Fetch + compile chunk loading for webassembly
/******/
/******/ 		var wasmModules = {"chunk-2d843444":["3826"]}[chunkId] || [];
/******/
/******/ 		wasmModules.forEach(function(wasmModuleId) {
/******/ 			var installedWasmModuleData = installedWasmModules[wasmModuleId];
/******/
/******/ 			// a Promise means "currently loading" or "already loaded".
/******/ 			if(installedWasmModuleData)
/******/ 				promises.push(installedWasmModuleData);
/******/ 			else {
/******/ 				var importObject = wasmImportObjects[wasmModuleId]();
/******/ 				var req = fetch(__webpack_require__.p + "" + {"3826":"f4cb4ffd0ca727aee03d"}[wasmModuleId] + ".module.wasm");
/******/ 				var promise;
/******/ 				if(importObject instanceof Promise && typeof WebAssembly.compileStreaming === 'function') {
/******/ 					promise = Promise.all([WebAssembly.compileStreaming(req), importObject]).then(function(items) {
/******/ 						return WebAssembly.instantiate(items[0], items[1]);
/******/ 					});
/******/ 				} else if(typeof WebAssembly.instantiateStreaming === 'function') {
/******/ 					promise = WebAssembly.instantiateStreaming(req, importObject);
/******/ 				} else {
/******/ 					var bytesPromise = req.then(function(x) { return x.arrayBuffer(); });
/******/ 					promise = bytesPromise.then(function(bytes) {
/******/ 						return WebAssembly.instantiate(bytes, importObject);
/******/ 					});
/******/ 				}
/******/ 				promises.push(installedWasmModules[wasmModuleId] = promise.then(function(res) {
/******/ 					return __webpack_require__.w[wasmModuleId] = (res.instance || res).exports;
/******/ 				}));
/******/ 			}
/******/ 		});
/******/ 		return Promise.all(promises);
/******/ 	};
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
/******/ 	// on error function for async loading
/******/ 	__webpack_require__.oe = function(err) { console.error(err); throw err; };
/******/
/******/ 	// object with all WebAssembly.instance exports
/******/ 	__webpack_require__.w = {};
/******/
/******/ 	var jsonpArray = window["webpackJsonp"] = window["webpackJsonp"] || [];
/******/ 	var oldJsonpFunction = jsonpArray.push.bind(jsonpArray);
/******/ 	jsonpArray.push = webpackJsonpCallback;
/******/ 	jsonpArray = jsonpArray.slice();
/******/ 	for(var i = 0; i < jsonpArray.length; i++) webpackJsonpCallback(jsonpArray[i]);
/******/ 	var parentJsonpFunction = oldJsonpFunction;
/******/
/******/
/******/ 	// add entry module to deferred list
/******/ 	deferredModules.push([0,"chunk-vendors"]);
/******/ 	// run deferred modules when ready
/******/ 	return checkDeferredModules();
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__("cd49");


/***/ }),

/***/ "28bd":
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "394c":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_19_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_UserFacingScreening_vue_vue_type_style_index_0_id_1ad9577b_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("28bd");
/* harmony import */ var _node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_19_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_UserFacingScreening_vue_vue_type_style_index_0_id_1ad9577b_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_19_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_UserFacingScreening_vue_vue_type_style_index_0_id_1ad9577b_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0__);
/* unused harmony reexport * */
 /* unused harmony default export */ var _unused_webpack_default_export = (_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_19_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_UserFacingScreening_vue_vue_type_style_index_0_id_1ad9577b_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "4316":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_19_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_CalibrationSettings_vue_vue_type_style_index_0_id_1277cae8_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("6ea6");
/* harmony import */ var _node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_19_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_CalibrationSettings_vue_vue_type_style_index_0_id_1277cae8_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_19_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_CalibrationSettings_vue_vue_type_style_index_0_id_1277cae8_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0__);
/* unused harmony reexport * */
 /* unused harmony default export */ var _unused_webpack_default_export = (_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_19_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_CalibrationSettings_vue_vue_type_style_index_0_id_1277cae8_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "4847":
/***/ (function(module, exports, __webpack_require__) {

module.exports = function() {
  return new Worker(__webpack_require__.p + "86153c533e1a89aab0bd.worker.js");
};

/***/ }),

/***/ "4c78":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_19_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_DeveloperUtilities_vue_vue_type_style_index_0_id_e0112a36_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("a314");
/* harmony import */ var _node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_19_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_DeveloperUtilities_vue_vue_type_style_index_0_id_e0112a36_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_19_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_DeveloperUtilities_vue_vue_type_style_index_0_id_e0112a36_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0__);
/* unused harmony reexport * */
 /* unused harmony default export */ var _unused_webpack_default_export = (_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_19_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_DeveloperUtilities_vue_vue_type_style_index_0_id_e0112a36_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "57d8":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_19_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_VideoCropControls_vue_vue_type_style_index_0_id_5307d942_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("c89f");
/* harmony import */ var _node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_19_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_VideoCropControls_vue_vue_type_style_index_0_id_5307d942_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_19_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_VideoCropControls_vue_vue_type_style_index_0_id_5307d942_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0__);
/* unused harmony reexport * */
 /* unused harmony default export */ var _unused_webpack_default_export = (_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_19_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_VideoCropControls_vue_vue_type_style_index_0_id_5307d942_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "5c0b":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_19_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_App_vue_vue_type_style_index_0_lang_scss___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("7694");
/* harmony import */ var _node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_19_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_App_vue_vue_type_style_index_0_lang_scss___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_19_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_App_vue_vue_type_style_index_0_lang_scss___WEBPACK_IMPORTED_MODULE_0__);
/* unused harmony reexport * */
 /* unused harmony default export */ var _unused_webpack_default_export = (_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_19_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_App_vue_vue_type_style_index_0_lang_scss___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "6ea6":
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "7694":
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "a314":
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "c89f":
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "cbfc":
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "cd49":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, "DEFAULT_THRESHOLD_MIN_FEVER", function() { return /* binding */ DEFAULT_THRESHOLD_MIN_FEVER; });
__webpack_require__.d(__webpack_exports__, "WARMUP_TIME_SECONDS", function() { return /* binding */ WARMUP_TIME_SECONDS; });
__webpack_require__.d(__webpack_exports__, "FFC_SAFETY_DURATION_SECONDS", function() { return /* binding */ FFC_SAFETY_DURATION_SECONDS; });
__webpack_require__.d(__webpack_exports__, "LerpAmount", function() { return /* binding */ LerpAmount; });
__webpack_require__.d(__webpack_exports__, "State", function() { return /* binding */ State; });

// EXTERNAL MODULE: ./node_modules/vue/dist/vue.runtime.esm.js
var vue_runtime_esm = __webpack_require__("2b0e");

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"73ad4bbd-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vuetify-loader/lib/loader.js??ref--19-0!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/App.vue?vue&type=template&id=7625a26b&
var render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-app',{attrs:{"id":"app"},on:{"skip-warmup":_vm.skipWarmup}},[_c('UserFacingScreening',{attrs:{"on-reference-device":_vm.isReferenceDevice,"state":_vm.appState.currentScreeningState,"screening-event":_vm.appState.currentScreeningEvent,"calibration":_vm.appState.currentCalibration,"face":_vm.appState.face,"warmup-seconds-remaining":_vm.remainingWarmupTime,"shapes":[_vm.prevShape, _vm.nextShape]}}),_c('v-dialog',{attrs:{"width":"500"},model:{value:(_vm.showSoftwareVersionUpdatedPrompt),callback:function ($$v) {_vm.showSoftwareVersionUpdatedPrompt=$$v},expression:"showSoftwareVersionUpdatedPrompt"}},[_c('v-card',[_c('v-card-title',[_vm._v(" This software has been updated. "+_vm._s(_vm.appVersion)+" ")]),_c('v-card-actions',{attrs:{"center":""}},[_c('v-btn',{attrs:{"text":""},on:{"click":function (e) { return (_vm.showSoftwareVersionUpdatedPrompt = false); }}},[_vm._v(" Proceed ")])],1)],1)],1),_c('v-snackbar',{model:{value:(_vm.showUpdatedCalibrationSnackbar),callback:function ($$v) {_vm.showUpdatedCalibrationSnackbar=$$v},expression:"showUpdatedCalibrationSnackbar"}},[_vm._v(" Calibration was updated ")]),(!_vm.isReferenceDevice)?_c('div',{staticClass:"debug-video"},[(_vm.appState.currentFrame)?_c('VideoStream',{attrs:{"frame":_vm.appState.currentFrame.frame,"face":_vm.appState.face,"min":_vm.appState.currentFrame.analysisResult.heatStats.min,"max":_vm.appState.currentFrame.analysisResult.heatStats.max,"crop-box":_vm.appState.currentCalibration.cropBox,"crop-enabled":false,"draw-overlays":false,"show-coords":false}}):_vm._e()],1):_vm._e()],1)}
var staticRenderFns = []


// CONCATENATED MODULE: ./src/App.vue?vue&type=template&id=7625a26b&

// EXTERNAL MODULE: ./node_modules/tslib/tslib.es6.js
var tslib_es6 = __webpack_require__("9ab4");

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"73ad4bbd-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vuetify-loader/lib/loader.js??ref--19-0!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/UserFacingScreening.vue?vue&type=template&id=1ad9577b&scoped=true&
var UserFacingScreeningvue_type_template_id_1ad9577b_scoped_true_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"user-state",class:[
    _vm.classNameForState,
    _vm.screeningResultClass,
    { 'mini-view': !_vm.onReferenceDevice }
  ],style:({ background: _vm.warmupBackgroundColour }),attrs:{"id":"user-facing-screening"},on:{"click":function($event){_vm.interacted = true}}},[(!_vm.isWarmingUp)?_c('canvas',{ref:"beziers",attrs:{"id":"beziers","width":"810","height":"1080"}}):_vm._e(),_c('div',{staticClass:"center",class:{ 'warming-up': _vm.isWarmingUp }},[(_vm.hasScreeningResult)?_c('div',{staticClass:"result"},[_vm._v(" "+_vm._s(_vm.temperature)+" ")]):_c('div',{domProps:{"innerHTML":_vm._s(_vm.messageText)}})]),(_vm.onReferenceDevice || _vm.isLocal)?_c('v-card',{staticClass:"settings-toggle-button",class:{ interacted: _vm.interacted },attrs:{"dark":"","flat":"","height":"44","tile":"","color":"transparent"}},[_c('v-card-actions',[_c('v-btn',{attrs:{"absolute":"","dark":"","fab":"","bottom":"","right":"","elevation":"0","color":"transparent"},on:{"click":function (e) {
            if (_vm.interacted) {
              _vm.showSettings = true;
              _vm.hasSettings = true;
            }
          }}},[_c('v-icon',{attrs:{"color":"rgba(255, 255, 255, 0.5)","large":""}},[_vm._v(_vm._s(_vm.cogIcon))])],1)],1)],1):_vm._e(),_c('v-dialog',{attrs:{"hide-overlay":"","attach":"#user-facing-screening","fullscreen":"","transition":"dialog-bottom-transition"},model:{value:(_vm.showSettings),callback:function ($$v) {_vm.showSettings=$$v},expression:"showSettings"}},[(_vm.hasSettings)?_c('AdminSettings',{on:{"closed":_vm.closedAdminSettings}}):_vm._e()],1)],1)}
var UserFacingScreeningvue_type_template_id_1ad9577b_scoped_true_staticRenderFns = []


// CONCATENATED MODULE: ./src/components/UserFacingScreening.vue?vue&type=template&id=1ad9577b&scoped=true&

// EXTERNAL MODULE: ./node_modules/vue-property-decorator/lib/vue-property-decorator.js + 1 modules
var vue_property_decorator = __webpack_require__("60a3");

// EXTERNAL MODULE: ./node_modules/@mdi/js/mdi.js
var mdi = __webpack_require__("94ed");

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
  ScreeningState["MEASURED"] = "MEASURED";
  ScreeningState["MISSING_THERMAL_REF"] = "MISSING_REF";
})(ScreeningState || (ScreeningState = {}));

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
// CONCATENATED MODULE: ./src/utils.ts
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
const ZeroCelsiusInKelvin = 273.15;
const mKToCelsius = mkVal => new DegreesCelsius(mkVal * 0.01 - ZeroCelsiusInKelvin);
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

      if (prevVersion.binaryVersion != binaryVersion || prevVersion.appVersion != appVersion) {
        if (shouldReloadIfChanged) {
          /*
          console.log(
            "reload because version changed",
            JSON.stringify(prevVersion),
            binaryVersion,
            appVersion
          );
          window.location.reload();
                       */
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
// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"73ad4bbd-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vuetify-loader/lib/loader.js??ref--19-0!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/AdminSettings.vue?vue&type=template&id=34541e83&scoped=true&
var AdminSettingsvue_type_template_id_34541e83_scoped_true_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-card',[_c('v-toolbar',{attrs:{"color":"light-blue","dark":""},scopedSlots:_vm._u([{key:"extension",fn:function(){return [_c('v-tabs',{attrs:{"centered":""},model:{value:(_vm.tab),callback:function ($$v) {_vm.tab=$$v},expression:"tab"}},_vm._l((_vm.tabItems),function(item){return _c('v-tab',{key:item.tab},[_vm._v(_vm._s(item.tab))])}),1)]},proxy:true}])},[_c('v-toolbar-title',[_vm._v("Settings")]),_c('v-spacer'),_c('v-btn',{attrs:{"text":""},on:{"click":_vm.close}},[_vm._v(" close ")])],1),_c('v-tabs-items',{attrs:{"touchless":""},model:{value:(_vm.tab),callback:function ($$v) {_vm.tab=$$v},expression:"tab"}},_vm._l((_vm.tabItems),function(item){return _c('v-tab-item',{key:item.tab},[_c(item.content,{tag:"component"})],1)}),1)],1)}
var AdminSettingsvue_type_template_id_34541e83_scoped_true_staticRenderFns = []


// CONCATENATED MODULE: ./src/components/AdminSettings.vue?vue&type=template&id=34541e83&scoped=true&

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"73ad4bbd-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vuetify-loader/lib/loader.js??ref--19-0!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/CalibrationSettings.vue?vue&type=template&id=1277cae8&scoped=true&
var CalibrationSettingsvue_type_template_id_1277cae8_scoped_true_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-card',{attrs:{"height":"calc(100vh - 112px)"}},[_c('v-container',{staticClass:"cont"},[_c('v-card',{staticClass:"split",attrs:{"flat":""}},[_c('v-card',[(_vm.state.currentFrame)?_c('VideoStream',{attrs:{"frame":_vm.state.currentFrame.frame,"face":_vm.state.face,"crop-box":_vm.editedCropBox,"min":_vm.state.currentFrame.analysisResult.heatStats.min,"max":_vm.state.currentFrame.analysisResult.heatStats.max,"crop-enabled":true},on:{"crop-changed":_vm.onCropChanged}}):_vm._e()],1),_c('v-card',{staticClass:"settings",attrs:{"width":"700"}},[_c('v-card-title',[_vm._v(" Calibration: "+_vm._s(_vm.pendingCalibration)+" "),_c('v-btn',{attrs:{"text":"","disabled":!_vm.canCalibrate},on:{"click":function($event){$event.stopPropagation();return (function () { return _vm.editCalibration(); })($event)}}},[_c('v-icon',{attrs:{"color":"#999","small":""}},[_vm._v(_vm._s(_vm.pencilIcon))]),_vm._v(" Edit ")],1)],1),_c('v-dialog',{attrs:{"max-width":"400"},model:{value:(_vm.showCalibrationDialog),callback:function ($$v) {_vm.showCalibrationDialog=$$v},expression:"showCalibrationDialog"}},[_c('v-card',[_c('v-card-title',[_vm._v("Edit calibration")]),_c('v-container',[(_vm.snapshotScreeningEvent)?_c('VideoStream',{attrs:{"frame":_vm.snapshotScreeningEvent.frame.frame,"face":_vm.snapshotScreeningEvent.face,"min":_vm.state.currentFrame.analysisResult.heatStats.min,"max":_vm.state.currentFrame.analysisResult.heatStats.max,"crop-box":_vm.state.currentCalibration.cropBox,"crop-enabled":false,"draw-overlays":true,"scale":0.6}}):_vm._e()],1),_c('v-card-subtitle',[_vm._v(" Take your temperature and enter it here to calibrate the system against the current screening event. ")]),_c('v-card-text',[_c('v-text-field',{attrs:{"label":"calibrated temperature","value":_vm.editedCalibration},on:{"blur":_vm.updateCalibration}}),_c('v-card-actions',[_c('v-btn',{on:{"click":function () { return _vm.incrementCalibration(0.1); }}},[_c('v-icon',{attrs:{"light":""}},[_vm._v(_vm._s(_vm.plusIcon))])],1),_c('v-spacer'),_c('v-btn',{on:{"click":function () { return _vm.incrementCalibration(-0.1); }}},[_c('v-icon',{attrs:{"light":""}},[_vm._v(_vm._s(_vm.minusIcon))])],1)],1)],1),_c('v-card-actions',[_c('v-spacer'),_c('v-btn',{attrs:{"text":"","color":"grey darken-1"},on:{"click":function($event){_vm.showCalibrationDialog = false}}},[_vm._v(" Cancel ")]),_c('v-btn',{attrs:{"text":"","color":"green darken-1"},on:{"click":function (e) { return _vm.acceptCalibration(); }}},[_vm._v(" Accept ")])],1)],1)],1),_c('v-card-text',[_c('v-checkbox',{attrs:{"label":"Use custom alert threshold"},on:{"change":_vm.toggleCustomTemperatureThresholds},model:{value:(_vm.useCustomTemperatureRange),callback:function ($$v) {_vm.useCustomTemperatureRange=$$v},expression:"useCustomTemperatureRange"}}),_c('v-card-text',[_c('v-slider',{attrs:{"disabled":!_vm.useCustomTemperatureRange,"min":"30","max":"40","step":"0.1","thumb-label":"","ticks":true,"color":'green',"track-color":'rgba(255, 0, 0, 0.25)'},model:{value:(_vm.editedTemperatureThreshold),callback:function ($$v) {_vm.editedTemperatureThreshold=$$v},expression:"editedTemperatureThreshold"}}),_c('span',{staticClass:"selected-temp-range",domProps:{"innerHTML":_vm._s(_vm.selectedTemperatureRange)}})],1)],1),_c('v-card-title',[_vm._v("Sounds:")]),_c('v-container',{attrs:{"fluid":"","width":"100%"}},[_c('v-row',[_c('v-col',{attrs:{"cols":"4"}},[_c('v-switch',{attrs:{"label":"Play normal sound"},model:{value:(_vm.playNormalSound),callback:function ($$v) {_vm.playNormalSound=$$v},expression:"playNormalSound"}})],1),_c('v-col',{attrs:{"cols":"4"}},[_c('v-switch',{attrs:{"label":"Play warning sound"},model:{value:(_vm.playWarningSound),callback:function ($$v) {_vm.playWarningSound=$$v},expression:"playWarningSound"}})],1),_c('v-col',{attrs:{"cols":"4"}},[_c('v-switch',{attrs:{"label":"Play error sound"},model:{value:(_vm.playErrorSound),callback:function ($$v) {_vm.playErrorSound=$$v},expression:"playErrorSound"}})],1)],1)],1)],1)],1),_c('v-overlay',{attrs:{"value":_vm.saving,"light":""}},[_vm._v(" Saving settings ")]),_c('v-card-actions',{staticClass:"bottom-nav"},[_c('v-btn',{attrs:{"text":"","disabled":!_vm.hasMadeEdits},on:{"click":function (e) { return _vm.resetEdits(); }}},[_vm._v(" Discard changes ")]),_c('v-btn',{attrs:{"text":"","disabled":!_vm.hasMadeEdits},on:{"click":function (e) { return _vm.saveEdits(); }}},[_vm._v(" Save changes ")])],1)],1)],1)}
var CalibrationSettingsvue_type_template_id_1277cae8_scoped_true_staticRenderFns = []


// CONCATENATED MODULE: ./src/components/CalibrationSettings.vue?vue&type=template&id=1277cae8&scoped=true&

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"73ad4bbd-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vuetify-loader/lib/loader.js??ref--19-0!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/VideoStream.vue?vue&type=template&id=6b993736&scoped=true&
var VideoStreamvue_type_template_id_6b993736_scoped_true_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{ref:"container",class:{ recording: _vm.recording },attrs:{"id":"video-stream-container"}},[_c('canvas',{ref:"cameraStream",attrs:{"id":"camera-stream","width":"160","height":"120"}}),_c('canvas',{ref:"vizOverlay",attrs:{"id":"debug-overlay","width":"480","height":"640"}}),(_vm.canEditCropping && _vm.cropEnabled)?_c('video-crop-controls',{attrs:{"crop-box":_vm.cropBox},on:{"crop-changed":_vm.gotCropChange}}):_vm._e(),(_vm.cropEnabled)?_c('v-btn',{class:{ on: _vm.canEditCropping },attrs:{"text":"","title":"Edit cropping","id":"toggle-cropping","dark":""},on:{"click":_vm.toggleCropping}},[_c('v-icon',[_vm._v(_vm._s(_vm.cropIcon))])],1):_vm._e(),(_vm.showCoords)?_c('p',{staticClass:"coords"},[_vm._v("("+_vm._s(_vm.coords.x)+", "+_vm._s(_vm.coords.y)+")")]):_vm._e()],1)}
var VideoStreamvue_type_template_id_6b993736_scoped_true_staticRenderFns = []


// CONCATENATED MODULE: ./src/components/VideoStream.vue?vue&type=template&id=6b993736&scoped=true&

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"73ad4bbd-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vuetify-loader/lib/loader.js??ref--19-0!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/VideoCropControls.vue?vue&type=template&id=5307d942&scoped=true&
var VideoCropControlsvue_type_template_id_5307d942_scoped_true_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{ref:"box",attrs:{"id":"fov-box"}},[_c('div',[_c('div',{ref:"top",staticClass:"fov-handle",attrs:{"id":"top-handle"},on:{"mousedown":function (e) { return _vm.startDrag(e); },"mouseup":function (e) { return _vm.endDrag(e); },"touchstart":function (e) { return _vm.startDrag(e); },"touchend":function (e) { return _vm.endDrag(e); }}},[_c('svg',{attrs:{"xmlns":"http://www.w3.org/2000/svg","viewBox":"0 0 256 512"}},[_c('path',{attrs:{"fill":"currentColor","d":"M214.059 377.941H168V134.059h46.059c21.382 0 32.09-25.851 16.971-40.971L144.971 7.029c-9.373-9.373-24.568-9.373-33.941 0L24.971 93.088c-15.119 15.119-4.411 40.971 16.971 40.971H88v243.882H41.941c-21.382 0-32.09 25.851-16.971 40.971l86.059 86.059c9.373 9.373 24.568 9.373 33.941 0l86.059-86.059c15.12-15.119 4.412-40.971-16.97-40.971z"}})])]),_c('div',{ref:"left",staticClass:"fov-handle",attrs:{"id":"left-handle"},on:{"mousedown":function (e) { return _vm.startDrag(e); },"mouseup":function (e) { return _vm.endDrag(e); },"touchstart":function (e) { return _vm.startDrag(e); },"touchend":function (e) { return _vm.endDrag(e); }}},[_c('svg',{attrs:{"xmlns":"http://www.w3.org/2000/svg","viewBox":"0 0 512 512"}},[_c('path',{attrs:{"fill":"currentColor","d":"M377.941 169.941V216H134.059v-46.059c0-21.382-25.851-32.09-40.971-16.971L7.029 239.029c-9.373 9.373-9.373 24.568 0 33.941l86.059 86.059c15.119 15.119 40.971 4.411 40.971-16.971V296h243.882v46.059c0 21.382 25.851 32.09 40.971 16.971l86.059-86.059c9.373-9.373 9.373-24.568 0-33.941l-86.059-86.059c-15.119-15.12-40.971-4.412-40.971 16.97z"}})])]),_c('div',{ref:"right",staticClass:"fov-handle",attrs:{"id":"right-handle"},on:{"mousedown":function (e) { return _vm.startDrag(e); },"mouseup":function (e) { return _vm.endDrag(e); },"touchstart":function (e) { return _vm.startDrag(e); },"touchend":function (e) { return _vm.endDrag(e); }}},[_c('svg',{attrs:{"xmlns":"http://www.w3.org/2000/svg","viewBox":"0 0 512 512"}},[_c('path',{attrs:{"fill":"currentColor","d":"M377.941 169.941V216H134.059v-46.059c0-21.382-25.851-32.09-40.971-16.971L7.029 239.029c-9.373 9.373-9.373 24.568 0 33.941l86.059 86.059c15.119 15.119 40.971 4.411 40.971-16.971V296h243.882v46.059c0 21.382 25.851 32.09 40.971 16.971l86.059-86.059c9.373-9.373 9.373-24.568 0-33.941l-86.059-86.059c-15.119-15.12-40.971-4.412-40.971 16.97z"}})])]),_c('div',{ref:"bottom",staticClass:"fov-handle",attrs:{"id":"bottom-handle"},on:{"mousedown":function (e) { return _vm.startDrag(e); },"mouseup":function (e) { return _vm.endDrag(e); },"touchstart":function (e) { return _vm.startDrag(e); },"touchend":function (e) { return _vm.endDrag(e); }}},[_c('svg',{attrs:{"xmlns":"http://www.w3.org/2000/svg","viewBox":"0 0 256 512"}},[_c('path',{attrs:{"fill":"currentColor","d":"M214.059 377.941H168V134.059h46.059c21.382 0 32.09-25.851 16.971-40.971L144.971 7.029c-9.373-9.373-24.568-9.373-33.941 0L24.971 93.088c-15.119 15.119-4.411 40.971 16.971 40.971H88v243.882H41.941c-21.382 0-32.09 25.851-16.971 40.971l86.059 86.059c9.373 9.373 24.568 9.373 33.941 0l86.059-86.059c15.12-15.119 4.412-40.971-16.97-40.971z"}})])])])])}
var VideoCropControlsvue_type_template_id_5307d942_scoped_true_staticRenderFns = []


// CONCATENATED MODULE: ./src/components/VideoCropControls.vue?vue&type=template&id=5307d942&scoped=true&

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--13-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/ts-loader??ref--13-3!./node_modules/vuetify-loader/lib/loader.js??ref--19-0!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/VideoCropControls.vue?vue&type=script&lang=ts&


let VideoCropControlsvue_type_script_lang_ts_VideoCropControls = class VideoCropControls extends vue_property_decorator["d" /* Vue */] {
  constructor() {
    super(...arguments);
    this.currentTarget = null;
    this.boundDragHandle = null;
    this.boundEndDrag = null;
  }

  created() {
    this.boundEndDrag = this.endDrag.bind(this);
    window.addEventListener("mouseup", this.boundEndDrag);
    window.addEventListener("touchend", this.boundEndDrag);
  }

  mounted() {
    const {
      top,
      left,
      right,
      bottom
    } = this.cropBox; // Set the initial handle positions:

    this.$refs.top.style.top = `${top}%`;
    this.$refs.right.style.right = `${right}%`;
    this.$refs.bottom.style.bottom = `${bottom}%`;
    this.$refs.left.style.left = `${left}%`;
    let offset = top + (100 - (bottom + top)) * 0.5;
    this.$refs.left.style.top = `${offset}%`;
    this.$refs.right.style.top = `${offset}%`;
    offset = left + (100 - (left + right)) * 0.5;
    this.$refs.top.style.left = `${offset}%`;
    this.$refs.bottom.style.left = `${offset}%`;
  }

  beforeDestroy() {
    if (this.boundEndDrag) {
      window.removeEventListener("mouseup", this.boundEndDrag);
      window.removeEventListener("touchend", this.boundEndDrag);
    }
  }

  startDrag(event) {
    if (this.boundDragHandle === null) {
      this.boundDragHandle = this.dragHandle.bind(this);
    }

    const eventName = event.type === "mousedown" ? "mousemove" : "touchmove";
    this.currentTarget = event.target;

    if (this.boundDragHandle) {
      window.addEventListener(eventName, this.boundDragHandle);
    }
  }

  endDrag(event) {
    const eventName = event.type === "mouseup" ? "mousemove" : "touchmove";
    this.currentTarget = null;

    if (this.boundDragHandle) {
      window.removeEventListener(eventName, this.boundDragHandle);
    }
  }

  dragHandle(event) {
    const cropBox = this.cropBox;
    const cropTopHandle = this.$refs.top;
    const cropRightHandle = this.$refs.right;
    const cropBottomHandle = this.$refs.bottom;
    const cropLeftHandle = this.$refs.left;
    let position;

    if (!(event instanceof MouseEvent)) {
      position = event.touches[0];
    } else {
      position = event;
    }

    const {
      clientX: x,
      clientY: y
    } = position;
    const minDimensions = 20;
    let maxInsetPercentage = 35;
    const bounds = this.$refs.box.getBoundingClientRect();
    let offset;

    if (this.currentTarget) {
      const l = "left";
      const r = "right";

      switch (this.currentTarget.id) {
        case "top-handle":
          maxInsetPercentage = 100 - (cropBox.bottom + minDimensions);
          cropBox.top = Math.min(maxInsetPercentage, Math.max(0, 100 * ((y - bounds.top) / bounds.height)));
          cropTopHandle.style.top = `${cropBox.top}%`;
          offset = cropBox.top + (100 - (cropBox.bottom + cropBox.top)) * 0.5;
          cropLeftHandle.style.top = `${offset}%`;
          cropRightHandle.style.top = `${offset}%`;
          break;

        case "right-handle":
          maxInsetPercentage = 100 - (cropBox[l] + minDimensions);
          cropBox[r] = Math.min(maxInsetPercentage, Math.max(0, 100 * ((bounds.right - x) / bounds.width)));
          cropRightHandle.style.right = `${cropBox[r]}%`;
          offset = cropBox[l] + (100 - (cropBox[l] + cropBox[r])) * 0.5;
          cropTopHandle.style.left = `${offset}%`;
          cropBottomHandle.style.left = `${offset}%`;
          break;

        case "bottom-handle":
          maxInsetPercentage = 100 - (cropBox.top + minDimensions);
          cropBox.bottom = Math.min(maxInsetPercentage, Math.max(0, 100 * ((bounds.bottom - y) / bounds.height)));
          cropBottomHandle.style.bottom = `${cropBox.bottom}%`;
          offset = cropBox.top + (100 - (cropBox.bottom + cropBox.top)) * 0.5;
          cropLeftHandle.style.top = `${offset}%`;
          cropRightHandle.style.top = `${offset}%`;
          break;

        case "left-handle":
          maxInsetPercentage = 100 - (cropBox[r] + minDimensions);
          cropBox[l] = Math.min(maxInsetPercentage, Math.max(0, 100 * ((x - bounds.left) / bounds.width)));
          cropLeftHandle.style.left = `${cropBox[l]}%`;
          offset = cropBox[l] + (100 - (cropBox[l] + cropBox[r])) * 0.5;
          cropTopHandle.style.left = `${offset}%`;
          cropBottomHandle.style.left = `${offset}%`;
          break;
      } // Update saved fovBox:


      this.$emit("crop-changed", cropBox);
      this.$parent.$emit("crop-changed", cropBox);
    }
  }

};

Object(tslib_es6["a" /* __decorate */])([Object(vue_property_decorator["c" /* Prop */])({
  required: true
})], VideoCropControlsvue_type_script_lang_ts_VideoCropControls.prototype, "cropBox", void 0);

VideoCropControlsvue_type_script_lang_ts_VideoCropControls = Object(tslib_es6["a" /* __decorate */])([vue_property_decorator["a" /* Component */]], VideoCropControlsvue_type_script_lang_ts_VideoCropControls);
/* harmony default export */ var VideoCropControlsvue_type_script_lang_ts_ = (VideoCropControlsvue_type_script_lang_ts_VideoCropControls);
// CONCATENATED MODULE: ./src/components/VideoCropControls.vue?vue&type=script&lang=ts&
 /* harmony default export */ var components_VideoCropControlsvue_type_script_lang_ts_ = (VideoCropControlsvue_type_script_lang_ts_); 
// EXTERNAL MODULE: ./src/components/VideoCropControls.vue?vue&type=style&index=0&id=5307d942&scoped=true&lang=scss&
var VideoCropControlsvue_type_style_index_0_id_5307d942_scoped_true_lang_scss_ = __webpack_require__("57d8");

// EXTERNAL MODULE: ./node_modules/vue-loader/lib/runtime/componentNormalizer.js
var componentNormalizer = __webpack_require__("2877");

// CONCATENATED MODULE: ./src/components/VideoCropControls.vue






/* normalize component */

var component = Object(componentNormalizer["a" /* default */])(
  components_VideoCropControlsvue_type_script_lang_ts_,
  VideoCropControlsvue_type_template_id_5307d942_scoped_true_render,
  VideoCropControlsvue_type_template_id_5307d942_scoped_true_staticRenderFns,
  false,
  null,
  "5307d942",
  null
  
)

/* harmony default export */ var components_VideoCropControls = (component.exports);
// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--13-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/ts-loader??ref--13-3!./node_modules/vuetify-loader/lib/loader.js??ref--19-0!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/VideoStream.vue?vue&type=script&lang=ts&




let VideoStreamvue_type_script_lang_ts_VideoStream = class VideoStream extends vue_property_decorator["d" /* Vue */] {
  constructor() {
    super(...arguments);
    this.canEditCropping = false;
    this.coords = {
      x: 0,
      y: 0
    };
  }

  get cropIcon() {
    return mdi["b" /* mdiCrop */];
  }

  mounted() {
    const container = this.$refs.container;
    container.style.width = `${375 * this.scale}px`;
    container.style.height = `${500 * this.scale}px`;

    if (this.showCoords) {
      container.addEventListener("mousemove", this.onMouseMove);
    }

    if (this.frame) {
      this.onFrameUpdate(this.frame);
      this.updateOverlayCanvas();
    }
  }

  onMouseMove(e) {
    const rect = e.target.getBoundingClientRect();
    const x = Math.floor(Math.min((e.clientX - rect.x) / rect.width * 120, 119));
    const y = Math.floor(Math.min((e.clientY - rect.y) / rect.height * 160, 159));
    this.coords = {
      x,
      y
    };
  }

  beforeDestroy() {
    if (this.showCoords) {
      this.$refs.container.removeEventListener("mousemove", this.onMouseMove);
    }
  }

  updateOverlayCanvas() {
    const underlay = this.$refs.cameraStream;
    const canvas = this.$refs.vizOverlay;
    const canvasWidth = canvas.width * window.devicePixelRatio;
    const canvasHeight = canvas.height * window.devicePixelRatio;
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvasWidth, canvasHeight);

    if (this.drawOverlays) {
      context.save();
      const scaleX = canvasWidth / (underlay.height * window.devicePixelRatio);
      const scaleY = canvasHeight / (underlay.width * window.devicePixelRatio);
      context.scale(scaleX, scaleY);
      const face = this.face;

      if (face) {
        // Now find the hotspot - only if we have a good lock!
        context.lineWidth = 0.25;

        if (face.isValid) {
          let valid = face.isValid;

          if (face.headLock >= 1.0) {
            context.strokeStyle = "red";
            context.lineWidth = 0.5;
          } else if (face.headLock === 0.5) {
            context.strokeStyle = "blue";
          } else {
            context.strokeStyle = "orange";
            valid = false;
          }

          if (valid) {
            const point = face.samplePoint;
            context.beginPath();
            context.strokeStyle = "rgba(255, 0, 0, 0.7)";
            context.lineWidth = 1;
            context.arc(point.x - 0.5, point.y - 0.5, 2, 0, Math.PI * 2);
            context.stroke();
            context.beginPath();
            context.moveTo(face.head.bottomLeft.x, face.head.bottomLeft.y);
            context.lineTo(face.head.topLeft.x, face.head.topLeft.y);
            context.lineTo(face.head.topRight.x, face.head.topRight.y);
            context.lineTo(face.head.bottomRight.x, face.head.bottomRight.y);
            context.lineTo(face.head.bottomLeft.x, face.head.bottomLeft.y);
            context.stroke();
          }
        }
      }

      context.restore();
    }

    context.save();

    if (this.cropBox) {
      // Update crop-box overlay:
      const cropBox = this.cropBoxPixelBounds;
      const overlay = new Path2D();
      context.scale(1, 1);
      const width = canvas.width;
      const height = canvas.height;
      overlay.rect(0, 0, width, height);
      const ratio = width / underlay.height;
      overlay.rect(cropBox.x0 * ratio, cropBox.y0 * ratio, (cropBox.x1 - cropBox.x0) * ratio, (cropBox.y1 - cropBox.y0) * ratio);
      context.fillStyle = "rgba(0, 0, 0, 0.5)";
      context.fill(overlay, "evenodd");
    }

    context.restore();
  }

  get cropBoxPixelBounds() {
    const cropBox = this.cropBox;
    let width = 120;
    let height = 160;
    const onePercentWidth = width / 100;
    const onePercentHeight = height / 100;
    const bounds = {
      x0: Math.floor(onePercentWidth * cropBox.left),
      x1: width - Math.floor(onePercentWidth * cropBox.right),
      y0: Math.floor(onePercentHeight * cropBox.top),
      y1: height - Math.floor(onePercentHeight * cropBox.bottom)
    };
    return bounds;
  }

  toggleCropping() {
    this.canEditCropping = !this.canEditCropping;

    if (!this.canEditCropping) {
      this.saveCropChanges();
    }
  }

  saveCropChanges() {
    this.$parent.$emit("save-crop-changes");
  }

  onFrameUpdate(next) {
    const canvas = this.$refs.cameraStream;
    const context = canvas.getContext("2d");
    const imgData = context.getImageData(0, 0, canvas.width, canvas.height);
    const frameData = next;
    const max = this.max;
    const min = this.min;

    if (min !== Number.MAX_SAFE_INTEGER) {
      const data = new Uint32Array(imgData.data.buffer);
      const range = max - min;

      for (let i = 0; i < data.length; i++) {
        const v = Math.max(0, Math.min(255, (frameData[i] - min) / range * 255.0));
        data[i] = 255 << 24 | v << 16 | v << 8 | v;
      }

      context.putImageData(imgData, 0, 0);
    }
  }

  onFaceChanged() {
    this.updateOverlayCanvas();
  }

  onThermalReferenceChanged() {
    this.updateOverlayCanvas();
  }

  onCropChanged() {
    this.updateOverlayCanvas();
  }

  gotCropChange(cropBox) {
    this.updateOverlayCanvas();
    return cropBox;
  }

};

Object(tslib_es6["a" /* __decorate */])([Object(vue_property_decorator["c" /* Prop */])()], VideoStreamvue_type_script_lang_ts_VideoStream.prototype, "frame", void 0);

Object(tslib_es6["a" /* __decorate */])([Object(vue_property_decorator["c" /* Prop */])({
  required: true
})], VideoStreamvue_type_script_lang_ts_VideoStream.prototype, "min", void 0);

Object(tslib_es6["a" /* __decorate */])([Object(vue_property_decorator["c" /* Prop */])({
  required: true
})], VideoStreamvue_type_script_lang_ts_VideoStream.prototype, "max", void 0);

Object(tslib_es6["a" /* __decorate */])([Object(vue_property_decorator["c" /* Prop */])({
  required: true
})], VideoStreamvue_type_script_lang_ts_VideoStream.prototype, "face", void 0);

Object(tslib_es6["a" /* __decorate */])([Object(vue_property_decorator["c" /* Prop */])({
  required: true
})], VideoStreamvue_type_script_lang_ts_VideoStream.prototype, "cropBox", void 0);

Object(tslib_es6["a" /* __decorate */])([Object(vue_property_decorator["c" /* Prop */])({
  required: true
})], VideoStreamvue_type_script_lang_ts_VideoStream.prototype, "cropEnabled", void 0);

Object(tslib_es6["a" /* __decorate */])([Object(vue_property_decorator["c" /* Prop */])({
  default: 1.0
})], VideoStreamvue_type_script_lang_ts_VideoStream.prototype, "scale", void 0);

Object(tslib_es6["a" /* __decorate */])([Object(vue_property_decorator["c" /* Prop */])({
  default: false
})], VideoStreamvue_type_script_lang_ts_VideoStream.prototype, "drawOverlays", void 0);

Object(tslib_es6["a" /* __decorate */])([Object(vue_property_decorator["c" /* Prop */])({
  default: false
})], VideoStreamvue_type_script_lang_ts_VideoStream.prototype, "recording", void 0);

Object(tslib_es6["a" /* __decorate */])([Object(vue_property_decorator["c" /* Prop */])({
  default: false
})], VideoStreamvue_type_script_lang_ts_VideoStream.prototype, "showCoords", void 0);

Object(tslib_es6["a" /* __decorate */])([Object(vue_property_decorator["e" /* Watch */])("frame")], VideoStreamvue_type_script_lang_ts_VideoStream.prototype, "onFrameUpdate", null);

Object(tslib_es6["a" /* __decorate */])([Object(vue_property_decorator["e" /* Watch */])("face")], VideoStreamvue_type_script_lang_ts_VideoStream.prototype, "onFaceChanged", null);

Object(tslib_es6["a" /* __decorate */])([Object(vue_property_decorator["e" /* Watch */])("thermalReference")], VideoStreamvue_type_script_lang_ts_VideoStream.prototype, "onThermalReferenceChanged", null);

Object(tslib_es6["a" /* __decorate */])([Object(vue_property_decorator["e" /* Watch */])("cropBox")], VideoStreamvue_type_script_lang_ts_VideoStream.prototype, "onCropChanged", null);

Object(tslib_es6["a" /* __decorate */])([Object(vue_property_decorator["b" /* Emit */])("crop-changed")], VideoStreamvue_type_script_lang_ts_VideoStream.prototype, "gotCropChange", null);

VideoStreamvue_type_script_lang_ts_VideoStream = Object(tslib_es6["a" /* __decorate */])([Object(vue_property_decorator["a" /* Component */])({
  components: {
    VideoCropControls: components_VideoCropControls
  }
})], VideoStreamvue_type_script_lang_ts_VideoStream);
/* harmony default export */ var VideoStreamvue_type_script_lang_ts_ = (VideoStreamvue_type_script_lang_ts_VideoStream);
// CONCATENATED MODULE: ./src/components/VideoStream.vue?vue&type=script&lang=ts&
 /* harmony default export */ var components_VideoStreamvue_type_script_lang_ts_ = (VideoStreamvue_type_script_lang_ts_); 
// EXTERNAL MODULE: ./src/components/VideoStream.vue?vue&type=style&index=0&id=6b993736&scoped=true&lang=scss&
var VideoStreamvue_type_style_index_0_id_6b993736_scoped_true_lang_scss_ = __webpack_require__("e10f");

// EXTERNAL MODULE: ./node_modules/vuetify-loader/lib/runtime/installComponents.js
var installComponents = __webpack_require__("6544");
var installComponents_default = /*#__PURE__*/__webpack_require__.n(installComponents);

// EXTERNAL MODULE: ./node_modules/vuetify/lib/components/VBtn/VBtn.js + 1 modules
var VBtn = __webpack_require__("8336");

// EXTERNAL MODULE: ./node_modules/vuetify/lib/components/VIcon/VIcon.js
var VIcon = __webpack_require__("132d");

// CONCATENATED MODULE: ./src/components/VideoStream.vue






/* normalize component */

var VideoStream_component = Object(componentNormalizer["a" /* default */])(
  components_VideoStreamvue_type_script_lang_ts_,
  VideoStreamvue_type_template_id_6b993736_scoped_true_render,
  VideoStreamvue_type_template_id_6b993736_scoped_true_staticRenderFns,
  false,
  null,
  "6b993736",
  null
  
)

/* harmony default export */ var components_VideoStream = (VideoStream_component.exports);

/* vuetify-loader */



installComponents_default()(VideoStream_component, {VBtn: VBtn["a" /* default */],VIcon: VIcon["a" /* default */]})

// CONCATENATED MODULE: ./src/api/api.ts
const FAKE_THERMAL_CAMERA_SERVER = "http://localhost:2040";
const API_BASE = "https://ixg63w0770.execute-api.ap-southeast-2.amazonaws.com/event";
const ScreeningApi = {
  async recordScreeningEvent(deviceName, deviceId, data) {
    const request = fetch(API_BASE, {
      method: "POST",
      body: JSON.stringify({
        CameraID: `${deviceName}|${deviceId}|${data.frame.frameInfo.Camera.CameraSerial}`,
        Type: "Screen",
        Timestamp: data.timestamp.toISOString().replace(/:/g, "_").replace(/\./g, "_"),
        TemperatureRawValue: Math.round(data.rawTemperatureValue),
        RefTemperatureValue: data.thermalReference.val,
        AppVersion: data.frame.frameInfo.AppVersion,
        Meta: {
          Sample: {
            x: data.sampleX,
            y: data.sampleY
          },
          Telemetry: data.frame.frameInfo.Telemetry
        }
      })
    });
    const response = await request;
    const presignedUrl = await response.text(); // Based on the user, we find out whether or not to upload a reference image.

    if (presignedUrl) {
      // Upload to s3
      fetch(presignedUrl, {
        method: "PUT",
        body: data.frame.frame,
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Encoding': 'utf8'
        }
      });
    }
  },

  async recordCalibrationEvent(deviceName, deviceId, calibration, frame, x, y) {
    const cameraSerial = frame.frameInfo.Camera.CameraSerial;
    const appVersion = frame.frameInfo.AppVersion;
    const calibrationPayload = {
      CameraID: `${deviceName}|${deviceId}|${cameraSerial}`,
      Type: "Calibrate",
      Timestamp: calibration.timestamp.toISOString().replace(/:/g, "_").replace(/\./g, "_"),
      CalibratedTemp: parseFloat(calibration.calibrationTemperature.val.toFixed(2)),
      MinFeverThreshold: calibration.thresholdMinFever,
      ThermalRefTemp: parseFloat(calibration.thermalRefTemperature.val.toFixed(2)),
      RefTemperatureValue: Math.round(calibration.thermalReferenceRawValue),
      TemperatureRawValue: Math.round(calibration.hotspotRawTemperatureValue),
      AppVersion: appVersion,
      Meta: {
        Sample: {
          x,
          y
        },
        Telemetry: frame.frameInfo.Telemetry,
        Crop: calibration.cropBox
      }
    };
    const request = fetch(API_BASE, {
      method: "POST",
      body: JSON.stringify(calibrationPayload)
    });
    const response = await request;

    if (response.status === 200) {
      const presignedUrl = await response.text(); // Based on the user, we find out whether or not to upload a reference image.

      if (presignedUrl) {
        // Upload to s3
        fetch(presignedUrl, {
          method: "PUT",
          body: frame.frame,
          headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Encoding': 'utf8'
          }
        });
      }
    }
  }

};
const DeviceApi = {
  get debugPrefix() {
    if (window.location.port === "8080" || window.location.port === "5000") {
      // Used for developing the front-end against an externally running version of the
      // backend, so it's not necessary to package up the build to do front-end testing.
      //return "http://localhost:2041";
      //return "http://192.168.178.37";
      return "http://192.168.178.21"; //return "http://192.168.0.40";
    }

    return "";
  },

  get SOFTWARE_VERSION() {
    return `${this.debugPrefix}/api/version`;
  },

  get DEVICE_INFO() {
    return `${this.debugPrefix}/api/device-info`;
  },

  get DEVICE_TIME() {
    return `${this.debugPrefix}/api/clock`;
  },

  get DEVICE_CONFIG() {
    return `${this.debugPrefix}/api/config`;
  },

  get NETWORK_INFO() {
    return `${this.debugPrefix}/api/network-info`;
  },

  get SAVE_CALIBRATION() {
    return `${this.debugPrefix}/api/calibration/save`;
  },

  get LOAD_CALIBRATION() {
    return `${this.debugPrefix}/api/calibration/get`;
  },

  get RECORDER_STATUS() {
    return `${this.debugPrefix}/recorderstatus`;
  },

  get START_RECORDING() {
    return `${this.debugPrefix}/record?start=true`;
  },

  get DOWNLOAD_RECORDING() {
    return `${this.debugPrefix}/record?stop=true`;
  },

  async get(url) {
    return fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Basic ${btoa("admin:feathers")}`
      }
    });
  },

  async post(url, data) {
    return fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa("admin:feathers")}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: data
    });
  },

  async getJSON(url) {
    const response = await this.get(url);

    try {
      return response.json();
    } catch (e) {
      return {};
    }
  },

  async getText(url) {
    const response = await this.get(url);
    return response.text();
  },

  async softwareVersion() {
    return this.getJSON(this.SOFTWARE_VERSION);
  },

  async startRecording() {
    const result = await this.getText(this.START_RECORDING);
    return result === "<nil>";
  },

  async deviceInfo() {
    return this.getJSON(this.DEVICE_INFO);
  },

  async deviceTime() {
    return this.getJSON(this.DEVICE_TIME);
  },

  async recorderStatus() {
    return this.getJSON(this.RECORDER_STATUS);
  },

  async deviceConfig() {
    return this.getJSON(this.DEVICE_CONFIG);
  },

  async networkInfo() {
    return this.getJSON(this.NETWORK_INFO);
  },

  async saveCalibration(data) {
    // NOTE: This API only supports a json payload one level deep.  No nested structures.
    const formData = new URLSearchParams();
    formData.append("calibration", JSON.stringify(data));
    return this.post(this.SAVE_CALIBRATION, formData);
  },

  async getCalibration() {
    return this.getJSON(this.LOAD_CALIBRATION);
  }

};
const FakeThermalCameraApi = {
  async isFakeThermalCamera() {
    // Try fetching on localhost:2040,
    const response = await fetch(FAKE_THERMAL_CAMERA_SERVER);

    if (response.status !== 200) {
      return false;
    }

    const message = await response.text();
    return message === "This is a Fake thermal camera test server.";
  },

  async listFakeThermalCameraFiles() {
    const response = await fetch(`${FAKE_THERMAL_CAMERA_SERVER}/list`);

    try {
      return response.json();
    } catch (e) {
      return [];
    }
  },

  async playbackCptvFile(file, repeatCount) {
    const response = await this.getText(`${FAKE_THERMAL_CAMERA_SERVER}/sendCPTVFrames?${new URLSearchParams(Object.entries({
      "cptv-file": file,
      repeat: repeatCount.toString()
    }))}`);
    return response === "Success";
  },

  async stopPlayback() {
    const response = await this.getText(`${FAKE_THERMAL_CAMERA_SERVER}/playback?stop=true`);
    return response === "Success";
  },

  async pausePlayback() {
    const response = await this.getText(`${FAKE_THERMAL_CAMERA_SERVER}/playback?pause=true`);
    return response === "Success";
  },

  async resumePlayback() {
    const response = await this.getText(`${FAKE_THERMAL_CAMERA_SERVER}/playback?play=true`);
    return response === "Success";
  },

  async get(url) {
    return fetch(url, {
      method: "GET"
    });
  },

  async getJSON(url) {
    const response = await this.get(url);

    try {
      return response.json();
    } catch (e) {
      return {};
    }
  },

  async getText(url) {
    const response = await this.get(url);
    return response.text();
  }

};
// CONCATENATED MODULE: ./src/camera.ts

var CameraConnectionState;

(function (CameraConnectionState) {
  CameraConnectionState[CameraConnectionState["Connecting"] = 0] = "Connecting";
  CameraConnectionState[CameraConnectionState["Connected"] = 1] = "Connected";
  CameraConnectionState[CameraConnectionState["Disconnected"] = 2] = "Disconnected";
})(CameraConnectionState || (CameraConnectionState = {}));

const UUID = new Date().getTime();
class camera_CameraConnection {
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

    if (port === "8080" || port === "5000") {
      // If we're running in development mode, find the remote camera server
      this.host = "192.168.178.21"; //this.host = "192.168.0.40";
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
// CONCATENATED MODULE: ./cptv-player/cptv_player.js
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

/* harmony default export */ var cptv_player = (self.wasm_bindgen);
// EXTERNAL MODULE: ./node_modules/worker-loader/dist/cjs.js!./src/smoothing-worker.ts
var smoothing_worker = __webpack_require__("4847");
var smoothing_worker_default = /*#__PURE__*/__webpack_require__.n(smoothing_worker);

// CONCATENATED MODULE: ./src/frame-listener.ts
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

 // import { WasmTracingAllocator } from "@/tracing-allocator";



const {
  initWithCptvData,
  getRawFrame
} = cptv_player;
const smoothingWorkers = [{
  worker: new smoothing_worker_default.a(),
  pending: null,
  index: 0
}];

for (let i = 0; i < smoothingWorkers.length; i++) {
  const s = smoothingWorkers[i];

  s.worker.onmessage = result => {
    if (s.pending) {
      // TODO(jon): See if we're ever getting frame number mis-matches here.
      s.pending(result.data);
      s.pending = null;
    } else {
      console.error("Couldn't find callback for", result.data, s.index);
    }
  };
}

let workerIndex = 0;
const processSensorData = async frame => {
  const index = workerIndex;
  return new Promise((resolve, reject) => {
    smoothingWorkers[index].pending = resolve;
    smoothingWorkers[index].worker.postMessage({
      frame: frame.frame,
      calibrationTempC: frame.frameInfo.Calibration.ThermalRefTemp
    });
  });
};
const workerContext = self;
let frameTimeout = 0;
let frameBuffer = null;
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
  Calibration: {
    ThermalRefTemp: 38.66,
    SnapshotTime: 0,
    TemperatureCelsius: 36,
    SnapshotValue: 0,
    ThresholdMinFever: 0,
    Bottom: 0,
    Top: 0,
    Left: 0,
    Right: 0,
    CalibrationBinaryVersion: "fsdfd",
    UuidOfUpdater: 432423432432,
    UseErrorSound: true,
    UseWarningSound: true,
    UseNormalSound: true
  }
};

async function processFrame(frame) {
  // console.log("got frame", frame);
  // Do the frame processing, then postMessage the relevant payload to the view app.
  // Do this in yet another worker(s)?
  performance.mark(`process frame ${frame.frameInfo.Telemetry.FrameCount}`);
  const imageInfo = await processSensorData(frame);
  performance.mark(`end frame ${frame.frameInfo.Telemetry.FrameCount}`);
  performance.measure(`frame ${frame.frameInfo.Telemetry.FrameCount}`, `start frame ${frame.frameInfo.Telemetry.FrameCount}`, `end frame ${frame.frameInfo.Telemetry.FrameCount}`);
  performance.measure(`process frame ${frame.frameInfo.Telemetry.FrameCount}`, `process frame ${frame.frameInfo.Telemetry.FrameCount}`, `end frame ${frame.frameInfo.Telemetry.FrameCount}`);
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
    frameInfo: _objectSpread(_objectSpread({}, InitialFrameInfo), {}, {
      AppVersion: appVersion,
      BinaryVersion: binaryVersion,
      Telemetry: _objectSpread(_objectSpread({}, InitialFrameInfo.Telemetry), {}, {
        LastFFCTime: frameInfo.last_ffc_time,
        FrameCount: frameInfo.frame_number,
        TimeOn: frameInfo.time_on
      })
    })
  };
  frameInfo.free();
  frameTimeout = setTimeout(getNextFrame, 1000 / 9);
  const frameNumber = currentFrame.frameInfo.Telemetry.FrameCount;

  if (frameNumber % 20 === 0) {
    performance.clearMarks();
    performance.clearMeasures();
    performance.clearResourceTimings();
  }

  performance.mark(`start frame ${frameNumber}`);
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

    if (message.useLiveCamera) {
      new camera_CameraConnection(message.hostname, message.port, processFrame, onConnectionStateChange); // Init live camera web-socket connection
    } else if (message.cptvFileToPlayback) {
      // Init CPTV file playback
      await cptv_player(`${"/static/dist/"}cptv_player_bg.wasm`);
      const cptvFile = await fetch(message.cptvFileToPlayback);
      const buffer = await cptvFile.arrayBuffer();
      playLocalCptvFile(buffer, message.startFrame || 0, message.endFrame || -1);
    }

    return;
  });
})();
// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--13-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/ts-loader??ref--13-3!./node_modules/vuetify-loader/lib/loader.js??ref--19-0!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/CalibrationSettings.vue?vue&type=script&lang=ts&
function CalibrationSettingsvue_type_script_lang_ts_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function CalibrationSettingsvue_type_script_lang_ts_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { CalibrationSettingsvue_type_script_lang_ts_ownKeys(Object(source), true).forEach(function (key) { CalibrationSettingsvue_type_script_lang_ts_defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { CalibrationSettingsvue_type_script_lang_ts_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function CalibrationSettingsvue_type_script_lang_ts_defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }









let CalibrationSettingsvue_type_script_lang_ts_CalibrationSettings = class CalibrationSettings extends vue_property_decorator["d" /* Vue */] {
  constructor() {
    super(...arguments);
    this.useCustomTemperatureRange = false;
    this.editedTemperatureThreshold = 0;
    this.showCalibrationDialog = false;
    this.editedCropBox = null;
    this.editedCalibration = new DegreesCelsius(0);
    this.pendingCalibration = new DegreesCelsius(0);
    this.snapshotScreeningEvent = null;
    this.playNormalSound = true;
    this.playWarningSound = true;
    this.playErrorSound = true;
    this.deviceName = "";
    this.deviceID = 0;
    this.saving = false;
  }

  toggleCustomTemperatureThresholds(val) {
    if (val) {
      this.editedTemperatureThreshold = this.state.currentCalibration.thresholdMinFever;
    }

    if (!val) {
      this.editedTemperatureThreshold = DEFAULT_THRESHOLD_MIN_FEVER;
    } // Update custom back to defaults

  }

  get selectedTemperatureRange() {
    return `${new DegreesCelsius(this.editedTemperatureThreshold)}`;
  }

  get hasMadeEdits() {
    const unedited = {
      cropBox: this.state.currentCalibration.cropBox,
      temperatureThreshold: this.state.currentCalibration.thresholdMinFever,
      calibration: parseFloat(this.state.currentCalibration.calibrationTemperature.val.toFixed(2)),
      sounds: {
        warning: this.state.currentCalibration.playWarningSound,
        normal: this.state.currentCalibration.playNormalSound,
        error: this.state.currentCalibration.playErrorSound
      }
    };
    const edited = {
      cropBox: this.editedCropBox,
      temperatureThreshold: this.editedTemperatureThreshold,
      calibration: parseFloat(this.editedCalibration.val.toFixed(2)),
      sounds: {
        warning: this.playWarningSound,
        normal: this.playNormalSound,
        error: this.playErrorSound
      }
    };
    const a = JSON.stringify(edited);
    const b = JSON.stringify(unedited);
    return a != b;
  }

  get plusIcon() {
    return mdi["e" /* mdiPlus */];
  }

  get pencilIcon() {
    return mdi["d" /* mdiPencil */];
  }

  get minusIcon() {
    return mdi["c" /* mdiMinus */];
  }

  get state() {
    return State;
  }

  get canCalibrate() {
    return this.latestScreeningEvent !== null;
  }

  onCropChanged(box) {
    this.editedCropBox = box;
  }

  get screeningState() {
    return this.state.currentScreeningState;
  }

  get latestScreeningEvent() {
    return this.state.currentScreeningEvent;
  }

  get calibration() {
    return this.pendingCalibration;
  }

  editCalibration() {
    this.editedCalibration = new DegreesCelsius(this.calibration.val);
    this.snapshotScreeningEvent = this.latestScreeningEvent;
    this.showCalibrationDialog = true;
  }

  async acceptCalibration() {
    this.pendingCalibration = new DegreesCelsius(this.editedCalibration.val);
    this.showCalibrationDialog = false;
  }

  async persistSettings() {
    // Get these values from the current screening event.
    const cropBox = this.editedCropBox;
    const currentCalibration = this.pendingCalibration;
    let thermalRefTemp = this.state.currentCalibration.thermalRefTemperature.val;
    let thermalRefRaw = this.state.currentCalibration.thermalReferenceRawValue;
    let rawTempValue = this.state.currentCalibration.hotspotRawTemperatureValue;
    const thresholdMinFever = this.editedTemperatureThreshold;
    let sampleX = -1;
    let sampleY = -1;
    let frame = this.state.currentFrame;

    if (this.snapshotScreeningEvent) {
      frame = this.snapshotScreeningEvent.frame;
      thermalRefRaw = this.snapshotScreeningEvent.thermalReference.val;
      rawTempValue = this.snapshotScreeningEvent.rawTemperatureValue;
      thermalRefTemp = currentCalibration.val - (rawTempValue - thermalRefRaw) * 0.01;
      sampleX = this.snapshotScreeningEvent.sampleX;
      sampleY = this.snapshotScreeningEvent.sampleY;
    }

    const timestamp = new Date();

    if (currentCalibration.val !== this.state.currentCalibration.calibrationTemperature.val || thresholdMinFever !== this.state.currentCalibration.thresholdMinFever) {
      // Only update the server log for threshold or calibration changes, not for sound effect prefs etc.
      ScreeningApi.recordCalibrationEvent(this.deviceName, this.deviceID, {
        cropBox,
        timestamp: timestamp,
        calibrationTemperature: currentCalibration,
        hotspotRawTemperatureValue: rawTempValue,
        thermalRefTemperature: new DegreesCelsius(thermalRefTemp),
        thermalReferenceRawValue: thermalRefRaw,
        thresholdMinFever,
        playErrorSound: this.playErrorSound,
        playWarningSound: this.playWarningSound,
        playNormalSound: this.playNormalSound
      }, frame, sampleX, sampleY);
    }

    {
      // For non-live playback
      InitialFrameInfo.Calibration.ThermalRefTemp = thermalRefTemp;
      InitialFrameInfo.Calibration.TemperatureCelsius = parseFloat(currentCalibration.val.toFixed(2));
      InitialFrameInfo.Calibration.UseErrorSound = this.playErrorSound;
      InitialFrameInfo.Calibration.UseNormalSound = this.playNormalSound;
      InitialFrameInfo.Calibration.UseWarningSound = this.playWarningSound;
    }
    const newCalibration = {
      ThresholdMinFever: thresholdMinFever,
      ThermalRefTemp: thermalRefTemp,
      TemperatureCelsius: parseFloat(currentCalibration.val.toFixed(2)),
      Top: cropBox.top,
      Right: cropBox.right,
      Left: cropBox.left,
      Bottom: cropBox.bottom,
      UuidOfUpdater: this.state.uuid,
      CalibrationBinaryVersion: this.state.currentFrame.frameInfo.BinaryVersion,
      SnapshotTime: timestamp.getTime(),
      SnapshotValue: rawTempValue,
      UseNormalSound: this.playNormalSound,
      UseWarningSound: this.playWarningSound,
      UseErrorSound: this.playErrorSound
    };
    return DeviceApi.saveCalibration(newCalibration);
  }

  incrementCalibration(amount) {
    this.editedCalibration = new DegreesCelsius(this.editedCalibration.val + amount);
  }

  updateCalibration(event) {
    const value = event.target.value.replace("&deg;", "").replace("°", "");

    if (isNaN(Number(value))) {
      this.editedCalibration = new DegreesCelsius(36);
    }

    this.editedCalibration = new DegreesCelsius(Number(value));
  }

  resetEdits() {
    this.editedCropBox = CalibrationSettingsvue_type_script_lang_ts_objectSpread({}, this.state.currentCalibration.cropBox);
    this.pendingCalibration = new DegreesCelsius(this.state.currentCalibration.calibrationTemperature.val);
    this.editedCalibration = new DegreesCelsius(this.state.currentCalibration.calibrationTemperature.val);
    this.editedTemperatureThreshold = this.state.currentCalibration.thresholdMinFever;
    this.useCustomTemperatureRange = this.editedTemperatureThreshold !== DEFAULT_THRESHOLD_MIN_FEVER;
    this.playNormalSound = this.state.currentCalibration.playNormalSound;
    this.playWarningSound = this.state.currentCalibration.playWarningSound;
    this.playErrorSound = this.state.currentCalibration.playErrorSound;
  }

  async saveEdits() {
    this.saving = true;
    await this.persistSettings();
    this.saving = false;
  }

  saveSounds() {
    window.localStorage.setItem("playNormalSound", JSON.stringify(this.playNormalSound));
    window.localStorage.setItem("playWarningSound", JSON.stringify(this.playWarningSound));
    window.localStorage.setItem("playErrorSound", JSON.stringify(this.playErrorSound));
  }

  async beforeMount() {
    const {
      deviceID,
      devicename
    } = await DeviceApi.deviceInfo();
    this.deviceID = deviceID;
    this.deviceName = devicename;
    this.playNormalSound = JSON.parse(window.localStorage.getItem("playNormalSound") || "true");
    this.playWarningSound = JSON.parse(window.localStorage.getItem("playWarningSound") || "true");
    this.playErrorSound = JSON.parse(window.localStorage.getItem("playErrorSound") || "true");
    this.resetEdits();
  }

};
CalibrationSettingsvue_type_script_lang_ts_CalibrationSettings = Object(tslib_es6["a" /* __decorate */])([Object(vue_property_decorator["a" /* Component */])({
  components: {
    VideoStream: components_VideoStream
  }
})], CalibrationSettingsvue_type_script_lang_ts_CalibrationSettings);
/* harmony default export */ var CalibrationSettingsvue_type_script_lang_ts_ = (CalibrationSettingsvue_type_script_lang_ts_CalibrationSettings);
// CONCATENATED MODULE: ./src/components/CalibrationSettings.vue?vue&type=script&lang=ts&
 /* harmony default export */ var components_CalibrationSettingsvue_type_script_lang_ts_ = (CalibrationSettingsvue_type_script_lang_ts_); 
// EXTERNAL MODULE: ./src/components/CalibrationSettings.vue?vue&type=style&index=0&id=1277cae8&scoped=true&lang=scss&
var CalibrationSettingsvue_type_style_index_0_id_1277cae8_scoped_true_lang_scss_ = __webpack_require__("4316");

// EXTERNAL MODULE: ./node_modules/vuetify/lib/components/VCard/VCard.js
var VCard = __webpack_require__("b0af");

// EXTERNAL MODULE: ./node_modules/vuetify/lib/components/VCard/index.js
var components_VCard = __webpack_require__("99d9");

// EXTERNAL MODULE: ./node_modules/vuetify/lib/components/VCheckbox/VCheckbox.js
var VCheckbox = __webpack_require__("ac7c");

// EXTERNAL MODULE: ./node_modules/vuetify/lib/components/VGrid/VCol.js
var VCol = __webpack_require__("62ad");

// EXTERNAL MODULE: ./node_modules/vuetify/lib/components/VGrid/VContainer.js + 1 modules
var VContainer = __webpack_require__("a523");

// EXTERNAL MODULE: ./node_modules/vuetify/lib/components/VDialog/VDialog.js + 8 modules
var VDialog = __webpack_require__("169a");

// EXTERNAL MODULE: ./node_modules/vuetify/lib/components/VOverlay/VOverlay.js
var VOverlay = __webpack_require__("a797");

// EXTERNAL MODULE: ./node_modules/vuetify/lib/components/VGrid/VRow.js
var VRow = __webpack_require__("0fd9");

// EXTERNAL MODULE: ./node_modules/vuetify/lib/components/VSlider/VSlider.js
var VSlider = __webpack_require__("ba0d");

// EXTERNAL MODULE: ./node_modules/vuetify/lib/components/VGrid/VSpacer.js
var VSpacer = __webpack_require__("2fa4");

// EXTERNAL MODULE: ./node_modules/vuetify/lib/components/VSwitch/VSwitch.js
var VSwitch = __webpack_require__("b73d");

// EXTERNAL MODULE: ./node_modules/vuetify/lib/components/VTextField/VTextField.js + 3 modules
var VTextField = __webpack_require__("8654");

// CONCATENATED MODULE: ./src/components/CalibrationSettings.vue






/* normalize component */

var CalibrationSettings_component = Object(componentNormalizer["a" /* default */])(
  components_CalibrationSettingsvue_type_script_lang_ts_,
  CalibrationSettingsvue_type_template_id_1277cae8_scoped_true_render,
  CalibrationSettingsvue_type_template_id_1277cae8_scoped_true_staticRenderFns,
  false,
  null,
  "1277cae8",
  null
  
)

/* harmony default export */ var components_CalibrationSettings = (CalibrationSettings_component.exports);

/* vuetify-loader */


















installComponents_default()(CalibrationSettings_component, {VBtn: VBtn["a" /* default */],VCard: VCard["a" /* default */],VCardActions: components_VCard["a" /* VCardActions */],VCardSubtitle: components_VCard["b" /* VCardSubtitle */],VCardText: components_VCard["c" /* VCardText */],VCardTitle: components_VCard["d" /* VCardTitle */],VCheckbox: VCheckbox["a" /* default */],VCol: VCol["a" /* default */],VContainer: VContainer["a" /* default */],VDialog: VDialog["a" /* default */],VIcon: VIcon["a" /* default */],VOverlay: VOverlay["a" /* default */],VRow: VRow["a" /* default */],VSlider: VSlider["a" /* default */],VSpacer: VSpacer["a" /* default */],VSwitch: VSwitch["a" /* default */],VTextField: VTextField["a" /* default */]})

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"73ad4bbd-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vuetify-loader/lib/loader.js??ref--19-0!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/DeviceInfo.vue?vue&type=template&id=3130d65e&scoped=true&
var DeviceInfovue_type_template_id_3130d65e_scoped_true_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-card',{attrs:{"flat":""}},[(_vm.items)?_c('v-simple-table',{scopedSlots:_vm._u([{key:"default",fn:function(){return [_c('thead',[_c('tr',[_c('th',{staticClass:"text-left"},[_vm._v("Device config")]),_c('th',{staticClass:"text-left"})])]),_c('tbody',_vm._l((_vm.items),function(ref){
var name = ref[0];
var item = ref[1];
return _c('tr',{key:name},[_c('td',[_vm._v(_vm._s(name))]),_c('td',[_vm._v(_vm._s(item))])])}),0)]},proxy:true}],null,false,421180828)}):_vm._e()],1)}
var DeviceInfovue_type_template_id_3130d65e_scoped_true_staticRenderFns = []


// CONCATENATED MODULE: ./src/components/DeviceInfo.vue?vue&type=template&id=3130d65e&scoped=true&

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--13-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/ts-loader??ref--13-3!./node_modules/vuetify-loader/lib/loader.js??ref--19-0!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/DeviceInfo.vue?vue&type=script&lang=ts&
function DeviceInfovue_type_script_lang_ts_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function DeviceInfovue_type_script_lang_ts_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { DeviceInfovue_type_script_lang_ts_ownKeys(Object(source), true).forEach(function (key) { DeviceInfovue_type_script_lang_ts_defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { DeviceInfovue_type_script_lang_ts_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function DeviceInfovue_type_script_lang_ts_defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }





let DeviceInfovue_type_script_lang_ts_DeviceInfo = class DeviceInfo extends vue_property_decorator["d" /* Vue */] {
  constructor() {
    super(...arguments);
    this.info = {};
    this.networkInfo = {};
    this.softwareVersion = {};
  }

  get items() {
    return [...Object.entries(this.info), ...Object.entries(this.softwareVersion), ...Object.entries(this.networkInfo), ...Object.entries(this.cameraInfo)];
  }

  get cameraInfo() {
    var _State$currentFrame;

    const camera = DeviceInfovue_type_script_lang_ts_objectSpread({}, (_State$currentFrame = State.currentFrame) === null || _State$currentFrame === void 0 ? void 0 : _State$currentFrame.frameInfo.Camera);

    delete camera.ResX;
    delete camera.ResY;
    delete camera.FPS;
    return camera;
  }

  get state() {
    return State;
  }

  async beforeMount() {
    // Get all the device data.
    const info = await DeviceApi.deviceInfo();
    delete info.serverURL;
    delete info.groupname;
    this.info = info;
    const networkInfo = await DeviceApi.networkInfo();
    let IPAddress = networkInfo.Interfaces.filter(nic => nic.IPAddresses !== null).map(nic => nic.IPAddresses[0])[0];
    IPAddress = IPAddress.substring(0, IPAddress.indexOf("/"));
    this.networkInfo = {
      Online: networkInfo.Config.Online,
      IPAddress
    };
    const softwareVersion = await DeviceApi.softwareVersion();
    softwareVersion.binaryVersion = softwareVersion.binaryVersion.substring(0, 10);
    const newLine = softwareVersion.appVersion.indexOf("\n");

    if (newLine !== -1) {
      softwareVersion.appVersion = softwareVersion.appVersion.substring(0, newLine);
    }

    delete softwareVersion.apiVersion;
    this.softwareVersion = softwareVersion;
  }

};
DeviceInfovue_type_script_lang_ts_DeviceInfo = Object(tslib_es6["a" /* __decorate */])([vue_property_decorator["a" /* Component */]], DeviceInfovue_type_script_lang_ts_DeviceInfo);
/* harmony default export */ var DeviceInfovue_type_script_lang_ts_ = (DeviceInfovue_type_script_lang_ts_DeviceInfo);
// CONCATENATED MODULE: ./src/components/DeviceInfo.vue?vue&type=script&lang=ts&
 /* harmony default export */ var components_DeviceInfovue_type_script_lang_ts_ = (DeviceInfovue_type_script_lang_ts_); 
// EXTERNAL MODULE: ./node_modules/vuetify/lib/components/VDataTable/VSimpleTable.js
var VSimpleTable = __webpack_require__("1f4f");

// CONCATENATED MODULE: ./src/components/DeviceInfo.vue





/* normalize component */

var DeviceInfo_component = Object(componentNormalizer["a" /* default */])(
  components_DeviceInfovue_type_script_lang_ts_,
  DeviceInfovue_type_template_id_3130d65e_scoped_true_render,
  DeviceInfovue_type_template_id_3130d65e_scoped_true_staticRenderFns,
  false,
  null,
  "3130d65e",
  null
  
)

/* harmony default export */ var components_DeviceInfo = (DeviceInfo_component.exports);

/* vuetify-loader */



installComponents_default()(DeviceInfo_component, {VCard: VCard["a" /* default */],VSimpleTable: VSimpleTable["a" /* default */]})

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"73ad4bbd-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vuetify-loader/lib/loader.js??ref--19-0!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/DeveloperUtilities.vue?vue&type=template&id=e0112a36&scoped=true&
var DeveloperUtilitiesvue_type_template_id_e0112a36_scoped_true_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-card',{attrs:{"flat":"","height":"calc(100vh - 112px)"}},[_c('v-container',{staticClass:"cont"},[_c('v-card',[_c('VideoStream',{attrs:{"frame":_vm.state.currentFrame.frame,"face":_vm.state.face,"min":_vm.state.currentFrame.analysisResult.heatStats.min,"max":_vm.state.currentFrame.analysisResult.heatStats.max,"crop-box":_vm.editedThermalRefMask,"crop-enabled":true,"recording":_vm.isRecording},on:{"crop-changed":_vm.onMaskChanged}}),_c('div',{staticClass:"buttons"},[(_vm.isRunningInAndroidWebview)?_c('div',[_vm._v(" To make recordings this needs to be running inside a browser, not the Te Kahu Ora app. ")]):_c('div',[_c('v-btn',{attrs:{"center":""},on:{"click":_vm.toggleRecording}},[_vm._v(" "+_vm._s(!_vm.isRecording ? "Record" : "Stop Recording")+" ")])],1)])],1),_c('v-card',[_c('v-card-actions',[_c('v-btn',{on:{"click":_vm.skipWarmup}},[_vm._v("Skip warmup period")])],1)],1)],1)],1)}
var DeveloperUtilitiesvue_type_template_id_e0112a36_scoped_true_staticRenderFns = []


// CONCATENATED MODULE: ./src/components/DeveloperUtilities.vue?vue&type=template&id=e0112a36&scoped=true&

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--13-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/ts-loader??ref--13-3!./node_modules/vuetify-loader/lib/loader.js??ref--19-0!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/DeveloperUtilities.vue?vue&type=script&lang=ts&






function download(dataurl) {
  const a = document.createElement("a");
  a.href = dataurl;
  a.setAttribute("download", dataurl);
  a.click();
}

let DeveloperUtilitiesvue_type_script_lang_ts_DeveloperUtilities = class DeveloperUtilities extends vue_property_decorator["d" /* Vue */] {
  constructor() {
    super(...arguments);
    this.editedThermalRefMask = null;
    this.isRecording = false;
  }

  skipWarmup() {
    this.$root.$children[0].$children[0].$emit("skip-warmup");
  }

  onMaskChanged(box) {
    this.editedThermalRefMask = box;
  }

  get state() {
    return State;
  }

  get isRunningInAndroidWebview() {
    return window.navigator.userAgent === "feverscreen-app";
  }

  async toggleRecording() {
    const {
      recording,
      processor
    } = await DeviceApi.recorderStatus();

    if (!processor) {
      return false;
    }

    if (recording) {
      download(DeviceApi.DOWNLOAD_RECORDING);
      this.isRecording = false;
    } else {
      this.isRecording = await DeviceApi.startRecording();
    }
  }

  async mounted() {
    const {
      recording
    } = await DeviceApi.recorderStatus();
    this.isRecording = recording;
  }

};
DeveloperUtilitiesvue_type_script_lang_ts_DeveloperUtilities = Object(tslib_es6["a" /* __decorate */])([Object(vue_property_decorator["a" /* Component */])({
  components: {
    VideoStream: components_VideoStream
  }
})], DeveloperUtilitiesvue_type_script_lang_ts_DeveloperUtilities);
/* harmony default export */ var DeveloperUtilitiesvue_type_script_lang_ts_ = (DeveloperUtilitiesvue_type_script_lang_ts_DeveloperUtilities);
// CONCATENATED MODULE: ./src/components/DeveloperUtilities.vue?vue&type=script&lang=ts&
 /* harmony default export */ var components_DeveloperUtilitiesvue_type_script_lang_ts_ = (DeveloperUtilitiesvue_type_script_lang_ts_); 
// EXTERNAL MODULE: ./src/components/DeveloperUtilities.vue?vue&type=style&index=0&id=e0112a36&scoped=true&lang=scss&
var DeveloperUtilitiesvue_type_style_index_0_id_e0112a36_scoped_true_lang_scss_ = __webpack_require__("4c78");

// CONCATENATED MODULE: ./src/components/DeveloperUtilities.vue






/* normalize component */

var DeveloperUtilities_component = Object(componentNormalizer["a" /* default */])(
  components_DeveloperUtilitiesvue_type_script_lang_ts_,
  DeveloperUtilitiesvue_type_template_id_e0112a36_scoped_true_render,
  DeveloperUtilitiesvue_type_template_id_e0112a36_scoped_true_staticRenderFns,
  false,
  null,
  "e0112a36",
  null
  
)

/* harmony default export */ var components_DeveloperUtilities = (DeveloperUtilities_component.exports);

/* vuetify-loader */





installComponents_default()(DeveloperUtilities_component, {VBtn: VBtn["a" /* default */],VCard: VCard["a" /* default */],VCardActions: components_VCard["a" /* VCardActions */],VContainer: VContainer["a" /* default */]})

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--13-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/ts-loader??ref--13-3!./node_modules/vuetify-loader/lib/loader.js??ref--19-0!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/AdminSettings.vue?vue&type=script&lang=ts&





let AdminSettingsvue_type_script_lang_ts_AdminSettings = class AdminSettings extends vue_property_decorator["d" /* Vue */] {
  constructor() {
    super(...arguments);
    this.tab = null;
    this.tabItems = [{
      tab: "Calibration",
      content: components_CalibrationSettings
    }, {
      tab: "Device info",
      content: components_DeviceInfo
    }, {
      tab: "Developer",
      content: components_DeveloperUtilities
    }];
  }

  close() {
    return true;
  }

};

Object(tslib_es6["a" /* __decorate */])([Object(vue_property_decorator["b" /* Emit */])("closed")], AdminSettingsvue_type_script_lang_ts_AdminSettings.prototype, "close", null);

AdminSettingsvue_type_script_lang_ts_AdminSettings = Object(tslib_es6["a" /* __decorate */])([Object(vue_property_decorator["a" /* Component */])({
  components: {
    CalibrationSettings: components_CalibrationSettings,
    DeviceInfo: components_DeviceInfo,
    DeveloperUtilities: components_DeveloperUtilities
  }
})], AdminSettingsvue_type_script_lang_ts_AdminSettings);
/* harmony default export */ var AdminSettingsvue_type_script_lang_ts_ = (AdminSettingsvue_type_script_lang_ts_AdminSettings);
// CONCATENATED MODULE: ./src/components/AdminSettings.vue?vue&type=script&lang=ts&
 /* harmony default export */ var components_AdminSettingsvue_type_script_lang_ts_ = (AdminSettingsvue_type_script_lang_ts_); 
// EXTERNAL MODULE: ./node_modules/vuetify/lib/components/VTabs/VTab.js
var VTab = __webpack_require__("71a3");

// EXTERNAL MODULE: ./node_modules/vuetify/lib/components/VTabs/VTabItem.js + 1 modules
var VTabItem = __webpack_require__("c671");

// EXTERNAL MODULE: ./node_modules/vuetify/lib/components/VTabs/VTabs.js + 6 modules
var VTabs = __webpack_require__("fe57");

// EXTERNAL MODULE: ./node_modules/vuetify/lib/components/VTabs/VTabsItems.js + 1 modules
var VTabsItems = __webpack_require__("aac8");

// EXTERNAL MODULE: ./node_modules/vuetify/lib/components/VToolbar/VToolbar.js + 3 modules
var VToolbar = __webpack_require__("71d9");

// EXTERNAL MODULE: ./node_modules/vuetify/lib/components/VToolbar/index.js
var components_VToolbar = __webpack_require__("2a7f");

// CONCATENATED MODULE: ./src/components/AdminSettings.vue





/* normalize component */

var AdminSettings_component = Object(componentNormalizer["a" /* default */])(
  components_AdminSettingsvue_type_script_lang_ts_,
  AdminSettingsvue_type_template_id_34541e83_scoped_true_render,
  AdminSettingsvue_type_template_id_34541e83_scoped_true_staticRenderFns,
  false,
  null,
  "34541e83",
  null
  
)

/* harmony default export */ var components_AdminSettings = (AdminSettings_component.exports);

/* vuetify-loader */










installComponents_default()(AdminSettings_component, {VBtn: VBtn["a" /* default */],VCard: VCard["a" /* default */],VSpacer: VSpacer["a" /* default */],VTab: VTab["a" /* default */],VTabItem: VTabItem["a" /* default */],VTabs: VTabs["a" /* default */],VTabsItems: VTabsItems["a" /* default */],VToolbar: VToolbar["a" /* default */],VToolbarTitle: components_VToolbar["a" /* VToolbarTitle */]})

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--13-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/ts-loader??ref--13-3!./node_modules/vuetify-loader/lib/loader.js??ref--19-0!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/UserFacingScreening.vue?vue&type=script&lang=ts&
// Possible states:
// - Camera is still warming up
//  (this should still want to find the constant heat source, because we want to make
//   sure that's warming up at the same time)
// - Frame is empty, no head detected.
// - Head detected, but not centered.
// - More than one head detected in frame.
// - No constant heat-source detected.
// - Head detected, and forehead isolated.
// - Head has been front-on for x frames, with stable forehead lock.
 // - Other states:
//      - Wifi has been lost (maybe don't care about this case now if we're wired?)
//      - FFC is happening
//      - Period *after* FFC, which we need to hide.








function lerp(a, amt, b) {
  return a * amt + b * (1 - amt);
}

function closestY(prev, y) {
  const best = prev.map(x => ({
    d: Math.abs(Number(x.y) - y),
    x
  })).sort((a, b) => b.d - a.d).pop();
  return prev.find(x => x.y === best.x.y);
}

function interpolateShapes(prev, amt, next) {
  // For each row with the same y, interpolate x0 and x0 and x1 and x1 linearly on x.
  // Then it's a matter of figuring out what to do with the rest.
  amt = 1 - amt;
  const result = []; // TODO(jon): Start at the bottom.

  for (let i = 0; i < next.length; i++) {
    const rowNext = next[i];
    const y = rowNext.y;

    if (prev[i]) {
      // Move others across in x the same amount as the adjacent ones that *do* exist.
      const rowPrev = prev[i];
      result.push({
        x0: lerp(rowPrev.x0, amt, rowNext.x0),
        x1: lerp(rowPrev.x1, amt, rowNext.x1),
        y: Number(y)
      });
    } else {
      // What's the closest point on prev?
      // Let's use that.
      const rowPrev = closestY(prev, y); // Should actually be the amount that rowPrev moved compared with
      // it's corresponding row in rowNext.

      result.push({
        x0: lerp(rowPrev.x0, amt, rowNext.x0),
        x1: lerp(rowPrev.x1, amt, rowNext.x1),
        y: Number(y)
      });
    }
  }

  return result;
}

const frameNum = 0;
let curveFitting;
const Sound = new Audio();
let UserFacingScreeningvue_type_script_lang_ts_UserFacingScreening = class UserFacingScreening extends vue_property_decorator["d" /* Vue */] {
  constructor() {
    super(...arguments);
    this.didInteract = false;
    this.showSettings = false;
    this.hasSettings = false;
    this.stateQueue = [];
  }

  get isLocal() {
    return window.location.port === "5000" || window.location.port === "8080";
  }

  closedAdminSettings() {
    this.showSettings = false;
    setTimeout(() => {
      this.hasSettings = false;
    }, 300);
  }

  set interacted(val) {
    this.didInteract = val;
    setTimeout(() => this.didInteract = false, 5000);
  }

  get interacted() {
    return this.didInteract;
  }

  get cogIcon() {
    return mdi["a" /* mdiCog */];
  }

  async beforeMount() {
    curveFitting = await __webpack_require__.e(/* import() */ "chunk-2d843444").then(__webpack_require__.bind(null, "ce00"));
  }

  mounted() {
    window.requestAnimationFrame(this.drawBezierOutline.bind(this));
  }

  get messageText() {
    if (this.isAquiring) {
      return "Hold still...";
    } else if (this.isWarmingUp) {
      return `Warming up, <span>${this.remainingWarmupTime}</span> remaining`;
    } else if (this.isTooFar) {
      return "Come closer";
    } else if (this.missingRef) {
      return "Missing reference";
    } else {
      return "Ready";
    }
  }

  onScreeningEventChange(event) {
    if (event !== null) {
      if (this.temperatureIsNormal) {
        const shouldPlay = JSON.parse(window.localStorage.getItem("playNormalSound") || "true");

        if (shouldPlay) {
          Sound.src = `${"/static/dist/"}sounds/341695_5858296-lq.mp3`;
          Sound.play();
        }
      } else if (this.temperatureIsHigherThanNormal) {
        const shouldPlay = JSON.parse(window.localStorage.getItem("playWarningSound") || "true");

        if (shouldPlay) {
          Sound.src = `${"/static/dist/"}sounds/445978_9159316-lq.mp3`;
          Sound.play();
        }
      } else if (this.temperatureIsProbablyAnError) {
        const shouldPlay = JSON.parse(window.localStorage.getItem("playErrorSound") || "true");

        if (shouldPlay) {
          Sound.src = `${"/static/dist/"}sounds/142608_1840739-lq.mp3`;
          Sound.play();
        }
      }
    }
  }

  drawBezierOutline() {
    // Maybe we give the start and end shapes, and interpolate those, and convert to beziers each frame?
    // const toRemove = [];
    // for (const message of this.stateQueue) {
    //   message.count--;
    //   if (message.count === 0) {
    //     toRemove.push(message);
    //   }
    // }
    // for (const message of toRemove) {
    //   if (this.stateQueue.length !== 1) {
    //     //console.log("removing", message.message);
    //     this.stateQueue.splice(this.stateQueue.indexOf(message), 1);
    //   }
    // }
    // If this is 9fps, we should interpolate ~5 frames in between.
    // Let's try and draw a nice curve around the shape:
    // Get the edge of the shape:
    let ctx;
    let canvasWidth = 810;
    let canvasHeight = 1080;

    if (this.$refs.beziers) {
      const aspectRatio = 4 / 3;

      if (navigator.userAgent.includes("Lenovo TB-X605LC")) {
        canvasHeight = document.body.getBoundingClientRect().height;
      } else {
        canvasHeight = this.$refs.beziers.parentElement.getBoundingClientRect().height;
      }

      canvasWidth = canvasHeight / aspectRatio;
      this.$refs.beziers.style.width = `${canvasWidth}px`;
      this.$refs.beziers.style.height = `${canvasHeight}px`;
      ctx = this.$refs.beziers.getContext("2d");
    }

    if (ctx) {
      ctx.clearRect(0, 0, 810, 1080);
      ctx.save();
      ctx.scale(6.75, 6.75);

      if (this.shapes.length === 2) {
        // TODO(jon): Would Object.freeze be a better strategy for opting out of reactivity?
        const prevShape = this.shapes[0];
        const nextShape = this.shapes[1]; // TODO(jon): If there's no nextShape, create one to the side that prevShape seemed to be
        // going off on.

        if (prevShape && nextShape && prevShape.length && nextShape.length) {
          const interpolatedShape = interpolateShapes(prevShape[0], LerpAmount.amount, nextShape[0]); // TODO(jon): This lerp amount should be frame-rate independent, so time duration between frames.

          LerpAmount.amount += 0.166;
          LerpAmount.amount = Math.min(1, LerpAmount.amount);
          const pointsArray = new Uint8Array(interpolatedShape.length * 4);
          let i = 0;
          interpolatedShape.reverse();

          for (const row of interpolatedShape) {
            pointsArray[i++] = row.x1;
            pointsArray[i++] = row.y;
          }

          interpolatedShape.reverse();

          for (const row of interpolatedShape) {
            pointsArray[i++] = row.x0;
            pointsArray[i++] = row.y;
          }

          const bezierPts = curveFitting.fitCurveThroughPoints(pointsArray); // TODO(jon): Run a smoothing pass on this to smooth out longer lines?
          // Maybe have adaptive error for different parts of the curve?

          if (bezierPts.length) {
            {
              {
                ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
                ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
                ctx.lineWidth = 2;
                ctx.lineCap = "round"; // frameNum++;

                if (frameNum % 2 === 0) {
                  ctx.setLineDash([3, 6]);
                } else {
                  ctx.setLineDash([3, 4]);
                }

                ctx.beginPath();
                ctx.moveTo(bezierPts[0], bezierPts[1]);

                for (let _i = 2; _i < bezierPts.length; _i += 6) {
                  ctx.bezierCurveTo(bezierPts[_i], bezierPts[_i + 1], bezierPts[_i + 2], bezierPts[_i + 3], bezierPts[_i + 4], bezierPts[_i + 5]);
                }

                ctx.stroke();
              }
            }
            ctx.save(); // TODO(jon): Bake this alpha mask to a texture if things seem slow.

            ctx.globalCompositeOperation = "destination-out";
            const leftGradient = ctx.createLinearGradient(0, 0, 20, 0);
            leftGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
            leftGradient.addColorStop(0.25, "rgba(0, 0, 0, 230)");
            leftGradient.addColorStop(0, "rgba(0, 0, 0, 255)");
            const rightGradient = ctx.createLinearGradient(100, 0, 120, 0);
            rightGradient.addColorStop(1, "rgba(0, 0, 0, 255)");
            rightGradient.addColorStop(0.75, "rgba(0, 0, 0, 230)");
            rightGradient.addColorStop(0, "rgba(0, 0, 0, 0)");
            const topGradient = ctx.createLinearGradient(0, 0, 0, 10);
            topGradient.addColorStop(0, "rgba(0, 0, 0, 255)");
            topGradient.addColorStop(0.45, "rgba(0, 0, 0, 230)");
            topGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
            const bottomGradient = ctx.createLinearGradient(0, 150, 0, 160);
            bottomGradient.addColorStop(1, "rgba(0, 0, 0, 255)");
            bottomGradient.addColorStop(0.75, "rgba(0, 0, 0, 230)");
            bottomGradient.addColorStop(0, "rgba(0, 0, 0, 0)");
            ctx.fillStyle = leftGradient;
            ctx.fillRect(0, 0, 20, 160);
            ctx.fillStyle = rightGradient;
            ctx.fillRect(100, 0, 20, 160);
            ctx.fillStyle = topGradient;
            ctx.fillRect(0, 0, 120, 10);
            ctx.fillStyle = bottomGradient;
            ctx.fillRect(0, 150, 120, 10);
            ctx.restore();
          }
        } // Draw corner indicators:


        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
        ctx.setLineDash([]);
        const inset = 15;
        const len = 10;
        const width = 120;
        const height = 160;
        ctx.beginPath();
        ctx.moveTo(inset + len, inset);
        ctx.lineTo(inset, inset);
        ctx.lineTo(inset, inset + len);
        ctx.moveTo(inset + len, height - inset);
        ctx.lineTo(inset, height - inset);
        ctx.lineTo(inset, height - (inset + len));
        ctx.moveTo(width - (inset + len), inset);
        ctx.lineTo(width - inset, inset);
        ctx.lineTo(width - inset, inset + len);
        ctx.moveTo(width - (inset + len), height - inset);
        ctx.lineTo(width - inset, height - inset);
        ctx.lineTo(width - inset, height - (inset + len));
        ctx.stroke();
        ctx.restore();
      }
    }

    window.requestAnimationFrame(this.drawBezierOutline.bind(this));
  }

  get temperature() {
    if (this.screeningEvent) {
      return new DegreesCelsius(this.screeningEvent.face.sampleTemp);
    }

    return new DegreesCelsius(0);
  }

  get temperatureIsNormal() {
    return this.temperature.val < this.calibration.thresholdMinFever;
  }

  get temperatureIsHigherThanNormal() {
    return this.temperature.val >= this.calibration.thresholdMinFever;
  }

  get temperatureIsProbablyAnError() {
    // TODO(jon)
    return this.temperature.val > 42.5;
  }

  get classNameForState() {
    return this.state.toLowerCase().replace("_", "-");
  }

  get screeningResultClass() {
    if (this.screeningEvent) {
      if (this.temperatureIsNormal) {
        return "okay"; // or possible-fever, or error-temp
      } else if (this.temperatureIsHigherThanNormal) {
        return "possible-fever";
      } else if (this.temperatureIsProbablyAnError) {
        return "error";
      } //debugger;

    }

    return null;
  }

  get hasScreeningResult() {
    return this.screeningResultClass !== null;
  }

  get isTooFar() {
    return this.state === ScreeningState.TOO_FAR;
  }

  get isWarmingUp() {
    return this.state === ScreeningState.WARMING_UP;
  }

  get warmupBackgroundColour() {
    // Lerp between
    const hueStart = 37;
    const saturationStart = 70;
    const lightnessStart = 66;
    const hueEnd = 198;
    const saturationEnd = 100;
    const lightnessEnd = 42;
    const val = Math.min(1, (WARMUP_TIME_SECONDS - this.warmupSecondsRemaining) / WARMUP_TIME_SECONDS);
    const hue = lerp(hueEnd, val, hueStart);
    const saturation = lerp(saturationEnd, val, saturationStart);
    const lightness = lerp(lightnessEnd, val, lightnessStart);
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  get isAquiring() {
    return this.state === ScreeningState.LARGE_BODY || this.state === ScreeningState.FACE_LOCK || this.state === ScreeningState.HEAD_LOCK || this.state === ScreeningState.FRONTAL_LOCK;
  }

  get missingRef() {
    return this.state === ScreeningState.MISSING_THERMAL_REF;
  }

  get remainingWarmupTime() {
    const secondsRemaining = this.warmupSecondsRemaining;
    const minsRemaining = Math.floor(secondsRemaining / 60);
    const seconds = secondsRemaining - minsRemaining * 60;
    return ` ${String(minsRemaining).padStart(2, "0")}:${String(Math.floor(seconds)).padStart(2, "0")}`;
  }

  get message() {
    switch (this.state) {
      case ScreeningState.WARMING_UP:
        return {
          message: "Please wait",
          count: Number.MAX_SAFE_INTEGER
        };

      case ScreeningState.MULTIPLE_HEADS:
        return {
          message: "Only one person should be in front of the camera",
          count: 60
        };

      case ScreeningState.HEAD_LOCK:
      case ScreeningState.FACE_LOCK:
        return {
          message: "Please look straight ahead",
          count: -1
        };

      case ScreeningState.FRONTAL_LOCK:
        return {
          message: "Great, now hold still a moment",
          count: 120
        };

      case ScreeningState.STABLE_LOCK:
        if (this.screeningEvent) {
          if (this.temperatureIsNormal) {
            return {
              message: `Your temperature is normal`,
              count: 460
            };
          } else if (this.temperatureIsHigherThanNormal) {
            return {
              message: "Your temperature is higher than normal, please don't enter",
              count: 180
            };
          } else if (this.temperatureIsProbablyAnError) {
            return {
              message: "Temperature anomaly, please check equipment",
              count: 360
            };
          }
        }

        break;

      case ScreeningState.MEASURED:
        if (this.screeningEvent) {
          if (this.temperatureIsNormal) {
            return {
              message: "You're good to go!",
              count: -1
            };
          } else {
            return {
              message: "You can go, but you need to get a follow-up",
              count: -1
            };
          }
        } else {
          return {
            message: "",
            count: -1
          };
        }

      case ScreeningState.READY:
      default:
        return {
          message: "Ready to screen",
          count: Number.MAX_SAFE_INTEGER
        };
    }

    return {
      message: "",
      count: 0
    };
  }

};

Object(tslib_es6["a" /* __decorate */])([Object(vue_property_decorator["c" /* Prop */])({
  required: true
})], UserFacingScreeningvue_type_script_lang_ts_UserFacingScreening.prototype, "state", void 0);

Object(tslib_es6["a" /* __decorate */])([Object(vue_property_decorator["c" /* Prop */])({
  required: true
})], UserFacingScreeningvue_type_script_lang_ts_UserFacingScreening.prototype, "screeningEvent", void 0);

Object(tslib_es6["a" /* __decorate */])([Object(vue_property_decorator["c" /* Prop */])({
  required: true
})], UserFacingScreeningvue_type_script_lang_ts_UserFacingScreening.prototype, "calibration", void 0);

Object(tslib_es6["a" /* __decorate */])([Object(vue_property_decorator["c" /* Prop */])({
  required: true
})], UserFacingScreeningvue_type_script_lang_ts_UserFacingScreening.prototype, "onReferenceDevice", void 0);

Object(tslib_es6["a" /* __decorate */])([Object(vue_property_decorator["c" /* Prop */])({
  required: true
})], UserFacingScreeningvue_type_script_lang_ts_UserFacingScreening.prototype, "face", void 0);

Object(tslib_es6["a" /* __decorate */])([Object(vue_property_decorator["c" /* Prop */])({
  required: true
})], UserFacingScreeningvue_type_script_lang_ts_UserFacingScreening.prototype, "shapes", void 0);

Object(tslib_es6["a" /* __decorate */])([Object(vue_property_decorator["c" /* Prop */])({
  required: true
})], UserFacingScreeningvue_type_script_lang_ts_UserFacingScreening.prototype, "warmupSecondsRemaining", void 0);

Object(tslib_es6["a" /* __decorate */])([Object(vue_property_decorator["e" /* Watch */])("screeningEvent")], UserFacingScreeningvue_type_script_lang_ts_UserFacingScreening.prototype, "onScreeningEventChange", null);

UserFacingScreeningvue_type_script_lang_ts_UserFacingScreening = Object(tslib_es6["a" /* __decorate */])([Object(vue_property_decorator["a" /* Component */])({
  components: {
    AdminSettings: components_AdminSettings
  }
})], UserFacingScreeningvue_type_script_lang_ts_UserFacingScreening);
/* harmony default export */ var UserFacingScreeningvue_type_script_lang_ts_ = (UserFacingScreeningvue_type_script_lang_ts_UserFacingScreening);
// CONCATENATED MODULE: ./src/components/UserFacingScreening.vue?vue&type=script&lang=ts&
 /* harmony default export */ var components_UserFacingScreeningvue_type_script_lang_ts_ = (UserFacingScreeningvue_type_script_lang_ts_); 
// EXTERNAL MODULE: ./src/components/UserFacingScreening.vue?vue&type=style&index=0&id=1ad9577b&scoped=true&lang=scss&
var UserFacingScreeningvue_type_style_index_0_id_1ad9577b_scoped_true_lang_scss_ = __webpack_require__("394c");

// CONCATENATED MODULE: ./src/components/UserFacingScreening.vue






/* normalize component */

var UserFacingScreening_component = Object(componentNormalizer["a" /* default */])(
  components_UserFacingScreeningvue_type_script_lang_ts_,
  UserFacingScreeningvue_type_template_id_1ad9577b_scoped_true_render,
  UserFacingScreeningvue_type_template_id_1ad9577b_scoped_true_staticRenderFns,
  false,
  null,
  "1ad9577b",
  null
  
)

/* harmony default export */ var components_UserFacingScreening = (UserFacingScreening_component.exports);

/* vuetify-loader */






installComponents_default()(UserFacingScreening_component, {VBtn: VBtn["a" /* default */],VCard: VCard["a" /* default */],VCardActions: components_VCard["a" /* VCardActions */],VDialog: VDialog["a" /* default */],VIcon: VIcon["a" /* default */]})

// EXTERNAL MODULE: ./node_modules/worker-loader/dist/cjs.js!./src/frame-listener.ts
var frame_listener = __webpack_require__("d94d");
var frame_listener_default = /*#__PURE__*/__webpack_require__.n(frame_listener);

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--13-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/ts-loader??ref--13-3!./node_modules/vuetify-loader/lib/loader.js??ref--19-0!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/App.vue?vue&type=script&lang=ts&
function Appvue_type_script_lang_ts_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function Appvue_type_script_lang_ts_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { Appvue_type_script_lang_ts_ownKeys(Object(source), true).forEach(function (key) { Appvue_type_script_lang_ts_defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { Appvue_type_script_lang_ts_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function Appvue_type_script_lang_ts_defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }











let Appvue_type_script_lang_ts_App = class App extends vue_property_decorator["d" /* Vue */] {
  constructor() {
    super(...arguments);
    this.deviceID = 0;
    this.deviceName = "";
    this.appVersion = "";
    this.appState = State;
    this.isNotFullscreen = true;
    this.showUpdatedCalibrationSnackbar = false;
    this.skippedWarmup = false;
    this.prevShape = [];
    this.nextShape = [];
    this.showSoftwareVersionUpdatedPrompt = false;
    this.useLiveCamera = true;
  }

  get isReferenceDevice() {
    return window.navigator.userAgent.includes("Lenovo TB-X605LC") || this.isRunningInAndroidWebview;
  }

  get isRunningInAndroidWebview() {
    return window.navigator.userAgent === "feverscreen-app";
  }

  get isFakeReferenceDevice() {
    return window.navigator.userAgent.includes("Fake");
  }

  async enableFullscreen() {
    try {
      await document.body.requestFullscreen();
      this.isNotFullscreen = false;
    } catch (e) {
      return;
    }
  }

  skipWarmup() {
    this.skippedWarmup = true;
  }

  get currentFrameCount() {
    // NOTE(jon): This is always zero if it's the fake thermal camera.
    if (this.appState.currentFrame.frameInfo) {
      return this.appState.currentFrame.frameInfo.Telemetry.FrameCount;
    }

    return 0;
  }

  updateCalibration(nextCalibration, firstLoad = false) {
    if (!firstLoad && this.appState.uuid !== nextCalibration.UuidOfUpdater) {
      this.showUpdatedCalibrationSnackbar = true;
      setTimeout(() => {
        this.showUpdatedCalibrationSnackbar = false;
      }, 3000);
    }

    this.appState.currentCalibration.thermalRefTemperature = new DegreesCelsius(nextCalibration.ThermalRefTemp);
    this.appState.currentCalibration.calibrationTemperature = new DegreesCelsius(nextCalibration.TemperatureCelsius);
    this.appState.currentCalibration.thresholdMinFever = nextCalibration.ThresholdMinFever;
    this.appState.currentCalibration.cropBox = {
      top: nextCalibration.Top,
      right: nextCalibration.Right,
      bottom: nextCalibration.Bottom,
      left: nextCalibration.Left
    };
    this.appState.currentCalibration.playNormalSound = nextCalibration.UseNormalSound;
    this.appState.currentCalibration.playWarningSound = nextCalibration.UseWarningSound;
    this.appState.currentCalibration.playErrorSound = nextCalibration.UseErrorSound;
  }

  onCropChanged(cropBox) {
    this.appState.currentCalibration.cropBox = cropBox;
  }

  saveCropChanges() {
    console.log("save crop changes", JSON.parse(JSON.stringify(this.appState.currentCalibration.cropBox)));
  }

  get currentFrame() {
    return this.appState.currentFrame;
  }

  get timeOnInSeconds() {
    var _this$frameInfo;

    const telemetry = (_this$frameInfo = this.frameInfo) === null || _this$frameInfo === void 0 ? void 0 : _this$frameInfo.Telemetry;

    if (telemetry) {
      let timeOnSecs; // NOTE: TimeOn is in nanoseconds when coming from the camera server,
      //  but in milliseconds when coming from a CPTV file - should make these the same.

      if (this.useLiveCamera) {
        timeOnSecs = telemetry.TimeOn / 1000 / 1000 / 1000;
      } else {
        timeOnSecs = telemetry.TimeOn / 1000;
      }

      return timeOnSecs;
    }

    return WARMUP_TIME_SECONDS;
  }

  get isWarmingUp() {
    return !this.skippedWarmup && this.timeOnInSeconds < WARMUP_TIME_SECONDS;
  }

  get remainingWarmupTime() {
    if (this.skippedWarmup) {
      return 0;
    }

    return Math.max(0, WARMUP_TIME_SECONDS - this.timeOnInSeconds);
  }

  get isDuringFFCEvent() {
    var _this$frameInfo2;

    const telemetry = (_this$frameInfo2 = this.frameInfo) === null || _this$frameInfo2 === void 0 ? void 0 : _this$frameInfo2.Telemetry;

    if (!this.isWarmingUp && telemetry) {
      // TODO(jon): This needs to change based on whether camera is live or not
      return (telemetry.TimeOn - telemetry.LastFFCTime) / 1000 < FFC_SAFETY_DURATION_SECONDS;
    }

    return false;
  }

  get isGettingFrames() {
    // Did we receive any frames in the past second?
    return this.appState.lastFrameTime > new Date().getTime() - 1000;
  }

  get isConnected() {
    return this.appState.cameraConnectionState === CameraConnectionState.Connected;
  }

  get isConnecting() {
    return this.appState.cameraConnectionState === CameraConnectionState.Connecting;
  }

  updateBodyOutline(body) {
    this.prevShape = this.nextShape;
    const shape = [];

    for (let i = 0; i < body.length; i += 3) {
      const y = body[i];
      const x0 = body[i + 1];
      const x1 = body[i + 2];
      shape.push({
        x0,
        x1,
        y
      });
    }

    LerpAmount.amount = 0.0;

    if (shape.length) {
      this.nextShape = [Object.freeze(shape)];
    } else {
      this.nextShape = [];
    }
  }

  checkForSoftwareUpdatesThisFrame(frame) {
    const newLine = frame.frameInfo.AppVersion.indexOf("\n");

    if (newLine !== -1) {
      frame.frameInfo.AppVersion = frame.frameInfo.AppVersion.substring(0, newLine);
    } // Did the software get updated?


    checkForSoftwareUpdates(frame.frameInfo.BinaryVersion, frame.frameInfo.AppVersion);
  }

  checkForCalibrationUpdatesThisFrame(frame) {
    if (this.frameInfo) {
      const prevCalibration = JSON.stringify(this.frameInfo.Calibration);
      const nextCalibration = JSON.stringify(frame.frameInfo.Calibration);

      if (prevCalibration !== nextCalibration) {
        this.updateCalibration(frame.frameInfo.Calibration);
      }
    }
  }

  async onFrame(frame) {
    this.checkForSoftwareUpdatesThisFrame(frame);
    this.checkForCalibrationUpdatesThisFrame(frame);
    this.updateBodyOutline(frame.bodyShape);
    this.appState.lastFrameTime = new Date().getTime();

    if (!this.isWarmingUp) {
      const prevScreeningState = this.appState.currentScreeningState;
      const nextScreeningState = frame.analysisResult.nextState;

      if (prevScreeningState === ScreeningState.STABLE_LOCK && nextScreeningState === ScreeningState.MEASURED) {
        const face = frame.analysisResult.face;
        const thermalRef = frame.analysisResult.thermalRef;
        this.snapshotScreeningEvent(thermalRef, face, frame, Appvue_type_script_lang_ts_objectSpread(Appvue_type_script_lang_ts_objectSpread({}, face.samplePoint), {}, {
          v: face.sampleValue,
          t: face.sampleTemp
        }));
      } else if (prevScreeningState === ScreeningState.MEASURED && nextScreeningState === ScreeningState.READY) {
        if (this.isReferenceDevice) {
          ScreeningApi.recordScreeningEvent(this.deviceName, this.deviceID, this.appState.currentScreeningEvent);
        }

        this.appState.currentScreeningEvent = null;
      }

      this.appState.currentScreeningState = nextScreeningState;
    } else {
      this.appState.currentScreeningState = ScreeningState.WARMING_UP;
    }

    this.appState.currentFrame = frame;
  }

  get frameInfo() {
    var _this$appState$curren;

    return (_this$appState$curren = this.appState.currentFrame) === null || _this$appState$curren === void 0 ? void 0 : _this$appState$curren.frameInfo;
  }

  snapshotScreeningEvent(thermalReference, face, frame, sample) {
    this.appState.currentScreeningEvent = {
      rawTemperatureValue: sample.v,
      calculatedValue: sample.t,
      sampleX: sample.x,
      sampleY: sample.y,
      frame,
      timestamp: new Date(),
      thermalReference,
      face
    };
    return;
  }

  onConnectionStateChange(connection) {
    this.appState.cameraConnectionState = connection;
  }

  async created() {
    // Update the AppState:
    if (this.useLiveCamera) {
      this.appState.uuid = new Date().getTime();
      const existingCalibration = await DeviceApi.getCalibration();
      this.updateCalibration(existingCalibration, true);
      const {
        appVersion,
        binaryVersion
      } = await DeviceApi.softwareVersion();
      const {
        deviceID,
        devicename
      } = await DeviceApi.deviceInfo();
      this.deviceID = deviceID;
      this.deviceName = devicename;
      const newLine = appVersion.indexOf("\n");
      let newAppVersion = appVersion;

      if (newLine !== -1) {
        newAppVersion = newAppVersion.substring(0, newLine);
      }

      this.appVersion = newAppVersion;

      if (checkForSoftwareUpdates(binaryVersion, newAppVersion, false)) {
        this.showSoftwareVersionUpdatedPrompt = true;
      }
    }

    const frameListener = new frame_listener_default.a();

    frameListener.onmessage = message => {
      const frameMessage = message.data;

      switch (frameMessage.type) {
        case "gotFrame":
          {
            this.onFrame(frameMessage.payload);
          }
          break;

        case "connectionStateChange":
          this.onConnectionStateChange(frameMessage.payload);
          break;
      }
    };

    frameListener.postMessage({
      useLiveCamera: this.useLiveCamera,
      hostname: window.location.hostname,
      port: window.location.port,
      cptvFileToPlayback: "/cptv-files/0.7.5beta recording-1 2708.cptv"
    });
  }

};
Appvue_type_script_lang_ts_App = Object(tslib_es6["a" /* __decorate */])([Object(vue_property_decorator["a" /* Component */])({
  components: {
    UserFacingScreening: components_UserFacingScreening,
    VideoStream: components_VideoStream
  }
})], Appvue_type_script_lang_ts_App);
/* harmony default export */ var Appvue_type_script_lang_ts_ = (Appvue_type_script_lang_ts_App);
// CONCATENATED MODULE: ./src/App.vue?vue&type=script&lang=ts&
 /* harmony default export */ var src_Appvue_type_script_lang_ts_ = (Appvue_type_script_lang_ts_); 
// EXTERNAL MODULE: ./src/App.vue?vue&type=style&index=0&lang=scss&
var Appvue_type_style_index_0_lang_scss_ = __webpack_require__("5c0b");

// EXTERNAL MODULE: ./node_modules/vuetify/lib/components/VApp/VApp.js
var VApp = __webpack_require__("7496");

// EXTERNAL MODULE: ./node_modules/vuetify/lib/components/VSnackbar/VSnackbar.js
var VSnackbar = __webpack_require__("2db4");

// CONCATENATED MODULE: ./src/App.vue






/* normalize component */

var App_component = Object(componentNormalizer["a" /* default */])(
  src_Appvue_type_script_lang_ts_,
  render,
  staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ var src_App = (App_component.exports);

/* vuetify-loader */








installComponents_default()(App_component, {VApp: VApp["a" /* default */],VBtn: VBtn["a" /* default */],VCard: VCard["a" /* default */],VCardActions: components_VCard["a" /* VCardActions */],VCardTitle: components_VCard["d" /* VCardTitle */],VDialog: VDialog["a" /* default */],VSnackbar: VSnackbar["a" /* default */]})

// EXTERNAL MODULE: ./node_modules/vuetify/lib/framework.js + 22 modules
var framework = __webpack_require__("f309");

// CONCATENATED MODULE: ./src/plugins/vuetify.ts


vue_runtime_esm["a" /* default */].use(framework["a" /* default */]);
/* harmony default export */ var vuetify = (new framework["a" /* default */]({
  icons: {
    iconfont: "mdiSvg"
  }
}));
// CONCATENATED MODULE: ./src/main.ts






vue_runtime_esm["a" /* default */].config.productionTip = false;
const DEFAULT_THRESHOLD_MIN_FEVER = 37.8;
const WARMUP_TIME_SECONDS = 30 * 60; // 30 mins

const FFC_SAFETY_DURATION_SECONDS = 5; // A global that stores the current interpolation state - can probably become part of the vue components.

const LerpAmount = {
  amount: 0
};
const State = {
  currentFrame: null,
  cameraConnectionState: CameraConnectionState.Disconnected,
  face: null,
  paused: false,
  currentCalibration: {
    calibrationTemperature: new DegreesCelsius(36),
    thermalReferenceRawValue: 30000,
    hotspotRawTemperatureValue: 31000,
    timestamp: new Date(),
    cropBox: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    },
    thresholdMinFever: DEFAULT_THRESHOLD_MIN_FEVER,
    thermalRefTemperature: new DegreesCelsius(0),
    playErrorSound: true,
    playNormalSound: true,
    playWarningSound: true
  },
  currentScreeningEvent: null,
  currentScreeningState: ScreeningState.INIT,
  currentScreeningStateFrameCount: -1,
  lastFrameTime: 0,
  uuid: 0,
  analysisResult: {
    thresholdSum: 0,
    motionThresholdSum: 0,
    heatStats: {
      max: 0,
      min: 0,
      threshold: 0
    },
    face: {
      isValid: false,
      headLock: 0,
      halfwayRatio: 0.0,
      samplePoint: {
        x: 0,
        y: 0
      },
      sampleValue: 0,
      sampleTemp: 0,
      head: {
        topLeft: {
          x: 0,
          y: 0
        },
        topRight: {
          x: 0,
          y: 0
        },
        bottomLeft: {
          x: 0,
          y: 0
        },
        bottomRight: {
          x: 0,
          y: 0
        }
      }
    },
    thermalRef: {
      geom: {
        center: {
          x: 0,
          y: 0
        },
        radius: 0
      },
      val: 0,
      temp: 0
    },
    hasBody: false,
    nextState: ScreeningState.INIT,
    motionSum: 0,
    frameBottomSum: 0
  }
};
/*
//these are the *lowest* temperature in celsius for each category
let GThreshold_error = 42.5;
let GThreshold_fever = 37.8;
let GThreshold_check = 37.4;
let GThreshold_normal = 35.7;
 */

new vue_runtime_esm["a" /* default */]({
  vuetify: vuetify,
  render: h => h(src_App)
}).$mount("#app");

/***/ }),

/***/ "d94d":
/***/ (function(module, exports, __webpack_require__) {

module.exports = function() {
  return new Worker(__webpack_require__.p + "f5db149f2739292ab9a5.worker.js");
};

/***/ }),

/***/ "e10f":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_19_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_VideoStream_vue_vue_type_style_index_0_id_6b993736_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("cbfc");
/* harmony import */ var _node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_19_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_VideoStream_vue_vue_type_style_index_0_id_6b993736_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_19_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_VideoStream_vue_vue_type_style_index_0_id_6b993736_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0__);
/* unused harmony reexport * */
 /* unused harmony default export */ var _unused_webpack_default_export = (_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_19_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_VideoStream_vue_vue_type_style_index_0_id_6b993736_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ })

/******/ });
//# sourceMappingURL=app.6a5fee80.js.map