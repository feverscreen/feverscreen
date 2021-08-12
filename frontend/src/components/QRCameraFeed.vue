<template>
  <div class="video-container">
    <video
      ref="videoStream"
      :src-object.prop.camel="stream"
      autoplay
      hidden
    ></video>
    <transition name="fade">
      <canvas
        class="video-canvas"
        :class="{
          'stream-loaded': streamLoaded,
          'stream-not-loaded': !streamLoaded,
        }"
        ref="videoCanvas"
      ></canvas>
    </transition>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { QRCode } from "jsqr";
import { ObservableDeviceApi as DeviceApi } from "@/main";
import QRWorker from "worker-loader!../qr-reader";

@Component
export default class QRVideo extends Vue {
  @Prop({ required: true }) setQRCode!: (
    code: QRCode | null,
    duration?: number,
    dimensions?: { height: number; width: number }
  ) => void;
  stream = {} as MediaStream;
  timeQRFound = 0;
  streamLoaded = false;

  $refs!: {
    videoStream: HTMLVideoElement;
    videoCanvas: HTMLCanvasElement;
  };
  private currFrame = 0;
  private screenRate = 8;
  qrworker: Worker = new QRWorker();
  async mounted() {
    // Start video camera
    this.qrworker.onmessage = (message) => {
      const { width, height } = message.data;
      const qr = message.data.qr as QRCode;
      const timePassedWithout = Math.floor(
        (Date.now() - this.timeQRFound) / 1000
      );

      if (qr && qr.data !== "") {
        this.currFrame = 0;
        this.setQRCode(qr, timePassedWithout, {
          width,
          height,
        });
      }
    };
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      requestAnimationFrame(this.loadFrame);
    } catch (e) {
      console.error(e);
      DeviceApi.RegisterQRID = false;
    }
  }
  destroyed() {
    this.qrworker.terminate();
  }
  loadFrame() {
    const video = this.$refs.videoStream;
    if (video) {
      const { readyState, HAVE_ENOUGH_DATA } = video;
      if (readyState === HAVE_ENOUGH_DATA) {
        const ratio = video.videoHeight / video.videoWidth;
        const width = 550;
        const height = width * ratio;
        if (!this.streamLoaded) {
          this.$refs.videoCanvas.width = width;
          this.$refs.videoCanvas.height = height;
        }
        const canvas = this.$refs.videoCanvas;
        const canvasContext = canvas.getContext("2d");

        canvasContext?.drawImage(video, 0, 0, width, height);
        const image = canvasContext?.getImageData(0, 0, width, height);
        this.streamLoaded = true;
        this.currFrame = (this.currFrame + 1) % this.screenRate;
        if (image && this.currFrame === 0) {
          this.qrworker.postMessage({
            image,
            width,
            height,
          });
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
  top: 24%;
  left: 18px;
}
.stream-loaded {
  opacity: 1;
}
.stream-not-loaded {
  opacity: 0;
}
.video-canvas {
  transition: opacity 0.6s;
  transition: opacity 0.6s;
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
