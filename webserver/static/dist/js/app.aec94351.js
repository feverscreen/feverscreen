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

/***/ "2eee":
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "37e0":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_19_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_VideoCropControls_vue_vue_type_style_index_0_id_45ccf73a_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("9475");
/* harmony import */ var _node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_19_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_VideoCropControls_vue_vue_type_style_index_0_id_45ccf73a_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_19_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_VideoCropControls_vue_vue_type_style_index_0_id_45ccf73a_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0__);
/* unused harmony reexport * */
 /* unused harmony default export */ var _unused_webpack_default_export = (_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_19_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_VideoCropControls_vue_vue_type_style_index_0_id_45ccf73a_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "40f7":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_19_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_UserFacingScreening_vue_vue_type_style_index_0_id_fedccc62_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("7a1e");
/* harmony import */ var _node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_19_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_UserFacingScreening_vue_vue_type_style_index_0_id_fedccc62_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_19_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_UserFacingScreening_vue_vue_type_style_index_0_id_fedccc62_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0__);
/* unused harmony reexport * */
 /* unused harmony default export */ var _unused_webpack_default_export = (_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_19_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_UserFacingScreening_vue_vue_type_style_index_0_id_fedccc62_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "4a4b":
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "4c78":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_19_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_DeveloperUtilities_vue_vue_type_style_index_0_id_e0112a36_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("a314");
/* harmony import */ var _node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_19_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_DeveloperUtilities_vue_vue_type_style_index_0_id_e0112a36_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_19_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_DeveloperUtilities_vue_vue_type_style_index_0_id_e0112a36_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0__);
/* unused harmony reexport * */
 /* unused harmony default export */ var _unused_webpack_default_export = (_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_19_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_DeveloperUtilities_vue_vue_type_style_index_0_id_e0112a36_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "5c0b":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_19_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_App_vue_vue_type_style_index_0_lang_scss___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("7694");
/* harmony import */ var _node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_19_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_App_vue_vue_type_style_index_0_lang_scss___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_19_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_App_vue_vue_type_style_index_0_lang_scss___WEBPACK_IMPORTED_MODULE_0__);
/* unused harmony reexport * */
 /* unused harmony default export */ var _unused_webpack_default_export = (_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_19_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_App_vue_vue_type_style_index_0_lang_scss___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "5cbd":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_19_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_VideoStream_vue_vue_type_style_index_0_id_6544bfa0_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("2eee");
/* harmony import */ var _node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_19_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_VideoStream_vue_vue_type_style_index_0_id_6544bfa0_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_19_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_VideoStream_vue_vue_type_style_index_0_id_6544bfa0_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0__);
/* unused harmony reexport * */
 /* unused harmony default export */ var _unused_webpack_default_export = (_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_19_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_VideoStream_vue_vue_type_style_index_0_id_6544bfa0_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "7694":
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "7a1e":
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "9475":
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "a314":
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "cd49":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, "DEFAULT_THRESHOLD_MIN_NORMAL", function() { return /* binding */ DEFAULT_THRESHOLD_MIN_NORMAL; });
__webpack_require__.d(__webpack_exports__, "DEFAULT_THRESHOLD_MIN_FEVER", function() { return /* binding */ DEFAULT_THRESHOLD_MIN_FEVER; });
__webpack_require__.d(__webpack_exports__, "WARMUP_TIME_SECONDS", function() { return /* binding */ WARMUP_TIME_SECONDS; });
__webpack_require__.d(__webpack_exports__, "FFC_SAFETY_DURATION_SECONDS", function() { return /* binding */ FFC_SAFETY_DURATION_SECONDS; });
__webpack_require__.d(__webpack_exports__, "State", function() { return /* binding */ State; });

// EXTERNAL MODULE: ./node_modules/vue/dist/vue.runtime.esm.js
var vue_runtime_esm = __webpack_require__("2b0e");

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"67c5eee7-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vuetify-loader/lib/loader.js??ref--19-0!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/App.vue?vue&type=template&id=5afe35cc&
var render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-app',{attrs:{"id":"app"},on:{"skip-warmup":_vm.skipWarmup}},[_c('UserFacingScreening',{attrs:{"on-reference-device":_vm.isReferenceDevice,"state":_vm.appState.currentScreeningState,"screening-event":_vm.appState.currentScreeningEvent,"calibration":_vm.appState.currentCalibration,"face":_vm.appState.face,"warmup-seconds-remaining":_vm.remainingWarmupTime,"shapes":[_vm.prevShape, _vm.nextShape]}}),_c('v-dialog',{attrs:{"width":"500"},model:{value:(_vm.showSoftwareVersionUpdatedPrompt),callback:function ($$v) {_vm.showSoftwareVersionUpdatedPrompt=$$v},expression:"showSoftwareVersionUpdatedPrompt"}},[_c('v-card',[_c('v-card-title',[_vm._v(" This software has been updated. "+_vm._s(_vm.appVersion)+" ")]),_c('v-card-actions',{attrs:{"center":""}},[_c('v-btn',{attrs:{"text":""},on:{"click":function (e) { return (_vm.showSoftwareVersionUpdatedPrompt = false); }}},[_vm._v(" Proceed ")])],1)],1)],1),_c('v-snackbar',{model:{value:(_vm.showUpdatedCalibrationSnackbar),callback:function ($$v) {_vm.showUpdatedCalibrationSnackbar=$$v},expression:"showUpdatedCalibrationSnackbar"}},[_vm._v(" Calibration was updated ")]),_c('div',{staticClass:"debug-video"},[(!_vm.isReferenceDevice && _vm.appState.currentFrame)?_c('VideoStream',{attrs:{"frame":_vm.appState.currentFrame.frame,"face":_vm.appState.face,"min":_vm.appState.currentFrame.analysisResult.heatStats.min,"max":_vm.appState.currentFrame.analysisResult.heatStats.max,"crop-box":_vm.cropBoxPixelBounds,"crop-enabled":false,"draw-overlays":true,"show-coords":true}}):_vm._e()],1)],1)}
var staticRenderFns = []


// CONCATENATED MODULE: ./src/App.vue?vue&type=template&id=5afe35cc&

// EXTERNAL MODULE: ./node_modules/tslib/tslib.es6.js
var tslib_es6 = __webpack_require__("9ab4");

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"67c5eee7-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vuetify-loader/lib/loader.js??ref--19-0!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/UserFacingScreening.vue?vue&type=template&id=fedccc62&scoped=true&
var UserFacingScreeningvue_type_template_id_fedccc62_scoped_true_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"user-state",class:[
    _vm.classNameForState,
    _vm.screeningResultClass,
    { 'mini-view': !_vm.onReferenceDevice }
  ],style:({ background: _vm.warmupBackgroundColour }),attrs:{"id":"user-facing-screening"},on:{"click":function($event){_vm.interacted = true}}},[(!_vm.isWarmingUp)?_c('canvas',{ref:"beziers",attrs:{"id":"beziers","width":"810","height":"1080"}}):_vm._e(),_c('div',{staticClass:"center",class:{ 'warming-up': _vm.isWarmingUp }},[(_vm.hasScreeningResult)?_c('div',{staticClass:"result"},[_vm._v(" "+_vm._s(_vm.temperature)+" ")]):_c('div',{domProps:{"innerHTML":_vm._s(_vm.messageText)}})]),(_vm.onReferenceDevice || _vm.isLocal)?_c('v-card',{staticClass:"settings-toggle-button",class:{ interacted: _vm.interacted },attrs:{"dark":"","flat":"","height":"44","tile":"","color":"transparent"}},[_c('v-card-actions',[_c('v-btn',{attrs:{"absolute":"","dark":"","fab":"","bottom":"","right":"","elevation":"0","color":"transparent"},on:{"click":function (e) {
            if (_vm.interacted) {
              _vm.showSettings = true;
              _vm.hasSettings = true;
            }
          }}},[_c('v-icon',{attrs:{"color":"rgba(255, 255, 255, 0.5)","large":""}},[_vm._v(_vm._s(_vm.cogIcon))])],1)],1)],1):_vm._e(),_c('v-dialog',{attrs:{"hide-overlay":"","attach":"#user-facing-screening","fullscreen":"","transition":"dialog-bottom-transition"},model:{value:(_vm.showSettings),callback:function ($$v) {_vm.showSettings=$$v},expression:"showSettings"}},[(_vm.hasSettings)?_c('AdminSettings',{on:{"closed":_vm.closedAdminSettings}}):_vm._e()],1)],1)}
var UserFacingScreeningvue_type_template_id_fedccc62_scoped_true_staticRenderFns = []


// CONCATENATED MODULE: ./src/components/UserFacingScreening.vue?vue&type=template&id=fedccc62&scoped=true&

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
  ScreeningState["LEAVING"] = "LEAVING";
  ScreeningState["MISSING_THERMAL_REF"] = "MISSING_REF";
})(ScreeningState || (ScreeningState = {})); // This describes the state machine of allowed state transitions for the screening event.


