use crate::decoder::{decode_cptv_header, CptvHeader};

pub(crate) mod v2;
use crate::v2::types::CptvFrame;
use js_sys::{Reflect, Uint16Array, Uint8Array};
use log::Level;
#[allow(unused)]
use log::{info, trace, warn};
use std::io::{ErrorKind, Read};
use std::fs::read;
use std::error::Error;
use wasm_bindgen::__rt::std::io::Cursor;
use wasm_bindgen::prelude::*;

use crate::v2::{decode_frame_header_v2, unpack_frame_v2};
use libflate::non_blocking::gzip::Decoder;
use std::io;
use wasm_bindgen::JsCast;
mod decoder;

struct DownloadedData {
    decoded: Vec<u8>,
    first_frame_offset: Option<usize>,
    stream_ended: bool,
    gzip_ended: bool,
    num_decompressed_bytes: usize,
    latest_frame_offset: Option<usize>,
}

impl DownloadedData {
    pub fn new_with_size_hint(size_hint: usize) -> DownloadedData {
        DownloadedData {
            decoded: vec![0; size_hint],
            first_frame_offset: None,
            stream_ended: false,
            gzip_ended: false,
            latest_frame_offset: None,
            num_decompressed_bytes: 0,
        }
    }

    /// Frame data that has been un-gzipped, but has not had the frame delta unpacking performed.
    /// It is still possible to seek to a frame header with this information, but to unpack a sequence
    /// of frames you still need a known iframe to start from.
    pub fn packed_frame_data(&self) -> Option<&[u8]> {
        match self.first_frame_offset {
            Some(offset) => Some(&self.decoded[offset..self.num_decompressed_bytes]),
            None => None,
        }
    }
}

struct ResumableReader {
    inner: Cursor<Vec<u8>>, // Initialise to the total number of bytes, which we know from the request header.
    available: usize,       // Every time we add a chunk, advance this to the end
    used: usize,            // Every time we read bytes, advance this to the amount of read bytes.
    stream_ended: bool,
}

impl ResumableReader {
    pub fn new_with_capacity(size: usize) -> ResumableReader {
        ResumableReader {
            inner: Cursor::new(vec![0; size]),
            available: 0,
            used: 0,
            stream_ended: false,
        }
    }

    pub fn append_bytes(&mut self, bytes: &Uint8Array) {
        assert!(bytes.byte_length() == bytes.length());
        assert!(self.available + bytes.length() as usize <= self.inner.get_ref().len());
        bytes.copy_to(
            &mut self.inner.get_mut()
                [self.available..self.available + bytes.byte_length() as usize].copy_within
        );
        self.available += bytes.length() as usize;
    }
}

impl Read for ResumableReader {
    fn read(&mut self, buf: &mut [u8]) -> io::Result<usize> {
        if self.used == self.available && self.available < self.inner.get_ref().len() {
            Err(io::Error::new(
                io::ErrorKind::WouldBlock,
                "Waiting for more bytes",
            ))
        } else if buf.is_empty() {
            // Got zero bytes, need to allocate into read buffer
            Ok(0)
        } else {
            let would_be_used = self.used + buf.len();
            if would_be_used >= self.available {
                // Trying to read past the available bytes
                if self.stream_ended {
                    return Ok(0);
                }
                return Err(io::Error::new(
                    io::ErrorKind::WouldBlock,
                    "Waiting for more bytes",
                ));
            }
            let read_bytes = self.inner.read(&mut buf[..])?;
            self.used += read_bytes;
            Ok(read_bytes)
        }
    }
}

pub struct ReadableStreamDefaultReader {
    file: Vec<u8>,
    offsets: Vec<usize>,
    offset: usize,
    file_name: String
}

impl ReadableStreamDefaultReader {
    pub fn new(file_name: String) -> Result<ReadableStreamDefaultReader, Box<dyn Error>> {
        let mut offsets = Vec::new();
        let file = read(file_name)?;
        let parts = 5;
        let len = file.len();
        let percentage = len as f64 / parts as f64;
        for part in 0..parts {
            offsets.push((percentage * part as f64).ceil() as usize);
        }
        offsets.push(len);
        Ok(ReadableStreamDefaultReader {
             file,
             file_name,
             offsets,
             offset: 0
        })
    }

    pub fn read(&mut self) -> Vec<u8> {
        self.offset += 1;
        self.file[self.offsets[self.offset - 1]..self.offsets[self.offset]].to_vec()
    }

    pub fn done(&self) -> bool {
        self.offset == 5
    }
}

pub struct CptvPlayerContext {
    /// Holds information about current downloaded file data
    downloaded_data: DownloadedData,

