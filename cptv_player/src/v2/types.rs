use core::fmt;
#[allow(unused)]
use log::{info, trace, warn};
use serde::Serialize;
use std::fmt::{Debug, Formatter};
use std::ops::{Index, IndexMut};
use std::time::Duration;

#[derive(Serialize)]
pub struct Cptv2Header {
    pub timestamp: u64,
    pub width: u32,
    pub height: u32,
    pub compression: u8,
    #[serde(rename = "deviceName")]
    pub device_name: String,

    pub fps: Option<u8>,
    pub brand: Option<String>,
    pub model: Option<String>,
    #[serde(rename = "deviceId")]
    pub device_id: Option<u32>,
    #[serde(rename = "serialNumber")]
    pub serial_number: Option<u32>,
    #[serde(rename = "firmwareVersion")]
    pub firmware_version: Option<String>,
    #[serde(rename = "motionConfig")]
    pub motion_config: Option<String>,
    #[serde(rename = "previewSecs")]
    pub preview_secs: Option<u8>,
    pub latitude: Option<f32>,
    pub longitude: Option<f32>,
    #[serde(rename = "locTimestamp")]
    pub loc_timestamp: Option<u64>,
    pub altitude: Option<f32>,
    pub accuracy: Option<f32>,
    #[serde(rename = "hasBackgroundFrame")]
    pub has_background_frame: Option<bool>,
}

impl Cptv2Header {
    pub fn new() -> Cptv2Header {
        // NOTE: Set default values for things not included in
        // older CPTVv1 files, which can otherwise be decoded as
        // v2.
        Cptv2Header {
            timestamp: 0,
            width: 160,
            height: 120,
            compression: 0,
            device_name: "".to_string(),
            fps: Some(9),
            brand: None,
            model: None,
            device_id: None,
            serial_number: None,
            firmware_version: None,
            motion_config: None,
            preview_secs: None,
            latitude: None,
            longitude: None,
            loc_timestamp: None,
            altitude: None,
            accuracy: None,
            has_background_frame: None,
        }
    }
}

// Cptv3 header includes the v2 header + additional fields to allow seeking.
// Possible future work to incorporate this into our player.
pub struct Cptv3Header {
    pub v2: Cptv2Header,
    pub min_value: u16,
    pub max_value: u16,
    pub toc: Vec<u32>,
    pub num_frames: u32,
    pub frames_per_iframe: u8,
}

impl Cptv3Header {
    #[allow(unused)]
    pub fn new() -> Cptv3Header {
        Cptv3Header {
            v2: Cptv2Header::new(),
            min_value: 0,
            max_value: 0,
            toc: Vec::new(),
            num_frames: 0,
            frames_per_iframe: 0,
        }
    }
}

#[derive(Serialize, Clone)]
pub struct FrameData {
    #[serde(skip_serializing)]
    data: Vec<u16>,
    width: usize,
    height: usize,
    min: u16,
    max: u16,
}

impl FrameData {
    pub fn with_dimensions(width: usize, height: usize) -> FrameData {
        FrameData {
            data: vec![0; width * height],
            width,
            height,
            min: u16::MAX,
            max: u16::MIN,
        }
    }

    pub fn min(&self) -> u16 {
        self.min
    }

    pub fn max(&self) -> u16 {
        self.max
    }

    pub fn width(&self) -> usize {
        self.width
    }

    pub fn height(&self) -> usize {
        self.height
    }

    pub fn data(&self) -> &[u16] {
        &self.data
    }

    pub fn set(&mut self, x: usize, y: usize, val: u16) {
        // Ignore edge pixels for this?
        self.max = u16::max(self.max, val);
        self.min = u16::min(self.min, val);
        self[y][x] = val;
    }

    // This was a function made for fixing up our "black pixel" syncing offset issues
    #[allow(unused)]
    pub fn offset(&self, offset: usize) -> FrameData {
        let mut frame = FrameData::with_dimensions(self.width, self.height);
        let mut pixels = self.data.iter().skip(offset);
        for y in 0..frame.height() {
            for x in 0..frame.width() {
                let pixel = *pixels.next().unwrap_or(&0u16);
                frame[y][x] = pixel;
            }
        }
        frame
    }
}

// Gives the row
impl Index<usize> for FrameData {
    type Output = [u16];

    fn index(&self, index: usize) -> &Self::Output {
        &self.data[(index * self.width)..(index * self.width) + self.width]
    }
}

impl IndexMut<usize> for FrameData {
    fn index_mut(&mut self, index: usize) -> &mut Self::Output {
        &mut self.data[(index * self.width)..(index * self.width) + self.width]
    }
}

#[derive(Serialize, Clone)]
pub struct CptvFrame {
    #[serde(rename = "timeOnMs")]
    pub time_on: u32,

