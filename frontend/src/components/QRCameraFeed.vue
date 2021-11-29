<template>
  <div class="video-container">
    <transition name="fade">
      <video
        class="video-canvas"
        v-bind:class="{
          'stream-loaded': streamLoaded,
          'stream-not-loaded': !streamLoaded,
        }"
        ref="videoStream"
        :src-object.prop.camel="stream"
        autoplay
      ></video>
    </transition>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import QrScanner from "qr-scanner";

QrScanner.WORKER_PATH = "../qr-scanner-worker.min.js";

@Component
export default class QRVideo extends Vue {
  @Prop({ required: true }) setQRCode!: (code: string | null) => void;
  @Prop({ required: true }) startScanning!: boolean;
  stream = {} as MediaStream;
  timeQRFound = 0;
  streamLoaded = false;
  qrScanner: QrScanner | undefined = undefined;

  $refs!: {
    videoStream: HTMLVideoElement;
    videoCanvas: HTMLCanvasElement;
  };
  async mounted() {
    try {
      this.$refs.videoStream.oncanplay = () => {
        this.streamLoaded = true;
      };
      const camera = await QrScanner.listCameras(true);
      const cameraId = camera[0].id;
      if (cameraId) {
        this.qrScanner = new QrScanner(
          this.$refs.videoStream,
          (result) => {
            this.setQRCode(result);
          },
          undefined,
          (video: HTMLVideoElement) => ({
            x: 0,
            y: 0,
            width: video.width,
            height: video.height,
          }),
          camera[0].id
        );
      }
    } catch (e) {
      console.error(e);
    }
  }

  destroy() {
    if (this.qrScanner) {
      this.streamLoaded = false;
      this.qrScanner.destroy();
    }
  }

  @Watch("startScanning")
  runScan() {
    if (this.startScanning) {
      this.qrScanner?.start();
    } else {
      this.streamLoaded = false;
      setTimeout(() => {
        this.qrScanner?.stop();
      }, 500);
    }
  }
}
</script>
<style lang="scss" scoped>
.video-container {
  position: absolute;
  z-index: 1;
  top: 9%;
  left: 58px;
  width: 30em;
  height: 38em;
  overflow: hidden;
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
.stream-loaded {
  opacity: 1;
}

.stream-not-loaded {
  opacity: 0;
}

.video-canvas {
  position: relative;
  right: 50%;
  transition: opacity 0.5s;
}
</style>