const ScreeningAcceptanceStates = {
  [ScreeningState.INIT]: [ScreeningState.WARMING_UP, ScreeningState.READY, ScreeningState.MISSING_THERMAL_REF],
  [ScreeningState.WARMING_UP]: [ScreeningState.READY, ScreeningState.MISSING_THERMAL_REF],
  [ScreeningState.MULTIPLE_HEADS]: [ScreeningState.READY, ScreeningState.HEAD_LOCK, ScreeningState.FACE_LOCK, ScreeningState.FRONTAL_LOCK, ScreeningState.MISSING_THERMAL_REF],
  [ScreeningState.LARGE_BODY]: [ScreeningState.READY, ScreeningState.HEAD_LOCK, ScreeningState.MULTIPLE_HEADS, ScreeningState.FACE_LOCK, ScreeningState.FRONTAL_LOCK, ScreeningState.TOO_FAR, ScreeningState.MISSING_THERMAL_REF],
  [ScreeningState.TOO_FAR]: [ScreeningState.READY, ScreeningState.HEAD_LOCK, ScreeningState.MULTIPLE_HEADS, ScreeningState.FACE_LOCK, ScreeningState.FRONTAL_LOCK, ScreeningState.MISSING_THERMAL_REF],
  [ScreeningState.READY]: [ScreeningState.TOO_FAR, ScreeningState.LARGE_BODY, ScreeningState.HEAD_LOCK, ScreeningState.MULTIPLE_HEADS, ScreeningState.FACE_LOCK, ScreeningState.FRONTAL_LOCK, ScreeningState.MISSING_THERMAL_REF],
  [ScreeningState.FACE_LOCK]: [ScreeningState.TOO_FAR, ScreeningState.LARGE_BODY, ScreeningState.HEAD_LOCK, ScreeningState.MULTIPLE_HEADS, ScreeningState.FRONTAL_LOCK, ScreeningState.READY, ScreeningState.MISSING_THERMAL_REF],
  [ScreeningState.FRONTAL_LOCK]: [ScreeningState.TOO_FAR, ScreeningState.LARGE_BODY, ScreeningState.STABLE_LOCK, ScreeningState.FACE_LOCK, ScreeningState.MULTIPLE_HEADS, ScreeningState.HEAD_LOCK, ScreeningState.READY, ScreeningState.MISSING_THERMAL_REF],
  [ScreeningState.HEAD_LOCK]: [ScreeningState.TOO_FAR, ScreeningState.LARGE_BODY, ScreeningState.FACE_LOCK, ScreeningState.FRONTAL_LOCK, ScreeningState.READY, ScreeningState.MULTIPLE_HEADS, ScreeningState.MISSING_THERMAL_REF],
  [ScreeningState.STABLE_LOCK]: [ScreeningState.LEAVING],
  [ScreeningState.LEAVING]: [ScreeningState.READY],
  [ScreeningState.MISSING_THERMAL_REF]: [ScreeningState.READY, ScreeningState.TOO_FAR, ScreeningState.LARGE_BODY]
};
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
const getHistogram = (data, numBuckets) => {
  // Find find the total range of the data
  let max = 0;
  let min = Number.MAX_SAFE_INTEGER;

  for (let i = 0; i < data.length; i++) {
    const u16Val = data[i];

    if (u16Val < min) {
      min = u16Val;
    }

    if (u16Val > max) {
      max = u16Val;
    }
  } // A histogram with 16 buckets seems sufficiently coarse for this
  // The histogram is usually bi-modal, so we want to find the trough between the two peaks as our threshold value


  const histogram = new Uint16Array(numBuckets);

  for (let i = 0; i < data.length; i++) {
    // If within a few degrees of constant heat-source white else black.
    const v = (data[i] - min) / (max - min) * numBuckets;
    histogram[Math.floor(v)] += 1;
  }

  return {
    histogram,
    min,
    max
  };
};
const getAdaptiveThreshold = data => {
  const {
    histogram,
    min,
    max
  } = getHistogram(data, 16);
  let peak0Max = 0;
  let peak1Max = 0;
  let peak0Index = 0;
  let peak1Index = 0; // First, find the peak value, which is usually in the background temperature range.

  for (let i = 0; i < histogram.length; i++) {
    if (histogram[i] > peak0Max) {
      peak0Max = histogram[i];
      peak0Index = i;
    }
  } // Need to look for a valley in between the two bimodal peaks, so
  // keep descending from the first peak till we find a local minimum.


  let prevIndex = peak0Index;
  let index = peak0Index + 1;

  while (histogram[index] < histogram[prevIndex]) {
    prevIndex++;
    index++;
  } // Now climb up from that valley to find the second peak.


  for (let i = prevIndex; i < histogram.length; i++) {
    if (histogram[i] > peak1Max) {
      peak1Max = histogram[i];
      peak1Index = i;
    }
  } // Find the lowest point between the two peaks.


  let valleyMin = peak1Max;
  let valleyIndex = 0;

  for (let i = peak0Index + 1; i < peak1Index; i++) {
    if (histogram[i] < valleyMin) {
      valleyMin = histogram[i];
      valleyIndex = i;
    }
  }

  const range = max - min;
  return min + range / histogram.length * valleyIndex + 1;
};
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
// CONCATENATED MODULE: ./src/shape-processing.ts
const WIDTH = 120;
const HEIGHT = 160;

const pointIsLeftOfLine = (l0, l1, p) => // Use cross-product to determine which side of a line a point is on.
(l1.x - l0.x) * (p.y - l0.y) - (l1.y - l0.y) * (p.x - l0.x) > 0;

function isNotCeilingHeat(shape) {
  return !(shape[0].y === 0 && shape.length < 80);
}

function magnitude(vec) {
  return Math.sqrt(vec.x * vec.x + vec.y * vec.y);
}

function normalise(vec) {
  const len = magnitude(vec);
  return {
    x: vec.x / len,
    y: vec.y / len
  };
}

function scale(vec, scale) {
  return {
    x: vec.x * scale,
    y: vec.y * scale
  };
}

function perp(vec) {
  // noinspection JSSuspiciousNameCombination
  return {
    x: vec.y,
    y: -vec.x
  };
}

function add(a, b) {
  return {
    x: a.x + b.x,
    y: a.y + b.y
  };
}

function sub(a, b) {
  return {
    x: a.x - b.x,
    y: a.y - b.y
  };
}

const spanWidth = span => span.x1 - span.x0;

function shapeArea(shape) {
  return shape.reduce((acc, span) => acc + spanWidth(span), 0);
}

function largestShape(shapes) {
  return shapes.reduce((prevBestShape, shape) => {
    const best = shapeArea(prevBestShape);
    const area = shapeArea(shape);
    return area > best ? shape : prevBestShape;
  }, []);
}

function boundsForShape(shape) {
  const y0 = shape[0].y;
  const y1 = shape[shape.length - 1].y;
  const x0 = Math.min(...shape.map(({
    x0
  }) => x0));
  const x1 = Math.max(...shape.map(({
    x1
  }) => x1));
  return {
    x0,
    x1,
    y0,
    y1
  };
}

const startP = ({
  x0,
  y
}) => ({
  x: x0,
  y
});

const endP = ({
  x1,
  y
}) => ({
  x: x1,
  y
});

const distance = (a, b) => {
  const dX = a.x - b.x;
  const dY = a.y - b.y;
  return Math.sqrt(dX * dX + dY * dY);
};

function widestSpan(shape) {
  let maxWidthSpan = shape[0];

  for (const span of shape) {
    if (spanWidth(span) > spanWidth(maxWidthSpan)) {
      maxWidthSpan = span;
    }
  }

  return maxWidthSpan;
}

function narrowestSpan(shape) {
  let minWidthSpan;
  minWidthSpan = shape.find(x => x.x0 !== 0 && x.x1 !== WIDTH - 1);

  if (!minWidthSpan) {
    minWidthSpan = shape[0];
  } // TODO(jon): Ideally the narrowest span doesn't hit the frame edges.


  for (const span of shape) {
    if (spanWidth(span) <= spanWidth(minWidthSpan)) {
      if (span.x0 !== 0 && span.x1 !== WIDTH - 1) {
        minWidthSpan = span;
      }
    }
  }

  return minWidthSpan;
}

