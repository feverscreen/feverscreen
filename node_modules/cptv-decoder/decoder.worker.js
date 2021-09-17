import {CptvDecoderInterface} from "./decoder.js";
import {parentPort} from "worker_threads";
const context = parentPort || (typeof self !== "undefined" ? self : false);
if (context) {
  const player = new CptvDecoderInterface();
  context.addEventListener("message", async ({data}) => {
    switch (data.type) {
      case "initWithUrl": {
        const result = await player.initWithCptvUrlAndSize(data.url);
        context.postMessage({type: data.type, data: result});
      }
        break;
      case "initWithUrlAndSize": {
        const result = await player.initWithCptvUrlAndSize(data.url, data.size);
        context.postMessage({type: data.type, data: result});
      }
        break;
      case "initWithPath": {
        const result = await player.initWithCptvFile(data.path);
        context.postMessage({type: data.type, data: result});
      }
        break;
      case "initWithLocalCptvFile": {
        const result = await player.initWithFileBytes(data.arrayBuffer);
        context.postMessage({type: data.type, data: result});
      }
        break;
      case "getBytesMetadata": {
        const header = await player.getBytesMetadata(data.arrayBuffer);
        context.postMessage({type: data.type, data: header});
      }
        break;
      case "getFileMetadata": {
        const header = await player.getFileMetadata(data.path);
        context.postMessage({type: data.type, data: header});
      }
        break;
      case "getStreamMetadata": {
        const header = await player.getStreamMetadata(data.url);
        context.postMessage({type: data.type, data: header});
      }
        break;
      case "getNextFrame": {
        const frame = await player.fetchNextFrame();
        context.postMessage({type: data.type, data: frame});
      }
        break;
      case "getTotalFrames": {
        const totalFrames = player.getTotalFrames();
        context.postMessage({type: data.type, data: totalFrames});
      }
        break;
      case "getLoadProgress": {
        const progress = player.getLoadProgress();
        context.postMessage({type: data.type, data: progress});
      }
        break;
      case "getHeader": {
        const header = await player.getHeader();
        context.postMessage({type: data.type, data: header});
      }
        break
      case "hasStreamError": {
        const hasError = player.hasStreamError();
        context.postMessage({type: data.type, data: hasError });
      }
        break;
      case "getStreamError": {
        const error = player.streamError;
        context.postMessage({type: data.type, data: error });
      }
        break;
      default:
        context.postMessage(data);
        return;
    }
  });
}
export default () => {
  return false;
};
