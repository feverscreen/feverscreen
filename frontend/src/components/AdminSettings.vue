<template>
  <v-card>
    <v-toolbar color="light-blue" dark>
      <v-toolbar-title>Settings</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn text @click="close">
        close
      </v-btn>
      <template v-slot:extension>
        <v-tabs centered v-model="tab">
          <v-tab v-for="item in tabItems" :key="item.tab">{{ item.tab }}</v-tab>
        </v-tabs>
      </template>
    </v-toolbar>
    <v-tabs-items touchless v-model="tab">
      <v-tab-item v-for="item in tabItems" :key="item.tab">
        <component :is="item.content" />
      </v-tab-item>
    </v-tabs-items>
  </v-card>
</template>

<script lang="ts">
import { Component, Emit, Vue } from "vue-property-decorator";
import CalibrationSettings from "@/components/CalibrationSettings.vue";
import DeviceInfo from "@/components/DeviceInfo.vue";

interface TabItem {
  tab: string;
  content: any;
}

@Component({
  components: {
    CalibrationSettings,
    DeviceInfo
  }
})
export default class AdminSettings extends Vue {
  private tab: TabItem | null = null;
  private tabItems: TabItem[] = [
    {
      tab: "Calibration",
      content: CalibrationSettings
    },
    {
      tab: "Device info",
      content: DeviceInfo
    }
  ];

  @Emit("closed")
  close() {
    return true;
  }
}
</script>

<style scoped lang="scss"></style>
