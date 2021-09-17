use js_sys::{Reflect, Uint16Array, Uint8Array};
use log::Level;
#[allow(unused)]
use log::{info, trace, warn};
use std::io::{ErrorKind, Read};
use wasm_bindgen::prelude::*;

use libflate::non_blocking::gzip::Decoder;
use std::collections::VecDeque;
use std::io;
use wasm_bindgen::JsCast;
use cptv_shared::v2::{decode_frame_header_v2, unpack_frame_v2};
use cptv_shared::v2::types::CptvFrame;
use cptv_shared::CptvHeader;
use crate::decoder::decode_cptv_header;

mod decoder;

struct DownloadedData {
    gz_decoded: VecDeque<u8>,
    gz_ended: bool,
    parse_error: bool,
    num_decompressed_bytes: usize,
}

impl DownloadedData {
    pub fn new() -> DownloadedData {
        DownloadedData {
            gz_decoded: VecDeque::new(),
            gz_ended: false,
            parse_error: false,
            num_decompressed_bytes: 0,
        }
    }
}

struct ResumableReader {
    inner: VecDeque<u8>,
    loaded_bytes: usize,
    stream_ended: bool,
}

impl ResumableReader {
    pub fn new() -> ResumableReader {
        ResumableReader {
            inner: VecDeque::new(),
            loaded_bytes: 0,
            stream_ended: false,
        }
    }

    pub fn len(&self) -> usize {
        self.inner.len()
    }

    pub fn append(&mut self, bytes: &Uint8Array) {
        assert!(bytes.byte_length() == bytes.length());
        self.inner.append(&mut VecDeque::from(bytes.to_vec()));
        self.loaded_bytes += bytes.length() as usize;
    }
}

impl Read for ResumableReader {
    fn read(&mut self, buf: &mut [u8]) -> io::Result<usize> {
        if self.len() < buf.len() && !self.stream_ended {
            Err(io::Error::new(
                io::ErrorKind::WouldBlock,
                "Waiting for more bytes from stream",
            ))
        } else {
            for i in 0..buf.len() {
                match self.inner.pop_front() {
                    Some(byte) => buf[i] = byte,
                    None => {
                        return Ok(i)
                    },
                }
            }
            Ok(buf.len())
        }
    }
}

#[wasm_bindgen]
extern "C" {
    pub type ReadableStreamDefaultReader;

    # [wasm_bindgen (catch , method , structural , js_class = "ReadableStreamDefaultReader" , js_name = cancel)]
    pub fn cancel(this: &ReadableStreamDefaultReader) -> Result<js_sys::Promise, JsValue>;
    # [wasm_bindgen (catch , method , structural , js_class = "ReadableStreamDefaultReader" , js_name = read)]
    pub fn read(this: &ReadableStreamDefaultReader) -> Result<js_sys::Promise, JsValue>;
}

#[wasm_bindgen]
pub struct CptvPlayerContext {
    /// Holds information about current downloaded file data
    downloaded_data: DownloadedData,

    /// Current clip metadata
    header_info: CptvHeader, // TODO(jon): Are we okay with doing our dynamic dispatch off of this enum?

    last_time_on: usize,
    frame_buffer: Option<CptvFrame>,
    frame_count: usize,
    reader: Option<ReadableStreamDefaultReader>,
    gz_buffer: Vec<u8>,
    gz_decoder: Option<Decoder<ResumableReader>>,
}

fn init_console() {
    console_error_panic_hook::set_once();
    let _ = match console_log::init_with_level(Level::Warn) {
        Ok(x) => x,
        Err(_) => (),
    };
}

fn has_gz_header(bytes: &[u8]) -> bool {
    bytes.len() >= 2 && bytes[0] == 0x1f && bytes[1] == 0x8b
}

