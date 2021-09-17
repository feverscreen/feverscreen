import {Worker as WorkerThread} from "worker_threads";
export {ColourMaps, renderFrameIntoFrameBuffer, getFrameIndexAtTime} from "./frameRenderUtils.js";

export class CptvDecoder {
  constructor() {
    this.messageQueue = {};
    const onMessage = (message) => {
      let type;
      let data;
      if (message.type && message.type !== "message") {
        type = message.type;
        data = message.data;
      } else {
        type = message.data.type;
        data = message.data.data;
      }

      const resolver = this.messageQueue[type];
      delete this.messageQueue[type];
      resolver && resolver(data);
    };
    if (typeof window === "undefined") {
      this.decoder = new WorkerThread(new URL('decoder.worker.js', import.meta.url));
      this.decoder.addListener.bind(this.decoder)("message", onMessage);
    } else {
      this.decoder = new Worker(new URL('decoder.worker.js', import.meta.url), {type: "module"});
      this.decoder.onmessage = onMessage;
    }
  }

  async initWithCptvUrlAndKnownSize(url, size) {
    const type = "initWithUrlAndSize";
    this.decoder.postMessage({ type, url, size });
    return await this.waitForMessage(type);
  }

  async initWithCptvUrl(url) {
    const type = "initWithUrl";
    this.decoder.postMessage({ type, url });
    return await this.waitForMessage(type);
  }

  async initWithLocalCptvFile(arrayBuffer) {
    const type = "initWithLocalCptvFile";
    this.decoder.postMessage({ type, arrayBuffer });
    return await this.waitForMessage(type);
  }

  async initWithCptvFile(path) {
    const type = "initWithPath";
    this.decoder.postMessage({ type, path });
    return await this.waitForMessage(type);
  }

  async getFileMetadata(path) {
    const type = "getFileMetadata";
    this.decoder.postMessage({ type, path });
    return await this.waitForMessage(type);
  }

  async getStreamMetadata(url) {
    const type = "getStreamMetadata";
    this.decoder.postMessage({ type, url });
    return await this.waitForMessage(type);
  }

  async getBytesMetadata(arrayBuffer) {
    const type = "getBytesMetadata";
    this.decoder.postMessage({ type, arrayBuffer });
    return await this.waitForMessage(type);
  }

  async getNextFrame() {
    const type = "getNextFrame";
    this.decoder.postMessage({ type });
    return await this.waitForMessage(type);
  }

  async getTotalFrames() {
    const type = "getTotalFrames";
    this.decoder.postMessage({type});
    return await this.waitForMessage(type);
  }

  async getHeader() {
    const type = "getHeader";
    this.decoder.postMessage({type});
    return await this.waitForMessage(type);
  }

  async getLoadProgress() {
    const type = "getLoadProgress";
    this.decoder.postMessage({type});
    return await this.waitForMessage(type);
  }

  async hasStreamError() {
    const type = "hasStreamError";
    this.decoder.postMessage({type});
    return await this.waitForMessage(type);
  }

  async getStreamError() {
    const type = "getStreamError";
    this.decoder.postMessage({type});
    return await this.waitForMessage(type);
  }

  async waitForMessage(messageType) {
    return new Promise((resolve) => {
      this.messageQueue[messageType] = resolve;
    });
  }

  async close() {
    if (typeof window === "undefined") {
      return await this.decoder.terminate();
    } else {
      this.decoder.terminate();
    }
  }
}
