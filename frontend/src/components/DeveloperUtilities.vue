<template>
  <v-card flat height="calc(100vh - 112px)">
    <v-container class="cont">
      <v-card>
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
      <v-card>
        <v-card-actions>
          <v-btn class="ml-6" @click="skipWarmup">Skip warmup period</v-btn>
          <v-switch
            class="pl-6"
            v-model="recordUserActivity"
            @change="onRecordUserActivity"
            label="Record User Activities"
          />
        </v-card-actions>
      </v-card>
    </v-container>
  </v-card>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import VideoStream from "@/components/VideoStream.vue";
import { State } from "@/main";
import { AppState, CropBox } from "@/types";
import { DeviceApi } from "@/api/api";

function download(dataurl: string) {
  const a = document.createElement("a");
  a.href = dataurl;
  a.setAttribute("download", dataurl);
  a.click();
}

@Component({
  components: {
    VideoStream,
  },
})
export default class DeveloperUtilities extends Vue {
  private editedThermalRefMask: CropBox | null = null;
  private recordUserActivity = DeviceApi.recordUserActivity;
  private isRecording = false;

  skipWarmup() {
    this.$root.$children[0].$children[0].$emit("skip-warmup");
  }

  async onRecordUserActivity() {
    DeviceApi.recordUserActivity = this.recordUserActivity;
    window.localStorage.setItem(
      "recordUserActivity",
      this.recordUserActivity ? "true" : "false"
    );
    if (!this.recordUserActivity) {
      const { recording } = await DeviceApi.recorderStatus();
      if (recording) {
        DeviceApi.stopRecording();
      }
    }
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
    this.isRecording = recording;
  }
}
</script>

<style scoped lang="scss">
.buttons {
  margin-top: 15px;
}
</style>