function narrowestSlanted(shape, start) {
  const nIndex = shape.indexOf(start); // From the narrowest, wiggle about on each side to try to find a shorter distance between spans.

  const startIndex = Math.max(0, nIndex - 10);
  const endIndex = Math.min(shape.length - 1, nIndex + 10);
  const distances = [];

  for (let i = startIndex; i < endIndex; i++) {
    for (let j = startIndex; j < endIndex; j++) {
      if (i !== j) {
        const d = distance(startP(shape[i]), endP(shape[j]));
        distances.push({
          d,
          skew: Math.abs(shape[i].y - shape[j].y),
          left: shape[i],
          right: shape[j]
        });
      }
    }
  } // If there are a bunch that are similar, prefer the least slanted one.


  distances.sort((a, b) => {
    // NOTE(defer spans where x0 or x1 is on the edge of the frame.
    if (a.left.x0 === 0 || a.right.x1 === WIDTH - 1) {
      return 1;
    } else if (b.left.x0 === 0 || b.right.x1 === WIDTH - 1) {
      return -1;
    }

    if (a.d < b.d) {
      return -1;
    } else if (a.d > b.d) {
      return 1;
    } else {
      // Give greatest skew first, then prefer highest y sum?
      if (a.skew < b.skew) {
        return -1;
      } else if (a.skew > a.skew) {
        return 1;
      } else {
        return b.right.y + b.left.y - (a.right.y + a.left.y);
      }
    }
  });
  const {
    left,
    right
  } = distances[0];
  return [left, right];
}

function narrowestSpans(shape) {
  const narrowest = narrowestSpan(shape.slice(10));
  return narrowestSlanted(shape, narrowest);
}

