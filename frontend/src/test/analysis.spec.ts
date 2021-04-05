import TestHelper, {Result} from "./helpers";
import {expect} from "chai";
import {AnalysisResult} from "./tko-processing/tko_processing.js";
import {ScreeningState} from "../types";

const helper = TestHelper();
const {isCPTV, getSequenceOfScreeningState, processTestFile} = helper;


const PersonShouldMeasure = "20210322-112850.cptv";
const PersonShouldNotMeasure = "20210326-110819.cptv";
const PersonMeasure = "20210325-091249.cptv";
const EmptyShouldNotMeasure = "20210326-091927.cptv";

let result: AnalysisResult[];

describe("Analyse cptv file using processing algorithm", () => {
  it("checks file is cptv", () => {
    const exampleMP4file = "1234.mp4";
    expect(isCPTV(PersonMeasure)).to.be.true;
    expect(isCPTV(exampleMP4file)).to.be.false;
  });
  describe("Measure Person's temprature", () => {
    before(async () => {
      const res = await processTestFile(PersonMeasure);
      result = res.result
    });
    it("can process a file", () => {
      expect(result, `${result[0]}`).have.length.above(0);
    });
    it("can find a body", () => {
      expect(
        result.filter((val) => val.has_body),
        "Found body",
      ).have.length.above(0);
    });
    it("can measure temprature", () => {
      expect(
        getSequenceOfScreeningState(result),
      ).to.contain(ScreeningState.MEASURED);
    });
    it("can get stable lock", () => {
      expect(
        getSequenceOfScreeningState(result),
      ).to.contain(ScreeningState.LARGE_BODY);
    });
    it("can find thermal reference", () => {
      const thermalRef = result.filter((res) => res.thermal_ref.temp > 0);
      expect(thermalRef).to.have.length.above(0);
    });
  });

  describe("Do not measure far person's temprature", () => {
    before(async () => {
      const res = await processTestFile(PersonShouldNotMeasure);
      result = res.result
    });
    it("can find a body", () => {
      expect(
        getSequenceOfScreeningState(result),
      ).to.contain(ScreeningState.LARGE_BODY);
    });
    it("should not measure temprature", () => {
      expect(
        getSequenceOfScreeningState(result),
      ).to.not.contain(ScreeningState.MEASURED);
    });
  });

  describe("Do not measure empty video", () => {
    before(async () => {
      const res = await processTestFile(EmptyShouldNotMeasure);
      result = res.result
    });
    it("should not change screening states from ready", () => {
      expect(
        getSequenceOfScreeningState(result)
          .filter((state: ScreeningState) =>
            state !== ScreeningState.READY &&
            state !== ScreeningState.MISSING_THERMAL_REF
          ),
      )
        .to.be.empty;
    });
  });
});
