<template>
  <div id="admin">
    <div>
      <h1>Admin facing screening interface</h1>
      <VideoStream
        :frame="frame"
        :thermal-reference="thermalReference"
        :faces="faces"
        :crop-box="cropBox"
      />
      <v-card>
        {{ calibration }}
        <v-dialog max-width="300" v-model="showCalibrationDialog">
          <template v-slot:activator="{ on, attrs }">
            <v-btn v-bind="attrs" v-on="on">Edit</v-btn>
          </template>
          <v-card>
            <v-card-title>Edit calibration</v-card-title>
            <v-card-subtitle>
              Take your temperature and enter it here to calibrate the system.
            </v-card-subtitle>
            <v-card-text>
              <v-text-field
                label="calibrated temperature"
                :value="calibration"
                @blur="updateCalibration"
              />
              <v-card-actions>
                <v-btn @click="e => incrementCalibration(0.1)">
                  <v-icon light>{{ plusIcon }}</v-icon>
                </v-btn>
                <v-spacer />
                <v-btn @click="e => incrementCalibration(-0.1)"
                  ><v-icon light>{{ minusIcon }}</v-icon></v-btn
                >
              </v-card-actions>
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn
                text
                color="grey darken-1"
                @click="showCalibrationDialog = false"
                >Cancel</v-btn
              >
              <v-btn
                text
                color="green darken-1"
                @click="showCalibrationDialog = false"
                >Save</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-card>

      <div class="face-stats">
        <div class="frame-num">
          Frame #{{ (frame && frame.frameInfo.Telemetry.FrameCount) || 0 }}
        </div>
        <div>
          {{ face && (100 * (1 - face.frontOnRatio)).toFixed(2) }}% front-facing
        </div>
        <div>
          Active thermal region: {{ face && face.width() }}px x
          {{ face && face.height() }}px
        </div>
      </div>
    </div>
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
import { Component, Emit, Prop, Vue } from "vue-property-decorator";
import { Frame } from "@/camera";
import { Face } from "@/face";
import { CropBox, DegreesCelsius } from "@/types";
import { ROIFeature } from "@/worker-fns";
import { mdiPlus, mdiMinus } from "@mdi/js";

@Component({
  components: {
    VideoStream
  }
})
export default class AdminScreening extends Vue {
  @Prop({ required: true }) public frame!: Frame;
  @Prop({ required: true }) public thermalReference!: ROIFeature | null;
  @Prop({ required: true }) public faces!: Face[];
  @Prop({ required: true }) public cropBox!: CropBox;
  @Prop({ required: true }) public calibration!: DegreesCelsius;

  private useFaceTracking = false;
  private useMirrorMode = true;
  private useDebugDraw = false;
  private useCustomTemperatureRange = false;
  private temperatureThresholds = [32, 38];
  private showCalibrationDialog = false;

  getLabel(value: number) {
    return value < this.temperatureThresholds[1] ? "Low" : "High";
  }

  get face(): Face {
    return this.faces[0];
  }

  get plusIcon() {
    return mdiPlus;
  }

  get minusIcon() {
    return mdiMinus;
  }

  @Emit("calibration-updated")
  updateCalibration(event: FocusEvent): DegreesCelsius {
    const value = (event.target as HTMLInputElement).value
      .replace("&deg;C", "")
      .replace("°C", "");
    if (isNaN(Number(value))) {
      return new DegreesCelsius(36);
    }
    return new DegreesCelsius(Number(value));
  }

  @Emit("calibration-updated")
  incrementCalibration(amount: number): DegreesCelsius {
    return new DegreesCelsius(this.calibration.val + amount);
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

<style scoped>
#admin {
  display: flex;
}
.face-stats {
  text-align: left;
  padding: 10px;
}
</style>
