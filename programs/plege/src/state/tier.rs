use crate::borsh::{BorshDeserialize, BorshSerialize};
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

#[derive(Copy, Clone, BorshDeserialize, BorshSerialize)]
pub enum Interval {
    Month,
    Year,
}

impl Interval {
    pub fn max_approval_len(self) -> u64 {
        match self {
            Interval::Month => 60,
            Interval::Year => 6,
        }
    }
}
