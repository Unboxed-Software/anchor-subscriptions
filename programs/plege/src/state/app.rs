use anchor_lang::prelude::*;

#[account]
#[derive(Debug)]
pub struct App {
    pub auth: Pubkey,
    pub name: String,
    pub num_tiers: u8,
    pub treasury: Pubkey,
}
