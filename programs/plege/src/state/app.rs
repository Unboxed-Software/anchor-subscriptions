use anchor_lang::prelude::*;

#[account]
pub struct App {
    pub auth: Pubkey,
    pub num_tiers: u8,
    pub treasury: Pubkey,
    pub mint: Pubkey,
    pub name: String,
}
