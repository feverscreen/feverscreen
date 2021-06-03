use crate::init::{BODY_AREA_THIS_FRAME, BODY_AREA_WHEN_MEASURED, SCREENING_STATE, STATE_MAP};
use crate::shape_processing::clear_body_shape;
use crate::{get_frame_num, point_is_in_triangle, FaceInfo, HeadLockConfidence, Rect};
#[allow(unused)]
use log::{info, trace, warn};
use std::fmt;
use wasm_bindgen::__rt::core::i8::MIN;
use wasm_bindgen::prelude::*;

const MIN_FACE_WIDTH: f32 = 35.0;

#[wasm_bindgen]
#[derive(Copy, Clone, PartialEq, Eq, Hash, Debug)]
pub enum ScreeningState {
    WarmingUp,
    Ready,
    HeadLock,
    TooFar,
    HasBody,
    FaceLock,
    FrontalLock,
    StableLock,
    Measured,
    MissingThermalRef,
    Blurred,
    AfterFfcEvent,
}

impl fmt::Display for ScreeningState {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        fmt::Debug::fmt(self, f)
    }
}

#[derive(Copy, Clone)]
pub struct ScreeningValue {
    pub state: ScreeningState,
    pub count: u32,
}

pub fn get_current_state() -> ScreeningValue {
    SCREENING_STATE.with(|prev| prev.get())
}

pub fn advance_screening_state(next: ScreeningState) {
    SCREENING_STATE.with(|prev| {
        let prev_val = prev.get();
        // info!("Next State: {}, Prev State: {}", next, prev_val.state);
        if prev_val.state != next {
            if prev_val.state != ScreeningState::Ready
                || (prev_val.state == ScreeningState::Ready && prev_val.count >= 3)
            {
                if let Some(allowed_next_states) = STATE_MAP.get(&prev_val.state) {
                    if allowed_next_states.contains(&next) {
                        prev.set(ScreeningValue {
                            state: next,
                            count: 1,
                        });
                    }
                }
            } else {
                // Prev state was ready, don't let it flip too quickly to something else.
                prev.set(ScreeningValue {
                    state: prev_val.state,
                    count: prev_val.count + 1,
                });
            }
        } else {
            prev.set(ScreeningValue {
                state: prev_val.state,
                count: prev_val.count + 1,
            });
        }
    });
}

fn demote_current_state() {
    SCREENING_STATE.with(|state| {
        let mut curr = state.get();
        curr.count = i32::max(curr.count as i32 - 2, 0) as u32;
        state.set(curr);
    });
}

fn face_is_too_small(face: &FaceInfo) -> bool {
    let width = face.head.top_left.distance_to(face.head.top_right);

    if width > MIN_FACE_WIDTH && face.head.area() >= 800.0 {
        return false;
    } else {
        let prev_state = get_current_state();
        if prev_state.state != ScreeningState::TooFar && width + 3.0 > MIN_FACE_WIDTH {
            // Don't flip-flop between too far and close enough.
            return false;
        }
        face.head.area() < 1000.0
    }
}

fn face_intersects_thermal_ref(face: &FaceInfo, thermal_ref_rect: Rect) -> bool {
    for p in [
        thermal_ref_rect.top_left(),
        thermal_ref_rect.top_right(),
        thermal_ref_rect.bottom_left(),
        thermal_ref_rect.bottom_right(),
    ]
    .iter()
    {
        if point_is_in_triangle(
            *p,
            face.head.top_left,
            face.head.top_right,
            face.head.bottom_left,
        ) || point_is_in_triangle(
            *p,
            face.head.top_left,
            face.head.top_right,
            face.head.bottom_right,
        ) {
            return true;
        }
    }
    return false;
}

fn face_is_front_on(face: &FaceInfo) -> bool {
    // TODO(jon): This needs to be better, we are already checking for this case.
    face.head_lock != HeadLockConfidence::Bad
}

