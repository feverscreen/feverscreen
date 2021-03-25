import { ObservableDeviceApi as DeviceApi } from "@/main";
import { Frame } from "@/camera";
import { ScreeningState } from "@/types";

function FrameHandler() {
  const secondsToMilliseconds = (seconds: number) => seconds * 1000;
  const isDeviceRecording = () =>
    DeviceApi.recorderStatus().then(({ recording }) => recording);
  return {
    startTimeInFrame: 0,
    startTimeOutFrame: 0,
    isRecording: isDeviceRecording(),
    hasMeasured: false,
    async process(frame: Frame) {
      const timeInFrame = this.getTimeInFrame(frame);
      const { hasExit, isInFrame } = this.isObjectStillInFrame(frame);
      this.measuredInFrame(frame);
      if (isInFrame && !this.isRecording) {
        await DeviceApi.startRecording();
        this.isRecording = await isDeviceRecording();
      } else if (hasExit && this.isRecording) {
        const shouldRecord =
          timeInFrame > secondsToMilliseconds(8) ||
          (this.hasMeasured && timeInFrame > secondsToMilliseconds(1));
        this.hasMeasured = false;
        await DeviceApi.stopRecording(shouldRecord);
        this.isRecording = await isDeviceRecording();
      }
    },
    measuredInFrame(frame: Frame) {
      const state = frame.analysisResult.nextState;
      this.hasMeasured =
        state === ScreeningState.MEASURED ? true : this.hasMeasured;
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
      const ThresholdSeconds = secondsToMilliseconds(3);
      const now = Date.now();
      this.startTimeOutFrame = isInFrame ? now : this.startTimeOutFrame;
      const currTimeOutFrame = Math.abs(now - this.startTimeOutFrame);
      const hasExit = currTimeOutFrame > ThresholdSeconds;
      this.startTimeOutFrame = hasExit ? Infinity : this.startTimeOutFrame;

      return hasExit;
    },
    // Even if doesn't detect object is in a frame does not mean it has left.
    isObjectStillInFrame(
      frame: Frame
    ): { isInFrame: boolean; hasExit: boolean } {
      const isInFrame = this.isObjectInFrame(frame);
      const hasExit = this.hasObjectExitFrame(frame);
      return { isInFrame, hasExit };
    },
    getTimeInFrame(frame: Frame): number {
      const now = Date.now();
      const { isInFrame, hasExit } = this.isObjectStillInFrame(frame);
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
  };
}

export default FrameHandler;
