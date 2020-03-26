// Top of JS
window.onload = async function() {
  console.log("LOAD");
  let GThreshold_fever = 40.0;
  let GThreshold_check = 38.0;

  let GCalibrate_temperature_celsius = 35.5;
  let GCalibrate_snapshot_value = 10;
  let GCurrent_hot_value = 10;

  const Modes = {
    INIT: 0,
    CALIBRATE: 1,
    SCAN: 2
  };
  let Mode = Modes.INIT;
  /*
  const fahrenheitToCelsius = f => ((f - 32.0) * 5) / 9;
  const celsiusToFahrenheit = c => (c * 9.0) / 5 + 32;
   */

  const temperatureInputCelsius = document.getElementById(
    "temperature_input_a"
  );
  const calibrationOverlay = document.getElementById("myNav");
  const main_canvas = document.getElementById("main_canvas");
  const calibrationButton = document.getElementById("calibration_button");
  const scanButton = document.getElementById("scan_button");
  const temperatureDiv = document.getElementById("temperature_div");
  const calibrationDiv = document.getElementById("calibration_div");
  const tempInput = document.getElementById("temperature_input_a");
  const thumbHot = document.getElementById("thumb_hot");
  const thumbQuestion = document.getElementById("thumb_question");
  const thumbNormal = document.getElementById("thumb_normal");
  const titleDiv = document.getElementById("title_div");
  const settingsDiv = document.getElementById("settings");
  const temperatureDisplay = document.getElementById("temperature_display");
  const ctx = main_canvas.getContext("2d");

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
    .getElementById("scan_button")
    .addEventListener("click", () => startScan());

  temperatureInputCelsius.addEventListener("input", event => {
    setCalibrateTemperature(
      parseFloat(event.target.value),
      temperatureInputCelsius
    );
  });

  function isUnreasonableCalibrateTemperature(temperatureCelsius) {
    if (temperatureCelsius < 10 || temperatureCelsius > 90) {
      return true;
    }
    return isNaN(temperatureCelsius);
  }

  function setCalibrateTemperature(temperatureCelsius) {
    if (isUnreasonableCalibrateTemperature(temperatureCelsius)) {
      return;
    }
    tempInput.value = temperatureCelsius.toFixed(1);
    GCalibrate_temperature_celsius = temperatureCelsius;
  }

  function setCalibrateTemperatureSafe(temperature_celsius) {
    if (isUnreasonableCalibrateTemperature(temperature_celsius)) {
      temperature_celsius = 35.6;
    }
    setCalibrateTemperature(temperature_celsius);
  }

  function showTemperature(temp_celsius) {
    const icons = [thumbHot, thumbQuestion, thumbNormal];
    let selectedIcon;
    let state = "normal";
    if (temp_celsius > 45) {
      // ERROR
      state = "error";
      selectedIcon = thumbHot;
    } else if (temp_celsius > GThreshold_fever) {
      // FEVER
      state = "fever";
      selectedIcon = thumbHot;
    } else if (temp_celsius > GThreshold_check) {
      // CHECK
      state = "check";
      selectedIcon = thumbQuestion;
    } else if (temp_celsius > 35.5) {
      // NORMAL
      state = "normal";
      selectedIcon = thumbNormal;
    }
    temperatureDisplay.innerHTML = `${temp_celsius.toFixed(1)}&deg;&nbsp;C`;
    temperatureDiv.classList.remove([
      "state-normal",
      "state-check",
      "state-error",
      "state-fever"
    ]);
    temperatureDiv.classList.add(`${state}-state`);
    for (const icon of icons) {
      if (icon === selectedIcon) {
        icon.classList.add("selected");
      } else {
        icon.classList.remove("selected");
      }
    }
  }

  function processSnapshotRaw(rawData) {
    const imgData = ctx.getImageData(0, 0, 160, 120);
    const darkValue = Math.min(...rawData);
    const hotValue = Math.max(...rawData);
    GCurrent_hot_value = hotValue;
    const slope = 0.01;
    let feverThreshold = 65535;
    let checkThreshold = 65534;

    if (Mode === Modes.CALIBRATE) {
      GCalibrate_snapshot_value = GCurrent_hot_value;
    }
    if (Mode === Modes.SCAN) {
      const temperature =
        GCalibrate_temperature_celsius +
        (hotValue - GCalibrate_snapshot_value) * slope;

      feverThreshold =
        (GThreshold_fever - GCalibrate_temperature_celsius) / slope +
        GCalibrate_snapshot_value;
      checkThreshold =
        (GThreshold_check - GCalibrate_temperature_celsius) / slope +
        GCalibrate_snapshot_value;
      showTemperature(temperature);
    }

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
  }

  async function fetchFrameDataAndTelemetry() {
    setTimeout(fetchFrameDataAndTelemetry, Math.floor(1000 / 9));
    try {
      const response = await fetch(`${CAMERA_RAW}?${new Date().getTime()}`, {
        method: "GET",
        headers: {
          Authorization: `Basic ${btoa("admin:feathers")}`
        }
      });
      const metadata = JSON.parse(response.headers.get("Telemetry"));
      const data = new Uint16Array(await response.arrayBuffer());
      if (
        metadata.FFCState !== "complete" ||
        metadata.TimeOn - metadata.LastFFCTime < 60 * 1000 * 1000 * 1000
      ) {
        console.log("Recent FFC. please wait");
        openNav();
      } else {
        closeNav();
      }
      if (data.length === 160*120) {
        processSnapshotRaw(data);
      }
    } catch (err) {
      console.log("error:", err);
    }
  }

  function openNav() {
    calibrationOverlay.classList.add("show");
  }

  function closeNav() {
    calibrationOverlay.classList.remove("show");
  }

  function hasBeenCalibratedRecently() {
    return true;
  }

  function nosleep_enable() {
    new NoSleep().enable();
  }

  function startCalibration(initial = false) {
    // Start calibration
    Mode = Modes.CALIBRATE;
    calibrationButton.setAttribute("disabled", "disabled");
    scanButton.removeAttribute("disabled");
    settingsDiv.classList.remove("show-scan");
    titleDiv.innerText = "Calibrate";
    if (!initial) {
      nosleep_enable();
    }
  }

  function startScan(initial = false) {
    // Go into scanning mode
    Mode = Modes.SCAN;
    calibrationButton.removeAttribute("disabled");
    scanButton.setAttribute("disabled", "disabled");
    settingsDiv.classList.add("show-scan");
    titleDiv.innerText = "Scanning...";
    if (!initial) {
      nosleep_enable();
    }
  }

  if (Mode === Modes.INIT || !hasBeenCalibratedRecently()) {
    startCalibration(true);
  } else {
    startScan(true);
  }
  await fetchFrameDataAndTelemetry();
};
