import { CameraConnectionState, Frame } from "./camera";
import { Face } from "./face";
import { HaarCascade } from "./haar-cascade";
import { ROIFeature } from "./worker-fns";

export type BoxOffset = "left" | "right" | "top" | "bottom";
export interface CropBox {
  left: number;
  right: number;
  top: number;
  bottom: number;
}
export interface BoundingBox {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

export interface TestAppState {
  thermalReference: ROIFeature | null;
  faces: Face[];
  cropBox: CropBox;
}

export interface AppState {
  currentFrame: Frame | null;
  cameraConnectionState: CameraConnectionState;
  thermalReference: ROIFeature | null;
  faces: Face[];
  paused: boolean;
  faceModel: HaarCascade | null;
  lastFrameTime: number;
  cropBox: CropBox;
}