function drawShapes(shapes, canvas) {
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  const img = ctx.getImageData(0, 0, width, height);
  const data = new Uint32Array(img.data.buffer);
  const colours = [0x33ffff00, 0x33ff00ff, 0x3300ffff, 0x33ffff00, 0x3300ffff, 0x33ff00ff, 0xffff66ff, 0xff6633ff, 0xff0000ff];
  const faceInfo = {};
  const shape = largestShape(shapes);
  {
    const widest = widestSpan(shape.slice(Math.round(shape.length / 3 * 2)));
    const widestIndex = shape.indexOf(widest);
    const widestWidth = spanWidth(widest);
    let halfWidth; // Work from bottom and find first span that is past widest point, and is around 1/2 of the width.

    for (let i = widestIndex; i > 10; i--) {
      const span = shape[i];

      if (widestWidth / 2 > spanWidth(span)) {
        halfWidth = span;
        break;
      }
    }

    let left, right;

    if (halfWidth) {
      [left, right] = narrowestSlanted(shape.slice(10), halfWidth);
    } else {
      [left, right] = narrowestSpans(shape.slice(10));
    }

    const vec = {
      x: right.x1 - left.x0,
      y: right.y - left.y
    };
    const start = {
      x: left.x0,
      y: left.y
    };
    const halfway = scale(vec, 0.5);
    const perpV = scale(perp(vec), 3);
    const neckBaseMiddleP = add(start, halfway);
    const l1 = add(neckBaseMiddleP, perpV);
    {
      // TODO(jon): Categorise the head pixels as on the left or right side of the "center line"
      //  Sum up the pixels on each side, but also look for symmetry in terms of how far each edge is
      //  from the center line.  Ignore the portion above the eyes for this.  The eyes can be inferred
      //  as being half-way up the face.  We can do some more thresholding on the actual pixels there
      //  to try and identify eyes/glasses.
      const colour = colours[0 % colours.length];

      for (const span of shape) {
        let i = span.x0;

        if (span.x0 >= span.x1) {
          console.warn("Weird spans", span.x0, span.x1);
          continue;
        }

        do {
          const p = {
            x: i,
            y: span.y
          };

          if (!pointIsLeftOfLine({
            x: left.x0,
            y: left.y
          }, {
            x: right.x1,
            y: right.y
          }, p)) {
            if (pointIsLeftOfLine(neckBaseMiddleP, l1, p)) {//data[span.y * width + i] = 0xffff0000;
            } else {//data[span.y * width + i] = 0xffff00ff;
              }

            data[span.y * width + i] = 0x66666666;
          } // else if (span.h === 0) {
          //   data[span.y * width + i] = colour;
          // } else if (span.h === 3) {
          //   data[span.y * width + i] =
          //     (255 << 24) | (200 << 16) | (200 << 8) | 0;
          // } else if (span.h === 4) {
          //   data[span.y * width + i] =
          //     (255 << 24) | (200 << 16) | (200 << 8) | 255;
          // } else if (span.h === 8) {
          //   data[span.y * width + i] =
          //     (255 << 24) | (100 << 16) | (100 << 8) | 255;
          // } else if (span.h === 1) {
          //   data[span.y * width + i] = (255 << 24) | (0 << 16) | (0 << 8) | 200;
          // } else if (span.h === 2) {
          //   data[span.y * width + i] = (255 << 24) | (0 << 16) | (200 << 8) | 0;
          // }


          i++;
        } while (i < span.x1);
      }

      ctx.putImageData(img, 0, 0);
    }
    ctx.lineWidth = 1;
    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.moveTo(left.x0, left.y);
    ctx.lineTo(right.x1, right.y);
    ctx.stroke(); //ctx.moveTo(halfwayP.x - 2, halfwayP.y - 2);
    // ctx.fillStyle = 'yellow';
    // ctx.fillRect(l0.x - 1, l0.y - 1, 2, 2);
    // TODO(jon): March down this line with a perp vector, and stop when we don't hit any pixels on either side.
    //  Then go halfway-down the line created by this joining line, and march out to either side to get the width
    //  of the middle of the face.  Now we should be able to get the forehead box, which we'll only use if
    //  we think the face is front-on.

    const normMidline = normalise(sub(l1, neckBaseMiddleP)); // TODO(jon): Discard boxes that are too long/wide ratio-wise.

    const perpLeft = normalise(perp(normMidline));
    const perpRight = normalise(perp(perp(perp(normMidline))));
    const startY = shape[0].y; // Keep going until there are no spans to the left or right, so ray-march left and then right.

    let scaleFactor = 0;
    let heightProbeP = neckBaseMiddleP;
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    let maxLeftScale = 0;
    let maxRightScale = 0;
    const maxHeightScale = magnitude({
      x: WIDTH,
      y: HEIGHT
    });
    const leftSymmetry = [];
    const rightSymmetry = [];
    const symmetry = [];

    while (scaleFactor < maxHeightScale) {
      const scaled = scale(normMidline, scaleFactor);
      heightProbeP = add(neckBaseMiddleP, scaled);
      let foundLeft = false;
      let foundRight = false;

      for (let incLeft = 1; incLeft < 50; incLeft++) {
        const probeP = add(heightProbeP, scale(perpLeft, incLeft));
        const xInBounds = probeP.x >= 0 && probeP.x < WIDTH;
        const probeY = Math.round(probeP.y);
        const shapeIndex = probeY - startY; // ctx.fillRect(probeP.x - 0.5, probeP.y - 0.5, 1, 1);

        if (shapeIndex < 0 || shapeIndex > shape.length - 1) {
          break;
        }

        if (xInBounds && shape[shapeIndex]) {
          if (shape[shapeIndex].x0 < probeP.x && shape[shapeIndex].x1 > probeP.x) {
            //
            foundLeft = true;
            maxLeftScale = Math.max(incLeft, maxLeftScale);
          }

          if (shape[shapeIndex].x0 > probeP.x) {
            break;
          }
        }
      }

      for (let incRight = 1; incRight < 50; incRight++) {
        const probeP = add(heightProbeP, scale(perpRight, incRight));
        const xInBounds = probeP.x >= 0 && probeP.x < WIDTH;
        const probeY = Math.round(probeP.y);
        const shapeIndex = probeY - startY; // ctx.fillRect(probeP.x - 0.5, probeP.y - 0.5, 1, 1);

        if (shapeIndex < 0 || shapeIndex > shape.length - 1) {
          break;
        }

        if (xInBounds && shape[shapeIndex]) {
          if (shape[shapeIndex].x1 > probeP.x && shape[shapeIndex].x0 < probeP.x) {
            //
            foundRight = true;
            maxRightScale = Math.max(incRight, maxRightScale);
          }

          if (shape[shapeIndex].x1 < probeP.x) {
            break;
          }
        }
      }

      leftSymmetry.push(maxLeftScale);
      rightSymmetry.push(maxRightScale);
      symmetry.push(Math.abs(maxLeftScale - maxRightScale));

      if (!(foundLeft || foundRight)) {
        break;
      }

      scaleFactor += 1;
    }

    const ssym = []; // Divide left and right symmetry by maxLeftScale, maxRightScale;

    for (let i = 0; i < scaleFactor; i++) {
      ssym.push(Math.abs(leftSymmetry[i] / maxLeftScale - rightSymmetry[i] / maxRightScale));
    } // TODO(jon): Detect "fringe" cases where there's not enough forehead.


    if (heightProbeP) {
      ctx.lineWidth = 1;
      ctx.strokeStyle = "orange";
      ctx.moveTo(neckBaseMiddleP.x, neckBaseMiddleP.y);
      ctx.lineTo(heightProbeP.x, heightProbeP.y);
      ctx.stroke();
      const bottomLeftP = add(neckBaseMiddleP, scale(perpLeft, maxLeftScale));
      const bottomRightP = add(neckBaseMiddleP, scale(perpRight, maxRightScale));
      const topLeftP = add(heightProbeP, scale(perpLeft, maxLeftScale));
      const topRightP = add(heightProbeP, scale(perpRight, maxRightScale));
      const headWidth = magnitude(sub(bottomLeftP, bottomRightP));
      const headHeight = magnitude(sub(topLeftP, bottomLeftP));
      const widthHeightRatio = headWidth / headHeight;
      const isValidHead = headHeight > headWidth && widthHeightRatio > 0.5; // TODO(jon): remove too small head areas.

      if (isValidHead) {
        // We only care about symmetry of the below forehead portion of the face, since above the eyes
        //  symmetry can be affected by hair parting to one side etc.
        const symmetryScore = ssym.slice(0, Math.floor(symmetry.length / 2)).reduce((a, x) => a + x, 0);
        const areaLeft = leftSymmetry.slice(0, Math.floor(leftSymmetry.length / 2)).reduce((a, x) => a + x, 0);
        const areaRight = rightSymmetry.slice(0, Math.floor(rightSymmetry.length / 2)).reduce((a, x) => a + x, 0); // Use maxLeftScale and maxRightScale to get the face side edges.
        //console.log('area left, right', areaLeft, areaRight);
        //console.log('head width, height, ratio', headWidth, headHeight, headWidth / headHeight);

        console.log("symmetry score", symmetryScore); //console.log(ssym.slice(0, Math.floor(symmetry.length / 2)));
        //console.log(symmetry.slice(0, Math.floor(symmetry.length / 2)));

        const areaDiff = Math.abs(areaLeft - areaRight);
        console.log("areaDiff", areaDiff);

        if (symmetryScore < 2 && areaDiff < 50) {
          ctx.strokeStyle = "red";
        } else if (areaDiff >= 50) {
          ctx.strokeStyle = "blue";
        } else {
          ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
        }

        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(topLeftP.x, topLeftP.y);
        ctx.lineTo(topRightP.x, topRightP.y);
        ctx.lineTo(bottomRightP.x, bottomRightP.y);
        ctx.lineTo(bottomLeftP.x, bottomLeftP.y);
        ctx.lineTo(topLeftP.x, topLeftP.y);
        ctx.stroke(); // TODO(jon): Could also find center of mass in bottom part of the face, and compare with actual center.
        // Draw midline, draw forehead, colour forehead pixels.

        const midP = add(neckBaseMiddleP, scale(normMidline, scaleFactor * 0.5));
        const midLeftP = add(midP, scale(perpLeft, maxLeftScale));
        const midRightP = add(midP, scale(perpRight, maxRightScale));
        ctx.moveTo(midLeftP.x, midLeftP.y);
        ctx.lineTo(midRightP.x, midRightP.y);
        ctx.stroke();
        const foreheadTopP = add(neckBaseMiddleP, scale(normMidline, scaleFactor * 0.8));
        const foreheadTopLeftP = add(foreheadTopP, scale(perpLeft, maxLeftScale));
        const foreheadTopRightP = add(foreheadTopP, scale(perpRight, maxRightScale));
        ctx.beginPath();
        ctx.moveTo(foreheadTopLeftP.x, foreheadTopLeftP.y);
        ctx.lineTo(foreheadTopRightP.x, foreheadTopRightP.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(foreheadTopP.x, foreheadTopP.y, 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
      }
    } // TODO(jon): Draw a line perpendicular to this line.
    // Then we can find the top of the head, and then the widest part of the head.
    // Then we can draw an oval.
    // The angle of the neck also helps us know if the head is front-on.
    // If the face is front-on, the width of the neck is roughly a third the width of shoulders, if visible.
    // TODO(jon): Separate case for animated outlines where we paint in irregularities in the head.

  }
  return faceInfo;
}
function areEqual(a, b) {
  return a.x0 === b.x0 && a.x1 === b.x1 && a.y === b.y;
}
const LerpAmount = {
  amount: 0
};
// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"67c5eee7-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vuetify-loader/lib/loader.js??ref--19-0!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/AdminSettings.vue?vue&type=template&id=34541e83&scoped=true&
var AdminSettingsvue_type_template_id_34541e83_scoped_true_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-card',[_c('v-toolbar',{attrs:{"color":"light-blue","dark":""},scopedSlots:_vm._u([{key:"extension",fn:function(){return [_c('v-tabs',{attrs:{"centered":""},model:{value:(_vm.tab),callback:function ($$v) {_vm.tab=$$v},expression:"tab"}},_vm._l((_vm.tabItems),function(item){return _c('v-tab',{key:item.tab},[_vm._v(_vm._s(item.tab))])}),1)]},proxy:true}])},[_c('v-toolbar-title',[_vm._v("Settings")]),_c('v-spacer'),_c('v-btn',{attrs:{"text":""},on:{"click":_vm.close}},[_vm._v(" close ")])],1),_c('v-tabs-items',{attrs:{"touchless":""},model:{value:(_vm.tab),callback:function ($$v) {_vm.tab=$$v},expression:"tab"}},_vm._l((_vm.tabItems),function(item){return _c('v-tab-item',{key:item.tab},[_c(item.content,{tag:"component"})],1)}),1)],1)}
var AdminSettingsvue_type_template_id_34541e83_scoped_true_staticRenderFns = []


// CONCATENATED MODULE: ./src/components/AdminSettings.vue?vue&type=template&id=34541e83&scoped=true&

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"67c5eee7-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vuetify-loader/lib/loader.js??ref--19-0!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/CalibrationSettings.vue?vue&type=template&id=24c81863&scoped=true&
var CalibrationSettingsvue_type_template_id_24c81863_scoped_true_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-card',{attrs:{"height":"calc(100vh - 112px)"}},[_c('v-container',{staticClass:"cont"},[_c('v-card',{staticClass:"split",attrs:{"flat":""}},[_c('v-card',[_c('VideoStream',{attrs:{"frame":_vm.state.currentFrame.frame,"face":_vm.state.face,"crop-box":_vm.editedCropBox,"min":_vm.state.currentFrame.analysisResult.heatStats.min,"max":_vm.state.currentFrame.analysisResult.heatStats.max,"crop-enabled":true},on:{"crop-changed":_vm.onCropChanged}})],1),_c('v-card',{staticClass:"settings",attrs:{"width":"700"}},[_c('v-card-title',[_vm._v(" Calibration: "+_vm._s(_vm.pendingCalibration)+" "),_c('v-btn',{attrs:{"text":"","disabled":!_vm.canCalibrate},on:{"click":function($event){$event.stopPropagation();return (function () { return _vm.editCalibration(); })($event)}}},[_c('v-icon',{attrs:{"color":"#999","small":""}},[_vm._v(_vm._s(_vm.pencilIcon))]),_vm._v(" Edit ")],1)],1),_c('v-dialog',{attrs:{"max-width":"400"},model:{value:(_vm.showCalibrationDialog),callback:function ($$v) {_vm.showCalibrationDialog=$$v},expression:"showCalibrationDialog"}},[_c('v-card',[_c('v-card-title',[_vm._v("Edit calibration")]),_c('v-container',[(_vm.snapshotScreeningEvent)?_c('VideoStream',{attrs:{"frame":_vm.snapshotScreeningEvent.frame.frame,"face":_vm.snapshotScreeningEvent.face,"min":_vm.state.currentFrame.analysisResult.heatStats.min,"max":_vm.state.currentFrame.analysisResult.heatStats.max,"crop-box":_vm.state.currentCalibration.cropBox,"crop-enabled":false,"draw-overlays":true,"scale":0.6}}):_vm._e()],1),_c('v-card-subtitle',[_vm._v(" Take your temperature and enter it here to calibrate the system against the current screening event. ")]),_c('v-card-text',[_c('v-text-field',{attrs:{"label":"calibrated temperature","value":_vm.editedCalibration},on:{"blur":_vm.updateCalibration}}),_c('v-card-actions',[_c('v-btn',{on:{"click":function () { return _vm.incrementCalibration(0.1); }}},[_c('v-icon',{attrs:{"light":""}},[_vm._v(_vm._s(_vm.plusIcon))])],1),_c('v-spacer'),_c('v-btn',{on:{"click":function () { return _vm.incrementCalibration(-0.1); }}},[_c('v-icon',{attrs:{"light":""}},[_vm._v(_vm._s(_vm.minusIcon))])],1)],1)],1),_c('v-card-actions',[_c('v-spacer'),_c('v-btn',{attrs:{"text":"","color":"grey darken-1"},on:{"click":function($event){_vm.showCalibrationDialog = false}}},[_vm._v(" Cancel ")]),_c('v-btn',{attrs:{"text":"","color":"green darken-1"},on:{"click":function (e) { return _vm.acceptCalibration(); }}},[_vm._v(" Accept ")])],1)],1)],1),_c('v-card-text',[_c('v-checkbox',{attrs:{"label":"Use custom alert threshold"},on:{"change":_vm.toggleCustomTemperatureThresholds},model:{value:(_vm.useCustomTemperatureRange),callback:function ($$v) {_vm.useCustomTemperatureRange=$$v},expression:"useCustomTemperatureRange"}}),_c('v-card-text',[_c('v-slider',{attrs:{"disabled":!_vm.useCustomTemperatureRange,"min":"30","max":"40","step":"0.1","thumb-label":"","ticks":true,"color":'green',"track-color":'rgba(255, 0, 0, 0.25)'},model:{value:(_vm.editedTemperatureThreshold),callback:function ($$v) {_vm.editedTemperatureThreshold=$$v},expression:"editedTemperatureThreshold"}}),_c('span',{staticClass:"selected-temp-range",domProps:{"innerHTML":_vm._s(_vm.selectedTemperatureRange)}})],1)],1),_c('v-card-title',[_vm._v("Sounds:")]),_c('v-container',{attrs:{"fluid":"","width":"100%"}},[_c('v-row',[_c('v-col',{attrs:{"cols":"4"}},[_c('v-switch',{attrs:{"label":"Play normal sound"},on:{"change":function (e) { return _vm.saveSounds(); }},model:{value:(_vm.playNormalSound),callback:function ($$v) {_vm.playNormalSound=$$v},expression:"playNormalSound"}})],1),_c('v-col',{attrs:{"cols":"4"}},[_c('v-switch',{attrs:{"label":"Play warning sound"},on:{"change":function (e) { return _vm.saveSounds(); }},model:{value:(_vm.playWarningSound),callback:function ($$v) {_vm.playWarningSound=$$v},expression:"playWarningSound"}})],1),_c('v-col',{attrs:{"cols":"4"}},[_c('v-switch',{attrs:{"label":"Play error sound"},on:{"change":function (e) { return _vm.saveSounds(); }},model:{value:(_vm.playErrorSound),callback:function ($$v) {_vm.playErrorSound=$$v},expression:"playErrorSound"}})],1)],1)],1)],1)],1),_c('v-overlay',{attrs:{"value":_vm.saving,"light":""}},[_vm._v(" Saving settings ")]),_c('v-card-actions',{staticClass:"bottom-nav"},[_c('v-btn',{attrs:{"text":"","disabled":!_vm.hasMadeEdits},on:{"click":function (e) { return _vm.resetEdits(); }}},[_vm._v(" Discard changes ")]),_c('v-btn',{attrs:{"text":"","disabled":!_vm.hasMadeEdits},on:{"click":function (e) { return _vm.saveEdits(); }}},[_vm._v(" Save changes ")])],1)],1)],1)}
var CalibrationSettingsvue_type_template_id_24c81863_scoped_true_staticRenderFns = []


// CONCATENATED MODULE: ./src/components/CalibrationSettings.vue?vue&type=template&id=24c81863&scoped=true&

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"67c5eee7-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vuetify-loader/lib/loader.js??ref--19-0!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/VideoStream.vue?vue&type=template&id=6544bfa0&scoped=true&
var VideoStreamvue_type_template_id_6544bfa0_scoped_true_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{ref:"container",class:{ recording: _vm.recording },attrs:{"id":"video-stream-container"}},[_c('canvas',{ref:"cameraStream",attrs:{"id":"camera-stream","width":"160","height":"120"}}),_c('canvas',{ref:"vizOverlay",attrs:{"id":"debug-overlay","width":"480","height":"640"}}),(_vm.canEditCropping && _vm.cropEnabled)?_c('video-crop-controls',{attrs:{"crop-box":_vm.cropBox},on:{"crop-changed":_vm.gotCropChange}}):_vm._e(),(_vm.cropEnabled)?_c('v-btn',{class:{ on: _vm.canEditCropping },attrs:{"text":"","title":"Edit cropping","id":"toggle-cropping","dark":""},on:{"click":_vm.toggleCropping}},[_c('v-icon',[_vm._v(_vm._s(_vm.cropIcon))])],1):_vm._e(),(_vm.showCoords)?_c('p',{staticClass:"coords"},[_vm._v("("+_vm._s(_vm.coords.x)+", "+_vm._s(_vm.coords.y)+")")]):_vm._e()],1)}
var VideoStreamvue_type_template_id_6544bfa0_scoped_true_staticRenderFns = []


