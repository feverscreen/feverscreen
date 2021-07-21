<template>
  <div class="video-container">
    <video
      ref="videoStream"
      :src-object.prop.camel="stream"
      autoplay
      hidden
    ></video>
    <canvas class="video-canvas" ref="videoCanvas"></canvas>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import jsQR, { QRCode } from "jsqr";

@Component
export default class QRVideo extends Vue {
  @Prop({ required: true }) setQRCode!: (
    code: QRCode | null,
    duration?: number,
    dimensions?: { height: number; width: number }
  ) => void;
  stream = {} as MediaStream;
  timeQRFound = 0;

  $refs!: {
    videoStream: HTMLVideoElement;
    videoCanvas: HTMLCanvasElement;
  };

  async mounted() {
    // Start video camera
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      requestAnimationFrame(this.loadFrame);
    } catch (e) {
      console.error(e);
    }
  }

  loadFrame() {
    const video = this.$refs.videoStream;
    video;
    const { readyState, HAVE_ENOUGH_DATA } = video;
    if (readyState === HAVE_ENOUGH_DATA) {
      const ratio = video.videoHeight / video.videoWidth;
      const width = 550;
      const height = width * ratio;
      this.$refs.videoCanvas.width = width;
      this.$refs.videoCanvas.height = height;
      const canvas = this.$refs.videoCanvas;
      const canvasContext = canvas.getContext("2d");

      canvasContext?.drawImage(video, 0, 0, width, height);
      const image = canvasContext?.getImageData(0, 0, width, height);

      if (image) {
        const qr = jsQR(image.data, image.width, image.height);
        const timePassedWithout = Math.floor(
          (Date.now() - this.timeQRFound) / 1000
        );

        if (qr) {
          if (qr.data !== "") {
            console.log(qr);
            this.setQRCode(qr, timePassedWithout, {
              width: video.videoWidth,
              height: video.videoWidth,
            });
          }
        }
      }
    }
    requestAnimationFrame(this.loadFrame);
  }
}
</script>
<style lang="scss" scoped>
.video-container {
  position: absolute;
  z-index: 1;
  top: 200px;
  left: 10px;
}
.video-canvas {
  border-radius: 3em;
  &::after {
    content: "";
    position: absolute;
    height: 100%;
    width: 100%;
    left: 0%;
    border-radius: 3em;
    filter: blur(2px);
    mask-image: linear-gradient(
      rgb(0, 0, 0) 2%,
      transparent 25%,
      transparent 80%,
      rgb(0, 0, 0) 100%
    );
  }
}
</style>
