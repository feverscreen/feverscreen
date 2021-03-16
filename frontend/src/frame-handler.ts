import {DeviceApi} from "@/api/api";
import {Frame} from "@/camera";
import {ScreeningState} from "@/types"

function FrameHandler() {
  const secondsToMiliseconds = (seconds: number) => seconds * 1000;
  const isDeviceRecording = async () => DeviceApi.recorderStatus().then(({recording}) => recording)
  return {
    startTimeInFrame: 0,
    startTimeOutFrame: 0,
    isRecording: isDeviceRecording(),
    async process(frame: Frame) {
      const timeInFrame = this.getTimeInFrame(frame);
      const {hasExit, isInFrame} = this.isObjectStillInFrame(frame);
      if (isInFrame && !this.isRecording) {
        await DeviceApi.startRecording();
        this.isRecording = await isDeviceRecording();
        console.log("Is Recording:", this.isRecording)
      } else if (hasExit && this.isRecording) {
        const shouldRecord = timeInFrame > secondsToMiliseconds(8);
        await DeviceApi.stopRecording(shouldRecord);
        console.log("Stop", timeInFrame, shouldRecord);
        this.isRecording = await isDeviceRecording();
        console.log("Is Recording:", this.isRecording)
      }
    },
    isObjectInFrame(frame: Frame): boolean {
      const state = frame.analysisResult.nextState;
      return (
        state === ScreeningState.HEAD_LOCK ||
        state === ScreeningState.LARGE_BODY ||
        state === ScreeningState.FRONTAL_LOCK ||
        state === ScreeningState.STABLE_LOCK ||
        state === ScreeningState.MULTIPLE_HEADS ||
        state === ScreeningState.MEASURED ||
        state === ScreeningState.TOO_FAR
      );
    },
    hasObjectExitFrame(frame: Frame): boolean {
      const isInFrame = this.isObjectInFrame(frame);
      const ThresholdSeconds = secondsToMiliseconds(3);
      const now = Date.now();
      this.startTimeOutFrame = isInFrame ? now : this.startTimeOutFrame;
      const currTimeOutFrame = Math.abs(now - this.startTimeOutFrame);
      const hasExit = currTimeOutFrame > ThresholdSeconds;
      this.startTimeOutFrame = hasExit ? Infinity : this.startTimeOutFrame;

      return hasExit;
    },
    isObjectStillInFrame(
      frame: Frame
    ): {isInFrame: boolean; hasExit: boolean} {
      const isInFrame = this.isObjectInFrame(frame);
      const hasExit = this.hasObjectExitFrame(frame);
      return {isInFrame, hasExit};
    },
    getTimeInFrame(frame: Frame): number {
      const now = Date.now();
      const {isInFrame, hasExit} = this.isObjectStillInFrame(frame);
      if (isInFrame) {
        this.startTimeInFrame =
          this.startTimeInFrame === 0 ? now : this.startTimeInFrame;
        return now - this.startTimeInFrame;
      } else if (this.startTimeInFrame === 0) {
        return 0;
      } else if (hasExit) {
        // Object has yet to enter frame
        const totalTimeInFrame = now - this.startTimeInFrame;
        this.startTimeInFrame = 0;
        return totalTimeInFrame;
      } else {
        return now - this.startTimeInFrame;
      }
    }
  }
}

export default FrameHandler
