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

  const initObserver = () => {
    const obs = new PerformanceObserver((list, obs) => {
      const analysisTimes = list.getEntriesByName(
        "Start Analysis to Finish Analysis"
      );
      const fileAnalysisTime = list.getEntriesByName(
        "Start File to Finish File"
      );

      const averageAnalysisTime =
        analysisTimes
          .map(entry => entry.duration)
          .reduce((total, next) => total + next, 0) / analysisTimes.length;
      console.log(`\tAverage Time to analyse frame: ${averageAnalysisTime}ms`);
      console.log(`\tTotal Time to Finish: ${fileAnalysisTime[0].duration}ms`);
      console.log(`\tTotal Amount of Frames: ${analysisTimes.length}`);
      obs.disconnect();
    });

    obs.observe({ entryTypes: ["measure"], buffered: true });
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
    return measured.length > 0 ? measured.pop()!.face.sampleTemp : 0;
  };

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
    return (frames / FPS)
  };

  const processFile = async (file: string, cali: number) => {
    const player = new CptvPlayer();
    //initObserver();
    const result: AnalysisResult[] = [];
    performance.mark("Start File");
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
    checkExt,
    isCPTV,
    processFile,
    processTestFile,
    getMeasuredFrames,
    getSequenceOfScreeningState
  };
}
