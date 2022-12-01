use anchor_lang::prelude::*;

#[error_code]
pub enum PledgeError {
    #[msg("Invalid tier id")]
    InvalidAppId,
    #[msg("Invalid tier id")]
    InvalidTierId,
}
