import { BlobReader } from "./utils";
import { FrameInfo, PartialFrameInfo } from "./api/types";
import { AnalysisResult, FactoryDefaultCalibration } from "@/types";

export interface Frame {
  frameInfo: FrameInfo;
  frame: Uint16Array;
  bodyShape: Uint8Array;
  analysisResult: AnalysisResult;
}

export interface PartialFrame {
  frameInfo: PartialFrameInfo;
  frame: Uint16Array;
}

export enum CameraConnectionState {
  Connecting,
  Connected,
  Disconnected
}

const UUID = new Date().getTime();

interface CameraStats {
  skippedFramesServer: number;
  skippedFramesClient: number;
}

interface CameraState {
  socket: WebSocket | null;
  UUID: number;
  stats: CameraStats;
  prevFrameNum: number;
  frames: PartialFrame[];
  heartbeatInterval: number;
  pendingFrame: number | null;
}

export class CameraConnection {
  constructor(
    public host: string,
    port: string,
    public onFrame: (frame: PartialFrame) => void,
    public onConnectionStateChange: (
      connectionState: CameraConnectionState
    ) => void
  ) {
    if (
      (port === "8080" || port === "5000") &&
      process.env.NODE_ENV === "development"
    ) {
      // If we're running in development mode, find the remote camera server
      //this.host = "192.168.178.21";
      this.host = "192.168.0.181";
      //this.host = "192.168.0.82";
      //this.host = "192.168.0.41";
    }
    this.connect();
  }
  private state: CameraState = {
    socket: null,
    UUID: new Date().getTime(),
    stats: {
      skippedFramesServer: 0,
      skippedFramesClient: 0
    },
    pendingFrame: null,
    prevFrameNum: -1,
    heartbeatInterval: 0,
    frames: []
  };

