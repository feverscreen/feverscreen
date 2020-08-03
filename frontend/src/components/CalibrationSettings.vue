<template>
  <v-card height="calc(100vh - 112px)">
    <v-container class="cont">
      <v-card class="split" flat>
        <v-card>
          <VideoStream
            :frame="state.currentFrame.smoothed"
            :thermal-reference="state.thermalReference"
            :thermal-reference-stats="state.thermalReferenceStats"
            :face="state.face"
            :crop-box="editedCropBox"
            @crop-changed="onCropChanged"
            :crop-enabled="true"
          />
        </v-card>
        <v-card class="settings" width="700">
          <v-card-title>
            Calibration: {{ pendingCalibration }}
            <v-btn
              @click.stop="() => editCalibration()"
              text
              :disabled="!canCalibrate"
            >
              <v-icon color="#999" small>{{ pencilIcon }}</v-icon> Edit
            </v-btn>
          </v-card-title>
          <v-dialog max-width="400" v-model="showCalibrationDialog">
            <v-card>
              <v-card-title>Edit calibration</v-card-title>
              <v-container>
                <VideoStream
                  v-if="snapshotScreeningEvent"
                  :frame="snapshotScreeningEvent.frame.smoothed"
                  :thermal-reference="snapshotScreeningEvent.thermalReference"
                  :face="snapshotScreeningEvent.face"
                  :crop-box="state.currentCalibration.cropBox"
                  :crop-enabled="false"
                  :draw-overlays="true"
                  :scale="0.6"
                />
              </v-container>
              <v-card-subtitle>
                Take your temperature and enter it here to calibrate the system
                against the current screening event.
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
                <v-btn
                  text
                  color="green darken-1"
                  @click="e => acceptCalibration()"
                  >Accept</v-btn
                >
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-card-text>
            <v-checkbox
              v-model="useCustomTemperatureRange"
              @change="toggleCustomTemperatureThresholds"
              :label="`Use custom alerts temperature range`"
            />
            <v-card-text>
              <v-range-slider
                v-model="editedTemperatureThresholds"
                :disabled="!useCustomTemperatureRange"
                min="30"
                max="40"
                step="0.1"
                thumb-label
                :ticks="true"
                :color="'green'"
                :track-color="'rgba(255, 0, 0, 0.25)'"
              />
              <span
                class="selected-temp-range"
                v-html="selectedTemperatureRange"
              ></span>
            </v-card-text>
          </v-card-text>
          <v-card-title>Sounds:</v-card-title>
          <v-container fluid width="100%">
            <v-row>
              <v-col cols="4">
                <v-switch
                  v-model="playNormalSound"
                  @change="e => saveSounds()"
                  label="Play normal sound"
                />
              </v-col>
              <v-col cols="4">
                <v-switch
                  v-model="playWarningSound"
                  @change="e => saveSounds()"
                  label="Play warning sound"
                />
              </v-col>
              <v-col cols="4">
                <v-switch
                  v-model="playErrorSound"
                  @change="e => saveSounds()"
                  label="Play error sound"
                />
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-card>
      <v-overlay :value="saving" light>
        Saving settings
      </v-overlay>
      <v-card-actions class="bottom-nav">
        <v-btn text :disabled="!hasMadeEdits" @click="e => resetEdits()">
          Discard changes
        </v-btn>
        <v-btn text :disabled="!hasMadeEdits" @click="e => saveEdits()">
          Save changes
        </v-btn>
      </v-card-actions>
    </v-container>
  </v-card>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { AppState, CropBox, ScreeningEvent, ScreeningState } from "@/types";
import {
  DEFAULT_THRESHOLD_MIN_FEVER,
  DEFAULT_THRESHOLD_MIN_NORMAL,
  State
} from "@/main";
import VideoStream from "@/components/VideoStream.vue";
import { DegreesCelsius } from "@/utils";
import { mdiMinus, mdiPencil, mdiPlus } from "@mdi/js";
import { DeviceApi, ScreeningApi } from "@/api/api";

