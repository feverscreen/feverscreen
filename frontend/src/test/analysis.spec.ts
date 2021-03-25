import {processFile, isCPTV, getMeasuredFrames} from "./helpers";
import {expect} from "chai";
import {AnalysisResult} from "./tko-processing/tko_processing";
import {ScreeningState, getScreeningState} from "../../src/types";

const PersonNoMeasure = "20210322-112850.cptv";
const PersonMeasure = "20210325-091249.cptv";
const fileFiles = `${process.cwd()}/src/test/test_files`;
const testFile = PersonMeasure;
let result: AnalysisResult[];

describe("Analyse cptv file using processing algorithm", async () => {
  before(async () => {
    result = await processFile(`${fileFiles}/${testFile}`);
  });
  it("checks file is cptv", () => {
    const exampleMP4file = "1234.mp4";
    expect(isCPTV(testFile)).to.be.true;
    expect(isCPTV(exampleMP4file)).to.be.false;
  });
  it("can process a file", () => {
    expect(result, `${result[0]}`).have.length.above(0);
  });
  it("can find a body", () => {
    expect(
      result.filter(val => val.has_body),
      "Found body"
    ).have.length.above(0);
  });
  it("can measure temprature", () => {
    const measuredTemps = getMeasuredFrames(result);
    result.map(res => console.log(getScreeningState(res.next_state)));
    expect(measuredTemps).have.length.above(0);
  });
  it("can get stable lock", () => {
    const faceLocked = result.filter(
      res => ScreeningState.STABLE_LOCK === getScreeningState(res.next_state)
    );
    expect(faceLocked).to.have.length.above(0);
  });
});
