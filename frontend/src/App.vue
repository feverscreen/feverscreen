<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/admin">Admin</router-link>
    </div>
    <router-view :frame="currentFrame" />
  </div>
</template>

<script lang="ts">
import { DeviceApi } from "@/api/api";
import { CameraConnection, CameraState, Frame, initApp } from "@/camera";
let connection: CameraConnection;

import { Component, Emit, Vue } from "vue-property-decorator";

@Component
export default class App extends Vue {
  private cameraState: { currentFrame: Frame | any } = CameraState;
  public get currentFrameCount(): number {
    // NOTE(jon): This is always zero if it's the fake thermal camera.
    if (this.cameraState.currentFrame.frameInfo) {
      return (this.cameraState.currentFrame as Frame).frameInfo.Telemetry
        .FrameCount;
    }
    return 0;
  }

  get currentFrame(): Frame {
    return this.cameraState.currentFrame;
  }

  @Emit("on-frame")
  private onFrame(frame: Frame) {
    this.cameraState.currentFrame = frame;
  }

  async beforeMount() {
    // On startup?
    console.log("Init app");
    const connection = initApp(this.onFrame);
  }
}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
