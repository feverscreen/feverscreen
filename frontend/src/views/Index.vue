<template>
  <div class="home">
    <VideoStream msg="Welcome to Your Vue.js App" />
  </div>
</template>

<script>
// @ is an alias to /src
import VideoStream from "@/components/VideoStream.vue";

export default {
  name: "Index",
  components: {
    VideoStream
  }
};
</script>
