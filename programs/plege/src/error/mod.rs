use anchor_lang::prelude::*;

#[error_code]
pub enum PlegeError {
    #[msg("Invalid tier id")]
    InvalidAppId,
    #[msg("Invalid tier id")]
    InvalidTierId,
    #[msg("Payment interval skipped")]
    MissedPayment,
}
