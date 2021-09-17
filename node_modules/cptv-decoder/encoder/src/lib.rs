use chrono::DateTime;
use cptv_shared::v2::types::{Cptv2Header, CptvFrame, FieldType, FrameData};
use js_sys::{Reflect, Uint8Array};
use libflate::gzip::Encoder;
use log::info;
use log::Level;
use std::io::Write;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsValue;

const X: u16 = 64u16;

const O: u16 = 1u16;

const ZERO: [u16; 15] = [
    O, X, X,
    X, O, X,
    X, O, X,
    X, O, X,
    X, X, O,
];

const ONE: [u16; 15] = [
    O, X, O,
    X, X, O,
    O, X, O,
    O, X, O,
    O, X, O,
];

const TWO: [u16; 15] = [
    O, X, O,
    X, O, X,
    O, O, X,
    X, X, O,
    X, X, X,
];

const THREE: [u16; 15] = [
    X, X, O,
    O, O, X,
    X, X, O,
    O, O, X,
    X, X, O,
];

const FOUR: [u16; 15] = [
    X, O, X,
    X, O, X,
    X, X, X,
    O, O, X,
    O, O, X,
];

const FIVE: [u16; 15] = [
    X, X, X,
    X, O, O,
    O, X, X,
    O, O, X,
    X, X, O,
];

const SIX: [u16; 15] = [
    O, X, X,
    X, O, O,
    X, X, X,
    X, O, X,
    X, X, X,
];

const SEVEN: [u16; 15] = [
    X, X, X,
    O, O, X,
    O, X, O,
    O, X, O,
    O, X, O,
];

const EIGHT: [u16; 15] = [
    X, X, X,
    X, O, X,
    X, X, X,
    X, O, X,
    X, X, X,
];

const NINE: [u16; 15] = [
    X, X, O,
    X, O, X,
    X, X, X,
    O, O, X,
    X, X, O,
];

const DIGITS: [[u16;15]; 10] = [ZERO, ONE, TWO, THREE, FOUR, FIVE, SIX, SEVEN, EIGHT, NINE];

const TEST_FRAME: [u16; 300] = [
    O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O,
    O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O,
    O, O, X, X, X, O, X, X, X, O, O, X, X, O, X, X, X, O, O, O,
    O, O, O, X, O, O, X, O, O, O, X, O, O, O, O, X, O, O, O, O,
    O, O, O, X, O, O, X, X, O, O, O, X, O, O, O, X, O, O, O, O,
    O, O, O, X, O, O, X, O, O, O, O, O, X, O, O, X, O, O, O, O,
    O, O, O, X, O, O, X, X, X, O, X, X, O, O, O, X, O, O, O, O,
    O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O,
    O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O,
    O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O,
    O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O,
    O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O,
    O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O,
    O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O,
    O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O,
];

const BG_FRAME: [u16; 300] = [
    O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O,
    O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O,
    O, O, X, X, X, O, X, X, X, O, O, X, X, O, X, X, X, O, O, O,
    O, O, O, X, O, O, X, O, O, O, X, O, O, O, O, X, O, O, O, O,
    O, O, O, X, O, O, X, X, O, O, O, X, O, O, O, X, O, O, O, O,
    O, O, O, X, O, O, X, O, O, O, O, O, X, O, O, X, O, O, O, O,
    O, O, O, X, O, O, X, X, X, O, X, X, O, O, O, X, O, O, O, O,
    O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O,
    O, O, O, O, O, O, O, X, X, O, O, O, X, X, O, O, O, O, O, O,
    O, O, O, O, O, O, O, X, O, X, O, X, O, O, O, O, O, O, O, O,
    O, O, O, O, O, O, O, X, X, O, O, X, O, X, O, O, O, O, O, O,
    O, O, O, O, O, O, O, X, O, X, O, X, O, X, O, O, O, O, O, O,
    O, O, O, O, O, O, O, X, X, O, O, O, X, X, O, O, O, O, O, O,
    O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O,
    O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O,
];

