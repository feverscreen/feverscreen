<template>
  <div v-if="hasFakeThermalCamera">
    <label>
      Cptv files:
      <v-select
        v-model="selectedFile"
        @change="selectAndPlayVideo"
        :items="cptvFiles"
      />
    </label>
    <label>
      Repeat:
      <v-text-field type="number" v-model="repeatCount" />
    </label>
    <v-btn @click="togglePlayback()" :disabled="!hasFiles">
      {{ paused ? "Play" : "Pause" }}
    </v-btn>
    <v-btn @click="listFiles()">Refresh files</v-btn>
  </div>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue } from "vue-property-decorator";
import { FakeThermalCameraApi } from "@/api/api";

@Component
export default class FakeThermalCameraControls extends Vue {
  @Prop() public paused!: boolean;
  @Prop() public playingLocal!: boolean;
  private hasFakeThermalCamera = false;
  private cptvFiles: string[] = [];
  private selectedFile = "";
  private repeatCount = 10;
  private currentPlayingFile = "";

  get hasFiles(): boolean {
    return this.cptvFiles.length !== 0 && this.selectedFile !== "";
  }

  async beforeMount() {
    this.hasFakeThermalCamera = await FakeThermalCameraApi.isFakeThermalCamera();
    if (this.hasFakeThermalCamera) {
      await FakeThermalCameraApi.stopPlayback();
      await this.listFiles();
    }
  }

  @Emit("toggle-playback")
  async selectAndPlayVideo() {
    this.currentPlayingFile = this.selectedFile;
    if (!this.playingLocal) {
      return !(await FakeThermalCameraApi.playbackCptvFile(
        this.selectedFile,
        this.repeatCount
      ));
    } else {
      return !this.paused;
    }
  }

  @Emit()
  async togglePlayback() {
    if (!this.currentPlayingFile) {
      return this.selectAndPlayVideo();
    }
    if (!this.playingLocal) {
      if (!this.paused) {
        return await FakeThermalCameraApi.pausePlayback();
      } else {
        return !(await FakeThermalCameraApi.resumePlayback());
      }
    } else {
      return !this.paused;
    }
  }
  async listFiles() {
    this.cptvFiles = await FakeThermalCameraApi.listFakeThermalCameraFiles();
    if (this.cptvFiles.length) {
      this.selectedFile = this.cptvFiles[0];
    }
  }
}
</script>

<style scoped></style>