  retryConnection(retryTime: number) {
    if (retryTime > 0) {
      setTimeout(() => this.retryConnection(retryTime - 1), 1000);
    } else {
      this.connect();
    }
  }
  register() {
    if (this.state.socket !== null) {
      if (this.state.socket.readyState === WebSocket.OPEN) {
        // We are waiting for frames now.
        this.state.socket.send(
          JSON.stringify({
            type: "Register",
            data: navigator.userAgent,
            uuid: UUID
          })
        );
        this.onConnectionStateChange(CameraConnectionState.Connected);

        this.state.heartbeatInterval = (setInterval(() => {
          this.state.socket &&
            this.state.socket.send(
              JSON.stringify({
                type: "Heartbeat",
                uuid: UUID
              })
            );
        }, 5000) as unknown) as number;
      } else {
        setTimeout(this.register.bind(this), 100);
      }
    }
  }
  connect() {
    this.state.socket = new WebSocket(`ws://${this.host}/ws`);
    this.onConnectionStateChange(CameraConnectionState.Connecting);
    this.state.socket.addEventListener("error", e => {
      console.warn("Websocket Connection error", e);
      //...
    });
    // Connection opened
    this.state.socket.addEventListener("open", this.register.bind(this));
    this.state.socket.addEventListener("close", () => {
      // When we do reconnect, we need to treat it as a new connection
      console.warn("Websocket closed");
      this.state.socket = null;
      this.onConnectionStateChange(CameraConnectionState.Disconnected);
      clearInterval(this.state.heartbeatInterval);
      this.retryConnection(5);
    });
    this.state.socket.addEventListener("message", async event => {
      if (event.data instanceof Blob) {
        // TODO(jon): Only do this if we detect that we're dropping frames?
        const droppingFrames = false;
        if (droppingFrames) {
          this.state.frames.push(
            (await this.parseFrame(event.data as Blob)) as PartialFrame
          );
          // Process the latest frame, after waiting half a frame delay
          // to see if there are any more frames hot on its heels.
          this.state.pendingFrame = (setTimeout(
            this.useLatestFrame.bind(this),
            1
          ) as unknown) as number;
        } else {
          this.onFrame(
            (await this.parseFrame(event.data as Blob)) as PartialFrame
          );
        }
        // Every time we get a frame, set a new timeout for when we decide that the camera has stalled sending us new frames.
      }
    });
  }
  async parseFrame(
    blob: Blob
  ): Promise<{ frameInfo: PartialFrameInfo; frame: Uint16Array } | null> {
    // NOTE(jon): On iOS. it seems slow to do multiple fetches from the blob, so let's do it all at once.
    const data = await BlobReader.arrayBuffer(blob);
    const frameInfoLength = new Uint16Array(data.slice(0, 2))[0];
    const frameStartOffset = 2 + frameInfoLength;
    try {
      const frameInfo = JSON.parse(
        String.fromCharCode(...new Uint8Array(data.slice(2, frameStartOffset)))
      ) as PartialFrameInfo;

      if (frameInfo.Calibration === null) {
        frameInfo.Calibration = { ...FactoryDefaultCalibration };
        frameInfo.Calibration.UuidOfUpdater = UUID;
        frameInfo.Calibration.CalibrationBinaryVersion =
          frameInfo.BinaryVersion;
      }

      const frameNumber = frameInfo.Telemetry.FrameCount;
      if (frameNumber % 20 === 0) {
        performance.clearMarks();
        performance.clearMeasures();
        performance.clearResourceTimings();
      }
      performance.mark(`start frame ${frameNumber}`);
      if (
        this.state.prevFrameNum !== -1 &&
        this.state.prevFrameNum + 1 !== frameInfo.Telemetry.FrameCount
      ) {
        this.state.stats.skippedFramesServer +=
          frameInfo.Telemetry.FrameCount - this.state.prevFrameNum;
        // Work out an fps counter.
      }
      this.state.prevFrameNum = frameInfo.Telemetry.FrameCount;
      const frameSizeInBytes =
        frameInfo.Camera.ResX * frameInfo.Camera.ResY * 2;
      // TODO(jon): Some perf optimisations here.
      const frame = new Uint16Array(
        data.slice(frameStartOffset, frameStartOffset + frameSizeInBytes)
      );
      return {
        frameInfo,
        frame
      };
    } catch (e) {
      console.error("Malformed JSON payload", e);
    }
    return null;
  }
  async useLatestFrame() {
    if (this.state.pendingFrame) {
      clearTimeout(this.state.pendingFrame);
    }
    let latestFrameTimeOnMs = 0;
    let latestFrame: PartialFrame | null = null;
    // Turns out that we don't always get the messages in order from the pi, so make sure we take the latest one.
    const framesToDrop: PartialFrame[] = [];
    while (this.state.frames.length !== 0) {
      const frame = this.state.frames.shift() as PartialFrame;
      const frameHeader = frame.frameInfo;
      const timeOn = frameHeader.Telemetry.TimeOn / 1000 / 1000;
      if (timeOn > latestFrameTimeOnMs) {
        if (latestFrame !== null) {
          framesToDrop.push(latestFrame);
        }
        latestFrameTimeOnMs = timeOn;
        latestFrame = frame;
      }
    }
    // Clear out and log any old frames that need to be dropped
    while (framesToDrop.length !== 0) {
      const dropFrame = framesToDrop.shift() as PartialFrame;
      const timeOn = dropFrame.frameInfo.Telemetry.TimeOn / 1000 / 1000;
      this.state.stats.skippedFramesClient++;
      if (this.state.socket) {
        (this.state.socket as WebSocket).send(
          JSON.stringify({
            type: "Dropped late frame",
            data: `${latestFrameTimeOnMs - timeOn}ms behind current: frame#${
              dropFrame.frameInfo.Telemetry.FrameCount
            }`,
            uuid: UUID
          })
        );
      } else {
        console.warn("Lost web socket connection");
      }
    }

    // Take the latest frame and process it.
    if (latestFrame !== null) {
      await this.onFrame(latestFrame);
      // if (DEBUG_MODE) {
      //   updateFpsCounter(skippedFramesServer, skippedFramesClient);
      // } else if (fpsCount.innerText !== "") {
      //   fpsCount.innerText = "";
      // }
    }
    this.state.stats.skippedFramesClient = 0;
    this.state.stats.skippedFramesServer = 0;
  }
}
