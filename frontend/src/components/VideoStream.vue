<template>
  <div
    id="video-stream-container"
    ref="container"
    :class="{ recording: recording }"
  >
    <canvas ref="cameraStream" id="camera-stream" width="160" height="120" />
    <canvas id="debug-overlay" ref="vizOverlay" width="480" height="640" />
    <video-crop-controls
      v-if="canEditCropping && cropEnabled"
      :crop-box="cropBox"
      @crop-changed="gotCropChange"
    />
    <v-btn
      text
      v-if="cropEnabled"
      title="Edit cropping"
      id="toggle-cropping"
      @click="toggleCropping"
      :class="{ on: canEditCropping }"
      dark
    >
      <v-icon>{{ cropIcon }}</v-icon>
    </v-btn>
    <p class="coords" v-if="showCoords">({{ coords.x }}, {{ coords.y }})</p>
  </div>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue, Watch } from "vue-property-decorator";
import { Face } from "@/face";
import VideoCropControls from "@/components/VideoCropControls.vue";
import { CropBox, FaceInfo } from "@/types";
import { ROIFeature } from "@/worker-fns";
import { mdiCrop } from "@mdi/js";

@Component({ components: { VideoCropControls } })
export default class VideoStream extends Vue {
  @Prop() public frame!: Uint16Array;
  @Prop() public faces!: Face[];
  @Prop({ required: true }) public face!: FaceInfo | null;
  @Prop({ required: true }) public cropBox!: CropBox;
  @Prop({ required: true }) public cropEnabled!: boolean;
  @Prop({ default: 1.0 }) public scale!: number;
  @Prop({ default: false }) public drawOverlays!: boolean;
  @Prop({ default: false }) public recording!: boolean;
  @Prop({ default: false }) public showCoords!: boolean;
  private canEditCropping = false;

  $refs!: {
    cameraStream: HTMLCanvasElement;
    vizOverlay: HTMLCanvasElement;
    container: HTMLDivElement;
  };

  get cropIcon() {
    return mdiCrop;
  }

  private coords: { x: number; y: number } = { x: 0, y: 0 };

  mounted() {
    const container = this.$refs.container;
    container.style.width = `${375 * this.scale}px`;
    container.style.height = `${500 * this.scale}px`;

    if (this.showCoords) {
      container.addEventListener("mousemove", this.onMouseMove);
    }

    if (this.frame) {
      this.onFrameUpdate(this.frame);
      this.updateOverlayCanvas();
    }
  }

  onMouseMove(e: MouseEvent) {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = Math.floor(
      Math.min(((e.clientX - rect.x) / rect.width) * 120, 119)
    );
    const y = Math.floor(
      Math.min(((e.clientY - rect.y) / rect.height) * 160, 159)
    );
    this.coords = { x, y };
  }

  beforeDestroy() {
    if (this.showCoords) {
      this.$refs.container.removeEventListener("mousemove", this.onMouseMove);
    }
  }

  updateOverlayCanvas() {
    const underlay = this.$refs.cameraStream;
    const canvas = this.$refs.vizOverlay;
    const canvasWidth = canvas.width * window.devicePixelRatio;
    const canvasHeight = canvas.height * window.devicePixelRatio;
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    if (this.drawOverlays) {
      context.save();
      const scaleX = canvasWidth / (underlay.height * window.devicePixelRatio);
      const scaleY = canvasHeight / (underlay.width * window.devicePixelRatio);
      context.scale(scaleX, scaleY);
      const face = this.face;
      if (face) {
        // Now find the hotspot - only if we have a good lock!
        context.lineWidth = 0.25;
        if (face.isValid) {
          let valid: boolean = face.isValid;
          if (face.headLock >= 1.0) {
            context.strokeStyle = "red";
            context.lineWidth = 0.5;
          } else if (face.headLock === 0.5) {
            context.strokeStyle = "blue";
          } else {
            context.strokeStyle = "orange";
            valid = false;
          }
          if (valid) {
            const point = face.samplePoint;

            context.beginPath();
            context.strokeStyle = "rgba(255, 0, 0, 0.7)";
            context.lineWidth = 1;
            context.arc(point.x - 0.5, point.y - 0.5, 2, 0, Math.PI * 2);
            context.stroke();

            context.beginPath();
            context.moveTo(face.head.bottomLeft.x, face.head.bottomLeft.y);
            context.lineTo(face.head.topLeft.x, face.head.topLeft.y);
            context.lineTo(face.head.topRight.x, face.head.topRight.y);
            context.lineTo(face.head.bottomRight.x, face.head.bottomRight.y);
            context.lineTo(face.head.bottomLeft.x, face.head.bottomLeft.y);
            context.stroke();
          }
        }
        // context.moveTo(face.vertical.bottom.x, face.vertical.bottom.y);
        // context.lineTo(face.vertical.top.x, face.vertical.top.y);
        // context.moveTo(face.horizontal.left.x, face.horizontal.left.y);
        // context.lineTo(face.horizontal.right.x, face.horizontal.right.y);

        // context.moveTo(face.forehead.bottomLeft.x, face.forehead.bottomLeft.y);
        // context.lineTo(
        //   face.forehead.bottomRight.x,
        //   face.forehead.bottomRight.y
        // );
        // context.moveTo(face.forehead.topLeft.x, face.forehead.topLeft.y);
        // context.lineTo(face.forehead.topRight.x, face.forehead.topRight.y);
      }
      context.restore();
    }

    context.save();
    if (this.cropBox) {
      // Update crop-box overlay:
      const overlay = new Path2D();
      const cropBox = this.cropBox;
      context.scale(1, 1);
      const width = canvas.width;
      const height = canvas.height;
      overlay.rect(0, 0, width, height);

      const onePercentWidth = width / 100;
      const onePercentHeight = height / 100;

      const leftInset = onePercentWidth * cropBox.left;
      const rightInset = onePercentWidth * cropBox.right;
      const topInset = onePercentHeight * cropBox.top;
      const bottomInset = onePercentHeight * cropBox.bottom;
      overlay.rect(
        leftInset,
        topInset,
        width - (rightInset + leftInset),
        height - (bottomInset + topInset)
      );
      context.fillStyle = "rgba(0, 0, 0, 0.5)";
      context.fill(overlay, "evenodd");
    }
    context.restore();
  }

