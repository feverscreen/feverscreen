<template>
  <div id="video-stream-container">
    <canvas
      ref="cameraStream"
      id="camera-stream"
      width="120"
      height="160"
      :class="{ mirrored: mirrorMode }"
    />
    <canvas
      id="debug-overlay"
      ref="vizOverlay"
      width="480"
      height="640"
      :class="{ mirrored: mirrorMode }"
    />
    <video-crop-controls
      v-if="canEditCropping"
      :mirrored="mirrorMode"
      :crop-box="cropBox"
    />
    <div
      title="Edit cropping"
      id="toggle-cropping"
      @click="toggleCropping"
      :class="{ on: canEditCropping }"
    >
      <span v-if="canEditCropping">Save</span>
      <svg
        focusable="false"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
      >
        <path
          fill="currentColor"
          d="M488 352h-40V109.25l59.31-59.31c6.25-6.25 6.25-16.38 0-22.63L484.69 4.69c-6.25-6.25-16.38-6.25-22.63 0L402.75 64H192v96h114.75L160 306.75V24c0-13.26-10.75-24-24-24H88C74.75 0 64 10.74 64 24v40H24C10.75 64 0 74.74 0 88v48c0 13.25 10.75 24 24 24h40v264c0 13.25 10.75 24 24 24h232v-96H205.25L352 205.25V488c0 13.25 10.75 24 24 24h48c13.25 0 24-10.75 24-24v-40h40c13.25 0 24-10.75 24-24v-48c0-13.26-10.75-24-24-24z"
        />
      </svg>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue, Watch } from "vue-property-decorator";
import { Frame } from "@/camera";
import { Face } from "@/face";
import VideoCropControls from "@/components/VideoCropControls.vue";
import { CropBox } from "@/types";
import { ROIFeature } from "@/worker-fns";

const DEBUG_MODE = true;

@Component({ components: { VideoCropControls } })
export default class VideoStream extends Vue {
  @Prop() public frame!: Frame;
  @Prop() public thermalReference!: ROIFeature | null;
  @Prop() public faces!: Face[];
  @Prop({ required: true }) public cropBox!: CropBox;

  private mirrorMode = true;
  private canEditCropping = false;

  $refs!: {
    cameraStream: HTMLCanvasElement;
    vizOverlay: HTMLCanvasElement;
  };

  @Watch("frame")
  onFrameUpdate() {
    const canvas = this.$refs.cameraStream;
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    const imgData = context.getImageData(0, 0, canvas.width, canvas.height);
    const frameData = this.frame.frame;
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

    const data = new Uint32Array(imgData.data.buffer);
    for (let i = paddingStart; i < data.length + paddingStart; i++) {
      const v = ((frameData[i] - min) / (max - min)) * 255.0;
      data[i - paddingStart] = (255 << 24) | (v << 16) | (v << 8) | v;
    }
    context.putImageData(imgData, 0, 0);
  }

