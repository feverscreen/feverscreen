// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import viridis from "scale-color-perceptual/rgb/viridis.json";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import plasma from "scale-color-perceptual/rgb/plasma.json";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import magma from "scale-color-perceptual/rgb/magma.json";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import inferno from "scale-color-perceptual/rgb/inferno.json";

import defaultColourmap from "./DefaultColourmap.js";

// Colour maps
const mapRgba = ([r, g, b]) =>
  (255 << 24) | ((b * 255.0) << 16) | ((g * 255.0) << 8) | (r * 255.0);

const Viridis = Uint32Array.from(viridis.map(mapRgba));
const Plasma = Uint32Array.from(plasma.map(mapRgba));
const Inferno = Uint32Array.from(inferno.map(mapRgba));
const Magma = Uint32Array.from(magma.map(mapRgba));
const Default = Uint32Array.from(
  defaultColourmap
    .map(([r, g, b]) => (255 << 24) | (b << 16) | (g << 8) | r)
);
const GreyscaleSquared = new Uint32Array(256);
const Greyscale = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  const inc = i / 255;
  GreyscaleSquared[i] = mapRgba([inc * inc, inc * inc, inc * inc]);
  Greyscale[i] = mapRgba([inc, inc, inc]);
}
export const ColourMaps = Object.freeze(
  [
    ["Default", Default],
    ["Viridis", Viridis],
    ["Plasma", Plasma],
    ["Inferno", Inferno],
    ["Magma", Magma],
    ["Greyscale", Greyscale],
    ["Grayscale<sup>2</sup>", GreyscaleSquared],
  ]
);

export const renderFrameIntoFrameBuffer = (frameBuffer, frameData, colourMap, min, max) => {
  const range = max - min;
  const frameBufferView = new Uint32Array(frameBuffer.buffer);
  for (let i = 0; i < frameBuffer.length; i++) {
    const index = ((frameData[i] - min) / range) * 255.0;
    const indexUpper = Math.ceil(index);
    frameBufferView[i] = colourMap[indexUpper];
  }
};

export const getFrameIndexAtTime = (
  time,
  duration,
  fps,
  totalFramesIncludingBackground = false,
  hasBackgroundFrame = false
) => {
  time = Math.max(0, Math.min(duration, time));
  if (totalFramesIncludingBackground === false) {
    totalFramesIncludingBackground = Math.floor(duration * fps);
  }
  return (
    Math.floor(
      Math.min(totalFramesIncludingBackground, (time / duration) * totalFramesIncludingBackground)
    ) + (hasBackgroundFrame ? -1 : 0)
  );
};
