<template>
  <transition name="fade">
    <div v-show="streamLoaded" class="video-container">
      <video
        class="video-canvas"
        ref="videoStream"
        :src-object.prop.camel="stream"
        autoplay
      ></video>
    </div>
  </transition>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { ObservableDeviceApi as DeviceApi } from "@/main";
import QrScanner from "qr-scanner";

QrScanner.WORKER_PATH = "../qr-scanner-worker.min.js";

@Component
export default class QRVideo extends Vue {
  @Prop({ required: true }) setQRCode!: (code: string | null) => void;
  stream = {} as MediaStream;
  timeQRFound = 0;
  streamLoaded = false;
  qrScanner: QrScanner | undefined = undefined;

  $refs!: {
    videoStream: HTMLVideoElement;
    videoCanvas: HTMLCanvasElement;
  };

  get hasVideoLoaded(): boolean {
    if (!this.$refs.videoStream) {
      return false;
    }
    return (
      this.$refs.videoStream.readyState ===
      this.$refs.videoStream.HAVE_FUTURE_DATA
    );
  }

  async mounted() {
    try {
      this.$refs.videoStream.oncanplay = () => {
        this.streamLoaded = true;
      };
      const camera = await QrScanner.listCameras(true);
      this.qrScanner = new QrScanner(
        this.$refs.videoStream,
        (result) => {
          this.setQRCode(result);
        },
        undefined,
        undefined,
        camera[0].id
      );
      this.qrScanner.start();
    } catch (e) {
      console.error(e);
    }
  }
  destroy() {
    if (this.qrScanner) {
      this.qrScanner.destroy();
      this.streamLoaded = false;
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
  transition: opacity 0.6s;
  transition: opacity 0.6s;
}

.video-canvas .sqs-video-icon {
  display: none;
}
</style>
