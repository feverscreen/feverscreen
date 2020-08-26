<template>
  <div id="video-stream-container" ref="container">
    <canvas ref="cameraStream" id="camera-stream" width="120" height="160" />
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
  </div>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue, Watch } from "vue-property-decorator";
import { Face } from "@/face";
import VideoCropControls from "@/components/VideoCropControls.vue";
import { CropBox } from "@/types";
import { ROIFeature } from "@/worker-fns";
import { FaceInfo, getHottestSpotInBounds } from "@/shape-processing";
import { mdiCrop } from "@mdi/js";
import { State } from "@/main";
import { ThermalRefValues } from "@/circle-detection";

@Component({ components: { VideoCropControls } })
export default class VideoStream extends Vue {
  @Prop() public frame!: Float32Array;
  @Prop() public thermalReference!: ROIFeature | null;
  @Prop() public thermalReferenceStats!: ThermalRefValues | null;
  @Prop() public faces!: Face[];
  @Prop({ required: true }) public face!: FaceInfo | null;
  @Prop({ required: true }) public cropBox!: CropBox;
  @Prop({ required: true }) public cropEnabled!: boolean;
  @Prop({ default: 1.0 }) public scale!: number;
  @Prop({ default: false }) public drawOverlays!: boolean;
  private canEditCropping = false;

  $refs!: {
    cameraStream: HTMLCanvasElement;
    vizOverlay: HTMLCanvasElement;
    container: HTMLDivElement;
  };

  get cropIcon() {
    return mdiCrop;
  }

  @Watch("frame")
  onFrameUpdate(next: Float32Array) {
    // TODO(jon): Why does this sometimes get called when the smoothed image array is empty?
    const canvas = this.$refs.cameraStream;
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    const imgData = context.getImageData(0, 0, canvas.width, canvas.height);
    const frameData = next;
    let max = 0;
    let min = Number.MAX_SAFE_INTEGER;
    const paddingStart = 25 * canvas.width;
    for (let i = paddingStart; i < frameData.length; i++) {
      const f32Val = frameData[i];
      if (f32Val < min) {
        min = f32Val;
      }
      if (f32Val > max) {
        max = f32Val;
      }
    }
    if (min !== Number.MAX_SAFE_INTEGER) {
      const data = new Uint32Array(imgData.data.buffer);
      const range = max - min;
      for (let i = paddingStart; i < data.length + paddingStart; i++) {
        const v = Math.max(
          0,
          Math.min(255, ((frameData[i] - min) / range) * 255.0)
        );
        data[i - paddingStart] = (255 << 24) | (v << 16) | (v << 8) | v;
      }
      context.putImageData(imgData, 0, 0);
    }
  }

  mounted() {
    const container = this.$refs.container;
    container.style.width = `${375 * this.scale}px`;
    container.style.height = `${500 * this.scale}px`;
    if (this.frame) {
      this.onFrameUpdate(this.frame);
      this.updateOverlayCanvas();
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

      const scaleX = canvasWidth / (underlay.width * window.devicePixelRatio);
      const scaleY = canvasHeight / (underlay.height * window.devicePixelRatio);
      context.scale(scaleX, scaleY);
      const paddingTop = 25;
      const face = this.face;
      if (face) {
        // Now find the hotspot - only if we have a good lock!
        if (face.headLock === 1.0) {
          const point = getHottestSpotInBounds(
            face,
            State.currentFrame!.threshold,
            120,
            160,
            this.frame
          );

          context.beginPath();
          context.strokeStyle = "rgba(255, 0, 0, 0.7)";
          context.lineWidth = 1;
          context.arc(point.x - 0.5, point.y - 0.5, 2, 0, Math.PI * 2);
          context.stroke();
        }

        context.lineWidth = 0.25;
        if (face.headLock === 1.0) {
          context.strokeStyle = "red";
          context.lineWidth = 0.5;
        } else if (face.headLock === 0.5) {
          context.strokeStyle = "blue";
        } else {
          context.strokeStyle = "orange";
        }
        context.beginPath();
        context.moveTo(face.head.bottomLeft.x, face.head.bottomLeft.y);
        context.lineTo(face.head.topLeft.x, face.head.topLeft.y);
        context.lineTo(face.head.topRight.x, face.head.topRight.y);
        context.lineTo(face.head.bottomRight.x, face.head.bottomRight.y);
        context.lineTo(face.head.bottomLeft.x, face.head.bottomLeft.y);
        context.moveTo(face.vertical.bottom.x, face.vertical.bottom.y);
        context.lineTo(face.vertical.top.x, face.vertical.top.y);
        context.moveTo(face.horizontal.left.x, face.horizontal.left.y);
        context.lineTo(face.horizontal.right.x, face.horizontal.right.y);

        // context.moveTo(face.forehead.bottomLeft.x, face.forehead.bottomLeft.y);
        // context.lineTo(
        //   face.forehead.bottomRight.x,
        //   face.forehead.bottomRight.y
        // );
        // context.moveTo(face.forehead.topLeft.x, face.forehead.topLeft.y);
        // context.lineTo(face.forehead.topRight.x, face.forehead.topRight.y);
        context.stroke();
      }
      const thermalRef = this.thermalReference;
      const drawThermalReference = true;
      if (
        thermalRef &&
        drawThermalReference &&
        this.thermalReferenceStats !== null
      ) {
        {
          context.save();
          context.fillStyle = "rgba(255, 0, 255, 0.5)";
          context.beginPath();
          for (const { x, y } of this.thermalReferenceStats.coords) {
            context.rect(x, y - paddingTop, 1, 1);
          }
          context.fill();
          context.restore();
        }

        // const cx = (thermalRef.x0 + thermalRef.x1) * 0.5 * scaleX;
        // const cy = ((thermalRef.y0 + thermalRef.y1) * 0.5 - paddingTop) * scaleY;
        // console.log(cx, cy);
        // const radius = thermalRef.width() * 0.5 * scaleX;
        // context.beginPath();
        // context.arc(cx, cy, radius, 0, 2 * Math.PI, false);
        // context.lineWidth = 0.5;
        // context.strokeStyle = "rgba(100, 0, 200, 0.75)";
        // //context.fillStyle = "rgba(255, 0, 0, 0.25)";
        // //context.fill();
        // context.stroke();
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

  > canvas {
    top: 0;
    left: 0;
    position: absolute;
    width: 100%;
    height: 100%;
  }
  #camera-stream {
    image-rendering: pixelated;
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
}
</style>
