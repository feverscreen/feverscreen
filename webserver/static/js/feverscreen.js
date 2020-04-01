// Top of JS
window.onload = async function() {

  //these are the *lowest* temperature in celsius for each category
  let GThreshold_error = 42.5;
  let GThreshold_fever = 37.8;
  let GThreshold_check = 37.4;
  let GThreshold_normal = 35.7;
  let GThreshold_cold = 32.5;
  let GDisplay_precision = 1;

  let GThreshold_uncertainty = 0.5;

  let fetch_frame_delay = 100;
  let GTimeSinceFFC = 0;

  let GCalibrate_temperature_celsius = 37;
  let GCalibrate_snapshot_value = 0;
  let GCalibrate_snapshot_uncertainty = 100;
  let GCalibrate_snapshot_time = 0;

  let GCurrent_hot_value = 10;
  let GDevice_temperature = 10;
  const slope = 0.03136;
  const frameWidth = 160;
  const frameHeight = 120;
  const Modes = {
    INIT: 'init',
    CALIBRATE: 'calibrate',
    SCAN: 'scan'
  };
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
  const thumbCold = document.getElementById("thumb_cold");
  const thumbHot = document.getElementById("thumb_hot");
  const thumbQuestion = document.getElementById("thumb_question");
  const thumbNormal = document.getElementById("thumb_normal");
  const titleDiv = document.getElementById("title_div");
  const settingsDiv = document.getElementById("settings");
  const temperatureDisplay = document.getElementById("temperature_display");
  const overlayMessage = document.getElementById("overlay-message");
  const overlayCanvas = document.getElementById('overlay-canvas');
  const canvasContainer = document.getElementById('canvas-outer');
  const statusText = document.getElementById("status-text");
  const app = document.getElementById('app');
  const mainDiv = document.getElementById('main-inner');
  const ctx = mainCanvas.getContext("2d");

  const setMode = (mode) => {
    Mode = mode;
    app.classList.remove(...Object.values(Modes));
    app.classList.add(mode);
  };
  setMode(Modes.INIT);

  function onResizeViewport(e) {
    const height = mainDiv.offsetHeight - 50;
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
    if (e) {
      setTimeout(onResizeViewport, 300);
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
  let fovBox;
  {
    let currentTarget;
    // Handling FOV selection by user:
    const fovTopHandle = document.getElementById("top-handle");
    const fovRightHandle = document.getElementById("right-handle");
    const fovBottomHandle = document.getElementById("bottom-handle");
    const fovLeftHandle = document.getElementById("left-handle");

    fovBox = {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    };
    if (window.localStorage.getItem('fovBox') !== null) {
      try {
        fovBox = JSON.parse(window.localStorage.getItem('fovBox'));

      } catch (e) {
      }
    }
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
      window.localStorage.setItem('fovBox', JSON.stringify(fovBox));
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

  let prefix = "";
  if (window.location.hostname === "localhost") {
    prefix = "http://192.168.178.37";
  }

  const CAMERA_RAW = `${prefix}/camera/snapshot-raw`;

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
  initCalibrateTemperatureLocalStorage();

  function isUnreasonableCalibrateTemperature(temperatureCelsius) {
    if (temperatureCelsius < 10 || temperatureCelsius > 90) {
      return true;
    }
    return isNaN(temperatureCelsius);
  }

  function setCalibrateTemperatureLocalStorage(s) {
    try {
      let localStorage = window.localStorage;
      localStorage.setItem("CalibrateTemperature001", s);
    } catch (err) {}
  }

  function initCalibrateTemperatureLocalStorage() {
    try {
      let localStorage = window.localStorage;
      const s = localStorage.getItem("CalibrateTemperature001");
      const temperatureCelsius = parseFloat(s);
      setCalibrateTemperature(temperatureCelsius);
    } catch (err) {}
  }

  function setCalibrateTemperature(temperatureCelsius, excludeElement = null) {
    if (isUnreasonableCalibrateTemperature(temperatureCelsius)) {
      return;
    }
    GCalibrate_temperature_celsius = temperatureCelsius;
    setCalibrateTemperatureLocalStorage(GCalibrate_temperature_celsius);
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
    const icons = [thumbCold, thumbHot, thumbQuestion, thumbNormal];
    let selectedIcon;
    let state = "null";
    let descriptor = "Empty";

    if(uncertainty_celsius > GThreshold_uncertainty) {
      descriptor = "Uncalibrated";
      selectedIcon = thumbHot;
    } else if (temperature_celsius > GThreshold_error) {
      descriptor = "Error";
      state = "error";
      selectedIcon = thumbHot;
      if (((new Date().getTime() * 3) / 1000) & 1) {
        state = "error2";
      }
    } else if (temperature_celsius > GThreshold_fever) {
      descriptor = "Fever";
      state = "fever";
      selectedIcon = thumbHot;
    } else if (temperature_celsius > GThreshold_check) {
      descriptor = "Check";
      state = "check";
      selectedIcon = thumbQuestion;
    } else if (temperature_celsius > GThreshold_normal) {
      descriptor = "Normal";
      state = "normal";
      selectedIcon = thumbNormal;
    } else if (temperature_celsius > GThreshold_cold) {
      descriptor = "Cold";
      state = "cold";
      selectedIcon = thumbCold;
    }
    const strC = `${temperature_celsius.toFixed(GDisplay_precision)}&deg;C`;
    const strPM = `&plusmn;${uncertainty_celsius.toFixed(GDisplay_precision)}&deg;C`;
    let strDisplay = `<span class="msg-1">${strC}</span>`;
    strDisplay += `<span class="msg-1">${strPM}</span>`;
    strDisplay += `<span class="msg-2">${descriptor}</span>`;
    if (false) {
      strDisplay +=
        "<br> HV:" +
        (GCurrent_hot_value/100).toFixed(2) +
        "<br> Tdev:" +
        GDevice_temperature.toFixed(GDisplay_precision) +
        "&deg;C";
      strDisplay += '<br>TFC:' + GTimeSinceFFC.toFixed(1)+'s';
      selectedIcon = undefined;
    }
    if (duringFFC) {
      setTitle('Please wait')
      strDisplay = "<span class='msg-1'>Calibrating</span>";
    }
    if (GCalibrate_snapshot_value == 0) {
      strDisplay = "<span class='msg-1'>Calibration required</span>";
    }
    temperatureDisplay.innerHTML = strDisplay;
    temperatureDiv.classList.remove(
      "check-state",
      "cold-state",
      "error-state",
      "error2-state",
      "normal-state",
      "fever-state"
    );
    temperatureDiv.classList.add(`${state}-state`);
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
    startCalibration("Recalibrate");
    setOverlayMessages("Please recalibrate");
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
      let seconds_since_calibration = (new Date().getTime() - GCalibrate_snapshot_time) / (1000)
      result += GCalibrate_snapshot_uncertainty * Math.min(seconds_since_calibration / 60, 1);

      const worst_drift_in_10_minutes_celsius = 0.5;
      result += seconds_since_calibration * worst_drift_in_10_minutes_celsius / 600;
    }

    if (GTimeSinceFFC < 10) {
        result += 0.8;
    } else if (GTimeSinceFFC < 90) {
        result += 0.2 * (90 - GTimeSinceFFC) / 90;
    }

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

  function processSnapshotRaw(rawData, metaData) {
    let source = rawData;
    if (true) {
      const saltPepperData = median_smooth(rawData);
      const smoothedData = radial_smooth(saltPepperData);
      source = smoothedData;
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
    GDevice_temperature = metaData["TempC"];
    let device_adder = GDevice_temperature * device_sensitivity;
    hotValue -= device_adder;

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
      GCalibrate_snapshot_time = new Date().getTime()
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

    // TODO: Make the dynamic range between 18 and 42 degrees or so, so that we can
    //  reduce the flicker when we calculate the dynamic range per frame, and give
    //  the appearance of a more stable readout?
    const dynamicRange = (255 * 255) / (raw_hot_value - darkValue);
    const scaleData = source;
    let imgData = ctx.createImageData(frameWidth, frameHeight);

    let p = 0;
    for (const f32Val of scaleData) {
      let v = (f32Val - darkValue) * dynamicRange;
      v = Math.sqrt(Math.max(v, 0)) // gamma correct
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

    if (!duringFFC) {
      drawOverlay();
    } else {
      clearOverlay();
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

  // TODO: Click on the canvas to center the region where you'd like to evaluate temperature.
  // TODO: Take an average of a square near the top right/left and use it to track drift, have a rolling
  //  average.

  let animatedSnow;
  let duringFFC = false;
  async function fetchFrameDataAndTelemetry() {
    setTimeout(fetchFrameDataAndTelemetry, fetch_frame_delay);
    cancelAnimationFrame(animatedSnow);
    fetch_frame_delay = Math.min(5000, fetch_frame_delay * 1.3 + 100);

    try {
      const response = await fetch(`${CAMERA_RAW}?${new Date().getTime()}`, {
        method: "GET",
        headers: {
          Authorization: `Basic ${btoa("admin:feathers")}`
        }
      });
      const metaData = JSON.parse(response.headers.get("Telemetry"));
      const data = await response.arrayBuffer();
      if (data.byteLength > 13) {
        const typedData = new Uint16Array(data);
        if (typedData.length === frameWidth * frameHeight) {
          processSnapshotRaw(typedData, metaData);
          scanButton.removeAttribute("disabled");
          fetch_frame_delay = 1000 / 8.7;
        }

        GTimeSinceFFC = (metaData.TimeOn - metaData.LastFFCTime) / (1000 * 1000 * 1000)
        const ffcDelay = 60 - GTimeSinceFFC;
        if (metaData.FFCState !== "complete" || ffcDelay > 0) {
          scanButton.setAttribute("disabled", "disabled");
          duringFFC = true;
          app.classList.add('ffc');
          const alpha = Math.min(ffcDelay * 0.1, 0.75);
          let delayS = ''
          if (ffcDelay >= 0) {
            delayS = ffcDelay.toFixed(0).toString();
          }
          setOverlayMessages("FFC in progress", delayS);
          animatedSnow = requestAnimationFrame(() => showAnimatedSnow(alpha));
          showTemperature(20, 100); // empty
        } else {
          if (duringFFC) {
            // FFC ended
            setOverlayMessages();
            duringFFC = false;
            app.classList.remove('ffc');
          }
        }
      } else {
        setOverlayMessages("Loading");
        animatedSnow = requestAnimationFrame(showAnimatedSnow);
        return false;
      }
    } catch (err) {
      console.log(err)
      setOverlayMessages("Error");
      animatedSnow = requestAnimationFrame(showAnimatedSnow);
      return false;
    }
    return true;
  }

  function showAnimatedSnow(alpha = 0.5) {
    showLoadingSnow();
    animatedSnow = requestAnimationFrame(showAnimatedSnow);
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
    setOverlayMessages("Calibration saved");
    setTimeout(setOverlayMessages, 500);
    setMode(Modes.SCAN);
    settingsDiv.classList.remove("show-calibration");
    setTitle("Scanning...");
  }

  const success = await fetchFrameDataAndTelemetry();
  if (success) {
    startCalibration();
  }
};
