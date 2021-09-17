use crate::v2::types::Cptv2Header;

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
