import { ROIFeature, FeatureState } from "./processing.js";
const sizeDelta = 5;
const centerMaxDelta = 5;
const maxFrameSkipNS =6 ; //~6 frames
let FaceID = 0;

export class Face {

  id: number;
  constructor(public roi: ROIFeature, public forehead: ROIFeature, public frameTime: number) {
    this.id = FaceID;
    FaceID++;
  }

  stillCurrent(currentTime: number): boolean {
    return this.framesSince(currentTime) <= maxFrameSkipNS;
  }
  update(other: Face) {
    this.roi = other.roi;
    this.forehead = other.roi;
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


export function trackFaces(frameTime: number, faces: Face[], frameROI: Face[]): [Face[],Face[]] {
  // faces = faces.filter(face => face.stillCurrent(frame));
  let currentFaces = [];
  let lostFaces = [];
  for (const face of faces) {
    if(!face.stillCurrent(frameTime)) {
      lostFaces.push(face);
      continue;
    }
    let index = -1;
    for (let i = 0; i < frameROI.length; i++) {
      if (face.compare(frameROI[i].roi)) {
        index = i;
        face.frameTime = frameTime;
        break;
      }
    }

    if (index != -1) {
      face.update(frameROI.splice(index, 1)[0]);
      currentFaces.push(face);
    }else{
      lostFaces.push(face);
    }
  }
  // new faces from whats unmatched
  for (const roi of frameROI) {
    currentFaces.push(roi);
  }

  return [currentFaces,lostFaces];
}
//
// export function trackCircle(faces: Face[]){
//
// }
//
// export function trackFaces(frameTime: number, faces: Face[], frameROI: ROIFeature[]): [Face[],Face[]] {
//   // faces = faces.filter(face => face.stillCurrent(frame));
//   let currentFaces = [];
//   let lostFaces = [];
//   for (const face of faces) {
//     if(!face.stillCurrent(frameTime)) {
//       lostFaces.push(face);
//       continue;
//     }
//     let index = -1;
//     for (let i = 0; i < frameROI.length; i++) {
//       if (face.compare(frameROI[i])) {
//         index = i;
//         face.frameTime = frameTime;
//         break;
//       }
//     }
//
//     currentFaces.push(face);
//     if (index != -1) {
//       face.roi = frameROI.splice(index, 1)[0];
//     }
//   }
//   // new faces from whats unmatched
//   for (const roi of frameROI) {
//     currentFaces.push(new Face(roi, frameTime));
//   }
//
//   return [currentFaces,lostFaces];
// }
