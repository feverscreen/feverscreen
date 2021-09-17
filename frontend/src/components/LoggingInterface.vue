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

  mounted() {
    console.info("Test");
  }

  @Watch("framePos")
  onFrameChange() {
    this.$refs.logContainer.innerText = "";
    const currLogs = this.frameLogs[this.framePos];
    if (currLogs) {
      currLogs.forEach(arg => {
        this.$refs.logContainer.innerText += `${arg}\n`;
      });
    }
  }
}
</script>
<style lang="scss" scoped>
.log-container {
  position: absolute;
  background: white;
  text-align: left;
}
</style>
