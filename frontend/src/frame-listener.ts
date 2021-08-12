import {
  CameraConnection,
  CameraConnectionState,
  Frame,
  PartialFrame
} from "@/camera";
// import { WasmTracingAllocator } from "@/tracing-allocator";
import cptvPlayer, { FrameHeaderV2 } from "../cptv_player";
import ProcessingWorker from "worker-loader!./processing";
import { FrameProcessor, ImageInfo } from "@/processing";
import { InitialFrameInfo, ScreeningState } from "@/types";
const { initWithCptvData, getRawFrame } = cptvPlayer as any;

let usingLiveCamera = false;
const frameProcessor = await FrameProcessor();

export const processSensorData = async (
  frame: PartialFrame
): Promise<ImageInfo> => {
  let msSinceLastFFC =
    frame.frameInfo.Telemetry.TimeOn - frame.frameInfo.Telemetry.LastFFCTime;
  if (usingLiveCamera) {
    msSinceLastFFC = msSinceLastFFC / 1000 / 1000;
  }
  frameProcessor.analyse(
    frame.frame,
    frame.frameInfo.Calibration?.ThermalRefTemp ?? 37,
    msSinceLastFFC
  );
  return frameProcessor.getFrame();
};

const workerContext: Worker = self as any;
let frameBuffer: Uint8Array = new Uint8Array(0);

export interface FrameMessage {
  type: "connectionStateChange" | "gotFrame" | "noThermalReference";
  payload: CameraConnectionState | Frame;
}

interface PlaybackCommand {
  useLiveCamera?: boolean;
  dumpMemoryAllocations?: boolean;
  hostname?: string;
  port?: string;
  cptvFileToPlayback?: string;
  startFrame?: number;
  endFrame?: number;
}

async function processFrame(frame: PartialFrame) {
  // console.log("got frame", frame);
  // Do the frame processing, then postMessage the relevant payload to the view app.
  // Do this in yet another worker(s)?
  const imageInfo = await processSensorData(frame);

  workerContext.postMessage({
    type: "gotFrame",
    payload: {
      frameInfo: frame.frameInfo,
      frame: frame.frame,
      bodyShape: imageInfo.bodyShape,
      analysisResult: imageInfo.analysisResult
    } as Frame
  });
}

function onConnectionStateChange(connectionState: CameraConnectionState) {
  workerContext.postMessage({
    type: "connectionStateChange",
    payload: connectionState
  } as FrameMessage);
}

function getNextFrame(startFrame = -1, endFrame = -1) {
  let frameInfo: FrameHeaderV2 = getRawFrame(frameBuffer);
  while (
    frameInfo.frame_number < startFrame ||
    (endFrame != -1 && frameInfo.frame_number > endFrame)
  ) {
    frameInfo = getRawFrame(frameBuffer);
  }
  const appVersion = "";
  const binaryVersion = "";
  const currentFrame = {
    frame: new Uint16Array(frameBuffer!.buffer),
    frameInfo: {
      ...InitialFrameInfo,
      AppVersion: appVersion,
      BinaryVersion: binaryVersion,
      Telemetry: {
        ...InitialFrameInfo.Telemetry,
        LastFFCTime: frameInfo!.last_ffc_time,
        FrameCount: frameInfo!.frame_number,
        TimeOn: frameInfo!.time_on
      }
    }
  };
  frameInfo.free();
  setTimeout(getNextFrame, 1000 / 9);
  processFrame(currentFrame);
}

function playLocalCptvFile(
  cptvFileBytes: ArrayBuffer,
  startFrame = 0,
  endFrame = -1
) {
  frameBuffer = new Uint8Array(160 * 120 * 2);
  initWithCptvData(new Uint8Array(cptvFileBytes));
  getNextFrame();
}

(async function run() {
  workerContext.addEventListener("message", async event => {
    const message = event.data as PlaybackCommand;
    usingLiveCamera = message.useLiveCamera || false;
    if (message.useLiveCamera) {
      new CameraConnection(
        message.hostname!,
        message.port!,
        processFrame,
        onConnectionStateChange
      );
      // Init live camera web-socket connection
    } else if (message.cptvFileToPlayback) {
      // Init CPTV file playback
      await cptvPlayer(`${process.env.BASE_URL}cptv_player_bg.wasm`);
      const cptvFile = await fetch(message.cptvFileToPlayback);
      const buffer = await cptvFile.arrayBuffer();
      playLocalCptvFile(
        buffer,
        message.startFrame || 0,
        message.endFrame || -1
      );
    }
    return;
  });
})();
