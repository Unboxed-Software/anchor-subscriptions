mod distribution;
mod royalty_collected_treasury;

pub const ROYALTY_COLLECTED_TREASURY: &str = "royalty_collected_treasury";
pub const DISTRIBUTION: &str = "distribution";
pub const TOKEN: &str = "token";
pub const ROYALTIES: &str = "royalties";
pub const TREASURY: &str = "treasury";

pub use distribution::*;
pub use royalty_collected_treasury::*;
