// This is the starting point for running tests.
import runTest from "./test-cptv-worker.js";
import {parentPort} from "worker_threads";
parentPort.postMessage({ message: "ready", result: null });
parentPort.on("message", async (data) => {
  const result = await runTest(data);
  parentPort.postMessage({ message: "ready", result });
});
