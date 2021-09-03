import helper, { testFiles, result, TestFile } from "./helpers";
import { writeFile } from "fs/promises";
import { jest } from "@jest/globals";
jest.setTimeout(30 * 60 * 1000);

const TestHelper = helper();
const results: result[] = [];
const testData: TestFile[] = TestHelper.getTestData().filter(
  val => val.Scanned === 0
);

describe("TKO Processing False Positive Measurements", () => {
  test("Can get Test Data", async () => {
    expect(testData).not.toHaveLength(0);
  });
  testData.forEach(file => {
    test(`Process ${file.FileName}`, async () => {
      if (results.length === 630) {
        debugger;
      }
      const result: any = await TestHelper.processTestFile(
        file.FileName,
        file.calibration
      );
      results.push({ TestFile: file, Result: result });
      expect(result.scannedResult).toBe(0);
    });
  });
  afterAll(async () => {
    const fileName = `false-positive-log-${new Date().toISOString()}.csv`;
    const csv = TestHelper.createCSV(results, true);
    await writeFile(`${testFiles}/../profile_logs/${fileName}`, csv);
  });
});
