<template>
  <div class="container">
    <video ref="videoStream" :src-object.prop.camel="stream" autoplay></video>
    <canvas ref="videoCanvas" hidden></canvas>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import jsQR, { QRCode } from "jsqr";

@Component
export default class QRVideo extends Vue {
  @Prop({ required: true }) setQRCode!: (code: QRCode | null) => void;
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
    const { readyState, HAVE_ENOUGH_DATA } = video;
    if (readyState === HAVE_ENOUGH_DATA) {
      this.$refs.videoCanvas.width = video.videoWidth;
      this.$refs.videoCanvas.height = video.videoHeight;
      const canvas = this.$refs.videoCanvas;
      const canvasContext = canvas.getContext("2d");
      const { width, height } = canvas;
      canvasContext?.drawImage(video, 0, 0, width, height);
      const image = canvasContext?.getImageData(0, 0, width, height);
      if (image) {
        const qr = jsQR(image.data, image.width, image.height);
        const timePassed = Math.floor((Date.now() - this.timeQRFound) / 1000);
        if (qr && qr.data !== "") {
          this.setQRCode(qr);
          this.timeQRFound = Date.now();
        } else if (timePassed === 2) {
          this.timeQRFound = 0;
          this.setQRCode(null);
        }
      }
    }
    requestAnimationFrame(this.loadFrame);
  }
}
</script>
