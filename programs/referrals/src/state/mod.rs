mod referral;
mod referralship;
mod splits;

pub use referral::*;
pub use referralship::*;
pub use splits::*;

pub const REFERRAL: &str = "REFERRAL";
pub const REFERRAL_AGENT: &str = "REFERRAL_AGENT";
pub const REFERRALSHIP: &str = "REFERRALSHIP";
// TODO: Move these to plege program lib.
pub const APP: &str = "APP";
pub const SUBSCRIPTION: &str = "SUBSCRIPTION";
pub const SUBSCRIPTION_TIER: &str = "SUBSCRIPTION_TIER";