@Component({
  components: { VideoStream }
})
export default class CalibrationSettings extends Vue {
  private useCustomTemperatureRange = false;
  private editedTemperatureThresholds: [number, number] = [0, 0];
  private showCalibrationDialog = false;
  private editedCropBox: CropBox | null = null;
  private editedCalibration: DegreesCelsius = new DegreesCelsius(0);
  private pendingCalibration: DegreesCelsius = new DegreesCelsius(0);
  private snapshotScreeningEvent: ScreeningEvent | null = null;
  private playNormalSound = true;
  private playWarningSound = true;
  private playErrorSound = true;
  private deviceName = "";
  private deviceID = 0;

  toggleCustomTemperatureThresholds(val: boolean) {
    if (val) {
      this.editedTemperatureThresholds = [
        this.state.currentCalibration.thresholdMinNormal,
        this.state.currentCalibration.thresholdMinFever
      ];
    }
    if (!val) {
      this.editedTemperatureThresholds = [
        DEFAULT_THRESHOLD_MIN_NORMAL,
        DEFAULT_THRESHOLD_MIN_FEVER
      ];
    }
    // Update custom back to defaults
  }

  get selectedTemperatureRange() {
    return `${new DegreesCelsius(
      this.editedTemperatureThresholds[0]
    )} &ndash; ${new DegreesCelsius(this.editedTemperatureThresholds[1])}`;
  }

