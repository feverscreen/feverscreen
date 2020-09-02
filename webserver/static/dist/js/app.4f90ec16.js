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
/******/ 		return __webpack_require__.p + "js/" + ({}[chunkId]||chunkId) + "." + {"chunk-2d843444":"e21bc1d7","chunk-fae4a56a":"e7727c8f"}[chunkId] + ".js"
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
/******/ 		"499d": function() {
/******/ 			return {
/******/ 				"./cptv_player.js": {
/******/ 					"__wbindgen_string_new": function(p0i32,p1i32) {
/******/ 						return installedModules["327f"].exports["__wbindgen_string_new"](p0i32,p1i32);
/******/ 					},
/******/ 					"__wbindgen_object_drop_ref": function(p0i32) {
/******/ 						return installedModules["327f"].exports["__wbindgen_object_drop_ref"](p0i32);
/******/ 					},
/******/ 					"__wbg_new_59cb74e423758ede": function() {
/******/ 						return installedModules["327f"].exports["__wbg_new_59cb74e423758ede"]();
/******/ 					},
/******/ 					"__wbg_stack_558ba5917b466edd": function(p0i32,p1i32) {
/******/ 						return installedModules["327f"].exports["__wbg_stack_558ba5917b466edd"](p0i32,p1i32);
/******/ 					},
/******/ 					"__wbg_error_4bb6c2a97407129a": function(p0i32,p1i32) {
/******/ 						return installedModules["327f"].exports["__wbg_error_4bb6c2a97407129a"](p0i32,p1i32);
/******/ 					},
/******/ 					"__wbindgen_throw": function(p0i32,p1i32) {
/******/ 						return installedModules["327f"].exports["__wbindgen_throw"](p0i32,p1i32);
/******/ 					},
/******/ 					"__widl_f_debug_1_": function(p0i32) {
/******/ 						return installedModules["327f"].exports["__widl_f_debug_1_"](p0i32);
/******/ 					},
/******/ 					"__widl_f_error_1_": function(p0i32) {
/******/ 						return installedModules["327f"].exports["__widl_f_error_1_"](p0i32);
/******/ 					},
/******/ 					"__widl_f_info_1_": function(p0i32) {
/******/ 						return installedModules["327f"].exports["__widl_f_info_1_"](p0i32);
/******/ 					},
/******/ 					"__widl_f_log_1_": function(p0i32) {
/******/ 						return installedModules["327f"].exports["__widl_f_log_1_"](p0i32);
/******/ 					},
/******/ 					"__widl_f_warn_1_": function(p0i32) {
/******/ 						return installedModules["327f"].exports["__widl_f_warn_1_"](p0i32);
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
/******/ 		var wasmModules = {"chunk-2d843444":["3826"],"chunk-fae4a56a":["499d"]}[chunkId] || [];
/******/
/******/ 		wasmModules.forEach(function(wasmModuleId) {
/******/ 			var installedWasmModuleData = installedWasmModules[wasmModuleId];
/******/
/******/ 			// a Promise means "currently loading" or "already loaded".
/******/ 			if(installedWasmModuleData)
/******/ 				promises.push(installedWasmModuleData);
/******/ 			else {
/******/ 				var importObject = wasmImportObjects[wasmModuleId]();
/******/ 				var req = fetch(__webpack_require__.p + "" + {"3826":"f4cb4ffd0ca727aee03d","499d":"1f2dad4b75b9825d1453"}[wasmModuleId] + ".module.wasm");
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

/***/ "05a4":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_2_node_modules_vuetify_loader_lib_loader_js_ref_20_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_AdminScreening_vue_vue_type_style_index_0_id_e10076ca_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("bcad");
/* harmony import */ var _node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_2_node_modules_vuetify_loader_lib_loader_js_ref_20_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_AdminScreening_vue_vue_type_style_index_0_id_e10076ca_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_2_node_modules_vuetify_loader_lib_loader_js_ref_20_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_AdminScreening_vue_vue_type_style_index_0_id_e10076ca_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0__);
/* unused harmony reexport * */
 /* unused harmony default export */ var _unused_webpack_default_export = (_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_2_node_modules_vuetify_loader_lib_loader_js_ref_20_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_AdminScreening_vue_vue_type_style_index_0_id_e10076ca_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "1df7":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_20_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_VideoCropControls_vue_vue_type_style_index_0_id_af7a6bf4_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("c6ca");
/* harmony import */ var _node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_20_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_VideoCropControls_vue_vue_type_style_index_0_id_af7a6bf4_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_20_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_VideoCropControls_vue_vue_type_style_index_0_id_af7a6bf4_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0__);
/* unused harmony reexport * */
 /* unused harmony default export */ var _unused_webpack_default_export = (_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_20_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_VideoCropControls_vue_vue_type_style_index_0_id_af7a6bf4_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "4847":
/***/ (function(module, exports, __webpack_require__) {

module.exports = function() {
  return new Worker(__webpack_require__.p + "3578e760d8db31aebf92.worker.js");
};

/***/ }),

/***/ "5c0b":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_20_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_App_vue_vue_type_style_index_0_lang_scss___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("7694");
/* harmony import */ var _node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_20_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_App_vue_vue_type_style_index_0_lang_scss___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_20_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_App_vue_vue_type_style_index_0_lang_scss___WEBPACK_IMPORTED_MODULE_0__);
/* unused harmony reexport * */
 /* unused harmony default export */ var _unused_webpack_default_export = (_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_20_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_App_vue_vue_type_style_index_0_lang_scss___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "6b9a":
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "7694":
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "7976":
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "7e56":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_2_node_modules_vuetify_loader_lib_loader_js_ref_20_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_FpsCounter_vue_vue_type_style_index_0_id_1e15926a_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("7976");
/* harmony import */ var _node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_2_node_modules_vuetify_loader_lib_loader_js_ref_20_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_FpsCounter_vue_vue_type_style_index_0_id_1e15926a_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_2_node_modules_vuetify_loader_lib_loader_js_ref_20_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_FpsCounter_vue_vue_type_style_index_0_id_1e15926a_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0__);
/* unused harmony reexport * */
 /* unused harmony default export */ var _unused_webpack_default_export = (_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_2_node_modules_vuetify_loader_lib_loader_js_ref_20_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_FpsCounter_vue_vue_type_style_index_0_id_1e15926a_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "8741":
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "aab1":
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "b3e1":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_20_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_VideoStream_vue_vue_type_style_index_0_id_3a43902b_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("aab1");
/* harmony import */ var _node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_20_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_VideoStream_vue_vue_type_style_index_0_id_3a43902b_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_20_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_VideoStream_vue_vue_type_style_index_0_id_3a43902b_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0__);
/* unused harmony reexport * */
 /* unused harmony default export */ var _unused_webpack_default_export = (_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_20_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_VideoStream_vue_vue_type_style_index_0_id_3a43902b_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "b4f6":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_20_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_DeveloperUtilities_vue_vue_type_style_index_0_id_303829d8_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("6b9a");
/* harmony import */ var _node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_20_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_DeveloperUtilities_vue_vue_type_style_index_0_id_303829d8_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_20_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_DeveloperUtilities_vue_vue_type_style_index_0_id_303829d8_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0__);
/* unused harmony reexport * */
 /* unused harmony default export */ var _unused_webpack_default_export = (_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_20_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_DeveloperUtilities_vue_vue_type_style_index_0_id_303829d8_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "bcad":
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "bcb5":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_20_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_CalibrationSettings_vue_vue_type_style_index_0_id_1630d800_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("c123");
/* harmony import */ var _node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_20_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_CalibrationSettings_vue_vue_type_style_index_0_id_1630d800_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_20_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_CalibrationSettings_vue_vue_type_style_index_0_id_1630d800_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0__);
/* unused harmony reexport * */
 /* unused harmony default export */ var _unused_webpack_default_export = (_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_20_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_CalibrationSettings_vue_vue_type_style_index_0_id_1630d800_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "c123":
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "c271":
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "c6ca":
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
__webpack_require__.d(__webpack_exports__, "advanceState", function() { return /* binding */ main_advanceState; });

// EXTERNAL MODULE: ./node_modules/vue/dist/vue.runtime.esm.js
var vue_runtime_esm = __webpack_require__("2b0e");

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"93785e02-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vuetify-loader/lib/loader.js??ref--20-0!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/App.vue?vue&type=template&id=7b120bcc&
var render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-app',{attrs:{"id":"app"},on:{"skip-warmup":_vm.skipWarmup}},[_c('UserFacingScreening',{attrs:{"on-reference-device":_vm.isReferenceDevice,"state":_vm.appState.currentScreeningState,"screening-event":_vm.appState.currentScreeningEvent,"calibration":_vm.appState.currentCalibration,"face":_vm.appState.face,"warmup-seconds-remaining":_vm.remainingWarmupTime,"shapes":[_vm.prevShape, _vm.nextShape]}}),_c('v-dialog',{attrs:{"width":"500"},model:{value:(_vm.showSoftwareVersionUpdatedPrompt),callback:function ($$v) {_vm.showSoftwareVersionUpdatedPrompt=$$v},expression:"showSoftwareVersionUpdatedPrompt"}},[_c('v-card',[_c('v-card-title',[_vm._v("This software has been updated. "+_vm._s(_vm.appVersion))]),_c('v-card-actions',{attrs:{"center":""}},[_c('v-btn',{attrs:{"text":""},on:{"click":function (e) { return (_vm.showSoftwareVersionUpdatedPrompt = false); }}},[_vm._v("Proceed")])],1)],1)],1),_c('v-snackbar',{model:{value:(_vm.showUpdatedCalibrationSnackbar),callback:function ($$v) {_vm.showUpdatedCalibrationSnackbar=$$v},expression:"showUpdatedCalibrationSnackbar"}},[_vm._v("Calibration was updated")])],1)}
var staticRenderFns = []


// CONCATENATED MODULE: ./src/App.vue?vue&type=template&id=7b120bcc&

// EXTERNAL MODULE: ./node_modules/tslib/tslib.es6.js
var tslib_es6 = __webpack_require__("9ab4");

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"93785e02-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vuetify-loader/lib/loader.js??ref--20-0!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/AdminScreening.vue?vue&type=template&id=e10076ca&scoped=true&
var AdminScreeningvue_type_template_id_e10076ca_scoped_true_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{attrs:{"id":"admin"}},[_c('div',[_c('VideoStream',{attrs:{"frame":_vm.frame.smoothed,"thermal-reference":_vm.thermalReference,"faces":_vm.faces,"face":_vm.faceFeature,"crop-box":_vm.cropBox,"crop-enabled":false}}),_c('div',{staticClass:"face-stats"},[_c('div',{staticClass:"frame-num"},[_vm._v(" Frame #"+_vm._s((_vm.frame && _vm.frame.frameInfo.Telemetry.FrameCount) || 0)+" ")]),_c('div',[_vm._v(_vm._s(_vm.face && _vm.face.frontOnPercentage)+"% front-facing")]),(_vm.face)?_c('div',[_vm._v(" Active thermal region: "+_vm._s(_vm.face.width().toFixed(0))+" x "+_vm._s(_vm.face.height().toFixed(0))+" ("+_vm._s((_vm.face.width() * _vm.face.height()).toFixed(0))+"px"),_c('sup',[_vm._v("2")]),_vm._v(") ")]):_c('div',[_vm._v("--")])])],1),(false)?undefined:_vm._e()],1)}
var AdminScreeningvue_type_template_id_e10076ca_scoped_true_staticRenderFns = []


// CONCATENATED MODULE: ./src/components/AdminScreening.vue?vue&type=template&id=e10076ca&scoped=true&

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"93785e02-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vuetify-loader/lib/loader.js??ref--20-0!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/VideoStream.vue?vue&type=template&id=3a43902b&scoped=true&
var VideoStreamvue_type_template_id_3a43902b_scoped_true_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{ref:"container",class:{ recording: _vm.recording },attrs:{"id":"video-stream-container"}},[_c('canvas',{ref:"cameraStream",attrs:{"id":"camera-stream","width":"120","height":"160"}}),_c('canvas',{ref:"vizOverlay",attrs:{"id":"debug-overlay","width":"480","height":"640"}}),(_vm.canEditCropping && _vm.cropEnabled)?_c('video-crop-controls',{attrs:{"crop-box":_vm.cropBox},on:{"crop-changed":_vm.gotCropChange}}):_vm._e(),(_vm.cropEnabled)?_c('v-btn',{class:{ on: _vm.canEditCropping },attrs:{"text":"","title":"Edit cropping","id":"toggle-cropping","dark":""},on:{"click":_vm.toggleCropping}},[_c('v-icon',[_vm._v(_vm._s(_vm.cropIcon))])],1):_vm._e()],1)}
var VideoStreamvue_type_template_id_3a43902b_scoped_true_staticRenderFns = []


// CONCATENATED MODULE: ./src/components/VideoStream.vue?vue&type=template&id=3a43902b&scoped=true&

// EXTERNAL MODULE: ./node_modules/vue-property-decorator/lib/vue-property-decorator.js + 1 modules
var vue_property_decorator = __webpack_require__("60a3");

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"93785e02-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vuetify-loader/lib/loader.js??ref--20-0!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/VideoCropControls.vue?vue&type=template&id=af7a6bf4&scoped=true&
var VideoCropControlsvue_type_template_id_af7a6bf4_scoped_true_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{ref:"box",attrs:{"id":"fov-box"}},[_c('div',[_c('div',{ref:"top",staticClass:"fov-handle",attrs:{"id":"top-handle"},on:{"mousedown":function (e) { return _vm.startDrag(e); },"mouseup":function (e) { return _vm.endDrag(e); },"touchstart":function (e) { return _vm.startDrag(e); },"touchend":function (e) { return _vm.endDrag(e); }}},[_c('svg',{attrs:{"xmlns":"http://www.w3.org/2000/svg","viewBox":"0 0 256 512"}},[_c('path',{attrs:{"fill":"currentColor","d":"M214.059 377.941H168V134.059h46.059c21.382 0 32.09-25.851 16.971-40.971L144.971 7.029c-9.373-9.373-24.568-9.373-33.941 0L24.971 93.088c-15.119 15.119-4.411 40.971 16.971 40.971H88v243.882H41.941c-21.382 0-32.09 25.851-16.971 40.971l86.059 86.059c9.373 9.373 24.568 9.373 33.941 0l86.059-86.059c15.12-15.119 4.412-40.971-16.97-40.971z"}})])]),_c('div',{ref:"left",staticClass:"fov-handle",attrs:{"id":"left-handle"},on:{"mousedown":function (e) { return _vm.startDrag(e); },"mouseup":function (e) { return _vm.endDrag(e); },"touchstart":function (e) { return _vm.startDrag(e); },"touchend":function (e) { return _vm.endDrag(e); }}},[_c('svg',{attrs:{"xmlns":"http://www.w3.org/2000/svg","viewBox":"0 0 512 512"}},[_c('path',{attrs:{"fill":"currentColor","d":"M377.941 169.941V216H134.059v-46.059c0-21.382-25.851-32.09-40.971-16.971L7.029 239.029c-9.373 9.373-9.373 24.568 0 33.941l86.059 86.059c15.119 15.119 40.971 4.411 40.971-16.971V296h243.882v46.059c0 21.382 25.851 32.09 40.971 16.971l86.059-86.059c9.373-9.373 9.373-24.568 0-33.941l-86.059-86.059c-15.119-15.12-40.971-4.412-40.971 16.97z"}})])]),_c('div',{ref:"right",staticClass:"fov-handle",attrs:{"id":"right-handle"},on:{"mousedown":function (e) { return _vm.startDrag(e); },"mouseup":function (e) { return _vm.endDrag(e); },"touchstart":function (e) { return _vm.startDrag(e); },"touchend":function (e) { return _vm.endDrag(e); }}},[_c('svg',{attrs:{"xmlns":"http://www.w3.org/2000/svg","viewBox":"0 0 512 512"}},[_c('path',{attrs:{"fill":"currentColor","d":"M377.941 169.941V216H134.059v-46.059c0-21.382-25.851-32.09-40.971-16.971L7.029 239.029c-9.373 9.373-9.373 24.568 0 33.941l86.059 86.059c15.119 15.119 40.971 4.411 40.971-16.971V296h243.882v46.059c0 21.382 25.851 32.09 40.971 16.971l86.059-86.059c9.373-9.373 9.373-24.568 0-33.941l-86.059-86.059c-15.119-15.12-40.971-4.412-40.971 16.97z"}})])]),_c('div',{ref:"bottom",staticClass:"fov-handle",attrs:{"id":"bottom-handle"},on:{"mousedown":function (e) { return _vm.startDrag(e); },"mouseup":function (e) { return _vm.endDrag(e); },"touchstart":function (e) { return _vm.startDrag(e); },"touchend":function (e) { return _vm.endDrag(e); }}},[_c('svg',{attrs:{"xmlns":"http://www.w3.org/2000/svg","viewBox":"0 0 256 512"}},[_c('path',{attrs:{"fill":"currentColor","d":"M214.059 377.941H168V134.059h46.059c21.382 0 32.09-25.851 16.971-40.971L144.971 7.029c-9.373-9.373-24.568-9.373-33.941 0L24.971 93.088c-15.119 15.119-4.411 40.971 16.971 40.971H88v243.882H41.941c-21.382 0-32.09 25.851-16.971 40.971l86.059 86.059c9.373 9.373 24.568 9.373 33.941 0l86.059-86.059c15.12-15.119 4.412-40.971-16.97-40.971z"}})])])])])}
var VideoCropControlsvue_type_template_id_af7a6bf4_scoped_true_staticRenderFns = []


// CONCATENATED MODULE: ./src/components/VideoCropControls.vue?vue&type=template&id=af7a6bf4&scoped=true&

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--14-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/ts-loader??ref--14-3!./node_modules/vuetify-loader/lib/loader.js??ref--20-0!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/VideoCropControls.vue?vue&type=script&lang=ts&
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
// EXTERNAL MODULE: ./src/components/VideoCropControls.vue?vue&type=style&index=0&id=af7a6bf4&scoped=true&lang=scss&
var VideoCropControlsvue_type_style_index_0_id_af7a6bf4_scoped_true_lang_scss_ = __webpack_require__("1df7");

// EXTERNAL MODULE: ./node_modules/vue-loader/lib/runtime/componentNormalizer.js
var componentNormalizer = __webpack_require__("2877");

// CONCATENATED MODULE: ./src/components/VideoCropControls.vue






/* normalize component */

var component = Object(componentNormalizer["a" /* default */])(
  components_VideoCropControlsvue_type_script_lang_ts_,
  VideoCropControlsvue_type_template_id_af7a6bf4_scoped_true_render,
  VideoCropControlsvue_type_template_id_af7a6bf4_scoped_true_staticRenderFns,
  false,
  null,
  "af7a6bf4",
  null
  
)

/* harmony default export */ var components_VideoCropControls = (component.exports);
// CONCATENATED MODULE: ./src/types.ts
var ScreeningState;

(function (ScreeningState) {
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
// CONCATENATED MODULE: ./src/geom.ts
function geom_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function geom_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { geom_ownKeys(Object(source), true).forEach(function (key) { geom_defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { geom_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function geom_defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const WIDTH = 120;
const HEIGHT = 160;
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
const distanceSq = (a, b) => {
  const dX = a.x - b.x;
  const dY = a.y - b.y;
  return dX * dX + dY * dY;
};
const distance = (a, b) => Math.sqrt(distanceSq(a, b));
const distanceSq2 = (a, b) => {
  const dX = a[0] - b[0];
  const dY = a[1] - b[1];
  return dX * dX + dY * dY;
};
const spanWidth = span => span.x1 - span.x0;
function shapeArea(shape) {
  return shape.reduce((acc, span) => acc + spanWidth(span), 0);
}
function rawShapeArea(shape) {
  return Object.values(shape).reduce((acc, span) => acc + shapeArea(span), 0);
}
function largestShape(shapes) {
  return shapes.reduce((prevBestShape, shape) => {
    const best = shapeArea(prevBestShape);
    const area = shapeArea(shape);
    return area > best ? shape : prevBestShape;
  }, []);
}
function rectDims(rect) {
  return {
    w: rect.x1 - rect.x0,
    h: rect.y1 - rect.y0
  };
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

  const startIndex = Math.max(0, nIndex - 13);
  const endIndex = Math.min(shape.length - 1, nIndex + 13);
  const distances = [];

  for (let i = startIndex; i < endIndex; i++) {
    for (let j = startIndex; j < endIndex; j++) {
      if (i !== j) {
        const d = distanceSq(startP(shape[i]), endP(shape[j]));
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
function narrowestSpans(shape) {
  const narrowest = narrowestSpan(shape);
  return narrowestSlanted(shape, narrowest);
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
function geom_scale(vec, scale) {
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
const isLeft = (l0, l1, p) => // Use cross-product to determine which side of a line a point is on.
(l1.x - l0.x) * (p.y - l0.y) - (l1.y - l0.y) * (p.x - l0.x);
const pointIsLeftOfOrOnLine = (l0, l1, p) => // Use cross-product to determine which side of a line a point is on.
isLeft(l0, l1, p) >= 0;
const pointIsLeftOfLine = (l0, l1, p) => // Use cross-product to determine which side of a line a point is on.
isLeft(l0, l1, p) > 0;
function isNotCeilingHeat(shape) {
  return !(shape[0].y === 0 && shape.length < 80);
}
function pointIsInQuad(p, quad) {
  return pointIsLeftOfLine(quad.bottomLeft, quad.topLeft, p) && pointIsLeftOfLine(quad.topRight, quad.bottomRight, p) && pointIsLeftOfLine(quad.bottomRight, quad.bottomLeft, p) && pointIsLeftOfLine(quad.topLeft, quad.topRight, p);
}
function faceIntersectsThermalRef(face, thermalReference) {
  if (thermalReference === null) {
    return false;
  }

  const quad = {
    topLeft: face.head.topLeft,
    topRight: face.head.topRight,
    bottomLeft: face.head.bottomLeft,
    bottomRight: face.head.bottomRight
  };
  return pointIsInQuad({
    x: thermalReference.x0,
    y: thermalReference.y0
  }, quad) || pointIsInQuad({
    x: thermalReference.x0,
    y: thermalReference.y1
  }, quad) || pointIsInQuad({
    x: thermalReference.x1,
    y: thermalReference.y0
  }, quad) || pointIsInQuad({
    x: thermalReference.x1,
    y: thermalReference.y1
  }, quad);
}
function shapesOverlap(a, b) {
  for (const [y, rowA] of Object.entries(a)) {
    if (b[Number(y)]) {
      for (const spanB of b[Number(y)]) {
        for (const spanA of rowA) {
          if (!(spanA.x1 < spanB.x0 || spanA.x0 >= spanB.x1)) {
            return true;
          }
        }
      }
    }
  }

  return false;
}
function drawRawShapesIntoMask(shapes, data, bit, width = 120) {
  for (const shape of shapes) {
    for (const row of Object.values(shape)) {
      for (const span of row) {
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
function getSolidShapes(frameShapes) {
  const solidShapes = []; // Infills vertical cracks.

  for (const shape of frameShapes) {
    const solidShape = [];

    for (const [row, spans] of Object.entries(shape)) {
      const minX0 = spans.reduce((acc, span) => Math.min(acc, span.x0), Number.MAX_SAFE_INTEGER);
      const maxX1 = spans.reduce((acc, span) => Math.max(acc, span.x1), 0);
      solidShape.push({
        x0: minX0,
        x1: maxX1,
        y: Number(row),
        h: 0
      });
    }

    solidShape.sort((a, b) => a.y - b.y);
    solidShapes.push(solidShape);
  }

  return solidShapes;
}
function shapeIsNotCircular(shape) {
  const dims = rectDims(boundsForShape(shape));
  return Math.abs(dims.w - dims.h) > 4;
}
function shapeIsOnSide(shape) {
  for (const {
    x0,
    x1
  } of shape) {
    if (x0 === 0 || x1 === WIDTH - 1) {
      return true;
    }
  }

  return false;
}
function extendToBottom(shape) {
  const halfway = Math.floor(shape.length / 2);
  let prevSpan = shape[halfway];

  for (let i = halfway + 1; i < shape.length; i++) {
    const span = shape[i]; // Basically, if it's past halfway down the shape, and it's narrowing too much,
    // don't let it.

    const width = spanWidth(span);
    const prevWidth = spanWidth(prevSpan);

    if (Math.abs(prevWidth - width) > 1) {
      // Make sure x0 and x1 are always at least as far out as the previous span:
      span.x0 = Math.min(span.x0, prevSpan.x0);
      span.x1 = Math.max(span.x1, prevSpan.x1);
    }

    prevSpan = span;
  }

  const inc = 0;

  while (prevSpan.y < HEIGHT) {
    const dup = {
      y: prevSpan.y + 1,
      x0: prevSpan.x0 - inc,
      x1: prevSpan.x1 + inc,
      h: 0
    }; // Add all the duplicate spans:

    shape.push(dup);
    prevSpan = dup;
  }

  return shape;
}
function spanOverlapsShape(span, shape) {
  if (shape[span.y - 1]) {
    for (const upperSpan of shape[span.y - 1]) {
      if (!(upperSpan.x1 < span.x0 || upperSpan.x0 >= span.x1)) {
        return true;
      }
    }
  }

  if (shape[span.y + 1]) {
    for (const lowerSpan of shape[span.y + 1]) {
      if (!(lowerSpan.x1 < span.x0 || lowerSpan.x0 >= span.x1)) {
        return true;
      }
    }
  }

  return false;
}
function mergeShapes(shape, other) {
  const rows = [...Object.keys(shape), ...Object.keys(other)];

  for (const row of rows) {
    const rowN = Number(row);

    if (shape[rowN] && other[rowN]) {
      shape[rowN].push(...other[rowN]);
    } else if (other[rowN]) {
      shape[rowN] = other[rowN];
    }
  }
}
function getRawShapes(thresholded, width, height, maskBit) {
  const shapes = [];
  let spanCount = 0;

  for (let y = 0; y < height; y++) {
    let span = {
      x0: -1,
      x1: width,
      y,
      h: 0
    };

    for (let x = 0; x < width; x++) {
      const index = y * width + x;

      if (thresholded[index] & maskBit && span.x0 === -1) {
        span.x0 = x;
      }

      if (span.x0 !== -1 && (!(thresholded[index] & maskBit) || x === width - 1)) {
        if (x === width - 1 && thresholded[index] & maskBit) {
          span.x1 = width;
        } else {
          span.x1 = x;
        } // Either put the span in an existing open shape, or start a new shape with it


        let assignedSpan = false;
        let n = shapes.length;
        let assignedShape;

        while (n !== 0) {
          const shape = shapes.shift();
          const overlap = shape && spanOverlapsShape(span, shape);

          if (overlap) {
            // Merge shapes
            if (!assignedSpan) {
              assignedSpan = true;
              spanCount++;

              if (shape[y]) {
                shape[y].push(span);
              } else {
                shape[y] = [span];
              }

              assignedShape = shape;
              shapes.push(shape);
            } else {
              // Merge this shape with the shape the span was assigned to.
              mergeShapes(assignedShape, shape);
            }
          } else {
            shapes.push(shape);
          }

          n--;
        }

        if (!assignedSpan) {
          spanCount++;
          shapes.push({
            [y]: [span]
          });
        }

        span = {
          x0: -1,
          x1: width,
          y,
          h: 0
        };
      }
    }
  } //console.log("cnt", spanCount);


  return shapes;
}
function offsetRawShape(shapes, offset) {
  const newShapes = [];

  for (const shape of shapes) {
    const newShape = {};

    for (const row of Object.values(shape)) {
      for (const span of row) {
        if (!newShape[span.y + offset.y]) {
          newShape[span.y + offset.y] = [];
        }

        newShape[span.y + offset.y].push({
          x0: span.x0 + offset.x,
          x1: span.x1 + offset.x,
          y: span.y + offset.y,
          h: span.h
        });
      }
    }

    newShapes.push(newShape);
  }

  return newShapes;
}
function boundsForConvexHull(hull) {
  const x0 = hull.reduce((minX, point) => point.x < minX ? point.x : minX, hull[0].x);
  const x1 = hull.reduce((maxX, point) => point.x > maxX ? point.x : maxX, hull[0].x);
  const y0 = hull.reduce((minY, point) => point.y < minY ? point.y : minY, hull[0].y);
  const y1 = hull.reduce((maxY, point) => point.y > maxY ? point.y : maxY, hull[0].y);
  return {
    x0,
    x1,
    y0,
    y1
  };
}
function joinShapes(top, bottom, quad) {
  const s = {};

  for (const span of top) {
    if (s[span.y]) {
      s[span.y].push(span);
    } else {
      s[span.y] = [span];
    }
  } // TODO(jon): Need to rasterize the quad and add it.
  // First get the quad bounds, then test every point inside the bounds.


  const quadBounds = boundsForConvexHull([quad.bottomLeft, quad.bottomRight, quad.topLeft, quad.topRight]);
  const width = quadBounds.x1 - quadBounds.x0;
  const height = quadBounds.y1 - quadBounds.y0;
  const bitmap = new Uint8Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = {
        x: quadBounds.x0 + x,
        y: quadBounds.y0 + y
      };

      if (pointIsInQuad(p, quad)) {
        const index = y * width + x;
        bitmap[index] = 255;
      }
    }
  } // FIXME(jon): This probably doesn't work anymore


  const rr = getRawShapes(bitmap, width, height, 255);
  const raw = offsetRawShape(rr, {
    x: quadBounds.x0,
    y: quadBounds.y0
  });
  const r = getSolidShapes(raw);

  if (r.length) {
    for (const span of r[0]) {
      if (s[span.y]) {
        s[span.y].push(span);
      } else {
        s[span.y] = [span];
      }
    }
  }

  for (const span of bottom) {
    if (s[span.y]) {
      s[span.y].push(span);
    } else {
      s[span.y] = [span];
    }
  } // TODO(jon): Join shapes needs to fill in the gaps with something
  //const shapes =


  return getSolidShapes([s])[0];
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
function allNeighboursEqual(x, y, data, bit) {
  const w = 120;
  const top = data[(y - 1) * w + x];
  const topLeft = data[(y - 1) * w + (x - 1)];
  const topRight = data[(y - 1) * w + (x + 1)];
  const left = data[y * w + (x - 1)];
  const right = data[y * w + (x + 1)];
  const bottom = data[(y + 1) * w + x];
  const bottomLeft = data[(y + 1) * w + (x - 1)];
  const bottomRight = data[(y + 1) * w + (x + 1)];
  return top === bit && topRight === bit && right === bit && bottomRight === bit && bottom === bit && bottomLeft === bit && left === bit && topLeft === bit;
}
function localDensity(x, y, data, bit) {
  const x0 = Math.max(x - 2, 0);
  const x1 = Math.min(x + 2, WIDTH - 1);
  const y0 = Math.max(y - 2, 0);
  const y1 = Math.min(y + 2, HEIGHT - 1);
  let sum = 0;

  for (let _y = y0; _y < y1; _y++) {
    for (let _x = x0; _x < x1; _x++) {
      const index = _y * WIDTH + _x;

      if (data[index] & bit) {
        sum++;
      }
    }
  }

  return sum;
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
function directionOfSet(set) {
  // What's a good way to get the current average direction?
  // This is "least squares"
  const meanX = set.reduce((acc, {
    x
  }) => acc + x, 0) / set.length;
  const meanY = set.reduce((acc, {
    y
  }) => acc + y, 0) / set.length;
  let num = 0;
  let den = 0;

  for (const p of set) {
    num += (p.x - meanX) * (p.y - meanY);
    den += (p.x - meanX) ** 2;
  }

  const gradient = num / den;
  const yIntercept = meanY - gradient * meanX; //return {x: gradient, y: yIntercept};

  return {
    v: normalise({
      x: 1,
      y: gradient
    }),
    y: yIntercept
  };
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
function fillVerticalCracks(shape) {
  // Fill gaps?
  for (let i = 0; i < shape.length; i++) {
    const startSpan = shape[i];
    const startWidth = spanWidth(startSpan);
    let shouldFill = false;
    const startFillIndex = i;

    if (i + 1 >= shape.length) {
      break;
    }

    while (i + 1 < shape.length && startWidth / spanWidth(shape[i + 1]) > 2) {
      shouldFill = true;
      i++;
    }

    if (shouldFill) {
      const endSpan = shape[i];

      for (let j = startFillIndex + 1; j < i + 1; j++) {
        shape[j].x0 = Math.min(startSpan.x0, endSpan.x0);
        shape[j].x1 = Math.max(startSpan.x1, endSpan.x1);
      }
    }
  }
} // Convex hull:

function pointInPolygon(point, vs) {
  // ray-casting algorithm based on
  // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0],
          yi = vs[i][1];
    const xj = vs[j][0],
          yj = vs[j][1];
    const intersect = yi > y != yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi;

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}

const e = 134217729,
      n = 33306690738754706e-32;

function geom_r(t, e, n, r, o) {
  let f,
      i,
      u,
      c,
      s = e[0],
      a = r[0],
      d = 0,
      l = 0;
  a > s == a > -s ? (f = s, s = e[++d]) : (f = a, a = r[++l]);
  let p = 0;
  if (d < t && l < n) for (a > s == a > -s ? (u = f - ((i = s + f) - s), s = e[++d]) : (u = f - ((i = a + f) - a), a = r[++l]), f = i, 0 !== u && (o[p++] = u); d < t && l < n;) a > s == a > -s ? (u = f - ((i = f + s) - (c = i - f)) + (s - c), s = e[++d]) : (u = f - ((i = f + a) - (c = i - f)) + (a - c), a = r[++l]), f = i, 0 !== u && (o[p++] = u);

  for (; d < t;) u = f - ((i = f + s) - (c = i - f)) + (s - c), s = e[++d], f = i, 0 !== u && (o[p++] = u);

  for (; l < n;) u = f - ((i = f + a) - (c = i - f)) + (a - c), a = r[++l], f = i, 0 !== u && (o[p++] = u);

  return 0 === f && 0 !== p || (o[p++] = f), p;
}

function o(t) {
  return new Float64Array(t);
}

const f = 33306690738754716e-32,
      geom_i = 22204460492503146e-32,
      u = 11093356479670487e-47,
      c = o(4),
      s = o(8),
      geom_a = o(12),
      geom_d = o(16),
      l = o(4);
function orient(t, o, p, b, y, h) {
  const M = (o - h) * (p - y),
        x = (t - y) * (b - h),
        j = M - x;
  if (0 === M || 0 === x || M > 0 != x > 0) return j;
  const m = Math.abs(M + x);
  return Math.abs(j) >= f * m ? j : -function (t, o, f, p, b, y, h) {
    let M, x, j, m, _, v, w, A, F, O, P, g, k, q, z, B, C, D;

    const E = t - b,
          G = f - b,
          H = o - y,
          I = p - y;
    _ = (z = (A = E - (w = (v = e * E) - (v - E))) * (O = I - (F = (v = e * I) - (v - I))) - ((q = E * I) - w * F - A * F - w * O)) - (P = z - (C = (A = H - (w = (v = e * H) - (v - H))) * (O = G - (F = (v = e * G) - (v - G))) - ((B = H * G) - w * F - A * F - w * O))), c[0] = z - (P + _) + (_ - C), _ = (k = q - ((g = q + P) - (_ = g - q)) + (P - _)) - (P = k - B), c[1] = k - (P + _) + (_ - B), _ = (D = g + P) - g, c[2] = g - (D - _) + (P - _), c[3] = D;

    let J = function (t, e) {
      let n = e[0];

      for (let r = 1; r < t; r++) n += e[r];

      return n;
    }(4, c),
        K = geom_i * h;

    if (J >= K || -J >= K) return J;
    if (M = t - (E + (_ = t - E)) + (_ - b), j = f - (G + (_ = f - G)) + (_ - b), x = o - (H + (_ = o - H)) + (_ - y), m = p - (I + (_ = p - I)) + (_ - y), 0 === M && 0 === x && 0 === j && 0 === m) return J;
    if (K = u * h + n * Math.abs(J), (J += E * m + I * M - (H * j + G * x)) >= K || -J >= K) return J;
    _ = (z = (A = M - (w = (v = e * M) - (v - M))) * (O = I - (F = (v = e * I) - (v - I))) - ((q = M * I) - w * F - A * F - w * O)) - (P = z - (C = (A = x - (w = (v = e * x) - (v - x))) * (O = G - (F = (v = e * G) - (v - G))) - ((B = x * G) - w * F - A * F - w * O))), l[0] = z - (P + _) + (_ - C), _ = (k = q - ((g = q + P) - (_ = g - q)) + (P - _)) - (P = k - B), l[1] = k - (P + _) + (_ - B), _ = (D = g + P) - g, l[2] = g - (D - _) + (P - _), l[3] = D;
    const L = geom_r(4, c, 4, l, s);
    _ = (z = (A = E - (w = (v = e * E) - (v - E))) * (O = m - (F = (v = e * m) - (v - m))) - ((q = E * m) - w * F - A * F - w * O)) - (P = z - (C = (A = H - (w = (v = e * H) - (v - H))) * (O = j - (F = (v = e * j) - (v - j))) - ((B = H * j) - w * F - A * F - w * O))), l[0] = z - (P + _) + (_ - C), _ = (k = q - ((g = q + P) - (_ = g - q)) + (P - _)) - (P = k - B), l[1] = k - (P + _) + (_ - B), _ = (D = g + P) - g, l[2] = g - (D - _) + (P - _), l[3] = D;
    const N = geom_r(L, s, 4, l, geom_a);
    _ = (z = (A = M - (w = (v = e * M) - (v - M))) * (O = m - (F = (v = e * m) - (v - m))) - ((q = M * m) - w * F - A * F - w * O)) - (P = z - (C = (A = x - (w = (v = e * x) - (v - x))) * (O = j - (F = (v = e * j) - (v - j))) - ((B = x * j) - w * F - A * F - w * O))), l[0] = z - (P + _) + (_ - C), _ = (k = q - ((g = q + P) - (_ = g - q)) + (P - _)) - (P = k - B), l[1] = k - (P + _) + (_ - B), _ = (D = g + P) - g, l[2] = g - (D - _) + (P - _), l[3] = D;
    const Q = geom_r(N, geom_a, 4, l, geom_d);
    return geom_d[Q - 1];
  }(t, o, p, b, y, h, m);
}

function cross(p1, p2, p3) {
  return orient(p1[0], p1[1], p2[0], p2[1], p3[0], p3[1]);
}

function compareByX(a, b) {
  return a[0] === b[0] ? a[1] - b[1] : a[0] - b[0];
}

function convexHull(points) {
  points.sort(compareByX);
  const lower = [];

  for (let i = 0; i < points.length; i++) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], points[i]) <= 0) {
      lower.pop();
    }

    lower.push(points[i]);
  }

  const upper = [];

  for (let ii = points.length - 1; ii >= 0; ii--) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], points[ii]) <= 0) {
      upper.pop();
    }

    upper.push(points[ii]);
  }

  upper.pop();
  lower.pop();
  return lower.concat(upper);
} // speed up convex hull by filtering out points inside quadrilateral formed by 4 extreme points


function fastConvexHull(points) {
  let left = points[0];
  let top = points[0];
  let right = points[0];
  let bottom = points[0]; // find the leftmost, rightmost, topmost and bottommost points

  for (const p of points) {
    if (p[0] < left[0]) {
      left = p;
    }

    if (p[0] > right[0]) {
      right = p;
    }

    if (p[1] < top[1]) {
      top = p;
    }

    if (p[1] > bottom[1]) {
      bottom = p;
    }
  } // filter out points that are inside the resulting quadrilateral


  const cull = [left, top, right, bottom];
  const filtered = cull.slice();

  for (const p of points) {
    if (!pointInPolygon(p, cull)) filtered.push(p);
  } // get convex hull around the filtered points


  return convexHull(filtered);
}
function convexHullForShape(shape) {
  const points = [];

  for (const span of shape) {
    points.push([span.x0, span.y]);
    points.push([span.x1, span.y]);
  }

  return fastConvexHull(points).map(([x, y]) => ({
    x,
    y
  }));
}
function convexHullForPoints(points) {
  return fastConvexHull(points).map(([x, y]) => ({
    x,
    y
  })); // TODO(jon): Need to "rasterize" the convex hull back to our span based form.
  //  Get the bounds of the convex hull, then iterate through each pixel and check whether or not they are outside
  //  the shape (maybe divide into triangles, and use pointInsideTriangle?)
}
function cloneShape(shape) {
  const newShape = [];

  for (const span of shape) {
    newShape.push(geom_objectSpread({}, span));
  }

  return newShape;
}
// CONCATENATED MODULE: ./src/dbscan.ts
const DBScan = ({
  dataset,
  epsilon,
  epsilonCompare,
  minimumPoints,
  distanceFunction
}) => {
  epsilon = epsilon || 1; // aka maxDistance

  epsilonCompare = epsilonCompare || ((dist, e) => dist < e);

  minimumPoints = minimumPoints || 2;

  distanceFunction = distanceFunction || ((a, b) => Math.abs(a - b));

  const visitedIndices = {};

  const isVisited = i => visitedIndices[i],
        markVisited = i => {
    visitedIndices[i] = true;
  };

  const clusteredIndices = {};

  const isClustered = i => clusteredIndices[i],
        markClustered = i => {
    clusteredIndices[i] = true;
  };

  const uniqueMerge = (targetArray, sourceArray) => {
    for (let i = 0; i < sourceArray.length; i += 1) {
      const item = sourceArray[i];

      if (targetArray.indexOf(item) < 0) {
        targetArray.push(item);
      }
    }
  };

  const findNeighbors = index => {
    const neighbors = [];

    for (let other = 0; other < dataset.length; other += 1) {
      const distance = distanceFunction(dataset[index], dataset[other]);

      if (epsilonCompare(distance, epsilon)) {
        neighbors.push(other);
      }
    }

    return neighbors;
  };

  const noise = [],
        addNoise = i => noise.push(i);

  const clusters = [],
        createCluster = () => clusters.push([]) - 1,
        addIndexToCluster = (c, i) => {
    clusters[c].push(i);
    markClustered(i);
  };

  const expandCluster = (c, neighbors) => {
    for (let i = 0; i < neighbors.length; i += 1) {
      const neighborIndex = neighbors[i];

      if (!isVisited(neighborIndex)) {
        markVisited(neighborIndex);
        const secondaryNeighbors = findNeighbors(neighborIndex);

        if (secondaryNeighbors.length >= minimumPoints) {
          uniqueMerge(neighbors, secondaryNeighbors);
        }
      }

      if (!isClustered(neighborIndex)) {
        addIndexToCluster(c, neighborIndex);
      }
    }
  };

  dataset.forEach((unused, index) => {
    if (!isVisited(index)) {
      markVisited(index);
      const neighbors = findNeighbors(index);

      if (neighbors.length < minimumPoints) {
        noise.push(index);
      } else {
        const clusterIndex = createCluster();
        addIndexToCluster(clusterIndex, index);
        expandCluster(clusterIndex, neighbors);
      }
    }
  });
  return {
    clusters,
    noise
  };
};

/* harmony default export */ var dbscan = (DBScan);
// CONCATENATED MODULE: ./src/face-detection.ts

function raymarchFaceDims(l1, neckBaseMiddleP, body) {
  const normMidline = normalise(sub(l1, neckBaseMiddleP)); // TODO(jon): Discard boxes that are too long/wide ratio-wise.

  const perpLeft = normalise(perp(normMidline));
  const perpRight = normalise(perp(perp(perp(normMidline)))); // TODO(jon): From the middle of the lower part of the face, march across and try to find the coldest point close
  //  to the center, this is probably the nose, and we can use it to help find the center line of the face.

  const startY = body[0].y; // Keep going until there are no spans to the left or right, so ray-march left and then right.

  let scaleFactor = 0;
  let heightProbeP = neckBaseMiddleP;
  let maxLeftScale = 0;
  let maxRightScale = 0;
  const maxHeightScale = magnitude({
    x: WIDTH,
    y: HEIGHT
  });
  const leftSymmetry = [];
  const rightSymmetry = [];

  while (scaleFactor < maxHeightScale) {
    const scaled = geom_scale(normMidline, scaleFactor);
    heightProbeP = add(neckBaseMiddleP, scaled);
    let foundLeft = false;
    let foundRight = false;

    for (let incLeft = 1; incLeft < 50; incLeft++) {
      const probeP = add(heightProbeP, geom_scale(perpLeft, incLeft));
      const xInBounds = probeP.x >= 0 && probeP.x < WIDTH;
      const probeY = Math.round(probeP.y);
      const shapeIndex = probeY - startY;

      if (shapeIndex < 0 || shapeIndex > body.length - 1) {
        break;
      }

      if (xInBounds && body[shapeIndex]) {
        if (body[shapeIndex].x0 < probeP.x && body[shapeIndex].x1 > probeP.x) {
          //
          foundLeft = true;
          maxLeftScale = Math.max(incLeft, maxLeftScale);
        }

        if (body[shapeIndex].x0 > probeP.x) {
          break;
        }
      }
    }

    for (let incRight = 1; incRight < 50; incRight++) {
      const probeP = add(heightProbeP, geom_scale(perpRight, incRight));
      const xInBounds = probeP.x >= 0 && probeP.x < WIDTH;
      const probeY = Math.round(probeP.y);
      const shapeIndex = probeY - startY;

      if (shapeIndex < 0 || shapeIndex > body.length - 1) {
        break;
      }

      if (xInBounds && body[shapeIndex]) {
        if (body[shapeIndex].x1 > probeP.x && body[shapeIndex].x0 < probeP.x) {
          foundRight = true;
          maxRightScale = Math.max(incRight, maxRightScale);
        }

        if (body[shapeIndex].x1 < probeP.x) {
          break;
        }
      }
    }

    leftSymmetry.push(maxLeftScale);
    rightSymmetry.push(maxRightScale); // symmetry.push([maxLeftScale, maxRightScale]);

    if (!(foundLeft || foundRight)) {
      break;
    }

    scaleFactor += 1;
  }

  return {
    normMidline,
    leftSymmetry,
    rightSymmetry,
    scaleFactor,
    perpLeft,
    perpRight,
    maxLeftScale,
    maxRightScale,
    heightProbeP
  };
}
// CONCATENATED MODULE: ./src/body-detection.ts
function body_detection_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function body_detection_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { body_detection_ownKeys(Object(source), true).forEach(function (key) { body_detection_defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { body_detection_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function body_detection_defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }







function advanceScreeningState(nextState, prevState, currentCount) {
  // We can only move from certain states to certain other states.
  if (prevState !== nextState) {
    const allowedNextState = ScreeningAcceptanceStates[prevState];

    if (allowedNextState.includes(nextState)) {
      // console.log("Advanced to state", nextState);
      return {
        state: nextState,
        count: 1
      };
    }
  }

  return {
    state: prevState,
    count: currentCount + 1
  };
} // Face specific stuff


function faceIsFrontOn(face) {
  // Face should be full inside frame, or at least forehead should be.
  // Face should be front-on symmetry wise
  return face.headLock !== 0;
}
function faceArea(face) {
  // TODO(jon): Could give actual pixel area of face too?
  const width = distance(face.horizontal.left, face.horizontal.right);
  const height = distance(face.vertical.top, face.vertical.bottom);
  return width * height;
}
function faceHasMovedOrChangedInSize(face, prevFace) {
  if (!prevFace) {
    return true;
  }

  if (!faceIsFrontOn(prevFace)) {
    return true;
  } // Now check relative sizes of faces.


  const prevArea = faceArea(prevFace);
  const nextArea = faceArea(face);
  const diffArea = Math.abs(nextArea - prevArea);
  const changedArea = diffArea > 150;

  if (changedArea) {
    /// console.log('area changed too much');
    return true;
  }

  const dTL = distance(face.head.topLeft, prevFace.head.topLeft);
  const dTR = distance(face.head.topRight, prevFace.head.topRight);
  const dBL = distance(face.head.bottomLeft, prevFace.head.bottomLeft);
  const dBR = distance(face.head.bottomRight, prevFace.head.bottomRight);
  const maxMovement = Math.max(dTL, dTR, dBL, dBR);

  if (maxMovement > 10) {
    /// console.log('moved too much', maxMovement);
    return true;
  }

  return false;
}

function advanceState(prevMotionStats, motionStats, face, body, prevFace, screeningState, screeningStateCount, threshold, radialSmoothed, thermalReference) {
  let next;
  let event = ""; //const prevAllMotion = prevMotionStats.motion + prevMotionStats.hotInnerEdge + prevMotionStats.hotInner + prevMotionStats.edge;
  //const allMotion = motionStats.motion + motionStats.hotInnerEdge + motionStats.hotInner + motionStats.edge;

  if (thermalReference === null) {
    next = advanceScreeningState(ScreeningState.MISSING_THERMAL_REF, screeningState, screeningStateCount);
  } else if (face !== null) {
    if (screeningState === ScreeningState.MISSING_THERMAL_REF) {
      if (faceArea(face) < 1500) {
        next = advanceScreeningState(ScreeningState.TOO_FAR, screeningState, screeningStateCount);
      } else {
        next = advanceScreeningState(ScreeningState.LARGE_BODY, screeningState, screeningStateCount);
      }
    } else if (faceArea(face) < 1500) {
      next = advanceScreeningState(ScreeningState.TOO_FAR, screeningState, screeningStateCount);
    } else if (faceIntersectsThermalRef(face, thermalReference)) {
      next = advanceScreeningState(ScreeningState.LARGE_BODY, screeningState, screeningStateCount);
    } else if (face.headLock !== 0) {
      const temperatureSamplePoint = getHottestSpotInBounds(face, threshold, WIDTH, HEIGHT, radialSmoothed);

      if (faceIsFrontOn(face) // &&
      // samplePointIsInsideCroppingArea({
      //     x: temperatureSamplePoint.x,
      //     y: temperatureSamplePoint.y
      // })
      ) {
          const faceMoved = faceHasMovedOrChangedInSize(face, prevFace);

          if (faceMoved) {
            screeningStateCount--;
          }

          if (screeningState === ScreeningState.FRONTAL_LOCK && !faceMoved && face.headLock === 1 && screeningStateCount > 2 // Needs to be on this state for at least two frames.
          ) {
              next = advanceScreeningState(ScreeningState.STABLE_LOCK, screeningState, screeningStateCount);

              if (next.state !== screeningState) {
                // Capture the screening event here
                event = "Captured";
              }
            } else if (screeningState === ScreeningState.STABLE_LOCK) {
            next = advanceScreeningState(ScreeningState.LEAVING, screeningState, screeningStateCount);
          } else {
            next = advanceScreeningState(ScreeningState.FRONTAL_LOCK, screeningState, screeningStateCount);
          }
        } else {
        // NOTE: Could stay here a while if we're in an FFC event.
        next = advanceScreeningState(ScreeningState.FACE_LOCK, screeningState, screeningStateCount);
      }
    } else {
      next = advanceScreeningState(ScreeningState.HEAD_LOCK, screeningState, screeningStateCount);
    }

    prevFace = face;
  } else {
    // TODO(jon): Ignore stats around FFC, just say that it's thinking...
    const hasBody = motionStats.actionInBottomHalf && motionStats.motionPlusThreshold > 45;
    const prevFrameHasBody = prevMotionStats.actionInBottomHalf && prevMotionStats.motionPlusThreshold > 45; // TODO(jon): OR the threshold bounds are taller vertically than horizontally?

    if (hasBody) {
      next = advanceScreeningState(ScreeningState.LARGE_BODY, screeningState, screeningStateCount);
    } else {
      // Require 2 frames without a body before triggering leave event.
      if (!prevFrameHasBody) {
        if (screeningState === ScreeningState.LEAVING) {
          // Record event now that we have lost the face?
          event = "Recorded";
        }

        next = advanceScreeningState(ScreeningState.READY, screeningState, screeningStateCount);
      } else {
        next = advanceScreeningState(ScreeningState.LARGE_BODY, screeningState, screeningStateCount);
      }
    }

    prevFace = null;
  }

  return {
    prevFace,
    state: next.state,
    count: next.count,
    event
  };
}

const body_detection_motionBit = 1 << 7;
const thresholdBit = 1 << 6;
const edgeBit = 1 << 5;

function subtractFrame(frame, prevFrame, motionBit) {
  const THRESHOLD_DIFF = 20;

  if (!prevFrame) {
    return new Uint8Array(frame);
  } else {
    const subtracted = new Uint8Array(WIDTH * HEIGHT);

    for (let i = 0; i < subtracted.length; i++) {
      // Also compare with sobel edges?
      // Then do a shrink-wrapped convex hull around the points we have.
      if (Math.abs(frame[i] - prevFrame[i]) > THRESHOLD_DIFF) {
        subtracted[i] |= motionBit;
      }
    }

    return subtracted;
  }
}

function detectBody(sobel, thermalReference, medianSmoothed, radialSmoothed, prevRadialSmoothed, min, max, threshold, thermalRefC, thermalRefRaw) {
  // IDEA(jon): We can avoid smoothing altogether, and just smooth when we actually take a sample, when it's really cheap.
  // Now take only the edges over a certain intensity?
  let thermalRefRect = {
    x0: 0,
    x1: 0,
    y0: 0,
    y1: 0
  };

  if (thermalReference) {
    const thermalRefCircleWidth = thermalReference.x1 - thermalReference.x0;
    const fudgeFactor = 1;
    const radius = thermalRefCircleWidth * 0.5;
    const thermalRefIsOnLeft = thermalReference.x0 < WIDTH / 2;

    if (thermalRefIsOnLeft) {
      thermalRefRect = {
        x0: Math.max(0, thermalReference.x0 - radius - fudgeFactor),
        x1: Math.min(WIDTH - 1, thermalReference.x1 + radius + fudgeFactor),
        y0: Math.max(0, thermalReference.y0 - radius - fudgeFactor),
        y1: Math.min(HEIGHT - 1, thermalReference.y1 + radius * 5 + fudgeFactor)
      };
    } else {
      thermalRefRect = {
        x0: Math.max(0, thermalReference.x0 - (radius * 1.8 + fudgeFactor)),
        x1: Math.min(WIDTH - 1, thermalReference.x1 + radius * 1.8 + fudgeFactor),
        y0: Math.max(0, thermalReference.y0 - (radius * 8 + fudgeFactor)),
        y1: HEIGHT - 1
      };
    }
  }

  const thermalRefWidth = thermalRefRect.x1 - thermalRefRect.x0;
  const motionMask = subtractFrame(radialSmoothed, prevRadialSmoothed, body_detection_motionBit); //let th = new Uint8Array(120 * 160);
  // Adjust threshold down if higher than the max of 34degrees

  let adjustedThreshold = threshold;

  if (thermalReference) {
    const thresholdTemp = thermalRefC + (threshold - thermalRefRaw) * 0.01;

    if (thresholdTemp > 33) {
      adjustedThreshold = thermalRefRaw - 500; // FIXME(jon) Make sure there is enough pixels above the threshold, using the histogram:
    }
  } // Remove motion mask bits for motion lines that don't abut thresholds bits
  // for (let y = 0; y < 120; y++) {
  //     for (let x = 0; x < 160; x++) {
  //         const i = y * 120 + x;
  //         const v = motionMask[i];
  //
  //     }
  // }
  // for (let i = 0; i < frame.length; i++) {
  //     if (radialSmoothed[i] > adjustedThreshold) {
  //        motionMask[i] |= thresholdBit;
  //     }
  // }
  // Only apply the threshold bit where the thresholded row contains some motion, if the thresholded row spans the full frame width.


  for (let y = 0; y < HEIGHT; y++) {
    let thresholdSpansWholeRow = true;
    let hasMotion = false;

    for (let x = 0; x < WIDTH; x++) {
      const i = y * WIDTH + x;

      if (!hasMotion && motionMask[i] & body_detection_motionBit) {
        hasMotion = true;

        if (!thresholdSpansWholeRow) {
          break;
        }
      }

      if (medianSmoothed[i] <= adjustedThreshold) {
        thresholdSpansWholeRow = false;

        if (hasMotion) {
          break;
        }
      }
    }

    if (thresholdSpansWholeRow && hasMotion || !thresholdSpansWholeRow) {
      for (let x = 0; x < WIDTH; x++) {
        const i = y * WIDTH + x;

        if (medianSmoothed[i] > adjustedThreshold) {
          motionMask[i] |= thresholdBit;
        }
      }
    }
  }

  if (thermalReference) {
    //const thermalRefWidth = WIDTH - 95;
    // Remove known thermal ref from mask (make this a factory calibration step)
    for (let y = thermalRefRect.y0; y < thermalRefRect.y1; y++) {
      for (let x = thermalRefRect.x0; x < thermalRefRect.x1; x++) {
        const i = y * WIDTH + x;
        motionMask[i] = 0;
      }
    }
  }

  const motionShapes = getRawShapes(motionMask, WIDTH, HEIGHT, body_detection_motionBit);
  const thresholdShapes = getRawShapes(motionMask, WIDTH, HEIGHT, thresholdBit);
  console.log("Motion", motionShapes.length, "Threshold", thresholdShapes.length);
  const filteredMotion = new Set();
  const filteredThreshold = new Set();

  for (const motionShape of motionShapes) {
    for (const thresholdShape of thresholdShapes) {
      if (shapesOverlap(motionShape, thresholdShape)) {
        // Make sure the areas are not long thin horizontal boxes taking up the full frame width,
        const motionShapeArea = rawShapeArea(motionShape);
        const motionShapeBounds = boundsForRawShape(motionShape);
        const motionBoundsFilled = (motionShapeBounds.x1 - motionShapeBounds.x0) * (motionShapeBounds.y1 + 1 - motionShapeBounds.y0);

        if (motionShapeArea / motionBoundsFilled > 0.98 && motionShapeBounds.x0 === 0 && motionShapeBounds.x1 === WIDTH) {
          continue;
        }

        const thresholdShapeArea = rawShapeArea(thresholdShape);
        const thresholdShapeBounds = boundsForRawShape(thresholdShape);
        const thresholdBoundsFilled = (thresholdShapeBounds.x1 - thresholdShapeBounds.x0) * (thresholdShapeBounds.y1 + 1 - thresholdShapeBounds.y0);

        if (thresholdShapeArea / thresholdBoundsFilled > 0.98 && thresholdShapeBounds.x0 === 0 && thresholdShapeBounds.x1 === WIDTH) {
          continue;
        }

        if (thresholdShapeArea > 300) {
          // At least one of the shapes should pass a size threshold:
          filteredMotion.add(motionShape);
          filteredThreshold.add(thresholdShape);
        }
      }
    }
  } // If there's no motion in the bottom half of the frame, but there is plenty of threshold, just add the threshold?


  if (filteredMotion.size === 0 && filteredThreshold.size === 0) {
    for (const thresholdShape of thresholdShapes) {
      const thresholdShapeArea = rawShapeArea(thresholdShape);
      const thresholdShapeBounds = boundsForRawShape(thresholdShape);
      const thresholdBoundsFilled = (thresholdShapeBounds.x1 - thresholdShapeBounds.x0) * (thresholdShapeBounds.y1 + 1 - thresholdShapeBounds.y0);

      if (thresholdShapeArea / thresholdBoundsFilled > 0.98 && thresholdShapeBounds.x0 === 0 && thresholdShapeBounds.x1 === WIDTH) {
        continue;
      }

      if (thresholdShapeArea > 300 && !thresholdShape[0] && thresholdShapeBounds.x1 - thresholdShapeBounds.x0 < WIDTH - thermalRefWidth) {
        // At least one of the shapes should pass a size threshold:
        filteredThreshold.add(thresholdShape);
      }
    }
  } // Draw the filtered mask back into a canvas?


  const data = new Uint8Array(WIDTH * HEIGHT);
  const filteredMotionArray = Array.from(filteredMotion);
  drawRawShapesIntoMask(filteredMotionArray, data, body_detection_motionBit);
  const solidThresholds = getSolidShapes(Array.from(filteredThreshold));
  drawShapesIntoMask(solidThresholds, data, thresholdBit);
  let mSum = 0;
  let mPlusTSum = 0;
  let tSum = 0;
  let actionInBottomOfFrame = 0;

  if (thermalReference) {
    //const thermalRefWidth = WIDTH - 95;
    // Remove known thermal ref from mask (make this a factory calibration step)
    for (let y = thermalRefRect.y0; y < thermalRefRect.y1; y++) {
      for (let x = thermalRefRect.x0; x < thermalRefRect.x1; x++) {
        const i = y * WIDTH + x;
        data[i] = 0;
      }
    }
  }

  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const i = y * WIDTH + x;
      const v = data[i];

      if (sobel[i] !== 0) {
        data[i] |= edgeBit;
      }

      if (v & body_detection_motionBit) {
        mSum++;
      }

      if (v & thresholdBit) {
        tSum++;
      }

      if (v & body_detection_motionBit && v & thresholdBit) {
        mPlusTSum++;
      }

      if (y > 80 && v !== 0) {
        actionInBottomOfFrame++;
      }
    }
  }

  if (thermalReference) {
    // Remove known thermal ref from mask (make this a factory calibration step)
    for (let y = thermalRefRect.y0; y < thermalRefRect.y1; y++) {
      for (let x = thermalRefRect.x0; x < thermalRefRect.x1; x++) {
        const i = y * WIDTH + x;
        data[i] = 0;
      }
    }
  }

  const hasBody = actionInBottomOfFrame && mPlusTSum > 45;
  return {
    hasBody,
    data,
    adjustedThreshold,
    motionStats: {
      motion: mSum,
      thresholded: tSum,
      motionPlusThreshold: mPlusTSum,
      actionInBottomHalf: actionInBottomOfFrame
    }
  };
}
function mergeHeadParts(shapes) {
  const mergedShapes = [];

  if (shapes.length) {
    const largest = largestShape(shapes);
    const hullA = convexHullForShape(largest); // FIXME(jon): Seems like in a lot of cases the corners of the image are more correct?
    //const boundsA = boundsForConvexHull(hullA);
    // Would this be better as closest points to bounding box corners?
    //const lTopLeft = closestPoint({x: boundsA.x0, y: boundsA.y0 }, hullA);

    const lTopLeft = closestPoint({
      x: 0,
      y: 0
    }, hullA); //const lTopRight = closestPoint({x: boundsA.x1, y: boundsA.y0 }, hullA);

    const lTopRight = closestPoint({
      x: WIDTH,
      y: 0
    }, hullA); // const lBottomLeft = closestPoint({x: boundsA.x0, y: boundsA.y1 }, hullA);
    // const lBottomRight = closestPoint({x: boundsA.x1, y: boundsA.y1 }, hullA);

    const lBottomLeft = closestPoint({
      x: 0,
      y: HEIGHT
    }, hullA);
    const lBottomRight = closestPoint({
      x: WIDTH,
      y: HEIGHT
    }, hullA); //const {left: lTopLeft, right: lTopRight} = topPoints(hullA);
    //const {left: lBottomLeft, right: lBottomRight} = bottomPoints(hullA);

    let merged = false;

    for (const shape of shapes) {
      const shapeA = shapeArea(shape);

      if (shape !== largest && shapeA > 100) {
        const hullB = convexHullForShape(shape);
        const boundsB = boundsForConvexHull(hullB);
        const d = 20 * shapeA;
        const maxDX = 30; // * Math.floor(shapeA / 100);

        {
          // const {left: bottomLeft, right: bottomRight} = bottomPoints(hullB);
          const bottomLeft = closestPoint({
            x: boundsB.x0,
            y: boundsB.y1
          }, hullB);
          const bottomRight = closestPoint({
            x: boundsB.x1,
            y: boundsB.y1
          }, hullB);

          if (distance(lTopLeft, bottomLeft) < d && distance(lTopRight, bottomRight) < d && Math.abs(lTopLeft.x - bottomLeft.x) < maxDX && Math.abs(lTopRight.x - bottomRight.x) < maxDX) {
            mergedShapes.push(joinShapes(shape, largest, {
              topLeft: bottomLeft,
              topRight: bottomRight,
              bottomLeft: lTopLeft,
              bottomRight: lTopRight
            }));
            merged = true;
          }
        }
        {
          //const {left: topLeft, right: topRight} = topPoints(hullB);
          const topLeft = closestPoint({
            x: boundsB.x0,
            y: boundsB.y0
          }, hullB);
          const topRight = closestPoint({
            x: boundsB.x1,
            y: boundsB.y0
          }, hullB);

          if (!merged && distance(topLeft, lBottomLeft) < d && distance(topRight, lBottomRight) < d && Math.abs(topLeft.x - lBottomLeft.x) < maxDX && Math.abs(topRight.x - lBottomRight.x) < maxDX) {
            mergedShapes.push(joinShapes(largest, shape, {
              topLeft,
              topRight,
              bottomRight: lBottomRight,
              bottomLeft: lBottomLeft
            }));
            merged = true;
          }
        }
      }
    }

    return merged ? {
      shapes: mergedShapes,
      didMerge: true
    } : {
      shapes: [largest],
      didMerge: false
    };
  }

  return {
    shapes: mergedShapes,
    didMerge: false
  };
}
function preprocessShapes(frameShapes, thermalReference) {
  let shapes = getSolidShapes(frameShapes); // Find the largest shape, and then see if there are any other reasonable sized shapes directly
  // above or below that shape.  If there are, they may be the other half of a head cut in half by glasses,
  // and should be merged.

  if (thermalReference) {
    shapes = shapes.filter(shape => {
      const shapeBounds = boundsForShape(shape);
      const area = shapeArea(shape);
      const boundsFilled = (shapeBounds.x1 + 1 - shapeBounds.x0) * (shapeBounds.y1 + 1 - shapeBounds.y0);
      const ratioFilled = area / boundsFilled; // TODO(jon): Can also check to see if the top of a shape is flat, or if the side is flat too etc.
      // if (ratioFilled > 0.9) {
      //     return false;
      // }

      const maxVariance = 5;
      return !(distance({
        x: shapeBounds.x0,
        y: shapeBounds.y0
      }, {
        x: thermalReference.x0,
        y: thermalReference.y0
      }) < maxVariance && distance({
        x: shapeBounds.x1,
        y: shapeBounds.y0
      }, {
        x: thermalReference.x1,
        y: thermalReference.y0
      }) < maxVariance && distance({
        x: shapeBounds.x0,
        y: shapeBounds.y1
      }, {
        x: thermalReference.x0,
        y: thermalReference.y1
      }) < maxVariance && distance({
        x: shapeBounds.x1,
        y: shapeBounds.y1
      }, {
        x: thermalReference.x1,
        y: thermalReference.y1
      }) < maxVariance);
    });
  }

  shapes = shapes.filter(isNotCeilingHeat); // TODO(jon): Exclude the thermal reference first.

  const {
    shapes: mergedShapes,
    didMerge
  } = mergeHeadParts(shapes);
  return {
    shapes: mergedShapes // .filter(shape => {
    //     const area = shapeArea(shape);
    //     const noLargeShapes =
    //         shapes.filter(x => shapeArea(x) > 300).length === 0;
    //     const isLargest = shape == largestShape(mergedShapes);
    //     return (
    //         area > 600 ||
    //         (noLargeShapes &&
    //             isLargest &&
    //             shapeIsOnSide(shape) &&
    //             shapeIsNotCircular(shape))
    //     );
    // })
    //.filter(isNotCeilingHeat)
    // .map(markWidest)
    // .map(markNarrowest)
    .filter(mergedShapes => mergedShapes.length),
    didMerge
  };
}

const rotate90u8 = (src, dest, width, height) => {
  let i = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      dest[x * height + y] = src[i];
      i++;
    }
  }

  return dest;
};

function guessApproximateHeadWidth(body) {
  let last = body[0];

  for (let i = 1; i < body.length; i++) {
    const span = body[i];
    span.x0 = Math.min(last.x0, span.x0);
    span.x1 = Math.max(last.x1, span.x1);
    last = span;
  }

  body.sort((a, b) => spanWidth(a) - spanWidth(b));
  const hist = {};
  const maxWidth = spanWidth(widestSpan(body));

  for (const span of body) {
    const w = spanWidth(span);

    if (w !== maxWidth) {
      if (!hist[w]) {
        hist[w] = 1;
      } else {
        hist[w]++;
      }
    }
  }

  for (const [key, val] of Object.entries(hist)) {
    if (val < 3) {
      delete hist[Number(key)];
    }
  } // Try and find the smallest duplicate width with at least a count of 10


  return Math.min(...Object.keys(hist).map(Number));
}
function refineHeadThresholdData(data, neck, pointCloud) {
  // scale out neck left and right 10px.
  const neckVec = sub(neck.right, neck.left);
  const extendAmount = distance(neck.left, neck.right) * 0.1; // - 0.3

  const downToChin = geom_scale(normalise(perp(perp(perp(neckVec)))), extendAmount);
  const p0 = sub(neck.left, geom_scale(normalise(neckVec), 15));
  const p1 = add(neck.right, geom_scale(normalise(neckVec), 15));
  const neckLeft = add(p0, geom_scale(normalise(perp(neckVec)), 100));
  const neckRight = add(p1, geom_scale(normalise(perp(neckVec)), 100));
  const extendedNeckLeft = add(neck.left, downToChin);
  const extendedNeckRight = add(neck.right, downToChin); // Now halve point-cloud above neck, make convex hull of head:

  const headPoints = [[extendedNeckLeft.x, extendedNeckLeft.y], [extendedNeckRight.x, extendedNeckRight.y]];

  for (const p of pointCloud.map(([x, y]) => ({
    x,
    y
  }))) {
    if (pointIsLeftOfLine(extendedNeckRight, extendedNeckLeft, p)) {
      // Discard points too far to the left of neck.left, or too far to the right of neck.right
      if (pointIsLeftOfLine(p0, neckLeft, p) && pointIsLeftOfLine(neckRight, p1, p)) {
        headPoints.push([p.x, p.y]);
      }
    }
  }

  const headHull = fastConvexHull(headPoints); // TODO(jon): May actually be faster to rasterise this myself. (point is in polygon etc)

  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");
  ctx.beginPath();
  ctx.fillStyle = "rgba(255, 0, 0, 0.1)";
  ctx.moveTo(headHull[0][0], headHull[0][1]);

  for (const [x, y] of headHull.slice(1)) {
    ctx.lineTo(x, y);
  }

  ctx.lineTo(headHull[0][0], headHull[0][1]);
  ctx.fill();
  const imData = ctx.getImageData(0, 0, WIDTH, HEIGHT);
  const d = new Uint32Array(imData.data.buffer);

  for (let i = 0; i < d.length; i++) {
    if (!(d[i] & 0x000000ff)) {
      data[i] &= ~thresholdBit;
    }
  }
}
function refineThresholdData(data) {
  const points = [];
  const edgePlusThreshold = 1 << 4;
  const edgePlusMotion = 1 << 3;
  const pointCloud = [];

  for (let y = 1; y < HEIGHT - 1; y++) {
    let prev = 0;

    for (let x = 1; x < WIDTH - 1; x++) {
      const i = y * WIDTH + x;
      const v = data[i]; // TODO(jon): Optimise

      if (x > 0 && prev === 0 && v & thresholdBit) {//
      } else if (prev & thresholdBit && v === 0) {//
      } else if (v & edgeBit && v & thresholdBit && !allNeighboursEqual(x, y, data, edgeBit)) {
        data[i] |= edgePlusThreshold;
      } else if (v & edgeBit && v & body_detection_motionBit && !allNeighboursEqual(x, y, data, body_detection_motionBit)) {
        data[i] |= edgePlusMotion;
      }

      prev = v;
    }
  }

  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const i = y * WIDTH + x;

      if (data[i] & edgePlusThreshold && localDensity(x, y, data, edgePlusThreshold) >= 3) {
        points.push([x, y]);
      } else if (data[i] === edgePlusMotion && localDensity(x, y, data, edgePlusMotion) >= 3) {
        points.push([x, y]);
      }
    }
  }

  if (points.length > 10) {
    //console.log("p", points.length);
    const clusters = dbscan({
      dataset: points,
      epsilon: 5 * 5,
      distanceFunction: distanceSq2,
      minimumPoints: 3
    });

    if (clusters.clusters.length) {
      let i = 0;

      for (const cluster of clusters.clusters) {
        if (cluster.length < 15) {
          let anyPointIsOnThresholdPlusMotion = false;

          for (const pointIndex of cluster) {
            const point = points[pointIndex];
            const index = WIDTH * point[1] + point[0];
            const v = data[index];

            if (v & body_detection_motionBit && v & thresholdBit) {
              anyPointIsOnThresholdPlusMotion = true;
              break;
            }
          }

          for (const pointIndex of cluster) {
            const point = points[pointIndex];

            if (anyPointIsOnThresholdPlusMotion) {
              pointCloud.push(point);
            }
          }
        } else {
          for (const pointIndex of cluster) {
            const point = points[pointIndex];
            pointCloud.push(point);
          }
        }

        i++;
      }
    }

    if (pointCloud.length > 15) {
      let hull = fastConvexHull(pointCloud); // Take the leftmost and right most points, and extend to the bottom:

      let minX = Number.MAX_SAFE_INTEGER;
      let maxX = 0;
      let leftIndex = 0;
      let rightIndex = 0;

      for (let i = 0; i < hull.length; i++) {
        const p = hull[i];

        if (p[0] < minX) {
          minX = p[0];
          leftIndex = i;
        }

        if (p[0] > maxX) {
          maxX = p[0];
          rightIndex = i;
        }
      }

      hull.splice(1, rightIndex - 1);
      hull.splice(1, 0, [hull[0][0], HEIGHT - 1], [hull[1][0], HEIGHT - 1]);
      const first = hull.findIndex(([x, y]) => y === HEIGHT - 1);
      hull = [...hull.slice(first + 1), ...hull.slice(0, first + 1)].reverse(); // Draw the hull to a canvas

      const canvas = document.createElement("canvas");
      canvas.width = WIDTH;
      canvas.height = HEIGHT;
      const ctx = canvas.getContext("2d");
      ctx.beginPath(); //ctx.strokeStyle = 'blue';

      ctx.fillStyle = "rgba(0, 255, 0, 0.1)";
      ctx.moveTo(hull[0][0], hull[0][1]);

      for (const [x, y] of hull.slice(1)) {
        ctx.lineTo(x, y);
      }

      ctx.lineTo(hull[0][0], hull[0][1]);
      ctx.fill(); //ctx.stroke();
      // Draw the convex hull, then take a mask from it:

      const imData = ctx.getImageData(0, 0, WIDTH, HEIGHT);
      const d = new Uint32Array(imData.data.buffer);

      for (let i = 0; i < d.length; i++) {
        if (!(d[i] & 0x0000ff00)) {
          // TODO(jon): Make sure the pixel is not inside the thermal ref box
          data[i] &= ~thresholdBit;
        }
      }
    }
  }

  return pointCloud;
}
function extractFaceInfo(neck, faceShape, radialSmoothed, maybeHasGlasses = false) {
  const {
    left,
    right
  } = neck;
  const startY = faceShape[0].y;
  const vec = sub(right, left); // Move down a little bit to accomodate the chin:
  //vec = sub(add(downToChin, right), add(downToChin, left));

  const extendAmount = distance(neck.left, neck.right) * 0.1; // ... 0.3

  const downToChin = geom_scale(normalise(perp(perp(perp(vec)))), extendAmount);
  const start = left;
  const halfway = geom_scale(vec, 0.5);
  const perpV = geom_scale(perp(vec), 3);
  let neckBaseMiddleP = add(start, halfway);
  let l1 = add(neckBaseMiddleP, perpV);
  const halfwayRatio = 1; // NOTE(jon): March down this line with a perp vector, and stop when we don't hit any pixels on either side.
  //  Then go halfway-down the line created by this joining line, and march out to either side to get the width
  //  of the middle of the face.  Now we should be able to get the forehead box, which we'll only use if
  //  we think the face is front-on.

  let perpLeft, perpRight, normMidline, scaleFactor, maxLeftScale, maxRightScale, leftSymmetry, rightSymmetry, heightProbeP;
  {
    const dims = raymarchFaceDims(l1, neckBaseMiddleP, faceShape);
    perpLeft = dims.perpLeft;
    perpRight = dims.perpRight;
    normMidline = dims.normMidline;
    scaleFactor = dims.scaleFactor;
    maxLeftScale = dims.maxLeftScale;
    maxRightScale = dims.maxRightScale;
    leftSymmetry = dims.leftSymmetry;
    rightSymmetry = dims.rightSymmetry;
    heightProbeP = dims.heightProbeP; // if (false && !maybeHasGlasses) {
    //   // Let's try and adjust the midline based on colder noses.
    //   const noseP = add(neckBaseMiddleP, scale(normMidline, scaleFactor * 0.4));
    //   const noseLeftP = add(noseP, scale(perpLeft, maxLeftScale));
    //   const noseRightP = add(noseP, scale(perpRight, maxRightScale));
    //   let foundLeft = false;
    //   let coldest = Number.MAX_SAFE_INTEGER;
    //   let coldestP = { x: 0, y: 0 };
    //   let coldestI = 0;
    //   const faceWidth = Math.ceil(distance(noseLeftP, noseRightP));
    //   for (
    //     let i = Math.floor(faceWidth * 0.1);
    //     i < Math.ceil(faceWidth * 0.9);
    //     i++
    //   ) {
    //     const probeP = add(noseLeftP, scale(perpRight, i));
    //     const xInBounds = probeP.x >= 0 && probeP.x < WIDTH;
    //     const probeY = Math.round(probeP.y);
    //     const shapeIndex = probeY - startY;
    //     if (shapeIndex < 0 || shapeIndex > faceShape.length - 1) {
    //       break;
    //     }
    //     if (xInBounds && faceShape[shapeIndex]) {
    //       if (
    //         faceShape[shapeIndex].x1 > probeP.x &&
    //         faceShape[shapeIndex].x0 < probeP.x
    //       ) {
    //         foundLeft = true;
    //         // Sample the pixel.
    //         const index = 120 * probeY + Math.round(probeP.x);
    //         const val = radialSmoothed[index];
    //         if (val < coldest) {
    //           coldest = val;
    //           coldestP = probeP;
    //           coldestI = i;
    //         }
    //       }
    //       if (faceShape[shapeIndex].x1 < probeP.x) {
    //         break;
    //       }
    //     }
    //   }
    //   //drawPoint(coldestP, canvas, "pink", 2);
    //   let coldestHalfway = scale(vec, coldestI / faceWidth);
    //   neckBaseMiddleP = add(start, coldestHalfway);
    //   halfwayRatio = coldestI / faceWidth;
    // }
  }

  if (!maybeHasGlasses) {
    l1 = add(neckBaseMiddleP, perpV);
    const dims = raymarchFaceDims(l1, neckBaseMiddleP, faceShape);
    perpLeft = dims.perpLeft;
    perpRight = dims.perpRight;
    normMidline = dims.normMidline;
    scaleFactor = dims.scaleFactor;
    maxLeftScale = dims.maxLeftScale;
    maxRightScale = dims.maxRightScale;
    leftSymmetry = dims.leftSymmetry;
    rightSymmetry = dims.rightSymmetry;
    heightProbeP = dims.heightProbeP;
  } // Adjust left and right symmetry, based on how much we're offset from the original neck base center point.
  //drawPoint(neckBaseMiddleP, canvas, "pink", 4);


  const ssym = []; // Divide left and right symmetry by maxLeftScale, maxRightScale;

  for (let i = 0; i < scaleFactor; i++) {
    ssym.push(Math.abs(leftSymmetry[i] / maxLeftScale - rightSymmetry[i] / maxRightScale));
  } // TODO(jon): Detect "fringe" cases where there's not enough forehead.


  if (heightProbeP) {
    neckBaseMiddleP = add(downToChin, neckBaseMiddleP);
    const bottomLeftP = add(neckBaseMiddleP, geom_scale(perpLeft, maxLeftScale));
    const bottomRightP = add(neckBaseMiddleP, geom_scale(perpRight, maxRightScale));
    const topLeftP = add(heightProbeP, geom_scale(perpLeft, maxLeftScale));
    const topRightP = add(heightProbeP, geom_scale(perpRight, maxRightScale));
    const headWidth = magnitude(sub(bottomLeftP, bottomRightP));
    const headHeight = magnitude(sub(topLeftP, bottomLeftP));
    const widthHeightRatio = headWidth / headHeight;
    const closestAllowedToEdge = 5;
    const isValidHead = widthHeightRatio > 0.5 && topLeftP.x - closestAllowedToEdge > 0 && topRightP.x + closestAllowedToEdge < WIDTH && bottomLeftP.x - closestAllowedToEdge > 0 && bottomRightP.x + closestAllowedToEdge < WIDTH; // TODO(jon): remove too small head areas.

    if (isValidHead) {
      // We only care about symmetry of the below forehead portion of the face, since above the eyes
      //  symmetry can be affected by hair parting to one side etc.
      const symmetryScore = ssym.slice(0, Math.floor(ssym.length / 2)).reduce((a, x) => a + x, 0);
      const areaLeft = leftSymmetry.slice(0, Math.floor(leftSymmetry.length / 2)).reduce((a, x) => a + x, 0);
      const areaRight = rightSymmetry.slice(0, Math.floor(rightSymmetry.length / 2)).reduce((a, x) => a + x, 0); // Use maxLeftScale and maxRightScale to get the face side edges.
      //console.log('area left, right', areaLeft, areaRight);
      //console.log('head width, height, ratio', headWidth, headHeight, headWidth / headHeight);
      // console.log("symmetry score", symmetryScore);
      //console.log(ssym.slice(0, Math.floor(symmetry.length / 2)));
      //console.log(symmetry.slice(0, Math.floor(symmetry.length / 2)));

      const areaDiff = Math.abs(areaLeft - areaRight);
      const isValidSymmetry = symmetryScore < 2; // && areaDiff < 50;

      let headLock = 0;

      if (Math.abs(bottomLeftP.y - bottomRightP.y) > 5) {
        headLock = 0;
      } // TODO(jon): I think we can relax this quite a bit and still get good results.
      else if (symmetryScore < 1.2 || symmetryScore < 3 && areaDiff < 60 || halfwayRatio > 0.4 && halfwayRatio < 0.6) {
          headLock = 1.0;
        } else if (areaDiff >= 60) {
          headLock = 0.5;
        } else {
          headLock = 0.0;
        } // TODO(jon): Could also find center of mass in bottom part of the face, and compare with actual center.
      // Draw midline, draw forehead, colour forehead pixels.


      const midP = add(neckBaseMiddleP, geom_scale(normMidline, distance(topLeftP, bottomLeftP) * 0.5));
      const midLeftP = add(midP, geom_scale(perpLeft, maxLeftScale));
      const midRightP = add(midP, geom_scale(perpRight, maxRightScale));
      const foreheadTopP = add(neckBaseMiddleP, geom_scale(normMidline, scaleFactor * 0.85));
      const foreheadBottomP = add(neckBaseMiddleP, geom_scale(normMidline, scaleFactor * 0.75));
      const foreheadAmount = 0.4;
      const foreheadTopLeftP = add(foreheadTopP, geom_scale(perpLeft, maxLeftScale * foreheadAmount));
      const foreheadTopRightP = add(foreheadTopP, geom_scale(perpRight, maxRightScale * foreheadAmount));
      const foreheadBottomLeftP = add(foreheadBottomP, geom_scale(perpLeft, maxLeftScale * foreheadAmount));
      const foreheadBottomRightP = add(foreheadBottomP, geom_scale(perpRight, maxRightScale * foreheadAmount)); // TODO(jon): Gather array of forehead pixels.

      return Object.freeze({
        halfwayRatio,
        headLock,
        forehead: {
          top: foreheadTopP,
          bottom: foreheadBottomP,
          bottomLeft: foreheadBottomLeftP,
          bottomRight: foreheadBottomRightP,
          topLeft: foreheadTopLeftP,
          topRight: foreheadTopRightP
        },
        vertical: {
          bottom: neckBaseMiddleP,
          top: heightProbeP
        },
        horizontal: {
          left: midLeftP,
          right: midRightP,
          middle: midP
        },
        head: {
          topLeft: topLeftP,
          topRight: topRightP,
          bottomLeft: bottomLeftP,
          bottomRight: bottomRightP,
          rightNeckSpan: body_detection_objectSpread({}, right),
          leftNeckSpan: body_detection_objectSpread({}, left)
        }
      });
    }
  }

  return null; // TODO(jon): Draw a line perpendicular to this line.
  // Then we can find the top of the head, and then the widest part of the head.
  // Then we can draw an oval.
  // The angle of the neck also helps us know if the head is front-on.
  // If the face is front-on, the width of the neck is roughly a third the width of shoulders, if visible.
  // TODO(jon): Separate case for animated outlines where we paint in irregularities in the head.
}
function getNeck(body) {
  //, maxYForNeck: number
  // Find the widest span from the last two thirds of the body.
  const startSpan = body[Math.max(0, body.length - 14)];
  const [left, right] = narrowestSlanted(body, startSpan);
  return {
    left: {
      x: left.x0,
      y: left.y
    },
    right: {
      x: right.x1,
      y: right.y
    }
  };
}
// CONCATENATED MODULE: ./src/shape-processing.ts

const shape_processing_WIDTH = 120;
const shape_processing_HEIGHT = 160;

const shape_processing_pointIsLeftOfLine = (l0, l1, p) => // Use cross-product to determine which side of a line a point is on.
(l1.x - l0.x) * (p.y - l0.y) - (l1.y - l0.y) * (p.x - l0.x) > 0;

function shape_processing_isNotCeilingHeat(shape) {
  return !(shape[0].y === 0 && shape.length < 80);
}

function shape_processing_magnitude(vec) {
  return Math.sqrt(vec.x * vec.x + vec.y * vec.y);
}

function shape_processing_normalise(vec) {
  const len = shape_processing_magnitude(vec);
  return {
    x: vec.x / len,
    y: vec.y / len
  };
}

function shape_processing_scale(vec, scale) {
  return {
    x: vec.x * scale,
    y: vec.y * scale
  };
}

function shape_processing_perp(vec) {
  // noinspection JSSuspiciousNameCombination
  return {
    x: vec.y,
    y: -vec.x
  };
}

function shape_processing_add(a, b) {
  return {
    x: a.x + b.x,
    y: a.y + b.y
  };
}

function shape_processing_sub(a, b) {
  return {
    x: a.x - b.x,
    y: a.y - b.y
  };
}

function shape_processing_getSolidShapes(frameShapes) {
  const solidShapes = []; // Infills vertical cracks.

  for (const shape of frameShapes) {
    const solidShape = [];

    for (const [row, spans] of Object.entries(shape)) {
      const minX0 = spans.reduce((acc, span) => Math.min(acc, span.x0), Number.MAX_SAFE_INTEGER);
      const maxX1 = spans.reduce((acc, span) => Math.max(acc, span.x1), 0);
      solidShape.push({
        x0: minX0,
        x1: maxX1,
        y: Number(row),
        h: 0
      });
    }

    solidShape.sort((a, b) => a.y - b.y);
    solidShapes.push(solidShape);
  }

  return solidShapes;
}

const shape_processing_spanWidth = span => span.x1 - span.x0;

function shape_processing_shapeArea(shape) {
  return shape.reduce((acc, span) => acc + shape_processing_spanWidth(span), 0);
}

function shape_processing_largestShape(shapes) {
  return shapes.reduce((prevBestShape, shape) => {
    const best = shape_processing_shapeArea(prevBestShape);
    const area = shape_processing_shapeArea(shape);
    return area > best ? shape : prevBestShape;
  }, []);
}

function shape_processing_boundsForShape(shape) {
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

const shape_processing_startP = ({
  x0,
  y
}) => ({
  x: x0,
  y
});

const shape_processing_endP = ({
  x1,
  y
}) => ({
  x: x1,
  y
});

const shape_processing_distance = (a, b) => {
  const dX = a.x - b.x;
  const dY = a.y - b.y;
  return Math.sqrt(dX * dX + dY * dY);
};

function shape_processing_widestSpan(shape) {
  let maxWidthSpan = shape[0];

  for (const span of shape) {
    if (shape_processing_spanWidth(span) > shape_processing_spanWidth(maxWidthSpan)) {
      maxWidthSpan = span;
    }
  }

  return maxWidthSpan;
}

function shape_processing_narrowestSpan(shape) {
  let minWidthSpan;
  minWidthSpan = shape.find(x => x.x0 !== 0 && x.x1 !== shape_processing_WIDTH - 1);

  if (!minWidthSpan) {
    minWidthSpan = shape[0];
  } // TODO(jon): Ideally the narrowest span doesn't hit the frame edges.


  for (const span of shape) {
    if (shape_processing_spanWidth(span) <= shape_processing_spanWidth(minWidthSpan)) {
      if (span.x0 !== 0 && span.x1 !== shape_processing_WIDTH - 1) {
        minWidthSpan = span;
      }
    }
  }

  return minWidthSpan;
}

function shape_processing_narrowestSlanted(shape, start) {
  const nIndex = shape.indexOf(start); // From the narrowest, wiggle about on each side to try to find a shorter distance between spans.

  const startIndex = Math.max(0, nIndex - 10);
  const endIndex = Math.min(shape.length - 1, nIndex + 10);
  const distances = [];

  for (let i = startIndex; i < endIndex; i++) {
    for (let j = startIndex; j < endIndex; j++) {
      if (i !== j) {
        const d = shape_processing_distance(shape_processing_startP(shape[i]), shape_processing_endP(shape[j]));
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
    if (a.left.x0 === 0 || a.right.x1 === shape_processing_WIDTH - 1) {
      return 1;
    } else if (b.left.x0 === 0 || b.right.x1 === shape_processing_WIDTH - 1) {
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

function shape_processing_narrowestSpans(shape) {
  const narrowest = shape_processing_narrowestSpan(shape.slice(10));
  return shape_processing_narrowestSlanted(shape, narrowest);
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
  const shape = shape_processing_largestShape(shapes);
  {
    const widest = shape_processing_widestSpan(shape.slice(Math.round(shape.length / 3 * 2)));
    const widestIndex = shape.indexOf(widest);
    const widestWidth = shape_processing_spanWidth(widest);
    let halfWidth; // Work from bottom and find first span that is past widest point, and is around 1/2 of the width.

    for (let i = widestIndex; i > 10; i--) {
      const span = shape[i];

      if (widestWidth / 2 > shape_processing_spanWidth(span)) {
        halfWidth = span;
        break;
      }
    }

    let left, right;

    if (halfWidth) {
      [left, right] = shape_processing_narrowestSlanted(shape.slice(10), halfWidth);
    } else {
      [left, right] = shape_processing_narrowestSpans(shape.slice(10));
    }

    const vec = {
      x: right.x1 - left.x0,
      y: right.y - left.y
    };
    const start = {
      x: left.x0,
      y: left.y
    };
    const halfway = shape_processing_scale(vec, 0.5);
    const perpV = shape_processing_scale(shape_processing_perp(vec), 3);
    const neckBaseMiddleP = shape_processing_add(start, halfway);
    const l1 = shape_processing_add(neckBaseMiddleP, perpV);
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

          if (!shape_processing_pointIsLeftOfLine({
            x: left.x0,
            y: left.y
          }, {
            x: right.x1,
            y: right.y
          }, p)) {
            if (shape_processing_pointIsLeftOfLine(neckBaseMiddleP, l1, p)) {//data[span.y * width + i] = 0xffff0000;
            } else {//data[span.y * width + i] = 0xffff00ff;
              }

            data[span.y * width + i] = 0x66666666;
          } else if (span.h === 0) {
            data[span.y * width + i] = colour;
          } else if (span.h === 3) {
            data[span.y * width + i] = 255 << 24 | 200 << 16 | 200 << 8 | 0;
          } else if (span.h === 4) {
            data[span.y * width + i] = 255 << 24 | 200 << 16 | 200 << 8 | 255;
          } else if (span.h === 8) {
            data[span.y * width + i] = 255 << 24 | 100 << 16 | 100 << 8 | 255;
          } else if (span.h === 1) {
            data[span.y * width + i] = 255 << 24 | 0 << 16 | 0 << 8 | 200;
          } else if (span.h === 2) {
            data[span.y * width + i] = 255 << 24 | 0 << 16 | 200 << 8 | 0;
          }

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

    const normMidline = shape_processing_normalise(shape_processing_sub(l1, neckBaseMiddleP)); // TODO(jon): Discard boxes that are too long/wide ratio-wise.

    const perpLeft = shape_processing_normalise(shape_processing_perp(normMidline));
    const perpRight = shape_processing_normalise(shape_processing_perp(shape_processing_perp(shape_processing_perp(normMidline))));
    const startY = shape[0].y; // Keep going until there are no spans to the left or right, so ray-march left and then right.

    let scaleFactor = 0;
    let heightProbeP = neckBaseMiddleP;
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    let maxLeftScale = 0;
    let maxRightScale = 0;
    const maxHeightScale = shape_processing_magnitude({
      x: shape_processing_WIDTH,
      y: shape_processing_HEIGHT
    });
    const leftSymmetry = [];
    const rightSymmetry = [];
    const symmetry = [];

    while (scaleFactor < maxHeightScale) {
      const scaled = shape_processing_scale(normMidline, scaleFactor);
      heightProbeP = shape_processing_add(neckBaseMiddleP, scaled);
      let foundLeft = false;
      let foundRight = false;

      for (let incLeft = 1; incLeft < 50; incLeft++) {
        const probeP = shape_processing_add(heightProbeP, shape_processing_scale(perpLeft, incLeft));
        const xInBounds = probeP.x >= 0 && probeP.x < shape_processing_WIDTH;
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
        const probeP = shape_processing_add(heightProbeP, shape_processing_scale(perpRight, incRight));
        const xInBounds = probeP.x >= 0 && probeP.x < shape_processing_WIDTH;
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
      const bottomLeftP = shape_processing_add(neckBaseMiddleP, shape_processing_scale(perpLeft, maxLeftScale));
      const bottomRightP = shape_processing_add(neckBaseMiddleP, shape_processing_scale(perpRight, maxRightScale));
      const topLeftP = shape_processing_add(heightProbeP, shape_processing_scale(perpLeft, maxLeftScale));
      const topRightP = shape_processing_add(heightProbeP, shape_processing_scale(perpRight, maxRightScale));
      const headWidth = shape_processing_magnitude(shape_processing_sub(bottomLeftP, bottomRightP));
      const headHeight = shape_processing_magnitude(shape_processing_sub(topLeftP, bottomLeftP));
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

        const midP = shape_processing_add(neckBaseMiddleP, shape_processing_scale(normMidline, scaleFactor * 0.5));
        const midLeftP = shape_processing_add(midP, shape_processing_scale(perpLeft, maxLeftScale));
        const midRightP = shape_processing_add(midP, shape_processing_scale(perpRight, maxRightScale));
        ctx.moveTo(midLeftP.x, midLeftP.y);
        ctx.lineTo(midRightP.x, midRightP.y);
        ctx.stroke();
        const foreheadTopP = shape_processing_add(neckBaseMiddleP, shape_processing_scale(normMidline, scaleFactor * 0.8));
        const foreheadTopLeftP = shape_processing_add(foreheadTopP, shape_processing_scale(perpLeft, maxLeftScale));
        const foreheadTopRightP = shape_processing_add(foreheadTopP, shape_processing_scale(perpRight, maxRightScale));
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
} //
// export function preprocessShapes(frameShapes: RawShape[]): Shape[] {
//   const shapes = getSolidShapes(frameShapes);
//   return (
//     shapes
//       .filter(shape => {
//         const area = shapeArea(shape);
//         const noLargeShapes =
//           shapes.filter(x => shapeArea(x) > 300).length === 0;
//         const isLargest = shape == largestShape(shapes);
//         return (
//           area > 600 ||
//           (noLargeShapes &&
//             isLargest &&
//             shapeIsOnSide(shape) &&
//             shapeIsNotCircular(shape))
//         );
//       })
//       .filter(isNotCeilingHeat)
//       .map(smoothKnobblyBits)
//       .map(extendToBottom)
//       //.map(markShoulders)
//       .map(markWidest)
//       .map(markNarrowest)
//       .filter(shapes => shapes.length)
//   );
// }

function shape_processing_preprocessShapes(frameShapes) {
  const shapes = shape_processing_getSolidShapes(frameShapes).filter(shape_processing_isNotCeilingHeat);
  const {
    shapes: mergedShapes,
    didMerge
  } = mergeHeadParts(shapes);
  return {
    shapes: mergedShapes,
    // .filter(shape => {
    //     const area = shapeArea(shape);
    //     const noLargeShapes =
    //         shapes.filter(x => shapeArea(x) > 300).length === 0;
    //     const isLargest = shape == largestShape(mergedShapes);
    //     return (
    //         area > 600 ||
    //         (noLargeShapes &&
    //             isLargest &&
    //             shapeIsOnSide(shape) &&
    //             shapeIsNotCircular(shape))
    //     );
    // })
    //.filter(isNotCeilingHeat)
    // .map(markWidest)
    // .map(markNarrowest)
    //.filter(mergedShapes => mergedShapes.length),
    didMerge
  };
}

function shape_processing_spanOverlapsShape(span, shape) {
  if (shape[span.y - 1]) {
    for (const upperSpan of shape[span.y - 1]) {
      if (!(upperSpan.x1 < span.x0 || upperSpan.x0 >= span.x1)) {
        return true;
      }
    }
  }

  if (shape[span.y + 1]) {
    for (const lowerSpan of shape[span.y + 1]) {
      if (!(lowerSpan.x1 < span.x0 || lowerSpan.x0 >= span.x1)) {
        return true;
      }
    }
  }

  return false;
}

function shape_processing_mergeShapes(shape, other) {
  const rows = [...Object.keys(shape), ...Object.keys(other)];

  for (const row of rows) {
    const rowN = Number(row);

    if (shape[rowN] && other[rowN]) {
      shape[rowN].push(...other[rowN]);
    } else if (other[rowN]) {
      shape[rowN] = other[rowN];
    }
  }
}

const LerpAmount = {
  amount: 0
};
function shape_processing_faceHasMovedOrChangedInSize(face, prevFace) {
  // FIXME
  if (prevFace === null) {
    return true;
  }

  return false;
}
function shape_processing_faceIsFrontOn(face) {
  return face.headLock > 0.4;
}
function getHottestSpotInBounds(face, threshold, width, height, imageData) {
  const forehead = face.forehead;
  const x0 = Math.floor(Math.min(forehead.topLeft.x, forehead.bottomLeft.x));
  const x1 = Math.ceil(Math.max(forehead.topRight.x, forehead.bottomRight.x));
  const y0 = Math.floor(Math.min(forehead.topLeft.y, forehead.topRight.y));
  const y1 = Math.ceil(Math.max(forehead.bottomLeft.y, forehead.bottomRight.y));
  const idealCenter = shape_processing_add(forehead.top, shape_processing_scale(shape_processing_normalise(shape_processing_sub(forehead.bottom, forehead.top)), shape_processing_distance(forehead.bottom, forehead.top) * 0.5));
  let bestDistance = Number.MAX_SAFE_INTEGER;
  let bestPoint = {
    x: 0,
    y: 0
  };
  let bestVal = 0; // NOTE: Sometimes the point we want is covered by hair, and we don't want to sample that, so
  //  take the closest point to that ideal point from the area that we know actually has passed our
  //  threshold temperature test.

  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const p = {
        x,
        y
      };

      if (shape_processing_pointIsLeftOfLine(forehead.bottomLeft, forehead.topLeft, p) && shape_processing_pointIsLeftOfLine(forehead.topRight, forehead.bottomRight, p) && shape_processing_pointIsLeftOfLine(forehead.bottomRight, forehead.bottomLeft, p) && shape_processing_pointIsLeftOfLine(forehead.topLeft, forehead.topRight, p)) {
        const index = y * width + x;
        const temp = imageData[index];

        if (temp > threshold) {
          const d = shape_processing_distance(idealCenter, p);

          if (d < bestDistance) {
            bestDistance = d;
            bestPoint = p;
            bestVal = temp;
          }
        }
      }
    }
  }

  return {
    x: bestPoint.x,
    y: bestPoint.y,
    v: bestVal
  };
}
// EXTERNAL MODULE: ./node_modules/@mdi/js/mdi.js
var mdi = __webpack_require__("94ed");

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--14-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/ts-loader??ref--14-3!./node_modules/vuetify-loader/lib/loader.js??ref--20-0!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/VideoStream.vue?vue&type=script&lang=ts&






let VideoStreamvue_type_script_lang_ts_VideoStream = class VideoStream extends vue_property_decorator["d" /* Vue */] {
  constructor() {
    super(...arguments);
    this.canEditCropping = false;
  }

  get cropIcon() {
    return mdi["b" /* mdiCrop */];
  }

  onFrameUpdate(next) {
    // TODO(jon): Why does this sometimes get called when the smoothed image array is empty?
    const canvas = this.$refs.cameraStream;
    const context = canvas.getContext("2d");
    const imgData = context.getImageData(0, 0, canvas.width, canvas.height);
    const frameData = next;
    let max = 0;
    let min = Number.MAX_SAFE_INTEGER;

    for (let i = 0; i < frameData.length; i++) {
      const f32Val = frameData[i];

      if (f32Val < min) {
        min = f32Val;
      }

      if (f32Val > max) {
        max = f32Val;
      }
    }

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

  mounted() {
    const container = this.$refs.container;
    container.style.width = `${375 * this.scale}px`;
    container.style.height = `${500 * this.scale}px`;

    if (this.frame) {
      this.onFrameUpdate(this.frame);
      this.updateOverlayCanvas();
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
      const scaleX = canvasWidth / (underlay.width * window.devicePixelRatio);
      const scaleY = canvasHeight / (underlay.height * window.devicePixelRatio);
      context.scale(scaleX, scaleY);
      const face = this.face;

      if (face) {
        // Now find the hotspot - only if we have a good lock!
        if (face.headLock === 1.0) {
          const point = getHottestSpotInBounds(face, State.currentFrame.threshold, 120, 160, this.frame);
          context.beginPath();
          context.strokeStyle = "rgba(255, 0, 0, 0.7)";
          context.lineWidth = 1;
          context.arc(point.x - 0.5, point.y - 0.5, 2, 0, Math.PI * 2);
          context.stroke();
        }

        context.lineWidth = 0.25;

        if (face.headLock === 1.0) {
          context.strokeStyle = "red";
          context.lineWidth = 0.5;
        } else if (face.headLock === 0.5) {
          context.strokeStyle = "blue";
        } else {
          context.strokeStyle = "orange";
        }

        context.beginPath();
        context.moveTo(face.head.bottomLeft.x, face.head.bottomLeft.y);
        context.lineTo(face.head.topLeft.x, face.head.topLeft.y);
        context.lineTo(face.head.topRight.x, face.head.topRight.y);
        context.lineTo(face.head.bottomRight.x, face.head.bottomRight.y);
        context.lineTo(face.head.bottomLeft.x, face.head.bottomLeft.y);
        context.moveTo(face.vertical.bottom.x, face.vertical.bottom.y);
        context.lineTo(face.vertical.top.x, face.vertical.top.y);
        context.moveTo(face.horizontal.left.x, face.horizontal.left.y);
        context.lineTo(face.horizontal.right.x, face.horizontal.right.y); // context.moveTo(face.forehead.bottomLeft.x, face.forehead.bottomLeft.y);
        // context.lineTo(
        //   face.forehead.bottomRight.x,
        //   face.forehead.bottomRight.y
        // );
        // context.moveTo(face.forehead.topLeft.x, face.forehead.topLeft.y);
        // context.lineTo(face.forehead.topRight.x, face.forehead.topRight.y);

        context.stroke();
      }

      const thermalRef = this.thermalReference;
      const drawThermalReference = true;

      if (thermalRef && drawThermalReference && this.thermalReferenceStats !== null) {
        if (this.thermalReferenceStats.coords) {
          context.save();
          context.fillStyle = "rgba(255, 0, 255, 0.5)";
          context.beginPath();

          for (const {
            x,
            y
          } of this.thermalReferenceStats.coords) {
            context.rect(x, y, 1, 1);
          }

          context.fill();
          context.restore();
        } // const cx = (thermalRef.x0 + thermalRef.x1) * 0.5 * scaleX;
        // const cy = ((thermalRef.y0 + thermalRef.y1) * 0.5 - paddingTop) * scaleY;
        // console.log(cx, cy);
        // const radius = thermalRef.width() * 0.5 * scaleX;
        // context.beginPath();
        // context.arc(cx, cy, radius, 0, 2 * Math.PI, false);
        // context.lineWidth = 0.5;
        // context.strokeStyle = "rgba(100, 0, 200, 0.75)";
        // //context.fillStyle = "rgba(255, 0, 0, 0.25)";
        // //context.fill();
        // context.stroke();

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

Object(tslib_es6["a" /* __decorate */])([Object(vue_property_decorator["c" /* Prop */])()], VideoStreamvue_type_script_lang_ts_VideoStream.prototype, "thermalReference", void 0);

Object(tslib_es6["a" /* __decorate */])([Object(vue_property_decorator["c" /* Prop */])()], VideoStreamvue_type_script_lang_ts_VideoStream.prototype, "thermalReferenceStats", void 0);

Object(tslib_es6["a" /* __decorate */])([Object(vue_property_decorator["c" /* Prop */])()], VideoStreamvue_type_script_lang_ts_VideoStream.prototype, "faces", void 0);

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
// EXTERNAL MODULE: ./src/components/VideoStream.vue?vue&type=style&index=0&id=3a43902b&scoped=true&lang=scss&
var VideoStreamvue_type_style_index_0_id_3a43902b_scoped_true_lang_scss_ = __webpack_require__("b3e1");

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
  VideoStreamvue_type_template_id_3a43902b_scoped_true_render,
  VideoStreamvue_type_template_id_3a43902b_scoped_true_staticRenderFns,
  false,
  null,
  "3a43902b",
  null
  
)

/* harmony default export */ var components_VideoStream = (VideoStream_component.exports);

/* vuetify-loader */



installComponents_default()(VideoStream_component, {VBtn: VBtn["a" /* default */],VIcon: VIcon["a" /* default */]})

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
    return `${this.val.toFixed(1)}°`;
  }

}
const getHistogram = (data, numBuckets) => {
  // Find find the total range of the data
  let max = 0;
  let min = Number.MAX_SAFE_INTEGER;

  for (let i = 0; i < data.length; i++) {
    const f32Val = data[i];

    if (f32Val < min) {
      min = f32Val;
    }

    if (f32Val > max) {
      max = f32Val;
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
          console.log("reload because version changed", JSON.stringify(prevVersion), binaryVersion, appVersion);
          window.location.reload();
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
// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--14-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/ts-loader??ref--14-3!./node_modules/vuetify-loader/lib/loader.js??ref--20-0!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/AdminScreening.vue?vue&type=script&lang=ts&





let AdminScreeningvue_type_script_lang_ts_AdminScreening = class AdminScreening extends vue_property_decorator["d" /* Vue */] {
  constructor() {
    super(...arguments);
    this.useMirrorMode = true;
    this.useDebugDraw = false;
    this.useCustomTemperatureRange = false;
    this.temperatureThresholds = [32, 38];
    this.showCalibrationDialog = false;
    this.editedCalibration = new DegreesCelsius(0);
  }

  getLabel(value) {
    return value < this.temperatureThresholds[1] ? "Low" : "High";
  }

  get face() {
    return this.faces[0];
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

  updateCalibration(event) {
    const value = event.target.value.replace("&deg;", "").replace("°", "");

    if (isNaN(Number(value))) {
      this.editedCalibration = new DegreesCelsius(36);
    }

    this.editedCalibration = new DegreesCelsius(Number(value));
  }

  incrementCalibration(amount) {
    this.editedCalibration = new DegreesCelsius(this.editedCalibration.val + amount);
  }

  async playFakeVideo() {
    const play = await fetch(`http://localhost:2040/sendCPTVFrames?${new URLSearchParams(Object.entries({
      //"cptv-file": "no-face-detected.cptv",
      "cptv-file": "looking_down.cptv",
      repeat: "1000"
    }))}`, {
      mode: "no-cors",
      method: "GET"
    });
    console.log(play);
  }

};

Object(tslib_es6["a" /* __decorate */])([Object(vue_property_decorator["c" /* Prop */])({
  required: true
})], AdminScreeningvue_type_script_lang_ts_AdminScreening.prototype, "frame", void 0);

Object(tslib_es6["a" /* __decorate */])([Object(vue_property_decorator["c" /* Prop */])({
  required: true
})], AdminScreeningvue_type_script_lang_ts_AdminScreening.prototype, "thermalReference", void 0);

Object(tslib_es6["a" /* __decorate */])([Object(vue_property_decorator["c" /* Prop */])({
  required: true
})], AdminScreeningvue_type_script_lang_ts_AdminScreening.prototype, "faceFeature", void 0);

Object(tslib_es6["a" /* __decorate */])([Object(vue_property_decorator["c" /* Prop */])({
  required: true
})], AdminScreeningvue_type_script_lang_ts_AdminScreening.prototype, "faces", void 0);

Object(tslib_es6["a" /* __decorate */])([Object(vue_property_decorator["c" /* Prop */])({
  required: true
})], AdminScreeningvue_type_script_lang_ts_AdminScreening.prototype, "cropBox", void 0);

Object(tslib_es6["a" /* __decorate */])([Object(vue_property_decorator["c" /* Prop */])({
  required: true
})], AdminScreeningvue_type_script_lang_ts_AdminScreening.prototype, "calibration", void 0);

Object(tslib_es6["a" /* __decorate */])([Object(vue_property_decorator["c" /* Prop */])({
  required: true
})], AdminScreeningvue_type_script_lang_ts_AdminScreening.prototype, "screeningState", void 0);

Object(tslib_es6["a" /* __decorate */])([Object(vue_property_decorator["c" /* Prop */])({
  required: true
})], AdminScreeningvue_type_script_lang_ts_AdminScreening.prototype, "latestScreeningEvent", void 0);

AdminScreeningvue_type_script_lang_ts_AdminScreening = Object(tslib_es6["a" /* __decorate */])([Object(vue_property_decorator["a" /* Component */])({
  components: {
    VideoStream: components_VideoStream
  }
})], AdminScreeningvue_type_script_lang_ts_AdminScreening);
/* harmony default export */ var AdminScreeningvue_type_script_lang_ts_ = (AdminScreeningvue_type_script_lang_ts_AdminScreening);
// CONCATENATED MODULE: ./src/components/AdminScreening.vue?vue&type=script&lang=ts&
 /* harmony default export */ var components_AdminScreeningvue_type_script_lang_ts_ = (AdminScreeningvue_type_script_lang_ts_); 
// EXTERNAL MODULE: ./src/components/AdminScreening.vue?vue&type=style&index=0&id=e10076ca&scoped=true&lang=css&
var AdminScreeningvue_type_style_index_0_id_e10076ca_scoped_true_lang_css_ = __webpack_require__("05a4");

// EXTERNAL MODULE: ./node_modules/vuetify/lib/components/VCard/index.js
var VCard = __webpack_require__("99d9");

// EXTERNAL MODULE: ./node_modules/vuetify/lib/components/VCheckbox/VCheckbox.js
var VCheckbox = __webpack_require__("ac7c");

// EXTERNAL MODULE: ./node_modules/vuetify/lib/components/VRangeSlider/VRangeSlider.js + 2 modules
var VRangeSlider = __webpack_require__("5963");

// CONCATENATED MODULE: ./src/components/AdminScreening.vue






/* normalize component */

var AdminScreening_component = Object(componentNormalizer["a" /* default */])(
  components_AdminScreeningvue_type_script_lang_ts_,
  AdminScreeningvue_type_template_id_e10076ca_scoped_true_render,
  AdminScreeningvue_type_template_id_e10076ca_scoped_true_staticRenderFns,
  false,
  null,
  "e10076ca",
  null
  
)

/* harmony default export */ var components_AdminScreening = (AdminScreening_component.exports);

/* vuetify-loader */




installComponents_default()(AdminScreening_component, {VCardText: VCard["c" /* VCardText */],VCheckbox: VCheckbox["a" /* default */],VRangeSlider: VRangeSlider["a" /* default */]})

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"93785e02-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vuetify-loader/lib/loader.js??ref--20-0!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/UserFacingScreening.vue?vue&type=template&id=0eeeafd4&scoped=true&
var UserFacingScreeningvue_type_template_id_0eeeafd4_scoped_true_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"user-state",class:[
    _vm.classNameForState,
    _vm.screeningResultClass,
    { 'mini-view': !_vm.onReferenceDevice }
  ],style:({ background: _vm.warmupBackgroundColour }),attrs:{"id":"user-facing-screening"},on:{"click":function($event){_vm.interacted = true}}},[(!_vm.isWarmingUp)?_c('canvas',{ref:"beziers",attrs:{"id":"beziers","width":"810","height":"1080"}}):_vm._e(),_c('div',{staticClass:"center",class:{ 'warming-up': _vm.isWarmingUp }},[(_vm.hasScreeningResult)?_c('div',{staticClass:"result"},[_vm._v(" "+_vm._s(_vm.temperature)+" ")]):(_vm.isAquiring)?_c('div',[_vm._v(" Hold still a moment... ")]):(_vm.isWarmingUp)?_c('div',[_vm._v(" Warming up, "),_c('span',[_vm._v(_vm._s(_vm.remainingWarmupTime))]),_vm._v(" remaining ")]):(_vm.isTooFar)?_c('div',[_vm._v(" Come closer ")]):(_vm.missingRef)?_c('div',[_vm._v(" Missing Thermal Ref ")]):_c('div',[_vm._v("Ready")]),_vm._l((_vm.stateQueue),function(msg,index){return _c('div',{key:msg.message,staticClass:"message",class:("msg-" + index)},[_vm._v(" "+_vm._s(msg.message)+" ")])})],2),(_vm.onReferenceDevice || _vm.isLocal)?_c('v-card',{staticClass:"settings-toggle-button",class:{ interacted: _vm.interacted },attrs:{"dark":"","flat":"","height":"44","tile":"","color":"transparent"}},[_c('v-card-actions',[_c('v-btn',{attrs:{"absolute":"","dark":"","fab":"","bottom":"","right":"","elevation":"0","color":"transparent"},on:{"click":function (e) {
            if (_vm.interacted) {
              _vm.showSettings = true;
              _vm.hasSettings = true;
            }
          }}},[_c('v-icon',{attrs:{"color":"rgba(255, 255, 255, 0.5)","large":""}},[_vm._v(_vm._s(_vm.cogIcon))])],1)],1)],1):_vm._e(),_c('v-dialog',{attrs:{"hide-overlay":"","attach":"#user-facing-screening","fullscreen":"","transition":"dialog-bottom-transition"},model:{value:(_vm.showSettings),callback:function ($$v) {_vm.showSettings=$$v},expression:"showSettings"}},[(_vm.hasSettings)?_c('AdminSettings',{on:{"closed":_vm.closedAdminSettings}}):_vm._e()],1)],1)}
var UserFacingScreeningvue_type_template_id_0eeeafd4_scoped_true_staticRenderFns = []


// CONCATENATED MODULE: ./src/components/UserFacingScreening.vue?vue&type=template&id=0eeeafd4&scoped=true&

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"93785e02-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vuetify-loader/lib/loader.js??ref--20-0!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/AdminSettings.vue?vue&type=template&id=34541e83&scoped=true&
var AdminSettingsvue_type_template_id_34541e83_scoped_true_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-card',[_c('v-toolbar',{attrs:{"color":"light-blue","dark":""},scopedSlots:_vm._u([{key:"extension",fn:function(){return [_c('v-tabs',{attrs:{"centered":""},model:{value:(_vm.tab),callback:function ($$v) {_vm.tab=$$v},expression:"tab"}},_vm._l((_vm.tabItems),function(item){return _c('v-tab',{key:item.tab},[_vm._v(_vm._s(item.tab))])}),1)]},proxy:true}])},[_c('v-toolbar-title',[_vm._v("Settings")]),_c('v-spacer'),_c('v-btn',{attrs:{"text":""},on:{"click":_vm.close}},[_vm._v(" close ")])],1),_c('v-tabs-items',{attrs:{"touchless":""},model:{value:(_vm.tab),callback:function ($$v) {_vm.tab=$$v},expression:"tab"}},_vm._l((_vm.tabItems),function(item){return _c('v-tab-item',{key:item.tab},[_c(item.content,{tag:"component"})],1)}),1)],1)}
var AdminSettingsvue_type_template_id_34541e83_scoped_true_staticRenderFns = []


// CONCATENATED MODULE: ./src/components/AdminSettings.vue?vue&type=template&id=34541e83&scoped=true&

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"93785e02-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vuetify-loader/lib/loader.js??ref--20-0!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/CalibrationSettings.vue?vue&type=template&id=1630d800&scoped=true&
var CalibrationSettingsvue_type_template_id_1630d800_scoped_true_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-card',{attrs:{"height":"calc(100vh - 112px)"}},[_c('v-container',{staticClass:"cont"},[_c('v-card',{staticClass:"split",attrs:{"flat":""}},[_c('v-card',[_c('VideoStream',{attrs:{"frame":_vm.state.currentFrame.smoothed,"thermal-reference":_vm.state.thermalReference,"thermal-reference-stats":_vm.state.thermalReferenceStats,"face":_vm.state.face,"crop-box":_vm.editedCropBox,"crop-enabled":true},on:{"crop-changed":_vm.onCropChanged}})],1),_c('v-card',{staticClass:"settings",attrs:{"width":"700"}},[_c('v-card-title',[_vm._v(" Calibration: "+_vm._s(_vm.pendingCalibration)+" "),_c('v-btn',{attrs:{"text":"","disabled":!_vm.canCalibrate},on:{"click":function($event){$event.stopPropagation();return (function () { return _vm.editCalibration(); })($event)}}},[_c('v-icon',{attrs:{"color":"#999","small":""}},[_vm._v(_vm._s(_vm.pencilIcon))]),_vm._v(" Edit ")],1)],1),_c('v-dialog',{attrs:{"max-width":"400"},model:{value:(_vm.showCalibrationDialog),callback:function ($$v) {_vm.showCalibrationDialog=$$v},expression:"showCalibrationDialog"}},[_c('v-card',[_c('v-card-title',[_vm._v("Edit calibration")]),_c('v-container',[(_vm.snapshotScreeningEvent)?_c('VideoStream',{attrs:{"frame":_vm.snapshotScreeningEvent.frame.smoothed,"thermal-reference":_vm.snapshotScreeningEvent.thermalReference,"face":_vm.snapshotScreeningEvent.face,"crop-box":_vm.state.currentCalibration.cropBox,"crop-enabled":false,"draw-overlays":true,"scale":0.6}}):_vm._e()],1),_c('v-card-subtitle',[_vm._v(" Take your temperature and enter it here to calibrate the system against the current screening event. ")]),_c('v-card-text',[_c('v-text-field',{attrs:{"label":"calibrated temperature","value":_vm.editedCalibration},on:{"blur":_vm.updateCalibration}}),_c('v-card-actions',[_c('v-btn',{on:{"click":function () { return _vm.incrementCalibration(0.1); }}},[_c('v-icon',{attrs:{"light":""}},[_vm._v(_vm._s(_vm.plusIcon))])],1),_c('v-spacer'),_c('v-btn',{on:{"click":function () { return _vm.incrementCalibration(-0.1); }}},[_c('v-icon',{attrs:{"light":""}},[_vm._v(_vm._s(_vm.minusIcon))])],1)],1)],1),_c('v-card-actions',[_c('v-spacer'),_c('v-btn',{attrs:{"text":"","color":"grey darken-1"},on:{"click":function($event){_vm.showCalibrationDialog = false}}},[_vm._v("Cancel")]),_c('v-btn',{attrs:{"text":"","color":"green darken-1"},on:{"click":function (e) { return _vm.acceptCalibration(); }}},[_vm._v("Accept")])],1)],1)],1),_c('v-card-text',[_c('v-checkbox',{attrs:{"label":"Use custom alerts temperature range"},on:{"change":_vm.toggleCustomTemperatureThresholds},model:{value:(_vm.useCustomTemperatureRange),callback:function ($$v) {_vm.useCustomTemperatureRange=$$v},expression:"useCustomTemperatureRange"}}),_c('v-card-text',[_c('v-range-slider',{attrs:{"disabled":!_vm.useCustomTemperatureRange,"min":"30","max":"40","step":"0.1","thumb-label":"","ticks":true,"color":'green',"track-color":'rgba(255, 0, 0, 0.25)'},model:{value:(_vm.editedTemperatureThresholds),callback:function ($$v) {_vm.editedTemperatureThresholds=$$v},expression:"editedTemperatureThresholds"}}),_c('span',{staticClass:"selected-temp-range",domProps:{"innerHTML":_vm._s(_vm.selectedTemperatureRange)}})],1)],1),_c('v-card-title',[_vm._v("Sounds:")]),_c('v-container',{attrs:{"fluid":"","width":"100%"}},[_c('v-row',[_c('v-col',{attrs:{"cols":"4"}},[_c('v-switch',{attrs:{"label":"Play normal sound"},on:{"change":function (e) { return _vm.saveSounds(); }},model:{value:(_vm.playNormalSound),callback:function ($$v) {_vm.playNormalSound=$$v},expression:"playNormalSound"}})],1),_c('v-col',{attrs:{"cols":"4"}},[_c('v-switch',{attrs:{"label":"Play warning sound"},on:{"change":function (e) { return _vm.saveSounds(); }},model:{value:(_vm.playWarningSound),callback:function ($$v) {_vm.playWarningSound=$$v},expression:"playWarningSound"}})],1),_c('v-col',{attrs:{"cols":"4"}},[_c('v-switch',{attrs:{"label":"Play error sound"},on:{"change":function (e) { return _vm.saveSounds(); }},model:{value:(_vm.playErrorSound),callback:function ($$v) {_vm.playErrorSound=$$v},expression:"playErrorSound"}})],1)],1)],1)],1)],1),_c('v-overlay',{attrs:{"value":_vm.saving,"light":""}},[_vm._v(" Saving settings ")]),_c('v-card-actions',{staticClass:"bottom-nav"},[_c('v-btn',{attrs:{"text":"","disabled":!_vm.hasMadeEdits},on:{"click":function (e) { return _vm.resetEdits(); }}},[_vm._v(" Discard changes ")]),_c('v-btn',{attrs:{"text":"","disabled":!_vm.hasMadeEdits},on:{"click":function (e) { return _vm.saveEdits(); }}},[_vm._v(" Save changes ")])],1)],1)],1)}
var CalibrationSettingsvue_type_template_id_1630d800_scoped_true_staticRenderFns = []


// CONCATENATED MODULE: ./src/components/CalibrationSettings.vue?vue&type=template&id=1630d800&scoped=true&

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
        RefTemperatureValue: Math.round(data.thermalReferenceRawValue),
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
        MinNormalThreshold: calibration.thresholdMinNormal,
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
      //return "http://192.168.178.21";
      return "http://192.168.0.44";
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
// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--14-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/ts-loader??ref--14-3!./node_modules/vuetify-loader/lib/loader.js??ref--20-0!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/CalibrationSettings.vue?vue&type=script&lang=ts&
function CalibrationSettingsvue_type_script_lang_ts_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function CalibrationSettingsvue_type_script_lang_ts_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { CalibrationSettingsvue_type_script_lang_ts_ownKeys(Object(source), true).forEach(function (key) { CalibrationSettingsvue_type_script_lang_ts_defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { CalibrationSettingsvue_type_script_lang_ts_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function CalibrationSettingsvue_type_script_lang_ts_defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }








let CalibrationSettingsvue_type_script_lang_ts_CalibrationSettings = class CalibrationSettings extends vue_property_decorator["d" /* Vue */] {
  constructor() {
    super(...arguments);
    this.useCustomTemperatureRange = false;
    this.editedTemperatureThresholds = [0, 0];
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
      this.editedTemperatureThresholds = [this.state.currentCalibration.thresholdMinNormal, this.state.currentCalibration.thresholdMinFever];
    }

    if (!val) {
      this.editedTemperatureThresholds = [DEFAULT_THRESHOLD_MIN_NORMAL, DEFAULT_THRESHOLD_MIN_FEVER];
    } // Update custom back to defaults

  }

  get selectedTemperatureRange() {
    return `${new DegreesCelsius(this.editedTemperatureThresholds[0])} &ndash; ${new DegreesCelsius(this.editedTemperatureThresholds[1])}`;
  }

  get hasMadeEdits() {
    const unedited = {
      cropBox: this.state.currentCalibration.cropBox,
      temperatureThresholds: [this.state.currentCalibration.thresholdMinNormal, this.state.currentCalibration.thresholdMinFever],
      calibration: this.state.currentCalibration.calibrationTemperature.val
    };
    const edited = {
      cropBox: this.editedCropBox,
      temperatureThresholds: this.editedTemperatureThresholds,
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
    this.snapshotScreeningEvent = null;
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
    const thresholdMinNormal = this.editedTemperatureThresholds[0];
    const thresholdMinFever = this.editedTemperatureThresholds[1];
    let frame = this.state.currentFrame;
    let sampleX = -1;
    let sampleY = -1;

    if (frame) {
      if (this.latestScreeningEvent) {
        thermalRefRaw = this.latestScreeningEvent.thermalReferenceRawValue;
        rawTempValue = this.latestScreeningEvent.rawTemperatureValue;
        thermalRefTemp = currentCalibration.val - (rawTempValue - thermalRefRaw) * 0.01;
        frame = this.latestScreeningEvent.frame;
        sampleX = this.latestScreeningEvent.sampleX;
        sampleY = this.latestScreeningEvent.sampleY;
      }

      const timestamp = new Date();
      await ScreeningApi.recordCalibrationEvent(this.deviceName, this.deviceID, {
        cropBox,
        timestamp: timestamp,
        calibrationTemperature: currentCalibration,
        hotspotRawTemperatureValue: rawTempValue,
        thermalRefTemperature: new DegreesCelsius(thermalRefTemp),
        thermalReferenceRawValue: thermalRefRaw,
        thresholdMinFever,
        thresholdMinNormal
      }, frame, sampleX, sampleY);
      return DeviceApi.saveCalibration({
        ThresholdMinNormal: thresholdMinNormal,
        ThresholdMinFever: thresholdMinFever,
        ThermalRefTemp: thermalRefTemp,
        TemperatureCelsius: currentCalibration.val,
        Top: cropBox.top,
        Right: cropBox.right,
        Left: cropBox.left,
        Bottom: cropBox.bottom,
        UuidOfUpdater: this.state.uuid,
        BodyLocation: "forehead",
        CalibrationBinaryVersion: this.state.currentFrame.frameInfo.BinaryVersion,
        SnapshotTime: timestamp.getTime(),
        SnapshotUncertainty: 0,
        SnapshotValue: rawTempValue
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
    this.editedTemperatureThresholds = [this.state.currentCalibration.thresholdMinNormal, this.state.currentCalibration.thresholdMinFever];
    this.useCustomTemperatureRange = this.editedTemperatureThresholds[0] !== DEFAULT_THRESHOLD_MIN_NORMAL && this.editedTemperatureThresholds[1] !== DEFAULT_THRESHOLD_MIN_FEVER;
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
// EXTERNAL MODULE: ./src/components/CalibrationSettings.vue?vue&type=style&index=0&id=1630d800&scoped=true&lang=scss&
var CalibrationSettingsvue_type_style_index_0_id_1630d800_scoped_true_lang_scss_ = __webpack_require__("bcb5");

// EXTERNAL MODULE: ./node_modules/vuetify/lib/components/VCard/VCard.js
var VCard_VCard = __webpack_require__("b0af");

// EXTERNAL MODULE: ./node_modules/vuetify/lib/components/VGrid/VCol.js
var VCol = __webpack_require__("62ad");

// EXTERNAL MODULE: ./node_modules/vuetify/lib/components/VGrid/VContainer.js + 1 modules
var VContainer = __webpack_require__("a523");

// EXTERNAL MODULE: ./node_modules/vuetify/lib/components/VDialog/VDialog.js + 1 modules
var VDialog = __webpack_require__("169a");

// EXTERNAL MODULE: ./node_modules/vuetify/lib/components/VOverlay/VOverlay.js
var VOverlay = __webpack_require__("a797");

// EXTERNAL MODULE: ./node_modules/vuetify/lib/components/VGrid/VRow.js
var VRow = __webpack_require__("0fd9");

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
  CalibrationSettingsvue_type_template_id_1630d800_scoped_true_render,
  CalibrationSettingsvue_type_template_id_1630d800_scoped_true_staticRenderFns,
  false,
  null,
  "1630d800",
  null
  
)

/* harmony default export */ var components_CalibrationSettings = (CalibrationSettings_component.exports);

/* vuetify-loader */


















installComponents_default()(CalibrationSettings_component, {VBtn: VBtn["a" /* default */],VCard: VCard_VCard["a" /* default */],VCardActions: VCard["a" /* VCardActions */],VCardSubtitle: VCard["b" /* VCardSubtitle */],VCardText: VCard["c" /* VCardText */],VCardTitle: VCard["d" /* VCardTitle */],VCheckbox: VCheckbox["a" /* default */],VCol: VCol["a" /* default */],VContainer: VContainer["a" /* default */],VDialog: VDialog["a" /* default */],VIcon: VIcon["a" /* default */],VOverlay: VOverlay["a" /* default */],VRangeSlider: VRangeSlider["a" /* default */],VRow: VRow["a" /* default */],VSpacer: VSpacer["a" /* default */],VSwitch: VSwitch["a" /* default */],VTextField: VTextField["a" /* default */]})

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"93785e02-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vuetify-loader/lib/loader.js??ref--20-0!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/DeviceInfo.vue?vue&type=template&id=847bc600&scoped=true&
var DeviceInfovue_type_template_id_847bc600_scoped_true_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-card',{attrs:{"flat":""}},[(_vm.items)?_c('v-simple-table',{scopedSlots:_vm._u([{key:"default",fn:function(){return [_c('thead',[_c('tr',[_c('th',{staticClass:"text-left"},[_vm._v("Device config")]),_c('th',{staticClass:"text-left"})])]),_c('tbody',_vm._l((_vm.items),function(ref){
var name = ref[0];
var item = ref[1];
return _c('tr',{key:name},[_c('td',[_vm._v(_vm._s(name))]),_c('td',[_vm._v(_vm._s(item))])])}),0)]},proxy:true}],null,false,421180828)}):_vm._e()],1)}
var DeviceInfovue_type_template_id_847bc600_scoped_true_staticRenderFns = []


// CONCATENATED MODULE: ./src/components/DeviceInfo.vue?vue&type=template&id=847bc600&scoped=true&

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--14-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/ts-loader??ref--14-3!./node_modules/vuetify-loader/lib/loader.js??ref--20-0!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/DeviceInfo.vue?vue&type=script&lang=ts&
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
  DeviceInfovue_type_template_id_847bc600_scoped_true_render,
  DeviceInfovue_type_template_id_847bc600_scoped_true_staticRenderFns,
  false,
  null,
  "847bc600",
  null
  
)

/* harmony default export */ var components_DeviceInfo = (DeviceInfo_component.exports);

/* vuetify-loader */



installComponents_default()(DeviceInfo_component, {VCard: VCard_VCard["a" /* default */],VSimpleTable: VSimpleTable["a" /* default */]})

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"93785e02-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vuetify-loader/lib/loader.js??ref--20-0!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/DeveloperUtilities.vue?vue&type=template&id=303829d8&scoped=true&
var DeveloperUtilitiesvue_type_template_id_303829d8_scoped_true_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-card',{attrs:{"flat":"","height":"calc(100vh - 112px)"}},[_c('v-container',{staticClass:"cont"},[_c('v-card',[_c('VideoStream',{attrs:{"frame":_vm.state.currentFrame.smoothed,"thermal-reference":_vm.state.thermalReference,"thermal-reference-stats":_vm.state.thermalReferenceStats,"face":_vm.state.face,"crop-box":_vm.editedThermalRefMask,"crop-enabled":true,"recording":_vm.isRecording},on:{"crop-changed":_vm.onMaskChanged}}),_c('div',{staticClass:"buttons"},[(_vm.isRunningInAndroidWebview)?_c('div',[_vm._v(" To make recordings this needs to be running inside a browser, not the Te Kahu Ora app. ")]):_c('div',[_c('v-btn',{attrs:{"center":""},on:{"click":_vm.toggleRecording}},[_vm._v(_vm._s(!_vm.isRecording ? "Record" : "Stop Recording"))])],1)])],1),_c('v-card',[_c('v-card-actions',[_c('v-btn',{on:{"click":_vm.skipWarmup}},[_vm._v("Skip warmup period")])],1)],1)],1)],1)}
var DeveloperUtilitiesvue_type_template_id_303829d8_scoped_true_staticRenderFns = []


// CONCATENATED MODULE: ./src/components/DeveloperUtilities.vue?vue&type=template&id=303829d8&scoped=true&

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--14-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/ts-loader??ref--14-3!./node_modules/vuetify-loader/lib/loader.js??ref--20-0!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/DeveloperUtilities.vue?vue&type=script&lang=ts&






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
// EXTERNAL MODULE: ./src/components/DeveloperUtilities.vue?vue&type=style&index=0&id=303829d8&scoped=true&lang=scss&
var DeveloperUtilitiesvue_type_style_index_0_id_303829d8_scoped_true_lang_scss_ = __webpack_require__("b4f6");

// CONCATENATED MODULE: ./src/components/DeveloperUtilities.vue






/* normalize component */

var DeveloperUtilities_component = Object(componentNormalizer["a" /* default */])(
  components_DeveloperUtilitiesvue_type_script_lang_ts_,
  DeveloperUtilitiesvue_type_template_id_303829d8_scoped_true_render,
  DeveloperUtilitiesvue_type_template_id_303829d8_scoped_true_staticRenderFns,
  false,
  null,
  "303829d8",
  null
  
)

/* harmony default export */ var components_DeveloperUtilities = (DeveloperUtilities_component.exports);

/* vuetify-loader */





installComponents_default()(DeveloperUtilities_component, {VBtn: VBtn["a" /* default */],VCard: VCard_VCard["a" /* default */],VCardActions: VCard["a" /* VCardActions */],VContainer: VContainer["a" /* default */]})

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--14-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/ts-loader??ref--14-3!./node_modules/vuetify-loader/lib/loader.js??ref--20-0!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/AdminSettings.vue?vue&type=script&lang=ts&





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

// EXTERNAL MODULE: ./node_modules/vuetify/lib/components/VTabs/VTabs.js + 5 modules
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










installComponents_default()(AdminSettings_component, {VBtn: VBtn["a" /* default */],VCard: VCard_VCard["a" /* default */],VSpacer: VSpacer["a" /* default */],VTab: VTab["a" /* default */],VTabItem: VTabItem["a" /* default */],VTabs: VTabs["a" /* default */],VTabsItems: VTabsItems["a" /* default */],VToolbar: VToolbar["a" /* default */],VToolbarTitle: components_VToolbar["a" /* VToolbarTitle */]})

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--14-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/ts-loader??ref--14-3!./node_modules/vuetify-loader/lib/loader.js??ref--20-0!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/UserFacingScreening.vue?vue&type=script&lang=ts&
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
        y: Number(y),
        h: 0
      });
    } else {
      // What's the closest point on prev?
      // Let's use that.
      const rowPrev = closestY(prev, y); // Should actually be the amount that rowPrev moved compared with
      // it's corresponding row in rowNext.

      result.push({
        x0: lerp(rowPrev.x0, amt, rowNext.x0),
        x1: lerp(rowPrev.x1, amt, rowNext.x1),
        y: Number(y),
        h: 0
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
    performance.mark("bezs"); // const toRemove = [];
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
        const nextShape = this.shapes[1];

        if (prevShape && nextShape && prevShape.length && nextShape.length) {
          const interpolatedShape = interpolateShapes(prevShape[0], LerpAmount.amount, nextShape[0]); // TODO(jon): This lerp amount should be frame-rate independent, so time duration between frames.

          LerpAmount.amount += 0.166;
          LerpAmount.amount = Math.min(1, LerpAmount.amount);
          const pointsArray = new Uint8Array(interpolatedShape.length * 4);
          let i = 0;

          for (const row of interpolatedShape) {
            pointsArray[i++] = row.x1;
            pointsArray[i++] = row.y;
          }

          for (const row of interpolatedShape.reverse()) {
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

    performance.mark("beze");
    performance.measure("beziers", "bezs", "beze");
    window.requestAnimationFrame(this.drawBezierOutline.bind(this));
  }

  get temperature() {
    if (this.screeningEvent) {
      return temperatureForSensorValue(this.calibration.calibrationTemperature.val, this.screeningEvent.rawTemperatureValue, this.screeningEvent.thermalReferenceRawValue);
    }

    return new DegreesCelsius(0);
  }

  get temperatureIsNormal() {
    const temperature = this.temperature.val;
    return (//temperature >= this.calibration.thresholdMinNormal &&
      temperature < this.calibration.thresholdMinFever
    );
  }

  get temperatureIsHigherThanNormal() {
    const temperature = this.temperature.val;
    return temperature >= this.calibration.thresholdMinFever;
  }

  get temperatureIsProbablyAnError() {
    const temperature = this.temperature.val; // TODO(jon)

    return temperature > 42.5;
  }

  get classNameForState() {
    return this.state.toLowerCase().replace("_", "-");
  }

  get screeningResultClass() {
    if (this.state === ScreeningState.STABLE_LOCK || this.state === ScreeningState.LEAVING) {
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
// EXTERNAL MODULE: ./src/components/UserFacingScreening.vue?vue&type=style&index=0&id=0eeeafd4&scoped=true&lang=scss&
var UserFacingScreeningvue_type_style_index_0_id_0eeeafd4_scoped_true_lang_scss_ = __webpack_require__("dd22");

// CONCATENATED MODULE: ./src/components/UserFacingScreening.vue






/* normalize component */

var UserFacingScreening_component = Object(componentNormalizer["a" /* default */])(
  components_UserFacingScreeningvue_type_script_lang_ts_,
  UserFacingScreeningvue_type_template_id_0eeeafd4_scoped_true_render,
  UserFacingScreeningvue_type_template_id_0eeeafd4_scoped_true_staticRenderFns,
  false,
  null,
  "0eeeafd4",
  null
  
)

/* harmony default export */ var components_UserFacingScreening = (UserFacingScreening_component.exports);

/* vuetify-loader */






installComponents_default()(UserFacingScreening_component, {VBtn: VBtn["a" /* default */],VCard: VCard_VCard["a" /* default */],VCardActions: VCard["a" /* VCardActions */],VDialog: VDialog["a" /* default */],VIcon: VIcon["a" /* default */]})

// CONCATENATED MODULE: ./src/camera.ts


var CameraConnectionState;

(function (CameraConnectionState) {
  CameraConnectionState[CameraConnectionState["Connecting"] = 0] = "Connecting";
  CameraConnectionState[CameraConnectionState["Connected"] = 1] = "Connected";
  CameraConnectionState[CameraConnectionState["Disconnected"] = 2] = "Disconnected";
})(CameraConnectionState || (CameraConnectionState = {}));

const UUID = new Date().getTime();
class camera_CameraConnection {
  constructor(deviceIp, onFrame, onConnectionStateChange) {
    this.deviceIp = deviceIp;
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
    }; // If we're running in development mode, find the fake-thermal-camera server

    if (window.location.port === "8080" || window.location.port === "5000") {
      this.deviceIp = DeviceApi.debugPrefix.replace("http://", "");
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
        this.state.heartbeatInterval = window.setInterval(() => {
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

    this.state.socket = new WebSocket(`ws://${this.deviceIp}/ws`);
    this.onConnectionStateChange(CameraConnectionState.Connecting);
    this.state.socket.addEventListener("error", () => {//...
    }); // Connection opened

    this.state.socket.addEventListener("open", this.register.bind(this));
    this.state.socket.addEventListener("close", () => {
      // When we do reconnect, we need to treat it as a new connection
      this.state.socket = null;
      this.onConnectionStateChange(CameraConnectionState.Disconnected);
      clearInterval(this.state.heartbeatInterval);
      this.retryConnection(5);
    });
    this.state.socket.addEventListener("message", async function (event) {
      if (event.data instanceof Blob) {
        // TODO(jon): Only do this if we detect that we're dropping frames?
        _this.state.frames.push(await _this.parseFrame(event.data)); // Process the latest frame, after waiting half a frame delay
        // to see if there are any more frames hot on its heels.


        _this.state.pendingFrame = window.setTimeout(_this.useLatestFrame.bind(_this), 16); // Every time we get a frame, set a new timeout for when we decide that the camera has stalled sending us new frames.
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

      if (this.state.prevFrameNum !== -1 && this.state.prevFrameNum + 1 !== frameInfo.Telemetry.FrameCount) {
        this.state.stats.skippedFramesServer += frameInfo.Telemetry.FrameCount - this.state.prevFrameNum; // Work out an fps counter.
      }

      this.state.prevFrameNum = frameInfo.Telemetry.FrameCount;
      const frameSizeInBytes = frameInfo.Camera.ResX * frameInfo.Camera.ResY * 2; // TODO(jon): Some perf optimisations here.

      const frame = Float32Array.from(new Uint16Array(data.slice(frameStartOffset, frameStartOffset + frameSizeInBytes)));
      return {
        frameInfo,
        frame,
        rotated: false,
        smoothed: new Float32Array(),
        medianed: new Float32Array(),
        threshold: 0,
        min: 0,
        max: 0
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

      if (frameHeader !== null) {
        const timeOn = frameHeader.Telemetry.TimeOn / 1000 / 1000;

        if (timeOn > latestFrameTimeOnMs) {
          if (latestFrame !== null) {
            framesToDrop.push(latestFrame);
          }

          latestFrameTimeOnMs = timeOn;
          latestFrame = frame;
        }
      }
    } // Clear out and log any old frames that need to be dropped


    while (framesToDrop.length !== 0) {
      const dropFrame = framesToDrop.shift();
      const timeOn = dropFrame.frameInfo.Telemetry.TimeOn / 1000 / 1000;
      this.state.stats.skippedFramesClient++;
      this.state.socket.send(JSON.stringify({
        type: "Dropped late frame",
        data: `${latestFrameTimeOnMs - timeOn}ms behind current: frame#${dropFrame.frameInfo.Telemetry.FrameCount}`,
        uuid: UUID
      }));
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
class LocalCameraConnection {
  constructor(onFrame, onConnectionStateChange) {
    this.onFrame = onFrame;
    this.onConnectionStateChange = onConnectionStateChange;
  }

  loadCptvFile(blob) {
    return blob;
  }

}
// EXTERNAL MODULE: ./node_modules/worker-loader/dist/cjs.js!./src/smoothing-worker.ts
var smoothing_worker = __webpack_require__("4847");
var smoothing_worker_default = /*#__PURE__*/__webpack_require__.n(smoothing_worker);

// CONCATENATED MODULE: ./src/worker-fns.ts
const XBorder = 1;
const YBorder = 2;

function euclDistance(x, y, x2, y2) {
  return Math.sqrt(Math.pow(x - x2, 2) + Math.pow(y - y2, 2));
}

function evaluateFeature(feature, satData, width, height, mx, my, scale) {
  const w2 = width + 2;
  let result = 0;

  if (feature.tilted) {
    const tilted = satData[2];

    for (const r of feature.rects) {
      let value = 0;
      const rw = r.x1 - r.x0;
      const rh = r.y1 - r.y0; //gp not sure about these tilt values, i think it's only + 1 for y, because
      //of rotation but not sure why

      const x1 = ~~(mx + XBorder + scale * r.x0);
      const y1 = ~~(my + YBorder - 1 + scale * r.y0);
      const x2 = ~~(mx + XBorder + scale * (r.x0 + rw));
      const y2 = ~~(my + YBorder - 1 + scale * (r.y0 + rw));
      const x3 = ~~(mx + XBorder + scale * (r.x0 - rh));
      const y3 = ~~(my + YBorder - 1 + scale * (r.y0 + rh));
      const x4 = ~~(mx + XBorder + scale * (r.x0 + rw - rh));
      const y4 = ~~(my + YBorder - 1 + scale * (r.y0 + rw + rh));
      value += tilted[x4 + y4 * w2];
      value -= tilted[x3 + y3 * w2];
      value -= tilted[x2 + y2 * w2];
      value += tilted[x1 + y1 * w2];
      result += value * r.weight;
    }
  } else {
    const sat = satData[0];

    for (const r of feature.rects) {
      let value = 0;
      const x0 = ~~(mx + XBorder + r.x0 * scale);
      const y0 = ~~(my + YBorder + r.y0 * scale);
      const x1 = ~~(mx + XBorder + r.x1 * scale);
      const y1 = ~~(my + YBorder + r.y1 * scale);
      value += sat[x0 + y0 * w2];
      value -= sat[x0 + y1 * w2];
      value -= sat[x1 + y0 * w2];
      value += sat[x1 + y1 * w2];
      result += value * r.weight;
    }
  }

  return result;
}

class ROIFeature {
  constructor() {
    this.x0 = 0;
    this.y0 = 0;
    this.x1 = 0;
    this.y1 = 0;
    this.mergeCount = 1;
    this.sensorMissing = 0;
    this.sensorValue = 0;
    this.sensorX = 0;
    this.sensorY = 0;
  }

  wholeValues() {
    const roundedRoi = new ROIFeature();
    roundedRoi.x0 = ~~this.x0;
    roundedRoi.x1 = ~~this.x1;
    roundedRoi.y0 = ~~this.y0;
    roundedRoi.y1 = ~~this.y1;
    return roundedRoi;
  }

  extend(value, maxWidth, maxHeight) {
    const roi = new ROIFeature();
    roi.x0 = Math.max(0, this.x0 - value);
    roi.x1 = Math.min(maxWidth, this.x1 + value);
    roi.y0 = Math.max(0, this.y0 - value);
    roi.y1 = Math.min(maxHeight, this.y1 + value);
    return roi;
  }

  wider(other) {
    return !other || this.width() > other.width();
  }

  higher(other) {
    return !other || this.height() > other.height();
  }

  hasXValues() {
    return this.x0 != -1 && this.x1 != -1;
  }

  hasYValues() {
    return this.y0 != -1 && this.y1 != -1;
  }

  midX() {
    return (this.x0 + this.x1) / 2;
  }

  midY() {
    return (this.y0 + this.y1) / 2;
  }

  width() {
    return this.x1 - this.x0;
  }

  height() {
    return this.y1 - this.y0;
  }

  midDiff(other) {
    return euclDistance(this.midX(), this.midY(), other.midX(), other.midY());
  }

  overlapsROI(other) {
    return this.overlap(other.x0, other.y0, other.x1, other.y1);
  }

  overlap(x0, y0, x1, y1) {
    if (x1 <= this.x0) {
      return false;
    }

    if (y1 <= this.y0) {
      return false;
    }

    if (this.x1 <= x0) {
      return false;
    }

    if (this.y1 <= y0) {
      return false;
    }

    return true;
  }

  contains(x, y) {
    if (x <= this.x0) {
      return false;
    }

    if (y <= this.y0) {
      return false;
    }

    if (this.x1 < x) {
      return false;
    }

    if (this.y1 < y) {
      return false;
    }

    return true;
  } // checks if this roi fits completely inside a sqaure (x0,y0) - (x1,y1)


  isContainedBy(x0, y0, x1, y1) {
    if (this.x0 > x0 && this.x1 < x1 && this.y0 > y0 && this.y1 < y1) {
      return true;
    }

    return false;
  }

  tryMerge(x0, y0, x1, y1, mergeCount = 1) {
    if (!this.overlap(x0, y0, x1, y1)) {
      return false;
    }

    const newMerge = mergeCount + this.mergeCount;
    this.x0 = (this.x0 * this.mergeCount + x0 * mergeCount) / newMerge;
    this.y0 = (this.y0 * this.mergeCount + y0 * mergeCount) / newMerge;
    this.x1 = (this.x1 * this.mergeCount + x1 * mergeCount) / newMerge;
    this.y1 = (this.y1 * this.mergeCount + y1 * mergeCount) / newMerge;
    this.mergeCount = newMerge;
    return true;
  }

}

function evalHaar(satData, mx, my, scale, frameWidth, frameHeight, cascade) {
  const w2 = frameWidth + YBorder;
  const bx0 = ~~(mx + XBorder - scale);
  const by0 = ~~(my + YBorder - scale);
  const bx1 = ~~(mx + XBorder + scale);
  const by1 = ~~(my + YBorder + scale);
  const sat = satData[0];
  const satSq = satData[1];
  const recipArea = 1.0 / ((bx1 - bx0) * (by1 - by0));
  const sumB = recipArea * (sat[bx1 + by1 * w2] - sat[bx0 + by1 * w2] - sat[bx1 + by0 * w2] + sat[bx0 + by0 * w2]);
  const sumBSq = recipArea * (satSq[bx1 + by1 * w2] - satSq[bx0 + by1 * w2] - satSq[bx1 + by0 * w2] + satSq[bx0 + by0 * w2]);
  const determinant = sumBSq - sumB * sumB;

  if (determinant < 1024) {
    return -1;
  }

  const sd = Math.sqrt(determinant);

  for (let i = 0; i < cascade.stages.length; i++) {
    const stage = cascade.stages[i];
    let stageSum = 0;

    for (const weakClassifier of stage.weakClassifiers) {
      const ev = evaluateFeature(weakClassifier.feature, satData, frameWidth, frameHeight, mx, my, scale);

      if (ev * recipArea < weakClassifier.internalNodes[3] * sd) {
        stageSum += weakClassifier.leafValues[0];
      } else {
        stageSum += weakClassifier.leafValues[1];
      }
    }

    if (stageSum < stage.stageThreshold) {
      return i;
    }
  }

  return 1000;
}

function evalAtScale(scale, frameWidth, frameHeight, satData, cascade) {
  // console.log(`work startup time ${new Date().getTime() - s}`);
  const result = [];
  const skipper = Math.max(1, scale * 0.05);

  for (let x = XBorder + scale; x + scale + XBorder < frameWidth; x += skipper) {
    for (let y = YBorder + scale; y + scale + YBorder < frameHeight; y += skipper) {
      const ev = evalHaar(satData, x, y, scale, frameWidth, frameHeight, cascade); // Merging can be done later?

      if (ev > 999) {
        const r = new ROIFeature();
        r.x0 = x - scale;
        r.y0 = y - scale;
        r.x1 = x + scale;
        r.y1 = y + scale;
        let didMerge = false;

        for (let k = 0; k < result.length; k++) {
          if (result[k].tryMerge(r.x0, r.y0, r.x1, r.y1)) {
            didMerge = true;
            break;
          }
        }

        if (!didMerge) {
          result.push(r);
        }
      }
    }
  } // console.log(`work took ${new Date().getTime() - s}`);


  return result;
}
// CONCATENATED MODULE: ./src/processing.ts


const smoothingWorker = new smoothing_worker_default.a();
const processSensorData = async (frame, thermalRef, thermalRefC) => {
  return new Promise(function (resolve, reject) {
    smoothingWorker.onmessage = r => {
      resolve(r.data);
    };

    smoothingWorker.postMessage({
      frame: frame.frame,
      width: frame.frameInfo.Camera.ResX,
      height: frame.frameInfo.Camera.ResY,
      thermalRef: thermalRef || new ROIFeature(),
      thermalRefC,
      rotate: !frame.rotated
    });
  });
};

const rotate90 = (src, dest) => {
  let i = 0;
  const width = 160;
  const height = 120;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      dest[x * height + y] = src[i];
      i++;
    }
  }

  return dest;
};

function rotateFrame(frame) {
  if (!frame.rotated) {
    frame.frameInfo.Camera.ResX = 120;
    frame.frameInfo.Camera.ResY = 160;
    frame.frame = rotate90(frame.frame, new Float32Array(frame.frameInfo.Camera.ResX * frame.frameInfo.Camera.ResY)); // TODO(jon): If thermal ref is always in the same place, maybe mask out the entire bottom of the frame?
    // Just for visualisation purposes?

    frame.rotated = true;
  }
}
// CONCATENATED MODULE: ./src/circle-detection.ts
function accumulatePixel(dest, x, y, width, height) {
  x = ~~x;
  y = ~~y;

  if (x < 0 || y < 0) {
    return;
  }

  if (x >= width || y >= height) {
    return;
  }

  const index = y * width + x;
  dest[index] += 1;
}

function addCircle(dest, cx, cy, radius, width, height) {
  accumulatePixel(dest, cx + radius, cy, width, height);
  accumulatePixel(dest, cx - radius, cy, width, height);
  accumulatePixel(dest, cx, cy + radius, width, height);
  accumulatePixel(dest, cx, cy - radius, width, height);
  let d = 3 - 2 * radius;
  let ix = 1;
  let iy = radius;

  while (ix < iy) {
    //Bresenham
    if (d < 0) {
      d += 4 * ix + 6;
    } else {
      iy = iy - 1;
      d += 4 * (ix - iy) + 10;
    }

    accumulatePixel(dest, cx + ix, cy + iy, width, height);
    accumulatePixel(dest, cx - ix, cy + iy, width, height);
    accumulatePixel(dest, cx + ix, cy - iy, width, height);
    accumulatePixel(dest, cx - ix, cy - iy, width, height);
    accumulatePixel(dest, cx + iy, cy + ix, width, height);
    accumulatePixel(dest, cx - iy, cy + ix, width, height);
    accumulatePixel(dest, cx + iy, cy - ix, width, height);
    accumulatePixel(dest, cx - iy, cy - ix, width, height);
    ix += 1;
  }
}

function edgeDetect(source, frameWidth, frameHeight) {
  const width = frameWidth;
  const height = frameHeight;
  const dest = new Float32Array(width * height);

  for (let y = 2; y < height - 2; y++) {
    for (let x = 2; x < width - 2; x++) {
      const index = y * width + x;
      const value = source[index] * 4 - source[index - 1] - source[index + 1] - source[index + width] - source[index - width];
      dest[index] = Math.max(value - 40, 0);
    }
  }

  return dest;
}
function circleDetectRadius(source, dest, radius, width, height, x0, y0, x1, y1) {
  radius = Math.max(radius, 0.00001);

  for (let i = 0; i < width * height; i++) {
    dest[i] = 0;
  }

  x0 = Math.max(x0, 2);
  y0 = Math.max(y0, 2);
  x1 = Math.min(x1, width - 2);
  y1 = Math.min(y1, height - 2);

  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const index = y * width + x;
      const value = source[index];

      if (value < 1) {
        continue;
      }

      addCircle(dest, x, y, radius, width, height);
    }
  }

  let result = 0;
  let rx = 0;
  let ry = 0;

  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const index = y * width + x;

      if (result < dest[index]) {
        result = dest[index];
        rx = x;
        ry = y;
      }
    }
  }

  return [result / (2 + radius), rx + 1, ry + 1];
}
function circleDetect(source, frameWidth, frameHeight) {
  const dest = new Float32Array(frameWidth * frameHeight);
  let radius = 3.0;
  let bestRadius = -1;
  let bestValue = 2;
  let bestX = 0;
  let bestY = 0; // TODO(jon): We should be able to know what the max radius we're looking for is.

  while (radius < 8) {
    let value = 0;
    let cx = 0;
    let cy = 0;
    [value, cx, cy] = circleDetectRadius(source, dest, radius, frameWidth, frameHeight, 2, 2, frameWidth - 2, frameHeight - 2);

    if (bestValue < value) {
      bestValue = value;
      bestRadius = radius;
      bestX = cx;
      bestY = cy;
    }

    radius = ~~(radius * 1.03 + 1);
  }

  return [bestRadius, bestX, bestY];
}

function pointIsInCircle(px, py, cx, cy, r) {
  const dx = Math.abs(px - cx);
  const dy = Math.abs(py - cy);
  return Math.sqrt(dx * dx + dy * dy) < r;
}

function extractSensorValueForCircle(r, source, width) {
  const x0 = Math.floor(r.x0);
  const y0 = Math.floor(r.y0);
  const x1 = Math.ceil(r.x1);
  const y1 = Math.ceil(r.y1);
  const values = [];
  const centerX = r.x0 + (r.x1 - r.x0) / 2;
  const centerY = r.y0 + (r.y1 - r.y0) / 2;
  const radius = (x1 - x0) / 2;
  const coords = [];

  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      if (pointIsInCircle(x + 0.5, y + 0.5, centerX, centerY, radius)) {
        const index = y * width + x;
        coords.push({
          x,
          y
        });
        values.push(source[index]);
      }
    }
  }

  let sum = 0;

  for (let i = 0; i < values.length; i++) {
    sum += values[i];
  }

  values.sort();
  return {
    coords,
    mean: sum / values.length,
    median: values[Math.floor(values.length / 2)],
    min: values[0],
    max: values[values.length - 1],
    count: values.length
  };
}
// CONCATENATED MODULE: ./src/haar-cascade.ts

const PERF_TEST = false;
let haar_cascade_performance = {
  mark: arg => {
    return;
  },
  measure: (arg0, arg1, arg2) => {
    return;
  },
  now: () => {
    return;
  }
};

if (PERF_TEST) {
  haar_cascade_performance = window.performance;
}
/*
// NOTE(jon): We've packed the result of this conversion up so we don't need to load and convert the xml file
//  each time

function convertCascadeXML(source: Document): HaarCascade {
  const result: HaarCascade = {
    features: [],
    stages: []
  };
  const stages = source.getElementsByTagName("stages").item(0);
  const features = source.getElementsByTagName("features").item(0);

  if (stages == null || features == null) {
    throw new Error("Invalid HaarCascade XML Data");
  }
  const widthElement = source.getElementsByTagName("width")[0];
  const heightElement = source.getElementsByTagName("height")[0];
  const width = widthElement ? Number(widthElement.textContent) : 10;
  const height = heightElement ? Number(heightElement.textContent) : 10;

  for (
    let featureIndex = 0;
    featureIndex < features.childNodes.length;
    featureIndex++
  ) {
    const currentFeature = features.childNodes[featureIndex] as HTMLElement;
    if (currentFeature.childElementCount === undefined) {
      continue;
    }

    const feature: HaarFeature = {
      rects: [],
      tilted: false
    };
    if (currentFeature.getElementsByTagName("tilted").length > 0) {
      const tiltedNode = currentFeature.getElementsByTagName("tilted")[0];
      feature.tilted = tiltedNode.textContent == "1";
    }

    const rectsNode = currentFeature.getElementsByTagName("rects")[0];
    for (let i = 0; i < rectsNode.childNodes.length; i++) {
      const cc = rectsNode.childNodes[i];
      if (cc.textContent == null) {
        continue;
      }
      const qq = cc.textContent.trim().split(" ");
      if (qq.length != 5) {
        continue;
      }
      const halfWidth = width / 2;
      const halfHeight = height / 2;
      const x0 = Number((Number(qq[0]) / halfWidth - 1.0).toFixed(2));
      const x1 = Number((x0 + Number(qq[2]) / halfWidth).toFixed(2));
      const y0 = Number((Number(qq[1]) / halfHeight - 1.0).toFixed(2));
      const y1 = Number((y0 + Number(qq[3]) / halfHeight).toFixed(2));
      feature.rects.push({
        x0,
        x1,
        y0,
        y1,
        weight: Number(qq[4])
      });
    }
    result.features.push(feature);
  }

  for (
    let stageIndex = 0;
    stageIndex < stages.childNodes.length;
    stageIndex++
  ) {
    const currentStage = stages.childNodes[stageIndex] as HTMLElement;
    if (currentStage.childElementCount === undefined) {
      continue;
    }
    const stage: HaarStage = {
      stageThreshold: 0,
      weakClassifiers: []
    };

    const stageThresholdNode = currentStage.getElementsByTagName(
      "stageThreshold"
    )[0];
    stage.stageThreshold = Number(stageThresholdNode.textContent);

    const weakClassifiersNode = currentStage.getElementsByTagName(
      "weakClassifiers"
    )[0];
    const internalNodesNode = weakClassifiersNode.getElementsByTagName(
      "internalNodes"
    );
    const leafValuesNode = weakClassifiersNode.getElementsByTagName(
      "leafValues"
    );
    for (let i = 0; i < internalNodesNode.length; i++) {
      const txc1 = internalNodesNode[i].textContent;
      const txc2 = leafValuesNode[i].textContent;
      if (txc1 == null) {
        continue;
      }
      if (txc2 == null) {
        continue;
      }

      const internalNodes = txc1
        .trim()
        .split(" ")
        .map(Number);
      const leafValues = txc2
        .trim()
        .split(" ")
        .map(Number);
      stage.weakClassifiers.push({
        internalNodes,
        leafValues,
        feature: internalNodes[2]
      });
    }
    result.stages.push(stage);
  }
  return result;
}

export async function loadFaceRecognitionModel(
  source: string
): Promise<HaarCascade> {
  const modelResponse = await fetch(source);
  const xmlDoc = new DOMParser().parseFromString(
    await modelResponse.text(),
    "text/xml"
  );
  return convertCascadeXML(xmlDoc);
}
*/


function scanHaarSerial(cascade, satData, frameWidth, frameHeight) {
  //https://stackoverflow.com/questions/41887868/haar-cascade-for-face-detection-xml-file-code-explanation-opencv
  //https://github.com/opencv/opencv/blob/master/modules/objdetect/src/cascadedetect.hpp
  const result = [];
  const scales = [];
  let scale = 10;

  while (scale < frameHeight / 2) {
    scale *= 1.25;
    scales.push(scale);
  }

  haar_cascade_performance.mark("ev start"); // We want to try and divide this into workers, roughly the same as the number of hardware threads available:
  // 16,882 passes each

  const results = [];

  for (const _scale of scales) {
    results.push(evalAtScale(_scale, frameWidth, frameHeight, satData, cascade));
  }

  const allResults = results.reduce((acc, curr) => {
    acc.push(...curr);
    return acc;
  }, []); // Merge all boxes.  I *think* this has the same result as doing this work in serial.

  for (const r of allResults) {
    let didMerge = false;

    for (const mergedResult of result) {
      // seems we get a lot of padding lets try find the smallest box
      // could cause problems if a box contains 2 smaller independent boxes
      if (mergedResult.isContainedBy(r.x0, r.y0, r.x1, r.y1)) {
        didMerge = true;
        break;
      }

      if (mergedResult.tryMerge(r.x0, r.y0, r.x1, r.y1, r.mergeCount)) {
        didMerge = true;
        break;
      }
    }

    if (!didMerge) {
      const roi = new ROIFeature();
      roi.x0 = r.x0;
      roi.y0 = r.y0;
      roi.x1 = r.x1;
      roi.y1 = r.y1;
      roi.mergeCount = r.mergeCount;
      result.push(roi);
    }
  } // Now try to merge the results of each scale.


  haar_cascade_performance.mark("ev end");
  haar_cascade_performance.measure(`evalHaar: ${scales.length}`, "ev start", "ev end");
  return result;
}
function buildSAT(source, width, height, thermalReference) {
  if (window) {
    if (window.SharedArrayBuffer === undefined) {
      // Having the array buffers able to be shared across workers should be faster
      // where available.
      window.SharedArrayBuffer = window.ArrayBuffer;
    }
  }

  let thermalRefTemp = 0;

  if (thermalReference) {
    thermalReference = thermalReference.extend(5, height, width); // get the values on edge and use them to "black out" the thermal ref

    let count = 0;

    for (let y = thermalReference.y0; y <= ~~thermalReference.y1; y++) {
      thermalRefTemp += source[y * width + ~~thermalReference.x0];
      thermalRefTemp += source[y * width + ~~thermalReference.x1];
      count += 2;
    }

    if (count > 0) {
      thermalRefTemp = thermalRefTemp / count;
    }
  }

  const sizeOfFloat = 4;
  const dest = new Float32Array(new SharedArrayBuffer((width + 2) * (height + 3) * sizeOfFloat));
  const destSq = new Float32Array(new SharedArrayBuffer((width + 2) * (height + 3) * sizeOfFloat));
  const destTilt = new Float32Array(new SharedArrayBuffer((width + 2) * (height + 3) * sizeOfFloat));
  const w2 = width + 2;
  let vMin = source[0];
  let vMax = source[0];

  for (let i = 0; i < width * height; i++) {
    vMin = Math.min(vMin, source[i]);
    vMax = Math.max(vMax, source[i]);
  } // repeat top row twice


  for (let y = -2; y <= height; y++) {
    let runningSum = 0;
    let runningSumSq = 0;

    for (let x = -1; x <= width; x++) {
      const indexD = (y + 2) * w2 + x + 1;
      const sourceY = Math.min(Math.max(y, 0), height - 1);
      const sourceX = Math.min(Math.max(x, 0), width - 1);
      const indexS = sourceY * width + sourceX;
      let value;

      if (thermalReference && thermalReference.contains(sourceX, sourceY)) {
        value = thermalRefTemp - vMin; //set to min
      } else {
        value = source[indexS] - vMin;
      }

      runningSum += value;
      runningSumSq += value * value;
      const prevValue = y > -2 ? dest[indexD - w2] : 0;
      const prevSquared = y > -2 ? destSq[indexD - w2] : 0;
      dest[indexD] = prevValue + runningSum;
      destSq[indexD] = prevSquared + runningSumSq;
      let tiltValue = value;
      let valueAbove = 0;

      if (y > -2) {
        //gp missing something here about the rotated titl values feels
        //like this should +=
        tiltValue -= y >= 0 ? destTilt[indexD - w2 - w2] : 0;
        tiltValue += x > -1 ? destTilt[indexD - w2 - 1] : 0;
        tiltValue += destTilt[indexD - w2 + 1];

        if (thermalReference && thermalReference.contains(sourceX, Math.max(sourceY - 1, 0))) {
          valueAbove = value;
        } else {
          valueAbove = y > 0 ? source[indexS - width] : source[indexS];
          valueAbove = valueAbove - vMin;
        }
      }

      tiltValue += valueAbove;
      destTilt[indexD] = tiltValue;
    }
  }

  return [dest, destSq, destTilt];
}
// CONCATENATED MODULE: ./src/face.ts
 //import { threshold, crop, getContourData } from "./opencv-filters";


var Gradient;

(function (Gradient) {
  Gradient[Gradient["Decreasing"] = -1] = "Decreasing";
  Gradient[Gradient["Neutral"] = 0] = "Neutral";
  Gradient[Gradient["Increasing"] = 1] = "Increasing";
})(Gradient || (Gradient = {}));

const MaxFaceAreaPercent = 0.9; //the oval has to cover MinFaceOvalCoverage percent of detected edges to be considered a face

const MinFaceOvalCoverage = 80; //once an oval differs by CoverageErrorDiff percent from the best coverage
//it is considered a mismatch

const CoverageErrorDiff = 3;
const DEBUG = false;
const FaceTrackingMaxDelta = 10;
const ForeheadPercent = 0.28;
const ForeheadPadding = 2;
const MaxErrors = 2;
const MaxWidthDeviationPercent = 1.2; // when tracking faces, once we have a std dev less than 3, we are tracking

const MaxDeviation = 3; // New Faces mid point cant be greater than this from previous

const MaxMidDeviation = 10;
const maxFrameSkip = 6;
let FaceID = 1; //checks that the shapes dont take more than MaxFaceAreaPercent of the area

function validShapes(shapes, roi) {
  const roiArea = roi.width() * roi.height(); // If we have lines abutting the top of the haar shape, we definitely don't have a face.

  for (const shape of shapes) {
    let area = 0;
    let numAbutting = 0;
    let numAbuttingTop = 0;

    for (const feature of Object.values(shape)) {
      if (Math.abs(feature.x1 - roi.x1) < 2 || Math.abs(feature.x0 - roi.x0) < 2) {
        if (Math.abs(feature.y0 - roi.y0) < 2) {
          numAbuttingTop++;
        }

        numAbutting++;
      }

      area += feature.width();
    }

    if (numAbuttingTop) {
      if (DEBUG) {
        console.warn("top abutting shape");
      }

      return false;
    }

    if (numAbutting > roi.height() * 0.75) {
      if (DEBUG) {
        console.log("probably got ourselves a rectangle");
      }

      return false;
    } // TODO(jon): Also check that all of the feature edges aren't lined up against the edge of the box...


    if (area / roiArea > MaxFaceAreaPercent) {
      if (DEBUG) {
        console.log("face edges exceed maximum area percent", area / roiArea);
      }

      return false;
    }
  }

  return true;
}

function backgroundTemp(source, roi, offsetX, offsetY, sourceWidth, max) {
  let backSum = 0;
  let count = 0;
  let minTemp = -1;

  for (let y = 0; y < roi.rows; y++) {
    for (let x = 0; x < roi.cols; x++) {
      if (roi.data[y * roi.rows + x] == 0) {
        const index = y + offsetY * sourceWidth + x + offsetX;
        const val = source[index];

        if (val < max) {
          backSum += val;
          count += 1;

          if (minTemp == -1 || val < minTemp) {
            minTemp = val;
          }
        }
      }
    }
  }

  if (count == 0) {
    return 0;
  }

  const avg = backSum / count;
  return (avg + minTemp) / 2.0;
} //for each independent edge detected, take array of edge coordinates
//and get a set of horizontal lines


function shapeData(contours, offsetX, offsetY) {
  const shapes = [];
  let line;

  for (let i = 0; i < contours.size(); ++i) {
    // If there are two lines on the same y axis, remove the shorter one?
    const faceFeatures = {};
    const cont = contours.get(i); // NOTE: cont.rows / 4 is how many scanlines the feature takes.
    // We can discard small features.

    for (let y = 0; y < cont.rows; y++) {
      const row = cont.row(y);
      let [xP, yP] = row.data32S;
      xP += offsetX;
      yP += offsetY;

      if (yP in faceFeatures) {
        line = faceFeatures[yP];

        if (line.x1 == -1) {
          if (line.x0 < xP) {
            line.x1 = xP;
          } else {
            line.x1 = line.x0;
            line.x0 = xP;
          }
        } else if (xP < line.x0) {
          line.x0 = xP;
        } else {
          line.x1 = xP;
        }
      } else {
        const roi = new ROIFeature();
        roi.y0 = yP;
        roi.x0 = xP;
        roi.y1 = yP;
        roi.x1 = -1;
        faceFeatures[yP] = roi;
      }
    }

    shapes.push(faceFeatures);
  }

  let bestArea = 0;
  let bestShape;

  for (const shape of shapes) {
    const area = Object.values(shape).reduce((acc, item) => {
      acc += item.width();
      return acc;
    }, 0);

    if (area > bestArea) {
      bestArea = area;
      bestShape = shape;
    }
  }

  return bestShape ? [bestShape] : [];
}

function getSortedKeys(obj) {
  const keys = Object.keys(obj);
  return keys.sort(function (a, b) {
    return Number(a) - Number(b);
  }).map(x => Number(x));
}

class Hotspot {
  constructor() {
    this.sensorValue = 0;
    this.sensorX = 0;
    this.sensorY = 0;
  }

}

class Window {
  constructor(size) {
    this.size = size;
    this.values = [];
    this.savedDeviation = -1;
    this.savedAverage = -1;
  }

  reset() {
    this.savedDeviation = -1;
    this.savedAverage = -1;
  }

  add(value) {
    this.reset();

    if (this.values.length < this.size) {
      this.values.push(value);
    } else {
      this.values.shift();
      this.values.push(value);
    }
  }

  length() {
    return this.values.length;
  }

  deviation() {
    if (this.savedAverage == -1) {
      const mean = this.average();
      this.savedDeviation = Math.sqrt(this.values.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / this.values.length);
    }

    return this.savedDeviation;
  }

  average() {
    if (this.savedAverage == -1) {
      this.savedAverage = this.values.reduce((a, b) => a + b) / this.values.length;
    }

    return this.savedAverage;
  }

}

class TempStats {
  constructor() {
    this.backgroundAvg = 0;
    this.foreheadHotspot = null;
    this.hotspot = new Hotspot();
    this.minTemp = 0;
    this.maxTemp = 0;
    this.avgTemp = 0;
    this.count = 0;
  }

  add(value, x, y) {
    if (this.count == 0) {
      this.minTemp = value;
      this.maxTemp = value;
      this.hotspot.sensorValue = value;
      this.hotspot.sensorX = x;
      this.hotspot.sensorY = y;
    } else {
      this.minTemp = Math.min(value, this.minTemp);
      this.maxTemp = Math.max(value, this.maxTemp);

      if (value > this.hotspot.sensorValue) {
        this.hotspot.sensorValue = value;
        this.hotspot.sensorX = x;
        this.hotspot.sensorY = y;
      }
    }

    this.avgTemp += value;
    this.count += 1;
  }

} // measure the change in values over the last 3 values

class Delta {
  constructor() {
    this.deltas = new Window(3);
    this.states = new Window(3);
    this.previous = 0;
  }

  add(value) {
    this.deltas.add(value - this.previous);
    this.previous = value;

    if (this.increasing()) {
      this.states.add(Gradient.Increasing);
    } else if (this.decreasing()) {
      this.states.add(Gradient.Decreasing);
    } else {
      this.states.add(Gradient.Neutral);
    }
  }

  decreasingState() {
    return this.state() == Gradient.Decreasing && this.previousState() <= Gradient.Neutral || this.state() == Gradient.Neutral && this.previousState() == Gradient.Decreasing;
  }

  increasingState() {
    return this.state() == Gradient.Increasing && this.previousState() >= Gradient.Neutral || this.state() == Gradient.Neutral && this.previousState() == Gradient.Increasing;
  }

  previousState() {
    if (this.states.values.length > 1) {
      return this.states.values[this.states.values.length - 2];
    }

    return 0;
  }

  state() {
    return this.states.values[this.states.values.length - 1];
  } // allow for 1 of the last 2 values to not be increasing i.e. noise


  increasing() {
    if (this.deltas.values.length < 3) {
      return false;
    }

    return this.deltas.values[2] > 0 && (this.deltas.values[1] > 0 || this.deltas.values[0] > 0);
  } // allow for 1 of the last 2 values to not be decreasing i.e. noise


  decreasing() {
    if (this.deltas.values.length < 3) {
      return false;
    }

    return this.deltas.values[2] < 0 && (this.deltas.values[1] < 0 || this.deltas.values[0] < 0);
  }

}

class face_Tracking {
  constructor() {
    this.area = 0;
    this.maxY = -1;
    this.minY = -1;
    this.facePosition = FeatureState.None;
    this.widthDelta = new Delta();
    this.maxWidth = 0;
    this.medianMid = null;
    this.features = [];
    this.startX = 0;
    this.mismatch = 0;
    this.width = 0;
    this.stable = false;
    this.widthWindow = new Window(3);
    this.startWindow = new Window(3);
    this.widthDeviation = 0;
    this.startDeviation = 0;
    this.oval = new ROIFeature();
    this.oval.y0 = -1;
    this.ovalCalcStart = -1;
    this.ovalMatch = 0;
    this.tempStats = new TempStats();
  }

  yLine() {
    const yFace = featureLine(-1, this.minY);
    yFace.y1 = this.maxY;
    return yFace;
  }

  addFeature(feature, source, frameWidth) {
    if (this.minY == -1) {
      this.minY = feature.y0;
      this.oval.y0 = feature.y0;
    }

    this.maxY = feature.y1;
    this.features.push(feature);
    this.widthWindow.add(feature.width());
    this.startWindow.add(feature.x0);
    this.widthDelta.add(feature.width());

    if (this.features.length > 3 && this.widthWindow.deviation() < MaxDeviation && this.startWindow.deviation() < MaxDeviation) {
      if (this.ovalCalcStart == -1) {
        this.ovalCalcStart = feature.y0;
      }

      this.stable = true;
      this.widthDeviation = this.widthWindow.deviation();
      this.startDeviation = this.startWindow.deviation();
      this.startX = feature.x0;
      this.width = feature.width();
      this.maxWidth = Math.max(feature.width(), this.maxWidth);
    }

    if (this.stable) {
      this.area += feature.width();
    }

    if (this.facePosition == FeatureState.Top && this.widthDelta.decreasingState()) {
      this.facePosition = FeatureState.Bottom;
    } else if (this.facePosition == FeatureState.None && this.widthDelta.increasingState()) {
      this.facePosition = FeatureState.Top;
    }

    if ( // once face stops increasing lets set a mid point
    this.medianMid == null && this.widthDelta.decreasingState() || this.widthDelta.state() == Gradient.Neutral && this.count() > 8) {
      if (!this.medianMid || feature.width() > this.medianMid.width()) {
        this.medianMid = feature;
        this.oval.x0 = this.medianMid.x0;
        this.oval.x1 = this.medianMid.x1;
      }
    }

    const y = ~~feature.y0 * frameWidth;

    for (let x = ~~feature.x0; x < feature.x1; x++) {
      this.tempStats.add(source[y + x], x, feature.y0);
    }
  } // grow an oval inside the face until it doesn't fit


  matchOval(y) {
    if (this.ovalCalcStart == -1) {
      return true;
    }

    this.oval.y1 = y;
    const h = this.oval.midX();
    const k = this.oval.midY();
    const a = Math.pow(this.oval.width() / 2.0, 2);
    const b = Math.pow(this.oval.height() / 2.0, 2);
    let percentCover = 0;

    for (let i = this.ovalCalcStart - this.minY; i < this.features.length; i++) {
      const r = this.features[i]; //x location of oval edge at at r.y0

      const xDiff = Math.sqrt(a * (1 - Math.pow(r.y0 - k, 2) / b));
      const x0 = h - xDiff;
      const x1 = h + xDiff;
      const areaCovered = Math.min(x1, r.x1) - Math.max(x0, r.x0);

      if (areaCovered > 0) {
        percentCover += areaCovered;
      }
    }

    const cover = ~~(100 * percentCover / this.area);
    this.ovalMatch = Math.max(cover, this.ovalMatch);

    if (this.ovalMatch - cover > CoverageErrorDiff) {
      // once we decrease we have found our optimum
      return false;
    }

    return true;
  } // compares this feature to what we have learnt so far, and decides if it fits within a normal deviation of
  // mid point, maximum width, expected width, expected start x, doesn't increase in width after decreasing (i.e shoulders)


  matched(feature) {
    if (this.medianMid) {
      if (!this.matchOval(feature.y1) && this.ovalMatch > 90) {
        this.mismatch++;

        if (DEBUG) {
          console.log("oval coverage worsened best cover - ", this.ovalMatch);
        }

        return false;
      }
    }

    return true;
  }

  lastFeature() {
    return this.features[this.features.length - 1];
  }

  count() {
    return this.features.length;
  }

}

class face_Face {
  constructor(haarFace, frameTime) {
    this.haarFace = haarFace;
    this.frameTime = frameTime;
    this.roi = null;
    this.forehead = null;
    this.id = 0;
    this.framesMissing = 0;
    this.haarAge = 1;
    this.haarLastSeen = 0;
    this.heatStats = new TempStats();
    this.numFrames = 0;
    this.widthWindow = new Window(3);
    this.heightWindow = new Window(3);
    this.faceWidth = 0;
    this.faceHeight = 0;
    this.frontOnRatio = 0;
    this.foreheadX = 0;
    this.foreheadY = 0; //debugging

    this.xFeatures = [];
    this.assignID();
  }

  hasMovedOrChangedInSize(oldFace) {
    const movement = this.roi.midDiff(oldFace);
    const oldArea = oldFace.width() * oldFace.height();
    const newArea = this.width() * this.height();
    const areaChange = Math.abs(oldArea - newArea);
    console.log(movement, areaChange);
    return movement > 3 || areaChange > 40;
  }

  get isFrontOn() {
    return this.frontOnRatio < 0.02;
  }

  get frontOnPercentage() {
    return (100 * (1 - this.frontOnRatio)).toFixed(2);
  } // TODO(jon): Inspect the logic around updateHaar and haarActive.
  //  Seems like haarLastSeen is maybe redundant


  updateHaar(haar) {
    //this.haarFace = haar;
    this.haarFace.x0 = haar.x0;
    this.haarFace.x1 = haar.x1; // if (
    //   Math.abs(this.haarFace.y0 - haar.y0) < 5 &&
    //   Math.abs(this.haarFace.y0 - haar.y0) < 5
    // ) {
    //   this.haarFace.y0 = haar.y0;
    //   this.haarFace.y1 = haar.y1;
    // }
    // Don't allow too much jittering in y

    if (this.haarFace.y0 - haar.y0 === Math.abs(this.haarFace.y0 - haar.y0)) {
      // moving down
      this.haarFace.y0 -= Math.min(Math.abs(this.haarFace.y0 - haar.y0), 2);
      this.haarFace.y1 -= Math.min(Math.abs(this.haarFace.y1 - haar.y1), 2);
    } else {
      this.haarFace.y0 += Math.min(Math.abs(this.haarFace.y0 - haar.y0), 2);
      this.haarFace.y1 += Math.min(Math.abs(this.haarFace.y1 - haar.y1), 2);
    }

    this.haarAge++;
    this.haarLastSeen = this.numFrames + 1;
  }

  haarActive() {
    return this.haarAge === 1 || this.haarLastSeen == this.numFrames;
  }

  tracked() {
    return this.roi != null && this.forehead != null;
  }

  assignID() {
    this.id = FaceID;
    FaceID++;
  }

  height() {
    if (this.roi) {
      return this.roi.height();
    }

    return 0;
  }

  width() {
    if (this.roi) {
      return this.roi.width();
    }

    return 0;
  }

  active() {
    return this.framesMissing < maxFrameSkip;
  }

  clear() {
    this.forehead = null;
    this.roi = null;
    this.heatStats.foreheadHotspot = null;
    this.framesMissing++;
  }

  update(forehead, roi) {
    this.forehead = forehead;
    this.roi = roi;
    this.framesMissing = 0; // give a rolling average of face width

    this.widthWindow.add(roi.width());
    this.heightWindow.add(roi.height());

    if (this.widthWindow.length() >= 3 && this.widthWindow.deviation() < MaxDeviation && this.heightWindow.deviation() < MaxDeviation) {
      this.faceWidth = this.widthWindow.average();
      this.faceHeight = this.heightWindow.average();
    }
  }

  matchesPrevious(oval) {
    if (!this.roi) {
      return true;
    }

    if (this.roi.midDiff(oval) > MaxMidDeviation) {
      return false;
    }

    if (this.faceWidth != 0 && this.faceHeight != 0 && (oval.width() > this.faceWidth * MaxWidthDeviationPercent || oval.height() > this.faceHeight * MaxWidthDeviationPercent)) {
      return false;
    }

    return true;
  }

  findFace(shapes, source, frameWidth) {
    let bestScore = -1;
    let bestOval = null;
    let heatStats = null;

    for (const shape of shapes) {
      const keys = getSortedKeys(shape);
      const xTracking = new face_Tracking();
      let longestLine = null;

      for (const key of keys) {
        if (xTracking.mismatch >= MaxErrors) {
          break;
        }

        const faceX = shape[key];
        const matched = xTracking.matched(faceX);

        if (!matched) {
          continue;
        }

        xTracking.addFeature(faceX, source, frameWidth);

        if (faceX.wider(longestLine)) {
          longestLine = faceX;
        }
      } // TODO(jon): Improve where we are getting the oval


      if (xTracking.ovalMatch > bestScore && xTracking.ovalMatch > MinFaceOvalCoverage && xTracking.features.length >= 4) {
        const oval = xTracking.oval;

        if (!this.matchesPrevious(oval)) {
          if (DEBUG) {
            console.log("New oval differs too much in width/height/midpoint");
          } // NOTE(jon): Don't let the face get to long.  Could also have a max face width/height ratio that we cap face length at?


          if (this.roi) {
            if (Math.abs(oval.midY() - this.roi.midY()) > this.roi.height() * 0.1) {
              if (DEBUG) {
                console.log("height changed to much, using last height");
              }

              oval.y1 = this.roi.y1;
            }

            if (Math.abs(oval.midX() - this.roi.midX()) > this.roi.width() * 0.8) {
              if (DEBUG) {
                console.log("Too much movement on X, aborting tracking");
              }

              return [null, null];
            }
          }
        }

        bestOval = oval;
        bestScore = xTracking.ovalMatch;
        heatStats = xTracking.tempStats;
      }
    }

    return [bestOval, heatStats];
  }

  trackFace(source, values, thermalRef, frameWidth, frameHeight) {
    this.xFeatures = [];
    this.numFrames += 1;

    if (!this.tracked()) {
      this.framesMissing++;
    }

    this.detectForehead(this.haarFace, source, values, thermalRef, frameWidth, frameHeight);
  }

  setForeheadHotspot(source, frameWidth) {
    const r = this.forehead;

    if (!r) {
      this.heatStats.foreheadHotspot = null;
      return;
    }

    const hotspot = new Hotspot();
    hotspot.sensorValue = 0;

    for (let y = ~~r.y0; y < ~~r.y1; y++) {
      for (let x = ~~r.x0; x < ~~r.x1; x++) {
        const index = y * frameWidth + x;
        const current = source[index];

        if (hotspot.sensorValue < current) {
          hotspot.sensorValue = current;
          hotspot.sensorX = x;
          hotspot.sensorY = y;
        }
      }
    }

    this.heatStats.foreheadHotspot = hotspot;
  } // scan the haar detected rectangle along y axis, to find range of x values,
  // then along the x axis to find the range of y values
  // choose the biggest x and y value to define xRad and yRad of the head


  detectForehead(roi, source, values, thermalRef, frameWidth, frameHeight) {
    roi = roi.wholeValues(); // let roiCrop = crop(source, frameHeight, frameWidth, roi);
    // roiCrop = threshold(roiCrop, roi, thermalRef);
    // const contours = (getContourData(roiCrop) as unknown) as Contours;

    const shapes = []; //shapeData(contours, roi.x0, roi.y0);
    //contours.delete();
    //TODO(jon): What if some shapes are valid and others aren't?
    // Why do we need this?  Seems to mostly filter out synthetic cases where areas are square
    // after a face disappears from one frame to the next?  Can this fail on square heads?

    const valid = validShapes(shapes, roi);

    if (!valid) {
      this.clear();
      return;
    }

    const [oval, heatStats] = this.findFace(shapes, source, frameWidth);
    this.xFeatures = [];

    for (const shape of shapes) {
      this.xFeatures.push(...Object.values(shape));
    } // if (oval && heatStats) {
    //   // NOTE(jon): We never use backgroundAvg for anything, it's just for debug purposes?
    //   heatStats.backgroundAvg = backgroundTemp(
    //     source,
    //     roiCrop,
    //     roi.x0,
    //     roi.y0,
    //     frameWidth,
    //     heatStats.minTemp
    //   );
    // }
    // roiCrop.delete();


    if (!oval) {
      if (DEBUG) {
        console.log("lost oval, maybe we should try using the one from the last frame?");
      }

      this.clear();
      return;
    } // Recenter oval onto xFeatures center of mass.


    let centerX = 0;
    let num = 0; // TODO(jon): Should we clamp the x0,x1 values of the features to the bounds of the oval?

    const featuresInOval = this.xFeatures.filter(feature => feature.y0 >= oval.y0 && feature.y1 <= oval.y1);

    for (const feature of featuresInOval) {
      if (feature.y0 >= oval.y0 && feature.y1 <= oval.y1) {
        centerX += feature.midX();
        num++;
      }
    }

    centerX = centerX / num;
    const halfWidth = oval.width() / 2;
    oval.x0 = centerX - halfWidth;
    oval.x1 = centerX + halfWidth; // Now guess if the face is front-on, based on the symmetry of the xFeatures around the centerX.
    // Evaluate the features up until the point where they flare out and don't go back in.
    // TODO(jon): Maybe just consider the symmetry *below* the forehead box.

    let leftSum = 0;
    let rightSum = 0;

    for (const feature of featuresInOval) {
      if (feature.x0 < centerX) {
        leftSum += Math.min(feature.x1, centerX) - feature.x0;
      }

      if (feature.x1 >= centerX) {
        rightSum += feature.x1 - Math.max(feature.x0, centerX);
      }
    } // Ratio or percent difference between left and right weights can indicate how front-on the face is.


    this.frontOnRatio = Math.abs(1.0 - leftSum / rightSum); // If we have a bunch of features abutting the edge on one side of the bottom, but not the other, we're also
    // probably not front-on.
    // Take the last six scanlines or so.  Might need to scale this based on the size of the face box.

    let unevenEdges = 0;

    for (const feature of featuresInOval.filter(feature => Math.abs(feature.y1 - oval.y1) <= 10)) {
      const dX0 = Math.abs(Math.max(feature.x0, oval.x0) - oval.x0);
      const dX1 = Math.abs(Math.min(feature.x1, oval.x1) - oval.x1);

      if (dX0 < 2 && dX1 >= 2 || dX1 < 2 && dX0 >= 2) {
        unevenEdges++;
      }
    }

    if (unevenEdges > 7) {
      this.frontOnRatio = 1;

      if (DEBUG) {
        console.log("uneven edges", unevenEdges);
      }
    }

    const detectedROI = oval;
    const forehead = new ROIFeature();
    forehead.y0 = detectedROI.y0 - ForeheadPadding;
    forehead.y1 = forehead.y0 + detectedROI.height() * ForeheadPercent + ForeheadPadding;
    forehead.x0 = detectedROI.x0 - ForeheadPadding;
    forehead.x1 = detectedROI.x1 + ForeheadPadding;
    this.update(forehead, detectedROI); // Get the features in the forehead box.
    // Weight them to either side of the center of the roi.

    const featuresInForehead = this.xFeatures.filter(feature => feature.y1 < forehead.y1);
    centerX = 0;
    num = 0;

    for (const feature of featuresInForehead) {
      centerX += feature.midX();
      num++;
    }

    this.foreheadX = centerX / num;
    this.foreheadY = forehead.y1 - 2; //console.log("foreheadX", centerX);

    if (heatStats) {
      // NOTE(jon): heatStats are just for debugging purposes, not functional.
      this.heatStats = heatStats;

      if (this.heatStats.count > 0) {
        this.heatStats.avgTemp /= this.heatStats.count;
      }
    } //this.setForeheadHotspot(source, frameWidth);


    this.heatStats.foreheadHotspot = new Hotspot();
    this.heatStats.foreheadHotspot.sensorX = this.foreheadX;
    this.heatStats.foreheadHotspot.sensorY = this.foreheadY; // NOTE(jon): Get the hotspot from the median-smoothed data, not the radial smoothed data.

    this.heatStats.foreheadHotspot.sensorValue = values[~~this.foreheadY * frameWidth + ~~this.foreheadX];

    if (DEBUG) {
      console.log("Face", detectedROI, heatStats);
    }
  }

}
// CONCATENATED MODULE: ./src/feature-detection.ts




const feature_detection_PERF_TEST = false;
let feature_detection_performance = {
  mark: arg => {
    return;
  },
  measure: (arg0, arg1, arg2) => {
    return;
  },
  now: () => {
    return;
  }
};

if (feature_detection_PERF_TEST) {
  feature_detection_performance = window.performance;
}

const MinFaceAge = 2;
var FeatureState;

(function (FeatureState) {
  FeatureState[FeatureState["LeftEdge"] = 0] = "LeftEdge";
  FeatureState[FeatureState["RightEdge"] = 1] = "RightEdge";
  FeatureState[FeatureState["TopEdge"] = 2] = "TopEdge";
  FeatureState[FeatureState["BottomEdge"] = 3] = "BottomEdge";
  FeatureState[FeatureState["Inside"] = 4] = "Inside";
  FeatureState[FeatureState["Outside"] = 5] = "Outside";
  FeatureState[FeatureState["None"] = 6] = "None";
  FeatureState[FeatureState["Top"] = 7] = "Top";
  FeatureState[FeatureState["Bottom"] = 8] = "Bottom";
})(FeatureState || (FeatureState = {}));

function feature_detection_euclDistance(x, y, x2, y2) {
  return Math.sqrt(Math.pow(x - x2, 2) + Math.pow(y - y2, 2));
}
class Rect {
  constructor(x0, x1, y0, y1) {
    this.x0 = x0;
    this.x1 = x1;
    this.y0 = y0;
    this.y1 = y1;
  }

} //
// export class ROIFeature {
//   constructor() {
//     this.x0 = 0;
//     this.y0 = 0;
//     this.x1 = 0;
//     this.y1 = 0;
//     this.mergeCount = 1;
//     this.sensorMissing = 0;
//     this.sensorValue = 0;
//     this.sensorX = 0;
//     this.sensorY = 0;
//   }
//
//   wholeValues() {
//     const roundedRoi = new ROIFeature();
//     roundedRoi.x0 = ~~this.x0;
//     roundedRoi.x1 = ~~this.x1;
//     roundedRoi.y0 = ~~this.y0;
//     roundedRoi.y1 = ~~this.y1;
//     return roundedRoi;
//   }
//   extend(value: number, maxWidth: number, maxHeight: number): ROIFeature {
//     const roi = new ROIFeature();
//     roi.x0 = Math.max(0, this.x0 - value);
//     roi.x1 = Math.min(maxWidth, this.x1 + value);
//     roi.y0 = Math.max(0, this.y0 - value);
//     roi.y1 = Math.min(maxHeight, this.y1 + value);
//     return roi;
//   }
//
//   wider(other: ROIFeature | null | undefined): boolean {
//     return !other || this.width() > other.width();
//   }
//
//   higher(other: ROIFeature | null | undefined): boolean {
//     return !other || this.height() > other.height();
//   }
//
//   hasXValues() {
//     return this.x0 != -1 && this.x1 != -1;
//   }
//
//   hasYValues() {
//     return this.y0 != -1 && this.y1 != -1;
//   }
//
//   midX() {
//     return (this.x0 + this.x1) / 2;
//   }
//   midY() {
//     return (this.y0 + this.y1) / 2;
//   }
//
//   width() {
//     return this.x1 - this.x0;
//   }
//
//   height() {
//     return this.y1 - this.y0;
//   }
//
//   midDiff(other: ROIFeature): number {
//     return euclDistance(this.midX(), this.midY(), other.midX(), other.midY());
//   }
//
//   overlapsROI(other: ROIFeature): boolean {
//     return this.overlap(other.x0, other.y0, other.x1, other.y1);
//   }
//
//   overlap(x0: number, y0: number, x1: number, y1: number) {
//     if (x1 <= this.x0) {
//       return false;
//     }
//     if (y1 <= this.y0) {
//       return false;
//     }
//     if (this.x1 <= x0) {
//       return false;
//     }
//     if (this.y1 <= y0) {
//       return false;
//     }
//     return true;
//   }
//
//   contains(x: number, y: number) {
//     if (x <= this.x0) {
//       return false;
//     }
//     if (y <= this.y0) {
//       return false;
//     }
//     if (this.x1 < x) {
//       return false;
//     }
//     if (this.y1 < y) {
//       return false;
//     }
//     return true;
//   }
//
//   // checks if this roi fits completely inside a sqaure (x0,y0) - (x1,y1)
//   isContainedBy(x0: number, y0: number, x1: number, y1: number): boolean {
//     if (this.x0 > x0 && this.x1 < x1 && this.y0 > y0 && this.y1 < y1) {
//       return true;
//     }
//     return false;
//   }
//
//   tryMerge(x0: number, y0: number, x1: number, y1: number, mergeCount = 1) {
//     if (!this.overlap(x0, y0, x1, y1)) {
//       return false;
//     }
//     const newMerge = mergeCount + this.mergeCount;
//     this.x0 = (this.x0 * this.mergeCount + x0 * mergeCount) / newMerge;
//     this.y0 = (this.y0 * this.mergeCount + y0 * mergeCount) / newMerge;
//     this.x1 = (this.x1 * this.mergeCount + x1 * mergeCount) / newMerge;
//     this.y1 = (this.y1 * this.mergeCount + y1 * mergeCount) / newMerge;
//     this.mergeCount = newMerge;
//     return true;
//   }
//
//   x0: number;
//   y0: number;
//   x1: number;
//   y1: number;
//   mergeCount: number;
//   sensorValue: number;
//   sensorMissing: number;
//   sensorX: number;
//   sensorY: number;
// }

function circleStillPresent(r, saltPepperData, edgeData, frameWidth, frameHeight) {
  const width = frameWidth;
  const height = frameHeight;
  const dest = new Float32Array(width * height);
  const radius = r.width() * 0.5;
  const [value, cx, cy] = circleDetectRadius(edgeData, dest, radius, width, height, r.midX() - radius * 2, r.midY() - radius * 2, r.midX() + radius * 2, r.midY() + radius * 2);

  if (!r.contains(cx, cy)) {
    r.sensorMissing = Math.max(r.sensorMissing - 1, 0);
    return r.sensorMissing > 0;
  }

  r.sensorMissing = Math.min(r.sensorMissing + 1, 20);
  return true;
}

function detectThermalReference(saltPepperData, edgeData, previousThermalReference, frameWidth, frameHeight) {
  if (previousThermalReference && circleStillPresent(previousThermalReference, saltPepperData, edgeData, frameWidth, frameHeight)) {
    return {
      r: previousThermalReference,
      edgeData
    };
  }

  const [bestRadius, bestX, bestY] = circleDetect(edgeData, frameWidth, frameHeight);

  if (bestRadius <= 4 || bestRadius > 7) {
    return {
      r: null,
      edgeData
    };
  }

  const r = new ROIFeature();
  r.x0 = bestX - bestRadius;
  r.y0 = bestY - bestRadius;
  r.x1 = bestX + bestRadius;
  r.y1 = bestY + bestRadius;
  return {
    edgeData,
    r
  };
}
function featureLine(x, y) {
  const line = new ROIFeature();
  line.y0 = y;
  line.y1 = y;
  line.x0 = x;
  line.x1 = x;
  return line;
}
function findFacesInFrameSync(smoothedData, saltPepperData, frameWidth, frameHeight, model, existingFaces, thermalReference, info) {
  // Now extract the faces(s), and their hotspots.
  feature_detection_performance.mark("buildSat start");
  const satData = buildSAT(smoothedData, frameWidth, frameHeight, thermalReference);
  feature_detection_performance.mark("buildSat end");
  feature_detection_performance.measure("build SAT", "buildSat start", "buildSat end");
  feature_detection_performance.mark("scanHaar");
  const faceBoxes = scanHaarSerial(model, satData, frameWidth, frameHeight);
  feature_detection_performance.mark("scanHaar end");
  feature_detection_performance.measure("scanHaarParallel", "scanHaar", "scanHaar end");
  feature_detection_performance.mark("track faces"); // TODO(jon): May want to loop through this a few times until is stabilises.

  const newFaces = [];

  for (const haarFace of faceBoxes) {
    const existingFace = existingFaces.find(face => haarFace.overlapsROI(face.haarFace));

    if (existingFace) {
      existingFace.updateHaar(haarFace);
    } else {
      const face = new face_Face(haarFace, 0);
      face.trackFace(smoothedData, saltPepperData, thermalReference, frameWidth, frameHeight);
      newFaces.push(face);
    }
  } // track faces from last frame


  for (const face of existingFaces) {
    face.trackFace(smoothedData, saltPepperData, thermalReference, frameWidth, frameHeight); //console.log(face.id, face.haarActive());
    //console.assert(face.haarActive(), info.Telemetry.FrameCount);

    if (face.active()) {
      // If the haar age is less than 10 frames, and
      if (face.haarAge < MinFaceAge && !face.haarActive()) {
        console.log("dropping face", face.id);
        continue;
      }

      newFaces.push(face);
    }
  }

  feature_detection_performance.mark("track faces end");
  feature_detection_performance.measure("track faces", "track faces", "track faces end");
  return newFaces;
}
// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"93785e02-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vuetify-loader/lib/loader.js??ref--20-0!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/FakeThermalCameraControls.vue?vue&type=template&id=750d764a&scoped=true&
var FakeThermalCameraControlsvue_type_template_id_750d764a_scoped_true_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return (_vm.hasFakeThermalCamera)?_c('div',[_c('label',[_vm._v(" Cptv files: "),_c('v-select',{attrs:{"items":_vm.cptvFiles},on:{"change":_vm.selectAndPlayVideo},model:{value:(_vm.selectedFile),callback:function ($$v) {_vm.selectedFile=$$v},expression:"selectedFile"}})],1),_c('label',[_vm._v(" Repeat: "),_c('v-text-field',{attrs:{"type":"number"},model:{value:(_vm.repeatCount),callback:function ($$v) {_vm.repeatCount=$$v},expression:"repeatCount"}})],1),_c('v-btn',{attrs:{"disabled":!_vm.hasFiles},on:{"click":function($event){return _vm.togglePlayback()}}},[_vm._v(" "+_vm._s(_vm.paused ? "Play" : "Pause")+" ")]),_c('v-btn',{on:{"click":function($event){return _vm.listFiles()}}},[_vm._v("Refresh files")])],1):_vm._e()}
var FakeThermalCameraControlsvue_type_template_id_750d764a_scoped_true_staticRenderFns = []


// CONCATENATED MODULE: ./src/components/FakeThermalCameraControls.vue?vue&type=template&id=750d764a&scoped=true&

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--14-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/ts-loader??ref--14-3!./node_modules/vuetify-loader/lib/loader.js??ref--20-0!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/FakeThermalCameraControls.vue?vue&type=script&lang=ts&



let FakeThermalCameraControlsvue_type_script_lang_ts_FakeThermalCameraControls = class FakeThermalCameraControls extends vue_property_decorator["d" /* Vue */] {
  constructor() {
    super(...arguments);
    this.hasFakeThermalCamera = false;
    this.cptvFiles = [];
    this.selectedFile = "";
    this.repeatCount = 10;
    this.currentPlayingFile = "";
  }

  get hasFiles() {
    return this.cptvFiles.length !== 0 && this.selectedFile !== "";
  }

  async beforeMount() {
    try {
      this.hasFakeThermalCamera = await FakeThermalCameraApi.isFakeThermalCamera();
    } catch (e) {
      this.hasFakeThermalCamera = false;
    }

    if (this.hasFakeThermalCamera) {
      await FakeThermalCameraApi.stopPlayback();
      await this.listFiles();
    }
  }

  async selectAndPlayVideo() {
    this.currentPlayingFile = this.selectedFile;

    if (!this.playingLocal) {
      return !(await FakeThermalCameraApi.playbackCptvFile(this.selectedFile, this.repeatCount));
    } else {
      return !this.paused;
    }
  }

  async togglePlayback() {
    if (!this.currentPlayingFile) {
      return this.selectAndPlayVideo();
    }

    if (!this.playingLocal) {
      if (!this.paused) {
        return await FakeThermalCameraApi.pausePlayback();
      } else {
        return !(await FakeThermalCameraApi.resumePlayback());
      }
    } else {
      return !this.paused;
    }
  }

  async listFiles() {
    this.cptvFiles = await FakeThermalCameraApi.listFakeThermalCameraFiles();

    if (this.cptvFiles.length) {
      this.selectedFile = this.cptvFiles[0];
    }
  }

};

Object(tslib_es6["a" /* __decorate */])([Object(vue_property_decorator["c" /* Prop */])()], FakeThermalCameraControlsvue_type_script_lang_ts_FakeThermalCameraControls.prototype, "paused", void 0);

Object(tslib_es6["a" /* __decorate */])([Object(vue_property_decorator["c" /* Prop */])()], FakeThermalCameraControlsvue_type_script_lang_ts_FakeThermalCameraControls.prototype, "playingLocal", void 0);

Object(tslib_es6["a" /* __decorate */])([Object(vue_property_decorator["b" /* Emit */])("toggle-playback")], FakeThermalCameraControlsvue_type_script_lang_ts_FakeThermalCameraControls.prototype, "selectAndPlayVideo", null);

Object(tslib_es6["a" /* __decorate */])([Object(vue_property_decorator["b" /* Emit */])()], FakeThermalCameraControlsvue_type_script_lang_ts_FakeThermalCameraControls.prototype, "togglePlayback", null);

FakeThermalCameraControlsvue_type_script_lang_ts_FakeThermalCameraControls = Object(tslib_es6["a" /* __decorate */])([vue_property_decorator["a" /* Component */]], FakeThermalCameraControlsvue_type_script_lang_ts_FakeThermalCameraControls);
/* harmony default export */ var FakeThermalCameraControlsvue_type_script_lang_ts_ = (FakeThermalCameraControlsvue_type_script_lang_ts_FakeThermalCameraControls);
// CONCATENATED MODULE: ./src/components/FakeThermalCameraControls.vue?vue&type=script&lang=ts&
 /* harmony default export */ var components_FakeThermalCameraControlsvue_type_script_lang_ts_ = (FakeThermalCameraControlsvue_type_script_lang_ts_); 
// EXTERNAL MODULE: ./node_modules/vuetify/lib/components/VSelect/VSelect.js + 22 modules
var VSelect = __webpack_require__("b974");

// CONCATENATED MODULE: ./src/components/FakeThermalCameraControls.vue





/* normalize component */

var FakeThermalCameraControls_component = Object(componentNormalizer["a" /* default */])(
  components_FakeThermalCameraControlsvue_type_script_lang_ts_,
  FakeThermalCameraControlsvue_type_template_id_750d764a_scoped_true_render,
  FakeThermalCameraControlsvue_type_template_id_750d764a_scoped_true_staticRenderFns,
  false,
  null,
  "750d764a",
  null
  
)

/* harmony default export */ var components_FakeThermalCameraControls = (FakeThermalCameraControls_component.exports);

/* vuetify-loader */




installComponents_default()(FakeThermalCameraControls_component, {VBtn: VBtn["a" /* default */],VSelect: VSelect["a" /* default */],VTextField: VTextField["a" /* default */]})

// CONCATENATED MODULE: ./src/api/types.ts
var TemperatureSource;

(function (TemperatureSource) {
  TemperatureSource["FOREHEAD"] = "forehead";
  TemperatureSource["EAR"] = "ear";
  TemperatureSource["ARMPIT"] = "armpit";
  TemperatureSource["ORAL"] = "oral";
})(TemperatureSource || (TemperatureSource = {}));

var Modes;

(function (Modes) {
  Modes["CALIBRATE"] = "calibrate";
  Modes["SCAN"] = "scan";
})(Modes || (Modes = {}));

const Dummy = 1;
// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"93785e02-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vuetify-loader/lib/loader.js??ref--20-0!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/FpsCounter.vue?vue&type=template&id=1e15926a&scoped=true&
var FpsCountervue_type_template_id_1e15926a_scoped_true_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"fps-counter"},[_vm._v(_vm._s(_vm.fps)+" FPS")])}
var FpsCountervue_type_template_id_1e15926a_scoped_true_staticRenderFns = []


// CONCATENATED MODULE: ./src/components/FpsCounter.vue?vue&type=template&id=1e15926a&scoped=true&

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--14-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/ts-loader??ref--14-3!./node_modules/vuetify-loader/lib/loader.js??ref--20-0!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/FpsCounter.vue?vue&type=script&lang=ts&


let FpsCountervue_type_script_lang_ts_FpsCounter = class FpsCounter extends vue_property_decorator["d" /* Vue */] {
  constructor() {
    super(...arguments);
    this.fpsTimes = [];
  }

  onFrameComplete() {
    this.fpsTimes.push(new Date().getTime());

    while (this.fpsTimes.length > 25) {
      this.fpsTimes.shift();
    }
  } // TODO(jon): Draw sparklines


  get fps() {
    // How many frames rendered in the last second?
    const now = new Date().getTime();
    const framesRendered = this.fpsTimes.filter(x => x > now - 1000);
    return framesRendered.length;
  }

};

Object(tslib_es6["a" /* __decorate */])([Object(vue_property_decorator["c" /* Prop */])()], FpsCountervue_type_script_lang_ts_FpsCounter.prototype, "frameCount", void 0);

Object(tslib_es6["a" /* __decorate */])([Object(vue_property_decorator["e" /* Watch */])("frameCount")], FpsCountervue_type_script_lang_ts_FpsCounter.prototype, "onFrameComplete", null);

FpsCountervue_type_script_lang_ts_FpsCounter = Object(tslib_es6["a" /* __decorate */])([vue_property_decorator["a" /* Component */]], FpsCountervue_type_script_lang_ts_FpsCounter);
/* harmony default export */ var FpsCountervue_type_script_lang_ts_ = (FpsCountervue_type_script_lang_ts_FpsCounter);
// CONCATENATED MODULE: ./src/components/FpsCounter.vue?vue&type=script&lang=ts&
 /* harmony default export */ var components_FpsCountervue_type_script_lang_ts_ = (FpsCountervue_type_script_lang_ts_); 
// EXTERNAL MODULE: ./src/components/FpsCounter.vue?vue&type=style&index=0&id=1e15926a&scoped=true&lang=css&
var FpsCountervue_type_style_index_0_id_1e15926a_scoped_true_lang_css_ = __webpack_require__("7e56");

// CONCATENATED MODULE: ./src/components/FpsCounter.vue






/* normalize component */

var FpsCounter_component = Object(componentNormalizer["a" /* default */])(
  components_FpsCountervue_type_script_lang_ts_,
  FpsCountervue_type_template_id_1e15926a_scoped_true_render,
  FpsCountervue_type_template_id_1e15926a_scoped_true_staticRenderFns,
  false,
  null,
  "1e15926a",
  null
  
)

/* harmony default export */ var components_FpsCounter = (FpsCounter_component.exports);
// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"93785e02-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vuetify-loader/lib/loader.js??ref--20-0!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/Histogram.vue?vue&type=template&id=60ef0ecb&scoped=true&
var Histogramvue_type_template_id_60ef0ecb_scoped_true_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[_c('canvas',{ref:"debugCanvas",staticClass:"debug-canvas",attrs:{"width":"256","height":"240"},on:{"click":_vm.setThreshold}}),_c('div',[_vm._v("MIN: "+_vm._s(_vm.minC))]),_c('div',[_vm._v("MAX: "+_vm._s(_vm.maxC))]),_c('div',[_vm._v(" RANGE: "+_vm._s((_vm.max - _vm.min).toFixed(2))+", "+_vm._s((_vm.maxC.val - _vm.minC.val).toFixed(2))+" ")])])}
var Histogramvue_type_template_id_60ef0ecb_scoped_true_staticRenderFns = []


// CONCATENATED MODULE: ./src/components/Histogram.vue?vue&type=template&id=60ef0ecb&scoped=true&

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--14-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/ts-loader??ref--14-3!./node_modules/vuetify-loader/lib/loader.js??ref--20-0!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/Histogram.vue?vue&type=script&lang=ts&



let Histogramvue_type_script_lang_ts_Histogram = class Histogram extends vue_property_decorator["d" /* Vue */] {
  constructor() {
    super(...arguments);
    this.min = 0;
    this.max = 0;
  }

  tempForVal(val) {
    return temperatureForSensorValue(this.calibratedTemp.val, val, this.thermalReferenceStats.mean);
  }

  get minC() {
    return this.tempForVal(this.min);
  }

  get maxC() {
    return this.tempForVal(this.max);
  }

  mounted() {
    this.updateCtx();
  }

  setThreshold(e) {
    e.preventDefault();
    return 0;
  }

  updateCtx() {
    // TODO(jon): Put this in the main loop, so that we don't have a frame of delay.
    const data = this.frame.smoothed;
    const numBuckets = 16;
    const {
      histogram,
      min,
      max
    } = getHistogram(data, numBuckets);
    this.min = min;
    this.max = max;
    const thermalRefBucketLow = Math.floor((this.thermalReferenceStats.min - min) / (max - min) * numBuckets);
    const thermalRefBucketHigh = Math.floor((this.thermalReferenceStats.max - min) / (max - min) * numBuckets);
    const thermalRefBucketMean = Math.floor((this.thermalReferenceStats.mean - min) / (max - min) * numBuckets);
    const thermalRefBucketMedian = Math.floor((this.thermalReferenceStats.median - min) / (max - min) * numBuckets); ///console.log(thermalRefBucket, histogram[thermalRefBucket]);

    {
      const canvas = this.$refs.debugCanvas;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const _max = Math.max(...histogram);

      for (let x = 0; x < histogram.length; x++) {
        if (x === thermalRefBucketMean) {
          ctx.fillStyle = "purple";
        } else if (x === thermalRefBucketMedian) {
          ctx.fillStyle = "orange";
        } else if (x >= thermalRefBucketLow && x <= thermalRefBucketHigh) {
          ctx.fillStyle = "yellow";
        } else {
          ctx.fillStyle = "red";
        }

        const bucket = histogram[x];
        const v = bucket / _max * canvas.height;
        const xx = canvas.width / numBuckets * x;
        ctx.fillRect(xx, canvas.height - v, canvas.width / numBuckets, v);
      }
    }
  }

  draw(prev, next) {
    if (prev.frameInfo.Telemetry.FrameCount !== next.frameInfo.Telemetry.FrameCount) {
      this.updateCtx();
    }
  }

};

Object(tslib_es6["a" /* __decorate */])([Object(vue_property_decorator["c" /* Prop */])({
  required: true
})], Histogramvue_type_script_lang_ts_Histogram.prototype, "frame", void 0);

Object(tslib_es6["a" /* __decorate */])([Object(vue_property_decorator["c" /* Prop */])({
  required: true
})], Histogramvue_type_script_lang_ts_Histogram.prototype, "thermalReferenceStats", void 0);

Object(tslib_es6["a" /* __decorate */])([Object(vue_property_decorator["c" /* Prop */])({
  required: true
})], Histogramvue_type_script_lang_ts_Histogram.prototype, "calibratedTemp", void 0);

Object(tslib_es6["a" /* __decorate */])([Object(vue_property_decorator["e" /* Watch */])("frame")], Histogramvue_type_script_lang_ts_Histogram.prototype, "draw", null);

Histogramvue_type_script_lang_ts_Histogram = Object(tslib_es6["a" /* __decorate */])([vue_property_decorator["a" /* Component */]], Histogramvue_type_script_lang_ts_Histogram);
/* harmony default export */ var Histogramvue_type_script_lang_ts_ = (Histogramvue_type_script_lang_ts_Histogram);
// CONCATENATED MODULE: ./src/components/Histogram.vue?vue&type=script&lang=ts&
 /* harmony default export */ var components_Histogramvue_type_script_lang_ts_ = (Histogramvue_type_script_lang_ts_); 
// EXTERNAL MODULE: ./src/components/Histogram.vue?vue&type=style&index=0&id=60ef0ecb&scoped=true&lang=scss&
var Histogramvue_type_style_index_0_id_60ef0ecb_scoped_true_lang_scss_ = __webpack_require__("dab7");

// CONCATENATED MODULE: ./src/components/Histogram.vue






/* normalize component */

var Histogram_component = Object(componentNormalizer["a" /* default */])(
  components_Histogramvue_type_script_lang_ts_,
  Histogramvue_type_template_id_60ef0ecb_scoped_true_render,
  Histogramvue_type_template_id_60ef0ecb_scoped_true_staticRenderFns,
  false,
  null,
  "60ef0ecb",
  null
  
)

/* harmony default export */ var components_Histogram = (Histogram_component.exports);
// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--14-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/ts-loader??ref--14-3!./node_modules/vuetify-loader/lib/loader.js??ref--20-0!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/App.vue?vue&type=script&lang=ts&
function Appvue_type_script_lang_ts_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function Appvue_type_script_lang_ts_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { Appvue_type_script_lang_ts_ownKeys(Object(source), true).forEach(function (key) { Appvue_type_script_lang_ts_defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { Appvue_type_script_lang_ts_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function Appvue_type_script_lang_ts_defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }




















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
    ThermalRefTemp: 38,
    SnapshotTime: 0,
    TemperatureCelsius: 34,
    SnapshotValue: 0,
    SnapshotUncertainty: 0,
    BodyLocation: TemperatureSource.FOREHEAD,
    ThresholdMinNormal: 0,
    ThresholdMinFever: 0,
    Bottom: 0,
    Top: 0,
    Left: 0,
    Right: 0,
    CalibrationBinaryVersion: "fsdfd",
    UuidOfUpdater: 432423432432
  }
};
let cptvPlayer; // let outputJSON = false;
// How much we pad out the top for helping haar cascade to work.  We don't need this if we get rid of haar.

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
    this.frameTimeout = 0;
    this.thresholdValue = 0;
    this.skippedWarmup = false;
    this.prevShape = [];
    this.nextShape = [];
    this.startFrame = 0; //130; //0; //39; //116;

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

  onThresholdChange(val) {
    this.thresholdValue = val;
  }

  get playingLocal() {
    return this.droppedDebugFile;
  }

  skipWarmup() {
    this.skippedWarmup = true;
  }

  advanceScreeningState(nextState) {
    // We can only move from certain states to certain other states.
    const prevState = this.appState.currentScreeningState;

    if (prevState !== nextState) {
      const allowedNextState = ScreeningAcceptanceStates[prevState];

      if (allowedNextState.includes(nextState)) {
        this.appState.currentScreeningState = nextState;
        this.appState.currentScreeningStateFrameCount = 1;
        return true;
      }
    } else {
      this.appState.currentScreeningStateFrameCount++;
    }

    return false;
  }

  get thermalReferenceRawValue() {
    return this.appState.thermalReference && this.appState.thermalReference.sensorValue || 0;
  }

  get currentFrameCount() {
    // NOTE(jon): This is always zero if it's the fake thermal camera.
    if (this.appState.currentFrame.frameInfo) {
      return this.appState.currentFrame.frameInfo.Telemetry.FrameCount;
    }

    return 0;
  }

  stepFrame() {
    this.appState.paused = false;
  }

  processFrame() {
    this.onFrame(this.appState.currentFrame);
  }

  holdCurrentFrame() {
    if (this.appState.paused && this.appState.currentFrame) {
      this.onFrame(this.appState.currentFrame);
      setTimeout(this.holdCurrentFrame.bind(this), this.frameInterval);
    }
  }

  get frameInterval() {
    //return 5000;
    if (this.appState.currentFrame) {
      return 1000 / 9; //this.appState.currentFrame.frameInfo.Camera.FPS;
    }

    return 1000 / 9;
  }

  async dropLocalCptvFile(event) {
    event.preventDefault();
    this.droppedDebugFile = true;

    if (event.dataTransfer && event.dataTransfer.items) {
      for (let i = 0; i < event.dataTransfer.items.length; i++) {
        if (event.dataTransfer.items[i].kind === "file") {
          const file = event.dataTransfer.items[i].getAsFile();
          const buffer = await file.arrayBuffer();
          await this.playLocalCptvFile(buffer);
        }
      }
    }
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
    this.appState.currentCalibration.thresholdMinNormal = nextCalibration.ThresholdMinNormal;
    this.appState.currentCalibration.cropBox = {
      top: nextCalibration.Top,
      right: nextCalibration.Right,
      bottom: nextCalibration.Bottom,
      left: nextCalibration.Left
    };
  }

  async playLocalCptvFile(buffer, startFrame = 0, endFrame = -1, pauseOn = -1) {
    const frameBuffer = new ArrayBuffer(160 * 120 * 2);
    let filledFrameBuffer = false;
    cptvPlayer.initWithCptvData(new Uint8Array(buffer));

    const getNextFrame = () => {
      clearTimeout(this.frameTimeout);
      let frameInfo;
      let rotated = true;

      if (!this.appState.paused || !filledFrameBuffer) {
        filledFrameBuffer = true; // If we're paused, we'll keep sending through the same frame each time.

        frameInfo = cptvPlayer.getRawFrame(new Uint8Array(frameBuffer));

        while (frameInfo.frame_number < startFrame || endFrame != -1 && frameInfo.frame_number > endFrame) {
          frameInfo = cptvPlayer.getRawFrame(new Uint8Array(frameBuffer));
        }

        rotated = false;
      }

      if (frameInfo && frameInfo.frame_number === pauseOn) {
        this.appState.paused = true;
      }

      const {
        appVersion,
        binaryVersion
      } = JSON.parse(window.localStorage.getItem("softwareVersion") || '""');
      this.appState.currentFrame = {
        frame: new Float32Array(new Uint16Array(frameBuffer)),
        rotated,
        frameInfo: frameInfo && Appvue_type_script_lang_ts_objectSpread(Appvue_type_script_lang_ts_objectSpread({}, InitialFrameInfo), {}, {
          AppVersion: appVersion,
          BinaryVersion: binaryVersion,
          Telemetry: Appvue_type_script_lang_ts_objectSpread(Appvue_type_script_lang_ts_objectSpread({}, InitialFrameInfo.Telemetry), {}, {
            LastFFCTime: frameInfo.last_ffc_time,
            FrameCount: frameInfo.frame_number,
            TimeOn: frameInfo.time_on
          })
        }) || this.appState.currentFrame.frameInfo,
        smoothed: new Float32Array(),
        medianed: new Float32Array(),
        threshold: 0,
        min: 0,
        max: 0
      }; // Rotate the frame.

      rotateFrame(this.appState.currentFrame); // TODO(jon): If thermal ref is always in the same place, maybe mask out the entire bottom of the frame?
      // Just for visualisation purposes?

      if (!this.appState.paused) {
        this.onFrame(this.appState.currentFrame);

        if (this.startFrame !== 0) {
          this.appState.paused = true;
        }
      }

      this.frameTimeout = setTimeout(getNextFrame, this.frameInterval);
    };

    clearTimeout(this.frameTimeout);
    getNextFrame();
  }

  onCropChanged(cropBox) {
    this.appState.currentCalibration.cropBox = cropBox;
  }

  onTogglePlayback(paused) {
    if (paused && !this.droppedDebugFile) {
      // Repeat the current frame
      setTimeout(this.holdCurrentFrame.bind(this), this.frameInterval);
    }

    this.appState.paused = paused;
  }

  saveCropChanges() {
    console.log("save crop changes", JSON.parse(JSON.stringify(this.appState.currentCalibration.cropBox)));
  }

  get calibratedTemp() {
    return this.appState.currentCalibration.calibrationTemperature;
  } // TODO(jon): Setting to get temperature from hotspot on faces vs overall hotspot (excluding thermal ref)


  get hotspotTemp() {
    const hotspot = this.hotspot;

    if (hotspot !== null) {
      return temperatureForSensorValue(this.appState.currentCalibration.calibrationTemperature.val, hotspot.sensorValue, this.thermalReferenceRawValue);
    }

    return null;
  }

  get thermalReferenceTemp() {
    return mKToCelsius(this.thermalReferenceRawValue);
  }

  get currentFrame() {
    return this.appState.currentFrame;
  }

  get hasThermalReference() {
    return this.appState.thermalReference !== null;
  }

  get timeOnInSeconds() {
    if (this.prevFrameInfo) {
      const telemetry = this.prevFrameInfo.Telemetry;
      let timeOnSecs; // NOTE: TimeOn is in nanoseconds when coming from the camera server, but in milliseconds when coming
      // from a CPTV file - should make these the same.

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

  get hasFace() {
    return false; //this.appState.face !== null;
  }

  get hotspot() {
    // TODO(jon): Extract this from the radial smoothed data.
    if (this.hasFace) {
      const cropBox = this.cropBoxPixelBounds;
      const hotspot = this.appState.faces[0].heatStats.foreheadHotspot;

      if (!hotspot) {
        return null;
      }

      if (hotspot.sensorX >= cropBox.x0 && hotspot.sensorX < cropBox.x1 && hotspot.sensorY >= cropBox.y0 && hotspot.sensorY < cropBox.y1) {
        return hotspot;
      }
    }

    return null;
  }

  get hasHotspot() {
    return this.hotspot !== null;
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

  samplePointIsInsideCroppingArea(point) {
    const cropBoxPx = this.cropBoxPixelBounds;
    return cropBoxPx.x0 < point.x && cropBoxPx.x1 >= point.x && cropBoxPx.y0 < point.y && cropBoxPx.y1 >= point.y;
  }

  async onFrame(frame) {
    //console.log("---", frame.frameInfo.Telemetry.FrameCount);
    const newLine = frame.frameInfo.AppVersion.indexOf("\n");

    if (newLine !== -1) {
      frame.frameInfo.AppVersion = frame.frameInfo.AppVersion.substring(0, newLine);
    } // Did the software get updated?


    checkForSoftwareUpdates(frame.frameInfo.BinaryVersion, frame.frameInfo.AppVersion);

    if (this.prevFrameInfo) {
      const prevCalibration = JSON.stringify(this.prevFrameInfo.Calibration);
      const nextCalibration = JSON.stringify(frame.frameInfo.Calibration);

      if (prevCalibration !== nextCalibration) {
        console.log("updating calibration", JSON.stringify(frame.frameInfo.Calibration, null, "\t"));
        this.updateCalibration(frame.frameInfo.Calibration);
      }
    }

    rotateFrame(frame);
    this.appState.lastFrameTime = new Date().getTime();
    this.prevFrameInfo = frame.frameInfo;
    const {
      ResX: width,
      ResY: height
    } = frame.frameInfo.Camera;
    const prevThermalRef = this.appState.thermalReference;
    const thermalRefC = temperatureForSensorValue(this.appState.currentCalibration.calibrationTemperature.val, (prevThermalRef === null || prevThermalRef === void 0 ? void 0 : prevThermalRef.sensorValue) || 0, (prevThermalRef === null || prevThermalRef === void 0 ? void 0 : prevThermalRef.sensorValue) || 0).val;
    const {
      medianSmoothed,
      radialSmoothed,
      thresholded,
      motionStats,
      edgeData,
      pointCloud
    } = await processSensorData(frame, prevThermalRef, thermalRefC); // if (frame.frameInfo.Telemetry.FrameCount % 60 === 0) {
    //   console.log(motionStats);
    // }
    // Process sensor data can do a lot more:

    const data = thresholded;
    frame.smoothed = radialSmoothed;
    frame.medianed = medianSmoothed;
    frame.threshold = motionStats.heatStats.threshold;
    frame.min = motionStats.heatStats.min;
    frame.max = motionStats.heatStats.max; // TODO(jon): Sanity check - if the thermal reference is moving from frame to frame,
    //  it's probably someones head...

    const {
      r: thermalReference
    } = detectThermalReference(medianSmoothed, edgeData, this.appState.thermalReference, width, height); //console.log(thermalReference);

    if (this.isWarmingUp) {
      this.appState.thermalReference = thermalReference;
      this.advanceScreeningState(ScreeningState.WARMING_UP);
    } else {
      if (thermalReference) {
        this.appState.thermalReferenceStats = Object.freeze(extractSensorValueForCircle(thermalReference, medianSmoothed, width));
        thermalReference.sensorValue = this.appState.thermalReferenceStats.median;
        this.prevShape = this.nextShape; // Use thermal ref values from last frame, they will be good enough.
        // Process frame to see if there's a body.

        this.appState.thermalReference = thermalReference;
        this.appState.prevFrame = frame;
        const hasBody = motionStats.frameBottomSum !== 0 && motionStats.motionThresholdSum > 45;

        if (hasBody) {
          let approxHeadWidth = 0;
          const rawShapes = getRawShapes(data, width, height, thresholdBit);
          const shapes = getSolidShapes(rawShapes); // const { shapes, didMerge: maybeHasGlasses } = preprocessShapes(
          //   rawShapes
          // );

          let body = null;
          let face = null;

          if (shapes.length) {
            body = largestShape(shapes);
            fillVerticalCracks(body);

            if (this.appState.currentScreeningState !== ScreeningState.LEAVING) {
              /// NOTE(jon): Don't spend time processing head features if we already captured something and are leaving.
              approxHeadWidth = guessApproximateHeadWidth(cloneShape(body));
              let neck = null;

              if (approxHeadWidth > 0) {
                // FIXME(jon) - this method of guessing head width doesn't always work, ie. if the person has long hair or a hood,
                // and they don't have a bit where their face dips in again after flaring out.
                // Maybe get the possible range that the neck can be in from the width at the top of the body convex hull?
                const searchStart = Math.min(Math.ceil(approxHeadWidth), body.length - 1);
                const searchEnd = Math.min(Math.ceil(approxHeadWidth * 1.7), body.length - 1);
                const slice = body.slice(searchStart, searchEnd);

                if (slice.length) {
                  neck = getNeck(slice);
                }
              }

              if (neck) {
                const pts = [];

                for (let i = 0; i < pointCloud.length; i++) {
                  pts.push([pointCloud[i], pointCloud[i + 1]]);
                  i++;
                }

                refineHeadThresholdData(data, neck, pts); // Draw head hull into canvas context, mask out threshold bits we care about:

                const _rawShapes = getRawShapes(data, width, height, thresholdBit); // const {
                //   shapes: faceShapes,
                //   didMerge: maybeHasGlasses
                // } = preprocessShapes(rawShapes);


                const faceShape = largestShape(getSolidShapes(_rawShapes));

                if (faceShape.length) {
                  face = extractFaceInfo(neck, faceShape, radialSmoothed);
                }
              }
            } // TODO(jon): If half the face is off-frame, null out face.


            if (hasBody) {
              // TODO(jon): Infill ovals on faces that look dodgey, so we get a nice silhouette.
              this.nextShape = [extendToBottom(body)].map(shape => Object.freeze(shape));
              LerpAmount.amount = 0;
            } else {
              this.nextShape = [];
            }
          } // STATE MANAGEMENT


          const {
            event,
            state,
            count
          } = main_advanceState(this.appState.motionStats, motionStats, face, body, this.appState.face, this.appState.currentScreeningState, this.appState.currentScreeningStateFrameCount, motionStats.heatStats.threshold, radialSmoothed, thermalReference);
          this.appState.motionStats = motionStats;
          this.appState.currentScreeningState = state;
          this.appState.currentScreeningStateFrameCount = count;
          this.appState.face = face;

          if (event === "Captured" && face) {
            const temperatureSamplePoint = getHottestSpotInBounds(face, motionStats.heatStats.threshold, width, height, radialSmoothed);
            this.snapshotScreeningEvent(thermalReference, face, frame, temperatureSamplePoint);
          } else if (event === "Recorded") {
            if (this.isReferenceDevice) {
              ScreeningApi.recordScreeningEvent(this.deviceName, this.deviceID, this.appState.currentScreeningEvent);
            }

            this.appState.currentScreeningEvent = null;
          }
        } else {
          if (this.appState.currentScreeningState === ScreeningState.LEAVING) {
            this.appState.currentScreeningStateFrameCount++;
          }

          if (this.appState.currentScreeningState !== ScreeningState.LEAVING || this.appState.currentScreeningState === ScreeningState.LEAVING && this.appState.currentScreeningStateFrameCount > 15) {
            this.advanceScreeningState(ScreeningState.READY);
          }

          this.nextShape = [];
        }
      } else {
        // TODO(jon): Possibly thermal reference error?
        this.advanceScreeningState(ScreeningState.MISSING_THERMAL_REF);
      }
    }

    this.appState.currentFrame = frame;
    this.frameCounter++;
  }

  snapshotScreeningEvent(thermalReference, face, frame, sample) {
    this.appState.currentScreeningEvent = {
      rawTemperatureValue: sample.v,
      sampleX: sample.x,
      sampleY: sample.y,
      frame,
      timestamp: new Date(),
      thermalReferenceRawValue: thermalReference.sensorValue,
      thermalReference,
      face
    }; // console.log("Record screening event", frame, face);

    return;
  }

  onConnectionStateChange(connection) {
    this.appState.cameraConnectionState = connection;
  }

  async beforeMount() {
    // Update the AppState:
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

    clearTimeout(this.frameTimeout);
    /*
    // On startup:
    // Load the face recognition model
    // NOTE: Don't add this to the Vue state tree, since its state never changes.
    FaceRecognitionModel = await loadFaceRecognitionModel("/cascade_stg17.xml");
         console.log(JSON.stringify(FaceRecognitionModel, null, "\t"));
         // Open the camera connection
     
    new CameraConnection(
      "http://localhost:2041",
      this.onFrame,
      this.onConnectionStateChange
    );
    );
    */

    this.useLiveCamera = true;

    if (this.useLiveCamera) {
      // FIXME(jon): Add the proper camera url
      // FIXME(jon): Get rid of browser full screen toggle
      new camera_CameraConnection(window.location.hostname, this.onFrame, this.onConnectionStateChange);
    } else {
      // TODO(jon): Queue multiple files
      cptvPlayer = await __webpack_require__.e(/* import() */ "chunk-fae4a56a").then(__webpack_require__.bind(null, "327f")); ///const cptvFile = await fetch("/cptv-files/twopeople-calibration.cptv");
      //const cptvFile = await fetch();
      //"cptv-files/bunch of people in small meeting room 20200812.134427.735.cptv",
      //"/cptv-files/bunch of people downstairs walking towards camera 20200812.161144.768.cptv"

      const cptvFile = await fetch("/cptv-files/0.7.5beta recording-1 2708.cptv"); //
      //const cptvFile = await fetch("/cptv-files/20200716.153342.441.cptv");
      //const cptvFile = await fetch("/cptv-files/20200716.153342.441.cptv"); // Jon (too high in frame)
      //const cptvFile = await fetch("/cptv-files/20200718.130624.941.cptv"); // Sara
      //const cptvFile = await fetch("/cptv-files/20200718.130606.382.cptv"); // Sara
      //const cptvFile = await fetch("/cptv-files/20200718.130536.950.cptv"); // Sara (fringe)
      //const cptvFile = await fetch("/cptv-files/20200718.130508.586.cptv"); // Sara (fringe)
      //const cptvFile = await fetch("/cptv-files/20200718.130059.393.cptv"); // Jon
      // const cptvFile = await fetch("/cptv-files/20200718.130017.220.cptv"); // Jon
      //
      //const cptvFile = await fetch("/cptv-files/walking through Shaun.cptv");
      //const cptvFile = await fetch("/cptv-files/looking_down.cptv");
      // const cptvFile = await fetch(
      //   "/cptv-files/detecting part then whole face repeatedly.cptv"
      // );
      //frontend\public\cptv-files\detecting part then whole face repeatedly.cptv
      // const cptvFile = await fetch(
      //   "/cptv-files/walking towards camera - calibrated at 2m.cptv"
      // );
      // Shauns office:
      //const cptvFile = await fetch("/cptv-files/20200729.104543.646.cptv");
      //const cptvFile = await fetch("/cptv-files/20200729.104622.519.cptv");
      //const cptvFile = await fetch("/cptv-files/20200729.104815.556.cptv"); // Proximity
      //const cptvFile = await fetch("/cptv-files/20200729.105022.389.cptv");
      // 20200729.105038.847
      //const cptvFile = await fetch("/cptv-files/20200729.105038.847.cptv");
      //const cptvFile = await fetch("/cptv-files/20200729.105053.858.cptv");

      const buffer = await cptvFile.arrayBuffer(); // 30, 113, 141

      await this.playLocalCptvFile(buffer, this.startFrame); //if (this.appState.paused) {
      //this.processFrame();
    } //new LocalCameraConnection(this.onFrame, this.onConnectionStateChange);

  }

};
Appvue_type_script_lang_ts_App = Object(tslib_es6["a" /* __decorate */])([Object(vue_property_decorator["a" /* Component */])({
  components: {
    Histogram: components_Histogram,
    FakeThermalCameraControls: components_FakeThermalCameraControls,
    AdminScreening: components_AdminScreening,
    UserFacingScreening: components_UserFacingScreening,
    FpsCounter: components_FpsCounter
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








installComponents_default()(App_component, {VApp: VApp["a" /* default */],VBtn: VBtn["a" /* default */],VCard: VCard_VCard["a" /* default */],VCardActions: VCard["a" /* VCardActions */],VCardTitle: VCard["d" /* VCardTitle */],VDialog: VDialog["a" /* default */],VSnackbar: VSnackbar["a" /* default */]})

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

 //import "./registerServiceWorker";







vue_runtime_esm["a" /* default */].config.productionTip = false;
const DEFAULT_THRESHOLD_MIN_NORMAL = 32.5;
const DEFAULT_THRESHOLD_MIN_FEVER = 37.8;
const WARMUP_TIME_SECONDS = 30 * 60; // 30 mins

const FFC_SAFETY_DURATION_SECONDS = 5;
const State = {
  currentFrame: null,
  prevFrame: null,
  cameraConnectionState: CameraConnectionState.Disconnected,
  thermalReference: null,
  thermalReferenceStats: null,
  faces: [],
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
    thresholdMinNormal: DEFAULT_THRESHOLD_MIN_NORMAL,
    thermalRefTemperature: new DegreesCelsius(0)
  },
  currentScreeningEvent: null,
  currentScreeningState: ScreeningState.WARMING_UP,
  currentScreeningStateFrameCount: -1,
  faceModel: null,
  lastFrameTime: 0,
  uuid: 0,
  motionStats: {
    thresholdSum: 0,
    motionThresholdSum: 0,
    heatStats: {
      max: 0,
      min: 0,
      threshold: 0
    },
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

function main_advanceScreeningState(nextState, prevState, currentCount) {
  // We can only move from certain states to certain other states.
  if (prevState !== nextState) {
    const allowedNextState = ScreeningAcceptanceStates[prevState];

    if (allowedNextState.includes(nextState)) {
      // console.log("Advanced to state", nextState);
      return {
        state: nextState,
        count: 1
      };
    }
  }

  return {
    state: prevState,
    count: currentCount + 1
  };
}

function main_advanceState(prevMotionStats, motionStats, face, body, prevFace, screeningState, screeningStateCount, threshold, radialSmoothed, thermalReference) {
  let next;
  let event = ""; //const prevAllMotion = prevMotionStats.motion + prevMotionStats.hotInnerEdge + prevMotionStats.hotInner + prevMotionStats.edge;
  //const allMotion = motionStats.motion + motionStats.hotInnerEdge + motionStats.hotInner + motionStats.edge;

  if (thermalReference === null) {
    next = main_advanceScreeningState(ScreeningState.MISSING_THERMAL_REF, screeningState, screeningStateCount);
  } else if (face !== null) {
    if (screeningState === ScreeningState.MISSING_THERMAL_REF) {
      if (faceArea(face) < 1500) {
        next = main_advanceScreeningState(ScreeningState.TOO_FAR, screeningState, screeningStateCount);
      } else {
        next = main_advanceScreeningState(ScreeningState.LARGE_BODY, screeningState, screeningStateCount);
      }
    } else if (faceArea(face) < 1500) {
      next = main_advanceScreeningState(ScreeningState.TOO_FAR, screeningState, screeningStateCount);
    } else if (faceIntersectsThermalRef(face, thermalReference)) {
      next = main_advanceScreeningState(ScreeningState.LARGE_BODY, screeningState, screeningStateCount);
    } else if (face.headLock !== 0) {
      if (faceIsFrontOn(face)) {
        const faceMoved = faceHasMovedOrChangedInSize(face, prevFace);

        if (faceMoved) {
          screeningStateCount--;
        }

        if (screeningState === ScreeningState.FRONTAL_LOCK && !faceMoved && face.headLock === 1 && screeningStateCount > 1 // Needs to be on this state for at least two frames.
        ) {
            next = main_advanceScreeningState(ScreeningState.STABLE_LOCK, screeningState, screeningStateCount);

            if (next.state !== screeningState) {
              // Capture the screening event here
              event = "Captured";
              console.log("---- Captured");
            }
          } else if (screeningState === ScreeningState.STABLE_LOCK) {
          next = main_advanceScreeningState(ScreeningState.LEAVING, screeningState, screeningStateCount);
        } else {
          next = main_advanceScreeningState(ScreeningState.FRONTAL_LOCK, screeningState, screeningStateCount);
        }
      } else {
        // NOTE: Could stay here a while if we're in an FFC event.
        next = main_advanceScreeningState(ScreeningState.FACE_LOCK, screeningState, screeningStateCount);
      }
    } else {
      next = main_advanceScreeningState(ScreeningState.HEAD_LOCK, screeningState, screeningStateCount);
    }

    prevFace = face;
  } else {
    // TODO(jon): Ignore stats around FFC, just say that it's thinking...
    const hasBody = motionStats.frameBottomSum !== 0 && motionStats.motionThresholdSum > 45;
    const prevFrameHasBody = prevMotionStats.frameBottomSum !== 0 && prevMotionStats.motionThresholdSum > 45; // TODO(jon): OR the threshold bounds are taller vertically than horizontally?

    if (hasBody) {
      next = main_advanceScreeningState(ScreeningState.LARGE_BODY, screeningState, screeningStateCount);
    } else {
      // Require 2 frames without a body before triggering leave event.
      if (!prevFrameHasBody) {
        if (screeningState === ScreeningState.LEAVING && screeningStateCount > 15) {
          // Record event now that we have lost the face?
          event = "Recorded";
          next = main_advanceScreeningState(ScreeningState.READY, screeningState, screeningStateCount);
        } else if (screeningState !== ScreeningState.LEAVING) {
          next = main_advanceScreeningState(ScreeningState.READY, screeningState, screeningStateCount);
        } else {
          next = main_advanceScreeningState(ScreeningState.LEAVING, screeningState, screeningStateCount);
        }
      } else {
        next = main_advanceScreeningState(ScreeningState.LARGE_BODY, screeningState, screeningStateCount);
      }
    }

    prevFace = null;
  }

  return {
    prevFace,
    state: next.state,
    count: next.count,
    event
  };
}
new vue_runtime_esm["a" /* default */]({
  vuetify: vuetify,
  render: h => h(src_App)
}).$mount("#app");

/***/ }),

/***/ "dab7":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_20_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Histogram_vue_vue_type_style_index_0_id_60ef0ecb_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("8741");
/* harmony import */ var _node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_20_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Histogram_vue_vue_type_style_index_0_id_60ef0ecb_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_20_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Histogram_vue_vue_type_style_index_0_id_60ef0ecb_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0__);
/* unused harmony reexport * */
 /* unused harmony default export */ var _unused_webpack_default_export = (_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_20_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Histogram_vue_vue_type_style_index_0_id_60ef0ecb_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "dd22":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_20_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_UserFacingScreening_vue_vue_type_style_index_0_id_0eeeafd4_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("c271");
/* harmony import */ var _node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_20_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_UserFacingScreening_vue_vue_type_style_index_0_id_0eeeafd4_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_20_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_UserFacingScreening_vue_vue_type_style_index_0_id_0eeeafd4_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0__);
/* unused harmony reexport * */
 /* unused harmony default export */ var _unused_webpack_default_export = (_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_vuetify_loader_lib_loader_js_ref_20_0_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_UserFacingScreening_vue_vue_type_style_index_0_id_0eeeafd4_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ })

/******/ });
//# sourceMappingURL=app.4f90ec16.js.map