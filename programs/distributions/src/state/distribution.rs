use anchor_lang::prelude::*;

#[account]
pub struct Distribution {
    pub amount_total: u64,
    pub amount_per_share: u64,
    pub recipient_count: u64,
    pub shareholder_nft_collection_mint: Pubkey,
    // pub treasury: Pubkey,
}
