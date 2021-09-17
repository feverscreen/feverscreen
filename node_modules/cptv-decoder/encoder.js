import fs from "fs";
import {CptvDecoder} from "./index.js";
import {performance} from "perf_hooks";
let encoder;
const init = async() => {
  if (!fs.existsSync("./encoder/pkg/encoder.cjs")) {
    fs.renameSync("./encoder/pkg/encoder.js", "./encoder/pkg/encoder.cjs");
  }
  encoder = await import("./encoder/pkg/encoder.cjs");
}

export const createTestCptvFile = async (params) => {
  if (!encoder) {
    await init();
  }
  if (params.recordingDateTime && typeof params.recordingDateTime === 'object') {
    params.recordingDateTime = new Date(params.recordingDateTime).toISOString();
  }
  const defaultParams = {
    recordingDateTime: new Date().toISOString(),
    deviceName: "Test device",
    deviceId: 99999,
    brand: "Acme",
    model: "lo-res-20",
    serialNumber: 1234,
    firmwareVersion: "1.0",
    latitude: 1,
    duration: 10,
    longitude: 1,
    hasBackgroundFrame: true,
  };
  return new Uint8Array(encoder.createTestCptvFile({...defaultParams, ...params}));
};


(async function main() {
  const params = {
    duration: 300,
    hasBackgroundFrame: true,
    recordingDateTime: new Date().toISOString()
  };
  const s = performance.now();
  const file = await createTestCptvFile(params);
  console.log("Create test file", performance.now() - s);
  fs.writeFileSync("test.cptv", file);

  const j = performance.now();
  const decoder = new CptvDecoder();
  const meta = await decoder.getBytesMetadata(file);
  console.log("Get meta", performance.now() - j);
  await decoder.initWithLocalCptvFile(new Uint8Array(file));
  const start = performance.now();
  const header = await decoder.getHeader();
  const frames = [];
  let finished = false;
  while (!finished) {
    const frame = await decoder.getNextFrame();
    finished = await decoder.getTotalFrames();
    if (!finished) {
      frames.push(frame);
    }
  }
  const total = await decoder.getTotalFrames();
  console.assert(!await decoder.hasStreamError());
  decoder.close();
  console.assert(total === frames.length);
  const end = performance.now();
  console.log(`Time elapsed: ${end - start}ms`);
  console.log("# Frames: ", frames.length);
  console.log("Header info", header);
}());
