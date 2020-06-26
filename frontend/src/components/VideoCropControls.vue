<template>
  <div id="fov-box" ref="box">
    <div>
      <div
        ref="top"
        id="top-handle"
        class="fov-handle"
        @mousedown="e => startDrag(e)"
        @mouseup="e => endDrag(e)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 512">
          <path
            fill="currentColor"
            d="M214.059 377.941H168V134.059h46.059c21.382 0 32.09-25.851 16.971-40.971L144.971 7.029c-9.373-9.373-24.568-9.373-33.941 0L24.971 93.088c-15.119 15.119-4.411 40.971 16.971 40.971H88v243.882H41.941c-21.382 0-32.09 25.851-16.971 40.971l86.059 86.059c9.373 9.373 24.568 9.373 33.941 0l86.059-86.059c15.12-15.119 4.412-40.971-16.97-40.971z"
          ></path>
        </svg>
      </div>
      <div
        ref="left"
        id="left-handle"
        class="fov-handle"
        @mousedown="e => startDrag(e)"
        @mouseup="e => endDrag(e)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <path
            fill="currentColor"
            d="M377.941 169.941V216H134.059v-46.059c0-21.382-25.851-32.09-40.971-16.971L7.029 239.029c-9.373 9.373-9.373 24.568 0 33.941l86.059 86.059c15.119 15.119 40.971 4.411 40.971-16.971V296h243.882v46.059c0 21.382 25.851 32.09 40.971 16.971l86.059-86.059c9.373-9.373 9.373-24.568 0-33.941l-86.059-86.059c-15.119-15.12-40.971-4.412-40.971 16.97z"
          ></path>
        </svg>
      </div>
      <div
        ref="right"
        id="right-handle"
        class="fov-handle"
        @mousedown="e => startDrag(e)"
        @mouseup="e => endDrag(e)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <path
            fill="currentColor"
            d="M377.941 169.941V216H134.059v-46.059c0-21.382-25.851-32.09-40.971-16.971L7.029 239.029c-9.373 9.373-9.373 24.568 0 33.941l86.059 86.059c15.119 15.119 40.971 4.411 40.971-16.971V296h243.882v46.059c0 21.382 25.851 32.09 40.971 16.971l86.059-86.059c9.373-9.373 9.373-24.568 0-33.941l-86.059-86.059c-15.119-15.12-40.971-4.412-40.971 16.97z"
          ></path>
        </svg>
      </div>
      <div
        ref="bottom"
        id="bottom-handle"
        class="fov-handle"
        @mousedown="e => startDrag(e)"
        @mouseup="e => endDrag(e)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 512">
          <path
            fill="currentColor"
            d="M214.059 377.941H168V134.059h46.059c21.382 0 32.09-25.851 16.971-40.971L144.971 7.029c-9.373-9.373-24.568-9.373-33.941 0L24.971 93.088c-15.119 15.119-4.411 40.971 16.971 40.971H88v243.882H41.941c-21.382 0-32.09 25.851-16.971 40.971l86.059 86.059c9.373 9.373 24.568 9.373 33.941 0l86.059-86.059c15.12-15.119 4.412-40.971-16.97-40.971z"
          ></path>
        </svg>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue } from "vue-property-decorator";
import { BoxOffset, CropBox } from "@/types";

@Component
export default class VideoCropControls extends Vue {
  @Prop({ required: true }) mirrored!: boolean;
  @Prop({ required: true }) cropBox!: CropBox;

  private currentTarget: HTMLDivElement | null = null;
  private boundDragHandle: ((e: MouseEvent | TouchEvent) => void) | null = null;
  private boundEndDrag: ((e: Event) => void) | null = null;

  $refs!: {
    top: HTMLDivElement;
    right: HTMLDivElement;
    bottom: HTMLDivElement;
    left: HTMLDivElement;
    box: HTMLDivElement;
  };

  created() {
    this.boundEndDrag = this.endDrag.bind(this);
    window.addEventListener("mouseup", this.boundEndDrag);
    window.addEventListener("touchend", this.boundEndDrag);
  }

  mounted() {
    const cropBox = this.cropBox;
    // Set the initial handle positions:
    const left = this.mirrored ? cropBox.right : cropBox.left;
    const right = this.mirrored ? cropBox.left : cropBox.right;

    this.$refs.top.style.top = `${cropBox.top}%`;
    this.$refs.right.style.right = `${right}%`;
    this.$refs.bottom.style.bottom = `${cropBox.bottom}%`;
    this.$refs.left.style.left = `${left}%`;
    let offset = cropBox.top + (100 - (cropBox.bottom + cropBox.top)) * 0.5;
    this.$refs.left.style.top = `${offset}%`;
    this.$refs.right.style.top = `${offset}%`;
    offset = left + (100 - (left + right)) * 0.5;
    this.$refs.top.style.left = `${offset}%`;
    this.$refs.bottom.style.left = `${offset}%`;
  }

  beforeDestroy() {
    if (this.boundEndDrag) {
      window.removeEventListener("mouseup", this.boundEndDrag);
      window.removeEventListener("touchend", this.boundEndDrag);
    }
  }

