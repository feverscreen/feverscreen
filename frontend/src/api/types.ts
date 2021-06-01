import { CalibrationInfo } from "@/types";

export interface NetworkInterface {
  Name: string;
  IPAddresses: string[] | null;
}

export interface CameraInfo {
  Brand: string;
  Model: string;
  FPS: number;
  ResX: number;
  ResY: number;
  Firmware: string;
  CameraSerial: number;
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

export interface PartialFrameInfo {
  Calibration: CalibrationInfo | null;
  Telemetry: Telemetry;
  AppVersion: string;
  BinaryVersion: string;
  Camera: CameraInfo;
}

export const Dummy = 1;
