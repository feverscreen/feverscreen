import helper from "./helpers";
import { ScreeningState, AnalysisResult } from "../types";
import { jest } from "@jest/globals";
jest.setTimeout(30 * 60 * 1000);
const PersonShouldNotMeasure = "fs-1220-815251-2021-03-29T22:09:21.000Z.cptv";
const PersonMeasure = "fs-1204-816701-2021-04-01T02:47:35.000Z.cptv";
const EmptyShouldNotMeasure =
  "fs-1220-815931-2021-03-30T23:34:42.000Z.cptv";

let result: AnalysisResult[];

const TestHelper = helper();

describe("Analyse cptv file using processing algorithm", () => {
  describe("Measuring Person's temprature", () => {
    beforeAll(async () => {
      const res = await TestHelper.processTestFile(PersonMeasure, 37);
      result = res?.result ?? [];
    });
    it("measures video with person", () => {
      expect(result).not.toHaveLength(0);
      expect(result.filter(val => val.hasBody)).not.toHaveLength(0);
      expect(TestHelper.getSequenceOfScreeningState(result)).toContain(
        ScreeningState.MEASURED
      );
      const thermalRef = result.filter(res => res.thermalRef.temp > 0);
      expect(thermalRef).not.toHaveLength(0);
    });
  });

  describe("Do not measure far person's temprature", () => {
    beforeAll(async () => {
      const res = await TestHelper.processTestFile(PersonShouldNotMeasure, 37);
      result = res?.result ?? [];
    });
    it("can find a body", () => {
      expect(TestHelper.getSequenceOfScreeningState(result)).toContain(
        ScreeningState.LARGE_BODY
      );
      expect(TestHelper.getSequenceOfScreeningState(result)).not.toContain(
        ScreeningState.MEASURED
      );
    });
  });

  describe("Does not measure empty video", () => {
    beforeAll(async () => {
      const res = await TestHelper.processTestFile(EmptyShouldNotMeasure, 37);
      result = res?.result ?? [];
    });
    it("should not change screening states from ready", () => {
      expect(
        TestHelper.getSequenceOfScreeningState(result).filter(
          (state: ScreeningState) =>
            state !== ScreeningState.READY &&
            state !== ScreeningState.MISSING_THERMAL_REF &&
            state !== ScreeningState.BLURRED
        )
      ).toHaveLength(0);
    });
  });
});
