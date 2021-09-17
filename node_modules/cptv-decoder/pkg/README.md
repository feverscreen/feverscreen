# CPTV Player

This is a decoder for CPTV files written in Rust and compiled to Web Assembly.
This is a *streaming* player, so it can start decoding the CPTV file as soon as
some bytes have arrived from the network.

It has a minimal and relatively static memory footprint, and does its work in a Worker thread.

Frames are *raw* `Uint16Array`s, and each frame includes a min and max value for the frame, 
to aid in normalisation for display.  It is the responsibility of the caller to keep track of
normalisation range across the whole clip, and to retain any frame information returned.

## Usage: Browsers via webpack:
Install:
`npm i https://github.com/TheCacophonyProject/cptv-rs`

You may need to add this snippet to your webpack config to stub out the modules referenced for usage via nodejs
```
resolve: {
  fallback: {
    fs,
    module,
  }
}
```
You also may need to install webpack "worker-loader".

```
import {CptvDecoder, renderFrameIntoFrameBuffer, ColourMaps} from "cptv-decoder";
const decoder = new CptvDecoder();
(async function() {
    const loadedPlayer = await decoder.initWithCptvUrlAndKnownSize(<url to cptv file>, <expected file size>);
    if (loadedPlayer !== true) {
        // playerContext is an error string
        return;
    }
    
    // Load the player and all the draw frames.
    
    const header = await decoder.getHeader();   
    let totalFrames = false;
    const frames = [];
    while (!totalFrames) {
      const frame = await cptvDecoder.getNextFrame();
      if (frame === null) {
        break;
      }
      frames.push(frame);
      totalFrames = await cptvDecoder.getTotalFrames();    
    }
    
    console.assert(frames.length !== 0);
    
    // Draw the first frame to a canvas:
    
    const frame = frames[0];   
    
    // Create a backing buffer (can re-use for future frames)
    const frameBuffer = new Uint8ClampedArray(
      header.width * header.height * 4
    );
    const min = frame.meta.imageData.min;
    const max = frame.meta.imageData.max;
    
    // Render the frame into the buffer using a colourmap, and the min/max
    // of the frame to make sure it can be normalised properly.
    const defaultColourmap = Colourmaps[0][1];
    renderFrameIntoFrameBuffer(
      frameBuffer,
      frame.data,
      defaultColourmap,
      min,
      max
    );
    
    // Create a canvas element and draw the frame buffer into it.
    const canvas = document.createElement("canvas");
    document.body.appendChild(canvas);
    const context = canvas.getContext("2d");
    context.putImageData(
      new ImageData(frameBuffer, header.width, header.height),
      0,
      0
    );
    
}()); 
```

## Usage: NodeJS

Install:
`npm i https://github.com/TheCacophonyProject/cptv-rs`

```
// Scan the file without unpacking individual frames, and return the header with a
// duration in seconds for the file.

import {CptvDecoder} from "../index.js";

(async function() {
  const start = performance.now();
  const file = "<your cptv file>";
  const decoder = new CptvDecoder();
  const metadata = await decoder.getFileMetadata(new URL(file, import.meta.url).pathname);
  decoder.close();
  console.log("Metadata", metadata);
  console.log("Duration (seconds)", metadata.duration);
})();

```

## Building the wasm from source

You need to have the Rust compiler and wasm-pack installed to build from source.
Get the Rust compiler by following the instructions here: `https://rustup.rs/`

Get wasm-pack here: `https://rustwasm.github.io/wasm-pack/`

Compile the wasm: `npm run build`
