<template>
  <div class="fps-counter">{{ fps }} FPS</div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

@Component
export default class FpsCounter extends Vue {
  @Prop() frameCount!: number;

  private fpsTimes: number[] = [];

  @Watch("frameCount")
  onFrameComplete() {
    this.fpsTimes.push(new Date().getTime());
    while (this.fpsTimes.length > 25) {
      this.fpsTimes.shift();
    }
  }

  // TODO(jon): Draw sparklines

  get fps(): number {
    // How many frames rendered in the last second?
    const now = new Date().getTime();
    const framesRendered = this.fpsTimes.filter(x => x > now - 1000);
    return framesRendered.length;
  }
}
</script>

<style scoped>
.fps-counter {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 5px 10px;
  background: red;
  border-radius: 5px;
  color: white;
}
</style>
