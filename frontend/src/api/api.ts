import { NetworkInterface } from "./types";
import {CalibrationConfig, CalibrationInfo, ScreeningEvent} from "@/types";
import { Frame } from "@/camera";
const API_BASE =
  "https://ixg63w0770.execute-api.ap-southeast-2.amazonaws.com/event";
export const ScreeningApi = {
  async recordScreeningEvent(
    deviceId: string,
    deviceSerial: string,
    data: ScreeningEvent,
    feverMinThresholdAtRecordingTime: number,
  ) {
    if (deviceId !== "") {
      const appVersion = data.frame.frameInfo.AppVersion;
      const request = fetch(API_BASE, {
        method: "POST",
        body: JSON.stringify({
          Channel: "beta",
          CameraID: `${deviceId}`,
          Type: "Screen",
          Timestamp: data.timestamp
              .toISOString()
              .replace(/:/g, "_")
              .replace(/\./g, "_"),
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
            Sample: {x: data.sampleX, y: data.sampleY},
            SampleRaw: Math.round(data.rawTemperatureValue),
            RefTemp: data.thermalReference.temp,
            RefRaw: data.thermalReference.val,
            Telemetry: data.frame.frameInfo.Telemetry
          }
        })
      });
      const response = await request;
      const presignedUrl = await response.text();
      // Based on the user, we find out whether or not to upload a reference image.
      if (presignedUrl) {
        // Upload to s3
        fetch(presignedUrl, {
          method: "PUT",
          body: data.frame.frame,
          headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Encoding': 'utf8'
          }
        });
      }
    } else {
      console.error("Can't send telemetry, missing deviceId");
    }
  },
  async recordCalibrationEvent(
    deviceId: string,
    deviceSerial: string,
    calibrationChanged: boolean,
    thresholdChanged: boolean,
    calibration: CalibrationConfig,
    frame: Frame,
    x: number,
    y: number
  ) {
    if (deviceId !== "") {
      const appVersion = frame.frameInfo.AppVersion;
      const calibrationPayload = {
        Channel: "beta",
        CameraID: `${deviceId}`,
        Type: "Calibrate",
        Timestamp: calibration.timestamp
            .toISOString()
            .replace(/:/g, "_")
            .replace(/\./g, "_"),
        CalibratedTemp: parseFloat(calibration.calibrationTemperature.val.toFixed(2)),
        MinFeverThreshold: calibration.thresholdMinFever,
        ThermalRefTemp: parseFloat(calibration.thermalRefTemperature.val.toFixed(2)),
        AppVersion: appVersion,
        Meta: {
          Face: calibration.head,
          Sample: {x, y},
          SampleRaw: Math.round(calibration.hotspotRawTemperatureValue),
          RefRaw: Math.round(calibration.thermalReferenceRawValue),
          Telemetry: frame.frameInfo.Telemetry
        }
      };
      const request = fetch(API_BASE, {
        method: "POST",
        body: JSON.stringify(calibrationPayload)
      });
      const response = await request;
      // Only upload an image if calibration changed, not threshold.
      if (response.status === 200 && calibrationChanged) {
        const presignedUrl = await response.text();
        // Based on the user, we find out whether or not to upload a reference image.
        if (presignedUrl) {
          // Upload to s3
          fetch(presignedUrl, {
            method: "PUT",
            body: frame.frame,
            headers: {
              'Content-Type': 'application/octet-stream',
              'Content-Encoding': 'utf8'
            }
          });
        }
      }
    } else {
      console.error("Can't sent calibration event, missing deviceId");
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
      //return "http://192.168.0.181";
      return "http://192.168.0.82";
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
    devicename: string;
    deviceID: string;
    serial: string;
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
  async getCalibration(): Promise<CalibrationInfo | null> {
    return this.getJSON(this.LOAD_CALIBRATION);
  }
};