    #[serde(skip_serializing)]
    pub bit_width: u8,
    #[serde(skip_serializing)]
    pub frame_size: u32,

    // Some cameras may not have FFC information, so this is optional.
    #[serde(rename = "lastFfcTimeMs")]
    pub last_ffc_time: Option<u32>,
    #[serde(rename = "lastFfcTempC")]
    pub last_ffc_temp_c: Option<f32>,
    #[serde(rename = "frameTempC")]
    pub frame_temp_c: Option<f32>,

    #[serde(rename = "isBackgroundFrame")]
    pub is_background_frame: bool,

    // Raw image data?
    #[serde(rename = "imageData")]
    pub image_data: FrameData,
}

impl CptvFrame {
    pub fn new_with_dimensions(width: usize, height: usize) -> CptvFrame {
        CptvFrame {
            time_on: 0,
            bit_width: 0,
            frame_size: 0,
            last_ffc_time: None,
            last_ffc_temp_c: None,
            frame_temp_c: None,
            is_background_frame: false,
            image_data: FrameData::with_dimensions(width, height),
        }
    }
}

impl Debug for CptvFrame {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        f.debug_struct("CptvFrame")
            .field(
                "last_ffc_time",
                // To get absolute time, need recording start time from header:
                &match self.last_ffc_time {
                    Some(timestamp) => format!(
                        "{:?}s ago",
                        &Duration::from_millis(self.time_on as u64 - timestamp as u64).as_secs()
                    ),
                    None => "None".to_string(),
                },
            )
            .field("time_on", &{
                let seconds = Duration::from_millis(self.time_on as u64).as_secs();
                let minutes = seconds / 60;
                let hours = minutes / 60;
                let minutes = minutes - (hours * 60);
                let seconds = seconds - ((hours * 60 * 60) + (minutes * 60));
                if hours > 0 {
                    // Minutes
                    format!("{}h, {}m, {}s", hours, minutes, seconds)
                } else if minutes > 0 {
                    format!("{}m, {}s", minutes, seconds)
                } else {
                    format!("{}s", seconds)
                }
            })
            .field("frame_temp_c", &self.frame_temp_c)
            .field("last_ffc_temp_c", &self.last_ffc_temp_c)
            .field("bit_width", &self.bit_width)
            .field("is_background_frame", &self.is_background_frame)
            .field(
                "image_data",
                &format!(
                    "FrameData({}x{})",
                    &self.image_data.width, &self.image_data.height
                ),
            )
            .finish()
    }
}

#[repr(u8)]
#[derive(PartialEq, Debug)]
pub enum FieldType {
    // K remaining
    Header = b'H',
    Timestamp = b'T',
    Width = b'X',
    Height = b'Y',
    Compression = b'C',
    DeviceName = b'D',
    MotionConfig = b'M',
    PreviewSecs = b'P',
    Latitude = b'L',
    Longitude = b'O',
    LocTimestamp = b'S',
    Altitude = b'A',
    Accuracy = b'U',
    Model = b'E',
    Brand = b'B',
    DeviceID = b'I',
    FirmwareVersion = b'V',
    CameraSerial = b'N',
    FrameRate = b'Z',
    BackgroundFrame = b'g',

    // TODO: Other header fields I've added to V2
    MinValue = b'R',
    MaxValue = b'W',
    TableOfContents = b'Q',
    NumFrames = b'J',
    FramesPerIframe = b'G',
    FrameHeader = b'F',

    PixelBytes = b'w',
    FrameSize = b'f',
    LastFfcTime = b'c',
    FrameTempC = b'a',
    LastFfcTempC = b'b',
    TimeOn = b't',
    Unknown = b';',
}

impl From<char> for FieldType {
    fn from(val: char) -> Self {
        use FieldType::*;
        match val {
            'H' => Header,
            'T' => Timestamp,
            'X' => Width,
            'Y' => Height,
            'C' => Compression,
            'D' => DeviceName,
            'E' => Model,
            'B' => Brand,
            'I' => DeviceID,
            'M' => MotionConfig,
            'P' => PreviewSecs,
            'L' => Latitude,
            'O' => Longitude,
            'S' => LocTimestamp,
            'A' => Altitude,
            'U' => Accuracy,
            'R' => MinValue,
            'W' => MaxValue,
            'N' => CameraSerial,
            'V' => FirmwareVersion,
            'Q' => TableOfContents,
            'J' => NumFrames,
            'Z' => FrameRate,
            'G' => FramesPerIframe,
            'F' => FrameHeader,
            'g' => BackgroundFrame,
            'w' => PixelBytes,
            'f' => FrameSize,
            'c' => LastFfcTime,
            't' => TimeOn,
            'a' => FrameTempC,
            'b' => LastFfcTempC,
            _ => Unknown,
        }
    }
}
