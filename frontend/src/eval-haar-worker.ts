// NOTE: These classes need to be duplicated here, because the worker needs to be fully self-contained, or webpack hangs...

import { HaarCascade } from "./haar-cascade";
import { evalAtScale } from "./worker-fns";

// @ts-ignore
const ctx: Worker = self as any;
let Cascade: HaarCascade;

ctx.addEventListener("message", event => {
  switch (event.data.type) {
    case "eval":
      {
        const {
          scale,
          frameWidth,
          frameHeight,
          satData
        }: {
          scale: number;
          frameWidth: number;
          frameHeight: number;
          satData: Float32Array[];
        } = event.data;
        const result = evalAtScale(
          scale,
          frameWidth,
          frameHeight,
          satData,
          Cascade
        );
        // @ts-ignore
        ctx.postMessage(result);
      }
      break;
    case "init":
      Cascade = event.data.cascade;
      break;
  }
  return;
});
