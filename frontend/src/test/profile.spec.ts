import helper, { testFiles, result, TestFile } from "./helpers";
import { writeFile } from "fs/promises";
import { jest } from "@jest/globals";
jest.setTimeout(30 * 60 * 1000);

const TestHelper = helper();
const results: result[] = [];
const testData: TestFile[] = TestHelper.getTestData()
  .filter(val => val.Scanned !== 0 && val.realTemps.length !== 0)
  .slice(0, 100);

describe("TKO Processing Performance Measurements", () => {
  test("Can get Test Data", async () => {
    expect(testData).not.toHaveLength(0);
  });
  testData.forEach(file => {
    test(`Process ${file.FileName}`, async () => {
      const result: any = await TestHelper.processTestFile(
        file.FileName,
        file.calibration
      );
      results.push({ TestFile: file, Result: result });
      expect(result.result).not.toHaveLength(0);
      expect(result.scannedResult).toBe(file.Scanned);
      if (file.realTemps.length > 0) {
        const matchedTemps = file.realTemps.filter((temp: number) => {
          return Math.abs(result.thermalReading - temp) < 2;
        });
        expect(matchedTemps).not.toHaveLength(0);
      }
    });
  });
  afterAll(async () => {
    const fileName = `profile-log-${new Date().toISOString()}.csv`;
    const csv = TestHelper.createCSV(results);
    await writeFile(`${testFiles}/../profile_logs/${fileName}`, csv);
  });
});