fn face_has_moved_or_changed_in_size(face: &FaceInfo, prev_face: &Option<FaceInfo>) -> bool {
    match prev_face {
        Some(prev_face) => {
            let prev_area = prev_face.head.area();
            let next_area = face.head.area();
            let diff_area = f32::abs(next_area - prev_area);
            let percent_of_area = next_area * 0.40;
            // NOTE: Noticed there would be artifacts when no one was in camera, heads had same vals
            if diff_area == 0.0 || diff_area >= percent_of_area {
                return true;
            }
            [
                face.head.top_left.distance_to(prev_face.head.top_left),
                face.head
                    .bottom_left
                    .distance_to(prev_face.head.bottom_left),
                face.head
                    .bottom_right
                    .distance_to(prev_face.head.bottom_right),
                face.head.top_right.distance_to(prev_face.head.top_right),
            ]
            .iter()
            .filter(|&d| *d > 20.0)
            .count()
                != 0
        }
        None => true,
    }
}

// NOTE: This number might be better closer to 2500, basically over this amount of motion in a single
// frame we seem to always get slightly blurred images, and shouldn't use them to get stable locks.
const BLUR_SUM_THRESHOLD: u16 = 3000;

fn advance_state_with_face(
    face: FaceInfo,
    prev_face: Option<FaceInfo>,
    motion_sum_current_frame: u16,
) {
    if face_is_too_small(&face) {
        advance_screening_state(ScreeningState::TooFar);
    } else if motion_sum_current_frame > BLUR_SUM_THRESHOLD {
        advance_screening_state(ScreeningState::Blurred);
    } else if face_is_front_on(&face) && face.is_valid {
        if !face_has_moved_or_changed_in_size(&face, &prev_face) {
            // TODO(jon): Remove "FaceLock" now?
            let current_state = get_current_state();
            if current_state.state == ScreeningState::FrontalLock && current_state.count >= 1 {
                advance_screening_state(ScreeningState::StableLock);
            } else if current_state.state == ScreeningState::StableLock {
                advance_screening_state(ScreeningState::Measured);
                // Save body area:
                let body_area = BODY_AREA_THIS_FRAME.with(|a| a.get());
                BODY_AREA_WHEN_MEASURED.with(|area| area.set(body_area));
            } else {
                advance_screening_state(ScreeningState::FrontalLock);
            }
        } else {
            advance_screening_state(ScreeningState::FrontalLock);
            demote_current_state();
        }
    } else {
        advance_screening_state(ScreeningState::HeadLock);
    }
}

fn advance_state_without_face(
    has_body: bool,
    prev_frame_has_body: bool,
    motion_sum_current_frame: u16,
    too_close_to_ffc_event: bool,
) {
    let current_state = get_current_state();
    if has_body || prev_frame_has_body {
        // NOTE(jon): If the body_area is less than half of the measured body area, flip to ready
        if current_state.state == ScreeningState::Measured {
            let body_area_when_measured = BODY_AREA_WHEN_MEASURED.with(|a| a.get());
            let body_area_this_frame = BODY_AREA_THIS_FRAME.with(|a| a.get());
            if body_area_this_frame < body_area_when_measured / 2 {
                advance_screening_state(ScreeningState::Ready);
            } else {
                advance_screening_state(ScreeningState::HasBody);
            }
        } else if too_close_to_ffc_event {
            advance_screening_state(ScreeningState::AfterFfcEvent);
        } else if motion_sum_current_frame > BLUR_SUM_THRESHOLD {
            advance_screening_state(ScreeningState::Blurred);
        } else {
            advance_screening_state(ScreeningState::HasBody);
        }
    } else {
        if current_state.state == ScreeningState::Measured && current_state.count == 0 {
            advance_screening_state(ScreeningState::Measured);
        } else {
            advance_screening_state(ScreeningState::Ready);
        }
    }
}

pub fn advance_state(
    face: Option<FaceInfo>,
    prev_face: Option<FaceInfo>,
    thermal_ref_rect: Option<Rect>,
    has_body: bool,
    prev_frame_has_body: bool,
    motion_sum_current_frame: u16,
    too_close_to_ffc_event: bool,
) {
    match thermal_ref_rect {
        Some(_) => match face {
            Some(face) => advance_state_with_face(face, prev_face, motion_sum_current_frame),
            None => advance_state_without_face(
                has_body,
                prev_frame_has_body,
                motion_sum_current_frame,
                too_close_to_ffc_event,
            ),
        },
        None => advance_screening_state(ScreeningState::MissingThermalRef),
    }
}
