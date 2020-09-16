import wasm_bindgen from "../smooth/smooth";
import { AnalysisResult, extractResult } from "@/types";

const { initialize, getBodyShape, analyse } = wasm_bindgen as any;

export interface ImageInfo {
  analysisResult: AnalysisResult;
  bodyShape?: Uint8Array;
}

const ctx: Worker = self as any;
(async function run() {
  // NOTE: The wasm file needs to be in the public folder so that it can be resolved at runtime,
  //  since webpacks' web-worker loader doesn't seem to be able to resolve wasm inside workers.
  await wasm_bindgen(`${process.env.BASE_URL}smooth_bg.wasm`);
  let inited = false;
  ctx.addEventListener("message", async event => {
    const { frame, calibrationTempC } = event.data;
    if (!inited) {
      initialize(120, 160);
      inited = true;
    }

    const analysisResult = analyse(frame, calibrationTempC);
    const bodyShape = getBodyShape();
    const result = extractResult(analysisResult);
    ctx.postMessage({
      bodyShape,
      analysisResult: result
    } as ImageInfo);
    return;
  });
})();