#[wasm_bindgen]
impl CptvPlayerContext {
    #[wasm_bindgen(js_name = newWithStream)]
    pub async fn new_with_stream(
        stream: ReadableStreamDefaultReader,
    ) -> Result<CptvPlayerContext, JsValue> {
        init_console();

        // Init the console logging stuff on startup, so that wasm can print things
        // into the browser console.
        let mut context = CptvPlayerContext {
            downloaded_data: DownloadedData::new(),
            gz_decoder: None,
            header_info: CptvHeader::UNINITIALISED,
            frame_buffer: None,
            frame_count: 0,
            last_time_on: 0,
            reader: Some(stream),
            gz_buffer: vec![0; 160 * 120 * 2],
        };
        let mut reader = ResumableReader::new();
        // Do the initial read from the stream
        let mut stream_ended = false;

        while reader.len() < 2 && !stream_ended {
            // Make sure we get at least two bytes, or fail if the stream is shorter
            stream_ended = context.get_bytes_from_stream(Some(&mut reader)).await?;
        }
        if has_gz_header(reader.inner.as_slices().0) {
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
        let result = wasm_bindgen_futures::JsFuture::from(self.read_from_stream()).await?;
        let sink = target.unwrap_or_else(|| self.reader_mut());
        sink.stream_ended = Reflect::get(&result, &JsValue::from_str("done"))
            .expect("Should have property 'done'")
            .as_bool()
            .unwrap();

        if let Ok(value) = Reflect::get(&result, &JsValue::from_str("value")) {
            if !value.is_undefined() {
                let arr = value.dyn_into::<Uint8Array>().unwrap();
                sink.append(&arr);
            }
        }
        Ok(sink.stream_ended)
    }

    fn reader_mut(&mut self) -> &mut ResumableReader {
        self.gz_decoder.as_mut().unwrap().as_inner_mut()
    }

    fn reader(&self) -> &ResumableReader {
        self.gz_decoder.as_ref().unwrap().as_inner_ref()
    }

    fn read_from_stream(&self) -> js_sys::Promise {
        match &self.reader {
            Some(stream_reader) => stream_reader.read().unwrap(),
            None => {
                // TODO(jon): Don't panic?
                panic!("No stream reader defined")
            }
        }
    }

    fn pump_gz(&mut self) -> io::Result<usize> {
        let read_bytes = self.gz_decoder.as_mut().unwrap().read(&mut self.gz_buffer);
        match &read_bytes {
            Ok(read_bytes) => {
                for i in 0..*read_bytes {
                    self.downloaded_data.gz_decoded.push_back(self.gz_buffer[i]);
                }
            }
            Err(e) => {
                match e.kind() {
                ErrorKind::WouldBlock => {}
                _ => {
                    warn!("Gzip stream error {:?}", e);
                    self.downloaded_data.parse_error = true;
                }
            }
            },
        }

        read_bytes
    }

    #[wasm_bindgen(js_name = streamComplete)]
    pub fn stream_complete(&self) -> bool {
        self.reader().stream_ended && self.downloaded_data.gz_ended
    }

    fn decode_ended(&self) -> bool {
        self.downloaded_data.gz_ended || self.downloaded_data.parse_error
    }

    fn total_frames(&self) -> Option<usize> {
        if self.stream_complete() {
            Some(self.frame_count)
        } else {
            None
        }
    }

    #[wasm_bindgen(js_name = countTotalFrames)]
    pub async fn count_frames(
        mut context: CptvPlayerContext,
    ) -> Result<CptvPlayerContext, JsValue> {
        while !context.decode_ended() {
            // Load until we have the frame.
            context = CptvPlayerContext::parse_next_frame(context, false).await?;
        }

        info!(
            "Mem usage :: Reader {}, Decoded {}, frames {}",
            context.reader_mut().inner.capacity(),
            context.downloaded_data.gz_decoded.capacity(),
            context.frame_count
        );
        if context.downloaded_data.parse_error {
            Err(JsValue::from_str("Invalid or corrupted CPTV stream"))
        } else {
            Ok(context)
        }
    }

    #[wasm_bindgen(js_name = fetchNextFrame)]
    pub async fn fetch_next_frame(
        mut context: CptvPlayerContext,
    ) -> Result<CptvPlayerContext, JsValue> {
        let prev_frame_count = context.frame_count;
        context = CptvPlayerContext::parse_next_frame(context, true).await?;
        if context.frame_count == prev_frame_count && !context.reader().stream_ended {
            // We didn't get the frame, so poll again.
            info!("Frame same, so poll again");
            context = CptvPlayerContext::parse_next_frame(context, true).await?;
        }
        if context.downloaded_data.parse_error {
            Err(JsValue::from_str("Invalid or corrupted CPTV stream"))
        } else {
            Ok(context)
        }
    }

    async fn parse_next_frame(
        mut context: CptvPlayerContext,
        unpack_frame: bool,
    ) -> Result<CptvPlayerContext, JsValue> {
        // TODO(jon): Dispatch on CPTV version here
        loop {
            match context.header_info {
                CptvHeader::UNINITIALISED => {
                    context = CptvPlayerContext::fetch_header(context).await?;
                }
                _ => {
                    // Try to parse a frame header:
                    let width = context.get_width() as usize;
                    let height = context.get_height() as usize;
                    context.downloaded_data.gz_decoded.make_contiguous();
                    let frame_data = context.downloaded_data.gz_decoded.as_slices().0;
                    if frame_data.len() == 0 {
                        let (ctx, _should_continue, bytes_read) =
                            CptvPlayerContext::fetch_bytes(context).await?;
                        context = ctx;
                        if bytes_read == 0 || context.downloaded_data.parse_error {
                            break;
                        }
                        continue;
                    }
                    match decode_frame_header_v2(frame_data, width, height) {
                        Ok((remaining, (frame_data, mut frame))) => {
                            context.last_time_on = frame.time_on as usize;
                            // Make sure there are enough bytes to decode another frame. width * height * (frame.bit_width / 8
                            if unpack_frame {
                                unpack_frame_v2(&context.frame_buffer, frame_data, &mut frame);
                                // Store the decoded frame
                                context.frame_buffer = Some(frame);
                            }


                            // Pop used bytes off the decoded buffer
                            let remaining_size = remaining.len();
                            while context.downloaded_data.gz_decoded.len() > remaining_size {
                                context.downloaded_data.gz_decoded.pop_front();
                            }
                            // Increment the frame count
                            context.frame_count += 1;

                            break;
                        }
                        Err(e) => {
                            match e {
                                nom::Err::Incomplete(_) => {
                                    assert!(!context.stream_complete());
                                    // Fetch more bytes and loop again.
                                    context = CptvPlayerContext::fetch_bytes(context).await?.0;
                                }
                                nom::Err::Error((_remaining, _kind))
                                | nom::Err::Failure((_remaining, _kind)) => {
                                    if context.stream_complete() {
                                        // We're trying to read past the available frames.
                                        // Now we know how many frames there actually were in the video,
                                        // and can print that information.
                                        info!(
                                            "Stream completed with total frames {:?}{}",
                                            context.total_frames().unwrap(),
                                            if context.has_background_frame() {
                                                " (plus 1 background frame)"
                                            } else {
                                                ""
                                            }
                                        );
                                        break;
                                    } else {
                                        warn!("Parse error?? {:?}", _kind);
                                        context.downloaded_data.parse_error = true;
                                        context.downloaded_data.gz_ended = true;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if context.downloaded_data.parse_error {
                break;
            }
        }
        Ok(context)
    }

    fn has_background_frame(&self) -> bool {
        match &self.header_info {
            CptvHeader::V2(h) => h.has_background_frame,
            _ => false,
        }
    }

    #[wasm_bindgen(js_name = totalFrames)]
    pub fn get_total_frames(&self) -> JsValue {
        match self.total_frames() {
            Some(total_frames) => match &self.header_info {
                CptvHeader::V2(_) => JsValue::from_f64(total_frames as f64),
                CptvHeader::V3(header) => JsValue::from_f64(header.num_frames as f64),
                _ => JsValue::null(),
            },
            None => JsValue::null(),
        }
    }

    #[wasm_bindgen(js_name = bytesLoaded)]
    pub fn get_bytes_loaded(&mut self) -> usize {
        self.reader_mut().loaded_bytes
    }

    #[wasm_bindgen(js_name = getNextFrame)]
    pub fn get_next_frame(&self) -> Uint16Array {
        match &self.frame_buffer {
            Some(frame) => unsafe { Uint16Array::view(frame.image_data.data()) },
            None => Uint16Array::new_with_length(0),
        }
    }

    #[wasm_bindgen(js_name = getFrameHeader)]
    pub fn get_next_frame_header(&self) -> JsValue {
        match &self.frame_buffer {
            Some(frame) => serde_wasm_bindgen::to_value(frame).unwrap(),
            None => JsValue::null(),
        }
    }

    #[wasm_bindgen(js_name = getWidth)]
    pub fn get_width(&self) -> u32 {
        match &self.header_info {
            CptvHeader::V2(h) => h.width,
            CptvHeader::V3(h) => h.v2.width,
            _ => panic!("uninitialised"),
        }
    }

    #[wasm_bindgen(js_name = getHeight)]
    pub fn get_height(&self) -> u32 {
        match &self.header_info {
            CptvHeader::V2(h) => h.height,
            CptvHeader::V3(h) => h.v2.height,
            _ => panic!("uninitialised"),
        }
    }

    #[wasm_bindgen(js_name = getFrameRate)]
    pub fn get_frame_rate(&self) -> u8 {
        match &self.header_info {
            CptvHeader::V2(h) => h.fps,
            CptvHeader::V3(h) => h.v2.fps,
            _ => panic!("uninitialised"),
        }
    }

    #[wasm_bindgen(js_name = getFramesPerIframe)]
    pub fn get_frames_per_iframe(&self) -> u8 {
        match &self.header_info {
            CptvHeader::V2(_) => 1,
            CptvHeader::V3(h) => h.frames_per_iframe,
            _ => panic!("uninitialised"),
        }
    }

    async fn fetch_bytes(
        mut context: CptvPlayerContext,
    ) -> Result<(CptvPlayerContext, bool, usize), JsValue> {
        let bytes_read = match context.pump_gz() {
            Ok(r) => {
                if r == 0 {
                    if !context.reader().stream_ended {
                        info!("Pump was dry, Asking for more bytes");
                        context.get_bytes_from_stream(None).await?;
                    } else {

                        // Free memory used by reader
                        context.reader_mut().inner.shrink_to_fit();
                        context.downloaded_data.gz_ended = true;
                    }
                }
                r
            }
            Err(e) => {
                match e.kind() {
                    ErrorKind::UnexpectedEof => {
                        context.downloaded_data.gz_ended = true;
                    }
                    ErrorKind::WouldBlock => {}
                    _ => {
                        warn!("Gzip error {:?}", e);
                    }
                }
                if !context.reader().stream_ended {
                    // TODO(jon): Could get bytes a bit more greedily here to be able to read
                    //  ahead and buffer a bit, esp on slow connections?
                    info!("Asking for more bytes");
                    context.get_bytes_from_stream(None).await?;
                }
                return Ok((context, true, 0));
            }
        };
        context.downloaded_data.num_decompressed_bytes += bytes_read;
        Ok((context, false, bytes_read))
    }

    #[wasm_bindgen(js_name = fetchHeader)]
    pub async fn fetch_header(
        mut context: CptvPlayerContext,
    ) -> Result<CptvPlayerContext, JsValue> {
        if context.gz_decoder.is_some() {
            loop {
                let (ctx, should_continue, _) = CptvPlayerContext::fetch_bytes(context).await?;
                context = ctx;
                if context.downloaded_data.parse_error {
                    info!("Halt on parse error");
                    break;
                }
                if should_continue {
                    continue;
                }
                assert_ne!(
                    context.downloaded_data.gz_decoded.len(),
                    0,
                    "Should have some bytes from gzip decode"
                );
                let input = context.downloaded_data.gz_decoded.as_slices().0;
                match decode_cptv_header(input) {
                    Ok((remaining, header)) => {
                        let remaining_count = remaining.len();
                        while context.downloaded_data.gz_decoded.len() > remaining_count {
                            // Pop off all of the header bytes
                            context.downloaded_data.gz_decoded.pop_front();
                        }
                        context.header_info = header;
                        break;
                    }
                    Err(e) => {
                        match e {
                            nom::Err::Incomplete(_) => {
                                // Loop again and fetch more bytes.
                                continue;
                            }
                            nom::Err::Error((_, _kind)) => {
                                // We might have some kind of parsing error with the header?
                                info!("{}", &format!("kind {:?}", _kind));
                                break;
                            }
                            nom::Err::Failure((i, kind)) => {
                                return Err(JsValue::from(format!(
                                    "Fatal error parsing CPTV header: {:?}, {}",
                                    kind, i[0] as char
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

    #[wasm_bindgen(js_name = getHeader)]
    pub fn get_header(&self) -> JsValue {
        match &self.header_info {
            CptvHeader::V2(h) => serde_wasm_bindgen::to_value(&h).unwrap(),
            _ => JsValue::from_str("Unable to parse header"),
        }
    }
}
