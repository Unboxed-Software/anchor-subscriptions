use anchor_lang::prelude::*;

#[account]
pub struct Subscription {
    pub app: Pubkey,
    pub tier: Pubkey,
    pub subscriber: Pubkey,
    pub start: i64,
    pub active_through: i64,
    pub bump: u8,
}