// CONCATENATED MODULE: ./src/components/VideoStream.vue?vue&type=template&id=6544bfa0&scoped=true&

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"67c5eee7-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vuetify-loader/lib/loader.js??ref--19-0!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/VideoCropControls.vue?vue&type=template&id=45ccf73a&scoped=true&
var VideoCropControlsvue_type_template_id_45ccf73a_scoped_true_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{ref:"box",attrs:{"id":"fov-box"}},[_c('div',[_c('div',{ref:"top",staticClass:"fov-handle",attrs:{"id":"top-handle"},on:{"mousedown":function (e) { return _vm.startDrag(e); },"mouseup":function (e) { return _vm.endDrag(e); },"touchstart":function (e) { return _vm.startDrag(e); },"touchend":function (e) { return _vm.endDrag(e); }}},[_c('svg',{attrs:{"xmlns":"http://www.w3.org/2000/svg","viewBox":"0 0 256 512"}},[_c('path',{attrs:{"fill":"currentColor","d":"M214.059 377.941H168V134.059h46.059c21.382 0 32.09-25.851 16.971-40.971L144.971 7.029c-9.373-9.373-24.568-9.373-33.941 0L24.971 93.088c-15.119 15.119-4.411 40.971 16.971 40.971H88v243.882H41.941c-21.382 0-32.09 25.851-16.971 40.971l86.059 86.059c9.373 9.373 24.568 9.373 33.941 0l86.059-86.059c15.12-15.119 4.412-40.971-16.97-40.971z"}})])]),_c('div',{ref:"left",staticClass:"fov-handle",attrs:{"id":"left-handle"},on:{"mousedown":function (e) { return _vm.startDrag(e); },"mouseup":function (e) { return _vm.endDrag(e); },"touchstart":function (e) { return _vm.startDrag(e); },"touchend":function (e) { return _vm.endDrag(e); }}},[_c('svg',{attrs:{"xmlns":"http://www.w3.org/2000/svg","viewBox":"0 0 512 512"}},[_c('path',{attrs:{"fill":"currentColor","d":"M377.941 169.941V216H134.059v-46.059c0-21.382-25.851-32.09-40.971-16.971L7.029 239.029c-9.373 9.373-9.373 24.568 0 33.941l86.059 86.059c15.119 15.119 40.971 4.411 40.971-16.971V296h243.882v46.059c0 21.382 25.851 32.09 40.971 16.971l86.059-86.059c9.373-9.373 9.373-24.568 0-33.941l-86.059-86.059c-15.119-15.12-40.971-4.412-40.971 16.97z"}})])]),_c('div',{ref:"right",staticClass:"fov-handle",attrs:{"id":"right-handle"},on:{"mousedown":function (e) { return _vm.startDrag(e); },"mouseup":function (e) { return _vm.endDrag(e); },"touchstart":function (e) { return _vm.startDrag(e); },"touchend":function (e) { return _vm.endDrag(e); }}},[_c('svg',{attrs:{"xmlns":"http://www.w3.org/2000/svg","viewBox":"0 0 512 512"}},[_c('path',{attrs:{"fill":"currentColor","d":"M377.941 169.941V216H134.059v-46.059c0-21.382-25.851-32.09-40.971-16.971L7.029 239.029c-9.373 9.373-9.373 24.568 0 33.941l86.059 86.059c15.119 15.119 40.971 4.411 40.971-16.971V296h243.882v46.059c0 21.382 25.851 32.09 40.971 16.971l86.059-86.059c9.373-9.373 9.373-24.568 0-33.941l-86.059-86.059c-15.119-15.12-40.971-4.412-40.971 16.97z"}})])]),_c('div',{ref:"bottom",staticClass:"fov-handle",attrs:{"id":"bottom-handle"},on:{"mousedown":function (e) { return _vm.startDrag(e); },"mouseup":function (e) { return _vm.endDrag(e); },"touchstart":function (e) { return _vm.startDrag(e); },"touchend":function (e) { return _vm.endDrag(e); }}},[_c('svg',{attrs:{"xmlns":"http://www.w3.org/2000/svg","viewBox":"0 0 256 512"}},[_c('path',{attrs:{"fill":"currentColor","d":"M214.059 377.941H168V134.059h46.059c21.382 0 32.09-25.851 16.971-40.971L144.971 7.029c-9.373-9.373-24.568-9.373-33.941 0L24.971 93.088c-15.119 15.119-4.411 40.971 16.971 40.971H88v243.882H41.941c-21.382 0-32.09 25.851-16.971 40.971l86.059 86.059c9.373 9.373 24.568 9.373 33.941 0l86.059-86.059c15.12-15.119 4.412-40.971-16.97-40.971z"}})])])])])}
var VideoCropControlsvue_type_template_id_45ccf73a_scoped_true_staticRenderFns = []