    /// Current clip metadata
    header_info: CptvHeader, // TODO(jon): Are we okay with doing our dynamic dispatch off of this enum?

    // NOTE(jon): We don't need to keep every frame here if we're worried about taking too much
    //  memory - we just need enough to help seeking/scrubbing work, say, one frame ever second,
    //  plus the offset in the gzip decoded data to start from - though if that exists we're not really
    //  saving much space by making iframes sparse, we could just delete our gzipped and gzip decoded
    //  buffers once we've decoded the whole file?
    frames: Vec<CptvFrame>,
    min_value: u16,
    max_value: u16,
    reader: Option<ReadableStreamDefaultReader>,
    gz_decoder: Option<Decoder<ResumableReader>>,
}


impl CptvPlayerContext {
    pub async fn new_with_stream(
        stream: ReadableStreamDefaultReader,
        size: f64,
    ) -> Result<CptvPlayerContext, JsValue> {
        // Init the console logging stuff on startup, so that wasm can print things
        // into the browser console.
        let mut context = CptvPlayerContext {
            downloaded_data: DownloadedData::new_with_size_hint(size as usize * 3),
            gz_decoder: None,
            header_info: CptvHeader::UNINITIALISED,
            frames: Vec::new(),
            reader: Some(stream),
            min_value: u16::MAX,
            max_value: u16::MIN,
        };

        let mut reader = ResumableReader::new_with_capacity(size as usize);
        // Do the initial read from the stream
        let mut stream_ended = false;
        while reader.available < 2 && !stream_ended {
            // Make sure we get at least two bytes, or fail if the stream is shorter
            stream_ended = context.get_bytes_from_stream(Some(&mut reader)).await?;
        }
        let has_gz_stream = reader.inner.get_ref().len() >= 2 && reader.inner.get_ref()[0] == 0x1f && reader.inner.get_ref()[1] == 0x8b;
        if has_gz_stream {
            context.gz_decoder = Some(Decoder::new(reader));
            Ok(context)
        } else {
            Err(JsValue::from(
                "No gzipped stream found, not a valid cptv v2 stream",
            ))
        }
    }

    /// Reads bytes from readable stream, and appends them to the available bytes for the streaming
    /// gzip decoder.
    async fn get_bytes_from_stream(
        &mut self,
        target: Option<&mut ResumableReader>,
    ) -> Result<bool, JsValue> {
        let result = self.read_from_stream();
        let is_last_chunk = self.finish_stream();
        if is_last_chunk {
            target
                .unwrap_or_else(|| self.reader_mut())
                .append_bytes(result);
        }
        Ok(is_last_chunk)
    }

    fn reader_mut(&mut self) -> &mut ResumableReader {
        self.gz_decoder.as_mut().unwrap().as_inner_mut()
    }

    fn read_from_stream(&self) -> Vec<u8> {
        match &self.reader {
            Some(stream_reader) => stream_reader.read(),
            None => {
                let none = vec![];
                none
            }
        }
    }

    fn finish_stream(&self) -> bool {
        match &self.reader {
            Some(stream_reader) => stream_reader.done(),
            None => {
                true
            }
        }
    }

    fn decoded_bytes(&self) -> &[u8] {
        &self.downloaded_data.decoded[0..self.downloaded_data.num_decompressed_bytes]
    }

    fn pump_gz(&mut self) -> io::Result<usize> {
        let (width, height) = match &self.header_info {
            CptvHeader::V2(header) => (header.width, header.height),
            _ => (160, 120),
        };
        let pump_size = (width * height * 2 * 2) as usize; // Approx 2 frames worth
        if self.downloaded_data.num_decompressed_bytes as isize
            > self.downloaded_data.decoded.len() as isize - pump_size as isize
        {
            // Reallocate when we're ~2 frames from the end of the buffer:
            self.downloaded_data
                .decoded
                .append(&mut vec![0u8; pump_size]);
        }
        self.gz_decoder
            .as_mut()
            .unwrap()
            .read(&mut self.downloaded_data.decoded[self.downloaded_data.num_decompressed_bytes..])
    }

    pub fn stream_complete(&self) -> bool {
        self.downloaded_data.stream_ended && self.downloaded_data.gzip_ended
    }

    fn total_frames(&self) -> Option<usize> {
        if self.stream_complete() {
            Some(self.frames.len())
        } else {
            None
        }
    }

    fn try_goto_loaded_frame(&mut self, n: usize) -> bool {
        match self.frames.get(self.get_frame_index(n)) {
            None => self.stream_complete(),
            Some(_) => true,
        }
    }

    pub async fn seek_to_frame(
        mut context: CptvPlayerContext,
        frame_num: usize,
    ) -> Result<CptvPlayerContext, JsValue> {
        while !context.try_goto_loaded_frame(frame_num) {
            // Load until we have the frame.
            context = CptvPlayerContext::fetch_raw_frame(context).await?;
        }
        Ok(context)
    }

