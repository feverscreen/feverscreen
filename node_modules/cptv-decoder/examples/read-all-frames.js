import {CptvDecoder} from "../index.js";
import {performance} from "perf_hooks";

(async function() {
  const start = performance.now();
  //const file = "../cptv-files/20200130-031836.cptv";
  const file = "../cptv-files/20210812-073822.cptv";
  const decoder = new CptvDecoder();
  const fileName = new URL(file, import.meta.url).pathname;
  await decoder.initWithCptvFile(fileName);
  const header = await decoder.getHeader();
  const frames = [];
  let finished = false;
  while (!finished) {
    const frame = await decoder.getNextFrame();
    finished = await decoder.getTotalFrames();
    if (frame !== null && !finished) {
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
})();
