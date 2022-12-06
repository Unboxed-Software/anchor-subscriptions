use anchor_lang::prelude::*;

#[account]
pub struct Distribution {
    pub treasury: Pubkey,
    pub shareholder_nft_collection_mint: Pubkey,
    pub amount_total: u64,
    pub amount_per_share: u64,
    pub recipient_count: u64,
    pub date: String,
    pub token_account: Pubkey,
    pub bump: u8,
}

#[account]
pub struct Receipt {}
