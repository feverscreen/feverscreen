/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 126:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "yH": () => (/* binding */ FFC_MAX_INTERVAL_MS),
  "TD": () => (/* binding */ FFC_SAFETY_DURATION_SECONDS),
  "AM": () => (/* binding */ LerpAmount),
  "QI": () => (/* binding */ ObservableDeviceApi),
  "ZM": () => (/* binding */ State),
  "Ed": () => (/* binding */ WARMUP_TIME_SECONDS)
});

// EXTERNAL MODULE: ./node_modules/vue/dist/vue.runtime.esm.js
var vue_runtime_esm = __webpack_require__(144);
;// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"678726f0-vue-loader-template"}!./node_modules/@vue/vue-loader-v15/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/cache-loader/dist/cjs.js??ruleSet[0].rules[0].use[0]!./node_modules/@vue/vue-loader-v15/lib/index.js??vue-loader-options!./src/App.vue?vue&type=template&id=8f0490b8&
var render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-app',{attrs:{"id":"app"},on:{"skip-warmup":_vm.skipWarmup}},[_c('UserFacingScreening',{attrs:{"on-reference-device":_vm.isReferenceDevice,"state":_vm.appState.currentScreeningState,"screening-event":_vm.appState.currentScreeningEvent,"calibration":_vm.appState.currentCalibration,"face":_vm.face,"warmup-seconds-remaining":_vm.remainingWarmupTime,"shapes":[_vm.prevShape, _vm.nextShape],"isTesting":!_vm.useLiveCamera,"thermal-ref-side":_vm.thermalRefSide,"showCanvas":!_vm.qrMode || !_vm.finishScan || (_vm.finishScan && _vm.registered)}}),_c('v-dialog',{attrs:{"width":"500"},model:{value:(_vm.showSoftwareVersionUpdatedPrompt),callback:function ($$v) {_vm.showSoftwareVersionUpdatedPrompt=$$v},expression:"showSoftwareVersionUpdatedPrompt"}},[_c('v-card',[_c('v-card-title',[_vm._v(" This software has been updated. "+_vm._s(_vm.appVersion)+" ")]),_c('v-card-actions',{attrs:{"center":""}},[_c('v-btn',{attrs:{"text":""},on:{"click":function (e) { return (_vm.showSoftwareVersionUpdatedPrompt = false); }}},[_vm._v(" Proceed ")])],1)],1)],1),_c('v-overlay',{attrs:{"absolute":"","width":"500"},model:{value:(_vm.isNotGettingFrames),callback:function ($$v) {_vm.isNotGettingFrames=$$v},expression:"isNotGettingFrames"}},[_c('v-card',[_c('v-card-title',[_vm._v("Waiting for camera input...")])],1)],1),_c('v-snackbar',{model:{value:(_vm.showUpdatedCalibrationSnackbar),callback:function ($$v) {_vm.showUpdatedCalibrationSnackbar=$$v},expression:"showUpdatedCalibrationSnackbar"}},[_vm._v(" Calibration was updated ")]),(_vm.qrMode && _vm.finishScan && !_vm.registered)?_c('QRVideo',{attrs:{"setQRCode":_vm.setQRCode}}):_vm._e(),_c('transition',{attrs:{"name":"fade"}},[(_vm.qrMode && _vm.finishScan)?_c('QRImage',{attrs:{"registered":_vm.registered}}):_vm._e()],1),(!_vm.isReferenceDevice)?_c('div',{staticClass:"debug-video"},[(_vm.appState.currentFrame)?_c('VideoStream',{attrs:{"frame":_vm.appState.currentFrame.frame,"face":_vm.appState.face,"min":_vm.appState.currentFrame.analysisResult.heatStats.min,"max":_vm.appState.currentFrame.analysisResult.heatStats.max,"crop-box":{ Left: 0, Right: 0, Top: 0, Bottom: 0 },"crop-enabled":false,"draw-overlays":false,"show-coords":false}}):_vm._e()],1):_vm._e()],1)}
var staticRenderFns = []


// EXTERNAL MODULE: ./node_modules/tslib/tslib.es6.js
var tslib_es6 = __webpack_require__(655);
;// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"678726f0-vue-loader-template"}!./node_modules/@vue/vue-loader-v15/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/cache-loader/dist/cjs.js??ruleSet[0].rules[0].use[0]!./node_modules/@vue/vue-loader-v15/lib/index.js??vue-loader-options!./src/components/UserFacingScreening.vue?vue&type=template&id=19846409&scoped=true&
var UserFacingScreeningvue_type_template_id_19846409_scoped_true_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"user-state",class:[
    _vm.classNameForState,
    _vm.screeningResultClass,
    { 'mini-view': !_vm.onReferenceDevice } ],style:({ background: _vm.warmupBackgroundColour }),attrs:{"id":"user-facing-screening"},on:{"click":function($event){_vm.interacted = true}}},[_c('canvas',{ref:"beziers",attrs:{"hidden":!_vm.showCanvas || _vm.isWarmingUp,"id":"beziers","width":"710","height":"1080"}}),_c('div',{staticClass:"center",class:{ 'warming-up': _vm.isWarmingUp }},[(_vm.hasScreeningResult)?_c('div',{class:['result', { 'should-leave-frame': _vm.shouldLeaveFrame }]},[_vm._v(" "+_vm._s(_vm.temperature)+" "),_c('br'),(_vm.shouldLeaveFrame)?_c('span',[_vm._v(_vm._s(_vm.screeningAdvice))]):_vm._e(),_c('br')]):_c('div',{domProps:{"innerHTML":_vm._s(_vm.messageText)}})]),(_vm.onReferenceDevice || _vm.isLocal)?_c('v-card',{staticClass:"settings-toggle-button",class:{ interacted: _vm.interacted },attrs:{"dark":"","flat":"","height":"44","tile":"","color":"transparent"}},[_c('v-card-actions',[_c('v-btn',{attrs:{"absolute":"","dark":"","fab":"","bottom":"","right":"","elevation":"0","color":"transparent"},on:{"click":function (e) {
            if (_vm.interacted) {
              _vm.showSettings = true;
              _vm.hasSettings = true;
            }
          }}},[_c('v-icon',{attrs:{"color":"rgba(255, 255, 255, 0.5)","large":""}},[_vm._v(_vm._s(_vm.cogIcon))])],1)],1)],1):_vm._e(),_c('v-dialog',{attrs:{"hide-overlay":"","attach":"#user-facing-screening","fullscreen":"","transition":"dialog-bottom-transition"},model:{value:(_vm.showSettings),callback:function ($$v) {_vm.showSettings=$$v},expression:"showSettings"}},[(_vm.hasSettings)?_c('AdminSettings',{on:{"closed":_vm.closedAdminSettings}}):_vm._e()],1)],1)}
var UserFacingScreeningvue_type_template_id_19846409_scoped_true_staticRenderFns = []


// EXTERNAL MODULE: ./node_modules/vue-property-decorator/lib/vue-property-decorator.js + 1 modules
var vue_property_decorator = __webpack_require__(4775);
// EXTERNAL MODULE: ./node_modules/@mdi/js/mdi.js
var mdi = __webpack_require__(5317);
;// CONCATENATED MODULE: ./src/types.ts
const DEFAULT_THRESHOLD_MIN_FEVER = 37.5;
const types_FactoryDefaultCalibration = {
  ThermalRefTemp: 37.87441329956055,
  SnapshotTime: 0,
  TemperatureCelsius: 37.5,
  SnapshotValue: 30197.9765625,
  ThresholdMinFever: DEFAULT_THRESHOLD_MIN_FEVER,
  HeadBLX: 0,
  HeadBLY: 0,
  HeadBRX: 0,
  HeadBRY: 0,
  HeadTLX: 0,
  HeadTLY: 0,
  HeadTRX: 0,
  HeadTRY: 0,
  CalibrationBinaryVersion: "abcde",
  UuidOfUpdater: 432423432432,
  UseNormalSound: true,
  UseWarningSound: true,
  UseErrorSound: true
};
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
  ScreeningState["BLURRED"] = "BLURRED";
  ScreeningState["AFTER_FFC_EVENT"] = "AFTER_FFC_EVENT";
})(ScreeningState || (ScreeningState = {}));

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
  Calibration: types_FactoryDefaultCalibration
};

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

    case 10:
      screeningState = ScreeningState.BLURRED;
      break;

    case 11:
      screeningState = ScreeningState.AFTER_FFC_EVENT;
      break;
  }

  return screeningState;
}