  updateOverlayCanvas() {
    const underlay = this.$refs.cameraStream;
    const canvas = this.$refs.vizOverlay;
    const canvasWidth = canvas.width * window.devicePixelRatio;
    const canvasHeight = canvas.height * window.devicePixelRatio;
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    //context.scale(window.devicePixelRatio, window.devicePixelRatio);
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    const scaleX = canvasWidth / (underlay.width * window.devicePixelRatio);
    const scaleY = canvasHeight / (underlay.height * devicePixelRatio);
    const paddingTop = 25;
    for (const face of this.faces) {
      {
        context.lineWidth = 3;
        context.beginPath();
        context.strokeStyle = "#00ffff";
        const bounds = face.haarFace as ROIFeature;
        context.rect(
          bounds.x0 * scaleX,
          (bounds.y0 - paddingTop) * scaleY,
          (bounds.x1 - bounds.x0) * scaleX,
          (bounds.y1 - bounds.y0) * scaleY
        );
        context.stroke();
      }

      if (!face.roi) {
        // console.warn("No roi for face", face);
      } else {
        context.lineWidth = 1;
        context.beginPath();

        context.strokeStyle = "#0000ff";
        const bounds = face.roi as ROIFeature;
        context.rect(
          bounds.x0 * scaleX,
          (bounds.y0 - paddingTop) * scaleY,
          (bounds.x1 - bounds.x0) * scaleX,
          (bounds.y1 - bounds.y0) * scaleY
        );
        context.stroke();
        if (face.isFrontOn) {
          context.fillStyle = "rgba(0, 255, 0, 0.3)";
          context.fill();
        }

        if (DEBUG_MODE) {
          for (const roi of face.xFeatures) {
            context.lineWidth = 1;
            context.beginPath();
            context.strokeStyle = "#00ff00";
            context.rect(
              roi.x0 * scaleX,
              (roi.y0 - paddingTop) * scaleY,
              (roi.x1 - roi.x0) * scaleX,
              (roi.y1 - roi.y0) * scaleY
            );
            context.stroke();
          }
        }

        if (face.forehead) {
          context.lineWidth = 2;
          context.beginPath();
          context.strokeStyle = "#ffff00";
          const bounds = face.forehead as ROIFeature;
          context.rect(
            bounds.x0 * scaleX,
            (bounds.y0 - paddingTop) * scaleY,
            (bounds.x1 - bounds.x0) * scaleX,
            (bounds.y1 - bounds.y0) * scaleY
          );
          context.stroke();
        }

        {
          context.beginPath();
          context.fillStyle = "red";
          context.rect(
            (face.roi.midX() - 0.5) * scaleX,
            (face.roi.midY() - 0.5 - paddingTop) * scaleY,
            1 * scaleX,
            1 * scaleY
          );
          context.fill();
        }

        {
          context.beginPath();
          context.fillStyle = "red";
          context.rect(
            (face.foreheadX - 0.5) * scaleX,
            (face.foreheadY - 0.5 - paddingTop) * scaleY,
            1 * scaleX,
            1 * scaleY
          );
          context.fill();
        }
      }
    }
    const thermalRef = this.thermalReference;
    if (thermalRef) {
      const cx = (thermalRef.x0 + thermalRef.x1) * 0.5 * scaleX;
      const cy = ((thermalRef.y0 + thermalRef.y1) * 0.5 - paddingTop) * scaleY;
      const radius = thermalRef.width() * 0.5 * scaleX;
      context.beginPath();
      context.arc(cx, cy, radius, 0, 2 * Math.PI, false);
      context.lineWidth = 3;
      context.strokeStyle = "rgba(100, 0, 200, 0.75)";
      context.fillStyle = "rgba(255, 0, 0, 0.25)";
      context.fill();
      context.stroke();
    }

    // Update crop-box overlay:
    const overlay = new Path2D();
    const cropBox = this.cropBox;
    overlay.rect(0, 0, canvasWidth, canvasHeight);
    const onePercentWidth = canvasWidth / 100;
    const onePercentHeight = canvasHeight / 100;
    const leftInset = onePercentWidth * cropBox.left;
    const rightInset = onePercentWidth * cropBox.right;
    const topInset = onePercentHeight * cropBox.top;
    const bottomInset = onePercentHeight * cropBox.bottom;
    overlay.rect(
      leftInset,
      topInset,
      canvasWidth - (rightInset + leftInset),
      canvasHeight - (bottomInset + topInset)
    );
    context.fillStyle = "rgba(0, 0, 0, 0.5)";
    context.fill(overlay, "evenodd");
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

  @Watch("faces")
  onFacesChanged() {
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
  background: #444;
  position: relative;
  width: 480px;
  height: 640px;

  > canvas {
    top: 0;
    left: 0;
    position: absolute;
    width: 100%;
    height: 100%;
    &.mirrored {
      transform: scaleX(-1);
    }
  }
  #camera-stream {
    image-rendering: pixelated;
  }

  #debug-overlay {
    //filter: invert(100%);
    //outline: 1px solid yellow;
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
      width: 100px;
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
