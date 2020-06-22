<template>
  <div class="home">
    <AdminScreening v-if="isAdminScreen" :frame="currentFrame" />
    <UserFacingScreening v-else />
  </div>
</template>

<script lang="ts">
// This is the default scanning view.
import AdminScreening from "@/components/AdminScreening.vue";
import UserFacingScreening from "@/components/UserFacingScreening.vue";
import { Component, Prop, Vue } from "vue-property-decorator";
import { Frame } from "@/camera";

@Component({
  components: {
    UserFacingScreening,
    AdminScreening
  }
})
export default class Main extends Vue {
  @Prop() public currentFrame!: Frame;
  get isAdminScreen(): boolean {
    return true;
  }
}
</script>
