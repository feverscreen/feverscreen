const slope = 0.03136;
const frameWidth = 160;
const frameHeight = 120;
const Modes = {
  INIT: 'init',
  CALIBRATE: 'calibrate',
  SCAN: 'scan'
};

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
  get CAMERA_RAW() {
    return `${this.debugPrefix}/camera/snapshot-raw`;
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
  get SAVE_CALIBRATION() {
    return `${this.debugPrefix}/api/calibration/save`;
  },
  get LOAD_CALIBRATION() {
    return `${this.debugPrefix}/api/calibration/get`;
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
        'Content-Type': "application/x-www-form-urlencoded"
      },
      body: data
    })
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
  async rawFrame() {
    const response = await this.get(`${this.CAMERA_RAW}?${new Date().getTime()}`);
    if (response.status !== 200) {
      throw new Error(ErrorKind.BAD_API_CALL);
    }
    let data;
    try {
      data = new Uint16Array(await response.arrayBuffer());
    }
    catch(e) {
      throw new Error(ErrorKind.CAMERA_NOT_READY);
    }
    if (data.length !== frameWidth * frameHeight) {
      // We're probably still loading.
      debugger;
      throw new Error(ErrorKind.CAMERA_NOT_READY);
    }
    try {
      const telemetry = JSON.parse(response.headers.get("Telemetry"));
      return {
        data,
        telemetry
      };
    } catch (e) {
      throw new Error(ErrorKind.INVALID_TELEMETRY);
    }
  },
  async softwareVersion() {
    return this.getJSON(this.SOFTWARE_VERSION);
  },
  async deviceInfo() {
    return this.getJSON(this.DEVICE_INFO);
  },
  async deviceTime() {
    return this.getJSON(this.DEVICE_TIME);
  },
  async deviceConfig() {
    return this.getJSON(this.DEVICE_CONFIG);
  },
  async saveCalibration(data) {
    // NOTE: This API only supports a json payload one level deep.  No nested structures.
    let formData = new URLSearchParams();
    formData.append('calibration', JSON.stringify(data));
    return this.post(this.SAVE_CALIBRATION, formData);
  },
  async getCalibration() {
    return this.getJSON(this.LOAD_CALIBRATION);
  }
};

