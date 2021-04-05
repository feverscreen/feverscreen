import TestHelper, {testFiles, Result} from "./helpers";
import {readFile, writeFile} from "fs/promises"
import {parse, unparse} from "papaparse";
import {expect} from "chai";
import {AnalysisResult} from "./tko-processing/tko_processing";
import {ScreeningState} from "../types";

interface TestFile {
  fileName: string
  id: number
  date: string
  duration: number
  Scanned: number
  Feature: string
  Notes: string
  URL: string
  "Start Time": string
}

async function getTestData(): Promise<TestFile[]> {
  const testCSV = await readFile(`${testFiles}/tko-test-files.csv`, 'utf8')
  const TestFiles = parse<TestFile>(testCSV, {header: true, transform: (val, field) => field === "Scanned" ? Number(val) : val}).data
  return TestFiles
}
const {processTestFile} = TestHelper()
let TestData: TestFile[];
let results: {TestFile: TestFile, Result: Result}[] = [];

describe("TKO Processing Performance Measurements", () => {
  before(async () => {
    TestData = await getTestData()
  })

  it("measures all test-files", () => {
    new Promise<void>((res) => {
      TestData.forEach((file, index) => {
        let result: Result;
        describe(`Profiling & Testing File Results: ${file.fileName}`, () => {
          before(async () => {
            result = await processTestFile(file.fileName)
          })
          it("can process a file", () => {
            expect(result.result, `${result.result}`).have.length.above(0);
          });
          it("should match expected scanned people", () => {
            expect(result.scannedResult, `${file.URL}`).to.equal(file.Scanned)
          })
        })
        after(() => {
          results.push({TestFile: file, Result: result})
          if (index === TestData.length - 1) res()
        })
      })
    }).then(() => {
      results.forEach((res) => {delete res.Result.result})
      const finalRes = results.map(({TestFile, Result}) => ({...TestFile, ...Result}))
      console.log(finalRes)
      const csv = unparse(finalRes)
      writeFile(`${testFiles}/../profile_logs/profile-log-${new Date().toISOString()}.csv`, csv)
    })
  })
})

