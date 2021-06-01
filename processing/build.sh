#!/usr/bin/env bash
wasm-pack build --target  web --out-dir pkg-web-modules
cp ./pkg-web-modules/tko_processing_bg.wasm ../frontend/public
cp ./pkg-web-modules/*.ts ../frontend/processing
cp ./pkg-web-modules/package.json ../frontend/processing
#echo "export default wasm_bindgen;" >> ./pkg-no-modules/tko_processing.js
# Mac -> $ sed -i '' ... Linux -> $ sed -i -e https://stackoverflow.com/questions/525592/find-and-replace-inside-a-text-file-from-a-bash-command
sed -i '' 's/import.meta.url/process.env.BASE_URL/g' ./pkg-web-modules/tko_processing.js 
cp ./pkg-web-modules/*.js ../frontend/processing

# wasm-pack build --target web --out-dir pkg-web -- --features=perf-profiling,output-mask-shapes,face-thresholding
# cp ./pkg-web/*.* ../feverscreen.github.io/processing

wasm-pack build --target nodejs --out-dir pkg-node
echo "module.exports.reinitialize = function() {
  wasm.__wbindgen_free();

  const wasmModule = new WebAssembly.Module(bytes);
  const wasmInstance = new WebAssembly.Instance(wasmModule, imports);
  wasm = wasmInstance.exports;
}" >> ./pkg-node/tko_processing.js

echo "export function reinitialize(): void;" >> ./pkg-node/tko_processing.d.ts
cp ./pkg-node/*.* ../frontend/src/test/tko-processing/