  get hasMadeEdits(): boolean {
    const unedited = {
      cropBox: this.state.currentCalibration.cropBox,
      temperatureThresholds: [
        this.state.currentCalibration.thresholdMinNormal,
        this.state.currentCalibration.thresholdMinFever
      ],
      calibration: this.state.currentCalibration.calibrationTemperature.val
    };
    const edited = {
      cropBox: this.editedCropBox,
      temperatureThresholds: this.editedTemperatureThresholds,
      calibration: parseFloat(this.editedCalibration.val.toFixed(2))
    };
    const a = JSON.stringify(edited);
    const b = JSON.stringify(unedited);
    return a != b;
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

  get state(): AppState {
    return State;
  }

  get canCalibrate() {
    return this.latestScreeningEvent !== null;
  }

  onCropChanged(box: CropBox) {
    this.editedCropBox = box;
  }

  get screeningState(): ScreeningState {
    return this.state.currentScreeningState;
  }

  get latestScreeningEvent(): ScreeningEvent | null {
    return this.state.currentScreeningEvent;
  }

  get calibration(): DegreesCelsius {
    return this.pendingCalibration;
  }

  editCalibration() {
    this.editedCalibration = new DegreesCelsius(this.calibration.val);
    this.snapshotScreeningEvent = this.latestScreeningEvent;
    this.showCalibrationDialog = true;
  }

  async acceptCalibration() {
    this.pendingCalibration = new DegreesCelsius(this.editedCalibration.val);
    this.snapshotScreeningEvent = null;
    this.showCalibrationDialog = false;
  }

  async persistSettings(): Promise<Response | undefined> {
    // Get these values from the current screening event.
    const cropBox = this.editedCropBox!;
    const currentCalibration = this.pendingCalibration;
    let thermalRefTemp = this.state.currentCalibration.thermalRefTemperature
      .val;
    console.log(JSON.stringify(this.state.currentCalibration, null, "\t"));
    let thermalRefRaw = this.state.currentCalibration.thermalReferenceRawValue;
    let rawTempValue = this.state.currentCalibration.hotspotRawTemperatureValue;
    const thresholdMinNormal = this.editedTemperatureThresholds[0];
    const thresholdMinFever = this.editedTemperatureThresholds[1];
    let frame = this.state.currentFrame;
    let sampleX = -1;
    let sampleY = -1;
    if (frame) {
      if (this.latestScreeningEvent) {
        thermalRefRaw = this.latestScreeningEvent.thermalReferenceRawValue;
        rawTempValue = this.latestScreeningEvent.rawTemperatureValue;
        thermalRefTemp =
          currentCalibration.val - (rawTempValue - thermalRefRaw) * 0.01;
        frame = this.latestScreeningEvent.frame;
        sampleX = this.latestScreeningEvent.sampleX;
        sampleY = this.latestScreeningEvent.sampleY;
      }

      const timestamp = new Date();
      await ScreeningApi.recordCalibrationEvent(
        this.deviceName,
        this.deviceID,
        {
          cropBox,
          timestamp: timestamp,
          calibrationTemperature: currentCalibration,
          hotspotRawTemperatureValue: rawTempValue,
          thermalRefTemperature: new DegreesCelsius(thermalRefTemp),
          thermalReferenceRawValue: thermalRefRaw,
          thresholdMinFever,
          thresholdMinNormal
        },
        frame,
        sampleX,
        sampleY
      );

      return DeviceApi.saveCalibration({
        ThresholdMinNormal: thresholdMinNormal,
        ThresholdMinFever: thresholdMinFever,
        ThermalRefTemp: thermalRefTemp,
        TemperatureCelsius: currentCalibration.val,
        Top: cropBox.top,
        Right: cropBox.right,
        Left: cropBox.left,
        Bottom: cropBox.bottom,
        UuidOfUpdater: this.state.uuid,
        BodyLocation: "forehead",
        CalibrationBinaryVersion: this.state.currentFrame!.frameInfo
          .BinaryVersion,
        SnapshotTime: timestamp.getTime(),
        SnapshotUncertainty: 0,
        SnapshotValue: rawTempValue
      });
    }
    return;
  }

  incrementCalibration(amount: number) {
    this.editedCalibration = new DegreesCelsius(
      this.editedCalibration.val + amount
    );
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

  resetEdits() {
    this.editedCropBox = { ...this.state.currentCalibration.cropBox };
    this.pendingCalibration = new DegreesCelsius(
      this.state.currentCalibration.calibrationTemperature.val
    );
    this.editedCalibration = new DegreesCelsius(
      this.state.currentCalibration.calibrationTemperature.val
    );
    this.editedTemperatureThresholds = [
      this.state.currentCalibration.thresholdMinNormal,
      this.state.currentCalibration.thresholdMinFever
    ];
    this.useCustomTemperatureRange =
      this.editedTemperatureThresholds[0] !== DEFAULT_THRESHOLD_MIN_NORMAL &&
      this.editedTemperatureThresholds[1] !== DEFAULT_THRESHOLD_MIN_FEVER;
  }

  private saving = false;
  async saveEdits() {
    this.saving = true;
    await this.persistSettings();
    this.saving = false;
  }

  saveSounds() {
    window.localStorage.setItem(
      "playNormalSound",
      JSON.stringify(this.playNormalSound)
    );
    window.localStorage.setItem(
      "playWarningSound",
      JSON.stringify(this.playWarningSound)
    );
    window.localStorage.setItem(
      "playErrorSound",
      JSON.stringify(this.playErrorSound)
    );
  }

  async beforeMount() {
    const { deviceID, devicename } = await DeviceApi.deviceInfo();
    this.deviceID = deviceID;
    this.deviceName = devicename;
    this.playNormalSound = JSON.parse(
      window.localStorage.getItem("playNormalSound") || "true"
    );
    this.playWarningSound = JSON.parse(
      window.localStorage.getItem("playWarningSound") || "true"
    );
    this.playErrorSound = JSON.parse(
      window.localStorage.getItem("playErrorSound") || "true"
    );
    this.resetEdits();
  }
}
</script>

<style scoped lang="scss">
#last-screening-event {
  background: black;
}
.split {
  display: flex;
  justify-content: space-between;
}
.cont {
  position: relative;
  min-height: 100%;
}
.bottom-nav {
  position: absolute;
  bottom: 10px;
  right: 0;
}
.selected-temp-range {
  font-size: 120%;
}
</style>
