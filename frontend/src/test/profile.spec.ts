import helper, { testFiles, Result } from "./helpers";
import { writeFile } from "fs/promises";
import { readFileSync } from "fs";
import papaparse from "papaparse";

const { parse, unparse } = papaparse;

const TestHelper = helper();

//const setNewHelper = async () => {
//  jest.resetModules();
//  const helper = await import("./helpers");
//  TestHelper = helper.default();
//};

interface TestFile {
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

function getTestData(): TestFile[] {
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
}

const results: { TestFile: TestFile; Result: Result }[] = [];
const testData: TestFile[] = getTestData()

describe("TKO Processing Performance Measurements", () => {
  let result: any;
  test("Can get Test Data", async () => {
    expect(testData).not.toHaveLength(0);
  });
  // beforeEach(() => {
  //   jest.resetModules();
  //   setNewHelper();
  // });
  test.each(testData)(`%o`, async file => {
    result = await TestHelper.processTestFile(file.fileName, file.calibration)!;
    expect(result.result).not.toHaveLength(0);
    expect(result.scannedResult).toBe(file.Scanned);
    const matchedTemps = file.realTemps.filter(temp => {
      return Math.abs(result.thermalReading - temp) < 2;
    });
    expect(matchedTemps).not.toHaveLength(0);
    results.push({ TestFile: file, Result: result });
  });
});
afterAll(() => {
  results.forEach(res => {
    delete res.Result.result;
  });
  const finalRes = results.map(({ TestFile, Result }) => ({
    ...TestFile,
    ...Result
  }));
  const csv = unparse(finalRes);
  writeFile(
    `${testFiles}/../profile_logs/profile-log-${new Date().toISOString()}.csv`,
    csv
  );
});
