use crate::get_frame_num;
use crate::screening_state::{ScreeningState, ScreeningValue};
use crate::types::{Circle, FaceInfo};
use imgref::Img;
use log::Level;
#[allow(unused)]
use log::{info, trace, warn};
use once_cell::sync::Lazy;
use std::cell::{Cell, RefCell};
use std::collections::HashMap;
use std::iter::{Skip, Take};
use std::slice::{ChunksExact, ChunksExactMut};
use wasm_bindgen::prelude::*;

pub const WIDTH: usize = 120;
pub const HEIGHT: usize = 160;
pub const MOTION_BIT: u8 = 1 << 7;

pub struct ImageBuffers {
    pub median_smoothed: RefCell<Img<Vec<f32>>>,
    pub debug: RefCell<Img<Vec<f32>>>,
    pub radial_smoothed: RefCell<Img<Vec<f32>>>,
    pub edges: RefCell<Img<Vec<f32>>>,
    pub scratch: RefCell<Img<Vec<f32>>>,
    pub mask: RefCell<Img<Vec<u8>>>,
}

impl ImageBuffers {
    pub fn new() -> ImageBuffers {
        ImageBuffers {
            median_smoothed: RefCell::new(Img::new(vec![0.0f32; WIDTH * HEIGHT], WIDTH, HEIGHT)),
            debug: RefCell::new(Img::new(vec![0.0f32; WIDTH * HEIGHT], WIDTH, HEIGHT)),
            radial_smoothed: RefCell::new(Img::new(vec![0.0f32; WIDTH * HEIGHT], WIDTH, HEIGHT)),
            scratch: RefCell::new(Img::new(vec![0.0f32; WIDTH * HEIGHT], WIDTH, HEIGHT)),
            edges: RefCell::new(Img::new(vec![0.0f32; WIDTH * HEIGHT], WIDTH, HEIGHT)),
            mask: RefCell::new(Img::new(vec![0u8; WIDTH * HEIGHT], WIDTH, HEIGHT)),
        }
    }
}

pub struct FrameRingBuffer {
    pub num_frames: usize,
    pub buffer: Vec<u8>,
    pub index: usize,
    pub chunk_size: usize,
}

impl FrameRingBuffer {
    pub fn new(num_frames: usize, frame_len: usize) -> FrameRingBuffer {
        FrameRingBuffer {
            num_frames,
            chunk_size: frame_len,
            index: 0,
            buffer: vec![0; frame_len * num_frames],
        }
    }

    pub fn advance(&mut self) {
        self.index = (self.index + 1) % self.num_frames;
    }

    pub fn front_mut(&mut self) -> Take<Skip<ChunksExactMut<'_, u8>>> {
        self.buffer
            .chunks_exact_mut(self.chunk_size)
            .skip(self.index)
            .take(1)
    }

    #[allow(unused)]
    pub fn front(&self) -> Take<Skip<ChunksExact<'_, u8>>> {
        self.buffer
            .chunks_exact(self.chunk_size)
            .skip(self.index)
            .take(1)
    }

    pub fn clear(&mut self) {
        for px in &mut self.buffer {
            *px = 0;
        }
    }

    pub fn accumulate_into_slice(&self, slice: &mut [u8], mut existing_motion_count: usize) {
        // Start at the previous frame, and go back as far as we need to in order to accumulate enough motion, *if* the current frame
        // has even a little bit of motion.
        let ideal_motion_count = 4000;
        for (index, buffer) in self
            .buffer
            .rchunks_exact(self.chunk_size)
            .cycle()
            .skip((self.num_frames - 1) - self.index)
            .take(self.num_frames)
            .enumerate()
        {
            if index == 0 {
                // Clear out buffer first
                for (src, dest) in buffer.iter().zip(slice.iter_mut()) {
                    if *src != 0 {
                        existing_motion_count += 1;
                    }
                    *dest = *src;
                }
            } else {
                if existing_motion_count < ideal_motion_count {
                    for (src, dest) in buffer.iter().zip(slice.iter_mut()) {
                        if *dest == 0 && *src != 0 {
                            existing_motion_count += 1;
                        }
                        *dest |= *src;
                    }
                } else {
                    // Accumulated enough motion.
                    break;
                }
            }
        }
    }
}

