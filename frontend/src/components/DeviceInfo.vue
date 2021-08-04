<template>
  <v-card flat>
    <v-simple-table v-if="items">
      <template v-slot:default>
        <thead>
          <tr>
            <th class="text-left">Device config</th>
            <th class="text-left"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="[name, item] in items" :key="name">
            <td>{{ name }}</td>
            <td>{{ item }}</td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
  </v-card>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { AppState } from "@/types";
import { State } from "@/main";
import { DeviceApi } from "@/api/api";
import { CameraInfo, NetworkInterface } from "@/api/types";

@Component
export default class DeviceInfo extends Vue {
  private info: {
    devicename?: string;
    deviceID?: string;
    serial?: string;
  } = {};
  private networkInfo: {
    Interfaces?: NetworkInterface[];
    IPAddress?: string;
    Config?: { Online: boolean };
    Online?: boolean;
  } = {};
  private softwareVersion: {
    apiVersion?: number;
    appVersion?: string;
    binaryVersion?: string;
  } = {};

  get items() {
    return [
      ...Object.entries(this.info),
      ...Object.entries(this.softwareVersion),
      ...Object.entries(this.networkInfo),
      ...Object.entries(this.cameraInfo),
    ];
  }

  get cameraInfo() {
    const camera: CameraInfo = {
      ...State.currentFrame?.frameInfo.Camera,
    } as CameraInfo;
    return camera as any;
  }

  get state(): AppState {
    return State;
  }

  async beforeMount() {
    // Get all the device data.
    const info = await DeviceApi.deviceInfo();

    this.info = info;
    const networkInfo = await DeviceApi.networkInfo();
    let IPAddress = networkInfo.Interfaces.filter(
      (nic) => nic.IPAddresses !== null
    ).map((nic) => nic.IPAddresses![0])[0];
    IPAddress = IPAddress.substring(0, IPAddress.indexOf("/"));
    this.networkInfo = {
      Online: networkInfo.Config.Online,
      IPAddress,
    };

    const softwareVersion = await DeviceApi.softwareVersion();
    softwareVersion.binaryVersion = softwareVersion.binaryVersion.substring(
      0,
      10
    );
    const newLine = softwareVersion.appVersion.indexOf("\n");
    if (newLine !== -1) {
      softwareVersion.appVersion = softwareVersion.appVersion.substring(
        0,
        newLine
      );
    }
    this.softwareVersion = softwareVersion;
  }
}
</script>

<style scoped lang="scss"></style>
