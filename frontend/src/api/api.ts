import { CalibrationInfo, NetworkInterface } from "./types";
const FAKE_THERMAL_CAMERA_SERVER = "http://localhost:2040";

export const DeviceApi = {
  get debugPrefix() {
    if (
      window.location.host === "localhost:8080" ||
      window.location.host === "localhost:5000"
    ) {
      // Used for developing the front-end against an externally running version of the
      // backend, so it's not necessary to package up the build to do front-end testing.
      return "http://localhost:2041";
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