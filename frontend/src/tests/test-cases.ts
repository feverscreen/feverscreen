import { TestAppState } from "../types";

const faces = (num: number) => {
  return (state: TestAppState, prevState: TestAppState): TestResult => {
    const success = state.faces.length === num;
    return {
      success,
      err: success
        ? null
        : `Expected ${num} faces detected, got ${state.faces.length}`
    };
  };
};

const noFaces = (state: TestAppState, prevState: TestAppState): TestResult => {
  return faces(0)(state, prevState);
};

const oneFace = (state: TestAppState, prevState: TestAppState): TestResult => {
  return faces(1)(state, prevState);
};

const frontFacing = (
  state: TestAppState,
  prevState: TestAppState
): TestResult => {
  const success = state.faces[0].frontOnRatio < 0.02;
  return { success, err: success ? null : "Expected front-facing face" };
};

const notFrontFacing = (
  state: TestAppState,
  prevState: TestAppState
): TestResult => {
  const ret = frontFacing(state, prevState);
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
export type TestCase = (
  state: TestAppState,
  prevState: TestAppState
) => TestResult;
export interface FrameTests {
  length: number;
  frames: Record<string, TestCase[]>;
}
export type TestCasesConfig = Record<string, FrameTests>;

const TestCases: TestCasesConfig = {
  "twopeople-calibration.cptv": {
    length: 215,
    frames: {
      "0-32": [noFaces],
      "33-37": [oneFace, notFrontFacing],
      "38-64": [oneFace, frontFacing],
      "65-117": [noFaces],
      "118-120": [oneFace, notFrontFacing],
      "121-177": [oneFace, frontFacing],
      "178-186": [oneFace, notFrontFacing],
      "186-213": [noFaces]
    }
  }
  // "coffee.cptv": {
  //   length: 120
  // },
  // "Wobbling at 2m and walking up to 0.6m at 35.5.cptv": {
  //   length: 202,
  //   "0-15": [noFaces],
  //   "16-30": [faces(1), frontFacing]
  // },
  // "walking towards camera - calibrated at 2m.cptv": {
  //   length: 175
  // },
  // "detecting part then whole face repeatedly.cptv": {
  //   length: 115
  // },
  // "hand on head.cptv": {
  //   length: 82
  // },
  // "in and out from same side Shaun.cptv": {
  //   length: 99
  // },
  // "looking_down.cptv": {
  //   length: 102
  // },
  // "no-face-detected.cptv": {
  //   length: 39
  // },
  // "person.cptv": {
  //   length: 124
  // },
  // "Reading hot Shaun 22 June.cptv": {
  //   length: 98
  // },
  // "sideways face.cptv": {
  //   length: 155
  // },
  // "walking through Shaun.cptv": {
  //   length: 99
  // }
};

export default TestCases;
