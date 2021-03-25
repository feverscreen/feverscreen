import { AnalysisResult } from "../types";

const noFaces = (state: AnalysisResult): TestResult => {
  return {
    success:
      state.face.head.topLeft.x === 0 && state.face.head.topRight.y === 0,
    err: null
  };
};

const hasBody = (state: AnalysisResult): TestResult => {
  return {
    success: state.hasBody,
    err: null
  };
};

const oneFace = (state: AnalysisResult): TestResult => {
  return {
    success:
      state.face.head.topLeft.x !== 0 && state.face.head.topRight.y !== 0,
    err: `${state.face.head}`
  };
};

const frontFacing = (state: AnalysisResult): TestResult => {
  const success = state.face.headLock != 1;
  return { success, err: success ? null : "Expected front-facing face" };
};

const notFrontFacing = (state: AnalysisResult): TestResult => {
  const ret = frontFacing(state);
  return {
    success: !ret.success,
    err: ret.success ? null : "Expected non-front-facing face"
  };
};

export interface TestResult {
  success: boolean;
  err: string | null;
}
export type TestCase = (state: AnalysisResult) => TestResult;
export interface FrameTests {
  length: number;
  frames: Record<string, TestCase[]>;
}
export type TestCasesConfig = Record<string, FrameTests>;

/**
const TestCases: TestCasesConfig = {
  "YOUR_FILE_HERE.cptv": {
    length: 215,
    frames: {
      "0-32": [noFaces],
      "33-37": [oneFace, notFrontFacing], // Enter event
      "38-64": [oneFace, frontFacing], // Ready to scan event
      "65-117": [noFaces], // Exit event
      "118-120": [oneFace, notFrontFacing], // Enter event
      "121-177": [oneFace, frontFacing], // Ready to scan event
      "178-186": [oneFace, notFrontFacing],
      "186-214": [noFaces] // Exit event.
    }
  }
};
*/
const TestCases: TestCasesConfig = {
  // TODO
};

export default TestCases;
