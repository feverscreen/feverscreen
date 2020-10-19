import tkoProcessing from "../processing/tko_processing";
//import {initialize, getBodyShape, analyse } from "../processing";
import { AnalysisResult, extractResult } from "@/types";

const { initialize, getBodyShape, analyse } = tkoProcessing as any;

export interface ImageInfo {
  analysisResult: AnalysisResult;
  bodyShape?: Uint8Array;
}

const ctx: Worker = self as any;
(async function run() {
  // NOTE: The wasm file needs to be in the public folder so that it can be resolved at runtime,
  //  since webpacks' web-worker loader doesn't seem to be able to resolve wasm inside workers.
  await tkoProcessing(`${process.env.BASE_URL}tko_processing_bg.wasm`);
  let inited = false;
  ctx.addEventListener("message", async event => {
    const { frame, calibrationTempC, msSinceLastFFC } = event.data;
    if (!inited) {
      initialize(120, 160);
      inited = true;
    }

    const analysisResult = analyse(frame, calibrationTempC, msSinceLastFFC);
    const bodyShape = getBodyShape();
    const result = extractResult(analysisResult);
    ctx.postMessage({
      bodyShape,
      analysisResult: result
    } as ImageInfo);
    return;
  });
})();
