import { readFile, writeFile, access } from "fs/promises";
import readline from "readline";
import fetch, { RequestInit } from "node-fetch";
import { parse, unparse, ParseResult, ParseConfig } from "papaparse";
import argv from "minimist";
import Bottleneck from "bottleneck";

interface ScanItem {
  URL: string;
  Scanned: string; // Amount of People that tried to scan
  Feature: Features[];
}

interface TempResult {
  Device: string;
  "Screened Temp C": string;
  Time: string;
}

type Obj<T = any> = {
  [index: string]: T;
};

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

const SaltDevices: any = {
  TKO8: "fs-1220",
  TKO11: "fs-1228",
  TKO13: "fs-1217",
  TKO16: "fs-1216",
  "manually-moral-bonefish": "fs-1204"
};

const months: Obj = {
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

const limiter = new Bottleneck({ maxConcurrent: 1, minTime: 150 });

const checkExt = (ext: string) => (file: string) =>
  file
    .split(".")
    .pop()
    ?.toLowerCase() === ext.toLowerCase();

function reduceObjsToCertainKeys(objs: Obj[], keys: string[]) {
  return objs.map(obj =>
    keys.reduce((a: Obj, c: string) => {
      a[c] = obj[c];
      return a;
    }, {})
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
async function getRecording(authToken: string, id: string) {
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
    return {};
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

async function writeRecordings(
  user: string,
  pass: string,
  records: ScanItem[]
) {
  const authUser = await getUserToken(user, pass);
  return Promise.all(
    records
      .map(({ URL, ...rest }) => ({
        id: recordingIdFromUrl(URL),
        URL,
        ...rest
      }))
      .filter(({ id }) => id !== "")
      .map(async ({ id, ...rest }) => {
        const recordingInfo = await limiter.schedule(() =>
          getRecording(authUser.token, id)
        );
        const {
          id: ID,
          recordingDateTime,
          Device,
          duration
        } = recordingInfo.recording;
        return {
          id: ID,
          date: recordingDateTime,
          device: Device.devicename,
          duration,
          recordingToken: recordingInfo.downloadRawJWT,
          ...rest
        };
      })
      .map(async recordingInfo => {
        const info = await recordingInfo;
        const { id, date, recordingToken } = info;
        const device =
          info.device in SaltDevices
            ? SaltDevices[info.device as string]
            : (info.device as string);
        const fileName = createFileName(id, device, new Date(date));
        const isDuplicate = await checkIsDuplicate(fileName);
        if (!isDuplicate) {
          const file = (await limiter.schedule(() =>
            getRecordingData(recordingToken)
          )) as Buffer;
          try {
            console.log(`Writing ${TEST_FILE_DIR}${fileName} video...`);
            writeFile(`${TEST_FILE_DIR}${fileName}`, Buffer.from(file));
          } catch (e) {
            console.log(`Could not write ${fileName}: ${e}`);
            return undefined;
          }
        } else {
          console.log(
            `Skip writing ${TEST_FILE_DIR}${fileName} as already exists...`
          );
        }
        return { fileName, saltDevice: device, ...info };
      })
      .filter(info => info)
  );
}

const parseReadingDates = (dateStr: string) => {
  const [time, date] = dateStr.split("-");
  const [hours, minutes, seconds]: any = time.split(":");
  const [month, day, year]: any = date.split(" ").slice(2);
  const parsedDate = new Date(
    year,
    months[month],
    day,
    hours,
    minutes,
    seconds
  );
  return parsedDate;
};

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

const matchRealTemps = (Temps: Obj, recording: any) => {
  const TimeLeeway = Math.max(recording.duration - 5.5, 1);

  recording.Device =
    recording.Device in SaltDevices
      ? SaltDevices[recording.Device]
      : recording.Device;
  const device = recording.Device;
  if (device in Temps) {
    const realTemps = Temps[device]
      .filter((temp: any) => {
        const timeDiff =
          Math.abs(recording.Date.getTime() - temp.date.getTime()) / 1000;
        return timeDiff < TimeLeeway;
      })
      .map((res: any) => res.temp);
    return realTemps;
  }
  return [];
};

interface calibration {
  reft: { N: number };
  tsc: { S: string };
  calt: { N: number };
  minf: { N: number };
  uid: { S: string };
}

const matchCalibration = (
  calibrations: Obj<calibration[]>,
  device: string,
  date: Date
) => {
  const defaultCali = 37;
  if (!(device in calibrations)) return defaultCali;
  const calibration = calibrations[device]
    .map(({ tsc, ...rest }) => {
      // Date Example: 2020-11-02T21_46_43_966Z
      const [dateStr, time] = tsc.S.split("T");
      const [year, month, day]: any = dateStr.split("-");
      const [hour, minute, second]: any = time.replace("Z", "").split("_");
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

  const testFile = await parsePromise<ScanItem>(file, {
    skipEmptyLines: true,
    header: true
  });
  const records: ScanItem[] = testFile.data.filter(
    (obj: ScanItem) => obj.Scanned !== ""
  );

  const writtenRecordings: any = await writeRecordings(user, pass, records);

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
    const Temps: Obj<{ temp: number; date: Date }[]> = {};
    TempReading.forEach(({ Device, "Screened Temp C": temp, Time: date }) => {
      if (!(Device in Temps)) {
        Temps[Device] = [];
      }
      Temps[Device].push({ temp: Number(temp), date: parseReadingDates(date) });
    });

    const calibrationCall = await Promise.all(
      Object.keys(Temps).map(async (device: string) => {
        const res = await getCalibration(device);
        return { [device]: res };
      })
    );
    const calibrations = calibrationCall.reduce(
      (prev: Obj, curr: Obj) => ({ ...prev, ...curr }),
      {}
    );

    const keysToKeep = [
      "fileName",
      "id",
      "Time",
      "Date",
      "Device",
      "duration",
      "Scanned",
      "Feature",
      "Notes",
      "Start Time",
      "URL"
    ];
    const CSVRecords = reduceObjsToCertainKeys(
      writtenRecordings,
      keysToKeep
    ).map(recording => {
      // Based on difference between video recording was made, and temp recorded.
      const [day, month, year] = recording.Date.split("/");
      const [hours, minutes, seconds] = recording.Time.split(":");
      recording.Date = new Date(year, month - 1, day, hours, minutes, seconds);
      const realTemps = matchRealTemps(Temps, recording);
      const calibration = matchCalibration(
        calibrations as Obj<calibration[]>,
        recording.Device,
        recording.Date
      );
      return { ...recording, realTemps, calibration };
    });

    const csv = unparse(CSVRecords);
    console.log(csv);
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