// CONCATENATED MODULE: ./src/components/VideoCropControls.vue?vue&type=template&id=45ccf73a&scoped=true&

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--13-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/ts-loader??ref--13-3!./node_modules/vuetify-loader/lib/loader.js??ref--19-0!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/VideoCropControls.vue?vue&type=script&lang=ts&
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }



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
    const cropBox = this.cropBox; // Set the initial handle positions:

    const left = cropBox.left;
    const right = cropBox.right;
    this.$refs.top.style.top = `${cropBox.top}%`;
    this.$refs.right.style.right = `${right}%`;
    this.$refs.bottom.style.bottom = `${cropBox.bottom}%`;
    this.$refs.left.style.left = `${left}%`;
    let offset = cropBox.top + (100 - (cropBox.bottom + cropBox.top)) * 0.5;
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
    const cropBox = _objectSpread({}, this.cropBox);

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
// EXTERNAL MODULE: ./src/components/VideoCropControls.vue?vue&type=style&index=0&id=45ccf73a&scoped=true&lang=scss&
var VideoCropControlsvue_type_style_index_0_id_45ccf73a_scoped_true_lang_scss_ = __webpack_require__("37e0");

// EXTERNAL MODULE: ./node_modules/vue-loader/lib/runtime/componentNormalizer.js
var componentNormalizer = __webpack_require__("2877");

// CONCATENATED MODULE: ./src/components/VideoCropControls.vue






/* normalize component */

var component = Object(componentNormalizer["a" /* default */])(
  components_VideoCropControlsvue_type_script_lang_ts_,
  VideoCropControlsvue_type_template_id_45ccf73a_scoped_true_render,
  VideoCropControlsvue_type_template_id_45ccf73a_scoped_true_staticRenderFns,
  false,
  null,
  "45ccf73a",
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
        } // context.moveTo(face.vertical.bottom.x, face.vertical.bottom.y);
        // context.lineTo(face.vertical.top.x, face.vertical.top.y);
        // context.moveTo(face.horizontal.left.x, face.horizontal.left.y);
        // context.lineTo(face.horizontal.right.x, face.horizontal.right.y);
        // context.moveTo(face.forehead.bottomLeft.x, face.forehead.bottomLeft.y);
        // context.lineTo(
        //   face.forehead.bottomRight.x,
        //   face.forehead.bottomRight.y
        // );
        // context.moveTo(face.forehead.topLeft.x, face.forehead.topLeft.y);
        // context.lineTo(face.forehead.topRight.x, face.forehead.topRight.y);

      }

      context.restore();
    }

    context.save();

    if (this.cropBox) {
      // Update crop-box overlay:
      const overlay = new Path2D();
      const cropBox = this.cropBox;
      context.scale(1, 1);
      const width = canvas.width;
      const height = canvas.height;
      overlay.rect(0, 0, width, height);
      const onePercentWidth = width / 100;
      const onePercentHeight = height / 100;
      const leftInset = onePercentWidth * cropBox.left;
      const rightInset = onePercentWidth * cropBox.right;
      const topInset = onePercentHeight * cropBox.top;
      const bottomInset = onePercentHeight * cropBox.bottom;
      overlay.rect(leftInset, topInset, width - (rightInset + leftInset), height - (bottomInset + topInset));
      context.fillStyle = "rgba(0, 0, 0, 0.5)";
      context.fill(overlay, "evenodd");
    }

    context.restore();
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
    // TODO(jon): Why does this sometimes get called when the smoothed image array is empty?
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
// EXTERNAL MODULE: ./src/components/VideoStream.vue?vue&type=style&index=0&id=6544bfa0&scoped=true&lang=scss&
var VideoStreamvue_type_style_index_0_id_6544bfa0_scoped_true_lang_scss_ = __webpack_require__("5cbd");

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
  VideoStreamvue_type_template_id_6544bfa0_scoped_true_render,
  VideoStreamvue_type_template_id_6544bfa0_scoped_true_staticRenderFns,
  false,
  null,
  "6544bfa0",
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

    try {
      const presignedUrl = await response.text(); // Based on the user, we find out whether or not to upload a reference image.

      if (presignedUrl) {
        // Upload to s3
        const _response = await fetch(presignedUrl, {
          method: "POST",
          body: data.frame.frame,
          mode: "no-cors"
        });

        console.log(await _response.text());
      } else {// Error?
      }
    } catch (e) {
      console.log(response.status);
    }
  },

  async recordCalibrationEvent(deviceName, deviceId, calibration, frame, x, y) {
    const cameraSerial = frame.frameInfo.Camera.CameraSerial;
    const appVersion = frame.frameInfo.AppVersion;
    const request = fetch(API_BASE, {
      method: "POST",
      body: JSON.stringify({
        CameraID: `${deviceName}|${deviceId}|${cameraSerial}`,
        Type: "Calibrate",
        Timestamp: calibration.timestamp.toISOString().replace(/:/g, "_").replace(/\./g, "_"),
        CalibratedTemp: calibration.calibrationTemperature.val.toFixed(2),
        MinFeverThreshold: calibration.thresholdMinFever,
        ThermalRefTemp: calibration.thermalRefTemperature.val.toFixed(2),
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
      })
    });
    const response = await request;

    try {
      const presignedUrl = await response.text(); // Based on the user, we find out whether or not to upload a reference image.

      if (presignedUrl) {
        // Upload to s3
        const _response2 = await fetch(presignedUrl, {
          method: "POST",
          body: frame.frame,
          mode: "no-cors"
        });

        console.log(await _response2.text());
      } else {// Error?
      }
    } catch (e) {
      console.log(response.status);
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
      return "http://192.168.178.21"; //return "http://192.168.0.44";
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
      temperatureThresholds: [this.state.currentCalibration.thresholdMinFever],
      calibration: this.state.currentCalibration.calibrationTemperature.val
    };
    const edited = {
      cropBox: this.editedCropBox,
      temperatureThresholds: this.editedTemperatureThreshold,
      calibration: parseFloat(this.editedCalibration.val.toFixed(2))
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
    console.log(JSON.stringify(this.state.currentCalibration, null, "\t"));
    let thermalRefRaw = this.state.currentCalibration.thermalReferenceRawValue;
    let rawTempValue = this.state.currentCalibration.hotspotRawTemperatureValue;
    const thresholdMinFever = this.editedTemperatureThreshold;

    if (this.snapshotScreeningEvent) {
      let sampleX = -1;
      let sampleY = -1;
      thermalRefRaw = this.snapshotScreeningEvent.thermalReference.val;
      rawTempValue = this.snapshotScreeningEvent.rawTemperatureValue;
      thermalRefTemp = currentCalibration.val - (rawTempValue - thermalRefRaw) * 0.01;
      sampleX = this.snapshotScreeningEvent.sampleX;
      sampleY = this.snapshotScreeningEvent.sampleY;
      const timestamp = new Date();
      ScreeningApi.recordCalibrationEvent(this.deviceName, this.deviceID, {
        cropBox,
        timestamp: timestamp,
        calibrationTemperature: currentCalibration,
        hotspotRawTemperatureValue: rawTempValue,
        thermalRefTemperature: new DegreesCelsius(thermalRefTemp),
        thermalReferenceRawValue: thermalRefRaw,
        thresholdMinFever
      }, this.snapshotScreeningEvent.frame, sampleX, sampleY);
      return DeviceApi.saveCalibration({
        ThresholdMinFever: thresholdMinFever,
        ThermalRefTemp: thermalRefTemp,
        TemperatureCelsius: currentCalibration.val,
        Top: cropBox.top,
        Right: cropBox.right,
        Left: cropBox.left,
        Bottom: cropBox.bottom,
        UuidOfUpdater: this.state.uuid,
        CalibrationBinaryVersion: this.state.currentFrame.frameInfo.BinaryVersion,
        SnapshotTime: timestamp.getTime(),
        SnapshotValue: rawTempValue,
        UseNormalSound: true,
        UseWarningSound: true,
        UseErrorSound: true
      });
    }

    return;
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
// EXTERNAL MODULE: ./src/components/CalibrationSettings.vue?vue&type=style&index=0&id=24c81863&scoped=true&lang=scss&
var CalibrationSettingsvue_type_style_index_0_id_24c81863_scoped_true_lang_scss_ = __webpack_require__("e55b");

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
  CalibrationSettingsvue_type_template_id_24c81863_scoped_true_render,
  CalibrationSettingsvue_type_template_id_24c81863_scoped_true_staticRenderFns,
  false,
  null,
  "24c81863",
  null
  
)

/* harmony default export */ var components_CalibrationSettings = (CalibrationSettings_component.exports);

/* vuetify-loader */


















installComponents_default()(CalibrationSettings_component, {VBtn: VBtn["a" /* default */],VCard: VCard["a" /* default */],VCardActions: components_VCard["a" /* VCardActions */],VCardSubtitle: components_VCard["b" /* VCardSubtitle */],VCardText: components_VCard["c" /* VCardText */],VCardTitle: components_VCard["d" /* VCardTitle */],VCheckbox: VCheckbox["a" /* default */],VCol: VCol["a" /* default */],VContainer: VContainer["a" /* default */],VDialog: VDialog["a" /* default */],VIcon: VIcon["a" /* default */],VOverlay: VOverlay["a" /* default */],VRow: VRow["a" /* default */],VSlider: VSlider["a" /* default */],VSpacer: VSpacer["a" /* default */],VSwitch: VSwitch["a" /* default */],VTextField: VTextField["a" /* default */]})

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"67c5eee7-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vuetify-loader/lib/loader.js??ref--19-0!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/DeviceInfo.vue?vue&type=template&id=ba8536b0&scoped=true&
var DeviceInfovue_type_template_id_ba8536b0_scoped_true_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-card',{attrs:{"flat":""}},[(_vm.items)?_c('v-simple-table',{scopedSlots:_vm._u([{key:"default",fn:function(){return [_c('thead',[_c('tr',[_c('th',{staticClass:"text-left"},[_vm._v("Device config")]),_c('th',{staticClass:"text-left"})])]),_c('tbody',_vm._l((_vm.items),function(ref){
var name = ref[0];
var item = ref[1];
return _c('tr',{key:name},[_c('td',[_vm._v(_vm._s(name))]),_c('td',[_vm._v(_vm._s(item))])])}),0)]},proxy:true}],null,false,421180828)}):_vm._e()],1)}
var DeviceInfovue_type_template_id_ba8536b0_scoped_true_staticRenderFns = []


