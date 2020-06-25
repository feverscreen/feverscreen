<template>
  <div>
    <h1>Admin facing screening interface</h1>
    <VideoStream
      :frame="frame"
      :thermal-reference="thermalReference"
      :faces="faces"
    />
  </div>
</template>

<script lang="ts">
import VideoStream from "@/components/VideoStream.vue";
import { Component, Prop, Vue } from "vue-property-decorator";
import { Frame } from "@/camera";
import { Face } from "@/face";

@Component({
  components: {
    VideoStream
  }
})
export default class AdminScreening extends Vue {
  @Prop() public frame!: Frame;
  @Prop() public thermalReference!: ROIFeature | null;
  @Prop() public faces!: Face[];

  async playFakeVideo() {
    const play = await fetch(
      `http://localhost:2040/sendCPTVFrames?${new URLSearchParams(
        Object.entries({
          //"cptv-file": "no-face-detected.cptv",
          "cptv-file": "looking_down.cptv",
          repeat: "1000"
        })
      )}`,
      { mode: "no-cors", method: "GET" }
    );
    console.log(play);
  }
}
</script>

<style scoped></style>
