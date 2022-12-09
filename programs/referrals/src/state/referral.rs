use anchor_lang::prelude::*;

#[account]
pub struct Referral {
    pub app: Pubkey,
    pub referral_agent_nft_mint: Pubkey,
    pub subscription: Pubkey,
}
