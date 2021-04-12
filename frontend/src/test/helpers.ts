import {readFile} from "fs/promises";
import * as cptvPlayer from "./cptv_player/cptv_player";
import {
  initialize,
  analyse,
  AnalysisResult
} from "./tko-processing/tko_processing.js";
import {ScreeningState, getScreeningState} from "../types";
import {performance, PerformanceObserver} from "perf_hooks"
export const testFiles = `${process.cwd()}/src/test/test_files`;
export default function TestHelper() {

export const testFiles = `${process.cwd()}/src/test/test_files`;

export type Result = {result: AnalysisResult[], totalFramesToMeasure: number, totalSecondsToMeasure: number, scannedResult: number}

export default function TestHelper() {

  const frameRes: [number, number] = [120, 160];
  let hasInit = false;

  const checkExt = (ext: string) => (file: string) =>
    file
      .split(".")
      .pop()
      ?.toLowerCase() === ext.toLowerCase();

  const isCPTV = (file: string) => {return checkExt("CPTV")(file)};

  const initObserver = () => {
    const obs = new PerformanceObserver((list, obs) => {
      const analysisTimes = list.getEntriesByName('Start Analysis to Finish Analysis')
      const fileAnalysisTime = list.getEntriesByName('Start File to Finish File')


      const averageAnalysisTime = analysisTimes.map(entry => entry.duration).reduce((total, next) => total + next, 0) / analysisTimes.length
      console.log(`\tAverage Time to analyse frame: ${averageAnalysisTime}ms`)
      console.log(`\tTotal Time to Finish: ${fileAnalysisTime[0].duration}ms`)
      console.log(`\tTotal Amount of Frames: ${analysisTimes.length}`)
      obs.disconnect()
    })

    obs.observe({entryTypes: ['measure'], buffered: true})
  }
  const getFrame = () => {
    const arrBuffer = new ArrayBuffer(frameRes[0] * frameRes[1] * 2);
    const frameBuffer = new Uint8Array(arrBuffer);
    const frameInfo = cptvPlayer.getRawFrame(frameBuffer);
    const frame = new Uint16Array(arrBuffer);
    return {frame, frameInfo};
  };

  const processFile = async (file: string) => {
    initObserver()
    const result = [];
    let startMeasureFrame = 0
    let finishMeasureFrame = 0
    performance.mark('Start File')
    if (isCPTV(file)) {
      let hasNextFrame = true;
      const fileBytes = await readFile(file);
      let firstFrame = true;
      if (!hasInit) {
        initialize(frameRes[0], frameRes[1]);
        hasInit = true;
      }
      cptvPlayer.initWithCptvData(fileBytes);

      do {
        const frame = getFrame();
        const {frame_number} = frame.frameInfo;
        hasNextFrame = frame_number !== 0 || firstFrame;
        firstFrame = false;

        performance.mark('Start Analysis')
        const analysis = analyse(frame.frame, 36.5, 6000);
        performance.mark('Finish Analysis')
        performance.measure('Start Analysis to Finish Analysis', 'Start Analysis', 'Finish Analysis')
        startMeasureFrame = startMeasureFrame === 0 &&
          getScreeningState(analysis.next_state) !== ScreeningState.READY ?
          frame_number :
          startMeasureFrame
        finishMeasureFrame = finishMeasureFrame === 0 &&
          getScreeningState(analysis.next_state) === ScreeningState.MEASURED ?
          frame_number :
          finishMeasureFrame

        result.push(analysis);
      } while (hasNextFrame);
    }

    performance.mark('Finish File')
    performance.measure('Start File to Finish File', 'Start File', 'Finish File')
    const cameraFrameRate = 9
    let totalFramesToMeasure = finishMeasureFrame - startMeasureFrame
    totalFramesToMeasure = totalFramesToMeasure > 0 ? totalFramesToMeasure : 0
    const totalSecondsToMeasure = totalFramesToMeasure / cameraFrameRate
    console.log(`\tTotal from Start to Measure: ${totalFramesToMeasure} frames, ${totalSecondsToMeasure}`)
    const round = (num: number) => Math.round(num * 100) / 100
    return {
      result: result, totalFramesToMeasure, totalSecondsToMeasure: round(totalSecondsToMeasure),
      scannedResult: getTotalScanned(result), thermalReading: round(getTemp(result))
    };
  };

  const getTemp = (results: AnalysisResult[]) => {
    const measured = getMeasuredFrames(results)
    return measured.length > 0 ? measured.pop()!.face.sample_temp : 0
  }

  const getMeasuredFrames = (results: AnalysisResult[]) => {
    const measurements = results.filter(
      result =>
        getScreeningState(result.next_state) === ScreeningState.MEASURED &&
        result.face.sample_temp > 0
    );
    return measurements;
  };

  const getSequenceOfScreeningState = (results: AnalysisResult[]) => {
    const ScreeningStates = results.filter((val, index, arr) => val.next_state !== arr[index - 1]?.next_state)
    return ScreeningStates.map(val => getScreeningState(val.next_state))
  };

  const processTestFile = (testFile: string) =>
    processFile(`${testFiles}/${testFile}`);

  const getTotalScanned = (results: AnalysisResult[]) => {
    const states = getSequenceOfScreeningState(results)
    return states.reduce((acc, curr, index) => {
      if (curr === ScreeningState.MEASURED && states[index - 1] !== ScreeningState.MEASURED) {
        return acc += 1
      }
      return acc
    }, 0)
  }

  return {
    getTotalScanned,
    checkExt,
    isCPTV,
    processFile,
    processTestFile,
    getMeasuredFrames,
    getSequenceOfScreeningState
  }
}
