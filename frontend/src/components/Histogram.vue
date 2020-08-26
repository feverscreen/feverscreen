<template>
  <div>
    <canvas
      ref="debugCanvas"
      class="debug-canvas"
      width="256"
      height="240"
      @click="setThreshold"
    />
    <div>MIN: {{ minC }}</div>
    <div>MAX: {{ maxC }}</div>
    <div>
      RANGE: {{ (max - min).toFixed(2) }},
      {{ (maxC.val - minC.val).toFixed(2) }}
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue, Watch } from "vue-property-decorator";
import { Frame } from "@/camera";
import {
  DegreesCelsius,
  getHistogram,
  temperatureForSensorValue
} from "@/utils";
import { ThermalRefValues } from "@/circle-detection";

@Component
export default class Histogram extends Vue {
  @Prop({ required: true }) frame!: Frame;
  @Prop({ required: true }) thermalReferenceStats!: ThermalRefValues;
  @Prop({ required: true }) calibratedTemp!: DegreesCelsius;

  private min = 0;
  private max = 0;

  $refs!: {
    debugCanvas: HTMLCanvasElement;
  };

  tempForVal(val: number): DegreesCelsius {
    return temperatureForSensorValue(
      this.calibratedTemp.val,
      val,
      this.thermalReferenceStats.mean
    );
  }

  get minC(): DegreesCelsius {
    return this.tempForVal(this.min);
  }

  get maxC(): DegreesCelsius {
    return this.tempForVal(this.max);
  }

  mounted() {
    this.updateCtx();
  }

  setThreshold(e: MouseEvent): number {
    e.preventDefault();
    return 0;
  }

  updateCtx() {
    // TODO(jon): Put this in the main loop, so that we don't have a frame of delay.
    const data = this.frame.smoothed;
    const numBuckets = 16;
    const { histogram, min, max } = getHistogram(data, numBuckets);
    this.min = min;
    this.max = max;

    const thermalRefBucketLow = Math.floor(
      ((this.thermalReferenceStats.min - min) / (max - min)) * numBuckets
    );
    const thermalRefBucketHigh = Math.floor(
      ((this.thermalReferenceStats.max - min) / (max - min)) * numBuckets
    );
    const thermalRefBucketMean = Math.floor(
      ((this.thermalReferenceStats.mean - min) / (max - min)) * numBuckets
    );
    const thermalRefBucketMedian = Math.floor(
      ((this.thermalReferenceStats.median - min) / (max - min)) * numBuckets
    );
    ///console.log(thermalRefBucket, histogram[thermalRefBucket]);
    {
      const canvas = this.$refs.debugCanvas;
      const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const max = Math.max(...histogram);
      for (let x = 0; x < histogram.length; x++) {
        if (x === thermalRefBucketMean) {
          ctx.fillStyle = "purple";
        } else if (x === thermalRefBucketMedian) {
          ctx.fillStyle = "orange";
        } else if (x >= thermalRefBucketLow && x <= thermalRefBucketHigh) {
          ctx.fillStyle = "yellow";
        } else {
          ctx.fillStyle = "red";
        }
        const bucket = histogram[x];
        const v = (bucket / max) * canvas.height;
        const xx = (canvas.width / numBuckets) * x;
        ctx.fillRect(xx, canvas.height - v, canvas.width / numBuckets, v);
      }
    }
  }

  @Watch("frame")
  draw(prev: Frame, next: Frame) {
    if (
      prev.frameInfo.Telemetry.FrameCount !==
      next.frameInfo.Telemetry.FrameCount
    ) {
      this.updateCtx();
    }
  }
}
</script>

<style scoped lang="scss">
.debug-canvas {
  zoom: 2;
  //border: 1px solid orange;
  background: black;
  image-rendering: pixelated;
}
</style>