fn paste_digit(frame: &mut [u16; 300], digit: &[u16; 15], x: usize, y: usize) {
    let stride = 20;
    let x = y * stride + x;
    frame[x] = digit[0];
    frame[x + 1] = digit[1];
    frame[x + 2] = digit[2];
    frame[x + stride] = digit[3];
    frame[x + stride + 1] = digit[4];
    frame[x + stride + 2] = digit[5];
    frame[x + (stride * 2)] = digit[6];
    frame[x + (stride * 2) + 1] = digit[7];
    frame[x + (stride * 2) + 2] = digit[8];
    frame[x + (stride * 3)] = digit[9];
    frame[x + (stride * 3) + 1] = digit[10];
    frame[x + (stride * 3) + 2] = digit[11];
    frame[x + (stride * 4)] = digit[12];
    frame[x + (stride * 4) + 1] = digit[13];
    frame[x + (stride * 4) + 2] = digit[14];
}

fn set_number(frame: &[u16; 300], number: u32) -> [u16; 300] {
    let mut output = frame.clone();
    if number < 10 {
        paste_digit(&mut output, &DIGITS[number as usize], 8, 8);
    } else if number < 100 {
        let right = number % 10;
        let left = number / 10;
        paste_digit(&mut output, &DIGITS[left as usize], 6, 8);
        paste_digit(&mut output, &DIGITS[right as usize], 10, 8);
    } else if number < 1000 {
        let right = number % 10;
        let mid = number / 10 % 10;
        let left = number / 100;
        paste_digit(&mut output, &DIGITS[left as usize], 4, 8);
        paste_digit(&mut output, &DIGITS[mid as usize], 8, 8);
        paste_digit(&mut output, &DIGITS[right as usize], 12, 8);
    }
    output
}

