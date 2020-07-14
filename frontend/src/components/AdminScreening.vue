<template>
  <div id="admin">
    <div>
      <VideoStream
        :frame="frame"
        :thermal-reference="thermalReference"
        :faces="faces"
        :crop-box="cropBox"
      />
      <v-container>
        <v-card-title>
          Calibration: {{ calibration }}
          <v-btn
            @click.stop="() => editCalibration()"
            text
            :disabled="!canCalibrate"
          >
            <v-icon color="#999" small>{{ pencilIcon }}</v-icon> Edit
          </v-btn>
        </v-card-title>
        <v-dialog max-width="300" v-model="showCalibrationDialog">
          <v-card>
            <v-card-title>Edit calibration</v-card-title>
            <v-card-subtitle>
              Take your temperature and enter it here to calibrate the system.
            </v-card-subtitle>
            <v-card-text>
              <v-text-field
                label="calibrated temperature"
                :value="editedCalibration"
                @blur="updateCalibration"
              />
              <v-card-actions>
                <v-btn @click="() => incrementCalibration(0.1)">
                  <v-icon light>{{ plusIcon }}</v-icon>
                </v-btn>
                <v-spacer />
                <v-btn @click="() => incrementCalibration(-0.1)">
                  <v-icon light>{{ minusIcon }}</v-icon>
                </v-btn>
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
              <v-btn text color="green darken-1" @click="e => saveCalibration()"
                >Save</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-container>

      <div class="face-stats">
        <div class="frame-num">
          Frame #{{ (frame && frame.frameInfo.Telemetry.FrameCount) || 0 }}
        </div>
        <div>{{ face && face.frontOnPercentage }}% front-facing</div>
        <div v-if="face">
          Active thermal region: {{ face.width().toFixed(0) }} x
          {{ face.height().toFixed(0) }} ({{
            (face.width() * face.height()).toFixed(0)
          }}px<sup>2</sup>)
        </div>
        <div v-else>--</div>
      </div>
    </div>
    <v-card-text v-if="false">
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
import { CropBox, ScreeningEvent, ScreeningState } from "@/types";
import { ROIFeature } from "@/worker-fns";
import { mdiMinus, mdiPencil, mdiPlus } from "@mdi/js";
import { DegreesCelsius } from "@/utils";

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
  @Prop({ required: true }) public screeningState!: ScreeningState;
  @Prop({ required: true }) public latestScreeningEvent!: ScreeningEvent | null;

  private useMirrorMode = true;
  private useDebugDraw = false;
  private useCustomTemperatureRange = false;
  private temperatureThresholds = [32, 38];
  private showCalibrationDialog = false;
  private editedCalibration: DegreesCelsius = new DegreesCelsius(0);

  get canCalibrate() {
    return (
      this.screeningState === ScreeningState.STABLE_LOCK ||
      this.screeningState === ScreeningState.LEAVING
    );
  }

  editCalibration() {
    this.editedCalibration = new DegreesCelsius(this.calibration.val);
    this.showCalibrationDialog = true;
  }

  @Emit("calibration-updated")
  saveCalibration(): DegreesCelsius {
    this.calibration = new DegreesCelsius(this.editedCalibration.val);
    this.showCalibrationDialog = false;
    return this.calibration;
  }

  getLabel(value: number) {
    return value < this.temperatureThresholds[1] ? "Low" : "High";
  }

  get face(): Face {
    return this.faces[0];
  }

  get plusIcon() {
    return mdiPlus;
  }

  get pencilIcon() {
    return mdiPencil;
  }

  get minusIcon() {
    return mdiMinus;
  }

  updateCalibration(event: FocusEvent) {
    const value = (event.target as HTMLInputElement).value
      .replace("&deg;", "")
      .replace("°", "");
    if (isNaN(Number(value))) {
      this.editedCalibration = new DegreesCelsius(36);
    }
    this.editedCalibration = new DegreesCelsius(Number(value));
  }

  incrementCalibration(amount: number) {
    this.editedCalibration = new DegreesCelsius(
      this.editedCalibration.val + amount
    );
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
