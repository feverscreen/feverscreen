<template>
  <div v-if="hasFakeThermalCamera">
    <label>
      Cptv files:
      <select v-model="selectedFile">
        <option v-for="file in cptvFiles" :key="file">{{ file }}</option>
      </select>
    </label>
    <label>
      Repeat:
      <input type="number" v-model="repeatCount" />
    </label>
    <button @click="selectAndPlayVideo()" :disabled="!hasFiles">
      Play
    </button>
    <button @click="togglePlayback()" :disabled="!hasFiles">
      Pause
    </button>
    <button @click="listFiles()">Refresh files</button>
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
