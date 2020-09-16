import {PartialFrame} from "../camera";
import {AnalysisResult, extractResult} from "../types";
import * as cptvPlayer from "./cptv_player/cptv_player";
import * as analysis from "./smooth/smooth";
import { promisify } from "util";
import { readFile as readFileAsync } from "fs";
import testCases, { FrameTests, TestCase, TestResult } from "./test-cases";
import {FrameInfo} from "@/api/types";


let prevResult: AnalysisResult | null;
const readFile = promisify(readFileAsync);
let inited = false;

const InitialFrameInfo: FrameInfo = {
  Camera: {
    ResX: 160,
    ResY: 120,
    FPS: 9,
    Brand: "flir",
    Model: "lepton3.5",
    Firmware: "foo",
    CameraSerial: 12354,
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
    ThresholdMinFever: 0,
    Bottom: 0,
    Top: 0,
    Left: 0,
    Right: 0,
    CalibrationBinaryVersion: "abcde",
    UuidOfUpdater: 432423432432,
    UseNormalSound: false,
    UseWarningSound: false,
    UseErrorSound: false
  },
};

function processAndTestFrame(
  prevResult: AnalysisResult,
  file: string,
  frame: PartialFrame,
  testCase: FrameTests | undefined
): TestResult {
  const frameNumber = frame.frameInfo.Telemetry.FrameCount;
  const { ResX: width, ResY: height } = frame.frameInfo.Camera;
  /* --- Process frame and extract features: --- */
  if (!inited) {
    inited = true;
    analysis.initialize(120, 160);
  }
  const analysisResult = extractResult(analysis.analyse(frame.frame, 38.5));

  const result = testFrame(
    file,
    frameNumber,
    prevResult,
    analysisResult,
    testCase
  );
  // NOTE(jon): Assume for now that cropBox is constant between frames.
  return result;
}
const getNextFrame = (frameBuffer: ArrayBuffer): PartialFrame => {
  const frameInfo = cptvPlayer.getRawFrame(new Uint8Array(frameBuffer));
  return {
    frame: new Uint16Array(frameBuffer),
    frameInfo: {
      ...InitialFrameInfo,
      Telemetry: {
        ...InitialFrameInfo.Telemetry,
        LastFFCTime: frameInfo.last_ffc_time,
        FrameCount: frameInfo.frame_number,
        TimeOn: frameInfo.time_on
      }
    },
  };
};

function testFrame(
  file: string,
  frameNumber: number,
  state: AnalysisResult,
  nextState: AnalysisResult,
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
    // TODO(jon): Can probably run all these files in parallel on different threads.
    //  but we will need to modify cptvPlayer to keep data thread local properly.
    const fileBytes = await readFile(file);
    cptvPlayer.initWithCptvData(new Uint8Array(fileBytes as ArrayBuffer));
    const frameBuffer = new ArrayBuffer(160 * 120 * 2);
    let frame = getNextFrame(frameBuffer);
    let result = processAndTestFrame(prevResult, file, frame, testCase);
    if (!result.success) {
      return result;
    }
    let firstFrame = true;
    while (firstFrame || frame.frameInfo.Telemetry.FrameCount !== 0) {
      firstFrame = false;
      // Get remaining frames
      frame = getNextFrame(frameBuffer);
      result = processAndTestFrame(prevResult, file, frame, testCase);
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
