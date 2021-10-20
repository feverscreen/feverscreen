# Vue Frontend

Used on device end, handling user interaction and feeding video stream to backend displaying the temperature output for the user.

## Project setup
```bash
npm install
```
### Compiles and hot-reloads for development

```bash
npm run serve
```

### Compiles and minifies for production

```bash
npm run build
```

### Lints and fixes files

```bash
npm run lint
```

## Testing

### Manual Testing

#### Website

Local cptv files can played to test any changes by placing the file into [public/cptv](./public/cptv-files) and going to the url:
`
 http://localhost:8080/?cptvfile=NameOfFile
`
If a device is connected to the network you can use set it's ip within [src/camera.ts](src/camera.ts) to have the web interface connect.

#### Android

Finally, if you wish to run it within the android device you can use Android Debug Bridge to proxy localhost:8080 to the device. [Android SDK Platform](https://developer.android.com/studio/releases/platform-tools) Tools will be required for adb.

Start by connecting the device by USB (Enable USB Debugging if not already) and run the following

```bash
adb tcpip 5555
adb connect 192.168.X.X:5555
```

Where *adb connect 192.168.X.X* is the ip of the device.
Navigate to [chrome://inspect](chrome://inspect) and you should see a new Remote Target, we can now portforward localhost:8080 to port 8080. Allowing it to be run on the Android device browser.
### Integration Tests

```bash
npm t # Runs Quick Jest Tests
npm run test:benchmark # Runs profiling tests
npm run test:fp # Runs false positives tests
```

### Profiling
Cacophony Browse currently holds the files for profiling so an account is required to gather the videos. Within _temp-readings.csv_ contains the real readings which are compared with the video recordings found in _tko-test-data.csv_ (Any csv file containing cacophony recording link & device name works) with _src/test/TestFile.ts_ pulling recordings and matching for testing purposes.

#### Acquire Test Files

```bash
npm run test:data -- -f ./tko-test-data.csv -u example@gmail.com
```

#### Run Profile

```bash
npm run test:benchmark
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).
