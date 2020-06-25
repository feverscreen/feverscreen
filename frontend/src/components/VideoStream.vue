<template>
  <div id="video-stream-container">
    <canvas
      ref="camera-stream"
      id="camera-stream"
      width="160"
      height="120"
    ></canvas>
    <canvas
      id="debug-overlay"
      ref="debug-overlay"
      width="640"
      height="480"
    ></canvas>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { Frame } from "@/camera";
import { Face } from "@/face";

@Component
export default class VideoStream extends Vue {
  @Prop() public frame!: Frame;
  @Prop() public thermalReference!: ROIFeature | null;
  @Prop() public faces!: Face[];

  @Watch("frame")
  onFrameUpdate() {
    const canvas = this.$refs["camera-stream"] as HTMLCanvasElement;
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    const imgData = context.getImageData(0, 0, canvas.width, canvas.height);
    const frameData = this.frame.frame;
    let max = 0;
    let min = Number.MAX_SAFE_INTEGER;
    for (let i = 0; i < frameData.length; i++) {
      const f32Val = frameData[i];
      if (f32Val < min) {
        min = f32Val;
      }
      if (f32Val > max) {
        max = f32Val;
      }
    }
    for (let i = 0; i < frameData.length; i++) {
      const v = ((frameData[i] - min) / (max - min)) * 255.0;
      const index = i * 4;
      imgData.data[index + 0] = v;
      imgData.data[index + 1] = v;
      imgData.data[index + 2] = v;
      imgData.data[index + 3] = 255;
    }
    context.putImageData(imgData, 0, 0);
  }

  updateDebugCanvas() {
    const canvas = this.$refs["debug-overlay"] as HTMLCanvasElement;
    const canvasWidth = canvas.width * window.devicePixelRatio;
    const canvasHeight = canvas.height * window.devicePixelRatio;
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    const scaleX = canvasWidth / 160;
    const scaleY = canvasHeight / 120;
    for (const face of this.faces) {
      if (!face.roi) {
        console.warn("No roi for face", face);
      } else {
        context.lineWidth = 3;
        context.beginPath();
        context.strokeStyle = "#0000ff";
        const bounds = face.roi as ROIFeature;
        context.rect(
          bounds.x0 * scaleX,
          bounds.y0 * scaleY,
          (bounds.x1 - bounds.x0) * scaleX,
          (bounds.y1 - bounds.y0) * scaleY
        );
        context.stroke();
      }
    }
    const thermalRef = this.thermalReference;
    if (thermalRef) {
      const cx = (thermalRef.x0 + thermalRef.x1) * 0.5 * scaleX;
      const cy = (thermalRef.y0 + thermalRef.y1) * 0.5 * scaleY;
      const radius = thermalRef.width() * 0.5 * scaleX;
      context.beginPath();
      context.arc(cx, cy, radius, 0, 2 * Math.PI, false);
      context.lineWidth = 3;
      context.strokeStyle = "rgba(100, 0, 200, 0.75)";
      context.fillStyle = "rgba(255, 0, 0, 0.25)";
      context.fill();
      context.stroke();
    }
  }

  @Watch("faces")
  onFacesChanged() {
    this.updateDebugCanvas();
  }

  @Watch("thermalReference")
  onThermalReferenceChanged() {
    this.updateDebugCanvas();
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
#video-stream-container {
  position: relative;
  width: 640px;
  height: 480px;
  > canvas {
    position: absolute;
    width: 100%;
    height: 100%;
  }
  #camera-stream {
  }

  #debug-overlay {
    //filter: invert(100%);
    outline: 1px solid yellow;
  }
}
</style>
