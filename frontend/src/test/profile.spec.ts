import helper, { testFiles, Result } from "./helpers";
import { writeFile } from "fs/promises";
import { readFileSync } from "fs";
import papaparse from "papaparse";

const { parse, unparse } = papaparse;

const TestHelper = helper();

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

type result = { TestFile: TestFile; Result: Result };

function getAverages(results: result[]) {
  let addedCount = 1;
  const averages = results.reduce(
    (averages, res) => {
      const { thermalReading, secondsToMeasure } = res.Result;
      if (averages.averageTemp === 0)
        return {
          averageTemp: res.Result.thermalReading,
          averageSeconds: res.Result.secondsToMeasure
        };
      if (thermalReading === 0) return averages;
      addedCount += 1;
      averages.averageTemp = averages.averageTemp + thermalReading;
      averages.averageSeconds = averages.averageSeconds + secondsToMeasure;
      return averages;
    },
    { averageTemp: 0, averageSeconds: 0 }
  );
  averages.averageTemp = averages.averageTemp / addedCount;
  averages.averageSeconds = averages.averageSeconds / addedCount;
  return averages;
}

function calcFailRate(results: result[]) {
  const failed = results.reduce((count: number, res: result) => {
    const noRealTemp = res.TestFile.realTemps[0] === 0;
    const hasTestTemp = res.Result.thermalReading !== 0;
    if (noRealTemp && !hasTestTemp) {
      count += 1;
      return count;
    }
    return count;
  }, 0);
  const failAvg = failed / results.length;
  return { failed, failAvg };
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

const results: result[] = [];
const testData: TestFile[] = getTestData();

describe("TKO Processing Performance Measurements", () => {
  test("Can get Test Data", async () => {
    expect(testData).not.toHaveLength(0);
  });
  testData.forEach(file => {
    test(`Process ${file.fileName}`, async () => {
      const result: any = await TestHelper.processTestFile(
        file.fileName,
        file.calibration
      );
      results.push({ TestFile: file, Result: result });
      expect(result.result).not.toHaveLength(0);
      expect(result.scannedResult).toBe(file.Scanned);
      if (file.realTemps.length > 0) {
        const matchedTemps = file.realTemps.filter(temp => {
          return Math.abs(result.thermalReading - temp) < 2;
        });
        expect(matchedTemps).not.toHaveLength(0);
      }
    });
  });
  afterAll(async () => {
    const averages = getAverages(results);
    const failRate = calcFailRate(results);
    results.forEach(res => {
      delete res.Result.result;
    });
    const finalRes = results.map(({ TestFile, Result }) => ({
      ...TestFile,
      ...Result
    }));
    const csv = unparse(finalRes);
    const StatsHeaders = [
      "Average Temp",
      "Average Time",
      "Total Failed",
      "Percentage Failed"
    ];

    const avgCsv = unparse([{ ...averages, ...failRate }]);
    const fileName = `profile-log-${new Date().toISOString()}.csv`;
    console.log(
      `Average Temp: ${averages.averageTemp} Average Seconds: ${averages.averageSeconds}`
    );
    console.log(`Writing Profile Log: ${fileName}`);
    await writeFile(
      `${testFiles}/../profile_logs/${fileName}`,
      csv + "\n" + avgCsv
    );
  });
});
