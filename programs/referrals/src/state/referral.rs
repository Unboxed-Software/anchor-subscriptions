use anchor_lang::prelude::*;

#[account]
#[derive(Debug)]
pub struct Referral {
    pub app: Pubkey,
    pub referral_agent_nft_mint: Pubkey,
    pub subscription: Pubkey,
    // pub app_id: u8,
    // pub tier_id: u8,
}
