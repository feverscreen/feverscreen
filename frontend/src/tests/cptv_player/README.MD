# CPTV Player

This is a player for CPTV files written in Rust and compiled to Web Assembly.
This is a *streaming* player, so it can start decoding the CPTV file as soon as
some bytes have arrived from the network.

Frames are *raw* `Uint16Array`s, and each frame includes a running tally of the
min and max values seen so far by the decoder, to aid in normalisation for display.
Frames immediately after an FFC event do not contribute to these values.

One limitation is that due to the nature of the current CPTV v2 file format, seeking
to arbitrary offsets in the recording is not possible, since each frame has
a dependency on the previous frame in order to decode.  If you seek to a far future
frame, the player will return once all frames up to that point have been downloaded
and decoded.

There has been some work
done towards a future CPTV v3 file format that would remove this restriction by
inserting I-frames at regular intervals, and including a table-of-contents with
the offsets of these full frames in the file header.

The main non-goal for this library is that it doesn't try to keep track of playback
information.  That is up to the caller.

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

```
import {CptvPlayer} from "cptv-player";
const player = new CptvPlayer();
(async function() {
    const playerContext = await player.initWithCptvUrlAndSize(<url to cptv file>, <expected file size>);
    if (playerContext !== true) {
        // playerContext is an error string
        return;
    }
    const cptvHeader = await player.getHeader();
    
    // Seek to frame 100
    await player.seekToFrame(100);
    const frame = player.getFrameAtIndex(100);
    if (frame !== null) {
        // Frame we asked for actually exists, and we can use it
        const {data, min, max} = frame;
        // Do stuff with frame
    } else {
        // Should be at the end of the stream, and be able to query the total number of frames.
        console.assert(player.getTotalFrames() !== null);
    }       
    
    const frameHeader = frame.getHeaderAtIndex(100);
    // Do stuff with the frame header.
}()); 
```

## Usage: NodeJS

Install:
`npm i https://github.com/TheCacophonyProject/cptv-rs`

```
import {CptvPlayer} from "cptv-player";

(async function() {
  const player = new CptvPlayer();
  const file = "20200925-054728.cptv";
  await player.initWithCptvFile(file);
  const header = await player.getHeader();
  console.log(header);

  // Decode all frames to end of file:
  let frameNum = 0;
  while (player.getTotalFrames() === null || frameNum < player.getTotalFrames() - 1) {
    await player.seekToFrame(frameNum);
    const frameHeader = player.getFrameHeaderAtIndex(frameNum);
    const frame = player.getFrameAtIndex(frameNum);
    frameNum++;
  }
})();
```

## Building the wasm from source

You need to have the Rust compiler and wasm-pack installed to build from source.
Get the Rust compiler by following the instructions here: `https://rustup.rs/`

Get wasm-pack here: `https://rustwasm.github.io/wasm-pack/`

Compile the wasm: `npm run build`

Add `"type": "module"` to the generated `pkg/package.json` file, since wasm-pack doesn't add this, and node needs it.
