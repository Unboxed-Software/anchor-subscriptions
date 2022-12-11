use crate::{error::PlegeError, state::*};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct CloseSubscriptionAccount<'info> {
    #[account(mut,
        close = subscriber,
        constraint = subscription.accept_new_payments == false
    )]
    pub subscription: Account<'info, Subscription>,
    #[account(mut)]
    pub subscriber: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn close_subscription_account(ctx: Context<CloseSubscriptionAccount>) -> Result<()> {
    let now_timestamp = Clock::get().unwrap().unix_timestamp;
    require!(
        now_timestamp > ctx.accounts.subscription.pay_period_expiration,
        PlegeError::SubscriptionNotExpired
    );

    Ok(())
}
