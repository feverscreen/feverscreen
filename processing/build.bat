@ECHO OFF
REM Also build as --web and export to feverscreen.github.io
set RUSTFLAGS=-A unused_variables -A unused_assignments -A dead_code -A unused_imports
REM  -- -Z timings
wasm-pack build --target web --out-dir pkg-web -- --features=perf-profiling,output-mask-shapes
echo a|Xcopy /E /I .\pkg-web\*.ts ..\..\feverscreen.github.io\processing\ >nul 2>&1
echo a|Xcopy /E /I .\pkg-web\*.json ..\..\feverscreen.github.io\processing\ >nul 2>&1
echo a|Xcopy /E /I .\pkg-web\*.js ..\..\feverscreen.github.io\processing\ >nul 2>&1
echo a|Xcopy /E /I .\pkg-web\*.wasm ..\..\feverscreen.github.io\processing\ >nul 2>&1

wasm-pack build --target no-modules --out-dir pkg-no-modules
echo a|Xcopy /E /I .\pkg-no-modules\tko_processing_bg.wasm ..\frontend\public\ >nul 2>&1
REM Copy other files and append export
echo a|Xcopy /E /I .\pkg-no-modules\*.ts ..\frontend\processing\ >nul 2>&1
echo a|Xcopy /E /I .\pkg-no-modules\package.json ..\frontend\processing\ >nul 2>&1
echo export default wasm_bindgen;>>.\pkg-no-modules\tko_processing.js
echo a|Xcopy /E /I .\pkg-no-modules\*.js ..\frontend\processing\ >nul 2>&1

REM wasm-pack build --target nodejs --out-dir pkg-nodejs
REM echo a|Xcopy /E /I .\pkg-nodejs\smooth_bg.wasm ..\feverscreen\frontend\src\tests\smooth\
REM Copy other files and append export
REM echo a|Xcopy /E /I .\pkg-nodejs\*.ts ..\feverscreen\frontend\src\tests\smooth\
REM echo a|Xcopy /E /I .\pkg-nodejs\package.json ..\feverscreen\frontend\src\tests\smooth\
REM echo a|Xcopy /E /I .\pkg-nodejs\*.js ..\feverscreen\frontend\src\tests\smooth\
