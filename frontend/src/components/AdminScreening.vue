<template>
  <div id="admin">
    <h1>Admin facing screening interface</h1>
    <VideoStream
      :frame="frame"
      :thermal-reference="thermalReference"
      :faces="faces"
      :crop-box="cropBox"
    />
    <v-card-text>
      <v-checkbox v-model="useFaceTracking" :label="`Use face-tracking`" />
      <v-checkbox v-model="useDebugDraw" :label="`Use debug-draw`" />
      <v-checkbox v-model="useMirrorMode" :label="`Mirror display`" />
      <v-checkbox
        v-model="useCustomTemperatureRange"
        :label="`Use custom temperature range`"
      />
      <v-card-text v-if="useCustomTemperatureRange">
        <v-range-slider
          v-model="temperatureThresholds"
          min="30"
          max="40"
          step="0.1"
          thumb-label
          :ticks="true"
          :color="'green'"
          :track-color="'rgba(255, 0, 0, 0.25)'"
        />
      </v-card-text>
    </v-card-text>
  </div>
</template>

<script lang="ts">
import VideoStream from "@/components/VideoStream.vue";
import { Component, Prop, Vue } from "vue-property-decorator";
import { Frame } from "@/camera";
import { Face } from "@/face";
import { CropBox } from "@/types";

@Component({
  components: {
    VideoStream
  }
})
export default class AdminScreening extends Vue {
  @Prop() public frame!: Frame;
  @Prop() public thermalReference!: ROIFeature | null;
  @Prop() public faces!: Face[];
  @Prop() public cropBox!: CropBox;

  private useFaceTracking = false;
  private useMirrorMode = true;
  private useDebugDraw = false;
  private useCustomTemperatureRange = false;
  private temperatureThresholds = [32, 38];

  getLabel(value: number) {
    return value < this.temperatureThresholds[1] ? "Low" : "High";
  }

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
