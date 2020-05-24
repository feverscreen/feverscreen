import { ROIFeature} from "./processing.js";
const sizeDelta = 5;
const centerMaxDelta = 5;
const maxFrameSkipNS =6 ; //~6 frames
const maxFrameSkip =6 ; //~6 frames

let FaceID = 1;

export class Face {
  framesMissing: number;
  id: number;
  constructor(public roi: ROIFeature, public forehead: ROIFeature, public frameTime: number) {
    this.id = 0;
    this.framesMissing = 0;
  }

  assignID(){
    this.id = FaceID;
    FaceID++;
  }

  active():boolean{
    return this.framesMissing <= maxFrameSkip
  }

  stillCurrent(currentTime: number): boolean {
    return this.framesSince(currentTime) <= maxFrameSkipNS;
  }

  update(other: Face) {
    this.roi = other.roi;
    this.forehead = other.roi;
    this.framesMissing = 0;
  }

  framesSince(currentTime: number): number {
    return currentTime - this.frameTime;
  }

  compare(other: ROIFeature) {
    const deltaX = this.roi.midX() - other.midX();
    const deltaY = this.roi.midY() - other.midY();

    const deltaWidth = this.roi.width() - other.width();
    const deltaHeight = this.roi.height() - other.height();

    return (
      this.roi.overlap(other.x0, other.y0, other.x1, other.y1) &&
      deltaX + deltaY < 2 * centerMaxDelta &&
      deltaWidth + deltaHeight < 2 * sizeDelta
    );
  }
}
