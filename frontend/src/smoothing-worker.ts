import wasm_bindgen from "../smooth/smooth";
const {
  initialize,
  getMedianSmoothed,
  getRadialSmoothed,
  getThresholded,
  getHeatStats,
  smooth
} = wasm_bindgen as any;
const ctx: Worker = self as any;
(async function run() {
  // NOTE: The wasm file needs to be in the public folder so that it can be resolved at runtime,
  //  since webpacks' web-worker loader doesn't seem to be able to resolve wasm inside workers.

  await wasm_bindgen(`${process.env.BASE_URL}smooth_bg.wasm`);
  let inited = false;
  ctx.addEventListener("message", async event => {
    const { frame, width, height } = event.data;
    if (!inited) {
      initialize(width, height);
      inited = true;
    }
    smooth(frame, 16);
    const medianSmoothed = getMedianSmoothed();
    const radialSmoothed = getRadialSmoothed();
    const thresholded = getThresholded();
    const { threshold, min, max } = getHeatStats();
    ctx.postMessage({
      medianSmoothed,
      radialSmoothed,
      thresholded,
      threshold,
      min,
      max
    });
    return;
  });
})();
