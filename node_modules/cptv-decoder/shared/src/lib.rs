pub mod v2;
pub mod v3;

use crate::v2::types::Cptv2Header;
use crate::v3::types::Cptv3Header;

pub enum CptvHeader {
    UNINITIALISED,

    #[allow(unused)]
    V3(Cptv3Header),
    V2(Cptv2Header),
}
