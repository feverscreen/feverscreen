import { AnalysisResult } from "../types";

const noFaces = (state: AnalysisResult): TestResult => {
  return {
    success:
      state.face.head.topLeft.x === 0 && state.face.head.topRight.y === 0,
    err: null
  };
};

const oneFace = (state: AnalysisResult): TestResult => {
  return {
    success:
      state.face.head.topLeft.x !== 0 && state.face.head.topRight.y !== 0,
    err: null
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

// TODO(jon): Things we might want to have assertions for:
//  - That the face hasn't changed size too much.
//  - That the face has the same ID from frame to frame.
//  - That the thermal reference is present and position is unchanging.

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

const TestCases: TestCasesConfig = {
  "0.7.5beta recording-1 2708.cptv": {
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

export default TestCases;
