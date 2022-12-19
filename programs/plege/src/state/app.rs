use anchor_lang::prelude::*;
use crate::state::Callback;

#[account]
#[derive(Debug)]
pub struct App {
    pub auth: Pubkey,
    pub num_tiers: u8,
    pub treasury: Pubkey,
    pub mint: Pubkey,
    pub name: String,
    pub callback: Option<Callback>
}