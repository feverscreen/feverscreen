import { readdir as readdirAsync } from "fs";
import { Worker } from "worker_threads";
import { promisify } from "util";
import { performance } from "perf_hooks";
import { cpus } from "os";
const readdir = promisify(readdirAsync);

(async function tests() {
  const start = performance.now();
  process.chdir("../../public/cptv-files");
  const files = await readdir("./");
  const cptvFiles = files.filter(file => file.endsWith(".cptv"));

  // Setup a worker pool to test files in parallel.
  const workers = [];
  let hasError = false;
  // We're assuming hyper-threading here, so divide by two for number of physical cores.
  for (let i = 0; i < cpus().length / 2; i++) {
    workers.push(
      new Promise((resolve, reject) => {
        const worker = new Worker("../../src/tests/test-worker-entrypoint.mjs");
        worker.on("message", async ({ message, result }) => {
          if (message === "ready") {
            if (result !== null) {
              if (result.success) {
                console.warn(result.err);
              } else {
                console.error("Error:", result.err);
                hasError = true;
              }
            }
            const nextFile = cptvFiles.pop();
            if (nextFile) {
              worker.postMessage({ file: nextFile });
            } else {
              resolve();
            }
          } else {
            console.log(message, result);
          }
        });
      })
    );
  }
  await Promise.all(workers);
  console.log(
    `Processing all files took ${Math.round(performance.now() - start)}ms`
  );
  process.exit(0);
})();
