// import { WasmTracingAllocator } from "@/tracing-allocator";
import wasm_bindgen from "../smooth/smooth";
import { AnalysisResult, ScreeningState } from "@/types";

const { initialize, getBodyShape, analyse } = wasm_bindgen as any;

export interface ImageInfo {
  analysisResult: AnalysisResult;
  bodyShape?: Uint8Array;
}

function getScreeningState(state: number): ScreeningState {
  let screeningState = ScreeningState.INIT;
  switch (state) {
    case 0:
      screeningState = ScreeningState.WARMING_UP;
      break;
    case 1:
      screeningState = ScreeningState.READY;
      break;
    case 2:
      screeningState = ScreeningState.HEAD_LOCK;
      break;
    case 3:
      screeningState = ScreeningState.TOO_FAR;
      break;
    case 4:
      screeningState = ScreeningState.LARGE_BODY;
      break;
    case 5:
      screeningState = ScreeningState.FACE_LOCK;
      break;
    case 6:
      screeningState = ScreeningState.FRONTAL_LOCK;
      break;
    case 7:
      screeningState = ScreeningState.STABLE_LOCK;
      break;
    case 8:
      screeningState = ScreeningState.LEAVING;
      break;
    case 9:
      screeningState = ScreeningState.MISSING_THERMAL_REF;
      break;
  }
  return screeningState;
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
    const f = analysisResult.face;
    const h = f.head;
    const tL = h.top_left;
    const tR = h.top_right;
    const bL = h.bottom_left;
    const bR = h.bottom_right;
    const sP = f.sample_point;
    const hS = analysisResult.heat_stats;
    const ref = analysisResult.thermal_ref;
    const geom = ref.geom;
    const cP = geom.center;
    const copiedAnalysisResult: AnalysisResult = {
      face: {
        headLock: f.head_lock,
        head: {
          topLeft: {
            x: tL.x,
            y: tL.y
          },
          topRight: {
            x: tR.x,
            y: tR.y
          },
          bottomLeft: {
            x: bL.x,
            y: bL.y
          },
          bottomRight: {
            x: bR.x,
            y: bR.y
          }
        },
        samplePoint: {
          x: sP.x,
          y: sP.y
        },
        sampleTemp: f.sample_temp,
        sampleValue: f.sample_value,
        halfwayRatio: f.halfway_ratio,
        isValid: f.is_valid
      },
      frameBottomSum: analysisResult.frame_bottom_sum,
      motionSum: analysisResult.motion_sum,
      heatStats: {
        threshold: hS.threshold,
        min: hS.min,
        max: hS.max
      },
      motionThresholdSum: analysisResult.motion_threshold_sum,
      thresholdSum: analysisResult.threshold_sum,
      nextState: getScreeningState(analysisResult.next_state),
      hasBody: analysisResult.has_body,
      thermalRef: {
        geom: {
          center: {
            x: cP.x,
            y: cP.y
          },
          radius: geom.radius
        },
        val: ref.val,
        temp: ref.temp
      }
    };

    f.free();
    h.free();
    tL.free();
    tR.free();
    bL.free();
    bR.free();
    sP.free();
    hS.free();
    cP.free();
    geom.free();
    ref.free();
    analysisResult.free();
    ctx.postMessage({
      bodyShape,
      analysisResult: copiedAnalysisResult
    } as ImageInfo);
    return;
  });
})();
