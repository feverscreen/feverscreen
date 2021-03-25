import { wasm } from "@rollup/plugin-wasm";
export default [
  {
    input: "tests-main.js",
    output: {
      file: "tests-main.js",
      format: "cjs"
    }
  },
  {
    input: "test-cptv-worker.js",
    output: {
      file: "test-cptv-worker.js",
      format: "cjs"
    },
    plugins: [wasm()]
  }
];
