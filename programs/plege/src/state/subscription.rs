use anchor_lang::prelude::*;

#[account]
#[derive(Debug)]
pub struct Subscription {
    pub app: Pubkey,
    pub tier: Pubkey,
    pub subscriber: Pubkey,
    pub start: i64,
    pub last_payment_time: Option<i64>,
    pub pay_period_start: i64,
    pub pay_period_expiration: i64,
    pub accept_new_payments: bool,
    pub credits: u64,
    pub bump: u8,
}
