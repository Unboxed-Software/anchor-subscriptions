use anchor_lang::prelude::*;

#[account]
pub struct Subscription {
    pub app: Pubkey,
    pub tier: Pubkey,
    pub subscriber: Pubkey,
    pub start: i64,
    pub amount_paid: u64,
    pub active: bool,
    pub bump: u8,
}
