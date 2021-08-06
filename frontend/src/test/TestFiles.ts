import { readFile, writeFile, access } from "fs/promises";
import readline from "readline";
import fetch, { RequestInit } from "node-fetch";
import { parse, unparse, ParseResult, ParseConfig } from "papaparse";
import argv from "minimist";
import Bottleneck from "bottleneck";

interface CSVItem {
  Id: string;
  Type: string;
  Group: string;
  Device: string;
  Station: string;
  Date: string;
  Time: string;
  Latitude: number;
  Longitude: number;
  Duration: number;
  URL: string;
  Scanned: string;
  Feature: Features[];
  Notes: string;
  "Start Time": string;
}

interface TempResult {
  Device: string;
  "Screened Temp C": string;
  Time: string;
}

interface Temp {
  temp: number;
  date: Date;
}

interface WrittenRecords {
  Scanned: string;
  Feature: Features[];
  URL: string;
  Id: string;
  date: Date;
  Device: string;
  Duration: number;
  FileName: string;
  SaltDevice: string;
}

interface Calibration {
  reft: { N: number };
  tsc: { S: string };
  calt: { N: number };
  minf: { N: number };
  uid: { S: string };
}

enum Features {
  LongTime,
  LongHair,
  Hat,
  Glasses,
  Far,
  Close,
  Short,
  Tall,
  StandingInFront
}

// Download csv from https://docs.google.com/spreadsheets/d/1Mj58ppbCQTw5OgcSks7Op6nxj4Rdw259uhBPQkUaO0Y or similar file.
// Processes files given csv containing URL, Scanned("Amount of people that attempted scanning"), and Feature
const CACOPHONY_API = "https://api.cacophony.org.nz";
const CALIBRATION_API = (deviceId: string) =>
  `https://3pu8ojk2ej.execute-api.ap-southeast-2.amazonaws.com/default/getCalibrationByDevice/${deviceId}`;
const TEST_FILE_DIR = `${__dirname}/test_files/`;

const SaltDevices: Record<string, string> = {
  TKO8: "fs-1220",
  TKO11: "fs-1228",
  TKO13: "fs-1217",
  TKO16: "fs-1216",
  "manually-moral-bonefish": "fs-1204"
};

const months: Record<string, number> = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11
};

const limiter = new Bottleneck({ maxConcurrent: 1, minTime: 20 });

const checkExt = (ext: string) => (file: string) =>
  file
    .split(".")
    .pop()
    ?.toLowerCase() === ext.toLowerCase();

function reduceObjsToCertainKeys<T = Record<string, any>>(
  objs: T[],
  keys: string[]
): T[] {
  return objs.map(
    (obj: Record<string, any>) =>
      keys.reduce((a: Record<string, any>, c: string) => {
        a[c] = obj[c];
        return a;
      }, {} as Record<string, any>) as T
  );
}

async function checkIsDuplicate(fileName: string) {
  try {
    await access(`${TEST_FILE_DIR}${fileName}`);
    return true;
  } catch (e) {
    return false;
  }
}

// https://api.cacophony.org.nz/#api-Authentication-AuthenticateUser
async function getUserToken(username: string, password: string) {
  try {
    const header: RequestInit = {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({
        nameOrEmail: username,
        password
      })
    };
    const res = await fetch(`${CACOPHONY_API}/authenticate_user`, header);
    const authUser = await res.json();
    if (authUser.success === false) {
      throw new Error(authUser.messages);
    } else {
      return authUser;
    }
  } catch (e) {
    console.error(`getUserToken ${e}`);
    process.exit();
  }
}

// https://api.cacophony.org.nz/#api-Recordings-GetRecording
async function getRecording(
  authToken: string,
  id: string
): Promise<
  | {
      recording: {
        id: string;
        Device: { devicename: string };
        devicename: string;
        duration: string;
      };
      downloadRawJWT: string;
    }
  | undefined
> {
  try {
    const header = {
      method: "GET",
      headers: { Authorization: authToken }
    };
    const res = await fetch(`${CACOPHONY_API}/api/v1/recordings/${id}`, header);
    const recording = await res.json();
    return recording;
  } catch (e) {
    console.error(`getUserToken Error: ${e}`);
    return undefined;
  }
}

