import { readFile, readdir } from "fs";
import { promisify } from "util";
import { performance } from "perf_hooks";
import { processSensorData } from "../processing";
import { extractSensorValueForCircle } from "../circle-detection";
import { FaceRecognitionModel } from "../haar-converted";
import { CameraConnectionState, Frame } from "../camera";
import { AppState } from "../types";
import { TemperatureSource } from "../api/types";

import {
  detectThermalReference,
  findFacesInFrameSync
} from "../feature-detection";
import { ROIFeature } from "../worker-fns";
import * as cptvPlayer from "./cptv_player/cptv_player";

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

const State: AppState = {
  currentFrame: null,
  cameraConnectionState: CameraConnectionState.Disconnected,
  thermalReference: null,
  faces: [],
  paused: false,
  cropBox: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  faceModel: null,
  lastFrameTime: 0
};

async function processFrame(frame: Frame) {
  State.currentFrame = frame;
  State.lastFrameTime = new Date().getTime();
  const { ResX: width, ResY: height } = frame.frameInfo.Camera;
  /* --- Process frame and extract features: --- */
  const { smoothedData, saltPepperData } = processSensorData(frame);

  // TODO(jon): Sanity check - if the thermal reference is moving from frame to frame,
  //  it's probably someones head...
  State.thermalReference = detectThermalReference(
    saltPepperData,
    smoothedData,
    State.thermalReference,
    width,
    height
  );
  if (State.thermalReference) {
    const thermalReference = State.thermalReference as ROIFeature;
    thermalReference.sensorValue = extractSensorValueForCircle(
      thermalReference,
      saltPepperData,
      width
    );
    State.faces = findFacesInFrameSync(
      smoothedData,
      saltPepperData,
      width,
      height,
      FaceRecognitionModel(),
      State.faces,
      thermalReference,
      frame.frameInfo
    );
    // TODO(jon): Use face.tracked() to get faces that have forehead tracking.
    // TODO(jon): Filter out any that aren't inside the cropbox
    // TODO(jon): Filter out any faces that are wider than they are tall.
    State.faces = State.faces.filter(face => face.width() <= face.height());
  }
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
(async function() {
  // TODO(jon): Resolve OpenCV import

  try {
    const start = performance.now();
    const frameBuffer = new ArrayBuffer(160 * 120 * 2);
    const readdirP = promisify(readdir);
    const readFileP = promisify(readFile);
    process.chdir("../../public/cptv-files");
    const files = await readdirP("./");
    const cptvFiles = files.filter(file => file.endsWith(".cptv"));
    for (const file of cptvFiles) {
      const fileBytes = await readFileP(file);
      cptvPlayer.initWithCptvData(new Uint8Array(fileBytes));
      let frame = getNextFrame(frameBuffer);
      await processFrame(frame);
      while (frame.frameInfo.Telemetry.FrameCount !== 0) {
        // Get remaining frames
        frame = getNextFrame(frameBuffer);
        await processFrame(frame);
      }
    }
    console.log("Reading all files took", performance.now() - start);
  } catch (e) {
    console.log(e);
  }
})();