function extractResult(analysisResult) {
  const f = analysisResult.face;
  const h = f.head;
  const tL = h.topLeft;
  const tR = h.topRight;
  const bL = h.bottomLeft;
  const bR = h.bottomRight;
  const sP = f.samplePoint;
  const hS = analysisResult.heatStats;
  const ref = analysisResult.thermalReference;
  const geom = analysisResult.thermalReference.geom;
  const cP = geom.center;
  const copiedAnalysisResult = {
    face: {
      headLock: f.headLock,
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
      sampleTemp: f.sampleTemp,
      sampleValue: f.sampleValue,
      halfwayRatio: f.halfwayRatio,
      isValid: f.isValid
    },
    frameBottomSum: analysisResult.frameBottomSum,
    motionSum: analysisResult.motionSum,
    heatStats: {
      threshold: hS.threshold,
      min: hS.min,
      max: hS.max
    },
    motionThresholdSum: analysisResult.motionThresholdSum,
    thresholdSum: analysisResult.thresholdSum,
    nextState: getScreeningState(analysisResult.nextState),
    hasBody: analysisResult.hasBody,
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
;// CONCATENATED MODULE: ./src/utils.ts
const utils_BlobReader = function () {
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

      if (binaryVersion && appVersion && (prevVersion.binaryVersion != binaryVersion || prevVersion.appVersion != appVersion)) {
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
;// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"678726f0-vue-loader-template"}!./node_modules/@vue/vue-loader-v15/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/cache-loader/dist/cjs.js??ruleSet[0].rules[0].use[0]!./node_modules/@vue/vue-loader-v15/lib/index.js??vue-loader-options!./src/components/AdminSettings.vue?vue&type=template&id=dc077da8&scoped=true&
var AdminSettingsvue_type_template_id_dc077da8_scoped_true_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-card',[_c('v-toolbar',{attrs:{"color":"light-blue","dark":""},scopedSlots:_vm._u([{key:"extension",fn:function(){return [_c('v-tabs',{attrs:{"centered":""},model:{value:(_vm.tab),callback:function ($$v) {_vm.tab=$$v},expression:"tab"}},_vm._l((_vm.tabItems),function(item){return _c('v-tab',{key:item.tab},[_vm._v(_vm._s(item.tab))])}),1)]},proxy:true}])},[_c('v-toolbar-title',[_vm._v("Settings")]),_c('v-spacer'),_c('v-btn',{attrs:{"text":""},on:{"click":_vm.close}},[_vm._v(" close ")])],1),_c('v-tabs-items',{attrs:{"touchless":""},model:{value:(_vm.tab),callback:function ($$v) {_vm.tab=$$v},expression:"tab"}},_vm._l((_vm.tabItems),function(item){return _c('v-tab-item',{key:item.tab},[_c(item.content,{tag:"component"})],1)}),1)],1)}
var AdminSettingsvue_type_template_id_dc077da8_scoped_true_staticRenderFns = []


;// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"678726f0-vue-loader-template"}!./node_modules/@vue/vue-loader-v15/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/cache-loader/dist/cjs.js??ruleSet[0].rules[0].use[0]!./node_modules/@vue/vue-loader-v15/lib/index.js??vue-loader-options!./src/components/CalibrationSettings.vue?vue&type=template&id=bf659bf4&scoped=true&
var CalibrationSettingsvue_type_template_id_bf659bf4_scoped_true_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-card',{attrs:{"height":"calc(100vh - 112px)"}},[_c('v-container',{staticClass:"cont"},[_c('v-card',{staticClass:"split",attrs:{"flat":""}},[_c('v-card',[(_vm.state.currentFrame)?_c('VideoStream',{attrs:{"frame":_vm.state.currentFrame.frame,"face":_vm.state.face,"crop-box":_vm.editedCropBox,"thermal-ref":_vm.state.currentFrame.analysisResult.thermalRef.geom,"min":_vm.state.currentFrame.analysisResult.heatStats.min,"max":_vm.state.currentFrame.analysisResult.heatStats.max,"crop-enabled":false}}):_vm._e()],1),_c('v-card',{staticClass:"settings",attrs:{"width":"700"}},[_c('v-card-title',[_vm._v(" Calibration: "+_vm._s(_vm.pendingCalibration)+" "),_c('v-btn',{attrs:{"text":"","disabled":!_vm.canCalibrate},on:{"click":function($event){$event.stopPropagation();return (function () { return _vm.editCalibration(); })($event)}}},[_c('v-icon',{attrs:{"color":"#999","small":""}},[_vm._v(_vm._s(_vm.pencilIcon))]),_vm._v(" Edit ")],1)],1),_c('v-dialog',{attrs:{"max-width":"400"},model:{value:(_vm.showCalibrationDialog),callback:function ($$v) {_vm.showCalibrationDialog=$$v},expression:"showCalibrationDialog"}},[_c('v-card',[_c('v-card-title',[_vm._v("Edit calibration")]),_c('v-container',[(_vm.snapshotScreeningEvent)?_c('VideoStream',{attrs:{"frame":_vm.snapshotScreeningEvent.frame.frame,"face":_vm.snapshotScreeningEvent.face,"min":_vm.state.currentFrame.analysisResult.heatStats.min,"max":_vm.state.currentFrame.analysisResult.heatStats.max,"crop-box":_vm.state.currentCalibration.cropBox,"crop-enabled":false,"draw-overlays":true,"scale":0.6}}):_vm._e()],1),_c('v-card-subtitle',[_vm._v(" Take your temperature and enter it here to calibrate the system against the current screening event. ")]),_c('v-card-text',[_c('v-text-field',{attrs:{"label":"calibrated temperature","value":_vm.editedCalibration},on:{"blur":_vm.updateCalibration}}),_c('v-card-actions',[_c('v-btn',{on:{"click":function () { return _vm.incrementCalibration(0.1); }}},[_c('v-icon',{attrs:{"light":""}},[_vm._v(_vm._s(_vm.plusIcon))])],1),_c('v-spacer'),_c('v-btn',{on:{"click":function () { return _vm.incrementCalibration(-0.1); }}},[_c('v-icon',{attrs:{"light":""}},[_vm._v(_vm._s(_vm.minusIcon))])],1)],1)],1),_c('v-card-actions',[_c('v-spacer'),_c('v-btn',{attrs:{"text":"","color":"grey darken-1"},on:{"click":function($event){_vm.showCalibrationDialog = false}}},[_vm._v(" Cancel ")]),_c('v-btn',{attrs:{"text":"","color":"green darken-1"},on:{"click":function (e) { return _vm.acceptCalibration(); }}},[_vm._v(" Accept ")])],1)],1)],1),_c('v-card-text',[_c('v-checkbox',{attrs:{"label":"Use custom alert threshold"},on:{"change":_vm.toggleCustomTemperatureThresholds},model:{value:(_vm.useCustomTemperatureRange),callback:function ($$v) {_vm.useCustomTemperatureRange=$$v},expression:"useCustomTemperatureRange"}}),_c('v-card-text',[_c('v-slider',{attrs:{"disabled":!_vm.useCustomTemperatureRange,"min":"30","max":"40","step":"0.1","thumb-label":"","ticks":true,"color":'green',"track-color":'rgba(255, 0, 0, 0.25)'},on:{"change":function (e) { return _vm.persistSettings(); }},model:{value:(_vm.editedTemperatureThreshold),callback:function ($$v) {_vm.editedTemperatureThreshold=$$v},expression:"editedTemperatureThreshold"}}),_c('span',{staticClass:"selected-temp-range",domProps:{"innerHTML":_vm._s(_vm.selectedTemperatureRange)}})],1)],1),_c('v-card-title',[_vm._v("Sounds:")]),_c('v-container',{attrs:{"fluid":"","width":"100%"}},[_c('v-row',[_c('v-col',{attrs:{"cols":"4"}},[_c('v-switch',{attrs:{"label":"Play normal sound"},on:{"change":function (e) { return _vm.persistSettings(); }},model:{value:(_vm.playNormalSound),callback:function ($$v) {_vm.playNormalSound=$$v},expression:"playNormalSound"}})],1),_c('v-col',{attrs:{"cols":"4"}},[_c('v-switch',{attrs:{"label":"Play warning sound"},on:{"change":function (e) { return _vm.persistSettings(); }},model:{value:(_vm.playWarningSound),callback:function ($$v) {_vm.playWarningSound=$$v},expression:"playWarningSound"}})],1),_c('v-col',{attrs:{"cols":"4"}},[_c('v-switch',{attrs:{"label":"Play error sound"},on:{"change":function (e) { return _vm.persistSettings(); }},model:{value:(_vm.playErrorSound),callback:function ($$v) {_vm.playErrorSound=$$v},expression:"playErrorSound"}})],1)],1)],1)],1)],1),_c('v-overlay',{attrs:{"value":_vm.saving,"light":""}},[_vm._v(" Saving settings ")])],1)],1)}
var CalibrationSettingsvue_type_template_id_bf659bf4_scoped_true_staticRenderFns = []


;// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"678726f0-vue-loader-template"}!./node_modules/@vue/vue-loader-v15/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/cache-loader/dist/cjs.js??ruleSet[0].rules[0].use[0]!./node_modules/@vue/vue-loader-v15/lib/index.js??vue-loader-options!./src/components/VideoStream.vue?vue&type=template&id=89fc6c86&scoped=true&
var VideoStreamvue_type_template_id_89fc6c86_scoped_true_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{ref:"container",class:{ recording: _vm.recording },attrs:{"id":"video-stream-container"}},[_c('canvas',{ref:"cameraStream",attrs:{"id":"camera-stream","width":"160","height":"120"}}),_c('canvas',{ref:"vizOverlay",attrs:{"id":"debug-overlay","width":"480","height":"640"}}),(_vm.canEditCropping && _vm.cropEnabled)?_c('video-crop-controls',{attrs:{"crop-box":_vm.cropBox},on:{"crop-changed":_vm.gotCropChange}}):_vm._e(),(_vm.cropEnabled)?_c('v-btn',{class:{ on: _vm.canEditCropping },attrs:{"text":"","title":"Edit cropping","id":"toggle-cropping","dark":""},on:{"click":_vm.toggleCropping}},[_c('v-icon',[_vm._v(_vm._s(_vm.cropIcon))])],1):_vm._e(),(_vm.showCoords)?_c('p',{staticClass:"coords"},[_vm._v("("+_vm._s(_vm.coords.x)+", "+_vm._s(_vm.coords.y)+")")]):_vm._e()],1)}
var VideoStreamvue_type_template_id_89fc6c86_scoped_true_staticRenderFns = []


;// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"678726f0-vue-loader-template"}!./node_modules/@vue/vue-loader-v15/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/cache-loader/dist/cjs.js??ruleSet[0].rules[0].use[0]!./node_modules/@vue/vue-loader-v15/lib/index.js??vue-loader-options!./src/components/VideoCropControls.vue?vue&type=template&id=60b9dd6c&scoped=true&
var VideoCropControlsvue_type_template_id_60b9dd6c_scoped_true_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{ref:"box",attrs:{"id":"fov-box"}},[_c('div',[_c('div',{ref:"top",staticClass:"fov-handle",attrs:{"id":"top-handle"},on:{"mousedown":function (e) { return _vm.startDrag(e); },"mouseup":function (e) { return _vm.endDrag(e); },"touchstart":function (e) { return _vm.startDrag(e); },"touchend":function (e) { return _vm.endDrag(e); }}},[_c('svg',{attrs:{"xmlns":"http://www.w3.org/2000/svg","viewBox":"0 0 256 512"}},[_c('path',{attrs:{"fill":"currentColor","d":"M214.059 377.941H168V134.059h46.059c21.382 0 32.09-25.851 16.971-40.971L144.971 7.029c-9.373-9.373-24.568-9.373-33.941 0L24.971 93.088c-15.119 15.119-4.411 40.971 16.971 40.971H88v243.882H41.941c-21.382 0-32.09 25.851-16.971 40.971l86.059 86.059c9.373 9.373 24.568 9.373 33.941 0l86.059-86.059c15.12-15.119 4.412-40.971-16.97-40.971z"}})])]),_c('div',{ref:"left",staticClass:"fov-handle",attrs:{"id":"left-handle"},on:{"mousedown":function (e) { return _vm.startDrag(e); },"mouseup":function (e) { return _vm.endDrag(e); },"touchstart":function (e) { return _vm.startDrag(e); },"touchend":function (e) { return _vm.endDrag(e); }}},[_c('svg',{attrs:{"xmlns":"http://www.w3.org/2000/svg","viewBox":"0 0 512 512"}},[_c('path',{attrs:{"fill":"currentColor","d":"M377.941 169.941V216H134.059v-46.059c0-21.382-25.851-32.09-40.971-16.971L7.029 239.029c-9.373 9.373-9.373 24.568 0 33.941l86.059 86.059c15.119 15.119 40.971 4.411 40.971-16.971V296h243.882v46.059c0 21.382 25.851 32.09 40.971 16.971l86.059-86.059c9.373-9.373 9.373-24.568 0-33.941l-86.059-86.059c-15.119-15.12-40.971-4.412-40.971 16.97z"}})])]),_c('div',{ref:"right",staticClass:"fov-handle",attrs:{"id":"right-handle"},on:{"mousedown":function (e) { return _vm.startDrag(e); },"mouseup":function (e) { return _vm.endDrag(e); },"touchstart":function (e) { return _vm.startDrag(e); },"touchend":function (e) { return _vm.endDrag(e); }}},[_c('svg',{attrs:{"xmlns":"http://www.w3.org/2000/svg","viewBox":"0 0 512 512"}},[_c('path',{attrs:{"fill":"currentColor","d":"M377.941 169.941V216H134.059v-46.059c0-21.382-25.851-32.09-40.971-16.971L7.029 239.029c-9.373 9.373-9.373 24.568 0 33.941l86.059 86.059c15.119 15.119 40.971 4.411 40.971-16.971V296h243.882v46.059c0 21.382 25.851 32.09 40.971 16.971l86.059-86.059c9.373-9.373 9.373-24.568 0-33.941l-86.059-86.059c-15.119-15.12-40.971-4.412-40.971 16.97z"}})])]),_c('div',{ref:"bottom",staticClass:"fov-handle",attrs:{"id":"bottom-handle"},on:{"mousedown":function (e) { return _vm.startDrag(e); },"mouseup":function (e) { return _vm.endDrag(e); },"touchstart":function (e) { return _vm.startDrag(e); },"touchend":function (e) { return _vm.endDrag(e); }}},[_c('svg',{attrs:{"xmlns":"http://www.w3.org/2000/svg","viewBox":"0 0 256 512"}},[_c('path',{attrs:{"fill":"currentColor","d":"M214.059 377.941H168V134.059h46.059c21.382 0 32.09-25.851 16.971-40.971L144.971 7.029c-9.373-9.373-24.568-9.373-33.941 0L24.971 93.088c-15.119 15.119-4.411 40.971 16.971 40.971H88v243.882H41.941c-21.382 0-32.09 25.851-16.971 40.971l86.059 86.059c9.373 9.373 24.568 9.373 33.941 0l86.059-86.059c15.12-15.119 4.412-40.971-16.97-40.971z"}})])])])])}
var VideoCropControlsvue_type_template_id_60b9dd6c_scoped_true_staticRenderFns = []


;// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??clonedRuleSet-40[0].rules[0].use[0]!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib/index.js!./node_modules/ts-loader/index.js??clonedRuleSet-40[0].rules[0].use[3]!./node_modules/cache-loader/dist/cjs.js??ruleSet[0].rules[0].use[0]!./node_modules/@vue/vue-loader-v15/lib/index.js??vue-loader-options!./src/components/VideoCropControls.vue?vue&type=script&lang=ts&


