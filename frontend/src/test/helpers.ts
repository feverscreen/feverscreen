import { CptvPlayer } from "cptv-player";
import {
  initialize,
  analyse,
  reinitialize
} from "./tko-processing/tko_processing";
import { ScreeningState, AnalysisResult, extractResult } from "../types";
import { performance, PerformanceObserver } from "perf_hooks";

export const testFiles = `${process.cwd()}/src/test/test_files`;

export type Result = {
  result: AnalysisResult[];
  framesToMeasure: number;
  secondsToMeasure: number;
  scannedResult: number;
  thermalReading: number;
};

export default function TestHelper() {
  const frameRes: [number, number] = [120, 160];
  initialize(frameRes[1], frameRes[0]);

  const checkExt = (ext: string) => (file: string) =>
    file
      .split(".")
      .pop()
      ?.toLowerCase() === ext.toLowerCase();

  const isCPTV = (file: string) => {
    return checkExt("CPTV")(file);
  };

  const getMeasuredFrames = (results: AnalysisResult[]) => {
    const measurements = results.filter(
      result =>
        result.nextState === ScreeningState.MEASURED &&
        result.face.sampleTemp > 0
    );
    return measurements;
  };

  const getTemp = (results: AnalysisResult[]) => {
    const measured = getMeasuredFrames(results);
    return measured.length > 0 ? measured[0].face.sampleTemp : 0;
  };

  const getTemps = (results: AnalysisResult[]) => {
    const measured = getMeasuredFrames(results)
    return measured.map((val) => val.face.sampleTemp.toFixed(1));
  }

  const getSequenceOfScreeningState = (results: AnalysisResult[]) => {
    const ScreeningStates = results.filter(
      (val, index, arr) => val.nextState !== arr[index - 1]?.nextState
    );
    return ScreeningStates.map(val => val.nextState);
  };

  const getTotalScanned = (results: AnalysisResult[]) => {
    const states = getSequenceOfScreeningState(results);
    return states.reduce((acc, curr, index) => {
      if (
        curr === ScreeningState.MEASURED &&
        states[index - 1] !== ScreeningState.MEASURED
      ) {
        return (acc += 1);
      }
      return acc;
    }, 0);
  };

  const getTotalFramesTillMeasure = (results: AnalysisResult[]) => {
    const firstNonReady = results.findIndex(
      val => val.nextState !== ScreeningState.READY
    );
    const firstMeasured = results.findIndex(
      val => val.nextState === ScreeningState.MEASURED
    );
    return firstMeasured !== -1 ? firstMeasured - firstNonReady : 0;
  };

  const timeFromNumFrames = (frames: number) => {
    const FPS = 9;
    return frames / FPS;
  };

  const processFile = async (file: string, cali: number) => {
    const player = new CptvPlayer();
    //initObserver();
    const result: AnalysisResult[] = [];
    if (isCPTV(file)) {
      let frameNum = 0;
      await player.initWithCptvFile(file);
      while (
        player.getTotalFrames() === null ||
        frameNum <= player.getTotalFrames()!
      ) {
        await player.seekToFrame(frameNum);
        const frame = player.getFrameAtIndex(frameNum);
        if (frame !== null) {
          const { data } = frame;
          const analysis = analyse(data, cali, 6000);
          const res = extractResult(analysis);
          result.push(res);
        }
        frameNum++;
      }
      (player as any).playerContext.free();
      const round = (num: number) => Math.round(num * 100) / 100;
      const framesToMeasure: number = getTotalFramesTillMeasure(result);
      const secondsToMeasure: number = timeFromNumFrames(framesToMeasure);
      const Results: Result = {
        result,
        scannedResult: getTotalScanned(result),
        thermalReading: round(getTemp(result)),
        framesToMeasure,
        secondsToMeasure
      };
      reinitialize();
      return Results;
    }
  };

  const processTestFile = (testFile: string, cali: number) =>
    processFile(`${testFiles}/${testFile}`, cali);

  return {
    getTotalScanned,
    getTemp,
    getTemps,
    checkExt,
    isCPTV,
    processFile,
    processTestFile,
    getMeasuredFrames,
    getSequenceOfScreeningState
  };
}
