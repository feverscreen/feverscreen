pub mod types;
#[allow(unused)]
use log::{info, trace, warn};
use nom::bytes::streaming::take;
use nom::character::streaming::char;
use nom::number::streaming::{le_f32, le_u32, le_u64, le_u8};
use types::{Cptv2Header, CptvFrame, FieldType};
use crate::CptvHeader;

// TODO(jon): Move most of this to cptv_common.  cptv_common might end up having
// streaming and non-streaming versions, but I don't think we care too much at the moment.

pub fn decode_cptv2_header(i: &[u8]) -> nom::IResult<&[u8], CptvHeader> {
    let mut meta = Cptv2Header::new();
    let (i, val) = take(1usize)(i)?;
    let (_, _) = char('H')(val)?;
    let (i, num_header_fields) = le_u8(i)?;
    let mut outer = i;
    for _ in 0..num_header_fields {
        let (i, field_length) = le_u8(outer)?;
        let (i, field) = take(1usize)(i)?;
        let (_, field) = char(field[0] as char)(field)?;
        let (i, val) = take(field_length)(i)?;
        outer = i;
        let field_type = FieldType::from(field);
        match field_type {
            FieldType::Timestamp => {
                meta.timestamp = le_u64(val)?.1;
            }
            FieldType::Width => {
                meta.width = le_u32(val)?.1;
            }
            FieldType::Height => {
                meta.height = le_u32(val)?.1;
            }
            FieldType::Compression => {
                meta.compression = le_u8(val)?.1;
            }
            FieldType::DeviceName => {
                meta.device_name = String::from_utf8_lossy(val).into();
            }

            // Optional fields
            FieldType::FrameRate => meta.fps = le_u8(val)?.1,
            FieldType::CameraSerial => meta.serial_number = Some(le_u32(val)?.1),
            FieldType::FirmwareVersion => {
                meta.firmware_version = Some(String::from_utf8_lossy(val).into());
            }
            FieldType::Model => {
                meta.model = Some(String::from_utf8_lossy(val).into());
            }
            FieldType::Brand => {
                meta.brand = Some(String::from_utf8_lossy(val).into());
            }
            FieldType::DeviceID => {
                meta.device_id = Some(le_u32(val)?.1);
            }
            FieldType::MotionConfig => {
                meta.motion_config = Some(String::from_utf8_lossy(val).into());
            }
            FieldType::PreviewSecs => {
                meta.preview_secs = Some(le_u8(val)?.1);
            }
            FieldType::Latitude => {
                meta.latitude = Some(le_f32(val)?.1);
            }
            FieldType::Longitude => {
                meta.longitude = Some(le_f32(val)?.1);
            }
            FieldType::LocTimestamp => {
                meta.loc_timestamp = Some(le_u64(val)?.1);
            }
            FieldType::Altitude => {
                meta.altitude = Some(le_f32(i)?.1);
            }
            FieldType::Accuracy => {
                meta.accuracy = Some(le_f32(val)?.1);
            }
            FieldType::BackgroundFrame => {
                let has_background_frame = le_u8(val)?.1;
                // NOTE: We expect this to always be 1 if present
                meta.has_background_frame = has_background_frame == 1;
            }
            _ => {
                warn!("Unknown header field type {}, {}", field, field_length);
            }
        }
    }
    Ok((outer, CptvHeader::V2(meta)))
}

pub fn decode_frame_header_v2(
    data: &[u8],
    width: usize,
    height: usize,
) -> nom::IResult<&[u8], (&[u8], CptvFrame)> {
    let (i, val) = take(1usize)(data)?;
    let (_, _) = char('F')(val)?;
    let (i, num_frame_fields) = le_u8(i)?;

    let mut frame = CptvFrame::new_with_dimensions(width, height);
    let mut outer = i;
    for _ in 0..num_frame_fields as usize {
        let (i, field_length) = le_u8(outer)?;
        let (i, field) = take(1usize)(i)?;
        let (_, field_code) = char(field[0] as char)(field)?;
        let (i, val) = take(field_length)(i)?;
        outer = i;
        let fc = FieldType::from(field_code);
        match fc {
            FieldType::TimeOn => {
                frame.time_on = le_u32(val)?.1;
            }
            FieldType::BitsPerPixel => {
                frame.bit_width = le_u8(val)?.1;
            }
            FieldType::FrameSize => {
                frame.frame_size = le_u32(val)?.1;
            }
            FieldType::LastFfcTime => {
                // NOTE: Last ffc time is relative to time_on, so we need to adjust it accordingly
                // when printing the value.
                frame.last_ffc_time = Some(le_u32(val)?.1);
            }
            FieldType::LastFfcTempC => {
                frame.last_ffc_temp_c = Some(le_f32(val)?.1);
            }
            FieldType::FrameTempC => {
                frame.frame_temp_c = Some(le_f32(val)?.1);
            }
            FieldType::BackgroundFrame => {
                frame.is_background_frame = le_u8(val)?.1 == 1;
            }
            _ => {
                warn!(
                    "Unknown frame field type '{}', length: {}",
                    field_code as char, field_length
                );
            }
        }
    }
    assert!(frame.frame_size > 0);
    let (i, data) = take(frame.frame_size as usize)(outer)?;
    Ok((i, (data, frame)))
}

