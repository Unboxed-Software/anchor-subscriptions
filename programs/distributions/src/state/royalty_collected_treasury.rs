use anchor_lang::prelude::*;

#[account]
pub struct RoyaltyCollectedTreasury {
    pub authority: Pubkey,
    pub treasury_account: Pubkey,
    pub royalties_account: Pubkey,
    pub mint: Pubkey,
    pub shareholder_nft_collection_mint: Pubkey,
    pub total_inflows: u64,
    pub total_royalties: u64,
    pub royalty_percentage: u8,
    pub bump: u8,
}