// CONCATENATED MODULE: ./src/components/DeviceInfo.vue?vue&type=template&id=ba8536b0&scoped=true&

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
  DeviceInfovue_type_template_id_ba8536b0_scoped_true_render,
  DeviceInfovue_type_template_id_ba8536b0_scoped_true_staticRenderFns,
  false,
  null,
  "ba8536b0",
  null
  
)

/* harmony default export */ var components_DeviceInfo = (DeviceInfo_component.exports);

/* vuetify-loader */



installComponents_default()(DeviceInfo_component, {VCard: VCard["a" /* default */],VSimpleTable: VSimpleTable["a" /* default */]})

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"67c5eee7-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vuetify-loader/lib/loader.js??ref--19-0!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/DeveloperUtilities.vue?vue&type=template&id=e0112a36&scoped=true&
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

// CONCATENATED MODULE: ./src/geom.ts
const geom_WIDTH = 120;
const geom_HEIGHT = 160;
const geom_startP = ({
  x0,
  y
}) => ({
  x: x0,
  y
});
const geom_endP = ({
  x1,
  y
}) => ({
  x: x1,
  y
});
const distanceSq = (a, b) => {
  const dX = a.x - b.x;
  const dY = a.y - b.y;
  return dX * dX + dY * dY;
};
const geom_distance = (a, b) => Math.sqrt(distanceSq(a, b));
const distanceSq2 = (a, b) => {
  const dX = a[0] - b[0];
  const dY = a[1] - b[1];
  return dX * dX + dY * dY;
};
const geom_spanWidth = span => span.x1 - span.x0;
function geom_shapeArea(shape) {
  return shape.reduce((acc, span) => acc + geom_spanWidth(span), 0);
}
function rawShapeArea(shape) {
  return Object.values(shape).reduce((acc, span) => acc + geom_shapeArea(span), 0);
}
function geom_largestShape(shapes) {
  return shapes.reduce((prevBestShape, shape) => {
    const best = geom_shapeArea(prevBestShape);
    const area = geom_shapeArea(shape);
    return area > best ? shape : prevBestShape;
  }, []);
}
function rectDims(rect) {
  return {
    w: rect.x1 - rect.x0,
    h: rect.y1 - rect.y0
  };
}
function geom_boundsForShape(shape) {
  const y0 = shape[0].y;
  const y1 = shape[shape.length - 1].y;
  const x0 = Math.min(...shape.map(({
    x0
  }) => x0));
  const x1 = Math.max(...shape.map(({
    x1
  }) => x1));
  return {
    x0,
    x1,
    y0,
    y1
  };
}
function boundsForRawShape(shape) {
  let minY = Number.MAX_SAFE_INTEGER;
  let maxY = 0;
  let minX = Number.MAX_SAFE_INTEGER;
  let maxX = 0;

  for (const row of Object.values(shape)) {
    for (const span of row) {
      minY = Math.min(span.y, minY);
      maxY = Math.max(span.y, maxY);
      minX = Math.min(span.x0, minX);
      maxX = Math.max(span.x1, maxX);
    }
  }

  return {
    x0: minX,
    y0: minY,
    y1: maxY,
    x1: maxX
  };
}
function geom_widestSpan(shape) {
  let maxWidthSpan = shape[0];

  for (const span of shape) {
    if (geom_spanWidth(span) > geom_spanWidth(maxWidthSpan)) {
      maxWidthSpan = span;
    }
  }

  return maxWidthSpan;
}
function geom_narrowestSpan(shape) {
  let minWidthSpan;
  minWidthSpan = shape.find(x => x.x0 !== 0 && x.x1 !== geom_WIDTH - 1);

  if (!minWidthSpan) {
    minWidthSpan = shape[0];
  } // TODO(jon): Ideally the narrowest span doesn't hit the frame edges.


  for (const span of shape) {
    if (geom_spanWidth(span) <= geom_spanWidth(minWidthSpan)) {
      if (span.x0 !== 0 && span.x1 !== geom_WIDTH - 1) {
        minWidthSpan = span;
      }
    }
  }

  return minWidthSpan;
}
function geom_narrowestSlanted(shape, start) {
  const nIndex = shape.indexOf(start); // From the narrowest, wiggle about on each side to try to find a shorter distance between spans.

  const startIndex = Math.max(0, nIndex - 13);
  const endIndex = Math.min(shape.length - 1, nIndex + 13);
  const distances = [];

  for (let i = startIndex; i < endIndex; i++) {
    for (let j = startIndex; j < endIndex; j++) {
      if (i !== j) {
        const d = distanceSq(geom_startP(shape[i]), geom_endP(shape[j]));
        distances.push({
          d,
          skew: Math.abs(shape[i].y - shape[j].y),
          left: shape[i],
          right: shape[j]
        });
      }
    }
  } // If there are a bunch that are similar, prefer the least slanted one.


  distances.sort((a, b) => {
    // NOTE(defer spans where x0 or x1 is on the edge of the frame.
    if (a.left.x0 === 0 || a.right.x1 === geom_WIDTH - 1) {
      return 1;
    } else if (b.left.x0 === 0 || b.right.x1 === geom_WIDTH - 1) {
      return -1;
    }

    if (a.d < b.d) {
      return -1;
    } else if (a.d > b.d) {
      return 1;
    } else {
      if (a.skew < b.skew) {
        return -1;
      } else if (a.skew > a.skew) {
        return 1;
      } else {
        return b.right.y + b.left.y - (a.right.y + a.left.y);
      }
    }
  });

  if (distances.length) {
    let {
      left,
      right,
      skew: bestSkew
    } = distances[0];
    const {
      d: bestD
    } = distances[0];
    let i = 1;

    while (Math.abs(Math.sqrt(distances[i].d) - Math.sqrt(bestD)) < 1) {
      if (distances[i].skew < bestSkew) {
        bestSkew = distances[i].skew;
        left = distances[i].left;
        right = distances[i].right;
      }

      i++;

      if (i === distances.length) {
        break;
      }
    }

    return [left, right];
  }

  return [start, start];
}
function geom_magnitude(vec) {
  return Math.sqrt(vec.x * vec.x + vec.y * vec.y);
}
function geom_normalise(vec) {
  const len = geom_magnitude(vec);
  return {
    x: vec.x / len,
    y: vec.y / len
  };
}
function geom_scale(vec, scale) {
  return {
    x: vec.x * scale,
    y: vec.y * scale
  };
}
function geom_perp(vec) {
  // noinspection JSSuspiciousNameCombination
  return {
    x: vec.y,
    y: -vec.x
  };
}
function geom_add(a, b) {
  return {
    x: a.x + b.x,
    y: a.y + b.y
  };
}
function geom_sub(a, b) {
  return {
    x: a.x - b.x,
    y: a.y - b.y
  };
}
const isLeft = (l0, l1, p) => // Use cross-product to determine which side of a line a point is on.
(l1.x - l0.x) * (p.y - l0.y) - (l1.y - l0.y) * (p.x - l0.x);
const pointIsLeftOfOrOnLine = (l0, l1, p) => // Use cross-product to determine which side of a line a point is on.
isLeft(l0, l1, p) >= 0;
const geom_pointIsLeftOfLine = (l0, l1, p) => // Use cross-product to determine which side of a line a point is on.
isLeft(l0, l1, p) > 0;
function geom_isNotCeilingHeat(shape) {
  return !(shape[0].y === 0 && shape.length < 80);
}
function pointIsInQuad(p, quad) {
  return geom_pointIsLeftOfLine(quad.bottomLeft, quad.topLeft, p) && geom_pointIsLeftOfLine(quad.topRight, quad.bottomRight, p) && geom_pointIsLeftOfLine(quad.bottomRight, quad.bottomLeft, p) && geom_pointIsLeftOfLine(quad.topLeft, quad.topRight, p);
}
function drawShapesIntoMask(shapes, data, bit, width = 120) {
  for (const shape of shapes) {
    for (const span of shape) {
      let i = span.x0;

      if (span.x0 >= span.x1) {
        console.warn("Weird spans", span.x0, span.x1);
        continue;
      }

      do {
        data[span.y * width + i] |= bit;
        i++;
      } while (i < span.x1);
    }
  }
}
function shapeIsNotCircular(shape) {
  const dims = rectDims(geom_boundsForShape(shape));
  return Math.abs(dims.w - dims.h) > 4;
}
function shapeIsOnSide(shape) {
  for (const {
    x0,
    x1
  } of shape) {
    if (x0 === 0 || x1 === geom_WIDTH - 1) {
      return true;
    }
  }

  return false;
}
function closestPoint(point, points) {
  let bestP;
  let bestD = Number.MAX_SAFE_INTEGER;

  for (const p of points) {
    const d = distanceSq(p, point);

    if (d < bestD) {
      bestD = d;
      bestP = p;
    }
  }

  return bestP;
}
function distToSegmentSquared(p, v, w) {
  const l2 = distanceSq(v, w);

  if (l2 == 0) {
    return distanceSq(p, v);
  }

  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return distanceSq(p, {
    x: v.x + t * (w.x - v.x),
    y: v.y + t * (w.y - v.y)
  });
}
const pointsAreEqual = (a, b) => a.x === b.x && a.y === b.y;
const pointIsInSet = (pt, set) => set.find(x => pointsAreEqual(x, pt)) !== undefined;
const maxSliceLength = 5;
const minYIndex = arr => {
  let lowestY = Number.MAX_SAFE_INTEGER;
  let lowestIndex = 0;

  for (let i = 0; i < arr.length; i++) {
    const y = arr[i].y;

    if (y < lowestY) {
      lowestY = y;
      lowestIndex = i;
    }
  }

  return lowestIndex;
};
const head = arr => arr.slice(0, Math.min(maxSliceLength, arr.length - 1));
const tail = arr => arr.slice(arr.length - 1 - Math.min(maxSliceLength, arr.length) + 1, Math.min(maxSliceLength, arr.length) + 1);
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