  startDrag(event: Event) {
    if (this.boundDragHandle === null) {
      this.boundDragHandle = this.dragHandle.bind(this);
    }
    const eventName = event.type === "mousedown" ? "mousemove" : "touchmove";
    this.currentTarget = event.target as HTMLDivElement;
    if (this.boundDragHandle) {
      window.addEventListener(eventName, this.boundDragHandle);
    }
  }

  endDrag(event: Event) {
    const eventName = event.type === "mouseup" ? "mousemove" : "touchmove";
    this.currentTarget = null;
    if (this.boundDragHandle) {
      window.removeEventListener(eventName, this.boundDragHandle);
    }
  }

  dragHandle(event: MouseEvent | TouchEvent) {
    const cropBox = { ...this.cropBox };
    const cropTopHandle = this.$refs.top;
    const cropRightHandle = this.$refs.right;
    const cropBottomHandle = this.$refs.bottom;
    const cropLeftHandle = this.$refs.left;
    let position: { clientX: number; clientY: number };
    if (!(event instanceof MouseEvent)) {
      position = (event as TouchEvent).touches[0];
    } else {
      position = event;
    }
    const { clientX: x, clientY: y } = position;
    const minDimensions = 20;
    let maxInsetPercentage = 35;
    const bounds = this.$refs.box.getBoundingClientRect();
    let offset;
    if (this.currentTarget) {
      const l: BoxOffset = this.mirrored ? "right" : "left";
      const r: BoxOffset = this.mirrored ? "left" : "right";
      switch (this.currentTarget.id) {
        case "top-handle":
          maxInsetPercentage = 100 - (cropBox.bottom + minDimensions);
          cropBox.top = Math.min(
            maxInsetPercentage,
            Math.max(0, 100 * ((y - bounds.top) / bounds.height))
          );
          cropTopHandle.style.top = `${cropBox.top}%`;
          offset = cropBox.top + (100 - (cropBox.bottom + cropBox.top)) * 0.5;
          cropLeftHandle.style.top = `${offset}%`;
          cropRightHandle.style.top = `${offset}%`;
          break;
        case "right-handle":
          maxInsetPercentage = 100 - (cropBox[l] + minDimensions);
          cropBox[r] = Math.min(
            maxInsetPercentage,
            Math.max(0, 100 * ((bounds.right - x) / bounds.width))
          );
          cropRightHandle.style.right = `${cropBox[r]}%`;
          offset = cropBox[l] + (100 - (cropBox[l] + cropBox[r])) * 0.5;
          cropTopHandle.style.left = `${offset}%`;
          cropBottomHandle.style.left = `${offset}%`;
          break;
        case "bottom-handle":
          maxInsetPercentage = 100 - (cropBox.top + minDimensions);
          cropBox.bottom = Math.min(
            maxInsetPercentage,
            Math.max(0, 100 * ((bounds.bottom - y) / bounds.height))
          );
          cropBottomHandle.style.bottom = `${cropBox.bottom}%`;
          offset = cropBox.top + (100 - (cropBox.bottom + cropBox.top)) * 0.5;
          cropLeftHandle.style.top = `${offset}%`;
          cropRightHandle.style.top = `${offset}%`;
          break;
        case "left-handle":
          maxInsetPercentage = 100 - (cropBox[r] + minDimensions);
          cropBox[l] = Math.min(
            maxInsetPercentage,
            Math.max(0, 100 * ((x - bounds.left) / bounds.width))
          );
          cropLeftHandle.style.left = `${cropBox[l]}%`;
          offset = cropBox[l] + (100 - (cropBox[l] + cropBox[r])) * 0.5;
          cropTopHandle.style.left = `${offset}%`;
          cropBottomHandle.style.left = `${offset}%`;
          break;
      }
      // Update saved fovBox:
      this.$parent.$parent.$emit("crop-changed", cropBox);
    }
  }
}
</script>

<style scoped lang="scss">
#fov-box {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  > div {
    position: relative;
    width: 100%;
    height: 100%;

    > #top-handle {
      top: 0;
      left: 50%;
      transform: translateX(-50%) translateY(-30%);
    }

    > #left-handle {
      left: 0;
      top: 50%;
      transform: translateX(-30%) translateY(-50%);
    }

    > #right-handle {
      right: 0;
      top: 50%;
      transform: translateX(30%) translateY(-50%);
    }

    > #bottom-handle {
      bottom: 0;
      left: 50%;
      transform: translateX(-50%) translateY(30%);
    }

    > .fov-handle {
      width: 44px;
      height: 44px;
      background: #ccc;
      border-radius: 50%;
      box-shadow: #333 0 1px 5px;
      background: radial-gradient(#ddd, #bbb);
      position: absolute;

      > svg {
        pointer-events: none;
        width: 80%;
        height: 80%;
        left: 10%;
        top: 10%;
        position: absolute;
      }

      path {
        fill: #444;
      }
    }
  }
}
</style>
