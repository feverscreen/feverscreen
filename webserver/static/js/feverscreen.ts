import { BlobReader } from "./utils.js";
import {
  fahrenheitToCelsius,
  moduleTemperatureAnomaly,
  sensorAnomaly,
  ROIFeature,
  Delta,
  FeatureState
} from "./processing.js";
import { DeviceApi } from "./api.js";
import {
  CalibrationInfo,
  FrameInfo,
  Modes,
  NetworkInterface,
  TemperatureSource
} from "./feverscreen-types.js";

let GForeheads: ROIFeature[];
let GROI: ROIFeature[] = [];

// top percent to be considered forehead
const ForeheadPercent = 0.3;
const ForeheadPadding = 2;
const ForeheadColour = "#00ff00";
const ForeheadEdgeThresh = 200;

const GSensor_response = 0.030117;
const GDevice_sensor_temperature_response = -30.0;

// NOTE: These are temperature offsets from a forehead measurement.
const TemperatureOffsetArmpit = 0.0;
const TemperatureOffsetForehead = 0.0;
const TemperatureOffsetOral = 0.45;
const TemperatureOffsetEar = 0.9;

const UUID = new Date().getTime();
let frameWidth = 160;
let frameHeight = 120;

let GNoSleep: any;
let Mode: Modes = Modes.CALIBRATE;
let binaryVersion: string;
let appVersion: string;

const staleCalibrationTimeoutMinutes = 60;

// Global sound instance we need to have called .play() on inside a user interaction to be able to use it to play
// sounds later on iOS safari.
const sound = new Audio();

async function getPrompt(message: string) {
  const recalibratePrompt = document.getElementById(
    "recalibrate-prompt"
  ) as HTMLDivElement;
  return new Promise((resolve, reject) => {
    if (recalibratePrompt) {
      recalibratePrompt.classList.add("show");
      (recalibratePrompt.querySelector(
        "h2"
      ) as HTMLHeadingElement).innerHTML = message;
      (recalibratePrompt.querySelector(
        ".confirm-yes"
      ) as HTMLButtonElement).addEventListener("click", () => {
        GNoSleep.enable();
        sound.play();
        recalibratePrompt.classList.remove("show");
        resolve(true);
      });
    } else {
      throw new Error("Failed to find prompt DOM element");
    }
  });
}

const populateVersionInfo = async (element: HTMLDivElement) => {
  // TODO(jon): Add wifi signal strength indicator here
  try {
    const [versionInfo, deviceInfo, networkInfo] = await Promise.all([
      DeviceApi.softwareVersion(),
      DeviceApi.deviceInfo(),
      DeviceApi.networkInfo()
    ]);
    const activeInterface = networkInfo.Interfaces.find(
      x => x.IPAddresses !== null
    ) as NetworkInterface;
    activeInterface.IPAddresses = activeInterface.IPAddresses.map(x =>
      x.trim()
    );
    let ipv4 = activeInterface.IPAddresses[0];
    ipv4 = ipv4.substring(0, ipv4.indexOf("/"));
    const interfaceInfo = {
      LanInterface: activeInterface.Name,
      "Ipv4 Address": ipv4
    };
    versionInfo.binaryVersion = versionInfo.binaryVersion.substr(0, 10);
    const itemList = document.createElement("ul");
    for (const [key, val] of Object.entries(interfaceInfo)) {
      const listItem = document.createElement("li");
      listItem.innerHTML = `<span>${key}</span><span>${val}</span>`;
      itemList.appendChild(listItem);
    }

    for (const [key, val] of Object.entries(deviceInfo)) {
      const listItem = document.createElement("li");
      listItem.innerHTML = `<span>${key}</span><span>${val}</span>`;
      itemList.appendChild(listItem);
    }
    for (const [key, val] of Object.entries(versionInfo)) {
      const listItem = document.createElement("li");
      listItem.innerHTML = `<span>${key}</span><span>${val}</span>`;
      itemList.appendChild(listItem);
    }

    element.appendChild(itemList);
    return { versionInfo, deviceInfo, networkInfo };
  } catch (e) {
    return false;
  }
};
type BoxOffset = "left" | "right" | "top" | "bottom";
type FovBox = Record<BoxOffset, number>;

class HaarWeakClassifier {
  constructor() {
    this.internalNodes = [];
    this.leafValues = [];
  }

  internalNodes: number[];
  leafValues: number[];
}

class HaarStage {
  constructor() {
    this.stageThreshold = 0;
    this.weakClassifiers = [];
  }

  stageThreshold: number;
  weakClassifiers: HaarWeakClassifier[];
}

class HaarRect {
  constructor() {
    this.x0 = 0;
    this.y0 = 0;
    this.x1 = 0;
    this.y1 = 0;
    this.weight = 1;
  }
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  weight: number;
}

class HaarFeature {
  constructor() {
    this.rects = [];
    this.tilted = false;
  }
  rects: HaarRect[];
  tilted: Boolean;
}

class HaarCascade {
  constructor() {
    this.stages = [];
    this.features = [];
  }

  stages: HaarStage[];
  features: HaarFeature[];
}

function ConvertCascadeXML(source: Document): HaarCascade | null {
  let result = new HaarCascade();
  let stages = source.getElementsByTagName("stages").item(0);
  let features = source.getElementsByTagName("features").item(0);

  if (stages == null || features == null) {
    return null;
  }

  for (
    let featureIndex = 0;
    featureIndex < features.childNodes.length;
    featureIndex++
  ) {
    let currentFeature = features.childNodes[featureIndex] as HTMLElement;
    if (currentFeature.childElementCount === undefined) {
      continue;
    }

    let feature: HaarFeature = new HaarFeature();
    let tiltedNode = currentFeature.getElementsByTagName("tilted")[0];
    feature.tilted = tiltedNode.textContent == "1";

    let rectsNode = currentFeature.getElementsByTagName("rects")[0];
    for (let i = 0; i < rectsNode.childNodes.length; i++) {
      let cc = rectsNode.childNodes[i];
      if (cc.textContent == null) {
        continue;
      }
      let qq = cc.textContent.trim().split(" ");
      if (qq.length != 5) {
        continue;
      }
      let halfWidth = 10 / 2;
      let halfHeight = 10 / 2;
      let haarRect: HaarRect = new HaarRect();
      haarRect.x0 = Number(qq[0]) / halfWidth - 1.0;
      haarRect.y0 = Number(qq[1]) / halfHeight - 1.0;
      haarRect.x1 = haarRect.x0 + Number(qq[2]) / halfWidth;
      haarRect.y1 = haarRect.y0 + Number(qq[3]) / halfHeight;
      haarRect.weight = Number(qq[4]);
      feature.rects.push(haarRect);
    }
    result.features.push(feature);
  }

  for (
    let stageIndex = 0;
    stageIndex < stages.childNodes.length;
    stageIndex++
  ) {
    let currentStage = stages.childNodes[stageIndex] as HTMLElement;
    if (currentStage.childElementCount === undefined) {
      continue;
    }
    let stage: HaarStage = new HaarStage();

    let stageThresholdNode = currentStage.getElementsByTagName(
      "stageThreshold"
    )[0];
    stage.stageThreshold = Number(stageThresholdNode.textContent);

    let weakClassifiersNode = currentStage.getElementsByTagName(
      "weakClassifiers"
    )[0];
    let internalNodesNode = weakClassifiersNode.getElementsByTagName(
      "internalNodes"
    );
    let leafValuesNode = weakClassifiersNode.getElementsByTagName("leafValues");
    for (let i = 0; i < internalNodesNode.length; i++) {
      let txc1 = internalNodesNode[i].textContent;
      let txc2 = leafValuesNode[i].textContent;
      if (txc1 == null) {
        continue;
      }
      if (txc2 == null) {
        continue;
      }

      let haarWeakClassifier: HaarWeakClassifier = new HaarWeakClassifier();

      txc1
        .trim()
        .split(" ")
        .forEach(function(x) {
          haarWeakClassifier.internalNodes.push(Number(x));
        });
      txc2
        .trim()
        .split(" ")
        .forEach(function(x) {
          haarWeakClassifier.leafValues.push(Number(x));
        });
      stage.weakClassifiers.push(haarWeakClassifier);
    }

    result.stages.push(stage);
  }

  return result;
}

let GCascadeFace: HaarCascade | null = null;
function LoadCascadeXML() {
  // XML files from :
  //  * https://www.researchgate.net/publication/317013979_Face_Detection_on_Infrared_Thermal_Image
  //  * https://www.researchgate.net/publication/322601448_Algorithms_for_Face_Detection_on_Infrared_Thermal_Images
  fetch("/static/js/cascade_stg17.xml").then(async function(response) {
    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString(await response.text(), "text/xml");
    GCascadeFace = ConvertCascadeXML(xmlDoc);
  });
}

