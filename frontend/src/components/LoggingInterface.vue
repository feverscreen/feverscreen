<template>
  <div>
    <pre class="log-container" ref="logContainer"></pre>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
@Component
export default class LoggingInterface extends Vue {
  @Prop() framePos!: number;
  @Prop() frameLogs!: string[][];
  $refs!: {
    logContainer: HTMLElement;
  };

  @Watch("framePos")
  onFrameChange() {
    this.$refs.logContainer.innerText = "";
    const currLogs = this.frameLogs[this.framePos];
    if (currLogs) {
      currLogs.forEach((arg) => {
        this.$refs.logContainer.innerText += `${arg}\n`;
      });
    }
  }
}
</script>
<style lang="scss" scoped>
.log-container {
  z-index: 0;
  position: fixed;
  top: 0;
  right: 0;
  text-align: right;
}
</style>
