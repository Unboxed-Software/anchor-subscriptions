use anchor_lang::prelude::*;

pub mod error;
pub mod instructions;
pub mod state;

use clockwork_sdk::ThreadResponse;
use instructions::*;
use state::{Interval, Callback};

declare_id!("7xMy6CDMk3ANhRBEMorr9A3EJt5qWcQq64MeqGdC9JpA");

#[program]
pub mod plege {
    use clockwork_sdk::ThreadResponse;

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

    pub fn close_subscription_account(
        ctx: Context<CloseSubscriptionAccount>,
        subscription_bump: u8,
    ) -> Result<()> {
        instructions::close_subscription_account(ctx, subscription_bump)
    }

    pub fn complete_payment<'info>(ctx: Context<'_, '_, '_, 'info, CompletePayment<'info>>) -> Result<ThreadResponse> {
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

    pub fn switch_subscription_tier(ctx: Context<SwitchSubscriptionTier>) -> Result<()> {
        instructions::switch_subscription_tier(ctx)
    }

    pub fn register_payment_callback(ctx: Context<RegisterPaymentCallback>, app_id: u8, callback: Callback) -> Result<()> {
        instructions::register_payment_callback(ctx, app_id, callback)
    }
}