fn decode_image_data_v2(
    i: &[u8],
    mut current_px: i32,
    width: usize,
    height: usize,
    frame: &mut CptvFrame,
    prev_frame: &Option<CptvFrame>,
) {
    match prev_frame {
        Some(prev_frame) => {
            let prev_px = prev_frame.image_data[0][0] as i32;
            // Seed the initial pixel value
            assert!(prev_px + current_px <= u16::MAX as i32);
            assert!(prev_px + current_px >= 0);
            frame.image_data[0][0] = (prev_px + current_px) as u16;
            for (index, delta) in BitUnpacker::new(i, frame.bit_width)
                .take((width * height) - 1)
                .enumerate()
            {
                let index = index + 1;
                let y = index / width;
                let x = index % width;
                let x = if y & 1 == 1 { width - x - 1 } else { x };
                current_px += delta;
                let prev_px = prev_frame.image_data[y][x] as i32;

                assert!(prev_px + current_px <= u16::MAX as i32);
                assert!(prev_px + current_px >= 0);
                let px = (prev_px + current_px) as u16;

                // This keeps track of min/max.
                frame.image_data.set(x, y, px);
                assert!(y * width + x <= width * height);
            }
        }
        None => {
            // This is the first frame, so we don't need to use a previous frame
            frame.image_data[0][0] = current_px as u16;
            for (index, delta) in BitUnpacker::new(i, frame.bit_width)
                .take((width * height) - 1)
                .enumerate()
            {
                let index = index + 1;
                let y = index / width;
                let x = index % width;
                let x = if y & 1 == 1 { width - x - 1 } else { x };
                current_px += delta;
                let px = current_px as u16;

                // This keeps track of min/max.
                frame.image_data.set(x, y, px);
                assert!(y * width + x <= width * height);
            }
        }
    }
}

pub fn unpack_frame_v2(prev_frame: &Option<CptvFrame>, data: &[u8], frame: &mut CptvFrame) {
    let initial_px = {
        let mut accum: i32 = 0;
        accum |= (data[3] as i32) << 24;
        accum |= (data[2] as i32) << 16;
        accum |= (data[1] as i32) << 8;
        accum |= data[0] as i32;
        accum
    };
    decode_image_data_v2(
        &data[4..],
        initial_px,
        frame.image_data.width(),
        frame.image_data.height(),
        frame,
        prev_frame,
    );
}

#[inline(always)]
fn reverse_twos_complement(v: u32, width: u8) -> i32 {
    if v & (1 << (width - 1)) as u32 == 0 {
        v as i32
    } else {
        -(((!v + 1) & ((1 << width as u32) - 1)) as i32)
    }
}

pub struct BitUnpacker<'a> {
    input: &'a [u8],
    offset: usize,
    bit_width: u8,
    num_bits: u8,
    bits: u32,
}

impl<'a> BitUnpacker<'a> {
    pub fn new(input: &'a [u8], bit_width: u8) -> BitUnpacker {
        BitUnpacker {
            input,
            offset: 0,
            bit_width,
            num_bits: 0,
            bits: 0,
        }
    }
}

impl<'a> Iterator for BitUnpacker<'a> {
    type Item = i32;

    // TODO(jon): Can we have a faster path for 8 and 16 bit packing, since this seems to be the
    //  norm now?

    fn next(&mut self) -> Option<Self::Item> {
        while self.num_bits < self.bit_width {
            match self.input.get(self.offset) {
                Some(byte) => {
                    self.bits |= (*byte as u32) << ((24 - self.num_bits) as u8) as u32;
                    self.num_bits += 8;
                }
                None => return None,
            }
            self.offset += 1;
        }
        let out =
            reverse_twos_complement(self.bits >> (32 - self.bit_width) as u32, self.bit_width);
        self.bits = self.bits << self.bit_width as u32;
        self.num_bits -= self.bit_width;
        Some(out)
    }
}
