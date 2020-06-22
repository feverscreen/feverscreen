<template>
  <div id="video-stream-container">
    <canvas id="camera-stream"></canvas>
    <canvas id="debug-overlay"></canvas>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { Frame } from "@/camera";

@Component
export default class VideoStream extends Vue {
  @Prop() public frame!: Frame;
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
</style>
