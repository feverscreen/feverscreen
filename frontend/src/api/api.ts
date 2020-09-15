import { CalibrationInfo, NetworkInterface } from "./types";
import { CalibrationConfig, ScreeningEvent } from "@/types";
import { Frame } from "@/camera";
const FAKE_THERMAL_CAMERA_SERVER = "http://localhost:2040";

const API_BASE =
  "https://ixg63w0770.execute-api.ap-southeast-2.amazonaws.com/event";
export const ScreeningApi = {
  async recordScreeningEvent(
    deviceName: string,
    deviceId: number,
    data: ScreeningEvent
  ) {
    const request = fetch(API_BASE, {
      method: "POST",
      body: JSON.stringify({
        CameraID: `${deviceName}|${deviceId}|${data.frame.frameInfo.Camera.CameraSerial}`,
        Type: "Screen",
        Timestamp: data.timestamp
          .toISOString()
          .replace(/:/g, "_")
          .replace(/\./g, "_"),
        TemperatureRawValue: Math.round(data.rawTemperatureValue),
        RefTemperatureValue: data.thermalReference.val,
        AppVersion: data.frame.frameInfo.AppVersion,
        Meta: {
          Sample: { x: data.sampleX, y: data.sampleY },
          Telemetry: data.frame.frameInfo.Telemetry
        }
      })
    });
    const response = await request;
    try {
      const presignedUrl = await response.text();
      // Based on the user, we find out whether or not to upload a reference image.
      if (presignedUrl) {
        // Upload to s3
        const response = await fetch(presignedUrl, {
          method: "POST",
          body: data.frame.frame,
          mode: "no-cors"
        });
        console.log(await response.text());
      } else {
        // Error?
      }
    } catch (e) {
      console.log(response.status);
    }
  },
  async recordCalibrationEvent(
    deviceName: string,
    deviceId: number,
    calibration: CalibrationConfig,
    frame: Frame,
    x: number,
    y: number
  ) {
    const cameraSerial = frame.frameInfo.Camera.CameraSerial;
    const appVersion = frame.frameInfo.AppVersion;
    const request = fetch(API_BASE, {
      method: "POST",
      body: JSON.stringify({
        CameraID: `${deviceName}|${deviceId}|${cameraSerial}`,
        Type: "Calibrate",
        Timestamp: calibration.timestamp
          .toISOString()
          .replace(/:/g, "_")
          .replace(/\./g, "_"),
        CalibratedTemp: calibration.calibrationTemperature.val.toFixed(2),
        MinFeverThreshold: calibration.thresholdMinFever,
        ThermalRefTemp: calibration.thermalRefTemperature.val.toFixed(2),
        RefTemperatureValue: Math.round(calibration.thermalReferenceRawValue),
        TemperatureRawValue: Math.round(calibration.hotspotRawTemperatureValue),
        AppVersion: appVersion,
        Meta: {
          Sample: { x, y },
          Telemetry: frame.frameInfo.Telemetry,
          Crop: calibration.cropBox
        }
      })
    });
    const response = await request;
    try {
      const presignedUrl = await response.text();
      // Based on the user, we find out whether or not to upload a reference image.
      if (presignedUrl) {
        // Upload to s3
        const response = await fetch(presignedUrl, {
          method: "POST",
          body: frame.frame,
          mode: "no-cors"
        });
        console.log(await response.text());
      } else {
        // Error?
      }
    } catch (e) {
      console.log(response.status);
    }
  }
};

export const DeviceApi = {
  get debugPrefix() {
    if (window.location.port === "8080" || window.location.port === "5000") {
      // Used for developing the front-end against an externally running version of the
      // backend, so it's not necessary to package up the build to do front-end testing.
      //return "http://localhost:2041";
      //return "http://192.168.178.37";
      //return "http://192.168.178.21";
      return "http://192.168.0.40";
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
  async get(url: string) {
    return fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Basic ${btoa("admin:feathers")}`
      }
    });
  },
  async post(
    url: string,
    data:
      | Blob
      | BufferSource
      | FormData
      | URLSearchParams
      | ReadableStream<Uint8Array>
      | string
      | null
  ) {
    return fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa("admin:feathers")}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: data
    });
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
    apiVersion: number;
    appVersion: string;
    binaryVersion: string;
  }> {
    return this.getJSON(this.SOFTWARE_VERSION);
  },
  async startRecording(): Promise<boolean> {
    const result = await this.getText(this.START_RECORDING);
    return result === "<nil>";
  },
  async deviceInfo(): Promise<{
    serverURL: string;
    groupname: string;
    devicename: string;
    deviceID: number;
  }> {
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
  async networkInfo(): Promise<{
    Interfaces: NetworkInterface[];
    Config: { Online: boolean };
  }> {
    return this.getJSON(this.NETWORK_INFO);
  },
  async saveCalibration(data: CalibrationInfo) {
    // NOTE: This API only supports a json payload one level deep.  No nested structures.
    const formData = new URLSearchParams();
    formData.append("calibration", JSON.stringify(data));
    return this.post(this.SAVE_CALIBRATION, formData);
  },
  async getCalibration(): Promise<CalibrationInfo> {
    return this.getJSON(this.LOAD_CALIBRATION);
  }
};

export const FakeThermalCameraApi = {
  async isFakeThermalCamera(): Promise<boolean> {
    // Try fetching on localhost:2040,
    const response = await fetch(FAKE_THERMAL_CAMERA_SERVER);
    if (response.status !== 200) {
      return false;
    }
    const message = await response.text();
    return message === "This is a Fake thermal camera test server.";
  },
  async listFakeThermalCameraFiles(): Promise<string[]> {
    const response = await fetch(`${FAKE_THERMAL_CAMERA_SERVER}/list`);
    try {
      return response.json();
    } catch (e) {
      return [];
    }
  },
  async playbackCptvFile(file: string, repeatCount: number): Promise<boolean> {
    const response = await this.getText(
      `${FAKE_THERMAL_CAMERA_SERVER}/sendCPTVFrames?${new URLSearchParams(
        Object.entries({
          "cptv-file": file,
          repeat: repeatCount.toString()
        })
      )}`
    );
    return response === "Success";
  },
  async stopPlayback(): Promise<boolean> {
    const response = await this.getText(
      `${FAKE_THERMAL_CAMERA_SERVER}/playback?stop=true`
    );
    return response === "Success";
  },
  async pausePlayback(): Promise<boolean> {
    const response = await this.getText(
      `${FAKE_THERMAL_CAMERA_SERVER}/playback?pause=true`
    );
    return response === "Success";
  },
  async resumePlayback(): Promise<boolean> {
    const response = await this.getText(
      `${FAKE_THERMAL_CAMERA_SERVER}/playback?play=true`
    );
    return response === "Success";
  },
  async get(url: string) {
    return fetch(url, {
      method: "GET"
    });
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
  }
};
