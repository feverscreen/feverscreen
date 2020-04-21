const GSensor_response = 0.030117;
const GDevice_sensor_temperature_response = -19.65;
const UUID = new Date().getTime();
let LastCalibrationUUID = UUID;
let frameWidth = 160;
let frameHeight = 120;

enum TemperatureSource {
  FOREHEAD = 'forehead',
  EAR = 'ear',
  ARMPIT = 'armpit',
  ORAL = 'oral'
}

enum Modes {
  CALIBRATE = 'calibrate',
  SCAN = 'scan'
}
let GNoSleep: any;
let Mode: Modes = Modes.CALIBRATE;
let binaryVersion: string;
let appVersion: string;

const staleCalibrationTimeoutMinutes = 60;
const fahrenheitToCelsius = (f: number) => (f - 32.0) * (5.0 / 9);
const celsiusToFahrenheit = (c: number) => c * (9.0 / 5) + 32;

interface CalibrationInfo {
  SnapshotTime: number;
  TemperatureCelsius: number;
  SnapshotValue: number;
  SnapshotUncertainty: number;
  BodyLocation: TemperatureSource;
  Top: number;
  Left: number;
  Right: number;
  Bottom: number;
  CalibrationBinaryVersion: string;
  UuidOfUpdater: number;
}

interface NetworkInterface {
  Name: string,
  IPAddresses: string[]
}

interface CameraInfo {
  Brand: string;
  Model: string;
  FPS: number;
  ResX: number;
  ResY: number;
}

interface Telemetry {
  TimeOn: number;
  FFCState: string;
  FrameCount: number;
  FrameMean: number;
  TempC: number;
  LastFFCTempC: number;
  LastFFCTime: number;
}

interface FrameInfo {
  Calibration: CalibrationInfo;
  Telemetry: Telemetry;
  AppVersion: string;
  BinaryVersion: string;
  Camera: CameraInfo;
}

const BlobReader = function () {
  // For comparability with older browsers/iOS that don't yet support arrayBuffer() or text()
  // directly off the blob object
  return {
    arrayBuffer(blob: Blob): Promise<ArrayBuffer> {
      return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.addEventListener('load', (_event: ProgressEvent<FileReader>) => {
          resolve(fileReader.result as ArrayBuffer)
        });
        fileReader.addEventListener('error', (_event: ProgressEvent<FileReader>) => {
          reject()
        });
        fileReader.readAsArrayBuffer(blob);
      });
    },
    text(blob: Blob): Promise<string> {
      return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.addEventListener('load', (_event: ProgressEvent<FileReader>) => {
          resolve(fileReader.result as string)
        });
        fileReader.addEventListener('error', (_event: ProgressEvent<FileReader>) => {
          reject()
        });
        fileReader.readAsText(blob);
      });
    }
  }
}();

async function getPrompt(message: string) {
  const recalibratePrompt = document.getElementById('recalibrate-prompt') as HTMLDivElement;
  return new Promise((resolve, reject) => {
    if (recalibratePrompt) {
      recalibratePrompt.classList.add('show');
      (recalibratePrompt.querySelector('h2') as HTMLHeadingElement).innerText = message;
      (recalibratePrompt.querySelector('.confirm-yes') as HTMLButtonElement).addEventListener('click', () => {
        GNoSleep.enable();
        recalibratePrompt.classList.remove('show');
        resolve(true);
      });
      (recalibratePrompt.querySelector('.confirm-no') as HTMLButtonElement).addEventListener('click', () => {
        GNoSleep.enable();
        recalibratePrompt.classList.remove('show');
        resolve(false);
      });
    } else {
      throw new Error("Failed to find prompt DOM element");
    }
  });
}