#[wasm_bindgen(js_name = createTestCptvFile)]
pub fn create_test_cptv_file(params: JsValue) -> Uint8Array {
    init_console();
    // Get all the things we can from params, and create a file.
    let width = 20;
    let height = 15;

    let duration_seconds = Reflect::get(&params, &JsValue::from_str("duration"))
        .unwrap_or(JsValue::from_f64(10.0))
        .as_f64()
        .unwrap();

    // Assume that duration is a positive integer number of seconds for the purposes of generating
    // test files.
    let duration_seconds = duration_seconds.round() as usize;

    // NOTE: All of these unwraps on variables are "safe" because we're setting defaults for these params
    //  in the JS calling layer
    let has_background_frame = Reflect::get(&params, &JsValue::from_str("hasBackgroundFrame"))
        .unwrap_or(JsValue::from_bool(false))
        .as_bool()
        .unwrap();

    let recording_date_time = Reflect::get(&params, &JsValue::from_str("recordingDateTime"))
        .unwrap()
        .as_string()
        .unwrap();

    let recording_date_time =
        DateTime::parse_from_rfc3339(&recording_date_time).expect("Date parse error");

    let brand = Reflect::get(&params, &JsValue::from_str("brand"))
        .unwrap()
        .as_string();

    let model = Reflect::get(&params, &JsValue::from_str("model"))
        .unwrap()
        .as_string();

    let device_id = Reflect::get(&params, &JsValue::from_str("deviceId"))
        .unwrap()
        .as_f64()
        .map(|x| x as u32);

    let serial_number = Reflect::get(&params, &JsValue::from_str("serialNumber"))
        .unwrap()
        .as_f64()
        .map(|x| x as u32);

    let firmware_version = Reflect::get(&params, &JsValue::from_str("firmwareVersion"))
        .unwrap()
        .as_string();

    let motion_config = Reflect::get(&params, &JsValue::from_str("motionConfig"))
        .unwrap()
        .as_string();

    let preview_secs = Reflect::get(&params, &JsValue::from_str("previewSecs"))
        .unwrap()
        .as_f64()
        .map(|x| x as u8);

    let latitude = Reflect::get(&params, &JsValue::from_str("latitude"))
        .unwrap()
        .as_f64()
        .map(|x| x as f32);

    let longitude = Reflect::get(&params, &JsValue::from_str("longitude"))
        .unwrap()
        .as_f64()
        .map(|x| x as f32);

    let meta = Cptv2Header {
        timestamp: (recording_date_time.timestamp() * 1000 * 1000) as u64,
        width,
        height,
        compression: 0,
        device_name: "Test device".to_string(),
        fps: 1,
        brand,
        model,
        device_id,
        serial_number,
        firmware_version,
        motion_config,
        preview_secs,
        latitude,
        longitude,
        loc_timestamp: None,
        altitude: None,
        accuracy: None,
        has_background_frame,
    };

    let num_header_fields = &mut 0;
    let mut output: Vec<u8> = Vec::new();
    output.extend_from_slice(&b"CPTV"[..]);
    output.push(2);
    output.push(b'H');
    output.push(*num_header_fields);
    let header_fields_pos = output.len() - 1;

    push_field(
        &mut output,
        &meta.timestamp,
        FieldType::Timestamp,
        num_header_fields,
    );
    push_field(
        &mut output,
        &meta.width,
        FieldType::Width,
        num_header_fields,
    );
    push_field(
        &mut output,
        &meta.height,
        FieldType::Height,
        num_header_fields,
    );
    push_field(
        &mut output,
        &meta.compression,
        FieldType::Compression,
        num_header_fields,
    );
    push_field(
        &mut output,
        &meta.fps,
        FieldType::FrameRate,
        num_header_fields,
    );
    push_string(
        &mut output,
        &meta.device_name,
        FieldType::DeviceName,
        num_header_fields,
    );

    if let Some(brand) = meta.brand {
        push_string(
            &mut output,
            &brand,
            FieldType::Brand,
            num_header_fields,
        );
    }

    if let Some(model) = meta.model {
        push_string(
            &mut output,
            &model,
            FieldType::Model,
            num_header_fields,
        );
    }

    if let Some(device_id) = meta.device_id {
        push_field(
            &mut output,
            &device_id,
            FieldType::DeviceID,
            num_header_fields,
        );
    }

    if let Some(serial_number) = meta.serial_number {
        push_field(
            &mut output,
            &serial_number,
            FieldType::CameraSerial,
            num_header_fields,
        );
    }

    if let Some(firmware_version) = meta.firmware_version {
        push_string(
            &mut output,
            &firmware_version,
            FieldType::FirmwareVersion,
            num_header_fields,
        );
    }

    if let Some(motion_config) = &meta.motion_config {
        push_string(
            &mut output,
            motion_config,
            FieldType::MotionConfig,
            num_header_fields,
        );
    }
    if let Some(preview_secs) = &meta.preview_secs {
        push_field(
            &mut output,
            preview_secs,
            FieldType::PreviewSecs,
            num_header_fields,
        );
    }
    if let Some(latitude) = &meta.latitude {
        push_field(
            &mut output,
            latitude,
            FieldType::Latitude,
            num_header_fields,
        );
    }
    if let Some(longitude) = &meta.longitude {
        push_field(
            &mut output,
            longitude,
            FieldType::Longitude,
            num_header_fields,
        );
    }
    if let Some(loc_timestamp) = &meta.loc_timestamp {
        push_field(
            &mut output,
            loc_timestamp,
            FieldType::LocTimestamp,
            num_header_fields,
        );
    }
    if let Some(altitude) = &meta.altitude {
        push_field(
            &mut output,
            altitude,
            FieldType::Altitude,
            num_header_fields,
        );
    }
    if let Some(accuracy) = &meta.accuracy {
        push_field(
            &mut output,
            accuracy,
            FieldType::Accuracy,
            num_header_fields,
        );
    }
    if meta.has_background_frame {
        push_field(
            &mut output,
            &meta.has_background_frame,
            FieldType::BackgroundFrame,
            num_header_fields,
        );
    }
    output[header_fields_pos] = *num_header_fields;
    let mut packed_frame_data = Vec::new();

    let mut delta_encoded_frames: Vec<Vec<u8>> = Vec::new();
    let mut all_frames: Vec<CptvFrame> = Vec::new();

    if meta.has_background_frame {
        let mut background_frame = CptvFrame::new_with_dimensions(20, 15);
        background_frame.is_background_frame = true;
        background_frame.image_data = FrameData::with_dimensions_and_data(20, 15, &BG_FRAME);
        delta_encoded_frames.push(delta_encode_frame(all_frames.last(), &background_frame));
        all_frames.push(background_frame);
    }


    // + 1 because a 1 second recording still needs two frames, a start and an end
    for seconds in 0..duration_seconds + 1 {
        let mut test_frame = CptvFrame::new_with_dimensions(20, 15);
        test_frame.image_data = FrameData::with_dimensions_and_data(20, 15, &set_number(&TEST_FRAME, seconds as u32));
        delta_encoded_frames.push(delta_encode_frame(all_frames.last(), &test_frame));
        all_frames.push(test_frame);
    }
    for (frame_num, (delta_encode_frame, frame)) in delta_encoded_frames
        .iter()
        .zip(all_frames.iter())
        .enumerate()
    {
        pack_frame(&mut packed_frame_data, frame, delta_encode_frame, frame_num);
    }

    output.extend_from_slice(&packed_frame_data);

    let mut encoder = Encoder::new(Vec::new()).unwrap();
    encoder.write_all(&output).unwrap();
    let output = encoder.finish().into_result().unwrap();

    unsafe { Uint8Array::view(&output) }
}

