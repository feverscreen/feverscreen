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
npm run test:profile
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).
