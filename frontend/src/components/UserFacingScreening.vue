<template>
  <div><h1>User facing screening interface</h1></div>
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
//      - Wifi has been lost
//      - FFC is happening
//      - Period *after* FFC, which we need to hide.

export default {
  name: "UserFacingScreening",
  computed: {
    oneOrMoreHeadsDetected(): boolean {
      return false;
    },
    singleHeadDetected(): boolean {
      return true;
    },
    constantHeatSourceDetected(): boolean {
      return true;
    },
    foreheadDetected(): boolean {
      return false;
    },
    headIsInScanningRegion(): boolean {
      return false;
    },
    foreheadLockIsStable(): boolean {
      return false;
    }
  }
};
</script>

<style scoped></style>
