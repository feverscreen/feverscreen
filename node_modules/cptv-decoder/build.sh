npm run build-webpack
npm run build-node
cp ./pkg/package_fixed.json ./pkg/package.json
wasm-opt -Oz ./pkg/index_bg.wasm -o ./pkg/index_bg.wasm