// Top of JS
window.onload = async function() {
  // console.log(await DeviceApi.deviceInfo());
  const { appVersion } = await DeviceApi.softwareVersion();
  const lastAppVersion  = window.localStorage.getItem('appVersion');
  if (lastAppVersion && lastAppVersion !== appVersion) {
    window.localStorage.setItem('appVersion', appVersion);
    window.location.reload();
  }
  // console.log(await DeviceApi.deviceTime());
  // console.log(await DeviceApi.deviceConfig());
  // console.log(await DeviceApi.getCalibration());

  let GCalibrate_temperature_celsius = 37;
  let GCalibrate_snapshot_value = 0;
  let GCalibrate_snapshot_uncertainty = 100;
  let GCalibrate_snapshot_time = 0;

  let GCalibrate_body_location = 'forehead';
  let fovBox = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  };

  async function loadExistingCalibrationSettings() {
    const existingCalibration = await DeviceApi.getCalibration();
    if (existingCalibration !== null) {
      GCalibrate_temperature_celsius = existingCalibration.GCalibrate_temperature_celsius;
      GCalibrate_snapshot_value = existingCalibration.GCalibrate_temperature_celsius;
      GCalibrate_snapshot_uncertainty = existingCalibration.GCalibrate_snapshot_uncertainty;
      GCalibrate_snapshot_time = existingCalibration.GCalibrate_snapshot_time;
      fovBox = {
        top: existingCalibration.fovTop,
        right: existingCalibration.fovRight,
        bottom: existingCalibration.fovBottom,
        left: existingCalibration.fovLeft,
      };
      // TODO: Make use of this value in calibration adjustments
      GCalibrate_body_location = existingCalibration.GCalibrate_body_location;
    }
  }
  await loadExistingCalibrationSettings();

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

  let fetch_frame_delay = 100;
  let GTimeSinceFFC = 0;



  let GCurrent_hot_value = 10;
  let GDevice_temperature = 10;

  let Mode;
  // radial smoothing kernel.
  const kernel = new Float32Array(7);
  const radius = 3;
  let i = 0;
  for (let r = -radius; r <= radius; r++) {
    kernel[i++] = Math.exp((-3 * (r * r)) / radius / radius);
  }

  const fahrenheitToCelsius = f => (f - 32.0) * (5.0 / 9);
  const celsiusToFahrenheit = c => c * (9.0 / 5) + 32;

  const temperatureInputCelsius = document.getElementById(
    "temperature_input_a"
  );
  const temperatureInputLabel = document.getElementById("temperature_label");

  const calibrationOverlay = document.getElementById("myNav");
  const mainCanvas = document.getElementById("main_canvas");
  let canvasWidth = mainCanvas.width;
  let canvasHeight = mainCanvas.height;
  const scanButton = document.getElementById("scan_button");
  const temperatureDiv = document.getElementById("temperature_div");
  const temperatureInput = document.getElementById("temperature_input_a");
  const thumbHot = document.getElementById("thumb_hot");
  const thumbNormal = document.getElementById("thumb_normal");
  const titleDiv = document.getElementById("title_div");
  const settingsDiv = document.getElementById("settings");
  const temperatureDisplay = document.getElementById("temperature_display");
  const overlayMessage = document.getElementById("overlay-message");
  const overlayCanvas = document.getElementById('overlay-canvas');
  const canvasContainer = document.getElementById('canvas-outer');
  const statusText = document.getElementById("status-text");
  const app = document.getElementById('app');
  const mainParent = document.getElementById('main');
  const mainDiv = document.getElementById('main-inner');
  const ctx = mainCanvas.getContext("2d");

  const setMode = (mode) => {
    Mode = mode;
    app.classList.remove(...Object.values(Modes));
    app.classList.add(mode);
  };
  setMode(Modes.INIT);

  function onResizeViewport(e) {
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

  let overlayCtx;
  // Set initial size of overlay canvas to the native resolution.
  // NOTE: We currently don't handle resizing, since we're mostly targeting mobile devices.

  let overlayTextTimeout;
  let hotSpotX = 0;
  let hotSpotY = 0;
  let nativeOverlayWidth;
  let nativeOverlayHeight;
  {
    onResizeViewport();
    overlayCtx = overlayCanvas.getContext('2d');
  }

  {
    let currentTarget;
    // Handling FOV selection by user:
    const fovTopHandle = document.getElementById("top-handle");
    const fovRightHandle = document.getElementById("right-handle");
    const fovBottomHandle = document.getElementById("bottom-handle");
    const fovLeftHandle = document.getElementById("left-handle");
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

    function dragHandle(event) {
      if (!(event instanceof MouseEvent)) {
        event = event.touches[0];
      }

      const {clientX: x, clientY: y} = event;
      const minDimensions = 20;
      let maxInsetPercentage = 35;
      const canvasBounds = overlayCanvas.getBoundingClientRect();
      let offset;
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


    // Handle resizes and orientation changes
    window.addEventListener('resize', onResizeViewport);
    window.addEventListener('orientationchange', onResizeViewport);


    // Mouse
    fovTopHandle.addEventListener('mousedown', (e) => {
      currentTarget = e.currentTarget;
      window.addEventListener('mousemove', dragHandle);
    });
    fovRightHandle.addEventListener('mousedown', (e) => {
      currentTarget = e.currentTarget;
      window.addEventListener('mousemove', dragHandle);
    });
    fovBottomHandle.addEventListener('mousedown', (e) => {
      currentTarget = e.currentTarget;
      window.addEventListener('mousemove', dragHandle);
    });
    fovLeftHandle.addEventListener('mousedown', (e) => {
      currentTarget = e.currentTarget;
      window.addEventListener('mousemove', dragHandle);
    });

    window.addEventListener('mouseup', () => {
      currentTarget = null;
      window.removeEventListener('mousemove', dragHandle);
    });

    // Touch
    fovTopHandle.addEventListener('touchstart', (e) => {
      currentTarget = e.currentTarget;
      window.addEventListener('touchmove', dragHandle);
    });
    fovRightHandle.addEventListener('touchstart', (e) => {
      currentTarget = e.currentTarget;
      window.addEventListener('touchmove', dragHandle);
    });
    fovBottomHandle.addEventListener('touchstart', (e) => {
      currentTarget = e.currentTarget;
      window.addEventListener('touchmove', dragHandle);
    });
    fovLeftHandle.addEventListener('touchstart', (e) => {
      currentTarget = e.currentTarget;
      window.addEventListener('touchmove', dragHandle);
    });

    window.addEventListener('touchend', () => {
      currentTarget = null;
      window.removeEventListener('touchmove', dragHandle);
    });
  }

  setOverlayMessages("Loading");

  document.getElementById("warmer").addEventListener("click", () => {
    setCalibrateTemperatureSafe(GCalibrate_temperature_celsius + 0.1);
  });

  document.getElementById("cooler").addEventListener("click", () => {
    setCalibrateTemperatureSafe(GCalibrate_temperature_celsius - 0.1);
  });

  document
    .getElementById("calibration_button")
    .addEventListener("click", () => startCalibration());

  document
    .getElementById("admin_button")
    .addEventListener("click", () => openNav("Admin (placeholder)"));

  document
    .getElementById("admin_close_button")
    .addEventListener("click", () => {
      closeNav();
    });

  const GNoSleep = new NoSleep();
  document.getElementById("scan_button").addEventListener("click", () => {
    GNoSleep.enable();
    startScan();
  });

  temperatureInputCelsius.addEventListener("input", event => {
    let entry_value = parseFloat(event.target.value);
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

  function isUnreasonableCalibrateTemperature(temperatureCelsius) {
    if (temperatureCelsius < 10 || temperatureCelsius > 90) {
      return true;
    }
    return isNaN(temperatureCelsius);
  }

  function setCalibrateTemperature(temperatureCelsius, excludeElement = null) {
    if (isUnreasonableCalibrateTemperature(temperatureCelsius)) {
      return;
    }
    GCalibrate_temperature_celsius = temperatureCelsius;
    if (excludeElement !== temperatureInput) {
      temperatureInput.value = temperatureCelsius.toFixed(GDisplay_precision);
      temperatureInputLabel.innerHTML = "&deg;C";
    }
  }

  function setCalibrateTemperatureSafe(temperature_celsius) {
    if (isUnreasonableCalibrateTemperature(temperature_celsius)) {
      temperature_celsius = 35.6;
    }
    setCalibrateTemperature(temperature_celsius);
  }

  function showTemperature(temperature_celsius, uncertainty_celsius) {
    const icons = [thumbHot, thumbNormal];
    let selectedIcon;
    let state = "null";
    let descriptor = "Empty";
    const prevState = Array.from(temperatureDiv.classList.values());
    let errorAltColour = false;
    if (!duringFFC) {
      if (uncertainty_celsius > GThreshold_uncertainty) {
        statusText.classList.add("pulse-message");
        setOverlayMessages("Please re-calibrate", "camera");
      } else {
        statusText.classList.remove("pulse-message");
        setOverlayMessages();
      }
    }
    if (temperature_celsius > GThreshold_error) {
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
      if (!hasPrevState || (hasPrevState && !prevState.includes(`${state}-state`))) {
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
        "<br> UNS: &plusmn;" +
        uncertainty_celsius.toFixed(2) +
        "<br> HV:" +
        (GCurrent_hot_value/100).toFixed(2) +
        "<br> Tdev:" +
        GDevice_temperature.toFixed(GDisplay_precision) +
        "&deg;C";
      strDisplay += '<br>TFC:' + GTimeSinceFFC.toFixed(1)+'s';
      selectedIcon = undefined;
    }
    if (duringFFC) {
      setTitle('Please wait');
      strDisplay = "<span class='msg-1'>FFC</span>";
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

  function requestUserRecalibration() {
    // NOTE: Call this whenever a user recalibration step is required
    setOverlayMessages("Please recalibrate", "camera");
  }

  function estimatedTemperatureForValue(value) {
    return (
      GCalibrate_temperature_celsius +
      (value - GCalibrate_snapshot_value) * slope
    );
  }

  function estimatedUncertaintyForValue(value, include_calibration = true) {
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

  function setOverlayMessages(...messages) {
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

  function showLoadingSnow(alpha = 1) {
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

  function median_three(a, b, c) {
    if (a <= b && b <= c) return b;
    if (c <= b && b <= a) return b;

    if (b <= a && a <= c) return a;
    if (c <= a && a <= b) return a;

    return c;
  }

  function median_smooth_pass(source, delta, swizzle) {
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

  function median_smooth(source) {
    source = median_smooth_pass(source, 1, 0);
    source = median_smooth_pass(source, frameWidth, 0);
    source = median_smooth_pass(source, frameWidth, 3);
    source = median_smooth_pass(source, 1, 3);
    return source;
  }

  function radial_smooth_half(source, width, height) {
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

  function radial_smooth(source) {
    const temp = radial_smooth_half(source, frameWidth, frameHeight);
    const dest = radial_smooth_half(temp, frameHeight, frameWidth);
    return dest;
  }

  function mip_scale_down(source, width, height) {
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

  let GMipScale1 = null;
  let GMipScaleX = null;
  let GMipScaleXX = null;

  let GMipCorrect1 = null;
  let GMipCorrectX = null;
  let GMipCorrectXX = null;

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

    GStable_correction_accumulator += Math.abs(GStable_correction);
    if(GStable_correction_accumulator > 100) {
        startCalibration();
        alert("Manual recalibration needed");

        GStable_correction_accumulator = 0;
    }
    GStable_correction = 0;
  }

  function accumulate_stable_temperature(source, width, height) {
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
      GMipScaleX[i] += value;
      GMipScaleXX[i] += value * value;
    }
  }

  function stable_mean(source) {
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

  function correct_stable_temperature(source) {
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

    let bucket_variation = [];
    let wh = source.length;
    for(let index=0; index<wh; index++) {
      let value = source[index];

      let exp_1 = mip_1[index];
      if(exp_1 < 9 * 10) {
        continue;
      }
      let exp_x = mip_x[index] / exp_1;
      let exp_xx = mip_xx[index] / exp_1;
      let inner = Math.max(0, exp_xx - exp_x*exp_x);
      let std_dev = Math.sqrt(inner);
      let abs_err = Math.abs(exp_x - value);
      if((std_dev < 15) && (abs_err<150)) {
        bucket_variation.push(exp_x - value);
      }
    }
    if(bucket_variation.length < 20) {
      GStable_uncertainty = 0.5;
      GStable_correction = 0;
      return true;
    }

    bucket_variation.sort();
    GStable_correction = stable_mean(bucket_variation);
    GStable_uncertainty = 0.1;
    return true;
  }

  function update_stable_temperature(source, width, height) {
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
    return correct_stable_temperature(source);
  }

  function processSnapshotRaw(rawData, metaData) {
    let source = rawData;
    if (true) {
      const saltPepperData = median_smooth(rawData);
      const smoothedData = radial_smooth(saltPepperData);
      source = smoothedData;
    }
    let usv = update_stable_temperature(source, frameWidth, frameHeight);
    if(!usv) {
      return;
    }

    const x0 = Math.floor((frameWidth / 100) * fovBox.left);
    const x1 = frameWidth - Math.floor((frameWidth / 100) * fovBox.right);
    const y0 = Math.floor((frameHeight / 100) * fovBox.top);
    const y1 = frameHeight - Math.floor((frameHeight / 100) * fovBox.bottom);

    let darkValue = 1 << 30;
    let hotValue = 0;
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
        hotValue[hotSpotY * frameHeight + hotSpotX];
    }

    let raw_hot_value = hotValue;
    let device_sensitivity = 40;
    if(GStable_correction !== 0) {
        device_sensitivity = 0;
    }
    GDevice_temperature = metaData["TempC"];
    let device_adder = GDevice_temperature * device_sensitivity;
    hotValue -= device_adder;

    hotValue += GStable_correction;

    let alpha = 0.3;
    if (GCurrent_hot_value > hotValue) {
      alpha = 0.9;
    }
    GCurrent_hot_value = GCurrent_hot_value * alpha + hotValue * (1 - alpha);

    let feverThreshold = 1 << 16;
    let checkThreshold = 1 << 16;

    if (Mode === Modes.CALIBRATE) {
      GCalibrate_snapshot_value = GCurrent_hot_value;
      GCalibrate_snapshot_uncertainty = estimatedUncertaintyForValue(GCurrent_hot_value, false);
      GCalibrate_snapshot_time = new Date().getTime();
      checkThreshold = hotValue - 20 + device_adder;
    }
    if (Mode === Modes.SCAN) {
      const temperature = estimatedTemperatureForValue(hotValue);
      let uncertainty = estimatedUncertaintyForValue(hotValue);
      uncertainty = Math.max(uncertainty, 0.1**GDisplay_precision);

      showTemperature(temperature, uncertainty);
      feverThreshold =
        (GThreshold_fever - GCalibrate_temperature_celsius) / slope +
        GCalibrate_snapshot_value +
        device_adder;
      checkThreshold =
        (GThreshold_check - GCalibrate_temperature_celsius) / slope +
        GCalibrate_snapshot_value +
        device_adder;
    }

    //    console.log("hotValue: "+hotValue+", deviceTemp"+metaData['TempC']);
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
    if (!duringFFC) {
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

  let animatedSnow;
  let duringFFC = false;
  async function fetchFrameDataAndTelemetry() {
    setTimeout(fetchFrameDataAndTelemetry, fetch_frame_delay);
    clearTimeout(animatedSnow);
    fetch_frame_delay = Math.min(5000, fetch_frame_delay * 1.3 + 100);

    try {
      const {data, telemetry} = await DeviceApi.rawFrame();
      GTimeSinceFFC = (telemetry.TimeOn - telemetry.LastFFCTime) / (1000 * 1000 * 1000);
      processSnapshotRaw(data, telemetry);
      scanButton.removeAttribute("disabled");
      fetch_frame_delay = 1000 / 8.7;
      const ffcDelay = 4 - GTimeSinceFFC;
      const ffcInProgress = telemetry.FFCState !== "complete" || ffcDelay > 0;
      const enteringFFC = !duringFFC && ffcInProgress;
      const exitingFFC = duringFFC && !ffcInProgress;

      if (ffcInProgress) {
        if (enteringFFC) {
          // Disable the 'DONE' button which enables the user to exit calibration.
          scanButton.setAttribute("disabled", "disabled");
          duringFFC = true;
          app.classList.add('ffc');
        }
        const alpha = Math.min(ffcDelay * 0.1, 0.75);
        let delayS = '';
        if (ffcDelay >= 0) {
          delayS = ffcDelay.toFixed(0).toString();
        }
        showLoadingSnow(alpha);
        showTemperature(20, 100); // empty temperature
        setOverlayMessages("FFC in progress", delayS);
      } else if (exitingFFC) {
        setOverlayMessages();
        duringFFC = false;
        app.classList.remove('ffc');
      }
    } catch (err) {
      switch (err) {
        case ErrorKind.CAMERA_NOT_READY:
          setOverlayMessages("Loading");
          break;
        case ErrorKind.INVALID_TELEMETRY:
        case ErrorKind.BAD_API_CALL:
        default:
          console.log(err);
          setOverlayMessages("Error");
      }
      animatedSnow = setTimeout(showAnimatedSnow, 1000 / 8.7);
      return false;
    }
    return true;
  }

  function showAnimatedSnow(alpha = 0.5) {
    showLoadingSnow(alpha);
    animatedSnow = setTimeout(() => showAnimatedSnow(alpha), 1000 / 8.7);
  }

  function openNav(text) {
    calibrationOverlay.classList.add("show");
    overlayMessage.innerHTML = text;
  }

  function closeNav() {
    calibrationOverlay.classList.remove("show");
  }

  function setTitle(text) {
    titleDiv.innerText = text;
  }

  function startCalibration(message) {
    setMode(Modes.CALIBRATE);
    setOverlayMessages();
    settingsDiv.classList.add("show-calibration");
    setTitle(message || "Calibrate");
  }

  function startScan() {
    DeviceApi.saveCalibration({
      GCalibrate_snapshot_time,
      GCalibrate_temperature_celsius,
      GCalibrate_snapshot_value,
      GCalibrate_snapshot_uncertainty,
      GCalibrate_body_location,
      fovTop: fovBox.top,
      fovLeft: fovBox.left,
      fovRight: fovBox.right,
      fovBottom: fovBox.bottom,
      appVersion
    }).then(() => {
      setOverlayMessages("Calibration saved");
      setTimeout(setOverlayMessages, 500);
      setMode(Modes.SCAN);
      settingsDiv.classList.remove("show-calibration");
      setTitle("Scanning...");
    });
  }

  // Every ten seconds, we'll check to see if the server has updated our
  // calibration settings, if we're in scan mode.
  setInterval(async () => {
    if (Mode === Modes.SCAN) {
      await loadExistingCalibrationSettings();
    }
  }, 10000);

  const success = await fetchFrameDataAndTelemetry();
  if (success) {
    startCalibration();
  }
};
