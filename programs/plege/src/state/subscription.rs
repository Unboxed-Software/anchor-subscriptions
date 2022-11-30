use crate::borsh::{BorshDeserialize, BorshSerialize};
use anchor_lang::prelude::*;

#[account]
pub struct Subscription {
    pub status: SubscriptionStatus,
    pub app: Pubkey,
    pub tier: Pubkey,
    pub subscriber: Pubkey,
    pub start: i64,
    pub amount_paid: u64,
    pub active: bool,
    pub bump: u8,
}

#[account]
pub struct CanceledSubscription {}

#[derive(Copy, Clone, BorshDeserialize, BorshSerialize)]
pub enum SubscriptionStatus {
    Active,
    Canceled,
}
