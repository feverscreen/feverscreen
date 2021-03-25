import { readFile } from "fs/promises";
import * as cptvPlayer from "./cptv_player/cptv_player";
import {
  initialize,
  analyse,
  AnalysisResult
} from "./tko-processing/tko_processing";
import { ScreeningState, getScreeningState } from "../types";

const frameRes: [number, number] = [120, 160];

const checkExt = (ext: string) => (file: string) =>
  file
    .split(".")
    .pop()
    ?.toLowerCase() === ext.toLowerCase();
let hasInit = false;

export const isCPTV = (file: string) => checkExt("CPTV")(file);

const getFrame = () => {
  const arrBuffer = new ArrayBuffer(frameRes[0] * frameRes[1] * 2);
  const frameBuffer = new Uint8Array(arrBuffer);
  const frameInfo = cptvPlayer.getRawFrame(frameBuffer);
  const frame = new Uint16Array(arrBuffer);
  console.log(frame);
  return { frame, frameInfo };
};

export const processFile = async (file: string) => {
  const result = [];
  if (isCPTV(file)) {
    let hasNextFrame = true;
    const fileBytes = await readFile(file);
    let firstFrame = true;
    if (!hasInit) {
      initialize(frameRes[0], frameRes[1]);
      cptvPlayer.initWithCptvData(fileBytes);
      hasInit = true;
    }

    do {
      const frame = getFrame();

      const { frame_number } = frame.frameInfo;
      hasNextFrame = frame_number !== 0 || firstFrame;
      firstFrame = false;
      const analysis = analyse(frame.frame, 36.5, 6000);
      result.push(analysis);
    } while (hasNextFrame);
  }
  return result;
};

export const getMeasuredFrames = (results: AnalysisResult[]) => {
  const measurements = results.filter(
    result =>
      getScreeningState(result.next_state) === ScreeningState.MEASURED &&
      result.face.sample_temp > 0
  );
  return measurements;
};