const ErrorKind = {
  INVALID_TELEMETRY: 'INVALID_TELEMETRY',
  CAMERA_NOT_READY: 'CAMERA_NOT_READY',
  BAD_API_CALL: 'BAD_API_CALL',
};
const DeviceApi = {
  get debugPrefix() {
    if (window.location.hostname === "localhost" && window.location.port === '5000') {
      // Used for developing the front-end against an externally running version of the
      // backend, so it's not necessary to package up the build to do front-end testing.
      return "http://192.168.178.37";
    }
    return '';
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
  async get(url: string) {
    return fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Basic ${btoa("admin:feathers")}`
      }
    });
  },
  async post(url: string, data: any) {
    return fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa("admin:feathers")}`,
        'Content-Type': "application/x-www-form-urlencoded"
      },
      body: data
    })
  },
  async getJSON(url: string) {
    const response = await this.get(url);
    try {
      return response.json();
    } catch (e) {
      return {};
    }
  },
  async getText(url: string) {
    const response = await this.get(url);
    return response.text();
  },
  async softwareVersion(): Promise<{
    apiVersion: number,
    appVersion: string,
    binaryVersion: string
  }> {
    return this.getJSON(this.SOFTWARE_VERSION);
  },
  async deviceInfo(): Promise<{
    serverURL: string,
    groupname: string,
    devicename: string,
    deviceID: number
  }> {
    return this.getJSON(this.DEVICE_INFO);
  },
  async deviceTime() {
    return this.getJSON(this.DEVICE_TIME);
  },
  async deviceConfig() {
    return this.getJSON(this.DEVICE_CONFIG);
  },
  async networkInfo(): Promise<{
    Interfaces: NetworkInterface[],
    Config: { Online: boolean }
  }> {
    return this.getJSON(this.NETWORK_INFO);
  },
  async saveCalibration(data: CalibrationInfo) {
    // NOTE: This API only supports a json payload one level deep.  No nested structures.
    let formData = new URLSearchParams();
    formData.append('calibration', JSON.stringify(data));
    return this.post(this.SAVE_CALIBRATION, formData);
  },
  async getCalibration(): Promise<CalibrationInfo> {
    return this.getJSON(this.LOAD_CALIBRATION);
  }
};
const populateVersionInfo = async (element: HTMLDivElement) => {
  // TODO(jon): Add wifi signal strength indicator here
  try {
    const [versionInfo, deviceInfo, networkInfo] = await Promise.all([
      DeviceApi.softwareVersion(),
      DeviceApi.deviceInfo(),
      DeviceApi.networkInfo()
    ]);
    const activeInterface = networkInfo.Interfaces.find(x => x.IPAddresses !== null) as NetworkInterface;
    activeInterface.IPAddresses = activeInterface.IPAddresses.map(x => x.trim());
    let ipv4 = activeInterface.IPAddresses[0];
    ipv4 = ipv4.substring(0, ipv4.indexOf('/'));
    const interfaceInfo = {
      LanInterface: activeInterface.Name,
      'Ipv4 Address': ipv4
    };
    versionInfo.binaryVersion = versionInfo.binaryVersion.substr(0, 10);
    const itemList = document.createElement('ul');
    for (const [key, val] of Object.entries(interfaceInfo)) {
      const listItem = document.createElement('li');
      listItem.innerHTML = `<span>${key}</span><span>${val}</span>`;
      itemList.appendChild(listItem);
    }

    for (const [key, val] of Object.entries(deviceInfo)) {
      const listItem = document.createElement('li');
      listItem.innerHTML = `<span>${key}</span><span>${val}</span>`;
      itemList.appendChild(listItem);
    }
    for (const [key, val] of Object.entries(versionInfo)) {
      const listItem = document.createElement('li');
      listItem.innerHTML = `<span>${key}</span><span>${val}</span>`;
      itemList.appendChild(listItem);
    }

    element.appendChild(itemList);
    return {versionInfo, deviceInfo, networkInfo};
  } catch (e) {
    return false;
  }
};

