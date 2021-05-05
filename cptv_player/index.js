import * as cptvPlayer from "./pkg/index.js";
/**
 * NOTE: For browser usage, these imports need to be stubbed
 *  out in your webpack config using:
 *
 * resolve: {
 *  fallback: {
 *    fs,
 *    module,
 *  }
 * }
 */

import fs from "fs/promises";
import { createRequire } from "module";

class Unlocker {
  constructor() {
    this.fn = null;
  }
  unlock() {
    this.fn && this.fn();
  }
}

// For use in nodejs to wrap an already loaded array buffer into a Reader interface
const FakeReader = function (bytes) {
  const state = {
    offsets: []
  };
  state.bytes = bytes;
  state.offset = 0;
  const length = bytes.byteLength;
  // How many reader chunks to split the file into
  const numParts = 5;
  const percentages = length / numParts;
  for (let i = 0; i < numParts; i++) {
    state.offsets.push(Math.ceil(percentages * i));
  }
  state.offsets.push(length);
  return {
    read() {
      return new Promise((resolve) => {
        state.offset += 1;
        resolve({
          value: state.bytes.slice(state.offsets[state.offset - 1], state.offsets[state.offset]),
          done: state.offset === numParts
        });
      });
    },
    cancel() {
      // Does nothing.
      return new Promise((resolve) => {
        resolve()
      });
    }
  }
};

// TODO(jon): This differs depending on whether the sensor is lepton 3 or 3.5
const AVERAGE_HEADROOM_OVER_BACKGROUND = 300;
let initedWasm = false;
let totalFrames = null;
let fps = 9;

const yieldToUI = () => {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
};

export class CptvPlayer {
  async initWithCptvUrlAndSize(url, size) {
    const unlocker = new Unlocker();
    await this.lockIsUncontended(unlocker);
    this.locked = true;
    if (!initedWasm) {
      await cptvPlayer.default();
      initedWasm = true;
    } else if (initedWasm && this.inited) {
      this.playerContext.free();
      this.reader && await this.reader.cancel();
    }
    try {
      // Use this expired JWT token to test that failure case (usually when a page has been open too long)
      //const oldJWT = "https://api.cacophony.org.nz/api/v1/signedUrl?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfdHlwZSI6ImZpbGVEb3dubG9hZCIsImtleSI6InJhdy8yMDIxLzA0LzE1LzQ3MGU2YjY1LWZkOTgtNDk4Ny1iNWQ3LWQyN2MwOWIxODFhYSIsImZpbGVuYW1lIjoiMjAyMTA0MTUtMTE0MjE2LmNwdHYiLCJtaW1lVHlwZSI6ImFwcGxpY2F0aW9uL3gtY3B0diIsImlhdCI6MTYxODQ2MjUwNiwiZXhwIjoxNjE4NDYzMTA2fQ.p3RAOX7Ns52JqHWTMM5Se-Fn-UCyRtX2tveaGrRmiwo";
      this.response = await fetch(url);
      if (this.response.status === 200) {
        this.reader = this.response.body.getReader();
        if (!size) {
          size = Number(this.response.headers.get("Content-Length")) || 0;
        }
        this.expectedSize = size;
        totalFrames = null;
        this.playerContext = await cptvPlayer.CptvPlayerContext.newWithStream(this.reader, size);
        unlocker.unlock();
        this.inited = true;
        this.locked = false;
        return true;
      } else {
        this.locked = false;
        try {
          const r = await this.response.json();
          return (r.messages && r.messages.pop()) || r.message || "Unknown error";
        } catch (e) {
          return await r.text();
        }
      }
    } catch (e) {
      this.locked = false;
      return `Failed to load CPTV url ${url}, ${e}`;
    }
  }

  async initWithCptvFile(filePath) {
    // Don't call this from a browser!
    const file = await fs.readFile(filePath);
    // Need to wrap file in
    const require = createRequire(import.meta.url);
    const path = require.resolve("./pkg/index_bg.wasm");
    const wasm = await fs.readFile(path);
    const unlocker = new Unlocker();
    await this.lockIsUncontended(unlocker);
    this.locked = true;
    if (!initedWasm) {
      await cptvPlayer.default(wasm);
      initedWasm = true;
    } else if (initedWasm && this.inited) {
      this.playerContext.free();
      this.reader && await this.reader.cancel();
    }
    this.reader = new FakeReader(file);
    this.expectedSize = file.length;
    try {
      totalFrames = null;
      this.playerContext = await cptvPlayer.CptvPlayerContext.newWithStream(this.reader, file.length);
      unlocker.unlock();
      this.inited = true;
      this.locked = false;
      return true;
    } catch (e) {
      this.locked = false;
      return `Failed to load CPTV file ${filePath}, ${e}`;
    }
  }

