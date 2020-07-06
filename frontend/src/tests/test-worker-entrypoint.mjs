// This is the starting point for running tests.
// It includes opencv.js into the global scope so that bundlers/transpilers don't need to deal with
// such a massive file.

import cv from "../../public/opencv.js";
import runTest from "./test-cptv-worker.js";
import {parentPort} from "worker_threads";
global.cv = cv;
parentPort.postMessage({ message: "ready", result: null });
parentPort.on("message", async (data) => {
  const result = await runTest(data);
  parentPort.postMessage({ message: "ready", result });
});
