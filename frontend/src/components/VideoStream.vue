<template>
  <div id="video-stream-container">
    <canvas
      ref="camera-stream"
      id="camera-stream"
      width="160"
      height="120"
    ></canvas>
    <canvas id="debug-overlay" ref="debug-overlay"></canvas>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { Frame } from "@/camera";

@Component
export default class VideoStream extends Vue {
  @Prop() public frame!: Frame;

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
</style>