  async seekToFrame(frameNum) {
    if (!this.reader) {
      return "You need to initialise the player with the url of a CPTV file";
    }
    const unlocker = new Unlocker();
    await this.lockIsUncontended(unlocker);
    this.locked = true;
    if (this.playerContext && this.playerContext.ptr) {
      this.playerContext = await cptvPlayer.CptvPlayerContext.seekToFrame(this.playerContext, frameNum);
    }
    unlocker.unlock();
    this.locked = false;
  }

  async lockIsUncontended(unlocker) {
    return new Promise((resolve) => {
      if (this.locked) {
        unlocker.fn = resolve;
      } else {
        resolve();
      }
    });
  }

  async getHeader() {
    if (!this.reader) {
      return "You need to initialise the player with the url of a CPTV file";
    }
    const unlocker = new Unlocker();
    await this.lockIsUncontended(unlocker);
    this.locked = true;
    if (this.playerContext && this.playerContext.ptr) {
      this.playerContext = await cptvPlayer.CptvPlayerContext.fetchHeader(this.playerContext);
    }
    const header = this.playerContext.getHeader();
    fps = header.fps;
    unlocker.unlock();
    this.locked = false;
    return header;
  }

  getFrameAtIndex(frameNum) {
    if (!this.locked && this.playerContext && this.playerContext.ptr) {
      const frameData = this.playerContext.getRawFrameN(frameNum);
      if (frameData.length === 0) {
        return null;
      }
      const min = this.playerContext.getMinValue();
      const max = Math.max(this.playerContext.getMaxValue(), min + AVERAGE_HEADROOM_OVER_BACKGROUND);
      return {min, max, data: frameData};
    }
    return null;
  }

  getTotalFrames() {
    if (!this.locked && this.inited && this.playerContext.ptr && this.playerContext.streamComplete()) {
      return this.playerContext.totalFrames();
    }
    return null;
  }

  getLoadedFrames() {
    if (!this.locked && this.playerContext && this.playerContext.ptr) {
      return this.playerContext.totalFrames();
    }
    return null;
  }

  getFrameHeaderAtIndex(frameNum) {
    if (this.locked || (!this.playerContext || !this.playerContext.ptr)) {
      return null;
    }
    const header = this.playerContext.getFrameHeader(frameNum);
    header.imageData.originalMax = header.imageData.max;
    header.imageData.max = Math.max(header.imageData.max, header.imageData.min + AVERAGE_HEADROOM_OVER_BACKGROUND);
    return header;
  }

  getBackgroundFrame() {
    if (!this.locked && this.playerContext && this.playerContext.ptr) {
      const frameData = this.playerContext.getBackgroundFrame();
      if (frameData.length === 0) {
        return null;
      }
      const min = this.playerContext.getMinValue();
      const max = Math.max(this.playerContext.getMaxValue(), min + AVERAGE_HEADROOM_OVER_BACKGROUND);
      return {min, max, data: frameData};
    }
    return null;
  }

  getLoadProgress() {
    if (this.locked || (!this.playerContext || !this.playerContext.ptr)) {
      return null;
    }
    // This doesn't actually tell us how much has downloaded, just how much has been lazily read.
    return this.playerContext.bytesLoaded() / this.expectedSize;
  }
};

export const CptvPlayerInstance = new CptvPlayer();

export async function queueFrame(frameNum, bufferStateChanged) {
  const availableFrames = CptvPlayerInstance.getLoadedFrames() || 0;
  if (frameNum + 1 > availableFrames + fps) {
    bufferStateChanged && bufferStateChanged(true);
    await yieldToUI();
    await CptvPlayerInstance.seekToFrame(frameNum);
    bufferStateChanged && bufferStateChanged(false);
  } else if (frameNum + 1 > availableFrames) {
    await CptvPlayerInstance.seekToFrame(frameNum);
  }
  let frameData = CptvPlayerInstance.getFrameAtIndex(frameNum);
  if (frameData === null) {
    console.assert(CptvPlayerInstance.getTotalFrames() !== null);
    totalFrames = CptvPlayerInstance.getTotalFrames();
    frameNum = totalFrames - 1;
    frameData = CptvPlayerInstance.getFrameAtIndex(frameNum);
    console.assert(frameData !== null);
  }
  return { frameNum, frameData, totalFrames };
}

export async function ensureEntireClipIsDecoded() {
  let frameNum = 0;
  while (!totalFrames) {
    await queueFrame(frameNum++);
  }
  return totalFrames;
}
