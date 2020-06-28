<template>
  <div v-if="hasFakeThermalCamera">
    <label>
      Cptv files:
      <v-select v-model="selectedFile" :items="cptvFiles" />
    </label>
    <label>
      Repeat:
      <v-text-field type="number" v-model="repeatCount" />
    </label>
    <v-btn @click="selectAndPlayVideo()" :disabled="!hasFiles">
      Play
    </v-btn>
    <v-btn @click="togglePlayback()" :disabled="!hasFiles">
      Pause
    </v-btn>
    <v-btn @click="listFiles()">Refresh files</v-btn>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { FakeThermalCameraApi } from "@/api/api";

@Component
export default class FakeThermalCameraControls extends Vue {
  private hasFakeThermalCamera = false;
  private cptvFiles: string[] = [];
  private selectedFile = "";
  private isPaused = true;
  private repeatCount = 10;

  get hasFiles(): boolean {
    return this.cptvFiles.length !== 0;
  }

  async beforeMount() {
    this.hasFakeThermalCamera = await FakeThermalCameraApi.isFakeThermalCamera();
    if (this.hasFakeThermalCamera) {
      await this.listFiles();
    }
  }
  async selectAndPlayVideo() {
    this.isPaused = await FakeThermalCameraApi.playbackCptvFile(
      this.selectedFile,
      this.repeatCount
    );
  }
  async togglePlayback() {
    if (!this.isPaused) {
      this.isPaused = await FakeThermalCameraApi.pausePlayback();
    } else {
      this.isPaused = !(await FakeThermalCameraApi.resumePlayback());
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
