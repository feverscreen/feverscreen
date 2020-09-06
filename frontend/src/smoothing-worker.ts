import wasm_bindgen from "../smooth/smooth";
const {
  initialize,
  getMedianSmoothed,
  getRadialSmoothed,
  getHeadHull,
  getBodyHull,
  getEdges,
  smooth,
  extract
} = wasm_bindgen as any;
import { ImageInfo, SmoothedImages } from "@/processing";

const ctx: Worker = self as any;
(async function run() {
  // NOTE: The wasm file needs to be in the public folder so that it can be resolved at runtime,
  //  since webpacks' web-worker loader doesn't seem to be able to resolve wasm inside workers.

  await wasm_bindgen(`${process.env.BASE_URL}smooth_bg.wasm`);
  let inited = false;
  ctx.addEventListener("message", async event => {
    const {
      type,
      frame,
      prevFrame,
      rotate,
      thermalRef,
      thermalRefC
    } = event.data;
    if (!inited) {
      initialize(120, 160);
      inited = true;
    }
    if (type === "smooth") {
      smooth(frame, prevFrame, rotate);
      const medianSmoothed = getMedianSmoothed();
      const radialSmoothed = getRadialSmoothed();
      ctx.postMessage({
        type: "smooth",
        medianSmoothed,
        radialSmoothed
      } as SmoothedImages);
    } else if (type === "extract") {
      const motionStats = extract(
        16,
        thermalRefC,
        thermalRef.sensorValue,
        thermalRef.x0,
        thermalRef.y0,
        thermalRef.x1,
        thermalRef.y1
      );
      const edgeData = getEdges();
      const headHull = getHeadHull();
      const bodyHull = getBodyHull();
      ctx.postMessage({
        type: "extract",
        edgeData,
        headHull,
        bodyHull,
        motionStats: {
          face: {
            headLock: motionStats.face.head_lock,
            head: {
              topLeft: {
                x: motionStats.face.head.top_left.x,
                y: motionStats.face.head.top_left.y
              },
              topRight: {
                x: motionStats.face.head.top_right.x,
                y: motionStats.face.head.top_right.y
              },
              bottomLeft: {
                x: motionStats.face.head.bottom_left.x,
                y: motionStats.face.head.bottom_left.y
              },
              bottomRight: {
                x: motionStats.face.head.bottom_right.x,
                y: motionStats.face.head.bottom_right.y
              }
            },
            samplePoint: {
              x: motionStats.face.sample_point.x,
              y: motionStats.face.sample_point.y
            },
            sampleValue: motionStats.face.sample_value,
            halfwayRatio: motionStats.face.halfway_ratio,
            isValid: motionStats.face.is_valid
          },
          frameBottomSum: motionStats.frame_bottom_sum,
          motionSum: motionStats.motion_sum,
          heatStats: {
            threshold: motionStats.heat_stats.threshold,
            min: motionStats.heat_stats.min,
            max: motionStats.heat_stats.max
          },
          motionThresholdSum: motionStats.motion_threshold_sum,
          thresholdSum: motionStats.threshold_sum
        }
      } as ImageInfo);
    }
    return;
  });
})();