function zeroWidthToSide(shape) {
  const bounds = geom_boundsForShape(shape);
  const zeroWidth = [];

  if (bounds.x1 - bounds.x0 > 10) {
    if (bounds.x0 <= 15) {
      // Going off left
      for (const span of shape) {
        zeroWidth.push({
          x0: 0,
          x1: 1,
          y: span.y
        });
      }
    } else {
      // Going off right
      debugger;

      for (const span of shape) {
        zeroWidth.push({
          x0: 118,
          x1: 119,
          y: span.y
        });
      }
    }
  }

  return zeroWidth;
}

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

  onScreeningEventChange() {
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
        // if (
        //   (!nextShape || !nextShape.length) &&
        //   prevShape &&
        //   prevShape.length
        // ) {
        //   nextShape.push(zeroWidthToSide(prevShape[0]));
        // }

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

      case ScreeningState.LEAVING:
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
// EXTERNAL MODULE: ./src/components/UserFacingScreening.vue?vue&type=style&index=0&id=fedccc62&scoped=true&lang=scss&
var UserFacingScreeningvue_type_style_index_0_id_fedccc62_scoped_true_lang_scss_ = __webpack_require__("40f7");

// CONCATENATED MODULE: ./src/components/UserFacingScreening.vue






/* normalize component */

var UserFacingScreening_component = Object(componentNormalizer["a" /* default */])(
  components_UserFacingScreeningvue_type_script_lang_ts_,
  UserFacingScreeningvue_type_template_id_fedccc62_scoped_true_render,
  UserFacingScreeningvue_type_template_id_fedccc62_scoped_true_staticRenderFns,
  false,
  null,
  "fedccc62",
  null
  
)

/* harmony default export */ var components_UserFacingScreening = (UserFacingScreening_component.exports);

/* vuetify-loader */






installComponents_default()(UserFacingScreening_component, {VBtn: VBtn["a" /* default */],VCard: VCard["a" /* default */],VCardActions: components_VCard["a" /* VCardActions */],VDialog: VDialog["a" /* default */],VIcon: VIcon["a" /* default */]})

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
      this.host = "192.168.178.21";
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
    this.appState = State;
    this.appVersion = "";
    this.isNotFullscreen = true;
    this.showUpdatedCalibrationSnackbar = false;
    this.prevFrameInfo = null;
    this.droppedDebugFile = false;
    this.frameCounter = 0;
    this.thresholdValue = 0;
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

  get isAdminScreen() {
    return true;
  }

  get playingLocal() {
    return this.droppedDebugFile;
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
  }

  onCropChanged(cropBox) {
    this.appState.currentCalibration.cropBox = cropBox;
  }

  saveCropChanges() {
    console.log("save crop changes", JSON.parse(JSON.stringify(this.appState.currentCalibration.cropBox)));
  }

  get calibratedTemp() {
    return this.appState.currentCalibration.calibrationTemperature;
  }

  get currentFrame() {
    return this.appState.currentFrame;
  }

  get timeOnInSeconds() {
    if (this.prevFrameInfo) {
      const telemetry = this.prevFrameInfo.Telemetry;
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
    if (!this.isWarmingUp && this.prevFrameInfo) {
      const telemetry = this.prevFrameInfo.Telemetry; // TODO(jon): This needs to change based on whether camera is live or not

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

  get cropBoxPixelBounds() {
    const cropBox = this.appState.currentCalibration.cropBox;
    let width = 120;
    let height = 160;

    if (this.prevFrameInfo) {
      const {
        ResX,
        ResY
      } = this.prevFrameInfo.Camera;
      width = ResX;
      height = ResY;
    }

    const onePercentWidth = width / 100;
    const onePercentHeight = height / 100;
    return {
      x0: Math.floor(onePercentWidth * cropBox.left),
      x1: width - Math.floor(onePercentWidth * cropBox.right),
      y0: Math.floor(onePercentHeight * cropBox.top),
      y1: height - Math.floor(onePercentHeight * cropBox.bottom)
    };
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
    if (this.prevFrameInfo) {
      const prevCalibration = JSON.stringify(this.prevFrameInfo.Calibration);
      const nextCalibration = JSON.stringify(frame.frameInfo.Calibration);

      if (prevCalibration !== nextCalibration) {
        this.updateCalibration(frame.frameInfo.Calibration);
      }
    }
  }

  async onFrame(frame) {
    const frameNumber = frame.frameInfo.Telemetry.FrameCount;
    this.checkForSoftwareUpdatesThisFrame(frame);
    this.checkForCalibrationUpdatesThisFrame(frame);
    this.updateBodyOutline(frame.bodyShape);

    if (!this.isWarmingUp) {
      this.appState.lastFrameTime = new Date().getTime();
      const prevScreeningState = this.appState.currentScreeningState;
      const nextScreeningState = frame.analysisResult.nextState;

      if (prevScreeningState === ScreeningState.STABLE_LOCK && nextScreeningState === ScreeningState.LEAVING) {
        const face = frame.analysisResult.face;
        const thermalRef = frame.analysisResult.thermalRef;
        this.snapshotScreeningEvent(thermalRef, face, frame, Appvue_type_script_lang_ts_objectSpread(Appvue_type_script_lang_ts_objectSpread({}, face.samplePoint), {}, {
          v: face.sampleValue,
          t: face.sampleTemp
        }));
      } else if (prevScreeningState === ScreeningState.LEAVING && nextScreeningState === ScreeningState.READY) {
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
    this.prevFrameInfo = frame.frameInfo;
    this.frameCounter++;
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
const DEFAULT_THRESHOLD_MIN_NORMAL = 32.5;
const DEFAULT_THRESHOLD_MIN_FEVER = 37.8;
const WARMUP_TIME_SECONDS = 30 * 60; // 30 mins

const FFC_SAFETY_DURATION_SECONDS = 5;
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
    thermalRefTemperature: new DegreesCelsius(0)
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
  return new Worker(__webpack_require__.p + "373944890a77448c5eb8.worker.js");
};

/***/ }),

/***/ "e55b":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_19_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_CalibrationSettings_vue_vue_type_style_index_0_id_24c81863_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("4a4b");
/* harmony import */ var _node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_19_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_CalibrationSettings_vue_vue_type_style_index_0_id_24c81863_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_19_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_CalibrationSettings_vue_vue_type_style_index_0_id_24c81863_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0__);
/* unused harmony reexport * */
 /* unused harmony default export */ var _unused_webpack_default_export = (_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_19_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_CalibrationSettings_vue_vue_type_style_index_0_id_24c81863_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ })

/******/ });
//# sourceMappingURL=app.aec94351.js.map