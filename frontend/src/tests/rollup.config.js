import { wasm } from '@rollup/plugin-wasm';
export default {
  input: 'tests-main.js',
  output: {
    file: 'tests-bundle.js',
    format: 'cjs'
  },
  plugins: [wasm()]
};
