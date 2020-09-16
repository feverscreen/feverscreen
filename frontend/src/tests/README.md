#Running tests

Make sure that you have a `cptv-files` folder in `/frontend/public/`, with some source CPTV files to be tested.

Enter this folder (`/frontend/src/tests/`) and `npm i` if this is the first time you're running tests.

To run tests run `npm run test`.

Test cases are currently listed in `test-cases.ts`.

The test config structure currently looks like this, and describes frame-ranges for each test file where an array
of assertion functions can be run against the output of the test analysis results for each frame.

These assertions could be things like "A person entered", "A screening event happened, and the temperature was X degrees".

```
const TestCases: TestCasesConfig = {
 "YOUR_FILE_HERE.cptv": {
   length: 215,
   frames: {
     "0-32": [noFaces],
     "33-37": [oneFace, notFrontFacing], // Enter event
     "38-64": [oneFace, frontFacing], // Ready to scan event
     "65-117": [noFaces], // Exit event
     "118-120": [oneFace, notFrontFacing], // Enter event
     "121-177": [oneFace, frontFacing], // Ready to scan event
     "178-186": [oneFace, notFrontFacing],
     "186-214": [noFaces] // Exit event.
   }
 }
}
```
