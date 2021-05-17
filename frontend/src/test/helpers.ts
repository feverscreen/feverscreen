import { CptvPlayer } from "cptv-player";
import {
  initialize,
  analyse,
  reinitialize
} from "./tko-processing/tko_processing";
import { ScreeningState, AnalysisResult, extractResult } from "../types";
import { performance, PerformanceObserver } from "perf_hooks";
import { readFileSync } from "fs";
import papaparse from "papaparse";

const { parse, unparse } = papaparse;

export const testFiles = `${process.cwd()}/src/test/test_files`;

export type Result = {
  result: AnalysisResult[];
  framesToMeasure: number;
  secondsToMeasure: number;
  scannedResult: number;
  thermalReading: number;
  thermalRefRaw: number;
  sequenceOfStates: string[];
};

export interface TestFile {
  fileName: string;
  id: number;
  date: string;
  duration: number;
  Scanned: number;
  Feature: string;
  Notes: string;
  URL: string;
  "Start Time": string;
  realTemps: number[];
  calibration: number;
}

export type result = { TestFile: TestFile; Result: Result };

export default function TestHelper() {
  const frameRes: [number, number] = [120, 160];
  initialize(frameRes[1], frameRes[0]);
  const getAverages = (results: result[]) => {
    let addedCount = 1;
    const averages = results.reduce(
      (averages, res) => {
        const { thermalReading, secondsToMeasure } = res.Result;
        if (averages.averageTemp === 0)
          return {
            averageTemp: res.Result.thermalReading,
            averageSeconds: res.Result.secondsToMeasure
          };
        if (thermalReading === 0) return averages;
        addedCount += 1;
        averages.averageTemp = averages.averageTemp + thermalReading;
        averages.averageSeconds = averages.averageSeconds + secondsToMeasure;
        return averages;
      },
      { averageTemp: 0, averageSeconds: 0 }
    );
    averages.averageTemp = averages.averageTemp / addedCount;
    averages.averageSeconds = averages.averageSeconds / addedCount;
    return averages;
  };

  const calcFailRate = (results: result[]) => {
    const failed = results.reduce((count: number, res: result) => {
      const noRealTemp = res.TestFile.realTemps[0] === 0;
      const hasTestTemp = res.Result.thermalReading !== 0;
      if (noRealTemp && !hasTestTemp) {
        count += 1;
        return count;
      }
      return count;
    }, 0);
    const failAvg = failed / results.length;
    return { failed, failAvg };
  };

  const getTestData = (): TestFile[] => {
    const testCSV = readFileSync(`${testFiles}/tko-test-files.csv`, "utf8");
    const TestFiles = parse<TestFile>(testCSV, {
      header: true,
      transform: (val, field) =>
        field === "Scanned" || field === "calibration"
          ? Number(val)
          : field === "realTemps"
          ? val.split(",").map(n => Number(n))
          : val
    }).data;
    return TestFiles;
  };

  const createCSV = (results: result[]): string => {
    const averages = getAverages(results);
    const failRate = calcFailRate(results);
    results.forEach(res => {
      delete res.Result.result;
    });
    const finalRes = results.map(({ TestFile, Result }) => ({
      ...TestFile,
      ...Result
    }));
    const csv = unparse(finalRes);
    const avgCsv = unparse([{ ...averages, ...failRate }]);
    return `${csv}\n${avgCsv}`
  }

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
    const measured = getMeasuredFrames(results);
    return measured.map(val => val.face.sampleTemp.toFixed(1));
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
    return frames / FPS;
  };

  const getMedianThermal = (results: AnalysisResult[]) => {
    const refs = results.map(val => val.thermalRef.val).sort();
    return refs.length % 2
      ? refs[refs.length / 2]
      : (refs[Math.floor((refs.length - 1) / 2)] + refs[refs.length / 2]) / 2;
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
        secondsToMeasure,
        sequenceOfStates: getSequenceOfScreeningState(result),
        thermalRefRaw: getMedianThermal(result)
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
    getTestData,
    createCSV,
    checkExt,
    isCPTV,
    processFile,
    processTestFile,
    getMeasuredFrames,
    getSequenceOfScreeningState
  };
}
