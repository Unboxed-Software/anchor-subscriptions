use crate::state::Splits8;
use anchor_lang::prelude::*;

#[account]
pub struct Referralship {
    pub app: Pubkey,
    pub referral_agents_collection_nft_mint: Pubkey,
    pub splits: Splits8,
}