fn push_field<T: Sized>(output: &mut Vec<u8>, value: &T, code: FieldType, count: &mut u8) -> usize {
    let size = std::mem::size_of_val(value);
    output.push(size as u8);
    output.push(code as u8);
    let value_offset = output.len();
    output.extend_from_slice(unsafe {
        std::slice::from_raw_parts(value as *const T as *const u8, size)
    });
    *count += 1;
    value_offset
}

fn init_console() {
    console_error_panic_hook::set_once();
    let _ = match console_log::init_with_level(Level::Info) {
        Ok(x) => x,
        Err(_) => (),
    };
}

fn delta_encode_frame(prev_frame: Option<&CptvFrame>, frame: &CptvFrame) -> Vec<u8> {
    let mut output: Vec<u8> = match prev_frame {
        Some(prev_frame) => prev_frame
            .image_data
            .snaking_iter()
            .zip(frame.image_data.snaking_iter()) // Snake iterator
            .map(|(a, b)| (b as i8 - a as i8) as u8)
            .collect(),
        None => frame.image_data.snaking_iter().map(|x| x as u8).collect(),
    };

    let mut prev = output[0];
    for i in 1..output.len() {
        let tmp = output[i];
        output[i] = (output[i] as i8 - prev as i8) as u8;
        prev = tmp;
    }
    output
}

fn pack_frame(
    frame_bytes: &mut Vec<u8>,
    frame: &CptvFrame,
    delta_encoded_frame: &[u8],
    frame_num: usize,
) {
    let bits_per_pixel = 8u8;

    let num_frame_header_fields = &mut 0;
    // Write the frame header
    frame_bytes.push(b'F');
    frame_bytes.push(*num_frame_header_fields);
    let field_count_pos = frame_bytes.len() - 1;

    // Take into account the 3 additional bytes for the first seeded pixel.
    let frame_size = ((frame.image_data.width() * frame.image_data.height()) as u32
        * (bits_per_pixel / 8) as u32)
        + 3;
    push_field(
        frame_bytes,
        &frame_size,
        FieldType::FrameSize,
        num_frame_header_fields,
    );
    push_field(
        frame_bytes,
        &bits_per_pixel,
        FieldType::BitsPerPixel,
        num_frame_header_fields,
    );

    // Since we're at 1ps for test recordings, increment time_on by 1000ms per frame
    push_field(
        frame_bytes,
        &(10000u32 + (frame_num as u32 * 1000u32)),
        FieldType::TimeOn,
        num_frame_header_fields,
    );
    //if let Some(last_ffc_time) = frame.last_ffc_time {
    // Last FFC time was 10 seconds before video start
    push_field(
        frame_bytes,
        &10u32,
        FieldType::LastFfcTime,
        num_frame_header_fields,
    );
    //}
    // This seems problematic for our player?
    if frame.is_background_frame {
        push_field(
            frame_bytes,
            &frame.is_background_frame,
            FieldType::BackgroundFrame,
            num_frame_header_fields,
        );
    }
    frame_bytes[field_count_pos] = *num_frame_header_fields;
    // Push the first px as u32, which should (maybe) be aligned?
    let first_px = delta_encoded_frame[0] as i32;
    frame_bytes.push(((first_px & 0x000000ff) >> 0) as u8);
    frame_bytes.push(((first_px & 0x0000ff00) >> 8) as u8);
    frame_bytes.push(((first_px & 0x00ff0000) >> 16) as u8);
    frame_bytes.push(((first_px as u32 & 0xff000000) >> 24) as u8);

    frame_bytes.extend_from_slice(&delta_encoded_frame[1..]);
}

fn push_string(output: &mut Vec<u8>, value: &str, code: FieldType, count: &mut u8) {
    output.push(value.len() as u8);
    output.push(code as u8);
    output.extend_from_slice(value.as_bytes());
    *count += 1;
}