    async fn fetch_raw_frame(mut context: CptvPlayerContext) -> Result<CptvPlayerContext, JsValue> {
        // TODO(jon): Dispatch on CPTV version here
        loop {
            match context.downloaded_data.packed_frame_data() {
                None => {
                    // No frame data downloaded yet, try to get past the end of the file header:
                    context = CptvPlayerContext::fetch_header(context).await?;
                }
                Some(frame_data) => {
                    // Try to parse a frame header:
                    let width = context.get_width() as usize;
                    let height = context.get_height() as usize;
                    let current_frame_offset = context.downloaded_data.latest_frame_offset.unwrap();
                    let frame_data_from_latest_offset = &frame_data[current_frame_offset..];
                    let initial_length = frame_data_from_latest_offset.len();
                    match decode_frame_header_v2(frame_data_from_latest_offset, width, height) {
                        Ok((remaining, (frame_data, mut frame))) => {
                            unpack_frame_v2(context.frames.last(), frame_data, &mut frame);

                            // We keep a running tally of min/max values across the clip for
                            // normalisation purposes.

                            // Values within 5 seconds of an FFC event do not contribute to this.
                            let min = frame.image_data.min();
                            let within_ffc_timeout = match frame.last_ffc_time {
                                Some(last_ffc_time) => {
                                    (frame.time_on as i32 - last_ffc_time as i32) < 5000
                                }
                                None => false,
                            };
                            if min != 0 && (frame.is_background_frame || !within_ffc_timeout) {
                                // If the minimum value is zero, it's probably a glitched frame.
                                context.min_value =
                                    u16::min(context.min_value, frame.image_data.min());
                                context.max_value =
                                    u16::max(context.max_value, frame.image_data.max());
                            }
                            context.downloaded_data.latest_frame_offset =
                                Some(current_frame_offset + (initial_length - remaining.len()));

                            // Store the decoded frame
                            context.frames.push(frame);
                            if let Some(prev_frame) = context.frames.last() {
                                if prev_frame.is_background_frame {
                                    // Skip the background frame
                                    continue;
                                }
                            }
                            break;
                        }
                        Err(e) => {
                            match e {
                                nom::Err::Incomplete(_) => {
                                    if context.stream_complete() {
                                        // We're trying to read past the available frames.
                                        // Now we know how many frames there actually were in the video,
                                        // and can print that information.
                                        info!("Stream completed with total frames {:?}{}", context.total_frames().unwrap(), if context.has_background_frame() { " (plus 1 background frame)" } else { "" });
                                        break;
                                    }
                                    // Fetch more bytes and loop again.
                                    context = CptvPlayerContext::fetch_bytes(context).await?.0;
                                }
                                nom::Err::Error((_, kind)) | nom::Err::Failure((_, kind)) => {
                                    // We might have some kind of parsing error with the header?
                                    info!("{}", &format!("kind {:?}", kind));
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
        Ok(context)
    }

    fn has_background_frame(&self) -> bool {
        match &self.header_info {
            CptvHeader::V2(h) => h.has_background_frame.is_some(),
            _ => false
        }
    }

    pub fn get_total_frames(&self) -> usize {
        match &self.header_info {
            CptvHeader::V2(h) => match h.has_background_frame {
                Some(_) => isize::max(0, self.frames.len() as isize - 1) as usize,
                None => self.frames.len(),
            },
            _ => 0,
        }
    }

    pub fn get_bytes_loaded(&mut self) -> usize {
        self.reader_mut().available
    }

    pub fn get_frame_header_at_index(&self, n: usize) -> JsValue {
        match self.frames.get(self.get_frame_index(n)) {
            Some(frame) => serde_wasm_bindgen::to_value(frame).unwrap(),
            None => JsValue::null(),
        }
    }

    fn get_frame_index(&self, n: usize) -> usize {
        let has_background_frame = match &self.header_info {
            CptvHeader::V2(h) => match h.has_background_frame {
                Some(bg_frame) => bg_frame,
                None => false,
            },
            _ => false,
        };
        if has_background_frame {
            n + 1
        } else {
            n
        }
    }

    pub fn get_raw_frame_at_index(&self, n: usize) -> Uint16Array {
        // TODO(jon): Move these comments into rustdoc style, and generate docs?
        // Get the raw frame specified by a frame number
        // If frame n hasn't yet downloaded, return an empty array.
        match self.frames.get(self.get_frame_index(n)) {
            Some(frame) => unsafe { Uint16Array::view(frame.image_data.data()) },
            None => Uint16Array::new_with_length(0),
        }
    }

    pub fn get_background_frame(&self) -> Uint16Array {
        let has_background_frame = match &self.header_info {
            CptvHeader::V2(h) => match h.has_background_frame {
                Some(bg_frame) => bg_frame,
                None => false,
            },
            _ => false,
        };
        if has_background_frame {
            match self.frames.get(0) {
                Some(frame) => unsafe { Uint16Array::view(frame.image_data.data()) },
                None => Uint16Array::new_with_length(0),
            }
        } else {
            Uint16Array::new_with_length(0)
        }
    }

    pub fn get_num_frames(&self) -> u32 {
        match &self.header_info {
            CptvHeader::V2(_) => self.total_frames().unwrap_or(0) as u32,
            CptvHeader::V3(h) => h.num_frames,
            _ => panic!("uninitialised"),
        }
    }

    pub fn get_width(&self) -> u32 {
        match &self.header_info {
            CptvHeader::V2(h) => h.width,
            CptvHeader::V3(h) => h.v2.width,
            _ => panic!("uninitialised"),
        }
    }

    pub fn get_height(&self) -> u32 {
        match &self.header_info {
            CptvHeader::V2(h) => h.height,
            CptvHeader::V3(h) => h.v2.height,
            _ => panic!("uninitialised"),
        }
    }

    pub fn get_frame_rate(&self) -> u8 {
        match &self.header_info {
            CptvHeader::V2(h) => h.fps.unwrap_or(9),
            CptvHeader::V3(h) => h.v2.fps.unwrap_or(9),
            _ => panic!("uninitialised"),
        }
    }

    pub fn get_frames_per_iframe(&self) -> u8 {
        match &self.header_info {
            CptvHeader::V2(_) => 1,
            CptvHeader::V3(h) => h.frames_per_iframe,
            _ => panic!("uninitialised"),
        }
    }

    pub fn get_min_value(&self) -> u16 {
        self.min_value
    }

    pub fn get_max_value(&self) -> u16 {
        self.max_value
    }

    async fn fetch_bytes(
        mut context: CptvPlayerContext,
    ) -> Result<(CptvPlayerContext, bool), JsValue> {
        if context.reader_mut().used < context.reader_mut().available {
            let bytes_read = match context.pump_gz() {
                Ok(r) => r,
                Err(e) => {
                    if e.kind() == ErrorKind::UnexpectedEof {
                        context.downloaded_data.gzip_ended = true;
                    }
                    if !context.downloaded_data.stream_ended {
                        // TODO(jon): Could get bytes a bit more greedily here to be able to read
                        //  ahead and buffer a bit, esp on slow connections?
                        let is_last_chunk = context.get_bytes_from_stream(None).await?;
                        if is_last_chunk {
                            context.reader_mut().stream_ended = true;
                            context.downloaded_data.stream_ended = true;
                        }
                    }
                    return Ok((context, true));
                }
            };
            context.downloaded_data.num_decompressed_bytes += bytes_read;
        } else {
            // We've used all available bytes here, and should ask for more before continuing
        }
        Ok((context, false))
    }

    pub async fn fetch_header(
        mut context: CptvPlayerContext,
    ) -> Result<CptvPlayerContext, JsValue> {
        if context.gz_decoder.is_some() {
            loop {
                let (ctx, should_continue) = CptvPlayerContext::fetch_bytes(context).await?;
                context = ctx;
                if should_continue {
                    continue;
                }
                let input = context.decoded_bytes();
                let initial_len = input.len();
                match decode_cptv_header(input) {
                    Ok((remaining, header)) => {
                        context.downloaded_data.first_frame_offset =
                            Some(initial_len - remaining.len());
                        context.downloaded_data.latest_frame_offset = Some(0);
                        context.header_info = header;
                        break;
                    }
                    Err(e) => {
                        match e {
                            nom::Err::Incomplete(_) => {
                                // Loop again and fetch more bytes.
                                continue;
                            }
                            nom::Err::Error((_, kind)) => {
                                // We might have some kind of parsing error with the header?
                                info!("{}", &format!("kind {:?}", kind));
                                break;
                            }
                            nom::Err::Failure((i, kind)) => {
                                return Err(JsValue::from(format!(
                                    "Fatal error parsing CPTV header: {:?}, {}",
                                    kind,i[0] as char
                                )));
                            }
                        }
                    }
                }
            }
            Ok(context)
        } else {
            Err(JsValue::from("Stream not initialised"))
        }
    }

    pub fn get_header(&self) -> JsValue {
        match &self.header_info {
            CptvHeader::V2(h) => serde_wasm_bindgen::to_value(&h).unwrap(),
            _ => JsValue::from_str("Unable to parse header"),
        }
    }
}
