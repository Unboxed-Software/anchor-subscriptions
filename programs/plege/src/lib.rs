use anchor_lang::prelude::*;

pub mod instructions;
pub mod state;
use instructions::*;
use state::Interval;

declare_id!("CoQBfJd641bD85WYv6g2vXZvD6ae43b63VyQ1DBeXgAs");

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
        name: String,
        price: u64,
        interval: Interval,
    ) -> Result<()> {
        instructions::create_tier(ctx, name, price, interval)
    }

    pub fn create_subscription(ctx: Context<CreateSubscription>) -> Result<()> {
        instructions::create_subscription(ctx)
    }

    pub fn complete_payment(ctx: Context<CompletePayment>) -> Result<()> {
        instructions::complete_payment(ctx)
    }
}
