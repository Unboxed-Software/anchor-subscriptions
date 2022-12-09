use crate::state::Splits8;
use anchor_lang::prelude::*;

#[account]
pub struct Referralship {
    pub app: Pubkey,
    pub app_id: u8,
    pub referral_agents_collection_nft_mint: Pubkey,
    pub splits: Splits8,
}
