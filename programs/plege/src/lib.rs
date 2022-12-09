use anchor_lang::prelude::*;

pub mod error;
pub mod instructions;
pub mod state;

use instructions::*;
use state::Interval;

declare_id!("CdEWFt6UP8LGX878nQA5qH2GUoEaHmae7RSnDWxVMww8");

#[program]
pub mod plege {
    use super::*;

    pub fn create_user(ctx: Context<CreateUser>) -> Result<()> {
        instructions::create_user(ctx)
    }

    pub fn create_app(ctx: Context<CreateApp>, app_id: u8, name: String) -> Result<()> {
        instructions::create_app(ctx, app_id, name)
    }

    pub fn create_tier(
        ctx: Context<CreateTier>,
        tier_id: u8,
        name: String,
        price: u64,
        interval: Interval,
    ) -> Result<()> {
        instructions::create_tier(ctx, tier_id, name, price, interval)
    }

    pub fn create_subscription(ctx: Context<CreateSubscription>) -> Result<()> {
        instructions::create_subscription(ctx)
    }

    pub fn cancel_subscription(ctx: Context<CancelSubscription>) -> Result<()> {
        instructions::cancel_subscription(ctx)
    }

    pub fn complete_payment(ctx: Context<CompletePayment>) -> Result<()> {
        instructions::complete_payment(ctx)
    }

    pub fn disallow_new_subscribers(ctx: Context<ToggleNewSubscribers>) -> Result<()> {
        instructions::disallow_new_subscribers(ctx)
    }

    pub fn allow_new_subscribers(ctx: Context<ToggleNewSubscribers>) -> Result<()> {
        instructions::allow_new_subscribers(ctx)
    }

    pub fn disable_tier(ctx: Context<ToggleNewSubscribers>) -> Result<()> {
        instructions::disable_tier(ctx)
    }
}