// Top of JS
window.onload = async function() {
  LoadCascadeXML();

  let GCalibrate_temperature_celsius = 37;
  let GCalibrate_snapshot_value = 0;
  let GCalibrate_snapshot_uncertainty = 100;
  let GCalibrate_snapshot_time = 0;

  let GCalibrate_body_location: TemperatureSource = TemperatureSource.FOREHEAD;
  let fovBox: FovBox = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  };

  //these are the *lowest* temperature in celsius for each category
  let GThreshold_error = 42.5;
  let GThreshold_fever = 37.8;
  let GThreshold_check = 37.4;
  let GThreshold_normal = 35.7;
  const thresholdColdBelowNormal = 5; // If threshold normal changes, adjust threshold cold to be 5 degrees below that.
  let GThreshold_cold = 32.5;
  let GDisplay_precision = 1;

  let GThreshold_uncertainty = 0.5;

  let GStable_correction = 0;
  let GStable_correction_accumulator = 0;
  let GStable_uncertainty = 0.7;

  let GTimeSinceFFC = 0;
  let GDuringFFC = false;

  let GCurrent_hot_value = 10;
  let GDevice_temperature = 10;
  let GRaw_hot_value = 10; // debugging

  // radial smoothing kernel.
  const kernel = new Float32Array(7);
  const radius = 3;
  let i = 0;
  for (let r = -radius; r <= radius; r++) {
    kernel[i++] = Math.exp((-4 * (r * r)) / radius / radius);
  }

  const temperatureInputCelsius = document.getElementById(
    "temperature_input_a"
  ) as HTMLInputElement;
  const temperatureInputLabel = document.getElementById(
    "temperature_label"
  ) as HTMLLabelElement;

  const calibrationOverlay = document.getElementById("myNav") as HTMLDivElement;
  const mainCanvas = document.getElementById(
    "main_canvas"
  ) as HTMLCanvasElement;
  let canvasWidth = (mainCanvas as HTMLCanvasElement).width;
  let canvasHeight = (mainCanvas as HTMLCanvasElement).height;
  const scanButton = document.getElementById(
    "scan_button"
  ) as HTMLButtonElement;
  const temperatureDiv = document.getElementById(
    "temperature_div"
  ) as HTMLDivElement;
  const temperatureInput = document.getElementById(
    "temperature_input_a"
  ) as HTMLInputElement;
  const thumbHot = document.getElementById("thumb_hot") as HTMLImageElement;
  const thumbNormal = document.getElementById(
    "thumb_normal"
  ) as HTMLImageElement;
  const thumbCold = document.getElementById("thumb_cold") as HTMLImageElement;
  const titleDiv = document.getElementById("title_div") as HTMLDivElement;
  const settingsDiv = document.getElementById("settings") as HTMLDivElement;
  const temperatureDisplay = document.getElementById(
    "temperature_display"
  ) as HTMLDivElement;
  const overlayCanvas = document.getElementById(
    "overlay-canvas"
  ) as HTMLCanvasElement;
  const canvasContainer = document.getElementById(
    "canvas-outer"
  ) as HTMLDivElement;
  const statusText = document.getElementById("status-text") as HTMLDivElement;
  const app = document.getElementById("app") as HTMLDivElement;
  const mainParent = document.getElementById("main") as HTMLDivElement;
  const mainDiv = document.getElementById("main-inner") as HTMLDivElement;
  const alertBanner = document.getElementById("alert-banner") as HTMLDivElement;
  const versionInfoElement = document.getElementById(
    "version-info"
  ) as HTMLDivElement;
  // Crop box handles
  const fovTopHandle = document.getElementById("top-handle") as HTMLDivElement;
  const fovRightHandle = document.getElementById(
    "right-handle"
  ) as HTMLDivElement;
  const fovBottomHandle = document.getElementById(
    "bottom-handle"
  ) as HTMLDivElement;
  const fovLeftHandle = document.getElementById(
    "left-handle"
  ) as HTMLDivElement;
  const fovToggleMirror = document.getElementById(
    "toggle-mirror"
  ) as HTMLDivElement;
  const fovToggleMirrorAlt = document.getElementById(
    "toggle-mirror-alt"
  ) as HTMLDivElement;
  const calibrationButton = document.getElementById(
    "calibration_button"
  ) as HTMLButtonElement;

  let temperatureSourceChanged = false;
  let thresholdChanged = false;
  (document.getElementById(
    "admin_close_button"
  ) as HTMLButtonElement).addEventListener("click", async () => {
    // Save the temperature source location if it has changed.
    if (temperatureSourceChanged || thresholdChanged) {
      thresholdChanged = false;
      temperatureSourceChanged = false;
      await DeviceApi.saveCalibration({
        SnapshotTime: GCalibrate_snapshot_time,
        TemperatureCelsius: GCalibrate_temperature_celsius,
        SnapshotValue: GCalibrate_snapshot_value,
        SnapshotUncertainty: GCalibrate_snapshot_uncertainty,
        BodyLocation: GCalibrate_body_location,
        ThresholdMinFever: GThreshold_check,
        ThresholdMinNormal: GThreshold_normal,
        Top: fovBox.top,
        Left: fovBox.left,
        Right: fovBox.right,
        Bottom: fovBox.bottom,
        CalibrationBinaryVersion: binaryVersion,
        UuidOfUpdater: UUID
      });
      setOverlayMessages("Settings saved");
      setTimeout(setOverlayMessages, 500);
    }
  });
  const setTemperatureSource = (source: TemperatureSource) => {
    GCalibrate_body_location = source;
    temperatureSourceChanged = true;
  };
  (document.getElementById("source-ear") as HTMLInputElement).addEventListener(
    "click",
    e => setTemperatureSource(TemperatureSource.EAR)
  );
  (document.getElementById(
    "source-forehead"
  ) as HTMLInputElement).addEventListener("click", e =>
    setTemperatureSource(TemperatureSource.FOREHEAD)
  );
  (document.getElementById(
    "source-armpit"
  ) as HTMLInputElement).addEventListener("click", e =>
    setTemperatureSource(TemperatureSource.ARMPIT)
  );
  (document.getElementById("source-oral") as HTMLInputElement).addEventListener(
    "click",
    e => setTemperatureSource(TemperatureSource.ORAL)
  );

  const changeFeverThreshold = (e: Event) => {
    GThreshold_check = parseFloat((e.target as HTMLInputElement).value);
    thresholdChanged = true;
  };
  const changeNormalThreshold = (e: Event) => {
    GThreshold_normal = parseFloat((e.target as HTMLInputElement).value);
    thresholdChanged = true;
  };

  (document.getElementById(
    "threshold-normal"
  ) as HTMLInputElement).addEventListener("input", changeNormalThreshold);
  (document.getElementById(
    "threshold-fever"
  ) as HTMLInputElement).addEventListener("input", changeFeverThreshold);
  (document.getElementById(
    "threshold-normal"
  ) as HTMLInputElement).addEventListener("change", changeNormalThreshold);
  (document.getElementById(
    "threshold-fever"
  ) as HTMLInputElement).addEventListener("change", changeFeverThreshold);

  const ctx = mainCanvas.getContext("2d") as CanvasRenderingContext2D;
  const setMode = (mode: Modes) => {
    Mode = mode;
    app.classList.remove(...Object.values(Modes));
    app.classList.add(mode);
  };
  setTitle("Loading");

  function onResizeViewport(e: Event | undefined = undefined) {
    const actualHeight = window.innerHeight;
    const actualWidth = window.innerWidth;
    const height = mainParent.offsetHeight - 50;
    const width = (height / 3) * 4;
    canvasContainer.style.maxWidth = `${Math.min(
      mainDiv.offsetWidth - 50,
      width
    )}px`;
    const overlayWidth = canvasContainer.offsetWidth;
    const overlayHeight = canvasContainer.offsetHeight;
    overlayCanvas.width = overlayWidth * window.devicePixelRatio;
    overlayCanvas.height = overlayHeight * window.devicePixelRatio;
    nativeOverlayWidth = overlayCanvas.width;
    nativeOverlayHeight = overlayCanvas.height;
    overlayCanvas.style.width = `${overlayWidth}px`;
    overlayCanvas.style.height = `${overlayHeight}px`;
    document.body.style.setProperty("--vw", `${actualWidth}px`);
    document.body.style.setProperty("--vh", `${actualHeight}px`);
    if (e) {
      setTimeout(onResizeViewport, 1000);
    }
  }

  let overlayCtx = overlayCanvas.getContext("2d") as CanvasRenderingContext2D;
  // Set initial size of overlay canvas to the native resolution.
  if (!localStorage.getItem("mirrorMode")) {
    localStorage.setItem("mirrorMode", "false");
  }
  let mirrorMode = JSON.parse(localStorage.getItem("mirrorMode") as string);
  if (mirrorMode) {
    overlayCanvas.classList.add("mirror");
    mainCanvas.classList.add("mirror");
  }
  function flipHorizontally() {
    mirrorMode = !mirrorMode;
    localStorage.setItem("mirrorMode", JSON.stringify(mirrorMode));
    if (mirrorMode) {
      overlayCanvas.classList.add("mirror");
      mainCanvas.classList.add("mirror");
    } else {
      overlayCanvas.classList.remove("mirror");
      mainCanvas.classList.remove("mirror");
    }
    setHandlePositions();
  }

  fovToggleMirror.addEventListener("click", flipHorizontally);
  fovToggleMirrorAlt.addEventListener("click", flipHorizontally);

  function setHandlePositions() {
    let left = mirrorMode ? fovBox.right : fovBox.left;
    let right = mirrorMode ? fovBox.left : fovBox.right;

    fovTopHandle.style.top = `${fovBox.top}%`;
    fovRightHandle.style.right = `${right}%`;
    fovBottomHandle.style.bottom = `${fovBox.bottom}%`;
    fovLeftHandle.style.left = `${left}%`;
    let offset = fovBox.top + (100 - (fovBox.bottom + fovBox.top)) * 0.5;
    fovLeftHandle.style.top = `${offset}%`;
    fovRightHandle.style.top = `${offset}%`;
    offset = left + (100 - (left + right)) * 0.5;
    fovTopHandle.style.left = `${offset}%`;
    fovBottomHandle.style.left = `${offset}%`;
    fovToggleMirror.style.top = `${fovBox.top +
      (100 - (fovBox.top + fovBox.bottom)) * 0.5}%`;
    fovToggleMirror.style.left = `${left + (100 - (left + right)) * 0.5}%`;
  }

  let overlayTextTimeout: number | undefined;
  let hotSpotX = 0;
  let hotSpotY = 0;
  let nativeOverlayWidth: number;
  let nativeOverlayHeight: number;
  {
    // Handling FOV selection by user:
    let currentTarget: HTMLDivElement | undefined;
    setHandlePositions();

    function dragHandle(event: MouseEvent | TouchEvent) {
      let position: { clientX: number; clientY: number };
      if (!(event instanceof MouseEvent)) {
        position = (event as TouchEvent).touches[0];
      } else {
        position = event;
      }
      const { clientX: x, clientY: y } = position;
      const minDimensions = 20;
      let maxInsetPercentage = 35;
      const canvasBounds = overlayCanvas.getBoundingClientRect();
      let offset;
      if (currentTarget) {
        let l: BoxOffset = mirrorMode ? "right" : "left";
        let r: BoxOffset = mirrorMode ? "left" : "right";
        switch (currentTarget.id) {
          case "top-handle":
            maxInsetPercentage = 100 - (fovBox.bottom + minDimensions);
            fovBox.top = Math.min(
              maxInsetPercentage,
              Math.max(0, 100 * ((y - canvasBounds.top) / canvasBounds.height))
            );
            fovTopHandle.style.top = `${fovBox.top}%`;
            offset = fovBox.top + (100 - (fovBox.bottom + fovBox.top)) * 0.5;
            fovLeftHandle.style.top = `${offset}%`;
            fovRightHandle.style.top = `${offset}%`;
            fovToggleMirror.style.top = `${fovBox.top +
              (100 - (fovBox.top + fovBox.bottom)) * 0.5}%`;
            break;
          case "right-handle":
            maxInsetPercentage = 100 - (fovBox[l] + minDimensions);
            fovBox[r] = Math.min(
              maxInsetPercentage,
              Math.max(0, 100 * ((canvasBounds.right - x) / canvasBounds.width))
            );
            fovRightHandle.style.right = `${fovBox[r]}%`;
            offset = fovBox[l] + (100 - (fovBox[l] + fovBox[r])) * 0.5;
            fovTopHandle.style.left = `${offset}%`;
            fovBottomHandle.style.left = `${offset}%`;
            fovToggleMirror.style.left = `${fovBox[l] +
              (100 - (fovBox[l] + fovBox[r])) * 0.5}%`;
            break;
          case "bottom-handle":
            maxInsetPercentage = 100 - (fovBox.top + minDimensions);
            fovBox.bottom = Math.min(
              maxInsetPercentage,
              Math.max(
                0,
                100 * ((canvasBounds.bottom - y) / canvasBounds.height)
              )
            );
            fovBottomHandle.style.bottom = `${fovBox.bottom}%`;
            offset = fovBox.top + (100 - (fovBox.bottom + fovBox.top)) * 0.5;
            fovLeftHandle.style.top = `${offset}%`;
            fovRightHandle.style.top = `${offset}%`;
            fovToggleMirror.style.top = `${fovBox.top +
              (100 - (fovBox.top + fovBox.bottom)) * 0.5}%`;
            break;
          case "left-handle":
            maxInsetPercentage = 100 - (fovBox[r] + minDimensions);
            fovBox[l] = Math.min(
              maxInsetPercentage,
              Math.max(0, 100 * ((x - canvasBounds.left) / canvasBounds.width))
            );
            fovLeftHandle.style.left = `${fovBox[l]}%`;
            offset = fovBox[l] + (100 - (fovBox[l] + fovBox[r])) * 0.5;
            fovTopHandle.style.left = `${offset}%`;
            fovBottomHandle.style.left = `${offset}%`;
            fovToggleMirror.style.left = `${fovBox[l] +
              (100 - (fovBox[l] + fovBox[r])) * 0.5}%`;
            break;
        }
        // Update saved fovBox:
        drawOverlay();
      }
    }

    // Handle resizes and orientation changes
    window.addEventListener("resize", onResizeViewport);
    window.addEventListener("orientationchange", onResizeViewport);
    const startDrag = (eventName: "mousemove" | "touchmove") => (e: Event) => {
      currentTarget = e.currentTarget as HTMLDivElement;
      window.addEventListener(eventName, dragHandle);
    };
    const endDrag = (eventName: "mousemove" | "touchmove") => () => {
      currentTarget = undefined;
      window.removeEventListener(eventName, dragHandle);
    };
    for (const dragHandle of [
      fovTopHandle,
      fovRightHandle,
      fovBottomHandle,
      fovLeftHandle
    ]) {
      // Mouse
      dragHandle.addEventListener("mousedown", startDrag("mousemove"));
      // Touch
      dragHandle.addEventListener("touchstart", startDrag("touchmove"));
    }
    window.addEventListener("mouseup", endDrag("mousemove"));
    window.addEventListener("touchend", endDrag("touchmove"));
  }

  setOverlayMessages("Loading...");

  (document.getElementById("warmer") as HTMLButtonElement).addEventListener(
    "click",
    () => {
      setCalibrateTemperatureSafe(GCalibrate_temperature_celsius + 0.1);
    }
  );

  (document.getElementById("cooler") as HTMLButtonElement).addEventListener(
    "click",
    () => {
      setCalibrateTemperatureSafe(GCalibrate_temperature_celsius - 0.1);
    }
  );

  calibrationButton.addEventListener("click", event => {
    if (Mode === Modes.SCAN) {
      startCalibration();
    } else if (Mode === Modes.CALIBRATE) {
      startScan(false);
    }
  });

  (document.getElementById(
    "admin_button"
  ) as HTMLButtonElement).addEventListener("click", () => {
    // Populate temperature threshold values:
    (document.getElementById(
      "threshold-normal"
    ) as HTMLInputElement).value = GThreshold_normal.toString();
    (document.getElementById(
      "threshold-fever"
    ) as HTMLInputElement).value = GThreshold_check.toString();
    openNav();
  });

  (document.getElementById(
    "admin_close_button"
  ) as HTMLButtonElement).addEventListener("click", () => {
    closeNav();
  });

  // @ts-ignore
  GNoSleep = new NoSleep();
  (document.getElementById(
    "scan_button"
  ) as HTMLButtonElement).addEventListener("click", () => {
    sound.play();
    GNoSleep.enable();
    startScan();
  });

  temperatureInputCelsius.addEventListener("input", event => {
    let entry_value = parseFloat((event.target as HTMLInputElement).value);
    if (entry_value < 75) {
      temperatureInputLabel.innerHTML = "&deg;C";
    } else {
      temperatureInputLabel.innerHTML = "&deg;F";
      entry_value = fahrenheitToCelsius(entry_value);
    }
    setCalibrateTemperature(entry_value, temperatureInputCelsius);
  });

  showLoadingSnow();
  // Set initial temperature that may have been reloaded from server.
  setCalibrateTemperature(GCalibrate_temperature_celsius);

  function isUnreasonableCalibrateTemperature(temperatureCelsius: number) {
    if (temperatureCelsius < 10 || temperatureCelsius > 90) {
      return true;
    }
    return isNaN(temperatureCelsius);
  }

  function setCalibrateTemperature(
    temperatureCelsius: number,
    excludeElement: HTMLInputElement | null = null
  ) {
    if (isUnreasonableCalibrateTemperature(temperatureCelsius)) {
      return;
    }
    GCalibrate_temperature_celsius = temperatureCelsius;
    if (excludeElement !== temperatureInput) {
      temperatureInput.value = temperatureCelsius.toFixed(GDisplay_precision);
      temperatureInputLabel.innerHTML = "&deg;C";
    }
  }

  function setCalibrateTemperatureSafe(temperature_celsius: number) {
    if (isUnreasonableCalibrateTemperature(temperature_celsius)) {
      temperature_celsius = 35.6;
    }
    setCalibrateTemperature(temperature_celsius);
  }

  function showTemperature(
    temperature_celsius: number,
    uncertainty_celsius: number
  ) {
    // Adjust temperature for different body parts:
    switch (GCalibrate_body_location) {
      case TemperatureSource.ARMPIT:
        temperature_celsius += TemperatureOffsetArmpit;
        break;
      case TemperatureSource.EAR:
        temperature_celsius += TemperatureOffsetEar;
        break;
      case TemperatureSource.ORAL:
        temperature_celsius += TemperatureOffsetOral;
        break;
      case TemperatureSource.FOREHEAD:
      default:
        // Leave unchanged, since this is our default.
        temperature_celsius += TemperatureOffsetForehead; // This is 0.0
        break;
    }

    const icons = [thumbHot, thumbNormal, thumbCold];
    let selectedIcon;
    let state = "null";
    let descriptor = "Empty";
    const prevState = Array.from(temperatureDiv.classList.values());
    let errorAltColour = false;
    if (!GDuringFFC) {
      if (uncertainty_celsius > GThreshold_uncertainty) {
        statusText.classList.add("pulse-message");
        setOverlayMessages("Please re-calibrate", "camera");
      } else {
        if (statusText.classList.contains("pulse-message")) {
          statusText.classList.remove("pulse-message");
          setOverlayMessages();
        }
      }
    }
    if (GDuringFFC) {
      descriptor = "Self-Balancing";
    } else if (temperature_celsius > GThreshold_error) {
      descriptor = "Error";
      state = "error";
      selectedIcon = thumbHot;
      if (((new Date().getTime() * 3) / 1000) & 1) {
        errorAltColour = true;
      }
    } else if (temperature_celsius > GThreshold_check) {
      descriptor = "Fever";
      state = "fever";
      selectedIcon = thumbHot;
    } else if (temperature_celsius > GThreshold_normal) {
      descriptor = "Normal";
      state = "normal";
      selectedIcon = thumbNormal;
    } else if (temperature_celsius > GThreshold_cold) {
      descriptor = "";
      state = "cold";
      selectedIcon = thumbCold;
    }
    if (Mode === Modes.SCAN) {
      const hasPrevState = prevState && prevState.length !== 0;
      if (!GDuringFFC) {
        setTitle("Scanning...");
      }
      if (
        !GDuringFFC &&
        (!hasPrevState ||
          (hasPrevState && !prevState.includes(`${state}-state`)))
      ) {
        // Play sound
        // Sounds quickly grabbed from freesound.org
        switch (state) {
          case "fever":
            sound.src = "/static/sounds/445978_9159316-lq.mp3";
            sound.play();
            break;
          case "normal":
            sound.src = "/static/sounds/341695_5858296-lq.mp3";
            sound.play();
            break;
          case "error":
            sound.src = "/static/sounds/142608_1840739-lq.mp3";
            sound.play();
            break;
        }
      }
    }
    const strC = `${temperature_celsius.toFixed(GDisplay_precision)}&deg;C`;
    let strDisplay = `<span class="msg-1">${strC}</span>`;
    strDisplay += `<span class="msg-2">${descriptor}</span>`;
    if (GDisplay_precision > 1) {
      strDisplay +=
        "<br> Temp: " +
        temperature_celsius.toFixed(GDisplay_precision) +
        "<br> UN2: &plusmn;" +
        uncertainty_celsius.toFixed(GDisplay_precision) +
        "<br> HV:" +
        (GCurrent_hot_value / 100).toFixed(GDisplay_precision) +
        "<br> HVR:" +
        (GRaw_hot_value / 100).toFixed(3) +
        "<br> Tdev:" +
        GDevice_temperature.toFixed(GDisplay_precision) +
        "&deg;C";
      strDisplay +=
        "<br> TFix:" +
        (GDevice_temperature - moduleTemperatureAnomaly(GTimeSinceFFC)).toFixed(
          GDisplay_precision
        ) +
        "&deg;C";
      strDisplay += "<br>TFC:" + GTimeSinceFFC.toFixed(1) + "s";
      strDisplay +=
        "<br>SAN:" + (sensorAnomaly(GTimeSinceFFC) / 100).toFixed(3);
      strDisplay +=
        "<br>T:" + Math.floor(new Date().getTime() - 1586751000000) + "s";
      strDisplay += "<br>SC:" + GStable_correction.toFixed(3);
      console.log(strDisplay);
      selectedIcon = undefined;
    }
    if (GDuringFFC) {
      setTitle("Please wait");
      strDisplay = "<span class='msg-1'>Self-Balancing</span>";
    }
    if (GCalibrate_snapshot_value === 0) {
      strDisplay = "<span class='msg-1'>Calibration required</span>";
    }
    temperatureDisplay.innerHTML = strDisplay;
    temperatureDiv.classList.remove(
      "error-state",
      "error2-state",
      "normal-state",
      "fever-state",
      "cold-state"
    );
    temperatureDiv.classList.add(`${state}-state`);
    if (errorAltColour) {
      temperatureDiv.classList.add(`error2-state`);
    }
    for (const icon of icons) {
      if (icon === selectedIcon) {
        icon.classList.add("selected");
      } else {
        icon.classList.remove("selected");
      }
    }
  }

  function estimatedTemperatureForValue(value: number) {
    return (
      GCalibrate_temperature_celsius +
      (value - GCalibrate_snapshot_value) * GSensor_response
    );
  }

  function estimatedUncertaintyForValue(
    value: number,
    include_calibration: boolean = true
  ) {
    return 0; //not really working, so just ignore it for now..

    let result = 0.0;

    result += 0.03; // uncertainty just from the sensor alone

    if (include_calibration) {
      let seconds_since_calibration =
        (new Date().getTime() - GCalibrate_snapshot_time) / 1000;
      result +=
        GCalibrate_snapshot_uncertainty *
        Math.min(seconds_since_calibration / 60, 1);

      if (GStable_correction === 0) {
        const worst_drift_in_10_minutes_celsius = 0.5;
        result +=
          (seconds_since_calibration * worst_drift_in_10_minutes_celsius) / 600;
      }
    }

    if (GTimeSinceFFC < 10) {
      result += 0.8;
    } else if (GTimeSinceFFC < 90) {
      result += (0.2 * (90 - GTimeSinceFFC)) / 90;
    }

    result += GStable_uncertainty;

    //...

    return result;
  }

  function setOverlayMessages(...messages: string[]) {
    let overlayHTML = "";
    for (const message of messages) {
      overlayHTML += `<span>${message}</span>`;
    }

    if (overlayHTML === "") {
      statusText.classList.remove("has-message");
      overlayTextTimeout = setTimeout(() => {
        statusText.innerHTML = overlayHTML;
      }, 500);
    } else {
      if (overlayTextTimeout !== undefined) {
        clearTimeout(overlayTextTimeout);
      }
      statusText.classList.add("has-message");
      statusText.innerHTML = overlayHTML;
    }
  }

  function showLoadingSnow(alpha: number = 1) {
    let imgData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
    let beta = 1 - alpha;
    for (let i = 0; i < imgData.data.length; i += 4) {
      const v = Math.random() * 128;
      imgData.data[i + 0] = v * alpha + imgData.data[i + 0] * beta;
      imgData.data[i + 1] = v * alpha + imgData.data[i + 1] * beta;
      imgData.data[i + 2] = v * alpha + imgData.data[i + 2] * beta;
      imgData.data[i + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);
  }

  function median_three(a: number, b: number, c: number): number {
    if (a <= b && b <= c) return b;
    if (c <= b && b <= a) return b;

    if (b <= a && a <= c) return a;
    if (c <= a && a <= b) return a;

    return c;
  }

  function median_smooth_pass(
    source: Float32Array,
    delta: number,
    swizzle: number
  ): Float32Array {
    let x0 = 2;
    let x1 = frameWidth - 2;
    let dx = 1;
    let y0 = 2;
    let y1 = frameHeight - 2;
    let dy = 1;
    if (swizzle & 1) {
      [x0, x1] = [x1, x0];
      dx = -dx;
    }
    if (swizzle & 2) {
      [y0, y1] = [y1, y0];

      dy = -dy;
    }
    for (let y = y0; y !== y1; y += dy) {
      for (let x = x0; x !== x1; x += dx) {
        let index = y * frameWidth + x;
        let current = source[index];
        const value = median_three(
          source[index - delta],
          current,
          source[index + delta]
        );
        source[index] = (current * 3 + value) / 4;
      }
    }
    return source;
  }

  function median_smooth(source: Float32Array): Float32Array {
    source = median_smooth_pass(source, 1, 0);
    source = median_smooth_pass(source, frameWidth, 0);
    source = median_smooth_pass(source, frameWidth, 3);
    source = median_smooth_pass(source, 1, 3);
    return source;
  }

  function radial_smooth_half(
    source: Float32Array,
    width: number,
    height: number
  ): Float32Array {
    const dest = new Float32Array(width * height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let indexS = y * width + x;
        let indexD = x * height + y;
        let value = 0;
        let kernel_sum = 0;

        let r0 = Math.max(-x, -radius);
        let r1 = Math.min(width - x, radius + 1);
        for (let r = r0; r < r1; r++) {
          let kernel_value = kernel[r + radius];
          value += source[indexS + r] * kernel_value;
          kernel_sum += kernel_value;
        }
        dest[indexD] = value / kernel_sum;
      }
    }
    return dest;
  }

  function radial_smooth(source: Float32Array): Float32Array {
    const temp = radial_smooth_half(source, frameWidth, frameHeight);
    // noinspection JSSuspiciousNameCombination
    const dest = radial_smooth_half(temp, frameHeight, frameWidth);
    return dest;
  }

  function add_pixel(
    dest: Float32Array,
    x: number,
    y: number,
    amount: number,
    width: number,
    height: number
  ) {
    x = ~~x;
    y = ~~y;
    if (x < 0 || y < 0) {
      return;
    }
    if (x >= width || y >= height) {
      return;
    }
    const index = y * width + x;
    dest[index] += amount;
  }

  function add_circle(
    dest: Float32Array,
    cx: number,
    cy: number,
    radius: number,
    amount: number,
    width: number,
    height: number
  ) {
    add_pixel(dest, cx + radius, cy, amount, width, height);
    add_pixel(dest, cx - radius, cy, amount, width, height);
    add_pixel(dest, cx, cy + radius, amount, width, height);
    add_pixel(dest, cx, cy - radius, amount, width, height);
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
      add_pixel(dest, cx + ix, cy + iy, amount, width, height);
      add_pixel(dest, cx - ix, cy + iy, amount, width, height);
      add_pixel(dest, cx + ix, cy - iy, amount, width, height);
      add_pixel(dest, cx - ix, cy - iy, amount, width, height);
      add_pixel(dest, cx + iy, cy + ix, amount, width, height);
      add_pixel(dest, cx - iy, cy + ix, amount, width, height);
      add_pixel(dest, cx + iy, cy - ix, amount, width, height);
      add_pixel(dest, cx - iy, cy - ix, amount, width, height);
      ix += 1;
    }
  }

  function edgeDetect(source: Float32Array) {
    const width = frameWidth;
    const height = frameHeight;
    const dest = new Float32Array(width * height);
    for (let y = 2; y < height - 2; y++) {
      for (let x = 2; x < width - 2; x++) {
        let index = y * width + x;
        let value =
          source[index] * 4 -
          source[index - 1] -
          source[index + 1] -
          source[index + width] -
          source[index - width];
        dest[index] = Math.max(value - 40, 0);
      }
    }

    return dest;
  }

  function circleDetectRadius(
    source: Float32Array,
    dest: Float32Array,
    radius: number,
    width: number,
    height: number
  ): number[] {
    radius = Math.max(radius, 0.00001);
    for (let i = 0; i < width * height; i++) {
      dest[i] = 0;
    }

    for (let y = 2; y < height - 2; y++) {
      for (let x = 2; x < width - 2; x++) {
        let index = y * width + x;
        let value = source[index];
        if (value < 1) {
          continue;
        }
        add_circle(dest, x, y, radius, 1, width, height);
      }
    }
    let result = 0;
    let rx = 0;
    let ry = 0;
    for (let y = 2; y < height - 2; y++) {
      for (let x = 2; x < width - 2; x++) {
        let index = y * width + x;
        if (result < dest[index]) {
          result = dest[index];
          rx = x;
          ry = y;
        }
      }
    }
    return [result / (2 + radius), rx, ry];
  }

  function circleDetect(
    source: Float32Array
  ): [Float32Array, number, number, number] {
    const width = frameWidth;
    const height = frameHeight;
    const dest = new Float32Array(width * height);
    let radius = 3.0;
    let bestRadius = -1;
    let bestValue = 2;
    let bestX = 0;
    let bestY = 0;

    while (radius < 20) {
      let value = 0;
      let cx = 0;
      let cy = 0;
      [value, cx, cy] = circleDetectRadius(source, dest, radius, width, height);
      if (bestValue < value) {
        bestValue = value;
        bestRadius = radius;
        bestX = cx;
        bestY = cy;
      }
      radius = ~~(radius * 1.03 + 1);
    }

    //circleDetectRadius(source, dest, bestRadius, width, height);
    return [dest, bestRadius, bestX, bestY];
  }

  function mip_scale_down(
    source: Float32Array,
    width: number,
    height: number
  ): Float32Array {
    const ww = Math.floor(width / 2);
    const hh = Math.floor(height / 2);
    const dest = new Float32Array(ww * hh);
    for (let y = 0; y < hh; y++) {
      for (let x = 0; x < ww; x++) {
        const index = y * 2 * width + x * 2;
        let sumValue = source[index];
        sumValue += source[index + 1];
        sumValue += source[index + width];
        sumValue += source[index + width + 1];
        dest[y * ww + x] = sumValue / 4;
      }
    }
    return dest;
  }

  let GMipScale1: Float32Array | null = null;
  let GMipScaleX: Float32Array | null = null;
  let GMipScaleXX: Float32Array | null = null;

  let GMipCorrect1: Float32Array | null = null;
  let GMipCorrectX: Float32Array | null = null;
  let GMipCorrectXX: Float32Array | null = null;

  function roll_stable_values() {
    if (GMipScale1 === null) {
      return;
    }
    GMipCorrect1 = GMipScale1;
    GMipCorrectX = GMipScaleX;
    GMipCorrectXX = GMipScaleXX;
    GMipScale1 = null;
    GMipScaleX = null;
    GMipScaleXX = null;

    //GStable_correction_accumulator += Math.abs(GStable_correction);
    if (GStable_correction_accumulator > 100) {
      startCalibration();
      alert("Manual recalibration needed");

      GStable_correction_accumulator = 0;
    }
    GStable_correction = 0;
  }

  function accumulate_stable_temperature(source: Float32Array) {
    let wh = source.length;
    if (GMipScale1 === null) {
      GMipScale1 = new Float32Array(wh);
      GMipScaleX = new Float32Array(wh);
      GMipScaleXX = new Float32Array(wh);
      GMipCorrect1 = null;
      GMipCorrectX = null;
      GMipCorrectXX = null;
    }
    for (let i = 0; i < wh; i++) {
      let value = source[i];
      if (value < 0 || 10000 < value) {
        console.log("superhot value " + value);
        continue;
      }
      GMipScale1[i] += 1;
      (GMipScaleX as Float32Array)[i] += value;
      (GMipScaleXX as Float32Array)[i] += value * value;
    }
  }

  function stable_mean(source: Float32Array) {
    let i0 = Math.floor(source.length / 4);
    let i1 = source.length - i0;
    let sum = 0;
    let count = 0;
    for (let i = i0; i < i1; i++) {
      sum += source[i];
      count += 1;
    }
    return sum / count;
  }

  function correct_stable_temperature(source: Float32Array): boolean {
    GStable_correction = 0;

    let mip_1 = GMipCorrect1;
    let mip_x = GMipCorrectX;
    let mip_xx = GMipCorrectXX;
    if (mip_1 === null) {
      mip_1 = GMipScale1;
      mip_x = GMipScaleX;
      mip_xx = GMipScaleXX;
    }

    if (mip_1 === null) {
      //Todo: check GTimeSinceFFC here and return false
      GStable_uncertainty = 0.7;
      return true;
    }

    let wh = source.length;
    let bucket_variation = new Float32Array(wh);
    let endCursor = 0;
    for (let index = 0; index < wh; index++) {
      let value = source[index];

      let exp_1 = mip_1[index];
      if (exp_1 < 9 * 10) {
        continue;
      }
      let exp_x = (mip_x as Float32Array)[index] / exp_1;
      let exp_xx = (mip_xx as Float32Array)[index] / exp_1;
      let inner = Math.max(0, exp_xx - exp_x * exp_x);
      let std_dev = Math.sqrt(inner);
      let abs_err = Math.abs(exp_x - value);
      if (std_dev < 15 && abs_err < 150) {
        bucket_variation[endCursor++] = exp_x - value;
      }
    }
    if (endCursor < 20) {
      GStable_uncertainty = 0.5;
      GStable_correction = 0;
      return true;
    }
    bucket_variation = bucket_variation.slice(0, endCursor);
    bucket_variation.sort();
    GStable_correction = stable_mean(bucket_variation);
    GStable_uncertainty = 0.1;
    return true;
  }

  function extractSensorValue(
    r: ROIFeature,
    source: Float32Array,
    width: number,
    height: number
  ) {
    const x0 = ~~r.x0;
    const y0 = ~~r.y0;
    const x1 = ~~r.x1;
    const y1 = ~~r.y1;
    let sv_raw = [];
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        let index = y * width + x;
        sv_raw.push(source[index]);
      }
    }
    sv_raw.sort();
    let svrl = sv_raw.length;
    let i0 = Math.floor(svrl * 0.5);
    let i1 = Math.floor(svrl * 0.9 + 1);
    let sv_sum = 0;
    for (let i = i0; i < i1; i++) {
      sv_sum += sv_raw[i];
    }
    let sv_value = sv_sum / (i1 - i0);
    return sv_value;
  }

  function update_stable_temperature(
    source: Float32Array,
    width: number,
    height: number
  ): boolean {
    while (width > 16) {
      source = mip_scale_down(source, width, height);
      width = Math.floor(width / 2);
      height = Math.floor(height / 2);
    }

    if (GTimeSinceFFC > 120) {
      accumulate_stable_temperature(source);
    } else {
      roll_stable_values();
    }
    // NOTE(jon): Always returns `true`...
    return correct_stable_temperature(source);
  }

  function ExcludedBB(x: number, y: number) {
    for (let i = 0; i < GROI.length; i++) {
      let r = GROI[i];
      if (r.flavor != "Circle") {
        continue;
      }
      let s = 10;
      if (x < r.x0 - s) {
        continue;
      }
      if (r.x1 + s < x) {
        continue;
      }
      if (y < r.y0 - s) {
        continue;
      }
      if (r.y1 + s < y) {
        continue;
      }
      return true;
    }
    return false;
  }

  function buildSAT(
    source: Float32Array,
    width: number,
    height: number
  ): [Float32Array, Float32Array, Float32Array] {
    const dest = new Float32Array((width + 2) * (height + 3));
    const destSq = new Float32Array((width + 2) * (height + 3));
    const destTilt = new Float32Array((width + 2) * (height + 3));
    const w2 = width + 2;

    let vMin = source[0];
    let vMax = source[0];
    for (let i = 0; i < width * height; i++) {
      vMin = Math.min(vMin, source[i]);
      vMax = Math.max(vMax, source[i]);
    }
    let rescale = 1; //255/(vMax-vMin);

    for (let y = 0; y <= height; y++) {
      let runningSum = 0;
      let runningSumSq = 0;
      for (let x = 0; x <= width; x++) {
        const indexS = Math.min(y, height - 1) * width + Math.min(x, width - 1);
        const indexD = (y + 2) * w2 + (x + 1);
        const value = (source[indexS] - vMin) * rescale;

        runningSum += value;
        runningSumSq += value * value;

        dest[indexD] = dest[indexD - w2] + runningSum;
        destSq[indexD] = destSq[indexD - w2] + runningSumSq;
        let tiltValue = value;
        tiltValue -= destTilt[indexD - w2 - w2];
        tiltValue += destTilt[indexD - w2 - 1];
        tiltValue += destTilt[indexD - w2 + 1];
        if (y > 0) {
          tiltValue += (source[indexS - width] - vMin) * rescale;
        }
        destTilt[indexD] = tiltValue;
      }
    }
    return [dest, destSq, destTilt];
  }

  function evaluateFeature(
    feature: HaarFeature,
    satData: Float32Array[],
    width: number,
    height: number,
    mx: number,
    my: number,
    scale: number
  ) {
    const w2 = width + 2;
    let result: number = 0;
    let sat = satData[0];
    let tilted = satData[2];
    for (let i = 0; i < feature.rects.length; i++) {
      let r = feature.rects[i];
      let value = 0;
      if (feature.tilted) {
        let rw = r.x1 - r.x0;
        let rh = r.y1 - r.y0;
        let x1 = ~~(mx + 1 + scale * r.x0);
        let y1 = ~~(my + 1 + scale * r.y0);
        let x2 = ~~(mx + 1 + scale * (r.x0 + rw));
        let y2 = ~~(my + 1 + scale * (r.y0 + rw));
        let x3 = ~~(mx + 1 + scale * (r.x0 - rh));
        let y3 = ~~(my + 1 + scale * (r.y0 + rh));
        let x4 = ~~(mx + 1 + scale * (r.x0 + rw - rh));
        let y4 = ~~(my + 1 + scale * (r.y0 + rw + rh));

        value += tilted[x4 + y4 * w2];
        value -= tilted[x3 + y3 * w2];
        value -= tilted[x2 + y2 * w2];
        value += tilted[x1 + y1 * w2];
      } else {
        let x0 = ~~(mx + 1 + r.x0 * scale);
        let y0 = ~~(my + 2 + r.y0 * scale);
        let x1 = ~~(mx + 1 + r.x1 * scale);
        let y1 = ~~(my + 2 + r.y1 * scale);

        value += sat[x0 + y0 * w2];
        value -= sat[x0 + y1 * w2];
        value -= sat[x1 + y0 * w2];
        value += sat[x1 + y1 * w2];
      }
      result += value * r.weight;
    }
    return result;
  }

  function evalHaar(
    cascade: HaarCascade,
    satData: Float32Array[],
    mx: number,
    my: number,
    scale: number
  ) {
    let w2 = frameWidth + 2;
    let bx0 = ~~(mx + 1 - scale);
    let by0 = ~~(my + 2 - scale);
    let bx1 = ~~(mx + 1 + scale);
    let by1 = ~~(my + 2 + scale);
    let sat = satData[0];
    let satSq = satData[1];
    let recipArea = 1.0 / ((bx1 - bx0) * (by1 - by0));
    let sumB =
      recipArea *
      (sat[bx1 + by1 * w2] -
        sat[bx0 + by1 * w2] -
        sat[bx1 + by0 * w2] +
        sat[bx0 + by0 * w2]);
    let sumBSq =
      recipArea *
      (satSq[bx1 + by1 * w2] -
        satSq[bx0 + by1 * w2] -
        satSq[bx1 + by0 * w2] +
        satSq[bx0 + by0 * w2]);

    let determinant = sumBSq - sumB * sumB;
    if (determinant < 1024) {
      return -1;
    }

    let sd = Math.sqrt(Math.max(10, determinant));

    for (let i = 0; i < cascade.stages.length; i++) {
      let stage = cascade.stages[i];
      let stageSum = 0;
      for (let j = 0; j < stage.weakClassifiers.length; j++) {
        let weakClassifier = stage.weakClassifiers[j];
        let featureIndex = weakClassifier.internalNodes[2];
        let feature = cascade.features[featureIndex];
        let ev = evaluateFeature(
          feature,
          satData,
          frameWidth,
          frameHeight,
          mx,
          my,
          scale
        );

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

  function scanHaar(
    cascade: HaarCascade,
    satData: Float32Array[]
  ): ROIFeature[] {
    //https://stackoverflow.com/questions/41887868/haar-cascade-for-face-detection-xml-file-code-explanation-opencv
    //https://github.com/opencv/opencv/blob/master/modules/objdetect/src/cascadedetect.hpp

    let result = [];
    let scale = 10;
    let border = 2;
    while (scale < frameHeight / 2) {
      let skipper = scale * 0.05;
      for (
        let x = border + scale;
        x + scale + border < frameWidth;
        x += skipper
      ) {
        for (
          let y = border + scale;
          y + scale + border < frameHeight;
          y += skipper
        ) {
          let ev = evalHaar(cascade, satData, x, y, scale);
          if (ev > 999) {
            let r = new ROIFeature();
            r.flavor = "Face";
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
      }
      scale *= 1.25;
    }
    return result;
  }

  function insertThermalReference(roi: ROIFeature[], r: ROIFeature) {
    let bestX = r.midX();
    let bestY = r.midY();
    let s = 1 + r.width() / 6;
    for (let i = 0; i < roi.length; i++) {
      if (roi[i].overlap(bestX - s, bestY - s, bestX + s, bestY + s)) {
        roi[i] = r;
        return roi;
      }
    }
    roi.push(r);
    return roi;
  }

  function circleStillPresent(
    r: ROIFeature,
    saltPepperData: Float32Array,
    edgeData: Float32Array
  ) {
    const width = frameWidth;
    const height = frameHeight;
    const dest = new Float32Array(width * height);
    let value = 0;
    let cx = 0;
    let cy = 0;
    let radius = (r.x1 - r.x0) * 0.5;

    [value, cx, cy] = circleDetectRadius(edgeData, dest, radius, width, height);
    if (!r.contains(cx, cy)) {
      return false;
    }
    let sensorValue = extractSensorValue(
      r,
      saltPepperData,
      frameWidth,
      frameHeight
    );
    r.sensorValue = lowPassNL(r.sensorValue, sensorValue);
    return true;
  }

  function detectThermalReference(
    roi: ROIFeature[],
    saltPepperData: Float32Array,
    smoothedData: Float32Array,
    width: number,
    height: number
  ) {
    //   const edgeData = edgeDetect(saltPepperData);
    const edgeData = edgeDetect(smoothedData);

    if (GROI.length > 0) {
      let prevTherm = GROI[GROI.length - 1];
      if (prevTherm.flavor == "Circle") {
        if (circleStillPresent(prevTherm, saltPepperData, edgeData)) {
          return insertThermalReference(roi, prevTherm);
        }
      }
    }

    let circle_image;
    let bestRadius;
    let bestX;
    let bestY;
    [circle_image, bestRadius, bestX, bestY] = circleDetect(edgeData);

    if (bestRadius <= 0) {
      return roi;
    }
    let r = new ROIFeature();
    r.flavor = "Circle";
    r.x0 = bestX - bestRadius;
    r.y0 = bestY - bestRadius;
    r.x1 = bestX + bestRadius;
    r.y1 = bestY + bestRadius;
    r.sensorValue = extractSensorValue(
      r,
      saltPepperData,
      frameWidth,
      frameHeight
    );

    return insertThermalReference(roi, r);
  }

  function lowPassNL(x: number, y: number) {
    if (Math.abs(x - y) > 20) {
      return y; // Temp change too much for filter.
    }
    //Temporal filtering
    let alpha = 0.3; // Heat up fast
    if (x > y) {
      alpha = 0.9; // Cool down slow
    }
    return x * alpha + y * (1 - alpha);
  }

  //  uses the sobel operator, to return the intensity and direction of edge at
  // index
  function sobelEdge(
    source: Float32Array,
    index: number,
    width: number
  ): [number, number] {
    const x = sobelX(source, index, width);
    const y = sobelY(source, index, width);

    return [Math.sqrt(x * x + y * y), Math.atan(y / x)];
  }

  function sobelY(source: Float32Array, index: number, width: number): number {
    return (
      -source[index - 1 - width] -
      2 * source[index - width] -
      source[index - width + 1] +
      source[index - 1 + width] +
      2 * source[index + width] +
      source[index + width + 1]
    );
  }

  function sobelX(source: Float32Array, index: number, width: number): number {
    return (
      -source[index - 1 - width] +
      source[index + 1 - width] -
      2 * source[index - 1] +
      2 * source[index + 1] -
      source[index - 1 + width] +
      source[index + 1 + width]
    );
  }

  function featureLine(x: number, y: number): ROIFeature {
    let line = new ROIFeature();
    line.y0 = y;
    line.y1 = y;
    line.x0 = x;
    line.x1 = x;
    line.state = FeatureState.Outside;
    return line;
  }

  // scan left to right of the range of faceX
  // at each x detect edges of the face with a vertical line
  // returns the longest y line
  function yScan(
    source: Float32Array,
    faceX: ROIFeature,
    roi: ROIFeature,
    endFaceY: number | null
  ): ROIFeature | undefined {
    let endY;
    let midY;

    if (endFaceY) {
      midY = ~~((roi.y0 + endFaceY) / 2);
      endY = Math.min(frameHeight - 1, endFaceY);
    } else {
      midY = ~~roi.midY();
      endY = Math.min(frameHeight - 1, ~~roi.y1 - 1);
    }
    let longestLine;

    for (let x = ~~faceX.x0 + 1; x < ~~faceX.x1 - 1; x++) {
      let faceY = featureLine(x, -1);
      for (let y = ~~roi.y0 + 1; y < endY; y++) {
        let index = y * frameWidth + x;
        let [intensity, direction] = sobelEdge(source, index, frameWidth);
        if (y == midY) {
          // end any previous state
          nextYState(faceY, false);
        }
        let edge = detectYEdge(faceY, y, midY, intensity, direction);
        nextYState(faceY, edge);
      }

      if (faceY.hasYValues() && faceY.higher(longestLine)) {
        longestLine = faceY;
      }
    }
    return longestLine;
  }

  // for the line defined by faceY
  // check if the edge  values (intensity, direction) justify an edge
  function detectYEdge(
    faceY: ROIFeature,
    y: number,
    midY: number,
    intensity: number,
    direction: number
  ) {
    if (intensity - ForeheadEdgeThresh < 0) {
      return false;
    }

    if (y < midY) {
      if (
        faceY.state == FeatureState.Inside ||
        (direction > -Math.PI / 4 - 0.5 && direction < Math.PI / 4 - 0.5)
      ) {
        return false;
      }

      //get strongest gradient of topmost edge
      if (faceY.y0 == -1) {
        faceY.y0 = y;
        faceY.sensorY = intensity;
      } else if (faceY.onEdge() && intensity > faceY.sensorY) {
        faceY.sensorY = intensity;
        faceY.y0 = y;
      }
    } else {
      if (direction < -Math.PI / 4 - 0.5 || direction > Math.PI / 4 + 0.5) {
        return false;
      }

      //get strongest gradient of bottommost edge
      if (faceY.onEdge()) {
        if (intensity > faceY.sensorY) {
          faceY.sensorY = intensity;
          faceY.y1 = y;
        }
      } else {
        faceY.y1 = y;
        faceY.sensorY = intensity;
      }
    }
    return true;
  }

  function nextXState(r: ROIFeature, edge: boolean) {
    if (r.state == FeatureState.Outside && edge) {
      r.state = FeatureState.LeftEdge;
    } else if (r.state == FeatureState.LeftEdge && !edge) {
      r.state = FeatureState.Inside;
    } else if (r.state == FeatureState.Inside && edge) {
      r.state = FeatureState.RightEdge;
    } else if (r.state == FeatureState.RightEdge && !edge) {
      r.state = FeatureState.Outside;
    } else if (r.state == FeatureState.Outside && edge) {
      r.state = FeatureState.RightEdge;
    }
  }

  function nextYState(r: ROIFeature, edge: boolean) {
    if (r.state == FeatureState.Outside && edge) {
      r.state = FeatureState.TopEdge;
    } else if (r.state == FeatureState.TopEdge && !edge) {
      r.state = FeatureState.Inside;
    } else if (r.state == FeatureState.Inside && edge) {
      r.state = FeatureState.BottomEdge;
    } else if (r.state == FeatureState.BottomEdge && !edge) {
      r.state = FeatureState.Outside;
    } else if (r.state == FeatureState.Outside && edge) {
      r.state = FeatureState.BottomEdge;
    }
  }

  // for the line defined by faceY
  // check if the edge  values (intensity, direction) justify an edge
  function detectXEdge(
    faceX: ROIFeature,
    x: number,
    midX: number,
    intensity: number,
    direction: number
  ): boolean {
    if (intensity - ForeheadEdgeThresh < 0) {
      return false;
    }
    if (x < midX) {
      if (
        FeatureState.Inside == faceX.state ||
        direction < -0.5 ||
        direction > Math.PI / 2 + 0.5
      ) {
        return false;
      }

      // get strong gradient of left most edge
      if (faceX.state == FeatureState.Outside) {
        faceX.x0 = x;
        faceX.sensorX = intensity;
      } else if (faceX.onEdge() && intensity > faceX.sensorX) {
        faceX.sensorX = intensity;
        faceX.x0 = x;
      }
    } else {
      if (direction > 0.5 && direction < Math.PI / 2 - 0.5) {
        return false;
      }

      // get strongest gradient of right most edge
      if (faceX.onEdge()) {
        if (intensity > faceX.sensorX) {
          faceX.sensorX = intensity;
          faceX.x1 = x;
        }
      } else {
        faceX.x1 = x;
        faceX.sensorX = intensity;
      }
    }
    return true;
  }

  // scan top to bottom of the range of faceY
  // at each y detect edges of the face with a horizontal line
  // attempts to find the end of the face by the width decreasing then increasing
  // returns the longest horizontal line, and suspected end of the face y
  function xScan(
    source: Float32Array,
    faceY: ROIFeature,
    roi: ROIFeature
  ): [ROIFeature | undefined, number | null] {
    let longestLine;
    let deltaIncreased = false;
    let widthDelta = new Delta();
    const midX = ~~roi.midX();
    for (let y = ~~faceY.y0 + 1; y < ~~faceY.y1 - 1; y++) {
      let faceX = featureLine(-1, y);
      for (let x = ~~roi.x0 + 1; x < ~~roi.x1 - 1; x++) {
        if (x == midX) {
          // end any previous edges
          nextXState(faceX, false);
        }
        let index = y * frameWidth + x;
        let [intensity, diretion] = sobelEdge(source, index, frameWidth);
        let edgeDetected = detectXEdge(faceX, x, midX, intensity, diretion);
        nextXState(faceX, edgeDetected);
      }

      if (faceX.hasXValues()) {
        widthDelta.add(faceX.width());

        if (
          deltaIncreased &&
          widthDelta.state == 1 &&
          widthDelta.prevState == -1
        ) {
          return [longestLine as ROIFeature, y];
        } else if (widthDelta.state == 1) {
          // gotta get bigger first
          deltaIncreased = true;
        }

        if (faceX.wider(longestLine)) {
          longestLine = faceX;
        }
      }
    }
    return [longestLine, null];
  }

  // scan the haar detected rectangle along y axis, to find range of x values,
  // then along the x axis to find the range of y values
  // choose the biggest x and y value to define xRad and yRad of the head
  function detectForehead(
    roi: ROIFeature,
    source: Float32Array
  ): ROIFeature | null {
    let [faceX, endY] = xScan(source, roi, roi);
    if (!faceX) {
      faceX = roi;
    }
    let faceY = yScan(source, faceX, roi, endY);
    if (!faceY) {
      return null;
    }

    let forehead = new ROIFeature();
    forehead.y0 = faceY.y0 - ForeheadPadding;
    forehead.y1 = faceY.y0 + faceY.height() * ForeheadPercent + ForeheadPadding;
    forehead.x0 = faceX.x0 - ForeheadPadding;
    forehead.x1 = faceX.x1 + ForeheadPadding;
    return forehead;
  }

  function setSimpleHotSpot(r: ROIFeature, source: Float32Array) {
    for (let y = ~~r.y0; y < ~~r.y1; y++) {
      for (let x = ~~r.x0; x < ~~r.x1; x++) {
        let index = y * frameWidth + x;
        let current = source[index];
        if (r.sensorValue < current) {
          r.sensorValue = current;
          r.sensorX = x;
          r.sensorY = y;
        }
      }
    }
  }

  function featureDetect(
    saltPepperData: Float32Array,
    smoothedData: Float32Array,
    width: number,
    height: number
  ) {
    //zero knowledge..
    let roi: ROIFeature[] = [];

    if (GCascadeFace != null) {
      const satData = buildSAT(smoothedData, width, height);
      let roiScan = scanHaar(GCascadeFace, satData);
      roi = roi.concat(roiScan);
    }

    roi = detectThermalReference(
      roi,
      saltPepperData,
      smoothedData,
      width,
      height
    );
    GForeheads = [];
    for (let i = 0; i < roi.length; i++) {
      if (roi[i].flavor != "Circle") {
        let forehead = detectForehead(roi[i], smoothedData);
        if (forehead) {
          setSimpleHotSpot(forehead, smoothedData);
          GForeheads.push(forehead);
        } else {
          setSimpleHotSpot(roi[i], smoothedData);
        }
      }
    }

    GROI = roi;
    return roi;
  }

  // TODO(jon): Make this into a pure function, which returns the mutated calibration context.
  function processSnapshotRaw(
    source: Float32Array,
    frameInfo: FrameInfo,
    timeSinceFFC: number
  ) {
    {
      //Spatial preprocessing of the data...

      //First use a salt'n'pepper median filter
      // https://en.wikipedia.org/wiki/Shot_noise
      const saltPepperData = median_smooth(source);

      //next, a radial blur, this averages out surrounding pixels, trading accuracy for effective resolution
      const smoothedData = radial_smooth(saltPepperData);
      source = smoothedData;

      const features = featureDetect(
        saltPepperData,
        smoothedData,
        frameWidth,
        frameHeight
      );
    }

    GDevice_temperature = frameInfo.Telemetry.TempC;
    let device_temperature = GDevice_temperature;

    // In our temperature range, once it has warmed up,
    //  an FFC causes a change in module temperature
    //  that is mostly time dependent.
    device_temperature -= moduleTemperatureAnomaly(timeSinceFFC);

    let sensor_correction = 0;

    // In our temperature range, with our particular IR cover,
    //  an FFC event gives rise to a change in sensor values
    //  that is mostly time dependent.
    sensor_correction -= sensorAnomaly(timeSinceFFC);

    // In our temperature range, with our particular IR cover,
    //  a constant temperature person
    //  with a change in device temperature,
    //  changes the sensor values by this amount
    sensor_correction +=
      device_temperature * GDevice_sensor_temperature_response;

    //Apply the correction
    for (let index = 0; index < frameWidth * frameHeight; index++) {
      source[index] += sensor_correction;
    }

    let usv = update_stable_temperature(source, frameWidth, frameHeight);
    // NOTE(jon): In what circumstance can this be false?
    if (!usv) {
      return;
    }

    const x0 = Math.floor((frameWidth / 100) * fovBox.left);
    const x1 = frameWidth - Math.floor((frameWidth / 100) * fovBox.right);
    const y0 = Math.floor((frameHeight / 100) * fovBox.top);
    const y1 = frameHeight - Math.floor((frameHeight / 100) * fovBox.bottom);

    let darkValue = 1.0e8;
    let hotValue = -1.0e8;

    for (let y = y0; y !== y1; y++) {
      for (let x = x0; x !== x1; x++) {
        let index = y * frameWidth + x;
        let current = source[index];
        if (darkValue > current) {
          darkValue = current;
        }
        if (hotValue < current) {
          if (!ExcludedBB(x, y)) {
            hotValue = current;
            hotSpotX = x;
            hotSpotY = y;
          }
        }
      }
    }

    if (false) {
      hotSpotX = frameWidth / 2;
      hotSpotY = frameHeight / 2;
      hotValue = source[hotSpotY * frameHeight + hotSpotX];
    }

    let raw_hot_value = hotValue;
    GRaw_hot_value = hotValue - sensor_correction;

    let stable_fix_factor = 1 - (timeSinceFFC - 120) / 60;
    stable_fix_factor = Math.min(Math.max(stable_fix_factor, 0), 1);
    const stable_fix_amount = stable_fix_factor * GStable_correction;
    hotValue += stable_fix_amount;

    GCurrent_hot_value = lowPassNL(GCurrent_hot_value, hotValue);

    let feverThreshold = 1 << 16;
    let checkThreshold = 1 << 16;

    if (Mode === Modes.CALIBRATE) {
      GCalibrate_snapshot_value = GCurrent_hot_value;
      GCalibrate_snapshot_uncertainty = estimatedUncertaintyForValue(
        GCurrent_hot_value,
        false
      );
      GCalibrate_snapshot_time = new Date().getTime();
      checkThreshold = raw_hot_value - 20;
    }
    if (Mode === Modes.SCAN) {
      const temperature = estimatedTemperatureForValue(GCurrent_hot_value);
      let uncertainty = estimatedUncertaintyForValue(GCurrent_hot_value);
      uncertainty = Math.max(uncertainty, 0.1 ** GDisplay_precision);

      showTemperature(temperature, uncertainty);
      feverThreshold =
        (GThreshold_fever - GCalibrate_temperature_celsius) / GSensor_response +
        GCalibrate_snapshot_value -
        stable_fix_amount;
      checkThreshold =
        (GThreshold_check - GCalibrate_temperature_celsius) / GSensor_response +
        GCalibrate_snapshot_value -
        stable_fix_amount;
    }

    const dynamicRange = (255 * 255) / (raw_hot_value - darkValue);
    const scaleData = source;
    let imgData = ctx.createImageData(frameWidth, frameHeight);

    let p = 0;
    for (const f32Val of scaleData) {
      let v = (f32Val - darkValue) * dynamicRange;
      v = Math.sqrt(Math.max(v, 0)); // gamma correct
      let r = v;
      let g = v;
      let b = v;
      if (feverThreshold < f32Val) {
        r = 255;
        g *= 0.5;
        b *= 0.5;
      } else if (checkThreshold < f32Val) {
        r = 192;
        g = 192;
        b *= 0.5;
      }
      imgData.data[p] = r;
      imgData.data[p + 1] = g;
      imgData.data[p + 2] = b;
      imgData.data[p + 3] = 255;
      p += 4;
    }
    ctx.putImageData(imgData, 0, 0);

    clearOverlay();
    if (!GDuringFFC) {
      drawOverlay();
    }
  }

  function clearOverlay() {
    overlayCtx.clearRect(0, 0, nativeOverlayWidth, nativeOverlayHeight);
  }

  function drawOverlay() {
    clearOverlay();
    let scaleX = nativeOverlayWidth / canvasWidth;
    let scaleY = nativeOverlayHeight / frameHeight;

    overlayCtx.lineWidth = 3 * window.devicePixelRatio;
    GROI.forEach(function(roi) {
      if (roi.flavor == "Circle") {
        let mx = (roi.x0 + roi.x1) * 0.5 * scaleX;
        let my = (roi.y0 + roi.y1) * 0.5 * scaleY;
        let mrad = (roi.x1 - roi.x0) * 0.5 * (nativeOverlayWidth / canvasWidth);
        overlayCtx.beginPath();
        overlayCtx.arc(mx, my, mrad, 0, 2 * Math.PI, false);
        overlayCtx.strokeStyle = "#0000ff";
        overlayCtx.fillStyle = "#20207f";
        overlayCtx.stroke();
        overlayCtx.fill();
        overlayCtx.textAlign = "center";
        overlayCtx.font = "20px Arial";
        overlayCtx.fillText(
          "DRef:" + (roi.sensorValue / 100).toFixed(2),
          mx,
          my - mrad
        );
      } else {
        overlayCtx.beginPath();
        overlayCtx.strokeStyle = "#0000ff";
        overlayCtx.rect(
          roi.x0 * scaleX,
          roi.y0 * scaleY,
          (roi.x1 - roi.x0) * scaleX,
          (roi.y1 - roi.y0) * scaleY
        );
        overlayCtx.stroke();
        overlayCtx.textAlign = "left";
        overlayCtx.font = "20px Arial";
        overlayCtx.fillText(
          "DFace:" + (roi.sensorValue / 100).toFixed(1),
          roi.x0 * scaleX,
          roi.y0 * scaleY
        );
      }
    });
    GForeheads.forEach(function(roi) {
      drawTargetCircle(roi.sensorX, roi.sensorY);
      overlayCtx.beginPath();
      overlayCtx.strokeStyle = ForeheadColour;
      overlayCtx.rect(
        roi.x0 * scaleX,
        roi.y0 * scaleY,
        (roi.x1 - roi.x0) * scaleX,
        (roi.y1 - roi.y0) * scaleY
      );
      overlayCtx.stroke();
    });

    // Draw the fov bounds
    const overlay = new Path2D();
    overlay.rect(0, 0, nativeOverlayWidth, nativeOverlayHeight);
    let leftInset = 0;
    let rightInset = 0;
    let topInset = 0;
    let bottomInset = 0;
    if (fovBox.left) {
      leftInset = (nativeOverlayWidth / 100) * fovBox.left;
    }
    if (fovBox.right) {
      rightInset = (nativeOverlayWidth / 100) * fovBox.right;
    }
    if (fovBox.top) {
      topInset = (nativeOverlayHeight / 100) * fovBox.top;
    }
    if (fovBox.bottom) {
      bottomInset = (nativeOverlayHeight / 100) * fovBox.bottom;
    }
    overlay.rect(
      leftInset,
      topInset,
      nativeOverlayWidth - (rightInset + leftInset),
      nativeOverlayHeight - (bottomInset + topInset)
    );
    overlayCtx.fillStyle = "rgba(0, 0, 0, 0.5)";
    overlayCtx.fill(overlay, "evenodd");

    drawTargetCircle(hotSpotX, hotSpotY);
  }

  function drawTargetCircle(xx: number, yy: number) {
    overlayCtx.beginPath();
    overlayCtx.arc(
      (xx * nativeOverlayWidth) / canvasWidth,
      (yy * nativeOverlayHeight) / frameHeight,
      30 * window.devicePixelRatio,
      0,
      2 * Math.PI,
      false
    );
    overlayCtx.lineWidth = 3 * window.devicePixelRatio;
    overlayCtx.strokeStyle = "#ff0000";
    overlayCtx.stroke();
  }

  let animatedSnow: number | undefined;

  function showAnimatedSnow(alpha = 0.5) {
    showLoadingSnow(alpha);
    animatedSnow = setTimeout(() => showAnimatedSnow(alpha), 1000 / 8.7);
  }

  function openNav() {
    calibrationOverlay.classList.add("show");
  }

  function closeNav() {
    calibrationOverlay.classList.remove("show");
  }

  function setTitle(text: string) {
    titleDiv.innerText = text;
  }

  function startCalibration() {
    calibrationButton.classList.add("calibrating");
    setMode(Modes.CALIBRATE);
    setOverlayMessages();
    settingsDiv.classList.add("show-calibration");
    setTitle("Calibrate");
  }

  async function startScan(shouldSaveCalibration = true) {
    if (shouldSaveCalibration) {
      await DeviceApi.saveCalibration({
        SnapshotTime: GCalibrate_snapshot_time,
        TemperatureCelsius: GCalibrate_temperature_celsius,
        SnapshotValue: GCalibrate_snapshot_value,
        SnapshotUncertainty: GCalibrate_snapshot_uncertainty,
        BodyLocation: GCalibrate_body_location,
        ThresholdMinNormal: GThreshold_normal,
        ThresholdMinFever: GThreshold_check,
        Top: fovBox.top,
        Left: fovBox.left,
        Right: fovBox.right,
        Bottom: fovBox.bottom,
        CalibrationBinaryVersion: binaryVersion,
        UuidOfUpdater: UUID
      });
      setOverlayMessages("Calibration saved");
    }
    calibrationButton.classList.remove("calibrating");
    settingsDiv.classList.remove("show-calibration");
    setTimeout(setOverlayMessages, 500);
    setMode(Modes.SCAN);
    setTitle("Scanning...");
  }

  // Every ten seconds, we'll check to see if the server has updated our
  // calibration settings, if we're in scan mode.
  // Every minute, we'll check to see if the software version on the pi has changed,
  // and if so, reload the page.
  const retrySocket = (retryTime: number, deviceIp: string) => {
    if (retryTime > 0) {
      setOverlayMessages("Connection Error", `Retrying in ${retryTime}`);
      retryTime -= 1;
      setTimeout(() => retrySocket(retryTime, deviceIp), 1000);
    } else {
      openSocket(deviceIp);
    }
  };

  let awaitingFirstFrame = true;
  let reconnected = false;
  let socket: WebSocket;
  const openSocket = (deviceIp: string) => {
    socket = new WebSocket(`ws://${deviceIp}/ws`);
    setOverlayMessages("Loading...");
    socket.addEventListener("error", () => {
      //...
    });
    // Connection opened
    const registerSocket = (socket: WebSocket) => {
      if (socket.readyState === WebSocket.OPEN) {
        // We are waiting for frames now.
        setOverlayMessages("Loading...");
        socket.send(
          JSON.stringify({
            type: "Register",
            data: navigator.userAgent,
            uuid: UUID
          })
        );
      } else {
        setTimeout(() => registerSocket(socket), 100);
      }
    };
    socket.addEventListener("open", event => registerSocket(socket));
    socket.addEventListener("close", () => {
      // When we do reconnect, we need to treat it as a new connection
      reconnected = true;
      temperatureDisplay.innerHTML = '<span class="msg-1">Loading</span>';
      setTitle("Loading");
      clearTimeout(animatedSnow);
      showAnimatedSnow();
      retrySocket(5, deviceIp);
    });

    const payloads: Blob[] = [];
    let msPerFrame = 1000 / 9;
    let pendingFrame: undefined | number = undefined;

    interface FInfo {
      frameInfo: FrameInfo;
      frameStartOffset: number;
      frameSizeInBytes: number;
    }

    async function getFrameInfo(blob: Blob): Promise<FInfo | null> {
      const frameInfoLength = new Uint16Array(
        await BlobReader.arrayBuffer(blob.slice(0, 2))
      )[0];
      const frameStartOffset = 2 + frameInfoLength;
      try {
        const frameInfo = JSON.parse(
          await BlobReader.text(blob.slice(2, 2 + frameInfoLength))
        ) as FrameInfo;
        frameWidth = frameInfo.Camera.ResX;
        frameHeight = frameInfo.Camera.ResY;
        const frameSizeInBytes = frameWidth * frameHeight * 2;
        return {
          frameInfo,
          frameStartOffset,
          frameSizeInBytes
        };
      } catch (e) {
        console.error("Malformed JSON payload", e);
      }
      return null;
    }

    async function useLatestFrame() {
      if (pendingFrame) {
        clearTimeout(pendingFrame);
      }
      let latestFrameTimeOnMs = 0;
      let latestFrameHeader: FInfo | null = null;
      let latestFrameBlob: Blob | null = null;
      // Turns out that we don't always get the messages in order from the pi, so make sure we take the latest one.
      for (let i = 0; i < payloads.length; i++) {
        const blob: Blob = payloads[i] as Blob;
        const frameHeader = await getFrameInfo(blob);
        if (frameHeader !== null) {
          const { frameInfo: otherFrameInfo } = frameHeader as FInfo;
          const timeOn = otherFrameInfo.Telemetry.TimeOn / 1000 / 1000;
          if (timeOn > latestFrameTimeOnMs) {
            latestFrameTimeOnMs = timeOn;
            latestFrameHeader = frameHeader;
            latestFrameBlob = blob;
          }
        }
      }
      // Clear out any old frames
      while (payloads.length !== 0) {
        // Else drop the frame, so the client doesn't get bogged down and can catch up.
        const blob: Blob = payloads.pop() as Blob;
        if (blob !== latestFrameBlob) {
          const otherFrameHeader = await getFrameInfo(blob);
          if (otherFrameHeader !== null) {
            const { frameInfo: otherFrameInfo } = otherFrameHeader as FInfo;
            const timeOn = otherFrameInfo.Telemetry.TimeOn / 1000 / 1000;
            console.log(
              `Dropped a frame ${latestFrameTimeOnMs -
                timeOn}ms behind current: : frame#${
                otherFrameInfo.Telemetry.FrameCount
              }`
            );
            // Log this server-side
            socket.send(
              JSON.stringify({
                type: "Dropped late frame",
                data: `${latestFrameTimeOnMs -
                  timeOn}ms behind current: frame#${
                  otherFrameInfo.Telemetry.FrameCount
                }`,
                uuid: UUID
              })
            );
          }
        }
      }
      // Take the latest frame
      if (latestFrameHeader !== null && latestFrameBlob !== null) {
        const frameInfo = latestFrameHeader.frameInfo;
        const frameStartOffset = latestFrameHeader.frameStartOffset;
        const frameSizeInBytes = latestFrameHeader.frameSizeInBytes;
        const data: ArrayBuffer = await BlobReader.arrayBuffer(
          latestFrameBlob.slice(
            frameStartOffset,
            frameStartOffset + frameSizeInBytes
          )
        );
        await updateFrame(data, frameInfo as FrameInfo);
      }
    }

    socket.addEventListener("message", async event => {
      if (event.data instanceof Blob) {
        const blob = event.data;
        payloads.push(blob);
        // Process the latest frame, after waiting half a frame delay
        // to see if there are any more frames hot on its heels.
        pendingFrame = setTimeout(useLatestFrame, msPerFrame / 2);
      } else {
        // Let's try and get our data as json:
        // This might be status about the initial load of the device, connection, whether we need to ask the
        // user to calibrate.
      }
    });
  };
  populateVersionInfo(versionInfoElement).then(result => {
    if (typeof result === "object") {
      const { networkInfo } = result;
      const activeInterface = networkInfo.Interfaces.find(
        x => x.IPAddresses !== null
      ) as NetworkInterface;
      activeInterface.IPAddresses = activeInterface.IPAddresses.map(x =>
        x.trim()
      );
      let deviceIp = activeInterface.IPAddresses[0];
      deviceIp = deviceIp.substring(0, deviceIp.indexOf("/"));
      openSocket(deviceIp);
      // TODO(jon): Some basic auth for the server?
      setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(
            JSON.stringify({
              type: "Heartbeat",
              uuid: UUID
            })
          );
        }
      }, 5000);
    } else {
      setOverlayMessages("Connection Error");
    }
  });

  let prevCalibration = "";
  function updateCalibration(calibration: CalibrationInfo): boolean {
    const nextCalibration = JSON.stringify(calibration);
    if (
      calibration.UuidOfUpdater !== UUID &&
      calibration.TemperatureCelsius !== 0 &&
      nextCalibration !== prevCalibration
    ) {
      prevCalibration = nextCalibration;
      //LastCalibrationUUID = calibration.UuidOfUpdater;
      // Someone else updated the calibration, and we need to update ours!
      (document.getElementById(
        `source-${calibration.BodyLocation}`
      ) as HTMLInputElement).checked = true;
      GCalibrate_body_location = calibration.BodyLocation;

      GCalibrate_snapshot_time = calibration.SnapshotTime;
      GCalibrate_snapshot_uncertainty = calibration.SnapshotUncertainty;
      GCalibrate_snapshot_value = calibration.SnapshotValue;
      GCalibrate_temperature_celsius = calibration.TemperatureCelsius;
      fovBox.left = calibration.Left;
      fovBox.right = calibration.Right;
      fovBox.top = calibration.Top;
      fovBox.bottom = calibration.Bottom;

      // NOTE: Update the thresholds with any custom thresholds the user may have set:
      GThreshold_normal = calibration.ThresholdMinNormal || GThreshold_normal;
      GThreshold_check = calibration.ThresholdMinFever || GThreshold_check;
      GThreshold_cold = GThreshold_normal - thresholdColdBelowNormal;

      (document.getElementById(
        "threshold-normal"
      ) as HTMLInputElement).value = GThreshold_normal.toString();
      (document.getElementById(
        "threshold-fever"
      ) as HTMLInputElement).value = GThreshold_check.toString();
      setHandlePositions();
      setCalibrateTemperatureSafe(GCalibrate_temperature_celsius);
      return true;
    }
    return false;
  }

  async function init(
    softwareWasUpdated: boolean = false,
    appVersion: string = ""
  ) {
    if (
      new Date().getTime() - GCalibrate_snapshot_time >
      staleCalibrationTimeoutMinutes * 60 * 1000
    ) {
      // The existing calibration we've loaded from the Pi is too old, so we'll force a recalibration.
      // We will start the calibration with the default hard-coded thresholds.
      // Should we send a message so that each screen gets the calibration settings?
      startCalibration();
    } else {
      let promptMessage = "Press the button to start screening";
      if (softwareWasUpdated) {
        promptMessage = `The software on your device has been updated to version ${appVersion}<br><br>${promptMessage}`;
      }
      if (await getPrompt(promptMessage)) {
        await startScan(false);
      } else {
        startCalibration();
      }
    }
  }

  async function updateFrame(data: ArrayBuffer, frameInfo: FrameInfo) {
    clearTimeout(animatedSnow);
    // Check for changes to any of the metadata that suggests we need to take some action
    // (appVersion has changed, calibration has changed etc)
    // Check if the mode has changed
    const {
      Telemetry: telemetry,
      Calibration: calibration,
      Camera: camera,
      BinaryVersion,
      AppVersion
    } = frameInfo;
    const didUpdateCalibration = updateCalibration(calibration);
    let softwareWasUpdated = false;
    if (awaitingFirstFrame || reconnected) {
      // On the initial load:
      // Set the app version as seen on page load.

      // Check what the last version we saw was, by loading from localStorage.
      let prevVersion = window.localStorage.getItem("softwareVersion");
      if (prevVersion) {
        const version: {
          binaryVersion: string;
          appVersion: string;
          wasUpdated: boolean;
        } = JSON.parse(prevVersion);
        softwareWasUpdated = version.wasUpdated;
        if (
          (!softwareWasUpdated && version.binaryVersion !== BinaryVersion) ||
          version.appVersion !== AppVersion
        ) {
          // The version has changed on load of the app, or between frames, and we've been forced to reconnect our
          // socket connection.
          softwareWasUpdated = true;
          window.localStorage.setItem(
            "softwareVersion",
            JSON.stringify({
              appVersion: AppVersion,
              binaryVersion: BinaryVersion,
              wasUpdated: true
            })
          );
          if (reconnected) {
            // Reload to get new front-end code, Show a popup to that effect.
            // We only need to refresh in the case that it was updated beneath us, otherwise
            // we know the user just loaded the page anyway.
            window.location.reload();
          }
        } else if (softwareWasUpdated) {
          window.localStorage.setItem(
            "softwareVersion",
            JSON.stringify({
              appVersion: AppVersion,
              binaryVersion: BinaryVersion,
              wasUpdated: false
            })
          );
        }
      } else {
        window.localStorage.setItem(
          "softwareVersion",
          JSON.stringify({
            appVersion: AppVersion,
            binaryVersion: BinaryVersion,
            wasUpdated: false
          })
        );
      }
      binaryVersion = BinaryVersion;
      appVersion = AppVersion;
      // Clear any loading messages
      setOverlayMessages();
      reconnected = false;
      if (awaitingFirstFrame) {
        awaitingFirstFrame = false;
        await init(softwareWasUpdated, appVersion);
      }
    } else if (didUpdateCalibration) {
      // Someone updated the calibration, and we should show a notification to that effect.
      setOverlayMessages("Calibration updated");
      setTimeout(() => setOverlayMessages(), 1000);
    }

    // Check if it's in the 30 min warmup time, and needs to show the banner:
    // NOTE: TimeOn is in nanoseconds
    const timeOnSecs = telemetry.TimeOn / 1000 / 1000 / 1000;
    if (timeOnSecs < 60 * 30) {
      if (!alertBanner.classList.contains("show")) {
        alertBanner.classList.add("show");
        titleDiv.classList.add("hide");
      }
    } else if (alertBanner.classList.contains("show")) {
      alertBanner.classList.remove("show");
      titleDiv.classList.remove("hide");
    }

    // Check for per frame changes
    GTimeSinceFFC =
      (telemetry.TimeOn - telemetry.LastFFCTime) / (1000 * 1000 * 1000);
    let ffcDelay = 10 - GTimeSinceFFC;
    if (GStable_correction == 0.0) {
      ffcDelay = 120 - GTimeSinceFFC;
    }
    const exitingFFC =
      GDuringFFC && !(telemetry.FFCState !== "complete" || ffcDelay > 0);
    GDuringFFC = telemetry.FFCState !== "complete" || ffcDelay > 0;

    // TODO(jon): Maybe don't process if the frame is old
    processSnapshotRaw(
      Float32Array.from(new Uint16Array(data)),
      frameInfo,
      GTimeSinceFFC
    );

    if (GDuringFFC && !exitingFFC) {
      // Disable the 'DONE' button which enables the user to exit calibration.
      scanButton.setAttribute("disabled", "disabled");
      app.classList.add("ffc");
      const alpha = Math.min(ffcDelay * 0.1, 0.75);
      showLoadingSnow(alpha);

      let delayS = "";
      if (ffcDelay >= 0) {
        delayS = ffcDelay.toFixed(0).toString();
      }
      setOverlayMessages("Self-Balancing", delayS);
    } else if (exitingFFC) {
      scanButton.removeAttribute("disabled");
      app.classList.remove("ffc");
      setOverlayMessages();
    }
  }

  onResizeViewport();
  // Until we get our first frame, we show animated loading snow.
  showAnimatedSnow();
};