pub static STATE_MAP: Lazy<HashMap<ScreeningState, Vec<ScreeningState>>> = Lazy::new(|| {
    [
        (
            ScreeningState::WarmingUp,
            vec![ScreeningState::Ready, ScreeningState::MissingThermalRef],
        ),
        (
            ScreeningState::HasBody,
            vec![
                ScreeningState::Ready,
                ScreeningState::HeadLock,
                ScreeningState::FaceLock,
                ScreeningState::FrontalLock,
                ScreeningState::TooFar,
                ScreeningState::Blurred,
                ScreeningState::MissingThermalRef,
            ],
        ),
        (
            ScreeningState::TooFar,
            vec![
                ScreeningState::Ready,
                ScreeningState::TooFar,
                ScreeningState::HasBody,
                ScreeningState::HeadLock,
                ScreeningState::FaceLock,
                ScreeningState::FrontalLock,
                ScreeningState::Blurred,
                ScreeningState::MissingThermalRef,
            ],
        ),
        (
            ScreeningState::Ready,
            vec![
                ScreeningState::TooFar,
                ScreeningState::HasBody,
                ScreeningState::HeadLock,
                ScreeningState::FaceLock,
                ScreeningState::FrontalLock,
                ScreeningState::Blurred,
                ScreeningState::MissingThermalRef,
            ],
        ),
        (
            ScreeningState::FaceLock,
            vec![
                ScreeningState::TooFar,
                ScreeningState::HasBody,
                ScreeningState::HeadLock,
                ScreeningState::FrontalLock,
                ScreeningState::Ready,
                ScreeningState::Blurred,
                ScreeningState::MissingThermalRef,
            ],
        ),
        (
            ScreeningState::FrontalLock,
            vec![
                ScreeningState::TooFar,
                ScreeningState::HasBody,
                ScreeningState::StableLock,
                ScreeningState::FaceLock,
                ScreeningState::HeadLock,
                ScreeningState::Ready,
                ScreeningState::Blurred,
                ScreeningState::MissingThermalRef,
            ],
        ),
        (
            ScreeningState::HeadLock,
            vec![
                ScreeningState::TooFar,
                ScreeningState::HasBody,
                ScreeningState::FaceLock,
                ScreeningState::FrontalLock,
                ScreeningState::Ready,
                ScreeningState::Blurred,
                ScreeningState::MissingThermalRef,
            ],
        ),
        (
            ScreeningState::StableLock,
            vec![
                ScreeningState::Measured,
                ScreeningState::HasBody,
                ScreeningState::FaceLock,
                ScreeningState::HeadLock,
                ScreeningState::Blurred,
                ScreeningState::FrontalLock,
            ],
        ),
        (
            ScreeningState::Blurred,
            vec![
                ScreeningState::HasBody,
                ScreeningState::FaceLock,
                ScreeningState::HeadLock,
                ScreeningState::FrontalLock,
                ScreeningState::StableLock,
            ],
        ),
        (ScreeningState::Measured, vec![ScreeningState::Ready]),
        (
            ScreeningState::MissingThermalRef,
            vec![
                ScreeningState::Ready,
                ScreeningState::TooFar,
                ScreeningState::HasBody,
                ScreeningState::Blurred,
            ],
        ),
    ]
    .iter()
    .cloned()
    .collect()
});

thread_local! {
    pub static MOTION_BUFFER: RefCell<FrameRingBuffer> = RefCell::new(FrameRingBuffer::new(30, 120 * 160));
    pub static BODY_SHAPE: RefCell<Vec<u8>> = RefCell::new(Vec::new());
    pub static FACE_SHAPE: RefCell<Vec<u8>> = RefCell::new(Vec::new());
    pub static FRAME_NUM: Cell<isize> = Cell::new(-1);
    pub static THERMAL_REF: Cell<Option<Circle>> = Cell::new(None);
    pub static IMAGE_BUFFERS: ImageBuffers = ImageBuffers::new();
    pub static FACE: Cell<Option<FaceInfo>> = Cell::new(None);
    pub static HAS_BODY: Cell<bool> = Cell::new(false);
    pub static BODY_AREA_WHEN_MEASURED: Cell<u32> = Cell::new(0);
    pub static BODY_AREA_THIS_FRAME: Cell<u32> = Cell::new(0);
    pub static SCREENING_STATE: Cell<ScreeningValue> = Cell::new(ScreeningValue { state: ScreeningState::Ready, count: 1 });
}

#[wasm_bindgen]
pub fn initialize(_width: JsValue, _height: JsValue) -> Result<(), JsValue> {
    // Init the console logging stuff on startup, so that wasm can print things
    // into the browser console.

    // TODO(jon): Remove this function
    console_error_panic_hook::set_once();
    console_log::init_with_level(Level::Debug).unwrap();
    Ok(())
}
