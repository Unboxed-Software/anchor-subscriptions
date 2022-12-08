use super::interval::Interval;
use anchor_lang::prelude::*;

#[account]
pub struct Tier {
    pub app: Pubkey,
    pub name: String,
    pub mint: Pubkey,
    pub price: u64,
    pub interval: Interval,
    pub accepting_new_subs: bool,
    pub active: bool,
}
