export enum TemperatureSource {
  FOREHEAD = "forehead",
  EAR = "ear",
  ARMPIT = "armpit",
  ORAL = "oral",
}

export enum Modes {
  CALIBRATE = "calibrate",
  SCAN = "scan",
}

export interface CalibrationInfo {
  SnapshotTime: number;
  TemperatureCelsius: number;
  SnapshotValue: number;
  SnapshotUncertainty: number;
  BodyLocation: TemperatureSource;
  ThresholdMinNormal: number;
  ThresholdMinFever: number;
  Top: number;
  Left: number;
  Right: number;
  Bottom: number;
  CalibrationBinaryVersion: string;
  UuidOfUpdater: number;
}

export interface NetworkInterface {
  Name: string;
  IPAddresses: string[];
}

export interface CameraInfo {
  Brand: string;
  Model: string;
  FPS: number;
  ResX: number;
  ResY: number;
}

export interface Telemetry {
  TimeOn: number;
  FFCState: string;
  FrameCount: number;
  FrameMean: number;
  TempC: number;
  LastFFCTempC: number;
  LastFFCTime: number;
}

export interface FrameInfo {
  Calibration: CalibrationInfo;
  Telemetry: Telemetry;
  AppVersion: string;
  BinaryVersion: string;
  Camera: CameraInfo;
}

export interface SensorConstant {
  sensorResponse: number;
  sensorTemperatureResponse: number;
  frameWidth: number;
  frameHeight: number;
  edgeDetectThreshold: number;
  haarMin: number;
  haarScale: number;
}

export interface FrameBuffer {
  data: Float32Array;
  width: number;
  height: number;
}

export interface FrameStat {
  constant: SensorConstant;

  //dynamic values
  timeSinceFFC: number;
  duringFFC: boolean;
  sensorCorrection: number;
  deviceTemp: number;

  //FrameBuffers
  rawSensorFB: Float32Array | FrameBuffer | undefined;
  saltPepperFB: Float32Array | FrameBuffer | undefined;
  smoothedFB: Float32Array | FrameBuffer | undefined;
  edgeDetectFB: Float32Array | FrameBuffer | undefined;
}
