import { BlobReader } from "./utils";
import { FrameInfo } from "./api/types";
import { DeviceApi } from "./api/api";

export interface Frame {
  frameInfo: FrameInfo;
  frame: Float32Array;
  rotated: boolean;
  smoothed: Float32Array;
  medianed: Float32Array;
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
  frames: Frame[];
  heartbeatInterval: number;
  pendingFrame: number | null;
}

export class CameraConnection {
  constructor(
    public deviceIp: string,
    public onFrame: (frame: Frame) => void,
    public onConnectionStateChange: (
      connectionState: CameraConnectionState
    ) => void
  ) {
    // If we're running in development mode, find the fake-thermal-camera server
    if (
      window.location.host === "localhost:8080" ||
      window.location.host === "localhost:5000"
    ) {
      this.deviceIp = DeviceApi.debugPrefix.replace("http://", "");
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

        this.state.heartbeatInterval = window.setInterval(() => {
          this.state.socket &&
            this.state.socket.send(
              JSON.stringify({
                type: "Heartbeat",
                uuid: UUID
              })
            );
        }, 5000);
      } else {
        setTimeout(this.register.bind(this), 100);
      }
    }
  }
  connect() {
    this.state.socket = new WebSocket(`ws://${this.deviceIp}/ws`);
    this.onConnectionStateChange(CameraConnectionState.Connecting);
    this.state.socket.addEventListener("error", () => {
      //...
    });
    // Connection opened
    this.state.socket.addEventListener("open", this.register.bind(this));
    this.state.socket.addEventListener("close", () => {
      // When we do reconnect, we need to treat it as a new connection
      this.state.socket = null;
      this.onConnectionStateChange(CameraConnectionState.Disconnected);
      clearInterval(this.state.heartbeatInterval);
      this.retryConnection(5);
    });
    this.state.socket.addEventListener("message", async event => {
      if (event.data instanceof Blob) {
        // TODO(jon): Only do this if we detect that we're dropping frames?
        this.state.frames.push(
          (await this.parseFrame(event.data as Blob)) as Frame
        );
        // Process the latest frame, after waiting half a frame delay
        // to see if there are any more frames hot on its heels.
        this.state.pendingFrame = window.setTimeout(
          this.useLatestFrame.bind(this),
          16
        );
        // Every time we get a frame, set a new timeout for when we decide that the camera has stalled sending us new frames.
      }
    });
  }
  async parseFrame(blob: Blob): Promise<Frame | null> {
    // NOTE(jon): On iOS. it seems slow to do multiple fetches from the blob, so let's do it all at once.
    const data = await BlobReader.arrayBuffer(blob);
    const frameInfoLength = new Uint16Array(data.slice(0, 2))[0];
    const frameStartOffset = 2 + frameInfoLength;
    try {
      const frameInfo = JSON.parse(
        String.fromCharCode(...new Uint8Array(data.slice(2, frameStartOffset)))
      ) as FrameInfo;
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
      const frame = Float32Array.from(
        new Uint16Array(
          data.slice(frameStartOffset, frameStartOffset + frameSizeInBytes)
        )
      );
      return {
        frameInfo,
        frame,
        rotated: false,
        smoothed: new Float32Array(),
        medianed: new Float32Array()
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
    let latestFrame: Frame | null = null;
    // Turns out that we don't always get the messages in order from the pi, so make sure we take the latest one.
    const framesToDrop: Frame[] = [];
    while (this.state.frames.length !== 0) {
      const frame = this.state.frames.shift() as Frame;
      const frameHeader = frame.frameInfo;
      if (frameHeader !== null) {
        const timeOn = frameHeader.Telemetry.TimeOn / 1000 / 1000;
        if (timeOn > latestFrameTimeOnMs) {
          if (latestFrame !== null) {
            framesToDrop.push(latestFrame);
          }
          latestFrameTimeOnMs = timeOn;
          latestFrame = frame;
        }
      }
    }
    // Clear out and log any old frames that need to be dropped
    while (framesToDrop.length !== 0) {
      const dropFrame = framesToDrop.shift() as Frame;
      const timeOn = dropFrame.frameInfo.Telemetry.TimeOn / 1000 / 1000;
      this.state.stats.skippedFramesClient++;
      (this.state.socket as WebSocket).send(
        JSON.stringify({
          type: "Dropped late frame",
          data: `${latestFrameTimeOnMs - timeOn}ms behind current: frame#${
            dropFrame.frameInfo.Telemetry.FrameCount
          }`,
          uuid: UUID
        })
      );
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

export class LocalCameraConnection {
  constructor(
    public onFrame: (frame: Frame) => void,
    public onConnectionStateChange: (
      connectionState: CameraConnectionState
    ) => void
  ) {}

  public loadCptvFile(blob: Blob) {
    return blob;
  }
}
