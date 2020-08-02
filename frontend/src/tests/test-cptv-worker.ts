import { processSensorData } from "../processing";
import { extractSensorValueForCircle } from "../circle-detection";
import { FaceRecognitionModel } from "../haar-converted";
import { CameraConnectionState, Frame } from "../camera";
import { AppState, ScreeningState, TestAppState } from "../types";
import { TemperatureSource } from "../api/types";
import * as cptvPlayer from "./cptv_player/cptv_player";
import {
  detectThermalReference,
  findFacesInFrameSync
} from "../feature-detection";
import { promisify } from "util";
import { readFile as readFileAsync } from "fs";
import testCases, { FrameTests, TestCase, TestResult } from "./test-cases";
import { DegreesCelsius } from "../utils";

const readFile = promisify(readFileAsync);

const InitialFrameInfo = {
  Camera: {
    ResX: 160,
    ResY: 120,
    FPS: 9,
    Brand: "flir",
    Model: "lepton3.5"
  },
  Telemetry: {
    FrameCount: 1,
    TimeOn: 1,
    FFCState: "On",
    FrameMean: 0,
    TempC: 0,
    LastFFCTempC: 0,
    LastFFCTime: 0
  },
  AppVersion: "1.2.3",
  BinaryVersion: "abcde",
  Calibration: {
    ThermalRefTemp: 38,
    SnapshotTime: 0,
    TemperatureCelsius: 34,
    SnapshotValue: 0,
    SnapshotUncertainty: 0,
    BodyLocation: TemperatureSource.FOREHEAD,
    ThresholdMinNormal: 0,
    ThresholdMinFever: 0,
    Bottom: 0,
    Top: 0,
    Left: 0,
    Right: 0,
    CalibrationBinaryVersion: "abcde",
    UuidOfUpdater: 432423432432
  }
};

function processAndTestFrame(
  appState: AppState,
  file: string,
  frame: Frame,
  testCase: FrameTests | undefined
): TestResult {
  appState.currentFrame = frame;
  appState.lastFrameTime = new Date().getTime();
  const frameNumber = frame.frameInfo.Telemetry.FrameCount;
  const { ResX: width, ResY: height } = frame.frameInfo.Camera;
  /* --- Process frame and extract features: --- */
  const { smoothedData, saltPepperData } = processSensorData(frame);

  // TODO(jon): Sanity check - if the thermal reference is moving from frame to frame,
  //  it's probably someones head...
  const thermalReference = detectThermalReference(
    saltPepperData,
    smoothedData,
    appState.thermalReference,
    width,
    height
  );
  if (!thermalReference) {
    return {
      success: false,
      err: `Failed to get thermal reference for "${file}"::(${frameNumber})`
    };
  }
  thermalReference.sensorValue = extractSensorValueForCircle(
    thermalReference,
    saltPepperData,
    width
  );
  let faces = findFacesInFrameSync(
    smoothedData,
    saltPepperData,
    width,
    height,
    FaceRecognitionModel(),
    appState.faces,
    thermalReference,
    frame.frameInfo
  ).filter(face => face.width() <= face.height());
  // TODO(jon): Use face.tracked() to get faces that have forehead tracking.
  // TODO(jon): Filter out any that aren't inside the cropbox
  const result = testFrame(
    file,
    frameNumber,
    {
      thermalReference: appState.thermalReference,
      faces: appState.faces,
      cropBox: { ...appState.currentCalibration.cropBox }
    },
    {
      thermalReference,
      faces,
      cropBox: { ...appState.currentCalibration.cropBox }
    },
    testCase
  );
  appState.faces = faces;
  appState.thermalReference = thermalReference;
  // NOTE(jon): Assume for now that cropBox is constant between frames.
  return result;
}
const getNextFrame = (frameBuffer: ArrayBuffer): Frame => {
  const frameInfo = cptvPlayer.getRawFrame(new Uint8Array(frameBuffer));
  return {
    frame: new Float32Array(new Uint16Array(frameBuffer)),
    frameInfo: {
      ...InitialFrameInfo,
      Telemetry: {
        ...InitialFrameInfo.Telemetry,
        LastFFCTime: frameInfo.last_ffc_time,
        FrameCount: frameInfo.frame_number,
        TimeOn: frameInfo.time_on
      }
    }
  };
};

function testFrame(
  file: string,
  frameNumber: number,
  state: TestAppState,
  nextState: TestAppState,
  testCase: FrameTests
): TestResult {
  // Match the assertions for the current frame:
  const frameAssertions:
    | { range: [number, number]; assertions: TestCase[] }
    | undefined = Object.entries(testCase.frames)
    .map(([key, val]) => ({
      range: key.split("-").map(Number) as [number, number],
      assertions: val
    }))
    .find(
      ({ range, assertions }) =>
        frameNumber >= range[0] && frameNumber <= range[1]
    );
  if (frameAssertions !== undefined) {
    for (const assertion of frameAssertions.assertions) {
      const result = assertion(nextState, state);
      if (!result.success) {
        return {
          ...result,
          err: `${result.err} for "${file}"::(${frameNumber} in ${frameAssertions.range[0]}..${frameAssertions.range[1]})`
        };
      }
    }
    return { success: true, err: null };
  }
  return {
    success: true,
    err: `Warning: Missing assertions for "${file}"::(${frameNumber})`
  };
}

export default async function(data: { file: string }): Promise<TestResult> {
  const { file } = data;
  const testCase = testCases[file];
  if (testCase !== undefined) {
    const appState: AppState = {
      currentFrame: null,
      cameraConnectionState: CameraConnectionState.Disconnected,
      thermalReference: null,
      faces: [],
      paused: false,
      currentCalibration: {
        cropBox: {
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        },
        calibrationTemperature: new DegreesCelsius(36),
        hotspotRawTemperatureValue: 31000,
        timestamp: new Date().getTime(),
        thermalReferenceRawValue: 32000
      },
      currentScreeningEvent: null,
      currentScreeningState: ScreeningState.READY,
      faceModel: null,
      lastFrameTime: 0
    };

    // TODO(jon): Can probably run all these files in parallel on different threads.
    //  but we will need to modify cptvPlayer to keep data thread local properly.
    const fileBytes = await readFile(file);
    cptvPlayer.initWithCptvData(new Uint8Array(fileBytes));
    const frameBuffer = new ArrayBuffer(160 * 120 * 2);
    let frame = getNextFrame(frameBuffer);
    let result = processAndTestFrame(appState, file, frame, testCase);
    if (!result.success) {
      return result;
    }
    let firstFrame = true;
    while (firstFrame || frame.frameInfo.Telemetry.FrameCount !== 0) {
      firstFrame = false;
      // Get remaining frames
      frame = getNextFrame(frameBuffer);
      result = processAndTestFrame(appState, file, frame, testCase);
      if (!result.success) {
        break;
      }
    }
    if (!result.success) {
      return result;
    }
    return { success: true, err: `Passed: "${file}"` };
  }
  return { success: true, err: `Skipping: No tests found for "${file}"` };
}
