// Top of JS
window.onload = async function() {
  console.log("LOAD");

  //these are the *lowest* temperature in celsius for each category
  let GThreshold_error = 42.5;
  let GThreshold_fever = 37.8;
  let GThreshold_check = 37.4;
  let GThreshold_normal = 35.7;
  let GThreshold_cold = 32.5;

  let fetch_frame_delay = 100;

  let GCalibrate_temperature_celsius = 37;
  let GCalibrate_snapshot_value = 10;
  let GCurrent_hot_value = 10;
  let GDevice_temperature = 10;
  let debugMode = false;
  const slope = 0.01;
  const frameWidth = 160;
  const frameHeight = 120;
  const Modes = {
    INIT: 0,
    CALIBRATE: 1,
    SCAN: 2,
    WAITING: 3,
  };
  let Mode = Modes.INIT;

  const fahrenheitToCelsius = f => (f - 32.0) * (5.0 / 9);
  const celsiusToFahrenheit = c => c * (9.0 / 5) + 32;

  const temperatureInputCelsius = document.getElementById(
    "temperature_input_a"
  );
  const temperatureInputLabel = document.getElementById(
    "temperature_label"
  );

  const calibrationOverlay = document.getElementById("myNav");
  const mainCanvas = document.getElementById("main_canvas");
  let canvasWidth = mainCanvas.width;
  let canvasHeight = mainCanvas.height;
  const debugCanvas = document.getElementById("debug-canvas");
  const calibrationDiv = document.getElementById("calibration_div");
  const calibrationButton = document.getElementById("calibration_button");
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
  const ctx = mainCanvas.getContext("2d");
  const debugCtx = debugCanvas.getContext('2d');

  let prefix = "";
  if (window.location.hostname === "localhost") {
//    prefix = "http://192.168.178.37";
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
    .getElementById("scan_button")
    .addEventListener("click", () => startScan());

  temperatureInputCelsius.addEventListener("input", event => {
    entry_value = parseFloat(event.target.value);
    if (entry_value < 75) {
      temperatureInputLabel.innerHTML="&deg;C";
    }else{
      temperatureInputLabel.innerHTML="&deg;F";
      entry_value = fahrenheitToCelsius(entry_value);
    }

    setCalibrateTemperature(
      entry_value,
      temperatureInputCelsius
    );
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
      localStorage.setItem('CalibrateTemperature001', s);
    } catch (err) {
    }
  }

  function initCalibrateTemperatureLocalStorage() {
    try {
      let localStorage = window.localStorage;
      s = localStorage.getItem('CalibrateTemperature001');
      temperatureCelsius = parseFloat(s);
      setCalibrateTemperature(temperatureCelsius);

    } catch (err) {
    }
  }

  function setCalibrateTemperature(temperatureCelsius, excludeElement = null) {
    if (isUnreasonableCalibrateTemperature(temperatureCelsius)) {
      return;
    }
    GCalibrate_temperature_celsius = temperatureCelsius;
    setCalibrateTemperatureLocalStorage( GCalibrate_temperature_celsius );
    if (excludeElement !== temperatureInput) {
      temperatureInput.value = temperatureCelsius.toFixed(1);
      temperatureInputLabel.innerHTML="&deg;C";
    }
  }

  function setCalibrateTemperatureSafe(temperature_celsius) {
    if (isUnreasonableCalibrateTemperature(temperature_celsius)) {
      temperature_celsius = 35.6;
    }
    setCalibrateTemperature(temperature_celsius);
  }

  function showTemperature(temperature_celsius) {
    const icons = [thumbCold, thumbHot, thumbQuestion, thumbNormal];
    let selectedIcon;
    let state = "null";
    let descriptor = "Empty";
    if (temperature_celsius > GThreshold_error) {
      descriptor = "Error";
      state = "error";
      selectedIcon = thumbHot;
    } else if (temperature_celsius > GThreshold_fever) {
      descriptor = "High Fever";
      state = "fever";
      selectedIcon = thumbHot;
    } else if (temperature_celsius > GThreshold_check) {
      descriptor = "Fever";
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
    temperature_fahrenheit = celsiusToFahrenheit(temperature_celsius);
    const strC = `${temperature_celsius.toFixed(1)}&deg;C`;
    const strF = `${temperature_fahrenheit.toFixed(1)}&deg;F`;
    const spacer = ' &nbsp;&nbsp; '
    let strDisplay = strC + spacer + descriptor +spacer + strF;
    if(false) {
        strDisplay = ''+GCurrent_hot_value.toFixed(1)+' /  '+GDevice_temperature+'&deg;C'
    }
    temperatureDisplay.innerHTML = strDisplay
    temperatureDiv.classList.remove(
      "check-state",
      "cold-state",
      "error-state",
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


  function sampleBackgroundAt(rawData, xPos, yPos) {
    const sampleSide = 10;
    let accum = [];
    for (let y = yPos - (sampleSide * 0.5); y < yPos + (sampleSide * 0.5); y++) {
      for (let x = xPos - (sampleSide * 0.5); x < xPos + (sampleSide * 0.5); x++) {
        accum.push(rawData[(y * frameWidth) + x]);
      }
    }
    accum.sort();
    return estimatedTemperatureForValue(accum[Math.floor(accum.length / 2)]);
  }

  function estimatedTemperatureForValue(value) {
    return GCalibrate_temperature_celsius +
    (value - GCalibrate_snapshot_value) * slope;
  }

  function showLoadingSnow() {
    let imgData = ctx.createImageData(canvasWidth, canvasHeight);
    for (let i = 0; i < imgData.data.length; i+=4) {
      const v = Math.random() * 128;
      imgData.data[i + 0] = v;
      imgData.data[i + 1] = v;
      imgData.data[i + 2] = v;
      imgData.data[i + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);

    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "#A0A0A0";
    ctx.fillText("Loading", canvasWidth/2, canvasHeight/2);
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
    if(swizzle & 1) {
        [x0, x1] = [x1, x0];
        dx = -dx;
    }
    if(swizzle & 2) {
        [y0, y1] = [y1, y0];
        dy = -dy;
    }
    for(let y=y0; y!=y1; y+=dy) {
        for(let x=x0; x!=x1; x+=dx) {
            let index = y * frameWidth + x;
            let current = source[index];
            value = median_three(source[index-delta], current, source[index+delta]);
            source[index] = (current * 3 + value)/4;
        }
    }
    return source
  }


  function median_smooth(source) {
    source = median_smooth_pass(source, 1, 0);
    source = median_smooth_pass(source, frameWidth, 0);
    source = median_smooth_pass(source, frameWidth, 3);
    source = median_smooth_pass(source, 1, 3);
    return source;
  }

  const averageTempTracking = [];
  let initialTemp = 0;
  function processSnapshotRaw(rawData, metaData) {

    saltPepperData = median_smooth(rawData);

    let source = saltPepperData;

    const imgData = ctx.getImageData(0, 0, 160, 120);

    const x0 = 10;
    const x1 = frameWidth - x0;
    const y0 = 10;
    const y1 = frameHeight - y0;

    let hotSpotX = 0;
    let hotSpotY = 0;

    let darkValue = 1<<30;
    let hotValue = 0;
    for(let y=y0; y!=y1; y++) {
        for(let x=x0; x!=x1; x++) {

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

    let alpha = 0.3;
    GCurrent_hot_value = GCurrent_hot_value * alpha + hotValue * (1-alpha);
    GDevice_temperature = metaData['TempC'];

    let feverThreshold = 1<<16;
    let checkThreshold = 1<<16;

    if (Mode === Modes.CALIBRATE) {
      GCalibrate_snapshot_value = GCurrent_hot_value;
      checkThreshold = hotValue - 20;
    }
    if (Mode === Modes.SCAN) {
      const temperature = estimatedTemperatureForValue(hotValue);
      feverThreshold =
        (GThreshold_fever - GCalibrate_temperature_celsius) / slope +
        GCalibrate_snapshot_value;
      checkThreshold =
        (GThreshold_check - GCalibrate_temperature_celsius) / slope +
        GCalibrate_snapshot_value;
      showTemperature(temperature);
    }

//    console.log("hotValue: "+hotValue+", deviceTemp"+metaData['TempC']);

    const dynamicRange = 255 / (hotValue - darkValue);
    let p = 0;
    for (const u16Val of rawData) {
      const v = (u16Val - darkValue) * dynamicRange;
      let r = v;
      let g = v;
      let b = v;
      if (feverThreshold < u16Val) {
        r = 255;
        g *= 0.5;
        b *= 0.5;
      } else if (checkThreshold < u16Val) {
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
    drawDebugInfo(rawData);
    ctx.beginPath();
    ctx.arc(hotSpotX, hotSpotY, 10, 0, 2*Math.PI,false);
    ctx.strokeStyle='#ff0000'
    ctx.stroke();
  }

  function drawDebugInfo(rawData) {
    let width = debugCanvas.offsetWidth;
    let height = debugCanvas.offsetHeight;
    debugCanvas.width = width;
    debugCanvas.height = height;
    if (debugMode) {
      const offsetX = frameWidth / 5;
      const offsetY = frameHeight / 5;
      const topLeft = sampleBackgroundAt(rawData, offsetX, offsetY);
      const topRight = sampleBackgroundAt(rawData, frameWidth - offsetX, offsetY);
      const bottomLeft = sampleBackgroundAt(rawData, offsetX, frameHeight - offsetY);
      const bottomRight = sampleBackgroundAt(rawData, frameWidth - offsetX, frameHeight - offsetY);
      const topMiddle = sampleBackgroundAt(rawData, frameWidth * 0.5, offsetY);
      const leftMiddle = sampleBackgroundAt(rawData, offsetX, frameHeight * 0.5);
      const rightMiddle = sampleBackgroundAt(rawData, frameWidth - offsetX, frameHeight * 0.5);
      const samples = [topLeft, topRight, bottomLeft, bottomRight, topMiddle, leftMiddle, rightMiddle];
      samples.sort();
      const medSampleIndex = Math.floor(samples.length / 2);
      const middleSample = (samples[medSampleIndex] + samples[medSampleIndex + 1] + samples[medSampleIndex + 2]) / 3;
      if (!initialTemp) {
        initialTemp = middleSample;
      }

      averageTempTracking.push(middleSample);
      if (averageTempTracking.length > width) {
        averageTempTracking.shift();
      }
      const halfDegree = height * 0.5 * 0.5;

      debugCtx.fillStyle = '#bb6922';
      // Draw the graph of the recent temp, with a midline for the start value.
      for (let x = 0; x < averageTempTracking.length; x++) {
        // One degree spans 50 pixels here
        debugCtx.fillRect(x, height / 2, 1, (initialTemp - averageTempTracking[x]) * halfDegree);
      }
      debugCtx.fillStyle = 'red';
      debugCtx.fillRect(0, (height / 2) - halfDegree, width, 1);
      debugCtx.fillStyle = 'blue';
      debugCtx.fillRect(0, (height / 2) + halfDegree, width, 1);
      debugCtx.fillStyle = 'white';
      debugCtx.fillRect(0, (height / 2), width, 1);
    } else {
      debugCtx.clearRect(0, 0, width, height);
    }
  }

  // TODO: Click on the canvas to center the region where you'd like to evaluate temperature.
  // TODO: Take an average of a square near the top right/left and use it to track drift, have a rolling
  //  average.

  let duringCalibration = false;
  async function fetchFrameDataAndTelemetry() {
    setTimeout(fetchFrameDataAndTelemetry, fetch_frame_delay);

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
        if (
          metaData.FFCState !== "complete" ||
          metaData.TimeOn - metaData.LastFFCTime < 60 * 1000 * 1000 * 1000
        ) {
          openNav("Automatic calibration in progress.<br>Please wait.");
          duringCalibration = true;
        } else {
          if (duringCalibration) {
            // We just exited calibration, so clear our debug info
            initialTemp = 0;
            averageTempTracking.length = 0;
            duringCalibration = false;
          }
          closeNav();
        }
        if (typedData.length === 160 * 120) {
          processSnapshotRaw(typedData, metaData);
          fetch_frame_delay = Math.floor(1000 / 9);
        }
      } else {
        Mode = Modes.WAITING;
        showLoadingSnow();

        // No frames yet
//        openNav("Waiting for camera response...");
      }
    } catch (err) {
      console.log("error:", err);
      showLoadingSnow();
    }
  }

  function openNav(text) {
    calibrationOverlay.classList.add("show");
    overlayMessage.innerHTML = text;
  }

  function closeNav() {
    calibrationOverlay.classList.remove("show");
  }

  function nosleep_enable() {
    new NoSleep().enable();
  }

  function setTitle(text) {
    titleDiv.innerText = text;
  }

  function startCalibration(initial = false) {
    Mode = Modes.CALIBRATE;
    calibrationDiv.classList.remove("show-scan");
    setTitle("Calibrate");
    if (!initial) {
      nosleep_enable();
    }
  }

  function startScan(initial = false) {
    Mode = Modes.SCAN;
    calibrationDiv.classList.add("show-scan");
    setTitle("Scanning...");
    if (!initial) {
      nosleep_enable();
    }
  }

  setTimeout(function(){startCalibration(true);},500);
  fetchFrameDataAndTelemetry();
};