// https://api.cacophony.org.nz/#api-SignedUrl-GetFile
async function getRecordingData(jwt: string) {
  try {
    const url = new URL(`${CACOPHONY_API}/api/v1/signedUrl`);
    url.searchParams.append("jwt", jwt);
    const res = await fetch(url);
    const file = await res.buffer();
    return file;
  } catch (e) {
    console.error(`getUserToken Error: ${e}`);
  }
}

function recordingIdFromUrl(url: string): string {
  const id = url.split("/")?.pop();
  return id ? id : "";
}

function createFileName(id: string, device: string, date: Date) {
  return `${device}-${id}-${date.toISOString()}.cptv`;
}

function parseReadingDates(date: string, time: string): Date {
  const [month, day, year] = date.split(" ").slice(2);
  const [hours, minutes, seconds] = time.split(":").map(val => Number(val));
  const parsedDate = new Date(
    Number(year),
    months[month],
    Number(day),
    hours,
    minutes,
    seconds
  );
  return parsedDate;
}

async function writeRecordings(
  user: string,
  pass: string,
  records: CSVItem[]
): Promise<WrittenRecords[]> {
  const authUser = await getUserToken(user, pass);
  const writttenRecords = await Promise.all(
    records
      .map(({ URL, ...rest }) => ({
        ...rest,
        Id: recordingIdFromUrl(URL),
        URL
      }))
      .filter(({ Id }) => Id !== "")
      .map(async ({ Id, Device, Duration, Date: date, Time, ...rest }) => {
        // Get Recording Token Info
        const [day, month, year] = date.split("/").map(val => Number(val));
        const [hour, minute, second] = Time.split(":").map(val => Number(val));
        const parsedDate = new Date(year, month - 1, day, hour, minute, second);
        const info = {
          ...rest,
          Id,
          date: parsedDate,
          Device,
          Duration,
        };

        const device =
          Device in SaltDevices ? SaltDevices[Device] : Device;
        const FileName = createFileName(Id, device, parsedDate);
        const isDuplicate = await checkIsDuplicate(FileName);
        if (!isDuplicate) {
          try {
            const file = await limiter.schedule(async () => {
              const info = await getRecording(authUser.token, Id);
              if (info) {
                return getRecordingData(info.downloadRawJWT);
              }
            });
            if (file) {
            console.log(`Writing ${TEST_FILE_DIR}${FileName} video...`);
            writeFile(`${TEST_FILE_DIR}${FileName}`, Buffer.from(file));
            } else {
              throw Error("No Recording Data")
          }
          } catch (e) {
            console.error(`Could not write ${FileName}: ${e}`);
          }
        } else {
          console.log(
            `Skip writing ${TEST_FILE_DIR}${FileName} as already exists...`
          );
        }
        return { FileName, SaltDevice: device, ...info } as WrittenRecords;
      })
  );
  return writttenRecords.filter(
    (val: WrittenRecords | undefined) => val !== undefined
  ) as WrittenRecords[];
}

const getCalibration = async (device: string) => {
  const request = fetch(CALIBRATION_API(device), {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  });
  const response = await request;

  if (response.status === 200) {
    const body = await response.json();
    return body;
  } else {
    console.error(response);
  }
};

const parsePromise = <T>(
  input: string | File | NodeJS.ReadableStream,
  config?: ParseConfig<T>
): Promise<ParseResult<T>> => {
  return new Promise(res => {
    parse(input, {
      ...config,
      complete: file => {
        res(file);
      }
    });
  });
};

const matchRealTemps = (
  Temps: Record<string, Temp[]>,
  recording: WrittenRecords
) => {
  const TimeLeeway = Math.max(recording.Duration - 8.5, 1);
  recording.Device =
    recording.Device in SaltDevices
      ? SaltDevices[recording.Device]
      : recording.Device;
  const device = recording.Device;

  if (device in Temps) {
    const realTemps = Temps[device]
      .filter(temp => {
        const timeDiff =
          Math.abs(recording.date.getTime() - temp.date.getTime()) / 1000;
        return timeDiff < TimeLeeway;
      })
      .map(res => res.temp);
    return realTemps;
  }
  return [];
};

