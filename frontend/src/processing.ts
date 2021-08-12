import tkoProcessing, {
  initialize,
  getBodyShape,
  analyse
} from "../processing/tko_processing";
//import {initialize, getBodyShape, analyse } from "../processing";
import { AnalysisResult, extractResult } from "@/types";

interface AnalysisInfo {
  frame: number;
  image: Promise<ImageInfo>[];
}
export interface ImageInfo {
  analysisResult: AnalysisResult;
  bodyShape?: Uint8Array;
}

export async function FrameProcessor() {
  await tkoProcessing(`${process.env.BASE_URL}tko_processing_bg.wasm`);
  initialize(120, 160);
  let frameCount = 0;
  const analysisRace: { frame: number; image: Promise<ImageInfo> }[] = [];
  return {
    analyse(
      frame: Uint16Array,
      calibrationTempC: number,
      msSinceLastFFC: number
    ) {
      const currFrame = frameCount;
      const analysis = new Promise<ImageInfo>(resolve => {
        const analysisResult = analyse(frame, calibrationTempC, msSinceLastFFC);
        const bodyShape = getBodyShape().slice(0);
        const result = extractResult(analysisResult);
        const index = analysisRace.findIndex(val => val.frame === currFrame);
        if (index !== 0) {
          analysisRace.splice(0, index);
        }
        resolve({
          bodyShape,
          analysisResult: result
        } as ImageInfo);
      });
      frameCount += 1;
      analysisRace.push({ frame: currFrame, image: analysis });
    },
    async getFrame(): Promise<ImageInfo> {
      const image = await Promise.race(analysisRace.map(val => val.image));
      analysisRace.splice(0, analysisRace.length);
      return image;
    }
  };
}
