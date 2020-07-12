<template>
  <div class="user-state" :class="[classNameForState, screeningResultClass]">
    <div class="center">
      <div v-if="hasScreeningResult" class="result">{{ screeningResult }}</div>
      <div class="message">{{ message }}</div>
    </div>
  </div>
</template>

<script lang="ts">
// Possible states:
// - Camera is still warming up
//  (this should still want to find the constant heat source, because we want to make
//   sure that's warming up at the same time)
// - Frame is empty, no head detected.
// - Head detected, but not centered.
// - More than one head detected in frame.
// - No constant heat-source detected.
// - Head detected, and forehead isolated.
// - Head has been front-on for x frames, with stable forehead lock.

// - Other states:
//      - Wifi has been lost (maybe don't care about this case now if we're wired?)
//      - FFC is happening
//      - Period *after* FFC, which we need to hide.
import { Component, Prop, Vue } from "vue-property-decorator";
import { DegreesCelsius, ScreeningState } from "@/types";

@Component
export default class UserFacingScreening extends Vue {
  @Prop({ required: true }) state!: ScreeningState;

  get temperatureIsNormal(): boolean {
    return true;
  }

  get temperatureIsHigherThanNormal(): boolean {
    return false;
  }

  get temperatureIsProbablyAnError(): boolean {
    return false;
  }

  get classNameForState() {
    return this.state.toLowerCase().replace("_", "-");
  }

  get screeningResultClass() {
    if (
      this.state === ScreeningState.STABLE_LOCK ||
      this.state === ScreeningState.LEAVING
    ) {
      return "okay"; // or possible-fever, or error-temp
    }
    return null;
  }

  get hasScreeningResult(): boolean {
    return this.screeningResultClass !== null;
  }

  get screeningResult(): DegreesCelsius {
    return new DegreesCelsius(36);
  }

  get message() {
    switch (this.state) {
      case ScreeningState.WARMING_UP:
        return "Please wait";
      case ScreeningState.MULTIPLE_HEADS:
        return "Only one person should be in front of the camera";
      case ScreeningState.READY:
      case ScreeningState.HEAD_LOCK:
      case ScreeningState.FACE_LOCK:
        return "Please stand on the mark and look forward";
      case ScreeningState.FRONTAL_LOCK:
        return "Stand still for a moment";
      case ScreeningState.STABLE_LOCK:
        if (this.temperatureIsNormal) {
          return `Your temperature is normal`;
        } else if (this.temperatureIsHigherThanNormal) {
          return "Your temperature is higher than normal";
        } else if (this.temperatureIsProbablyAnError) {
          return "Temperature anomaly, please check equipment";
        }
        break;
      case ScreeningState.LEAVING:
        return "You may go now";
    }
    return "";
  }
}
</script>

<style scoped lang="scss">
.user-state {
  position: absolute;
  width: 1920px;
  height: 1080px;
  zoom: 0.5;
  &.ready,
  &.face-lock,
  &.frontal-lock {
    background: #0096d7;
  }

  &.okay {
    background: #11a84c;
  }
  &.possible-fever {
    background: #a81c11;
  }
}
.center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 80%;
  text-align: center;
  color: white;
  font-family: "Open Sans Bold", sans-serif;
  font-size: 42px;
  > .result {
    font-size: 120px;
  }
}
</style>
