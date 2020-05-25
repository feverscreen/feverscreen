import { BlobReader } from "./utils.js";
import {
  fahrenheitToCelsius,
  moduleTemperatureAnomaly,
  sensorAnomaly,
  ROIFeature,
} from "./processing.js";
import { DeviceApi } from "./api.js";
import {
  CalibrationInfo,
  FrameInfo,
  Modes,
  NetworkInterface,
  TemperatureSource,
} from "./feverscreen-types.js";
import {
  circleDetect,
  circleDetectRadius,
  edgeDetect,
} from "./circledetect.js";
import {
  buildSAT,
  scanHaar,
  ConvertCascadeXML,
  HaarCascade,
} from "./haarcascade.js";
import { detectForehead } from "./forehead-detect.js";

let GForeheads: ROIFeature[];
let GROI: ROIFeature[] = [];
let DEBUG_MODE = false;
const ForeheadColour = "#00ff00";

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

const isReferenceDevice = () =>
  window.navigator.userAgent ===
  "Mozilla/5.0 (Linux; Android 9; Lenovo TB-X605LC) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36";

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
        if (isReferenceDevice()) {
          document.body.requestFullscreen();
        }
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
      DeviceApi.networkInfo(),
    ]);
    const activeInterface = networkInfo.Interfaces.find(
      (x) => x.IPAddresses !== null
    ) as NetworkInterface;
    activeInterface.IPAddresses = activeInterface.IPAddresses.map((x) =>
      x.trim()
    );
    let ipv4 = activeInterface.IPAddresses[0];
    ipv4 = ipv4.substring(0, ipv4.indexOf("/"));
    const interfaceInfo = {
      LanInterface: activeInterface.Name,
      "Ipv4 Address": ipv4,
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

let GCascadeFace: HaarCascade | null = null;
function LoadCascadeXML() {
  // XML files from :
  //  * https://www.researchgate.net/publication/317013979_Face_Detection_on_Infrared_Thermal_Image
  //  * https://www.researchgate.net/publication/322601448_Algorithms_for_Face_Detection_on_Infrared_Thermal_Images
  fetch("/static/js/cascade_stg17.xml").then(async function (response) {
    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString(await response.text(), "text/xml");
    GCascadeFace = ConvertCascadeXML(xmlDoc);
  });
}

(window as any).toggleDebug = () => {
  DEBUG_MODE = !DEBUG_MODE;
};

// Top of JS
window.onload = async function () {
  LoadCascadeXML();

  let GCalibrateTemperatureCelsius = 37;
  let GCalibrateSnapshotValue = 0;
  let GCalibrateThermalRefValue = 0;
  let GCurrentThermalRefValue = 0;
  let GCalibrateSnapshotTime = 0;

  let GCalibrate_body_location: TemperatureSource = TemperatureSource.FOREHEAD;
  let fovBox: FovBox = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  };

  //these are the *lowest* temperature in celsius for each category
  let GThreshold_error = 42.5;
  let GThreshold_fever = 37.8;
  let GThreshold_check = 37.4;
  let GThreshold_normal = 35.7;
  const thresholdColdBelowNormal = 5; // If threshold normal changes, adjust threshold cold to be 5 degrees below that.
  let GThreshold_cold = 32.5;
  let GDisplay_precision = 1;

  let GStable_correction = 0;

  let GTimeSinceFFC = 0;
  let GDuringFFC = false;

  let GCurrent_hot_value = 10;

  let prevOverlayMessages: string[] = [""];

  // radial smoothing kernel.
  const kernel = new Float32Array(7);
  const radius = 3;
  let i = 0;
  for (let r = -radius; r <= radius; r++) {
    kernel[i++] = Math.exp((-8 * (r * r)) / radius / radius);
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
  const fpsCount = document.getElementById("fps-counter") as HTMLSpanElement;
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
        SnapshotTime: GCalibrateSnapshotTime,
        TemperatureCelsius: GCalibrateTemperatureCelsius,
        SnapshotValue: GCalibrateSnapshotValue,
        SnapshotUncertainty: 0.0,
        BodyLocation: GCalibrate_body_location,
        ThresholdMinFever: GThreshold_check,
        ThresholdMinNormal: GThreshold_normal,
        Top: fovBox.top,
        Left: fovBox.left,
        Right: fovBox.right,
        Bottom: fovBox.bottom,
        CalibrationBinaryVersion: binaryVersion,
        UuidOfUpdater: UUID,
      });
      setOverlayMessages("Settings saved");
      setTimeout(setOverlayMessages, 500);
    }
  });
  const setTemperatureSource = (source: TemperatureSource) => {
    GCalibrate_body_location = source;
    temperatureSourceChanged = true;
  };
  (document.getElementById(
    "source-ear"
  ) as HTMLInputElement).addEventListener("click", (e) =>
    setTemperatureSource(TemperatureSource.EAR)
  );
  (document.getElementById(
    "source-forehead"
  ) as HTMLInputElement).addEventListener("click", (e) =>
    setTemperatureSource(TemperatureSource.FOREHEAD)
  );
  (document.getElementById(
    "source-armpit"
  ) as HTMLInputElement).addEventListener("click", (e) =>
    setTemperatureSource(TemperatureSource.ARMPIT)
  );
  (document.getElementById(
    "source-oral"
  ) as HTMLInputElement).addEventListener("click", (e) =>
    setTemperatureSource(TemperatureSource.ORAL)
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
    fovToggleMirror.style.top = `${
      fovBox.top + (100 - (fovBox.top + fovBox.bottom)) * 0.5
    }%`;
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
            fovToggleMirror.style.top = `${
              fovBox.top + (100 - (fovBox.top + fovBox.bottom)) * 0.5
            }%`;
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
            fovToggleMirror.style.left = `${
              fovBox[l] + (100 - (fovBox[l] + fovBox[r])) * 0.5
            }%`;
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
            fovToggleMirror.style.top = `${
              fovBox.top + (100 - (fovBox.top + fovBox.bottom)) * 0.5
            }%`;
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
            fovToggleMirror.style.left = `${
              fovBox[l] + (100 - (fovBox[l] + fovBox[r])) * 0.5
            }%`;
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
      fovLeftHandle,
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
      setCalibrateTemperatureSafe(GCalibrateTemperatureCelsius + 0.1);
    }
  );

  (document.getElementById("cooler") as HTMLButtonElement).addEventListener(
    "click",
    () => {
      setCalibrateTemperatureSafe(GCalibrateTemperatureCelsius - 0.1);
    }
  );

  calibrationButton.addEventListener("click", (event) => {
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

  temperatureInputCelsius.addEventListener("input", (event) => {
    let entry_value = parseFloat((event.target as HTMLInputElement).value);
    if (entry_value < 75) {
      temperatureInputLabel.innerHTML = "&deg;C";
    } else {
      temperatureInputLabel.innerHTML = "&deg;F";
      entry_value = fahrenheitToCelsius(entry_value);
    }
    setCalibrateTemperature(entry_value, temperatureInputCelsius);
  });

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
    GCalibrateTemperatureCelsius = temperatureCelsius;
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

  function showTemperature(temperature_celsius: number, frameInfo: FrameInfo) {
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
      strDisplay += "<br>Empty:";
      strDisplay +=
        "<br>WallTime:" +
        (new Date().getTime() / 1000 - 1589946488).toFixed(2) +
        "s";
      strDisplay += "<br>TimeFFC :" + GTimeSinceFFC.toFixed(1) + "s";
      strDisplay +=
        "<br>DispTemp:" +
        temperature_celsius.toFixed(GDisplay_precision) +
        "&deg;C";
      strDisplay += "<br>HotVal  :" + (GCurrent_hot_value / 100).toFixed(3);
      strDisplay +=
        "<br>DevTemp :" +
        frameInfo.Telemetry.TempC.toFixed(GDisplay_precision) +
        "&deg;C";
      strDisplay +=
        "<br>SensAnom:" + (sensorAnomaly(GTimeSinceFFC) / 100).toFixed(3);
      strDisplay += "<br>StabCorr:" + (GStable_correction / 100).toFixed(3);
      strDisplay +=
        "<br>TRefCorr:" +
        ((GCalibrateThermalRefValue - GCurrentThermalRefValue) / 100).toFixed(
          3
        );

      console.log(strDisplay);
      selectedIcon = undefined;
    }
    if (GDuringFFC) {
      setTitle("Please wait");
      strDisplay = "<span class='msg-1'>Self-Balancing</span>";
    }
    if (GCalibrateSnapshotValue === 0) {
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

  function estimatedTemperatureForValue(
    sensorValue: number,
    sensorCorrection: number
  ) {
    return (
      GCalibrateTemperatureCelsius +
      (sensorValue + sensorCorrection - GCalibrateSnapshotValue) *
        GSensor_response
    );
  }

  function estimatedValueForTemperature(
    temperature: number,
    sensorCorrection: number
  ) {
    return (
      GCalibrateSnapshotValue -
      sensorCorrection +
      (temperature - GCalibrateTemperatureCelsius) / GSensor_response
    );
  }

  function setOverlayMessages(...messages: string[]) {
    prevOverlayMessages = messages;
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

  function mip_scale_down(
    source: Float32Array,
    width: number,
    height: number,
    correction: number
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
        dest[y * ww + x] = sumValue / 4 + correction;
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

  function correct_stable_temperature(source: Float32Array) {
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
      return;
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
      return;
    }
    bucket_variation = bucket_variation.slice(0, endCursor);
    bucket_variation.sort();
    GStable_correction = stable_mean(bucket_variation);
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
    height: number,
    sensorCorrection: number
  ) {
    while (width > 16) {
      source = mip_scale_down(source, width, height, sensorCorrection);
      width = ~~(width / 2);
      height = ~~(height / 2);
      sensorCorrection = 0; // only apply once
    }

    if (GTimeSinceFFC > 120) {
      accumulate_stable_temperature(source);
    } else {
      roll_stable_values();
    }
    correct_stable_temperature(source);
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
    edgeData: Float32Array,
    sensorCorrection: number
  ) {
    const width = frameWidth;
    const height = frameHeight;
    const dest = new Float32Array(width * height);
    let value = 0;
    let cx = 0;
    let cy = 0;
    let radius = (r.x1 - r.x0) * 0.5;

    [value, cx, cy] = circleDetectRadius(
      edgeData,
      dest,
      radius,
      width,
      height,
      r.midX() - radius * 2,
      r.midY() - radius * 2,
      r.midX() + radius * 2,
      r.midY() + radius * 2
    );
    if (!r.contains(cx, cy)) {
      r.sensorMissing = Math.max(r.sensorMissing - 1, 0);
      return r.sensorMissing > 0;
    }
    let sensorValue =
      extractSensorValue(r, saltPepperData, frameWidth, frameHeight) +
      sensorCorrection;
    r.sensorValue = lowPassNL(r.sensorValue, sensorValue);

    //Create a low pass filter with a really long half life
    let halfLife = 2 * (8.7 * 60); //i.e. alpha ^ halfLife = 0.5
    let alphaLowPass = Math.exp(Math.log(0.5) / halfLife);
    r.sensorValueLowPass =
      r.sensorValueLowPass * alphaLowPass + r.sensorValue * (1 - alphaLowPass);
    r.sensorAge += 1;
    r.sensorMissing = Math.min(r.sensorMissing + 1, 20);
    if (r.sensorAge > 8.7 * 30) {
      GCurrentThermalRefValue = r.sensorValueLowPass;
    }
    return true;
  }

  function detectThermalReference(
    roi: ROIFeature[],
    saltPepperData: Float32Array,
    smoothedData: Float32Array,
    sensorCorrection: number,
    width: number,
    height: number
  ) {
    //   const edgeData = edgeDetect(saltPepperData, frameWidth, frameHeight);
    const edgeData = edgeDetect(smoothedData, frameWidth, frameHeight);

    if (GROI.length > 0) {
      for (let i = 0; i < GROI.length; i++) {
        let prevTherm = GROI[i];
        if (prevTherm.flavor == "Circle") {
          if (
            circleStillPresent(
              prevTherm,
              saltPepperData,
              edgeData,
              sensorCorrection
            )
          ) {
            return insertThermalReference(roi, prevTherm);
          }
        }
      }
    }

    let circle_image;
    let bestRadius;
    let bestX;
    let bestY;
    [circle_image, bestRadius, bestX, bestY] = circleDetect(
      edgeData,
      frameWidth,
      frameHeight
    );

    if (bestRadius <= 0) {
      return roi;
    }
    let r = new ROIFeature();
    r.flavor = "Circle";
    r.x0 = bestX - bestRadius;
    r.y0 = bestY - bestRadius;
    r.x1 = bestX + bestRadius;
    r.y1 = bestY + bestRadius;
    r.sensorValue =
      extractSensorValue(r, saltPepperData, frameWidth, frameHeight) +
      sensorCorrection;
    r.sensorValueLowPass = r.sensorValue;

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

  function setSimpleHotSpot(
    r: ROIFeature,
    source: Float32Array,
    sensorCorrection: number
  ) {
    r.sensorValue = -1e8;
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
    r.sensorValue += sensorCorrection;
  }

  function featureDetect(
    saltPepperData: Float32Array,
    smoothedData: Float32Array,
    sensorCorrection: number,
    width: number,
    height: number
  ) {
    //zero knowledge..
    let roi: ROIFeature[] = [];

    if (DEBUG_MODE && GCascadeFace != null) {
      const satData = buildSAT(smoothedData, width, height, sensorCorrection);
      let roiScan = scanHaar(
        GCascadeFace,
        satData,
        width,
        height,
        sensorCorrection
      );
      roi = roi.concat(roiScan);
    }

    roi = detectThermalReference(
      roi,
      saltPepperData,
      smoothedData,
      sensorCorrection,
      width,
      height
    );
    GForeheads = [];
    if (DEBUG_MODE) {
      for (let i = 0; i < roi.length; i++) {
        if (roi[i].flavor != "Circle") {
          let forehead = detectForehead(
            roi[i],
            smoothedData,
            frameWidth,
            frameHeight
          );
          if (forehead) {
            setSimpleHotSpot(forehead, smoothedData, sensorCorrection);
            roi[i].sensorX = forehead.sensorX;
            roi[i].sensorY = forehead.sensorY;
            roi[i].sensorValue = forehead.sensorValue;
            GForeheads.push(forehead);
          } else {
            setSimpleHotSpot(roi[i], smoothedData, sensorCorrection);
          }
        }
      }
    }

    GROI = roi;
    return roi;
  }

  function getStableTempFixAmount() {
    let stable_fix_factor = 1 - (GTimeSinceFFC - 120) / 60;
    stable_fix_factor = Math.min(Math.max(stable_fix_factor, 0), 1);
    return stable_fix_factor * GStable_correction;
  }

  function processSnapshotRaw(
    sensorData: Float32Array,
    frameInfo: FrameInfo,
    timeSinceFFC: number
  ) {
    // Warning: Order is important in this function, be very careful when moving things around.

    //Spatial preprocessing of the data...

    //First use a salt'n'pepper median filter
    // https://en.wikipedia.org/wiki/Shot_noise
    const saltPepperData = median_smooth(sensorData);

    //next, a radial blur, this averages out surrounding pixels, trading accuracy for effective resolution
    const smoothedData = radial_smooth(saltPepperData);

    let sensorCorrection = 0;

    // In our temperature range, with our particular IR cover,
    //  an FFC event gives rise to a change in sensor values
    //  that is mostly time dependent.
    //Do this first..
    sensorCorrection -= sensorAnomaly(timeSinceFFC);

    // In our temperature range, once it has warmed up,
    //  an FFC causes a change in module temperature
    //  that is mostly time dependent.
    let device_temperature = frameInfo.Telemetry.TempC;
    device_temperature -= moduleTemperatureAnomaly(timeSinceFFC);

    // In our temperature range, with our particular IR cover,
    //  a constant temperature person
    //  with a change in device temperature,
    //  changes the sensor values by this amount
    sensorCorrection +=
      device_temperature * GDevice_sensor_temperature_response;

    //Now run the stable-temp algorithm, this requires most of the frame to be imaging the room
    update_stable_temperature(
      smoothedData,
      frameWidth,
      frameHeight,
      sensorCorrection
    );
    //And update the sensorCorrection
    sensorCorrection += getStableTempFixAmount();

    const features = featureDetect(
      saltPepperData,
      smoothedData,
      sensorCorrection,
      frameWidth,
      frameHeight
    );

    const x0 = Math.floor((frameWidth / 100) * fovBox.left);
    const x1 = frameWidth - Math.floor((frameWidth / 100) * fovBox.right);
    const y0 = Math.floor((frameHeight / 100) * fovBox.top);
    const y1 = frameHeight - Math.floor((frameHeight / 100) * fovBox.bottom);

    //now try to reduce drift from the thermal reference, *AFTER* we've performed the feature detection
    if (GCalibrateThermalRefValue > 0 && GCurrentThermalRefValue > 0) {
      sensorCorrection += GCalibrateThermalRefValue - GCurrentThermalRefValue;
    }

    let hotValue = smoothedData[0];
    for (let y = y0; y !== y1; y++) {
      for (let x = x0; x !== x1; x++) {
        let index = y * frameWidth + x;
        let current = smoothedData[index];
        if (hotValue < current) {
          if (!ExcludedBB(x, y)) {
            hotValue = current;
            hotSpotX = x;
            hotSpotY = y;
          }
        }
      }
    }
    hotValue += sensorCorrection;

    GCurrent_hot_value = lowPassNL(GCurrent_hot_value, hotValue);

    if (Mode === Modes.CALIBRATE) {
      GCalibrateSnapshotTime = new Date().getTime();
      GCalibrateSnapshotValue = GCurrent_hot_value;
      GCalibrateThermalRefValue = GCurrentThermalRefValue;
    }

    const temperature = estimatedTemperatureForValue(GCurrent_hot_value, 0);
    showTemperature(temperature, frameInfo);

    // Warning: Order is important in this function, be very careful when moving things around.

    let feverThreshold = estimatedValueForTemperature(
      GThreshold_fever - 0.5,
      sensorCorrection
    );
    let checkThreshold = estimatedValueForTemperature(
      GThreshold_check - 6.5,
      sensorCorrection
    );
    let roomThreshold = estimatedValueForTemperature(14.0, sensorCorrection);

    const scaleData = smoothedData;
    let imgData = ctx.createImageData(frameWidth, frameHeight);

    for (let index = 0; index < frameWidth * frameHeight; index++) {
      let f32Val = smoothedData[index];
      let r = 0;
      let g = 0;
      let b = 0;
      if (feverThreshold < f32Val) {
        f32Val = saltPepperData[index] * 5 - f32Val * 4;
        let v =
          ((f32Val - feverThreshold) * 255) / (feverThreshold - checkThreshold);
        r = 255;
        g = Math.min(v * 0.5, 128);
        b = g;
      } else if (checkThreshold < f32Val) {
        f32Val = saltPepperData[index] * 5 - f32Val * 4;
        let v =
          ((f32Val - checkThreshold) * 128) / (feverThreshold - checkThreshold);
        r = 100 + v;
        g = 100 + v;
        b = v;
      } else {
        let v = (f32Val - roomThreshold) / (checkThreshold - roomThreshold);
        v = Math.max(v, 0);
        v = v * v * v * v * 192;
        r = v;
        g = v;
        b = v;
      }
      imgData.data[index * 4 + 0] = r;
      imgData.data[index * 4 + 1] = g;
      imgData.data[index * 4 + 2] = b;
      imgData.data[index * 4 + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);

    drawOverlay();
  }

  function clearOverlay() {
    overlayCtx.clearRect(0, 0, nativeOverlayWidth, nativeOverlayHeight);
  }

  function drawOverlay() {
    clearOverlay();
    if (GDuringFFC) {
      return;
    }
    let scaleX = nativeOverlayWidth / canvasWidth;
    let scaleY = nativeOverlayHeight / frameHeight;

    let sensorCorrectionDriftOnly = 0;
    if (GCalibrateThermalRefValue > 0 && GCurrentThermalRefValue > 0) {
      sensorCorrectionDriftOnly +=
        GCalibrateThermalRefValue - GCurrentThermalRefValue;
    }

    overlayCtx.lineWidth = 3 * window.devicePixelRatio;
    GROI.forEach(function (roi) {
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

        overlayCtx.save();
        if (mirrorMode) {
          overlayCtx.scale(-1, 1);
          mx *= -1;
        }

        let text = "Thermal Ref";
        if (GDisplay_precision > 1) {
          text = "SRef:" + (roi.sensorValue / 100).toFixed(2);
          text += "  SRefLP:" + (roi.sensorValueLowPass / 100).toFixed(2);
          //          const temperature = estimatedTemperatureForValue(roi.sensorValue, sensorCorrectionDriftOnly);
          //          text += ' TRef: '+temperature.toFixed(GDisplay_precision)+" °C";
        }
        overlayCtx.fillText(text, mx, my - mrad - 3);
        overlayCtx.restore();
      } else {
        drawTargetCircle(roi.sensorX, roi.sensorY);
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
        overlayCtx.font = "40px Arial";

        let tx = roi.x0 * scaleX;
        overlayCtx.save();
        if (mirrorMode) {
          overlayCtx.scale(-1, 1);
          tx = -roi.x1 * scaleX;
        }

        const temperature = estimatedTemperatureForValue(
          roi.sensorValue,
          sensorCorrectionDriftOnly
        );
        let text = "Face, " + temperature.toFixed(GDisplay_precision) + "°C";
        if (GDisplay_precision > 1) {
          text +=
            ", SFace:" + (roi.sensorValue / 100).toFixed(GDisplay_precision);
        }

        overlayCtx.fillText(text, tx, roi.y0 * scaleY - 3);
        overlayCtx.restore();
      }
    });
    GForeheads.forEach(function (roi) {
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
        SnapshotTime: GCalibrateSnapshotTime,
        TemperatureCelsius: GCalibrateTemperatureCelsius,
        SnapshotValue: GCalibrateSnapshotValue,
        SnapshotUncertainty: 0.0,
        BodyLocation: GCalibrate_body_location,
        ThresholdMinNormal: GThreshold_normal,
        ThresholdMinFever: GThreshold_check,
        Top: fovBox.top,
        Left: fovBox.left,
        Right: fovBox.right,
        Bottom: fovBox.bottom,
        CalibrationBinaryVersion: binaryVersion,
        UuidOfUpdater: UUID,
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
      clearOverlay();
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

  const framesRendered: number[] = [];

  const displayFps = (server: number, client: number) => {
    const now = new Date().getTime();
    if (framesRendered.length !== 0) {
      while (framesRendered.length !== 0 && framesRendered[0] < now - 1000) {
        framesRendered.shift();
      }
    }
    fpsCount.innerText = `${framesRendered.length} FPS (${server}/${client})`;
  };

  const updateFpsCounter = (server: number, client: number) => {
    framesRendered.push(new Date().getTime());
    displayFps(server, client);
  };

  const openSocket = (deviceIp: string) => {
    socket = new WebSocket(`ws://${deviceIp}/ws`);
    clearOverlay();
    setOverlayMessages("Loading...");
    socket.addEventListener("error", () => {
      //...
    });
    // Connection opened
    const registerSocket = (socket: WebSocket) => {
      if (socket.readyState === WebSocket.OPEN) {
        // We are waiting for frames now.
        clearOverlay();
        setOverlayMessages("Loading...");
        socket.send(
          JSON.stringify({
            type: "Register",
            data: navigator.userAgent,
            uuid: UUID,
          })
        );
      } else {
        setTimeout(() => registerSocket(socket), 100);
      }
    };
    socket.addEventListener("open", (event) => registerSocket(socket));
    socket.addEventListener("close", () => {
      // When we do reconnect, we need to treat it as a new connection
      reconnected = true;
      temperatureDisplay.innerHTML = '<span class="msg-1">Loading</span>';
      setTitle("Loading");
      clearTimeout(animatedSnow);
      showAnimatedSnow();
      retrySocket(5, deviceIp);
    });

    const frames: Frame[] = [];
    let pendingFrame: undefined | number = undefined;

    interface Frame {
      frameInfo: FrameInfo;
      frame: Float32Array;
    }

    let skippedFramesServer = 0;
    let skippedFramesClient = 0;
    let prevFrameNum = -1;

    // TODO(jon): An fps counter.  We want to see 9fps

    async function parseFrame(blob: Blob): Promise<Frame | null> {
      // NOTE(jon): On iOS. it seems slow to do multiple fetches from the blob, so let's do it all at once.
      const data = await BlobReader.arrayBuffer(blob);
      const frameInfoLength = new Uint16Array(data.slice(0, 2))[0];
      const frameStartOffset = 2 + frameInfoLength;
      try {
        const frameInfo = JSON.parse(
          String.fromCharCode(
            ...new Uint8Array(data.slice(2, frameStartOffset))
          )
        ) as FrameInfo;
        frameWidth = frameInfo.Camera.ResX;
        frameHeight = frameInfo.Camera.ResY;
        if (
          prevFrameNum !== -1 &&
          prevFrameNum + 1 !== frameInfo.Telemetry.FrameCount
        ) {
          skippedFramesServer += frameInfo.Telemetry.FrameCount - prevFrameNum;
          // Work out an fps counter.
        }
        prevFrameNum = frameInfo.Telemetry.FrameCount;
        const frameSizeInBytes = frameWidth * frameHeight * 2;
        const frame = Float32Array.from(
          new Uint16Array(
            data.slice(frameStartOffset, frameStartOffset + frameSizeInBytes)
          )
        );
        return {
          frameInfo,
          frame,
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
      let latestFrame: Frame | null = null;
      // Turns out that we don't always get the messages in order from the pi, so make sure we take the latest one.
      const framesToDrop: Frame[] = [];
      while (frames.length !== 0) {
        const frame = frames.shift() as Frame;
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
      }
      // Clear out and log any old frames that need to be dropped
      while (framesToDrop.length !== 0) {
        const dropFrame = framesToDrop.shift() as Frame;
        const timeOn = dropFrame.frameInfo.Telemetry.TimeOn / 1000 / 1000;
        skippedFramesClient++;
        socket.send(
          JSON.stringify({
            type: "Dropped late frame",
            data: `${latestFrameTimeOnMs - timeOn}ms behind current: frame#${
              dropFrame.frameInfo.Telemetry.FrameCount
            }`,
            uuid: UUID,
          })
        );
      }

      // Take the latest frame and process it.
      if (latestFrame !== null) {
        await updateFrame(latestFrame.frame, latestFrame.frameInfo);
        if (DEBUG_MODE) {
          updateFpsCounter(skippedFramesServer, skippedFramesClient);
        }
      }
      skippedFramesClient = 0;
      skippedFramesServer = 0;
    }

    socket.addEventListener("message", async (event) => {
      if (event.data instanceof Blob) {
        if (prevOverlayMessages[0] === "Loading...") {
          setOverlayMessages();
        }
        // const {frame, frameInfo} = await parseFrame(event.data as Blob) as Frame;
        // await updateFrame(frame, frameInfo);

        // Only do this if we detect that we're dropping frames?
        frames.push((await parseFrame(event.data as Blob)) as Frame);
        // Process the latest frame, after waiting half a frame delay
        // to see if there are any more frames hot on its heels.
        pendingFrame = setTimeout(useLatestFrame, 16);
      } else {
        // Let's try and get our data as json:
        // This might be status about the initial load of the device, connection, whether we need to ask the
        // user to calibrate.
      }
    });
  };
  populateVersionInfo(versionInfoElement).then((result) => {
    if (typeof result === "object") {
      const { networkInfo } = result;
      const activeInterface = networkInfo.Interfaces.find(
        (x) => x.IPAddresses !== null
      ) as NetworkInterface;
      activeInterface.IPAddresses = activeInterface.IPAddresses.map((x) =>
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
              uuid: UUID,
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

      GCalibrateSnapshotTime = calibration.SnapshotTime;
      GCalibrateSnapshotValue = calibration.SnapshotValue;
      //more here..
      GCalibrateTemperatureCelsius = calibration.TemperatureCelsius;
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
      setCalibrateTemperatureSafe(GCalibrateTemperatureCelsius);
      return true;
    }
    return false;
  }

  async function init(
    softwareWasUpdated: boolean = false,
    appVersion: string = ""
  ) {
    if (true) {
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

  async function updateFrame(data: Float32Array, frameInfo: FrameInfo) {
    clearTimeout(animatedSnow);
    // Check for changes to any of the metadata that suggests we need to take some action
    // (appVersion has changed, calibration has changed etc)
    // Check if the mode has changed
    const {
      Telemetry: telemetry,
      Calibration: calibration,
      Camera: camera,
      BinaryVersion,
      AppVersion,
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
              wasUpdated: true,
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
              wasUpdated: false,
            })
          );
        }
      } else {
        window.localStorage.setItem(
          "softwareVersion",
          JSON.stringify({
            appVersion: AppVersion,
            binaryVersion: BinaryVersion,
            wasUpdated: false,
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
    let ffcDelay = 5 - GTimeSinceFFC;
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
