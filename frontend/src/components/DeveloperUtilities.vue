<template>
  <v-card flat>
    <v-container class="cont" height="calc(100vh - 112px)">
      <v-card>
        <v-card-actions>
          <v-btn class="ml-6" @click="skipWarmup">Skip warmup period</v-btn>
          <v-switch
            v-if="!disableRecordUserActivity"
            class="pl-6"
            v-model="recordUserActivity"
            label="Record User Activities"
          />
          <v-switch
            class="pl-6"
            v-model="qrMode"
            label="Enable QR mode"
            :disabled="cameraAvailable"
          />
        </v-card-actions>
        <VideoStream
          :frame="state.currentFrame.frame"
          :face="state.face"
          :min="state.currentFrame.analysisResult.heatStats.min"
          :max="state.currentFrame.analysisResult.heatStats.max"
          :crop-box="editedThermalRefMask"
          @crop-changed="onMaskChanged"
          :crop-enabled="false"
          :recording="isRecording"
        />
        <div class="buttons">
          <div v-if="isRunningInAndroidWebview">
            To make recordings this needs to be running inside a browser, not
            the Te Kahu Ora app.
          </div>
          <div v-else>
            <v-btn center @click="toggleRecording" class="mb-4">
              {{ !isRecording ? "Record" : "Stop Recording" }}
            </v-btn>
          </div>
        </div>
      </v-card>
    </v-container>
  </v-card>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import VideoStream from "@/components/VideoStream.vue";
import { State } from "@/main";
import { AppState, CropBox } from "@/types";
import { ObservableDeviceApi as DeviceApi } from "@/main";
import QrScanner from "qr-scanner";

function download(dataurl: string) {
  const a = document.createElement("a");
  a.href = dataurl;
  a.setAttribute("download", dataurl);
  a.click();
}

@Component({
  components: {
    VideoStream
  }
})
export default class DeveloperUtilities extends Vue {
  private editedThermalRefMask: CropBox | null = null;
  private isRecording = false;
  private enableQR = false;

  get cameraAvailable(){
    return this.enableQR;
  }

  get recordUserActivity() {
    return DeviceApi.RecordUserActivity;
  }

  set recordUserActivity(enable: boolean) {
    DeviceApi.RecordUserActivity = enable;
  }

  get disableRecordUserActivity() {
    return DeviceApi.DisableRecordUserActivity;
  }

  get qrMode() {
    return DeviceApi.RegisterQRID;
  }

  set qrMode(enable: boolean) {
    DeviceApi.RegisterQRID = enable;
  }

  skipWarmup() {
    this.$root.$children[0].$children[0].$emit("skip-warmup");
  }

  onMaskChanged(box: CropBox) {
    this.editedThermalRefMask = box;
  }

  get state(): AppState {
    return State;
  }

  get isRunningInAndroidWebview(): boolean {
    return window.navigator.userAgent === "feverscreen-app";
  }

  async toggleRecording() {
    const { recording, processor } = await DeviceApi.recorderStatus();
    if (!processor) {
      return false;
    }
    if (recording) {
      download(DeviceApi.DOWNLOAD_RECORDING);
      this.isRecording = false;
    } else {
      this.isRecording = await DeviceApi.startRecording();
    }
  }

  async mounted() {
    const { recording } = await DeviceApi.recorderStatus();
    this.enableQR = !(await QrScanner.hasCamera());
    this.isRecording = recording;
  }
}
</script>

<style scoped lang="scss">
.buttons {
  margin-top: 15px;
}
</style>