  toggleCropping() {
    this.canEditCropping = !this.canEditCropping;
    if (!this.canEditCropping) {
      this.saveCropChanges();
    }
  }

  saveCropChanges() {
    this.$parent.$emit("save-crop-changes");
  }

  @Watch("frame")
  onFrameUpdate(next: Uint16Array) {
    // TODO(jon): Why does this sometimes get called when the smoothed image array is empty?
    const canvas = this.$refs.cameraStream;
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    const imgData = context.getImageData(0, 0, canvas.width, canvas.height);
    const frameData = next;
    let max = 0;
    let min = Number.MAX_SAFE_INTEGER;
    for (let i = 0; i < frameData.length; i++) {
      const u16Val = frameData[i];
      if (u16Val < min) {
        min = u16Val;
      }
      if (u16Val > max) {
        max = u16Val;
      }
    }
    if (min !== Number.MAX_SAFE_INTEGER) {
      const data = new Uint32Array(imgData.data.buffer);
      const range = max - min;
      for (let i = 0; i < data.length; i++) {
        const v = Math.max(
          0,
          Math.min(255, ((frameData[i] - min) / range) * 255.0)
        );
        data[i] = (255 << 24) | (v << 16) | (v << 8) | v;
      }
      context.putImageData(imgData, 0, 0);
    }
  }

  @Watch("face")
  onFaceChanged() {
    this.updateOverlayCanvas();
  }

  @Watch("thermalReference")
  onThermalReferenceChanged() {
    this.updateOverlayCanvas();
  }

  @Watch("cropBox")
  onCropChanged() {
    this.updateOverlayCanvas();
  }

  @Emit("crop-changed")
  gotCropChange(cropBox: CropBox) {
    this.updateOverlayCanvas();
    return cropBox;
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
  margin: 0 auto;
  background: #444;
  position: relative;
  width: 375px;
  height: 500px;

  .coords {
    position: absolute;
    color: white;
  }

  > canvas {
    top: 0;
    left: 0;
    position: absolute;
    width: 100%;
    height: 100%;
  }
  #camera-stream {
    image-rendering: pixelated;
    transform: rotate(90deg) scaleY(-0.75) scaleX(1.333);
  }

  #toggle-cropping {
    position: absolute;
    bottom: 10px;
    right: 10px;
    width: 44px;
    height: 44px;
    cursor: pointer;
    opacity: 0.25;
    > svg {
      pointer-events: none;
      width: calc(44px * 0.8);
      height: calc(44px * 0.8);
      right: 10%;
      top: 10%;
      position: absolute;
    }

    path {
      fill: #777;
    }
    &.on {
      opacity: 1;
      background: rgba(255, 255, 255, 0.1);
    }
    > span {
      display: inline-block;
      color: white;
      text-align: left;
      width: 36px;
      position: absolute;
      left: 10%;
      line-height: 44px;
    }
  }
  &.recording {
    &::after {
      position: absolute;
      right: 15px;
      top: 15px;
      width: 20px;
      height: 20px;
      border-radius: 10px;
      background: red;
      content: "";
    }
  }
}
</style>