// Top of JS
window.onload = async function() {
  let GCalibrate_temperature_celsius = 37;
  let GCalibrate_snapshot_value = 0;
  let GCalibrate_snapshot_uncertainty = 100;
  let GCalibrate_snapshot_time = 0;

  let GCalibrate_body_location: TemperatureSource = TemperatureSource.FOREHEAD;
  let fovBox = {
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
  const temperatureInputLabel = document.getElementById("temperature_label") as HTMLLabelElement;

  const calibrationOverlay = document.getElementById("myNav") as HTMLDivElement;
  const mainCanvas = document.getElementById("main_canvas") as HTMLCanvasElement;
  let canvasWidth = (mainCanvas as HTMLCanvasElement).width;
  let canvasHeight = (mainCanvas as HTMLCanvasElement).height;
  const scanButton = document.getElementById("scan_button") as HTMLButtonElement;
  const temperatureDiv = document.getElementById("temperature_div") as HTMLDivElement;
  const temperatureInput = document.getElementById("temperature_input_a") as HTMLInputElement;
  const thumbHot = document.getElementById("thumb_hot") as HTMLImageElement;
  const thumbNormal = document.getElementById("thumb_normal") as HTMLImageElement;
  const titleDiv = document.getElementById("title_div") as HTMLDivElement;
  const settingsDiv = document.getElementById("settings") as HTMLDivElement;
  const temperatureDisplay = document.getElementById("temperature_display") as HTMLDivElement;
  const overlayCanvas = document.getElementById('overlay-canvas') as HTMLCanvasElement;
  const canvasContainer = document.getElementById('canvas-outer') as HTMLDivElement;
  const statusText = document.getElementById("status-text") as HTMLDivElement;
  const app = document.getElementById('app') as HTMLDivElement;
  const mainParent = document.getElementById('main') as HTMLDivElement;
  const mainDiv = document.getElementById('main-inner') as HTMLDivElement;
  const versionInfoElement = document.getElementById("version-info") as HTMLDivElement;
  // Crop box handles
  const fovTopHandle = document.getElementById("top-handle") as HTMLDivElement;
  const fovRightHandle = document.getElementById("right-handle") as HTMLDivElement;
  const fovBottomHandle = document.getElementById("bottom-handle") as HTMLDivElement;
  const fovLeftHandle = document.getElementById("left-handle") as HTMLDivElement;

  const setTemperatureSource = (source: TemperatureSource) => {
    GCalibrate_body_location = source;
  };

  (document.getElementById('admin_close_button') as HTMLButtonElement)
    .addEventListener('click', async () => {
      await DeviceApi.saveCalibration({
        SnapshotTime: GCalibrate_snapshot_time,
        TemperatureCelsius: GCalibrate_temperature_celsius,
        SnapshotValue: GCalibrate_snapshot_value,
        SnapshotUncertainty: GCalibrate_snapshot_uncertainty,
        BodyLocation: GCalibrate_body_location,
        Top: fovBox.top,
        Left: fovBox.left,
        Right: fovBox.right,
        Bottom: fovBox.bottom,
        CalibrationBinaryVersion: binaryVersion,
        UuidOfUpdater: UUID
      });
      setOverlayMessages("Settings saved");
      setTimeout(setOverlayMessages, 500);
    });
  (document.getElementById('source-ear') as HTMLInputElement)
    .addEventListener('click', e => setTemperatureSource(TemperatureSource.EAR));
  (document.getElementById('source-forehead') as HTMLInputElement)
    .addEventListener('click', e => setTemperatureSource(TemperatureSource.FOREHEAD));
  (document.getElementById('source-armpit') as HTMLInputElement)
    .addEventListener('click', e => setTemperatureSource(TemperatureSource.ARMPIT));
  (document.getElementById('source-oral') as HTMLInputElement)
    .addEventListener('click', e => setTemperatureSource(TemperatureSource.ORAL));

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
    canvasContainer.style.maxWidth = `${Math.min(mainDiv.offsetWidth - 50, width)}px`;
    const overlayWidth = canvasContainer.offsetWidth;
    const overlayHeight = canvasContainer.offsetHeight;
    overlayCanvas.width = overlayWidth * window.devicePixelRatio;
    overlayCanvas.height = overlayHeight * window.devicePixelRatio;
    nativeOverlayWidth = overlayCanvas.width;
    nativeOverlayHeight = overlayCanvas.height;
    overlayCanvas.style.width = `${overlayWidth}px`;
    overlayCanvas.style.height = `${overlayHeight}px`;
    document.body.style.setProperty('--vw', `${actualWidth}px`);
    document.body.style.setProperty('--vh', `${actualHeight}px`);
    if (e) {
      setTimeout(onResizeViewport, 1000);
    }
  }

  let overlayCtx = overlayCanvas.getContext('2d') as CanvasRenderingContext2D;
  // Set initial size of overlay canvas to the native resolution.
  // NOTE: We currently don't handle resizing, since we're mostly targeting mobile devices.

  function setHandlePositions() {
    fovTopHandle.style.top = `${fovBox.top}%`;
    fovRightHandle.style.right = `${fovBox.right}%`;
    fovBottomHandle.style.bottom = `${fovBox.bottom}%`;
    fovLeftHandle.style.left = `${fovBox.left}%`;
    let offset = fovBox.top + ((100 - (fovBox.bottom + fovBox.top)) * 0.5);
    fovLeftHandle.style.top = `${offset}%`;
    fovRightHandle.style.top = `${offset}%`;
    offset = fovBox.left + ((100 - (fovBox.left + fovBox.right)) * 0.5);
    fovTopHandle.style.left = `${offset}%`;
    fovBottomHandle.style.left = `${offset}%`;
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
      let position: {clientX: number, clientY: number};
      if (!(event instanceof MouseEvent)) {
        position = (event as TouchEvent).touches[0];
      } else {
        position = event;
      }
      const {clientX: x, clientY: y} = position;
      const minDimensions = 20;
      let maxInsetPercentage = 35;
      const canvasBounds = overlayCanvas.getBoundingClientRect();
      let offset;
      if (currentTarget) {
        switch (currentTarget.id) {
          case 'top-handle':
            maxInsetPercentage = 100 - (fovBox.bottom + minDimensions);
            fovBox.top = Math.min(maxInsetPercentage, Math.max(0, 100 * ((y - canvasBounds.top) / canvasBounds.height)));
            fovTopHandle.style.top = `${fovBox.top}%`;
            offset = fovBox.top + ((100 - (fovBox.bottom + fovBox.top)) * 0.5);
            fovLeftHandle.style.top = `${offset}%`;
            fovRightHandle.style.top = `${offset}%`;
            break;
          case 'right-handle':
            maxInsetPercentage = 100 - (fovBox.left + minDimensions);
            fovBox.right = Math.min(maxInsetPercentage, Math.max(0, 100 * ((canvasBounds.right - x) / canvasBounds.width)));
            fovRightHandle.style.right = `${fovBox.right}%`;
            offset = fovBox.left + ((100 - (fovBox.left + fovBox.right)) * 0.5);
            fovTopHandle.style.left = `${offset}%`;
            fovBottomHandle.style.left = `${offset}%`;
            break;
          case 'bottom-handle':
            maxInsetPercentage = 100 - (fovBox.top + minDimensions);
            fovBox.bottom = Math.min(maxInsetPercentage, Math.max(0, 100 * ((canvasBounds.bottom - y) / canvasBounds.height)));
            fovBottomHandle.style.bottom = `${fovBox.bottom}%`;
            offset = fovBox.top + ((100 - (fovBox.bottom + fovBox.top)) * 0.5);
            fovLeftHandle.style.top = `${offset}%`;
            fovRightHandle.style.top = `${offset}%`;
            break;
          case 'left-handle':
            maxInsetPercentage = 100 - (fovBox.right + minDimensions);
            fovBox.left = Math.min(maxInsetPercentage, Math.max(0, 100 * ((x - canvasBounds.left) / canvasBounds.width)));
            fovLeftHandle.style.left = `${fovBox.left}%`;
            offset = fovBox.left + ((100 - (fovBox.left + fovBox.right)) * 0.5);
            fovTopHandle.style.left = `${offset}%`;
            fovBottomHandle.style.left = `${offset}%`;
            break;
        }
        // Update saved fovBox:
        drawOverlay();
      }
    }

    // Handle resizes and orientation changes
    window.addEventListener('resize', onResizeViewport);
    window.addEventListener('orientationchange', onResizeViewport);
    const startDrag = (eventName: 'mousemove' | 'touchmove') => (e: Event) => {
      currentTarget = e.currentTarget as HTMLDivElement;
      window.addEventListener(eventName, dragHandle);
    };
    const endDrag = (eventName: 'mousemove' | 'touchmove') => () => {
      currentTarget = undefined;
      window.removeEventListener(eventName, dragHandle);
    };
    for (const dragHandle of [fovTopHandle, fovRightHandle, fovBottomHandle, fovLeftHandle]) {
      // Mouse
      dragHandle.addEventListener('mousedown', startDrag('mousemove'));
      // Touch
      dragHandle.addEventListener('touchstart', startDrag('touchmove'));
    }
    window.addEventListener('mouseup', endDrag('mousemove'));
    window.addEventListener('touchend', endDrag('touchmove'));
  }

  setOverlayMessages("Loading...");

  (document.getElementById("warmer") as HTMLButtonElement).addEventListener("click", () => {
    setCalibrateTemperatureSafe(GCalibrate_temperature_celsius + 0.1);
  });

  (document.getElementById("cooler") as HTMLButtonElement).addEventListener("click", () => {
    setCalibrateTemperatureSafe(GCalibrate_temperature_celsius - 0.1);
  });

  (document
    .getElementById("calibration_button") as HTMLButtonElement)
    .addEventListener("click", () => startCalibration());

  (document
    .getElementById("admin_button") as HTMLButtonElement)
    .addEventListener("click", () => openNav());

  (document
    .getElementById("admin_close_button") as HTMLButtonElement)
    .addEventListener("click", () => {
      closeNav();
    });

  // @ts-ignore
  GNoSleep = new NoSleep();
  (document.getElementById("scan_button") as HTMLButtonElement).addEventListener("click", () => {
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

  function setCalibrateTemperature(temperatureCelsius: number, excludeElement: HTMLInputElement | null = null) {
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

  function showTemperature(temperature_celsius: number, uncertainty_celsius: number) {
    const icons = [thumbHot, thumbNormal];
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
    }
    if (Mode === Modes.SCAN) {
      const hasPrevState = prevState && prevState.length !== 0;
      if (!GDuringFFC) {
        setTitle('Scanning...');
      }
      if ((!GDuringFFC) && (!hasPrevState || (hasPrevState && !prevState.includes(`${state}-state`)))) {
        // Play sound
        // Sounds quickly grabbed from freesound.org
        switch (state) {
          case 'fever':
            new Audio('/static/sounds/445978_9159316-lq.mp3').play();
            break;
          case 'normal':
            new Audio('/static/sounds/341695_5858296-lq.mp3').play();
            break;
          case 'error':
            new Audio('/static/sounds/142608_1840739-lq.mp3').play();
            break;
        }
      }
    }
    const strC = `${temperature_celsius.toFixed(GDisplay_precision)}&deg;C`;
    let strDisplay = `<span class="msg-1">${strC}</span>`;
    strDisplay += `<span class="msg-2">${descriptor}</span>`;
    if (GDisplay_precision>1) {
      strDisplay +=
        "<br> Temp: " +
        temperature_celsius.toFixed(GDisplay_precision) +
        "<br> UN2: &plusmn;" +
        uncertainty_celsius.toFixed(GDisplay_precision) +
        "<br> HV:" +
        (GCurrent_hot_value/100).toFixed(GDisplay_precision) +
        "<br> HVR:" +
        ((GRaw_hot_value)/100).toFixed(3) +
        "<br> Tdev:" +
        GDevice_temperature.toFixed(GDisplay_precision) +
        "&deg;C";
      strDisplay += '<br>TFC:' + GTimeSinceFFC.toFixed(1)+'s';
      strDisplay += '<br>T:' + Math.floor(new Date().getTime()-1586751000000)+'s';
      strDisplay += '<br>SC:'+GStable_correction.toFixed(2)
      console.log(strDisplay)
      selectedIcon = undefined;
    }
    if (GDuringFFC) {
      setTitle('Please wait');
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
      "fever-state"
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

  function estimatedUncertaintyForValue(value: number, include_calibration: boolean = true) {

    return 0;    //not really working, so just ignore it for now..

    let result = 0.00;

    result += 0.03; // uncertainty just from the sensor alone

    if (include_calibration) {
      let seconds_since_calibration = (new Date().getTime() - GCalibrate_snapshot_time) / (1000);
      result += GCalibrate_snapshot_uncertainty * Math.min(seconds_since_calibration / 60, 1);

      if(GStable_correction === 0) {
        const worst_drift_in_10_minutes_celsius = 0.5;
        result += seconds_since_calibration * worst_drift_in_10_minutes_celsius / 600;
      }
    }

    if (GTimeSinceFFC < 10) {
        result += 0.8;
    } else if (GTimeSinceFFC < 90) {
        result += 0.2 * (90 - GTimeSinceFFC) / 90;
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

    if (overlayHTML === '') {
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

  function median_smooth_pass(source: Float32Array, delta: number, swizzle: number): Float32Array {
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

  function radial_smooth_half(source: Float32Array, width: number, height: number): Float32Array {
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

  function mip_scale_down(source: Float32Array, width: number, height: number): Float32Array {
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
    if(GMipScale1 === null) {
        return;
    }
    GMipCorrect1 = GMipScale1;
    GMipCorrectX = GMipScaleX;
    GMipCorrectXX = GMipScaleXX;
    GMipScale1 = null;
    GMipScaleX = null;
    GMipScaleXX = null;

    //GStable_correction_accumulator += Math.abs(GStable_correction);
    if(GStable_correction_accumulator > 100) {
        startCalibration();
        alert("Manual recalibration needed");

        GStable_correction_accumulator = 0;
    }
    GStable_correction = 0;
  }

  function accumulate_stable_temperature(source: Float32Array) {
    let wh = source.length;
    if(GMipScale1 === null) {
      GMipScale1 = new Float32Array(wh);
      GMipScaleX = new Float32Array(wh);
      GMipScaleXX = new Float32Array(wh);
      GMipCorrect1 = null;
      GMipCorrectX = null;
      GMipCorrectXX = null;
    }
    for(let i=0; i<wh; i++) {
      let value = source[i];
      if(value<0 || 10000<value) {
        console.log('superhot value '+value);
        continue;
      }
      GMipScale1[i] += 1;
      (GMipScaleX as Float32Array)[i] += value;
      (GMipScaleXX as Float32Array)[i] += value * value;
    }
  }

  function stable_mean(source: Float32Array) {
    let i0 = Math.floor(source.length/4);
    let i1 = source.length - i0;
    let sum = 0;
    let count = 0;
    for(let i = i0; i < i1; i++) {
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

    if(mip_1 === null) {
      //Todo: check GTimeSinceFFC here and return false
      GStable_uncertainty = 0.7;
      return true;
    }

    let wh = source.length;
    let bucket_variation = new Float32Array(wh);
    let endCursor = 0;
    for(let index=0; index<wh; index++) {
      let value = source[index];

      let exp_1 = mip_1[index];
      if(exp_1 < 9 * 10) {
        continue;
      }
      let exp_x = (mip_x as Float32Array)[index] / exp_1;
      let exp_xx = (mip_xx as Float32Array)[index] / exp_1;
      let inner = Math.max(0, exp_xx - exp_x*exp_x);
      let std_dev = Math.sqrt(inner);
      let abs_err = Math.abs(exp_x - value);
      if((std_dev < 15) && (abs_err<150)) {
        bucket_variation[endCursor++] = exp_x - value;
      }
    }
    if(endCursor < 20) {
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

  function update_stable_temperature(source: Float32Array, width: number, height: number): boolean {
    while (width>16) {
      source = mip_scale_down(source, width, height);
      width = Math.floor(width / 2);
      height = Math.floor(height / 2);
    }

    if(GTimeSinceFFC > 120) {
      accumulate_stable_temperature(source);
    }else{
      roll_stable_values();
    }
    // NOTE(jon): Always returns `true`...
    return correct_stable_temperature(source);
  }

  function processSnapshotRaw(source: Float32Array, frameInfo: FrameInfo) {
    {
      //Spatial preprocessing of the data...

      //First use a salt'n'pepper median filter
      // https://en.wikipedia.org/wiki/Shot_noise
      const saltPepperData = median_smooth(source);

      //next, a radial blur, this averages out surrounding pixels, trading accuracy for effective resolution
      const smoothedData = radial_smooth(saltPepperData);
      source = smoothedData;
    }
    GDevice_temperature = frameInfo.Telemetry.TempC;
    {
        // In our temperature range, with our particular IR filter,
        //  a constant temperature person
        //  with a change in device temperature,
        //  changes the sensor values by this amount
        const device_adder_temp = GDevice_temperature * GDevice_sensor_temperature_response;
        for(let index = 0; index < frameWidth * frameHeight; index++) {
            source[index] += device_adder_temp;
        }
    }

    let usv = update_stable_temperature(source, frameWidth, frameHeight);
    // NOTE(jon): In what circumstance can this be false?
    if(!usv) {
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
          hotValue = current;
          hotSpotX = x;
          hotSpotY = y;
        }
      }
    }

    if (false) {
        hotSpotX = frameWidth / 2;
        hotSpotY = frameHeight / 2;
        hotValue = source[hotSpotY * frameHeight + hotSpotX];
    }

    let raw_hot_value = hotValue;
    GRaw_hot_value = hotValue - (GDevice_temperature * GDevice_sensor_temperature_response)

    let stable_fix_factor = 1 - (GTimeSinceFFC-120) / 60;
    stable_fix_factor = Math.min(Math.max(stable_fix_factor, 0), 1);
    const stable_fix_amount = stable_fix_factor * GStable_correction;
    hotValue += stable_fix_amount;

    if (Math.abs(GCurrent_hot_value - hotValue) > 20) {
      GCurrent_hot_value = hotValue;  // Temp change too much for filter.
    } else {
      //Temporal filtering
      let alpha = 0.3; // Heat up fast
      if (GCurrent_hot_value > hotValue) {
        alpha = 0.9; // Cool down slow
      }
      GCurrent_hot_value = GCurrent_hot_value * alpha + hotValue * (1 - alpha);
    }

    let feverThreshold = 1 << 16;
    let checkThreshold = 1 << 16;

    if (Mode === Modes.CALIBRATE) {
      GCalibrate_snapshot_value = GCurrent_hot_value;
      GCalibrate_snapshot_uncertainty = estimatedUncertaintyForValue(GCurrent_hot_value, false);
      GCalibrate_snapshot_time = new Date().getTime();
      checkThreshold = raw_hot_value - 20;
    }
    if (Mode === Modes.SCAN) {
      const temperature = estimatedTemperatureForValue(GCurrent_hot_value);
      let uncertainty = estimatedUncertaintyForValue(GCurrent_hot_value);
      uncertainty = Math.max(uncertainty, 0.1**GDisplay_precision);

      showTemperature(temperature, uncertainty);
      feverThreshold =
        (GThreshold_fever - GCalibrate_temperature_celsius) / GSensor_response +
        GCalibrate_snapshot_value - stable_fix_amount;
      checkThreshold =
        (GThreshold_check - GCalibrate_temperature_celsius) / GSensor_response +
        GCalibrate_snapshot_value - stable_fix_amount;
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
    overlayCtx.beginPath();
    overlayCtx.arc(
      (hotSpotX * nativeOverlayWidth) / canvasWidth,
      (hotSpotY * nativeOverlayHeight) / frameHeight,
      30 * window.devicePixelRatio,
      0,
      2 * Math.PI,
      false
    );
    overlayCtx.lineWidth = 3 * window.devicePixelRatio;
    overlayCtx.strokeStyle = "#ff0000";
    overlayCtx.stroke();

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
      rightInset = (nativeOverlayWidth / 100 ) * fovBox.right;
    }
    if (fovBox.top) {
      topInset = (nativeOverlayHeight / 100) *  fovBox.top;
    }
    if (fovBox.bottom) {
      bottomInset = (nativeOverlayHeight / 100) *  fovBox.bottom;
    }
    overlay.rect(leftInset, topInset, nativeOverlayWidth - (rightInset + leftInset), nativeOverlayHeight - (bottomInset + topInset));
    overlayCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    overlayCtx.fill(overlay, 'evenodd');
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
        Top: fovBox.top,
        Left: fovBox.left,
        Right: fovBox.right,
        Bottom: fovBox.bottom,
        CalibrationBinaryVersion: binaryVersion,
        UuidOfUpdater: UUID
      });
      setOverlayMessages("Calibration saved");
      settingsDiv.classList.remove("show-calibration");
    }
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
      setOverlayMessages('Connection Error', `Retrying in ${retryTime}`);
      retryTime -= 1;
      setTimeout(() => retrySocket(retryTime, deviceIp), 1000);
    } else {
      openSocket(deviceIp);
    }
  };
  // We should actually be able to get the port etc from config endpoint.
  // First get the address of the server?
  let hasFirstFrame = false;
  let reconnected = false;
  let socket: WebSocket;
  const openSocket = (deviceIp: string) => {
    socket = new WebSocket(`ws://${deviceIp}/ws`);
    setOverlayMessages("Loading...");
    socket.addEventListener('error', () => {
      //...
    });
    // Connection opened
    const registerSocket = (socket: WebSocket) => {
      if (socket.readyState === WebSocket.OPEN) {
        // We are waiting for frames now.
        setOverlayMessages("Loading...");
        socket.send(JSON.stringify({
          type: 'Register',
          uuid: UUID,
        }));
      } else {
        setTimeout(() => registerSocket(socket), 100);
      }
    };
    socket.addEventListener('open', (event) => registerSocket(socket));
    socket.addEventListener('close', () => {
      // When we do reconnect, we need to treat it as a new connection
      reconnected = true;
      temperatureDisplay.innerHTML = '<span class="msg-1">Loading</span>';
      setTitle('Loading');
      clearTimeout(animatedSnow);
      showAnimatedSnow();
      retrySocket(5, deviceIp);
    });
    socket.addEventListener('message', async (event) => {
      if (event.data instanceof Blob) {
        const blob = event.data;
        // Get the u16 size at the beginning of the blob
        const frameInfoLength = new Uint16Array(await BlobReader.arrayBuffer(blob.slice(0, 2)))[0];
        const frameStartOffset = 2 + frameInfoLength;
        let frameInfo: FrameInfo;
        let data: ArrayBuffer;
        try {
          frameInfo = JSON.parse(await BlobReader.text(blob.slice(2, 2 + frameInfoLength)));
          frameWidth = frameInfo.Camera.ResX;
          frameHeight = frameInfo.Camera.ResY;
          const frameSizeInBytes = frameWidth * frameHeight * 2;
          data = await BlobReader.arrayBuffer(blob.slice(frameStartOffset, frameStartOffset + frameSizeInBytes));
          await updateFrame(data, frameInfo);
        } catch (e) {
          console.error("Malformed JSON payload", e);
        }
      } else {
        // Let's try and get our data as json:
        // This might be status about the initial load of the device, connection, whether we need to ask the
        // user to calibrate.
      }
    });
  };
  populateVersionInfo(versionInfoElement).then((result) => {
    if (typeof result === 'object') {
      const {networkInfo} = result;
      const activeInterface = networkInfo.Interfaces.find(x => x.IPAddresses !== null) as NetworkInterface;
      activeInterface.IPAddresses = activeInterface.IPAddresses.map(x => x.trim());
      let deviceIp = activeInterface.IPAddresses[0];
      deviceIp = deviceIp.substring(0, deviceIp.indexOf('/'));
      openSocket(deviceIp);
      // TODO(jon): Some basic auth for the server?
      setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({
            type: 'Heartbeat',
            uuid: UUID,
          }));
        }
      }, 5000);
    } else {
      setOverlayMessages("Connection Error");
    }
  });

  function updateCalibration(calibration: CalibrationInfo): boolean {
    if (calibration.UuidOfUpdater !== LastCalibrationUUID) {
      LastCalibrationUUID = calibration.UuidOfUpdater;
      // Someone else updated the calibration, and we need to update ours!
      GCalibrate_body_location = calibration.BodyLocation;
      GCalibrate_snapshot_time = calibration.SnapshotTime;
      GCalibrate_snapshot_uncertainty = calibration.SnapshotUncertainty;
      GCalibrate_snapshot_value = calibration.SnapshotValue;
      GCalibrate_temperature_celsius = calibration.TemperatureCelsius;
      fovBox.left = calibration.Left;
      fovBox.right = calibration.Right;
      fovBox.top = calibration.Top;
      fovBox.bottom = calibration.Bottom;
      setHandlePositions();
      return true;
    }
    return false;
  }

  async function init() {
    if ((new Date().getTime()) - GCalibrate_snapshot_time > (staleCalibrationTimeoutMinutes * 60 * 1000)) {
      // The existing calibration we've loaded from the Pi is too old, so we'll force a recalibration.
      // We will start the calibration with the default hard-coded thresholds.
      // Should we send a message so that each screen gets the calibration settings?
      startCalibration();
    } else {
      if (await getPrompt("Do you want to use the current calibration settings?")) {
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

    if (!hasFirstFrame || reconnected) {
      // On the initial load:
      // Set the app version as seen on page load.
      binaryVersion = BinaryVersion;
      appVersion = AppVersion;
      // Clear any loading messages
      setOverlayMessages();
      reconnected = false;
      if (!hasFirstFrame) {
        hasFirstFrame = true;
        await init();
      }
    } else if (didUpdateCalibration) {
      // Someone updated the calibration, and we should show a notification to that effect.
      setOverlayMessages("Calibration updated");
      setTimeout(() => setOverlayMessages(), 1000);
    }
    if (BinaryVersion !== binaryVersion || appVersion !== AppVersion) {
      // The backend got updated beneath us, and we should update to get new front-end code.
      // TODO(jon): How do we tell if it's a new release?  Do we check the timestamp of the update?
      window.location.reload();
    }

    // Check for per frame changes
    GTimeSinceFFC = (telemetry.TimeOn - telemetry.LastFFCTime) / (1000 * 1000 * 1000);
    let ffcDelay = 10 - GTimeSinceFFC;
    if (GStable_correction==0.0) {
      ffcDelay = 120 - GTimeSinceFFC;
    }
    const exitingFFC = GDuringFFC && !(telemetry.FFCState !== "complete" || ffcDelay > 0);
    GDuringFFC = telemetry.FFCState !== "complete" || ffcDelay > 0;
    processSnapshotRaw(Float32Array.from(new Uint16Array(data)), frameInfo);

    if (GDuringFFC && !exitingFFC) {
      // Disable the 'DONE' button which enables the user to exit calibration.
      scanButton.setAttribute("disabled", "disabled");
      app.classList.add('ffc');
      const alpha = Math.min(ffcDelay * 0.1, 0.75);
      showLoadingSnow(alpha);

      let delayS = '';
      if (ffcDelay >= 0) {
        delayS = ffcDelay.toFixed(0).toString();
      }
      setOverlayMessages("Self-Balancing", delayS);
    } else if (exitingFFC) {
      scanButton.removeAttribute("disabled");
      app.classList.remove('ffc');
      setOverlayMessages();
    }
  }

  onResizeViewport();
  // Until we get our first frame, we show animated loading snow.
  showAnimatedSnow();
};