const matchCalibration = (
  calibrations: Record<string, Calibration[]>,
  device: string,
  date: Date
) => {
  const defaultCali = 37;
  if (!(device in calibrations)) return defaultCali;
  const calibration = calibrations[device]
    .map(({ tsc, ...rest }) => {
      // Date Example: 2020-11-02T21_46_43_966Z
      const [dateStr, time] = tsc.S.split("T");
      const [year, month, day] = dateStr.split("-").map(val => Number(val));
      const [hour, minute, second] = time
        .replace("Z", "")
        .split("_")
        .map(val => Number(val));
      const date = new Date(year, month - 1, day, hour, minute, second);
      // UTC to NZST
      date.setTime(date.getTime() + 12 * 60 * 60 * 1000);
      return { date, ...rest };
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .find(val => date.getTime() > val.date.getTime());
  if (calibration === undefined) {
    return defaultCali;
  }
  return calibration.calt.N;
};

async function run() {
  const args = argv(process.argv.slice(2));
  const isCSV = checkExt("csv");

  if (!args.f || !args.u) {
    console.error(
      "Please provide the csv file in as an argument & Cacophony Browse Login Credentials\n"
    );
    console.log(
      "eg. npm run test:data -- -f ./TKO_TEST_FILES.CSV -u EXAMPLE_USER"
    );
    return;
  } else if (!isCSV(args.f)) {
    console.error("File must be a valid csv file");
    return;
  }
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  const user = args.u;
  console.log(`Please input password for ${user}:`);
  const line = rl[Symbol.asyncIterator]();
  const lineVal = await line.next();
  const pass = lineVal.value as string;
  const file = await readFile(args.f, "utf8");
  console.log(`Reading ${args.f} to get Test Data...`);

  const testFile = await parsePromise<CSVItem>(file, {
    skipEmptyLines: true,
    header: true
  });
  const records: CSVItem[] = testFile.data.filter(
    (obj: CSVItem) => obj.Scanned !== ""
  );

  const writtenRecordings = await writeRecordings(user, pass, records);

  const TempReadingsFile = await readFile(
    `${process.cwd()}/temp-readings.csv`,
    "utf8"
  );

  const res = await parsePromise<TempResult>(TempReadingsFile, {
    skipEmptyLines: true,
    header: true
  });

  try {
    const TempReading = res.data;
    const Temps: Record<string, Temp[]> = {};
    TempReading.forEach(({ Device, "Screened Temp C": temp, Time }) => {
      if (!(Device in Temps)) {
        Temps[Device] = [];
      }
      const [time, date] = Time.split("-");
      Temps[Device].push({
        temp: Number(temp),
        date: parseReadingDates(date, time)
      });
    });

    const calibrationCall = await Promise.all(
      Object.keys(Temps).map(async (device: string) => {
        const res = await getCalibration(device);
        return { [device]: res };
      })
    );
    const calibrations = calibrationCall.reduce(
      (prev: object, curr: object) => ({ ...prev, ...curr }),
      {}
    );

    const keysToKeep = [
      "FileName",
      "Id",
      "Time",
      "date",
      "Device",
      "Duration",
      "Scanned",
      "Feature",
      "Notes",
      "Start Time",
      "URL"
    ];
    const CSVRecords = reduceObjsToCertainKeys<WrittenRecords>(
      writtenRecordings,
      keysToKeep
    ).map(recording => {
      // Based on difference between video recording was made, and temp recorded.
      const realTemps = matchRealTemps(Temps, recording);
      const calibration = matchCalibration(
        calibrations as Record<string, Calibration[]>,
        recording.Device,
        recording.date
      );
      return { ...recording, realTemps, calibration };
    });
    const csv = unparse(CSVRecords);

    console.log(
      `Writing Test Data Info to ${TEST_FILE_DIR}tko-test-files.csv with ${writtenRecordings.length} Records...`
    );
    await writeFile(`${TEST_FILE_DIR}tko-test-files.csv`, csv);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

run();
