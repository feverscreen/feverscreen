#!/usr/bin/env bash
wasm-pack build --target no-modules --out-dir pkg-no-modules
cp ./pkg-no-modules/smooth_bg.wasm ../feverscreen/frontend/public
cp ./pkg-no-modules/package.json ../feverscreen/frontend/smooth
cp ./pkg-no-modules/*.ts ../feverscreen/frontend/smooth
echo "export default wasm_bindgen;" >> ./pkg-no-modules/smooth.js
cp ./pkg-no-modules/*.js ../feverscreen/frontend/smooth

wasm-pack build --target web --out-dir pkg-web
cp ./pkg-web/*.* ../feverscreen.github.io/smooth

wasm-pack build --target nodejs --out-dir pkg-node
cp ./pkg-node/*.* ../feverscreen/frontend/src/tests/smooth