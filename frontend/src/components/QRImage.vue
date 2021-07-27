<template>
  <div class="qr-container">
    <transition name="fade">
      <svg
        v-if="registered"
        class="qr-image registered"
        viewBox="0,0,72,65"
        width="86.4"
        height="78"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M65 7L28 55 7 37"
          stroke="#fff"
          stroke-width="13"
          stroke-linecap="round"
        />
      </svg>
      <svg
        class="qr-image"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0,0,1200,1200"
        :width="150"
        :height="150"
        fill="white"
        v-else
      >
        <path
          d="M576 96h48v48h-48zM672 96h48v48h-48zM576 144h48v48h-48zM624 144h48v48h-48zM672 144h48v48h-48zM480 192h48v48h-48zM528 192h48v48h-48zM576 192h48v48h-48zM672 192h48v48h-48zM480 240h48v48h-48zM528 240h48v48h-48zM624 240h48v48h-48zM480 288h48v48h-48zM576 288h48v48h-48zM624 288h48v48h-48zM672 288h48v48h-48zM480 336h48v48h-48zM672 336h48v48h-48zM480 384h48v48h-48zM576 384h48v48h-48zM672 384h48v48h-48zM480 432h48v48h-48zM528 432h48v48h-48zM624 432h48v48h-48zM672 432h48v48h-48zM96 480h48v48H96zM192 480h48v48h-48zM240 480h48v48h-48zM288 480h48v48h-48zM336 480h48v48h-48zM384 480h48v48h-48zM576 480h48v48h-48zM672 480h48v48h-48zM768 480h48v48h-48zM816 480h48v48h-48zM864 480h48v48h-48zM912 480h48v48h-48zM960 480h48v48h-48zM192 528h48v48h-48zM288 528h48v48h-48zM336 528h48v48h-48zM432 528h48v48h-48zM480 528h48v48h-48zM576 528h48v48h-48zM672 528h48v48h-48zM816 528h48v48h-48zM912 528h48v48h-48zM960 528h48v48h-48zM1008 528h48v48h-48zM1056 528h48v48h-48zM96 576h48v48H96zM192 576h48v48h-48zM384 576h48v48h-48zM432 576h48v48h-48zM480 576h48v48h-48zM576 576h48v48h-48zM624 576h48v48h-48zM720 576h48v48h-48zM864 576h48v48h-48zM960 576h48v48h-48zM1056 576h48v48h-48zM96 624h48v48H96zM144 624h48v48h-48zM240 624h48v48h-48zM288 624h48v48h-48zM480 624h48v48h-48zM576 624h48v48h-48zM816 624h48v48h-48zM864 624h48v48h-48zM960 624h48v48h-48zM1008 624h48v48h-48zM1056 624h48v48h-48zM96 672h48v48H96zM192 672h48v48h-48zM288 672h48v48h-48zM336 672h48v48h-48zM384 672h48v48h-48zM432 672h48v48h-48zM624 672h48v48h-48zM720 672h48v48h-48zM864 672h48v48h-48zM960 672h48v48h-48zM1008 672h48v48h-48zM480 720h48v48h-48zM528 720h48v48h-48zM576 720h48v48h-48zM624 720h48v48h-48zM672 720h48v48h-48zM720 720h48v48h-48zM768 720h48v48h-48zM912 720h48v48h-48zM528 768h48v48h-48zM576 768h48v48h-48zM672 768h48v48h-48zM768 768h48v48h-48zM816 768h48v48h-48zM480 816h48v48h-48zM528 816h48v48h-48zM624 816h48v48h-48zM672 816h48v48h-48zM720 816h48v48h-48zM768 816h48v48h-48zM912 816h48v48h-48zM1008 816h48v48h-48zM480 864h48v48h-48zM672 864h48v48h-48zM816 864h48v48h-48zM960 864h48v48h-48zM480 912h48v48h-48zM528 912h48v48h-48zM576 912h48v48h-48zM672 912h48v48h-48zM816 912h48v48h-48zM960 912h48v48h-48zM480 960h48v48h-48zM528 960h48v48h-48zM576 960h48v48h-48zM624 960h48v48h-48zM720 960h48v48h-48zM864 960h48v48h-48zM912 960h48v48h-48zM960 960h48v48h-48zM816 1008h48v48h-48zM864 1008h48v48h-48zM960 1008h48v48h-48zM1008 1008h48v48h-48zM480 1056h48v48h-48zM576 1056h48v48h-48zM624 1056h48v48h-48zM720 1056h48v48h-48zM864 1056h48v48h-48zM912 1056h48v48h-48zM960 1056h48v48h-48z"
        />
        <path fill="none" d="M146 146h236v236H146z" />
        <path d="M382 96H96v336h336V96h-50zm0 286H146V146h236v236z" />
        <path fill="none" d="M818 146h236v236H818z" />
        <path d="M1054 96H768v336h336V96h-50zm0 286H818V146h236v236z" />
        <path fill="none" d="M146 818h236v236H146z" />
        <path d="M382 768H96v336h336V768h-50zm0 286H146V818h236v236z" />
        <g>
          <path d="M192 192h144v144H192z" />
        </g>
        <g>
          <path d="M864 192h144v144H864z" />
        </g>
        <g>
          <path d="M192 864h144v144H192z" />
        </g>
      </svg>
    </transition>
    <p class="qr-text">{{ qrMessage }}</p>
  </div>
</template>

<script lang="ts">
import { Vue, Prop, Component } from "vue-property-decorator";

@Component
export default class QRImage extends Vue {
  @Prop({ required: true }) registered!: boolean;
  get qrMessage(): string {
    return this.registered ? "Registered" : "Present ID to register";
  }
}
</script>
<style lang="scss">
.qr-container {
  display: flex;
  position: absolute;
  margin-top: 1em;
  height: 150px;
  top: 500px;
  left: 650px;
  z-index: 2;
}
.qr-image {
  align-self: center;
  transition: top 0.2s ease-in-out;
  transition: opacity 0.2s ease-in-out;
  &.registered {
    margin-left: 2em;
  }
}
.qr-text {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 12px;
  line-height: 1em;
  color: white;
  font-family: "Open Sans", sans-serif;
  font-size: 60px;
  font-weight: 700;
  width: 6em;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
</style>