let VideoCropControls = class VideoCropControls extends vue_property_decorator/* Vue */.w3 {
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

(0,tslib_es6/* __decorate */.gn)([(0,vue_property_decorator/* Prop */.fI)({
  required: true
})], VideoCropControls.prototype, "cropBox", void 0);

VideoCropControls = (0,tslib_es6/* __decorate */.gn)([vue_property_decorator/* Component */.wA], VideoCropControls);
/* harmony default export */ const VideoCropControlsvue_type_script_lang_ts_ = (VideoCropControls);
;// CONCATENATED MODULE: ./src/components/VideoCropControls.vue?vue&type=script&lang=ts&
 /* harmony default export */ const components_VideoCropControlsvue_type_script_lang_ts_ = (VideoCropControlsvue_type_script_lang_ts_); 
// EXTERNAL MODULE: ./node_modules/@vue/vue-loader-v15/lib/runtime/componentNormalizer.js
var componentNormalizer = __webpack_require__(1001);
;// CONCATENATED MODULE: ./src/components/VideoCropControls.vue



;


/* normalize component */

var component = (0,componentNormalizer/* default */.Z)(
  components_VideoCropControlsvue_type_script_lang_ts_,
  VideoCropControlsvue_type_template_id_60b9dd6c_scoped_true_render,
  VideoCropControlsvue_type_template_id_60b9dd6c_scoped_true_staticRenderFns,
  false,
  null,
  "60b9dd6c",
  null
  
)

/* harmony default export */ const components_VideoCropControls = (component.exports);
;// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??clonedRuleSet-40[0].rules[0].use[0]!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib/index.js!./node_modules/ts-loader/index.js??clonedRuleSet-40[0].rules[0].use[3]!./node_modules/cache-loader/dist/cjs.js??ruleSet[0].rules[0].use[0]!./node_modules/@vue/vue-loader-v15/lib/index.js??vue-loader-options!./src/components/VideoStream.vue?vue&type=script&lang=ts&




let VideoStream = class VideoStream extends vue_property_decorator/* Vue */.w3 {
  constructor() {
    super(...arguments);
    this.canEditCropping = false;
    this.coords = {
      x: 0,
      y: 0
    };
  }

  get cropIcon() {
    return mdi/* mdiCrop */.J_s;
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

    if (this.thermalRef) {
      context.save();
      const scaleX = canvasWidth / (underlay.height * window.devicePixelRatio);
      const scaleY = canvasHeight / (underlay.width * window.devicePixelRatio);
      context.scale(scaleX, scaleY);
      context.fillStyle = "rgba(255, 0, 0, 0.4)";
      context.beginPath();
      context.arc(this.thermalRef.center.x, this.thermalRef.center.y, this.thermalRef.radius, 0, Math.PI * 2);
      context.fill();
      context.restore();
    }

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
    /*
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
      overlay.rect(
          cropBox.x0 * ratio,
          cropBox.y0 * ratio,
          (cropBox.x1 - cropBox.x0) * ratio,
          (cropBox.y1 - cropBox.y0) * ratio
      );
      context.fillStyle = "rgba(0, 0, 0, 0.5)";
      context.fill(overlay, "evenodd");
    }
    context.restore();
    */

  }

  get cropBoxPixelBounds() {
    const cropBox = this.cropBox;
    const width = 120;
    const height = 160;
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

(0,tslib_es6/* __decorate */.gn)([(0,vue_property_decorator/* Prop */.fI)()], VideoStream.prototype, "frame", void 0);

(0,tslib_es6/* __decorate */.gn)([(0,vue_property_decorator/* Prop */.fI)({
  required: true
})], VideoStream.prototype, "min", void 0);

(0,tslib_es6/* __decorate */.gn)([(0,vue_property_decorator/* Prop */.fI)({
  required: true
})], VideoStream.prototype, "max", void 0);

(0,tslib_es6/* __decorate */.gn)([(0,vue_property_decorator/* Prop */.fI)({
  required: true
})], VideoStream.prototype, "face", void 0);

(0,tslib_es6/* __decorate */.gn)([(0,vue_property_decorator/* Prop */.fI)({
  required: true
})], VideoStream.prototype, "cropBox", void 0);

(0,tslib_es6/* __decorate */.gn)([(0,vue_property_decorator/* Prop */.fI)({
  required: true
})], VideoStream.prototype, "cropEnabled", void 0);

(0,tslib_es6/* __decorate */.gn)([(0,vue_property_decorator/* Prop */.fI)({
  default: 1.0
})], VideoStream.prototype, "scale", void 0);

(0,tslib_es6/* __decorate */.gn)([(0,vue_property_decorator/* Prop */.fI)({
  required: false
})], VideoStream.prototype, "thermalRef", void 0);

(0,tslib_es6/* __decorate */.gn)([(0,vue_property_decorator/* Prop */.fI)({
  default: false
})], VideoStream.prototype, "drawOverlays", void 0);

(0,tslib_es6/* __decorate */.gn)([(0,vue_property_decorator/* Prop */.fI)({
  default: false
})], VideoStream.prototype, "recording", void 0);

(0,tslib_es6/* __decorate */.gn)([(0,vue_property_decorator/* Prop */.fI)({
  default: false
})], VideoStream.prototype, "showCoords", void 0);

(0,tslib_es6/* __decorate */.gn)([(0,vue_property_decorator/* Watch */.RL)("frame")], VideoStream.prototype, "onFrameUpdate", null);

(0,tslib_es6/* __decorate */.gn)([(0,vue_property_decorator/* Watch */.RL)("face")], VideoStream.prototype, "onFaceChanged", null);

(0,tslib_es6/* __decorate */.gn)([(0,vue_property_decorator/* Watch */.RL)("thermalReference")], VideoStream.prototype, "onThermalReferenceChanged", null);

(0,tslib_es6/* __decorate */.gn)([(0,vue_property_decorator/* Watch */.RL)("cropBox")], VideoStream.prototype, "onCropChanged", null);

(0,tslib_es6/* __decorate */.gn)([(0,vue_property_decorator/* Emit */.y1)("crop-changed")], VideoStream.prototype, "gotCropChange", null);

VideoStream = (0,tslib_es6/* __decorate */.gn)([(0,vue_property_decorator/* Component */.wA)({
  components: {
    VideoCropControls: components_VideoCropControls
  }
})], VideoStream);
/* harmony default export */ const VideoStreamvue_type_script_lang_ts_ = (VideoStream);
;// CONCATENATED MODULE: ./src/components/VideoStream.vue?vue&type=script&lang=ts&
 /* harmony default export */ const components_VideoStreamvue_type_script_lang_ts_ = (VideoStreamvue_type_script_lang_ts_); 
// EXTERNAL MODULE: ./node_modules/vuetify-loader/lib/runtime/installComponents.js
var installComponents = __webpack_require__(3453);
var installComponents_default = /*#__PURE__*/__webpack_require__.n(installComponents);
// EXTERNAL MODULE: ./node_modules/vuetify/lib/components/VBtn/VBtn.js + 2 modules
var VBtn = __webpack_require__(6462);
// EXTERNAL MODULE: ./node_modules/vuetify/lib/components/VIcon/VIcon.js + 1 modules
var VIcon = __webpack_require__(3428);
;// CONCATENATED MODULE: ./src/components/VideoStream.vue



;


/* normalize component */

var VideoStream_component = (0,componentNormalizer/* default */.Z)(
  components_VideoStreamvue_type_script_lang_ts_,
  VideoStreamvue_type_template_id_89fc6c86_scoped_true_render,
  VideoStreamvue_type_template_id_89fc6c86_scoped_true_staticRenderFns,
  false,
  null,
  "89fc6c86",
  null
  
)

/* harmony default export */ const components_VideoStream = (VideoStream_component.exports);

/* vuetify-loader */
;


installComponents_default()(VideoStream_component, {VBtn: VBtn/* default */.Z,VIcon: VIcon/* default */.Z})

;// CONCATENATED MODULE: ./src/api/api.ts
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const API_BASE = "https://ixg63w0770.execute-api.ap-southeast-2.amazonaws.com/event";

const DEVICE_ENDPOINT = deviceId => `https://3pu8ojk2ej.execute-api.ap-southeast-2.amazonaws.com/default/devices/${deviceId}`;

const ExternalDeviceSettingsApi = {
  async getDevice(deviceId) {
    const request = fetch(DEVICE_ENDPOINT(deviceId), {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });
    const response = await request;

    if (response.status === 200) {
      const body = await response.json();
      return body;
    } else {
      console.error(response);
    }
  }

};
const ScreeningApi = {
  async recordScreeningEvent(deviceId, deviceSerial, data, feverMinThresholdAtRecordingTime, QRID) {
    if (deviceId !== "") {
      const appVersion = data.frame.frameInfo.AppVersion;
      const Channel = appVersion.includes("beta") || appVersion.includes("nightly") ? "beta" : "stable";
      const request = fetch(API_BASE, {
        method: "POST",
        body: JSON.stringify(_objectSpread({
          Channel,
          CameraID: `${deviceId}`,
          Type: "Screen",
          Timestamp: data.timestamp.toISOString().replace(/:/g, "_").replace(/\./g, "_"),
          DisplayedTemperature: data.calculatedValue,
          AppVersion: appVersion,
          FeverThreshold: feverMinThresholdAtRecordingTime,
          Meta: {
            Face: {
              tL: data.face.head.topLeft,
              tR: data.face.head.topRight,
              bL: data.face.head.bottomLeft,
              bR: data.face.head.bottomRight
            },
            Sample: {
              x: data.sampleX,
              y: data.sampleY
            },
            SampleRaw: Math.round(data.rawTemperatureValue),
            RefTemp: data.thermalReference.temp,
            RefRaw: data.thermalReference.val,
            Telemetry: data.frame.frameInfo.Telemetry
          }
        }, QRID && {
          QRID
        }))
      });
      const response = await request;
      const presignedUrl = await response.text(); // Based on the user, we find out whether or not to upload a reference image.

      if (presignedUrl) {
        // Upload to s3
        fetch(presignedUrl, {
          method: "PUT",
          body: data.frame.frame,
          headers: {
            "Content-Type": "application/octet-stream",
            "Content-Encoding": "utf8"
          }
        });
      }
    } else {
      console.error("Can't send telemetry, missing deviceId");
    }
  },

  async recordCalibrationEvent(deviceId, deviceSerial, calibrationChanged, thresholdChanged, calibration, frame, x, y) {
    if (deviceId !== "") {
      const appVersion = frame.frameInfo.AppVersion;
      const Channel = appVersion.includes("beta") || appVersion.includes("nightly") ? "beta" : "stable";
      const calibrationPayload = {
        Channel,
        CameraID: `${deviceId}`,
        Type: "Calibrate",
        Timestamp: calibration.timestamp.toISOString().replace(/:/g, "_").replace(/\./g, "_"),
        CalibratedTemp: parseFloat(calibration.calibrationTemperature.val.toFixed(2)),
        MinFeverThreshold: calibration.thresholdMinFever,
        ThermalRefTemp: parseFloat(calibration.thermalRefTemperature.val.toFixed(2)),
        AppVersion: appVersion,
        Meta: {
          Face: calibration.head,
          Sample: {
            x,
            y
          },
          SampleRaw: Math.round(calibration.hotspotRawTemperatureValue),
          RefRaw: Math.round(calibration.thermalReferenceRawValue),
          Telemetry: frame.frameInfo.Telemetry
        }
      };
      const request = fetch(API_BASE, {
        method: "POST",
        body: JSON.stringify(calibrationPayload)
      });
      const response = await request; // Only upload an image if calibration changed, not threshold.

      if (response.status === 200 && calibrationChanged) {
        const presignedUrl = await response.text(); // Based on the user, we find out whether or not to upload a reference image.

        if (presignedUrl) {
          // Upload to s3
          fetch(presignedUrl, {
            method: "PUT",
            body: frame.frame,
            headers: {
              "Content-Type": "application/octet-stream",
              "Content-Encoding": "utf8"
            }
          });
        }
      }
    } else {
      console.error("Can't sent calibration event, missing deviceId");
    }
  }

};
const DeviceApi = {
  // Allows videos recorded based on activity.
  recordUserActivity: false,
  disableRecordUserActivity: true,
  registerQRID: false,

  get DisableRecordUserActivity() {
    return this.disableRecordUserActivity;
  },

  set DisableRecordUserActivity(disable) {
    this.disableRecordUserActivity = disable;
    this.stopRecording(false);
  },

  get RegisterQRID() {
    return this.registerQRID;
  },

  set RegisterQRID(enable) {
    this.registerQRID = enable;
    window.localStorage.setItem("registerQRID", enable ? "true" : "false");
  },

  get RecordUserActivity() {
    return this.recordUserActivity;
  },

  set RecordUserActivity(enable) {
    this.recordUserActivity = enable;
    window.localStorage.setItem("recordUserActivity", enable ? "true" : "false");
    this.stopRecording(false);
  },

  get debugPrefix() {
    if ((window.location.port === "8080" || window.location.port === "5000") && "production" === "development") {
      // Used for developing the front-end against an externally running version of the
      // backend, so it's not necessary to package up the build to do front-end testing.
      //return "http://localhost:2041";
      //return "http://192.168.178.37";
      return "http://192.168.0.181"; //return "http://192.168.0.82";
      //return "http://192.168.178.21";
      //return "http://192.168.0.41";
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

  get RUN_FFC() {
    return `${this.debugPrefix}/api/camera/run-ffc`;
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

  get STOP_RECORDING() {
    return `${this.debugPrefix}/record?stop=true&dowload=false`;
  },

  get DOWNLOAD_RECORDING() {
    return `${this.debugPrefix}/record?stop=true&download=true`;
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

  async put(url) {
    return fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Basic ${btoa("admin:feathers")}`,
        "Content-Type": "application/x-www-form-urlencoded"
      }
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

  async stopRecording(download = true) {
    const result = await this.getText(download ? this.DOWNLOAD_RECORDING : this.STOP_RECORDING);
    return result;
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

  async runFFC() {
    console.log("Request FFC");
    return this.put(this.RUN_FFC);
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
;// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??clonedRuleSet-40[0].rules[0].use[0]!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib/index.js!./node_modules/ts-loader/index.js??clonedRuleSet-40[0].rules[0].use[3]!./node_modules/cache-loader/dist/cjs.js??ruleSet[0].rules[0].use[0]!./node_modules/@vue/vue-loader-v15/lib/index.js??vue-loader-options!./src/components/CalibrationSettings.vue?vue&type=script&lang=ts&








let CalibrationSettings = class CalibrationSettings extends vue_property_decorator/* Vue */.w3 {
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
    this.deviceID = "";
    this.piSerial = "";
    this.saving = false;
  }

  toggleCustomTemperatureThresholds(val) {
    if (val) {
      this.editedTemperatureThreshold = this.state.currentCalibration.thresholdMinFever;
    }

    if (!val) {
      this.editedTemperatureThreshold = DEFAULT_THRESHOLD_MIN_FEVER;
    }

    this.persistSettings(); // Update custom back to defaults
  }

  get selectedTemperatureRange() {
    return `${new DegreesCelsius(this.editedTemperatureThreshold)}`;
  }

  get hasMadeEdits() {
    const unedited = {
      head: this.state.currentCalibration.head,
      temperatureThreshold: this.state.currentCalibration.thresholdMinFever,
      calibration: parseFloat(this.state.currentCalibration.calibrationTemperature.val.toFixed(2)),
      sounds: {
        warning: this.state.currentCalibration.playWarningSound,
        normal: this.state.currentCalibration.playNormalSound,
        error: this.state.currentCalibration.playErrorSound
      }
    };
    const edited = {
      head: this.state.currentCalibration.head,
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
    return mdi/* mdiPlus */.qX5;
  }

  get pencilIcon() {
    return mdi/* mdiPencil */.r9;
  }

  get minusIcon() {
    return mdi/* mdiMinus */.UHA;
  }

  get state() {
    return State;
  }

  get canCalibrate() {
    return this.latestScreeningEvent !== null;
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
    await this.persistSettings();
  }

  async persistSettings() {
    // Get these values from the current screening event.
    const currentCalibration = this.pendingCalibration;
    let thermalRefTemp = this.state.currentCalibration.thermalRefTemperature.val;
    let thermalRefRaw = this.state.currentCalibration.thermalReferenceRawValue;
    let rawTempValue = this.state.currentCalibration.hotspotRawTemperatureValue;
    const thresholdMinFever = this.editedTemperatureThreshold;
    let sampleX = -1;
    let sampleY = -1;
    let frame = this.state.currentFrame;
    let head = {
      tL: {
        x: 0,
        y: 0
      },
      tR: {
        x: 0,
        y: 0
      },
      bL: {
        x: 0,
        y: 0
      },
      bR: {
        x: 0,
        y: 0
      }
    };

    if (this.snapshotScreeningEvent) {
      frame = this.snapshotScreeningEvent.frame;
      head = {
        tL: this.snapshotScreeningEvent.face.head.topLeft,
        tR: this.snapshotScreeningEvent.face.head.topRight,
        bL: this.snapshotScreeningEvent.face.head.bottomLeft,
        bR: this.snapshotScreeningEvent.face.head.bottomRight
      };
      thermalRefRaw = this.snapshotScreeningEvent.thermalReference.val;
      rawTempValue = this.snapshotScreeningEvent.rawTemperatureValue;
      thermalRefTemp = currentCalibration.val - (rawTempValue - thermalRefRaw) * 0.01;
      sampleX = this.snapshotScreeningEvent.sampleX;
      sampleY = this.snapshotScreeningEvent.sampleY;
    }

    const timestamp = new Date();
    const calibrationChanged = currentCalibration.val !== this.state.currentCalibration.calibrationTemperature.val;
    const thresholdChanged = thresholdMinFever !== this.state.currentCalibration.thresholdMinFever;
    const headBoundsChanged = JSON.stringify(head) !== JSON.stringify(this.state.currentCalibration.head);

    if (calibrationChanged || thresholdChanged || headBoundsChanged) {
      // Only update the server log for threshold or calibration changes, not for sound effect prefs etc.
      ScreeningApi.recordCalibrationEvent(this.deviceID, this.piSerial, calibrationChanged, thresholdChanged, {
        head,
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
      HeadTLX: head.tL.x,
      HeadTLY: head.tL.y,
      HeadBLX: head.bL.x,
      HeadBLY: head.bL.y,
      HeadTRX: head.tR.x,
      HeadTRY: head.tR.y,
      HeadBRX: head.bR.x,
      HeadBRY: head.bR.y,
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

  async beforeMount() {
    const {
      deviceID,
      devicename,
      serial
    } = await DeviceApi.deviceInfo();
    this.deviceID = deviceID;
    this.deviceName = devicename;
    this.piSerial = serial;
    this.resetEdits();
  }

};
CalibrationSettings = (0,tslib_es6/* __decorate */.gn)([(0,vue_property_decorator/* Component */.wA)({
  components: {
    VideoStream: components_VideoStream
  }
})], CalibrationSettings);
/* harmony default export */ const CalibrationSettingsvue_type_script_lang_ts_ = (CalibrationSettings);
;// CONCATENATED MODULE: ./src/components/CalibrationSettings.vue?vue&type=script&lang=ts&
 /* harmony default export */ const components_CalibrationSettingsvue_type_script_lang_ts_ = (CalibrationSettingsvue_type_script_lang_ts_); 
// EXTERNAL MODULE: ./node_modules/vuetify/lib/components/VCard/VCard.js + 1 modules
var VCard = __webpack_require__(6768);
// EXTERNAL MODULE: ./node_modules/vuetify/lib/components/VCard/index.js
var components_VCard = __webpack_require__(306);
// EXTERNAL MODULE: ./node_modules/vuetify/lib/components/VCheckbox/VCheckbox.js + 1 modules
var VCheckbox = __webpack_require__(6932);
// EXTERNAL MODULE: ./node_modules/vuetify/lib/components/VGrid/VCol.js
var VCol = __webpack_require__(3121);
// EXTERNAL MODULE: ./node_modules/vuetify/lib/components/VGrid/VContainer.js + 1 modules
var VContainer = __webpack_require__(6446);
// EXTERNAL MODULE: ./node_modules/vuetify/lib/components/VDialog/VDialog.js + 10 modules
var VDialog = __webpack_require__(8827);
// EXTERNAL MODULE: ./node_modules/vuetify/lib/components/VOverlay/VOverlay.js + 1 modules
var VOverlay = __webpack_require__(8432);
// EXTERNAL MODULE: ./node_modules/vuetify/lib/components/VGrid/VRow.js
var VRow = __webpack_require__(4722);
// EXTERNAL MODULE: ./node_modules/vuetify/lib/components/VSlider/VSlider.js + 1 modules
var VSlider = __webpack_require__(6539);
// EXTERNAL MODULE: ./node_modules/vuetify/lib/components/VGrid/VSpacer.js
var VSpacer = __webpack_require__(1453);
// EXTERNAL MODULE: ./node_modules/vuetify/lib/components/VSwitch/VSwitch.js + 1 modules
var VSwitch = __webpack_require__(9395);
// EXTERNAL MODULE: ./node_modules/vuetify/lib/components/VTextField/VTextField.js + 6 modules
var VTextField = __webpack_require__(76);
;// CONCATENATED MODULE: ./src/components/CalibrationSettings.vue



;


/* normalize component */

var CalibrationSettings_component = (0,componentNormalizer/* default */.Z)(
  components_CalibrationSettingsvue_type_script_lang_ts_,
  CalibrationSettingsvue_type_template_id_bf659bf4_scoped_true_render,
  CalibrationSettingsvue_type_template_id_bf659bf4_scoped_true_staticRenderFns,
  false,
  null,
  "bf659bf4",
  null
  
)

/* harmony default export */ const components_CalibrationSettings = (CalibrationSettings_component.exports);

/* vuetify-loader */
;

















installComponents_default()(CalibrationSettings_component, {VBtn: VBtn/* default */.Z,VCard: VCard/* default */.Z,VCardActions: components_VCard/* VCardActions */.h7,VCardSubtitle: components_VCard/* VCardSubtitle */.Qq,VCardText: components_VCard/* VCardText */.ZB,VCardTitle: components_VCard/* VCardTitle */.EB,VCheckbox: VCheckbox/* default */.Z,VCol: VCol/* default */.Z,VContainer: VContainer/* default */.Z,VDialog: VDialog/* default */.Z,VIcon: VIcon/* default */.Z,VOverlay: VOverlay/* default */.Z,VRow: VRow/* default */.Z,VSlider: VSlider/* default */.Z,VSpacer: VSpacer/* default */.Z,VSwitch: VSwitch/* default */.Z,VTextField: VTextField/* default */.Z})

;// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"678726f0-vue-loader-template"}!./node_modules/@vue/vue-loader-v15/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/cache-loader/dist/cjs.js??ruleSet[0].rules[0].use[0]!./node_modules/@vue/vue-loader-v15/lib/index.js??vue-loader-options!./src/components/DeviceInfo.vue?vue&type=template&id=a2dc84ae&scoped=true&
var DeviceInfovue_type_template_id_a2dc84ae_scoped_true_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-card',{attrs:{"flat":""}},[(_vm.items)?_c('v-simple-table',{scopedSlots:_vm._u([{key:"default",fn:function(){return [_c('thead',[_c('tr',[_c('th',{staticClass:"text-left"},[_vm._v("Device config")]),_c('th',{staticClass:"text-left"})])]),_c('tbody',_vm._l((_vm.items),function(ref){
var name = ref[0];
var item = ref[1];
return _c('tr',{key:name},[_c('td',[_vm._v(_vm._s(name))]),_c('td',[_vm._v(_vm._s(item))])])}),0)]},proxy:true}],null,false,421180828)}):_vm._e()],1)}
var DeviceInfovue_type_template_id_a2dc84ae_scoped_true_staticRenderFns = []


;// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??clonedRuleSet-40[0].rules[0].use[0]!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib/index.js!./node_modules/ts-loader/index.js??clonedRuleSet-40[0].rules[0].use[3]!./node_modules/cache-loader/dist/cjs.js??ruleSet[0].rules[0].use[0]!./node_modules/@vue/vue-loader-v15/lib/index.js??vue-loader-options!./src/components/DeviceInfo.vue?vue&type=script&lang=ts&
function DeviceInfovue_type_script_lang_ts_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function DeviceInfovue_type_script_lang_ts_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { DeviceInfovue_type_script_lang_ts_ownKeys(Object(source), true).forEach(function (key) { DeviceInfovue_type_script_lang_ts_defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { DeviceInfovue_type_script_lang_ts_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function DeviceInfovue_type_script_lang_ts_defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }





let DeviceInfo = class DeviceInfo extends vue_property_decorator/* Vue */.w3 {
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

    return camera;
  }

  get state() {
    return State;
  }

  async beforeMount() {
    // Get all the device data.
    const info = await DeviceApi.deviceInfo();
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

    this.softwareVersion = softwareVersion;
  }

};
DeviceInfo = (0,tslib_es6/* __decorate */.gn)([vue_property_decorator/* Component */.wA], DeviceInfo);
/* harmony default export */ const DeviceInfovue_type_script_lang_ts_ = (DeviceInfo);
;// CONCATENATED MODULE: ./src/components/DeviceInfo.vue?vue&type=script&lang=ts&
 /* harmony default export */ const components_DeviceInfovue_type_script_lang_ts_ = (DeviceInfovue_type_script_lang_ts_); 
// EXTERNAL MODULE: ./node_modules/vuetify/lib/components/VDataTable/VSimpleTable.js + 1 modules
var VSimpleTable = __webpack_require__(7543);
;// CONCATENATED MODULE: ./src/components/DeviceInfo.vue





/* normalize component */
;
var DeviceInfo_component = (0,componentNormalizer/* default */.Z)(
  components_DeviceInfovue_type_script_lang_ts_,
  DeviceInfovue_type_template_id_a2dc84ae_scoped_true_render,
  DeviceInfovue_type_template_id_a2dc84ae_scoped_true_staticRenderFns,
  false,
  null,
  "a2dc84ae",
  null
  
)

/* harmony default export */ const components_DeviceInfo = (DeviceInfo_component.exports);

/* vuetify-loader */
;


installComponents_default()(DeviceInfo_component, {VCard: VCard/* default */.Z,VSimpleTable: VSimpleTable/* default */.Z})

;// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"678726f0-vue-loader-template"}!./node_modules/@vue/vue-loader-v15/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/cache-loader/dist/cjs.js??ruleSet[0].rules[0].use[0]!./node_modules/@vue/vue-loader-v15/lib/index.js??vue-loader-options!./src/components/DeveloperUtilities.vue?vue&type=template&id=f23cb8ce&scoped=true&
var DeveloperUtilitiesvue_type_template_id_f23cb8ce_scoped_true_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-card',{attrs:{"flat":"","height":"calc(100vh - 112px)"}},[_c('v-container',{staticClass:"cont"},[_c('v-card',[_c('VideoStream',{attrs:{"frame":_vm.state.currentFrame.frame,"face":_vm.state.face,"min":_vm.state.currentFrame.analysisResult.heatStats.min,"max":_vm.state.currentFrame.analysisResult.heatStats.max,"crop-box":_vm.editedThermalRefMask,"crop-enabled":false,"recording":_vm.isRecording},on:{"crop-changed":_vm.onMaskChanged}}),_c('div',{staticClass:"buttons"},[(_vm.isRunningInAndroidWebview)?_c('div',[_vm._v(" To make recordings this needs to be running inside a browser, not the Te Kahu Ora app. ")]):_c('div',[_c('v-btn',{staticClass:"mb-4",attrs:{"center":""},on:{"click":_vm.toggleRecording}},[_vm._v(" "+_vm._s(!_vm.isRecording ? "Record" : "Stop Recording")+" ")])],1)])],1),_c('v-card',[_c('v-card-actions',[_c('v-btn',{staticClass:"ml-6",on:{"click":_vm.skipWarmup}},[_vm._v("Skip warmup period")]),(!_vm.disableRecordUserActivity)?_c('v-switch',{staticClass:"pl-6",attrs:{"label":"Record User Activities"},model:{value:(_vm.recordUserActivity),callback:function ($$v) {_vm.recordUserActivity=$$v},expression:"recordUserActivity"}}):_vm._e(),_c('v-switch',{staticClass:"pl-6",attrs:{"label":"Enable QR mode","disabled":_vm.cameraAvailable},model:{value:(_vm.qrMode),callback:function ($$v) {_vm.qrMode=$$v},expression:"qrMode"}})],1)],1)],1)],1)}
var DeveloperUtilitiesvue_type_template_id_f23cb8ce_scoped_true_staticRenderFns = []


;// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??clonedRuleSet-40[0].rules[0].use[0]!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib/index.js!./node_modules/ts-loader/index.js??clonedRuleSet-40[0].rules[0].use[3]!./node_modules/cache-loader/dist/cjs.js??ruleSet[0].rules[0].use[0]!./node_modules/@vue/vue-loader-v15/lib/index.js??vue-loader-options!./src/components/DeveloperUtilities.vue?vue&type=script&lang=ts&






function download(dataurl) {
  const a = document.createElement("a");
  a.href = dataurl;
  a.setAttribute("download", dataurl);
  a.click();
}

let DeveloperUtilities = class DeveloperUtilities extends vue_property_decorator/* Vue */.w3 {
  constructor() {
    super(...arguments);
    this.editedThermalRefMask = null;
    this.isRecording = false;
  }

  get cameraAvailable() {
    return navigator.mediaDevices === undefined;
  }

  get recordUserActivity() {
    return ObservableDeviceApi.RecordUserActivity;
  }

  set recordUserActivity(enable) {
    ObservableDeviceApi.RecordUserActivity = enable;
  }

  get disableRecordUserActivity() {
    return ObservableDeviceApi.DisableRecordUserActivity;
  }

  get qrMode() {
    return ObservableDeviceApi.RegisterQRID;
  }

  set qrMode(enable) {
    ObservableDeviceApi.RegisterQRID = enable;
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
    } = await ObservableDeviceApi.recorderStatus();

    if (!processor) {
      return false;
    }

    if (recording) {
      download(ObservableDeviceApi.DOWNLOAD_RECORDING);
      this.isRecording = false;
    } else {
      this.isRecording = await ObservableDeviceApi.startRecording();
    }
  }

  async mounted() {
    const {
      recording
    } = await ObservableDeviceApi.recorderStatus();
    this.isRecording = recording;
  }

};
DeveloperUtilities = (0,tslib_es6/* __decorate */.gn)([(0,vue_property_decorator/* Component */.wA)({
  components: {
    VideoStream: components_VideoStream
  }
})], DeveloperUtilities);
/* harmony default export */ const DeveloperUtilitiesvue_type_script_lang_ts_ = (DeveloperUtilities);
;// CONCATENATED MODULE: ./src/components/DeveloperUtilities.vue?vue&type=script&lang=ts&
 /* harmony default export */ const components_DeveloperUtilitiesvue_type_script_lang_ts_ = (DeveloperUtilitiesvue_type_script_lang_ts_); 
;// CONCATENATED MODULE: ./src/components/DeveloperUtilities.vue



;


/* normalize component */

var DeveloperUtilities_component = (0,componentNormalizer/* default */.Z)(
  components_DeveloperUtilitiesvue_type_script_lang_ts_,
  DeveloperUtilitiesvue_type_template_id_f23cb8ce_scoped_true_render,
  DeveloperUtilitiesvue_type_template_id_f23cb8ce_scoped_true_staticRenderFns,
  false,
  null,
  "f23cb8ce",
  null
  
)

/* harmony default export */ const components_DeveloperUtilities = (DeveloperUtilities_component.exports);

/* vuetify-loader */
;





installComponents_default()(DeveloperUtilities_component, {VBtn: VBtn/* default */.Z,VCard: VCard/* default */.Z,VCardActions: components_VCard/* VCardActions */.h7,VContainer: VContainer/* default */.Z,VSwitch: VSwitch/* default */.Z})

;// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??clonedRuleSet-40[0].rules[0].use[0]!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib/index.js!./node_modules/ts-loader/index.js??clonedRuleSet-40[0].rules[0].use[3]!./node_modules/cache-loader/dist/cjs.js??ruleSet[0].rules[0].use[0]!./node_modules/@vue/vue-loader-v15/lib/index.js??vue-loader-options!./src/components/AdminSettings.vue?vue&type=script&lang=ts&





let AdminSettings = class AdminSettings extends vue_property_decorator/* Vue */.w3 {
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

(0,tslib_es6/* __decorate */.gn)([(0,vue_property_decorator/* Emit */.y1)("closed")], AdminSettings.prototype, "close", null);

AdminSettings = (0,tslib_es6/* __decorate */.gn)([(0,vue_property_decorator/* Component */.wA)({
  components: {
    CalibrationSettings: components_CalibrationSettings,
    DeviceInfo: components_DeviceInfo,
    DeveloperUtilities: components_DeveloperUtilities
  }
})], AdminSettings);
/* harmony default export */ const AdminSettingsvue_type_script_lang_ts_ = (AdminSettings);
;// CONCATENATED MODULE: ./src/components/AdminSettings.vue?vue&type=script&lang=ts&
 /* harmony default export */ const components_AdminSettingsvue_type_script_lang_ts_ = (AdminSettingsvue_type_script_lang_ts_); 
// EXTERNAL MODULE: ./node_modules/vuetify/lib/components/VTabs/VTab.js
var VTab = __webpack_require__(1100);
// EXTERNAL MODULE: ./node_modules/vuetify/lib/components/VTabs/VTabItem.js + 1 modules
var VTabItem = __webpack_require__(3313);
// EXTERNAL MODULE: ./node_modules/vuetify/lib/components/VTabs/VTabs.js + 7 modules
var VTabs = __webpack_require__(1713);
// EXTERNAL MODULE: ./node_modules/vuetify/lib/components/VTabs/VTabsItems.js + 3 modules
var VTabsItems = __webpack_require__(2050);
// EXTERNAL MODULE: ./node_modules/vuetify/lib/components/VToolbar/VToolbar.js + 6 modules
var VToolbar = __webpack_require__(1564);
// EXTERNAL MODULE: ./node_modules/vuetify/lib/components/VToolbar/index.js
var components_VToolbar = __webpack_require__(3201);
;// CONCATENATED MODULE: ./src/components/AdminSettings.vue





/* normalize component */
;
var AdminSettings_component = (0,componentNormalizer/* default */.Z)(
  components_AdminSettingsvue_type_script_lang_ts_,
  AdminSettingsvue_type_template_id_dc077da8_scoped_true_render,
  AdminSettingsvue_type_template_id_dc077da8_scoped_true_staticRenderFns,
  false,
  null,
  "dc077da8",
  null
  
)

/* harmony default export */ const components_AdminSettings = (AdminSettings_component.exports);

/* vuetify-loader */
;









installComponents_default()(AdminSettings_component, {VBtn: VBtn/* default */.Z,VCard: VCard/* default */.Z,VSpacer: VSpacer/* default */.Z,VTab: VTab/* default */.Z,VTabItem: VTabItem/* default */.Z,VTabs: VTabs/* default */.Z,VTabsItems: VTabsItems/* default */.Z,VToolbar: VToolbar/* default */.Z,VToolbarTitle: components_VToolbar/* VToolbarTitle */.qW})

;// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??clonedRuleSet-40[0].rules[0].use[0]!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib/index.js!./node_modules/ts-loader/index.js??clonedRuleSet-40[0].rules[0].use[3]!./node_modules/cache-loader/dist/cjs.js??ruleSet[0].rules[0].use[0]!./node_modules/@vue/vue-loader-v15/lib/index.js??vue-loader-options!./src/components/UserFacingScreening.vue?vue&type=script&lang=ts&
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







const PROBABLE_ERROR_TEMP = 42.5;
const thermalRefWidth = 42;

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

let frameNum = 0;
let curveFitting;
const Sound = new Audio();
let UserFacingScreening = class UserFacingScreening extends vue_property_decorator/* Vue */.w3 {
  constructor() {
    super(...arguments);
    this.didInteract = false;
    this.showSettings = false;
    this.hasSettings = false;
    this.shouldLeaveFrame = false;
    this.prevFrameTime = performance.now();
    this.stateQueue = [];
    this.canvasWidth = 710;
    this.canvasHeight = 1080;
  }

  get isLocal() {
    return (window.location.port === "5000" || window.location.port === "8080") && "production" === "development";
  }

  closedAdminSettings() {
    this.showSettings = false;
    setTimeout(() => {
      this.hasSettings = false;
    }, 300);
  }

  set interacted(val) {
    // Don't allow interaction if the camera isn't getting frames.
    this.didInteract = val;
    setTimeout(() => this.didInteract = false, 5000);
  }

  get interacted() {
    return this.didInteract;
  }

  get cogIcon() {
    return mdi/* mdiCog */.Shd;
  }

  async beforeMount() {
    curveFitting = await __webpack_require__.e(/* import() */ 641).then(__webpack_require__.bind(__webpack_require__, 3641));
  }

  mounted() {
    if (this.$refs.beziers) {
      const aspectRatio = 4 / 3;

      if (navigator.userAgent.includes("Lenovo TB-X605LC")) {
        this.canvasHeight = document.body.getBoundingClientRect().height;
      } else {
        this.canvasHeight = this.$refs.beziers.parentElement.getBoundingClientRect().height;
      }

      this.canvasWidth = this.canvasHeight / aspectRatio;
      this.$refs.beziers.style.width = `${this.canvasWidth}px`;
      this.$refs.beziers.style.height = `${this.canvasHeight}px`;
      const ctx = this.$refs.beziers.getContext("2d");
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
    }

    window.requestAnimationFrame(this.drawBezierOutline.bind(this));
  }

  get messageText() {
    let message = "Ready";

    if (this.isWarmingUp) {
      message = `Warming up, <span>${this.remainingWarmupTime}</span> remaining`;
    } else if (this.isAfterFFCEvent) {
      message = "One moment...";
    } else if (this.isAquiring) {
      message = "Hold still...";
    } else if (this.isTooFar) {
      message = "Come closer";
    } else if (this.missingRef) {
      message = "Missing reference";
    }

    this.logForTest(message);
    return message;
  }

  get screeningAdvice() {
    if (this.temperatureIsNormal) {
      return "You're good to go!";
    } else if (this.temperatureIsHigherThanNormal) {
      return "Get checked out now!";
    } else {
      return "Please check calibration";
    }
  }

  get finishScan() {
    return this.state === ScreeningState.MEASURED;
  }

  onScreeningEventChange(event) {
    if (event !== null) {
      const calibration = event.frame.frameInfo.Calibration;

      if (this.temperatureIsNormal) {
        if (calibration.UseNormalSound) {
          Sound.src = `${"/static/dist/"}sounds/341695_5858296-lq.mp3`;
          Sound.play();
        }
      } else if (this.temperatureIsHigherThanNormal) {
        if (calibration.UseWarningSound) {
          Sound.src = `${"/static/dist/"}sounds/445978_9159316-lq.mp3`;
          Sound.play();
        }
      } else if (this.temperatureIsProbablyAnError) {
        if (calibration.UseErrorSound) {
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
    if (this.screeningEvent && new Date().getTime() - this.screeningEvent.timestamp.getTime() > 1000) {
      this.shouldLeaveFrame = true;
    } else {
      this.shouldLeaveFrame = false;
    }

    frameNum++;
    const ctx = this.$refs.beziers.getContext("2d");
    const leftOffset = 0;
    const rightOffset = 120 - thermalRefWidth;

    if (ctx) {
      ctx.clearRect(0, 0, 810, 1080);
      ctx.save();
      ctx.translate(thermalRefWidth / 2, 0);
      ctx.scale(6.75, 6.75);

      if (this.shapes.length === 2) {
        // TODO(jon): Would Object.freeze be a better strategy for opting out of reactivity?
        const prevShape = this.shapes[0];
        const nextShape = this.shapes[1]; // TODO(jon): If there's no nextShape, create one to the side that prevShape seemed to be
        // going off on.

        if (prevShape && nextShape && prevShape.length && nextShape.length) {
          const interpolatedShape = interpolateShapes(prevShape[0], LerpAmount.amount, nextShape[0]);
          const now = performance.now();
          const elapsedSincePrevFrame = now - this.prevFrameTime;
          this.prevFrameTime = now;
          LerpAmount.amount += elapsedSincePrevFrame / 100;
          LerpAmount.amount = Math.min(1, LerpAmount.amount);
          const pointsArray = new Uint8Array(interpolatedShape.length * 4);
          let i = 0;
          interpolatedShape.reverse();
          let offset = 0;

          if (this.thermalRefSide === "left") {
            offset = thermalRefWidth;
          }

          for (const row of interpolatedShape) {
            pointsArray[i++] = row.x1 - offset;
            pointsArray[i++] = row.y;
          }

          interpolatedShape.reverse();

          for (const row of interpolatedShape) {
            pointsArray[i++] = row.x0 - offset;
            pointsArray[i++] = row.y;
          }

          let bezierPts = [];

          if (pointsArray.length >= 4) {
            bezierPts = curveFitting.fitCurveThroughPoints(pointsArray);
          }

          if (bezierPts.length) {
            {
              {
                let headWidth = 0;

                if (this.face) {
                  const distance = (a, b) => {
                    const dX = a.x - b.x;
                    const dY = a.y - b.y;
                    return Math.sqrt(dX * dX + dY * dY);
                  };

                  headWidth = distance(this.face.head.bottomLeft, this.face.head.bottomRight);
                }

                const strokeAlpha = 0.2 + headWidth / 120;
                ctx.strokeStyle = `rgba(255, 255, 255, ${strokeAlpha})`;
                ctx.setLineDash([3, 8]);
                ctx.lineDashOffset = frameNum / 5 % 10; //Math.abs(((frameNum / 20) % 5) - 2.5);

                ctx.beginPath();
                ctx.moveTo(bezierPts[0], bezierPts[1]);

                for (let _i = 2; _i < bezierPts.length; _i += 6) {
                  ctx.bezierCurveTo(bezierPts[_i], bezierPts[_i + 1], bezierPts[_i + 2], bezierPts[_i + 3], bezierPts[_i + 4], bezierPts[_i + 5]);
                }

                ctx.stroke();
              }
            }
            {
              if (this.screeningEvent) {
                let samplePointLerp = Math.min(1.0, (new Date().getTime() - this.screeningEvent.timestamp.getTime()) / 600);
                samplePointLerp *= samplePointLerp;
                ctx.beginPath();
                ctx.fillStyle = `rgba(255, 255, 255, ${Math.abs(1.0 - samplePointLerp) * 0.6})`;
                ctx.arc(this.screeningEvent.sampleX - offset, this.screeningEvent.sampleY, samplePointLerp * 8, 0, Math.PI * 2);
                ctx.fill();
              }
            }
            ctx.save(); // TODO(jon): Bake this alpha mask to a texture if things seem slow.

            ctx.globalCompositeOperation = "destination-out";
            const leftGradient = ctx.createLinearGradient(leftOffset, 0, 10, 0);
            leftGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
            leftGradient.addColorStop(0.25, "rgba(0, 0, 0, 230)");
            leftGradient.addColorStop(0, "rgba(0, 0, 0, 255)");
            const rightGradient = ctx.createLinearGradient(rightOffset - 10, 0, rightOffset, 0);
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
            ctx.fillRect(leftOffset, 0, 15, 160);
            ctx.fillStyle = rightGradient;
            ctx.fillRect(rightOffset - 10, 0, 15, 160);
            ctx.fillStyle = topGradient;
            ctx.fillRect(0, 0, 120 - thermalRefWidth, 10);
            ctx.fillStyle = bottomGradient;
            ctx.fillRect(0, 150, 120 - thermalRefWidth, 10);
            ctx.restore();
          }
        } // Draw corner indicators:


        ctx.setLineDash([]);
        const insetY = 15;
        const insetX = 5;
        const len = 10;
        const width = 120 - thermalRefWidth;
        const height = 160;
        ctx.beginPath();
        ctx.moveTo(insetX + len, insetY);
        ctx.lineTo(insetX, insetY);
        ctx.lineTo(insetX, insetY + len);
        ctx.moveTo(insetX + len, height - insetY);
        ctx.lineTo(insetX, height - insetY);
        ctx.lineTo(insetX, height - (insetY + len));
        ctx.moveTo(width - (insetX + len), insetY);
        ctx.lineTo(width - insetX, insetY);
        ctx.lineTo(width - insetX, insetY + len);
        ctx.moveTo(width - (insetX + len), height - insetY);
        ctx.lineTo(width - insetX, height - insetY);
        ctx.lineTo(width - insetX, height - (insetY + len));
        ctx.stroke();
        ctx.restore();
      }
    }

    requestAnimationFrame(this.drawBezierOutline.bind(this));
  }

  get temperature() {
    if (this.screeningEvent) {
      const temp = new DegreesCelsius(this.screeningEvent.face.sampleTemp);
      this.logForTest(`Temperature is ${temp}`);
      return temp;
    }

    return new DegreesCelsius(0);
  }

  get temperatureIsNormal() {
    return this.temperature.val < this.calibration.thresholdMinFever;
  }

  get temperatureIsHigherThanNormal() {
    return this.temperature.val >= this.calibration.thresholdMinFever && this.temperature.val <= PROBABLE_ERROR_TEMP;
  }

  get temperatureIsProbablyAnError() {
    return this.temperature.val > PROBABLE_ERROR_TEMP;
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
      }
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

  get isAfterFFCEvent() {
    return this.state === ScreeningState.AFTER_FFC_EVENT;
  }

  get isAquiring() {
    return this.state === ScreeningState.LARGE_BODY || this.state === ScreeningState.FACE_LOCK || this.state === ScreeningState.HEAD_LOCK || this.state === ScreeningState.FRONTAL_LOCK || this.state === ScreeningState.BLURRED || this.state === ScreeningState.STABLE_LOCK;
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
      case ScreeningState.BLURRED:
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

  logForTest(message) {
    if (this.isTesting) {
      this.$emit("new-message", message);
    }
  }

};

(0,tslib_es6/* __decorate */.gn)([(0,vue_property_decorator/* Prop */.fI)({
  required: true
})], UserFacingScreening.prototype, "state", void 0);

(0,tslib_es6/* __decorate */.gn)([(0,vue_property_decorator/* Prop */.fI)({
  required: true
})], UserFacingScreening.prototype, "screeningEvent", void 0);

(0,tslib_es6/* __decorate */.gn)([(0,vue_property_decorator/* Prop */.fI)({
  required: true
})], UserFacingScreening.prototype, "calibration", void 0);

(0,tslib_es6/* __decorate */.gn)([(0,vue_property_decorator/* Prop */.fI)({
  required: true
})], UserFacingScreening.prototype, "onReferenceDevice", void 0);

(0,tslib_es6/* __decorate */.gn)([(0,vue_property_decorator/* Prop */.fI)({
  required: true
})], UserFacingScreening.prototype, "face", void 0);

(0,tslib_es6/* __decorate */.gn)([(0,vue_property_decorator/* Prop */.fI)({
  required: true
})], UserFacingScreening.prototype, "shapes", void 0);

(0,tslib_es6/* __decorate */.gn)([(0,vue_property_decorator/* Prop */.fI)({
  required: true
})], UserFacingScreening.prototype, "warmupSecondsRemaining", void 0);

(0,tslib_es6/* __decorate */.gn)([(0,vue_property_decorator/* Prop */.fI)({
  required: true
})], UserFacingScreening.prototype, "isTesting", void 0);

(0,tslib_es6/* __decorate */.gn)([(0,vue_property_decorator/* Prop */.fI)({
  required: true
})], UserFacingScreening.prototype, "thermalRefSide", void 0);

(0,tslib_es6/* __decorate */.gn)([(0,vue_property_decorator/* Prop */.fI)({
  default: true
})], UserFacingScreening.prototype, "showCanvas", void 0);

(0,tslib_es6/* __decorate */.gn)([(0,vue_property_decorator/* Watch */.RL)("screeningEvent")], UserFacingScreening.prototype, "onScreeningEventChange", null);

UserFacingScreening = (0,tslib_es6/* __decorate */.gn)([(0,vue_property_decorator/* Component */.wA)({
  components: {
    AdminSettings: components_AdminSettings
  }
})], UserFacingScreening);
/* harmony default export */ const UserFacingScreeningvue_type_script_lang_ts_ = (UserFacingScreening);
;// CONCATENATED MODULE: ./src/components/UserFacingScreening.vue?vue&type=script&lang=ts&
 /* harmony default export */ const components_UserFacingScreeningvue_type_script_lang_ts_ = (UserFacingScreeningvue_type_script_lang_ts_); 
;// CONCATENATED MODULE: ./src/components/UserFacingScreening.vue



;


/* normalize component */

var UserFacingScreening_component = (0,componentNormalizer/* default */.Z)(
  components_UserFacingScreeningvue_type_script_lang_ts_,
  UserFacingScreeningvue_type_template_id_19846409_scoped_true_render,
  UserFacingScreeningvue_type_template_id_19846409_scoped_true_staticRenderFns,
  false,
  null,
  "19846409",
  null
  
)

/* harmony default export */ const components_UserFacingScreening = (UserFacingScreening_component.exports);

/* vuetify-loader */
;





installComponents_default()(UserFacingScreening_component, {VBtn: VBtn/* default */.Z,VCard: VCard/* default */.Z,VCardActions: components_VCard/* VCardActions */.h7,VDialog: VDialog/* default */.Z,VIcon: VIcon/* default */.Z})

;// CONCATENATED MODULE: ./src/camera.ts
function camera_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function camera_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { camera_ownKeys(Object(source), true).forEach(function (key) { camera_defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { camera_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function camera_defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }



var CameraConnectionState;

(function (CameraConnectionState) {
  CameraConnectionState[CameraConnectionState["Connecting"] = 0] = "Connecting";
  CameraConnectionState[CameraConnectionState["Connected"] = 1] = "Connected";
  CameraConnectionState[CameraConnectionState["Disconnected"] = 2] = "Disconnected";
})(CameraConnectionState || (CameraConnectionState = {}));

const UUID = new Date().getTime();
class CameraConnection {
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

    if ((port === "8080" || port === "5000") && "production" === "development") {
      // If we're running in development mode, find the remote camera server
      //this.host = "192.168.178.21";
      this.host = "192.168.0.181"; //this.host = "192.168.0.82";
      //this.host = "192.168.0.41";
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

      if (frameInfo.Calibration === null) {
        frameInfo.Calibration = camera_objectSpread({}, FactoryDefaultCalibration);
        frameInfo.Calibration.UuidOfUpdater = UUID;
        frameInfo.Calibration.CalibrationBinaryVersion = frameInfo.BinaryVersion;
      }

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
var frame_listener = __webpack_require__(6084);
var frame_listener_default = /*#__PURE__*/__webpack_require__.n(frame_listener);
;// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"678726f0-vue-loader-template"}!./node_modules/@vue/vue-loader-v15/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/cache-loader/dist/cjs.js??ruleSet[0].rules[0].use[0]!./node_modules/@vue/vue-loader-v15/lib/index.js??vue-loader-options!./src/components/QRImage.vue?vue&type=template&id=a3bc6232&
var QRImagevue_type_template_id_a3bc6232_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"qr-container"},[_c('transition',{attrs:{"name":"fade"}},[(_vm.registered)?_c('svg',{staticClass:"qr-image registered",attrs:{"viewBox":"0,0,72,65","width":"86.4","height":"78","fill":"none","xmlns":"http://www.w3.org/2000/svg"}},[_c('path',{attrs:{"d":"M65 7L28 55 7 37","stroke":"#fff","stroke-width":"13","stroke-linecap":"round"}})]):_c('svg',{staticClass:"qr-image",attrs:{"xmlns":"http://www.w3.org/2000/svg","viewBox":"0,0,1200,1200","width":150,"height":150,"fill":"white"}},[_c('path',{attrs:{"d":"M576 96h48v48h-48zM672 96h48v48h-48zM576 144h48v48h-48zM624 144h48v48h-48zM672 144h48v48h-48zM480 192h48v48h-48zM528 192h48v48h-48zM576 192h48v48h-48zM672 192h48v48h-48zM480 240h48v48h-48zM528 240h48v48h-48zM624 240h48v48h-48zM480 288h48v48h-48zM576 288h48v48h-48zM624 288h48v48h-48zM672 288h48v48h-48zM480 336h48v48h-48zM672 336h48v48h-48zM480 384h48v48h-48zM576 384h48v48h-48zM672 384h48v48h-48zM480 432h48v48h-48zM528 432h48v48h-48zM624 432h48v48h-48zM672 432h48v48h-48zM96 480h48v48H96zM192 480h48v48h-48zM240 480h48v48h-48zM288 480h48v48h-48zM336 480h48v48h-48zM384 480h48v48h-48zM576 480h48v48h-48zM672 480h48v48h-48zM768 480h48v48h-48zM816 480h48v48h-48zM864 480h48v48h-48zM912 480h48v48h-48zM960 480h48v48h-48zM192 528h48v48h-48zM288 528h48v48h-48zM336 528h48v48h-48zM432 528h48v48h-48zM480 528h48v48h-48zM576 528h48v48h-48zM672 528h48v48h-48zM816 528h48v48h-48zM912 528h48v48h-48zM960 528h48v48h-48zM1008 528h48v48h-48zM1056 528h48v48h-48zM96 576h48v48H96zM192 576h48v48h-48zM384 576h48v48h-48zM432 576h48v48h-48zM480 576h48v48h-48zM576 576h48v48h-48zM624 576h48v48h-48zM720 576h48v48h-48zM864 576h48v48h-48zM960 576h48v48h-48zM1056 576h48v48h-48zM96 624h48v48H96zM144 624h48v48h-48zM240 624h48v48h-48zM288 624h48v48h-48zM480 624h48v48h-48zM576 624h48v48h-48zM816 624h48v48h-48zM864 624h48v48h-48zM960 624h48v48h-48zM1008 624h48v48h-48zM1056 624h48v48h-48zM96 672h48v48H96zM192 672h48v48h-48zM288 672h48v48h-48zM336 672h48v48h-48zM384 672h48v48h-48zM432 672h48v48h-48zM624 672h48v48h-48zM720 672h48v48h-48zM864 672h48v48h-48zM960 672h48v48h-48zM1008 672h48v48h-48zM480 720h48v48h-48zM528 720h48v48h-48zM576 720h48v48h-48zM624 720h48v48h-48zM672 720h48v48h-48zM720 720h48v48h-48zM768 720h48v48h-48zM912 720h48v48h-48zM528 768h48v48h-48zM576 768h48v48h-48zM672 768h48v48h-48zM768 768h48v48h-48zM816 768h48v48h-48zM480 816h48v48h-48zM528 816h48v48h-48zM624 816h48v48h-48zM672 816h48v48h-48zM720 816h48v48h-48zM768 816h48v48h-48zM912 816h48v48h-48zM1008 816h48v48h-48zM480 864h48v48h-48zM672 864h48v48h-48zM816 864h48v48h-48zM960 864h48v48h-48zM480 912h48v48h-48zM528 912h48v48h-48zM576 912h48v48h-48zM672 912h48v48h-48zM816 912h48v48h-48zM960 912h48v48h-48zM480 960h48v48h-48zM528 960h48v48h-48zM576 960h48v48h-48zM624 960h48v48h-48zM720 960h48v48h-48zM864 960h48v48h-48zM912 960h48v48h-48zM960 960h48v48h-48zM816 1008h48v48h-48zM864 1008h48v48h-48zM960 1008h48v48h-48zM1008 1008h48v48h-48zM480 1056h48v48h-48zM576 1056h48v48h-48zM624 1056h48v48h-48zM720 1056h48v48h-48zM864 1056h48v48h-48zM912 1056h48v48h-48zM960 1056h48v48h-48z"}}),_c('path',{attrs:{"fill":"none","d":"M146 146h236v236H146z"}}),_c('path',{attrs:{"d":"M382 96H96v336h336V96h-50zm0 286H146V146h236v236z"}}),_c('path',{attrs:{"fill":"none","d":"M818 146h236v236H818z"}}),_c('path',{attrs:{"d":"M1054 96H768v336h336V96h-50zm0 286H818V146h236v236z"}}),_c('path',{attrs:{"fill":"none","d":"M146 818h236v236H146z"}}),_c('path',{attrs:{"d":"M382 768H96v336h336V768h-50zm0 286H146V818h236v236z"}}),_c('g',[_c('path',{attrs:{"d":"M192 192h144v144H192z"}})]),_c('g',[_c('path',{attrs:{"d":"M864 192h144v144H864z"}})]),_c('g',[_c('path',{attrs:{"d":"M192 864h144v144H192z"}})])])]),_c('p',{staticClass:"qr-text"},[_vm._v(_vm._s(_vm.qrMessage))])],1)}
var QRImagevue_type_template_id_a3bc6232_staticRenderFns = []


;// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??clonedRuleSet-40[0].rules[0].use[0]!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib/index.js!./node_modules/ts-loader/index.js??clonedRuleSet-40[0].rules[0].use[3]!./node_modules/cache-loader/dist/cjs.js??ruleSet[0].rules[0].use[0]!./node_modules/@vue/vue-loader-v15/lib/index.js??vue-loader-options!./src/components/QRImage.vue?vue&type=script&lang=ts&


let QRImage = class QRImage extends vue_property_decorator/* Vue */.w3 {
  get qrMessage() {
    return this.registered ? "Registered" : "Present ID to register";
  }

};

(0,tslib_es6/* __decorate */.gn)([(0,vue_property_decorator/* Prop */.fI)({
  required: true
})], QRImage.prototype, "registered", void 0);

QRImage = (0,tslib_es6/* __decorate */.gn)([vue_property_decorator/* Component */.wA], QRImage);
/* harmony default export */ const QRImagevue_type_script_lang_ts_ = (QRImage);
;// CONCATENATED MODULE: ./src/components/QRImage.vue?vue&type=script&lang=ts&
 /* harmony default export */ const components_QRImagevue_type_script_lang_ts_ = (QRImagevue_type_script_lang_ts_); 
;// CONCATENATED MODULE: ./src/components/QRImage.vue



;


/* normalize component */

var QRImage_component = (0,componentNormalizer/* default */.Z)(
  components_QRImagevue_type_script_lang_ts_,
  QRImagevue_type_template_id_a3bc6232_render,
  QRImagevue_type_template_id_a3bc6232_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const components_QRImage = (QRImage_component.exports);
;// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"678726f0-vue-loader-template"}!./node_modules/@vue/vue-loader-v15/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/cache-loader/dist/cjs.js??ruleSet[0].rules[0].use[0]!./node_modules/@vue/vue-loader-v15/lib/index.js??vue-loader-options!./src/components/QRCameraFeed.vue?vue&type=template&id=186cb103&scoped=true&
var QRCameraFeedvue_type_template_id_186cb103_scoped_true_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"video-container"},[_c('video',{ref:"videoStream",attrs:{"autoplay":"","hidden":""},domProps:{"srcObject":_vm.stream}}),_c('transition',{attrs:{"name":"fade"}},[_c('canvas',{ref:"videoCanvas",staticClass:"video-canvas",class:{
        'stream-loaded': _vm.streamLoaded,
        'stream-not-loaded': !_vm.streamLoaded,
      }})])],1)}
var QRCameraFeedvue_type_template_id_186cb103_scoped_true_staticRenderFns = []


// EXTERNAL MODULE: ./node_modules/worker-loader/dist/cjs.js!./src/qr-reader.ts
var qr_reader = __webpack_require__(5877);
var qr_reader_default = /*#__PURE__*/__webpack_require__.n(qr_reader);
;// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??clonedRuleSet-40[0].rules[0].use[0]!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib/index.js!./node_modules/ts-loader/index.js??clonedRuleSet-40[0].rules[0].use[3]!./node_modules/cache-loader/dist/cjs.js??ruleSet[0].rules[0].use[0]!./node_modules/@vue/vue-loader-v15/lib/index.js??vue-loader-options!./src/components/QRCameraFeed.vue?vue&type=script&lang=ts&




let QRVideo = class QRVideo extends vue_property_decorator/* Vue */.w3 {
  constructor() {
    super(...arguments);
    this.stream = {};
    this.timeQRFound = 0;
    this.streamLoaded = false;
    this.qrworker = new (qr_reader_default())();
  }

  async mounted() {
    // Start video camera
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: true
      });
      requestAnimationFrame(this.loadFrame);
    } catch (e) {
      console.error(e);
      ObservableDeviceApi.RegisterQRID = false;
    }
  }

  loadFrame() {
    const video = this.$refs.videoStream;

    if (video) {
      const {
        readyState,
        HAVE_ENOUGH_DATA
      } = video;

      if (readyState === HAVE_ENOUGH_DATA) {
        const ratio = video.videoHeight / video.videoWidth;
        const width = 550;
        const height = width * ratio;

        if (!this.streamLoaded) {
          this.$refs.videoCanvas.width = width;
          this.$refs.videoCanvas.height = height;
        }

        const canvas = this.$refs.videoCanvas;
        const canvasContext = canvas.getContext("2d");
        canvasContext === null || canvasContext === void 0 ? void 0 : canvasContext.drawImage(video, 0, 0, width, height);
        const image = canvasContext === null || canvasContext === void 0 ? void 0 : canvasContext.getImageData(0, 0, width, height);
        this.streamLoaded = true;

        if (image) {
          this.qrworker.postMessage({
            image
          });

          this.qrworker.onmessage = message => {
            const qr = message.data.qr;
            const timePassedWithout = Math.floor((Date.now() - this.timeQRFound) / 1000);

            if (qr && qr.data !== "") {
              this.setQRCode(qr, timePassedWithout, {
                width: video.videoWidth,
                height: video.videoWidth
              });
            }
          };
        }
      }
    }

    requestAnimationFrame(this.loadFrame);
  }

};

(0,tslib_es6/* __decorate */.gn)([(0,vue_property_decorator/* Prop */.fI)({
  required: true
})], QRVideo.prototype, "setQRCode", void 0);

QRVideo = (0,tslib_es6/* __decorate */.gn)([vue_property_decorator/* Component */.wA], QRVideo);
/* harmony default export */ const QRCameraFeedvue_type_script_lang_ts_ = (QRVideo);
;// CONCATENATED MODULE: ./src/components/QRCameraFeed.vue?vue&type=script&lang=ts&
 /* harmony default export */ const components_QRCameraFeedvue_type_script_lang_ts_ = (QRCameraFeedvue_type_script_lang_ts_); 
;// CONCATENATED MODULE: ./src/components/QRCameraFeed.vue



;


/* normalize component */

var QRCameraFeed_component = (0,componentNormalizer/* default */.Z)(
  components_QRCameraFeedvue_type_script_lang_ts_,
  QRCameraFeedvue_type_template_id_186cb103_scoped_true_render,
  QRCameraFeedvue_type_template_id_186cb103_scoped_true_staticRenderFns,
  false,
  null,
  "186cb103",
  null
  
)

/* harmony default export */ const QRCameraFeed = (QRCameraFeed_component.exports);
;// CONCATENATED MODULE: ./src/frame-handler.ts



function FrameHandler() {
  const secondsToMilliseconds = seconds => seconds * 1000;

  const isDeviceRecording = () => ObservableDeviceApi.recorderStatus().then(({
    recording
  }) => recording);

  return {
    startTimeInFrame: 0,
    startTimeOutFrame: 0,
    isRecording: isDeviceRecording(),
    hasMeasured: false,

    async process(frame) {
      const timeInFrame = this.getTimeInFrame(frame);
      const {
        hasExit,
        isInFrame
      } = this.isObjectStillInFrame(frame);
      this.measuredInFrame(frame);

      if (isInFrame && !this.isRecording) {
        await ObservableDeviceApi.startRecording();
        this.isRecording = await isDeviceRecording();
      } else if (hasExit && this.isRecording) {
        const shouldRecord = timeInFrame > secondsToMilliseconds(8) || this.hasMeasured && timeInFrame > secondsToMilliseconds(1);
        this.hasMeasured = false;
        await ObservableDeviceApi.stopRecording(shouldRecord);
        this.isRecording = await isDeviceRecording();
      }
    },

    measuredInFrame(frame) {
      const state = frame.analysisResult.nextState;
      this.hasMeasured = state === ScreeningState.MEASURED ? true : this.hasMeasured;
    },

    isObjectInFrame(frame) {
      const state = frame.analysisResult.nextState;
      return state === ScreeningState.HEAD_LOCK || state === ScreeningState.LARGE_BODY || state === ScreeningState.FRONTAL_LOCK || state === ScreeningState.STABLE_LOCK || state === ScreeningState.MULTIPLE_HEADS || state === ScreeningState.MEASURED || state === ScreeningState.TOO_FAR;
    },

    hasObjectExitFrame(frame) {
      const isInFrame = this.isObjectInFrame(frame);
      const ThresholdSeconds = secondsToMilliseconds(3);
      const now = Date.now();
      this.startTimeOutFrame = isInFrame ? now : this.startTimeOutFrame;
      const currTimeOutFrame = Math.abs(now - this.startTimeOutFrame);
      const hasExit = currTimeOutFrame > ThresholdSeconds;
      this.startTimeOutFrame = hasExit ? Infinity : this.startTimeOutFrame;
      return hasExit;
    },

    // Even if doesn't detect object is in a frame does not mean it has left.
    isObjectStillInFrame(frame) {
      const isInFrame = this.isObjectInFrame(frame);
      const hasExit = this.hasObjectExitFrame(frame);
      return {
        isInFrame,
        hasExit
      };
    },

    getTimeInFrame(frame) {
      const now = Date.now();
      const {
        isInFrame,
        hasExit
      } = this.isObjectStillInFrame(frame);

      if (isInFrame) {
        this.startTimeInFrame = this.startTimeInFrame === 0 ? now : this.startTimeInFrame;
        return now - this.startTimeInFrame;
      } else if (this.startTimeInFrame === 0) {
        return 0;
      } else if (hasExit) {
        // Object has yet to enter frame
        const totalTimeInFrame = now - this.startTimeInFrame;
        this.startTimeInFrame = 0;
        return totalTimeInFrame;
      } else {
        return now - this.startTimeInFrame;
      }
    }

  };
}

/* harmony default export */ const frame_handler = (FrameHandler);
;// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??clonedRuleSet-40[0].rules[0].use[0]!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib/index.js!./node_modules/ts-loader/index.js??clonedRuleSet-40[0].rules[0].use[3]!./node_modules/cache-loader/dist/cjs.js??ruleSet[0].rules[0].use[0]!./node_modules/@vue/vue-loader-v15/lib/index.js??vue-loader-options!./src/App.vue?vue&type=script&lang=ts&
function Appvue_type_script_lang_ts_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function Appvue_type_script_lang_ts_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { Appvue_type_script_lang_ts_ownKeys(Object(source), true).forEach(function (key) { Appvue_type_script_lang_ts_defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { Appvue_type_script_lang_ts_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function Appvue_type_script_lang_ts_defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }














let App = class App extends vue_property_decorator/* Vue */.w3 {
  constructor() {
    super(...arguments);
    this.deviceID = "";
    this.deviceName = "";
    this.piSerial = "";
    this.appVersion = "";
    this.appState = State;
    this.isNotFullscreen = true;
    this.showUpdatedCalibrationSnackbar = false;
    this.frameHandler = frame_handler();
    this.qrCode = {
      code: null,
      dimensions: {
        height: 0,
        width: 0
      },
      duration: 0
    };
    this.startTimeInFrame = 0;
    this.startTimeOutFrame = Infinity;
    this.isRecording = false;
    this.skippedWarmup = false;
    this.thermalRefSide = "left";
    this.prevShape = [];
    this.nextShape = [];
    this.showSoftwareVersionUpdatedPrompt = false;
    this.useLiveCamera = true;
    this.gotFirstFrame = false;
    this.hostname = "";
  }

  get isReferenceDevice() {
    return window.navigator.userAgent.includes("Lenovo TB-X605LC") || this.isRunningInAndroidWebview;
  }

  get face() {
    var _this$appState$curren;

    return ((_this$appState$curren = this.appState.currentFrame) === null || _this$appState$curren === void 0 ? void 0 : _this$appState$curren.analysisResult.face) || null;
  }

  get finishScan() {
    return this.appState.currentScreeningState === ScreeningState.MEASURED;
  }

  get qrMode() {
    return ObservableDeviceApi.RegisterQRID;
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

  setQRCode(code, duration = 0, dimensions) {
    this.qrCode = {
      code,
      dimensions,
      duration
    };
  }

  get registered() {
    if (this.qrCode.code && this.qrCode.code.data !== null) {
      return true;
    }

    return false;
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
    this.appState.currentCalibration.head = {
      tL: {
        x: nextCalibration.HeadTLX,
        y: nextCalibration.HeadTLY
      },
      tR: {
        x: nextCalibration.HeadTRX,
        y: nextCalibration.HeadTRY
      },
      bL: {
        x: nextCalibration.HeadBLX,
        y: nextCalibration.HeadBLY
      },
      bR: {
        x: nextCalibration.HeadBRX,
        y: nextCalibration.HeadBRY
      }
    };
    this.appState.currentCalibration.playNormalSound = nextCalibration.UseNormalSound;
    this.appState.currentCalibration.playWarningSound = nextCalibration.UseWarningSound;
    this.appState.currentCalibration.playErrorSound = nextCalibration.UseErrorSound;
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
    // Did we receive any frames in the past second?  // Did we just trigger an FFC event?
    return this.appState.lastFrameTime > new Date().getTime() - 1000;
  }

  get isNotGettingFrames() {
    // Did we receive any frames in the past second?
    return !(this.appState.lastFrameTime > new Date().getTime() - 1000);
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


    checkForSoftwareUpdates(frame.frameInfo.BinaryVersion, frame.frameInfo.AppVersion, this.gotFirstFrame);
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

    if (ObservableDeviceApi.RecordUserActivity) {
      this.frameHandler.process(frame);
    }

    if (frame.analysisResult.thermalRef.geom.center.x < 60) {
      this.thermalRefSide = "left";
    } else {
      this.thermalRefSide = "right";
    }

    if (this.isWarmingUp) {
      this.appState.currentScreeningState = ScreeningState.WARMING_UP;
    } else {
      // See if we want to pre-emptively trigger an FFC:
      let msSinceLastFFC = frame.frameInfo.Telemetry.TimeOn - frame.frameInfo.Telemetry.LastFFCTime;

      if (this.useLiveCamera) {
        // Nanoseconds rather than milliseconds if live
        msSinceLastFFC = msSinceLastFFC / 1000 / 1000;
      }

      const timeTillFFC = FFC_MAX_INTERVAL_MS - msSinceLastFFC;
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
          var _this$qrCode$code;

          if (timeTillFFC < 30 * 1000) {
            // Someone just left the frame, and we need to do an FFC in the next 30 seconds,
            // so now is a great time to do it early and hide it from the user.
            ObservableDeviceApi.runFFC();
          }

          ScreeningApi.recordScreeningEvent(this.deviceID, this.piSerial, this.appState.currentScreeningEvent, this.appState.currentCalibration.thresholdMinFever, (_this$qrCode$code = this.qrCode.code) === null || _this$qrCode$code === void 0 ? void 0 : _this$qrCode$code.data);
        }

        this.appState.currentScreeningEvent = null;
      } else if (this.isReferenceDevice && timeTillFFC < 30 * 1000) {
        // Someone just entered the frame, but we need to do an FFC in the next 30 seconds,
        // so do it as soon as they have entered and make them wait then, rather than in the middle of trying to
        // screen them.
        ObservableDeviceApi.runFFC();
      }

      this.appState.currentScreeningState = nextScreeningState;

      if (nextScreeningState !== ScreeningState.MEASURED) {
        this.setQRCode(null);
      }
    }

    this.appState.currentFrame = frame;
  }

  get frameInfo() {
    var _this$appState$curren2;

    return (_this$appState$curren2 = this.appState.currentFrame) === null || _this$appState$curren2 === void 0 ? void 0 : _this$appState$curren2.frameInfo;
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

  checkForSettingsChanges(deviceID) {
    ExternalDeviceSettingsApi.getDevice(deviceID).then(device => {
      if (device !== undefined) {
        const enable = device.recordUserActivity["BOOL"];
        ObservableDeviceApi.RecordUserActivity = enable;
        ObservableDeviceApi.DisableRecordUserActivity = !enable;
      } else {
        ObservableDeviceApi.DisableRecordUserActivity = false;
        ObservableDeviceApi.RecordUserActivity = window.localStorage.getItem("recordUserActivity") === "false" ? false : true;
      }
    });
  }

  async created() {
    var _network$Interfaces$f, _network$Interfaces$f2, _network$Interfaces$f3;

    let cptvFilename = "/cptv-files/0.7.5beta recording-1 2708.cptv"; //let cptvFilename = "/cptv-files/bunch of people in small meeting room 20200812.134427.735.cptv";

    const uri = window.location.search.substring(1);
    const params = new URLSearchParams(uri);

    if (params.get("cptvfile")) {
      cptvFilename = `/cptv-files/${params.get("cptvfile")}.cptv`;
      this.useLiveCamera = false;
    }

    ObservableDeviceApi.RegisterQRID = window.localStorage.getItem("registerQRID") === "false" ? false : true; // Update the AppState:

    if (this.useLiveCamera) {
      this.appState.uuid = new Date().getTime();
      await ObservableDeviceApi.stopRecording(false);
      ObservableDeviceApi.getCalibration().then(existingCalibration => {
        if (existingCalibration === null) {
          existingCalibration = Appvue_type_script_lang_ts_objectSpread({}, types_FactoryDefaultCalibration);
        }

        this.updateCalibration(existingCalibration, true);
        ObservableDeviceApi.softwareVersion().then(({
          appVersion,
          binaryVersion
        }) => {
          ObservableDeviceApi.deviceInfo().then(({
            deviceID,
            devicename,
            serial
          }) => {
            this.deviceID = deviceID;
            this.deviceName = devicename;
            this.piSerial = serial;
            const newLine = appVersion.indexOf("\n");
            let newAppVersion = appVersion;
            this.checkForSettingsChanges(deviceID);
            setInterval(() => {
              this.checkForSettingsChanges(deviceID);
            }, 1000 * 60 * 30); // Every 30 Minutes

            if (newLine !== -1) {
              newAppVersion = newAppVersion.substring(0, newLine);
            }

            this.appVersion = newAppVersion;

            if (checkForSoftwareUpdates(binaryVersion, newAppVersion, this.gotFirstFrame)) {
              this.showSoftwareVersionUpdatedPrompt = true;
            }
          });
        });
      });
    }

    const frameListener = new (frame_listener_default())();

    frameListener.onmessage = message => {
      const frameMessage = message.data;

      switch (frameMessage.type) {
        case "gotFrame":
          this.onFrame(frameMessage.payload);
          this.gotFirstFrame = true;
          break;

        case "connectionStateChange":
          this.onConnectionStateChange(frameMessage.payload);
          break;
      }
    };

    const network = await ObservableDeviceApi.networkInfo();
    this.hostname = (_network$Interfaces$f = (_network$Interfaces$f2 = network.Interfaces.find(val => val.Name === "usb0" && val.IPAddresses !== null)) === null || _network$Interfaces$f2 === void 0 ? void 0 : (_network$Interfaces$f3 = _network$Interfaces$f2.IPAddresses) === null || _network$Interfaces$f3 === void 0 ? void 0 : _network$Interfaces$f3[0].split("/")[0].replace(/\s/g, "")) !== null && _network$Interfaces$f !== void 0 ? _network$Interfaces$f : window.location.hostname;
    frameListener.postMessage({
      useLiveCamera: this.useLiveCamera,
      hostname: this.hostname,
      port: window.location.port,
      cptvFileToPlayback: cptvFilename
    });
    this.hostname = this.hostname + ":" + window.location.port;
  }

};
App = (0,tslib_es6/* __decorate */.gn)([(0,vue_property_decorator/* Component */.wA)({
  components: {
    UserFacingScreening: components_UserFacingScreening,
    VideoStream: components_VideoStream,
    QRVideo: QRCameraFeed,
    QRImage: components_QRImage
  }
})], App);
/* harmony default export */ const Appvue_type_script_lang_ts_ = (App);
;// CONCATENATED MODULE: ./src/App.vue?vue&type=script&lang=ts&
 /* harmony default export */ const src_Appvue_type_script_lang_ts_ = (Appvue_type_script_lang_ts_); 
// EXTERNAL MODULE: ./node_modules/vuetify/lib/components/VApp/VApp.js + 1 modules
var VApp = __webpack_require__(3559);
// EXTERNAL MODULE: ./node_modules/vuetify/lib/components/VSnackbar/VSnackbar.js + 1 modules
var VSnackbar = __webpack_require__(8704);
;// CONCATENATED MODULE: ./src/App.vue



;


/* normalize component */

var App_component = (0,componentNormalizer/* default */.Z)(
  src_Appvue_type_script_lang_ts_,
  render,
  staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const src_App = (App_component.exports);

/* vuetify-loader */
;








installComponents_default()(App_component, {VApp: VApp/* default */.Z,VBtn: VBtn/* default */.Z,VCard: VCard/* default */.Z,VCardActions: components_VCard/* VCardActions */.h7,VCardTitle: components_VCard/* VCardTitle */.EB,VDialog: VDialog/* default */.Z,VOverlay: VOverlay/* default */.Z,VSnackbar: VSnackbar/* default */.Z})

// EXTERNAL MODULE: ./node_modules/vuetify/lib/framework.js + 24 modules
var framework = __webpack_require__(7850);
;// CONCATENATED MODULE: ./src/plugins/vuetify.ts


vue_runtime_esm/* default.use */.Z.use(framework/* default */.Z);
/* harmony default export */ const vuetify = (new framework/* default */.Z({
  icons: {
    iconfont: "mdiSvg"
  }
}));
;// CONCATENATED MODULE: ./src/main.ts







vue_runtime_esm/* default.config.productionTip */.Z.config.productionTip = false;
const WARMUP_TIME_SECONDS = 180; // 3 mins

const FFC_SAFETY_DURATION_SECONDS = 5;
const FFC_MAX_INTERVAL_MS = 1000 * 60 * 10; // 10 mins
// A global that stores the current interpolation state - can probably become part of the vue components.

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
    head: {
      tL: {
        x: 0,
        y: 0
      },
      tR: {
        x: 0,
        y: 0
      },
      bL: {
        x: 0,
        y: 0
      },
      bR: {
        x: 0,
        y: 0
      }
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
const ObservableDeviceApi = vue_runtime_esm/* default.observable */.Z.observable(DeviceApi);
/*
//these are the *lowest* temperature in celsius for each category
let GThreshold_error = 42.5;
let GThreshold_fever = 37.8;
let GThreshold_check = 37.4;
let GThreshold_normal = 35.7;
 */

new vue_runtime_esm/* default */.Z({
  vuetify: vuetify,
  render: h => h(src_App)
}).$mount("#app");

/***/ }),

/***/ 6084:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = function() {
  return new Worker(__webpack_require__.p + "5f9e0fe6666390f4b917.worker.js");
};

/***/ }),

/***/ 5877:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = function() {
  return new Worker(__webpack_require__.p + "50af42beaa99916ae313.worker.js");
};

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = __webpack_module_cache__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/ensure chunk */
/******/ 	(() => {
/******/ 		__webpack_require__.f = {};
/******/ 		// This file contains only the entry chunk.
/******/ 		// The chunk loading function for additional chunks
/******/ 		__webpack_require__.e = (chunkId) => {
/******/ 			return Promise.all(Object.keys(__webpack_require__.f).reduce((promises, key) => {
/******/ 				__webpack_require__.f[key](chunkId, promises);
/******/ 				return promises;
/******/ 			}, []));
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get javascript chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference async chunks
/******/ 		__webpack_require__.u = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "js/" + chunkId + "." + "f577683e" + ".js";
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get mini-css chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference all chunks
/******/ 		__webpack_require__.miniCssF = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "css/" + "chunk-vendors" + "." + "2141b8b5" + ".css";
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/load script */
/******/ 	(() => {
/******/ 		var inProgress = {};
/******/ 		var dataWebpackPrefix = "frontend:";
/******/ 		// loadScript function to load a script via script tag
/******/ 		__webpack_require__.l = (url, done, key, chunkId) => {
/******/ 			if(inProgress[url]) { inProgress[url].push(done); return; }
/******/ 			var script, needAttach;
/******/ 			if(key !== undefined) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				for(var i = 0; i < scripts.length; i++) {
/******/ 					var s = scripts[i];
/******/ 					if(s.getAttribute("src") == url || s.getAttribute("data-webpack") == dataWebpackPrefix + key) { script = s; break; }
/******/ 				}
/******/ 			}
/******/ 			if(!script) {
/******/ 				needAttach = true;
/******/ 				script = document.createElement('script');
/******/ 		
/******/ 				script.charset = 'utf-8';
/******/ 				script.timeout = 120;
/******/ 				if (__webpack_require__.nc) {
/******/ 					script.setAttribute("nonce", __webpack_require__.nc);
/******/ 				}
/******/ 				script.setAttribute("data-webpack", dataWebpackPrefix + key);
/******/ 				script.src = url;
/******/ 			}
/******/ 			inProgress[url] = [done];
/******/ 			var onScriptComplete = (prev, event) => {
/******/ 				// avoid mem leaks in IE.
/******/ 				script.onerror = script.onload = null;
/******/ 				clearTimeout(timeout);
/******/ 				var doneFns = inProgress[url];
/******/ 				delete inProgress[url];
/******/ 				script.parentNode && script.parentNode.removeChild(script);
/******/ 				doneFns && doneFns.forEach((fn) => (fn(event)));
/******/ 				if(prev) return prev(event);
/******/ 			}
/******/ 			;
/******/ 			var timeout = setTimeout(onScriptComplete.bind(null, undefined, { type: 'timeout', target: script }), 120000);
/******/ 			script.onerror = onScriptComplete.bind(null, script.onerror);
/******/ 			script.onload = onScriptComplete.bind(null, script.onload);
/******/ 			needAttach && document.head.appendChild(script);
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		__webpack_require__.p = "/static/dist/";
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			143: 0
/******/ 		};
/******/ 		
/******/ 		__webpack_require__.f.j = (chunkId, promises) => {
/******/ 				// JSONP chunk loading for javascript
/******/ 				var installedChunkData = __webpack_require__.o(installedChunks, chunkId) ? installedChunks[chunkId] : undefined;
/******/ 				if(installedChunkData !== 0) { // 0 means "already installed".
/******/ 		
/******/ 					// a Promise means "currently loading".
/******/ 					if(installedChunkData) {
/******/ 						promises.push(installedChunkData[2]);
/******/ 					} else {
/******/ 						if(true) { // all chunks have JS
/******/ 							// setup Promise in chunk cache
/******/ 							var promise = new Promise((resolve, reject) => (installedChunkData = installedChunks[chunkId] = [resolve, reject]));
/******/ 							promises.push(installedChunkData[2] = promise);
/******/ 		
/******/ 							// start chunk loading
/******/ 							var url = __webpack_require__.p + __webpack_require__.u(chunkId);
/******/ 							// create error before stack unwound to get useful stacktrace later
/******/ 							var error = new Error();
/******/ 							var loadingEnded = (event) => {
/******/ 								if(__webpack_require__.o(installedChunks, chunkId)) {
/******/ 									installedChunkData = installedChunks[chunkId];
/******/ 									if(installedChunkData !== 0) installedChunks[chunkId] = undefined;
/******/ 									if(installedChunkData) {
/******/ 										var errorType = event && (event.type === 'load' ? 'missing' : event.type);
/******/ 										var realSrc = event && event.target && event.target.src;
/******/ 										error.message = 'Loading chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')';
/******/ 										error.name = 'ChunkLoadError';
/******/ 										error.type = errorType;
/******/ 										error.request = realSrc;
/******/ 										installedChunkData[1](error);
/******/ 									}
/******/ 								}
/******/ 							};
/******/ 							__webpack_require__.l(url, loadingEnded, "chunk-" + chunkId, chunkId);
/******/ 						} else installedChunks[chunkId] = 0;
/******/ 					}
/******/ 				}
/******/ 		};
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			for(moduleId in moreModules) {
/******/ 				if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 					__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 				}
/******/ 			}
/******/ 			if(runtime) var result = runtime(__webpack_require__);
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkIds[i]] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = globalThis["webpackChunkfrontend"] = globalThis["webpackChunkfrontend"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/wasm chunk loading */
/******/ 	(() => {
/******/ 		// object to store loaded and loading wasm modules
/******/ 		var installedWasmModules = {};
/******/ 		
/******/ 		function promiseResolve() { return Promise.resolve(); }
/******/ 		
/******/ 		var wasmImportedFuncCache0;
/******/ 		var wasmImportedFuncCache1;
/******/ 		var wasmImportedFuncCache2;
/******/ 		var wasmImportedFuncCache3;
/******/ 		var wasmImportedFuncCache4;
/******/ 		var wasmImportObjects = {
/******/ 			9534: function() {
/******/ 				return {
/******/ 					"./curve_fitting_bg.js": {
/******/ 						"__wbindgen_number_new": function(p0f64) {
/******/ 							if(wasmImportedFuncCache0 === undefined) wasmImportedFuncCache0 = __webpack_require__.c[476].exports;
/******/ 							return wasmImportedFuncCache0["pT"](p0f64);
/******/ 						},
/******/ 						"__wbindgen_object_drop_ref": function(p0i32) {
/******/ 							if(wasmImportedFuncCache1 === undefined) wasmImportedFuncCache1 = __webpack_require__.c[476].exports;
/******/ 							return wasmImportedFuncCache1["ug"](p0i32);
/******/ 						},
/******/ 						"__wbg_new_6b6f346b4912cdae": function() {
/******/ 							if(wasmImportedFuncCache2 === undefined) wasmImportedFuncCache2 = __webpack_require__.c[476].exports;
/******/ 							return wasmImportedFuncCache2["w_"]();
/******/ 						},
/******/ 						"__wbg_push_f353108e20ec67a0": function(p0i32,p1i32) {
/******/ 							if(wasmImportedFuncCache3 === undefined) wasmImportedFuncCache3 = __webpack_require__.c[476].exports;
/******/ 							return wasmImportedFuncCache3["TJ"](p0i32,p1i32);
/******/ 						},
/******/ 						"__wbindgen_throw": function(p0i32,p1i32) {
/******/ 							if(wasmImportedFuncCache4 === undefined) wasmImportedFuncCache4 = __webpack_require__.c[476].exports;
/******/ 							return wasmImportedFuncCache4["Or"](p0i32,p1i32);
/******/ 						}
/******/ 					}
/******/ 				};
/******/ 			},
/******/ 		};
/******/ 		
/******/ 		var wasmModuleMap = {
/******/ 			"641": [
/******/ 				9534
/******/ 			]
/******/ 		};
/******/ 		
/******/ 		// object with all WebAssembly.instance exports
/******/ 		__webpack_require__.w = {};
/******/ 		
/******/ 		// Fetch + compile chunk loading for webassembly
/******/ 		__webpack_require__.f.wasm = function(chunkId, promises) {
/******/ 		
/******/ 			var wasmModules = wasmModuleMap[chunkId] || [];
/******/ 		
/******/ 			wasmModules.forEach(function(wasmModuleId, idx) {
/******/ 				var installedWasmModuleData = installedWasmModules[wasmModuleId];
/******/ 		
/******/ 				// a Promise means "currently loading" or "already loaded".
/******/ 				if(installedWasmModuleData)
/******/ 					promises.push(installedWasmModuleData);
/******/ 				else {
/******/ 					var importObject = wasmImportObjects[wasmModuleId]();
/******/ 					var req = fetch(__webpack_require__.p + "" + {"641":{"9534":"e3f7296217571fdd8bb8"}}[chunkId][wasmModuleId] + ".module.wasm");
/******/ 					var promise;
/******/ 					if(importObject && typeof importObject.then === 'function' && typeof WebAssembly.compileStreaming === 'function') {
/******/ 						promise = Promise.all([WebAssembly.compileStreaming(req), importObject]).then(function(items) {
/******/ 							return WebAssembly.instantiate(items[0], items[1]);
/******/ 						});
/******/ 					} else if(typeof WebAssembly.instantiateStreaming === 'function') {
/******/ 						promise = WebAssembly.instantiateStreaming(req, importObject);
/******/ 					} else {
/******/ 						var bytesPromise = req.then(function(x) { return x.arrayBuffer(); });
/******/ 						promise = bytesPromise.then(function(bytes) {
/******/ 							return WebAssembly.instantiate(bytes, importObject);
/******/ 						});
/******/ 					}
/******/ 					promises.push(installedWasmModules[wasmModuleId] = promise.then(function(res) {
/******/ 						return __webpack_require__.w[wasmModuleId] = (res.instance || res).exports;
/******/ 					}));
/******/ 				}
/******/ 			});
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// module cache are used so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, [998], () => (__webpack_require__(126)))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=app.d538cb2e.js.map