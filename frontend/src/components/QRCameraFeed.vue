<template>
  <div class="container">
    <video ref="videoStream" :src-object.prop.camel="stream" autoplay></video>
    <canvas ref="videoCanvas" hidden></canvas>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import jsQR from "jsqr";

@Component
export default class QRVideo extends Vue {
  stream = {} as MediaStream;

  $refs!: {
    videoStream: HTMLVideoElement;
    videoCanvas: HTMLCanvasElement;
  };

  async mounted() {
    // Start video camera
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
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
        if (qr !== null && qr.data !== "") {
          console.log(qr);
        }
      }
    }
    requestAnimationFrame(this.loadFrame);
  }
}
</script>
