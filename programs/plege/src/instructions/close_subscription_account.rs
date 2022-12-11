use crate::{error::PlegeError, state::*};
use anchor_lang::prelude::*;
use clockwork_sdk::thread_program::accounts::Thread;
use clockwork_sdk::thread_program::ThreadProgram;

#[derive(Accounts)]
pub struct CloseSubscriptionAccount<'info> {
    pub app: Account<'info, App>,
    #[account(mut,
        close = subscriber,
        constraint = subscription.accept_new_payments == false
    )]
    pub subscription: Account<'info, Subscription>,
    #[account(mut)]
    pub subscriber: Signer<'info>,
    #[account(
        mut,
        constraint = subscription_thread.authority == subscription.key(),
        constraint = subscription_thread.id == "subscriber_thread"
    )]
    pub subscription_thread: Box<Account<'info, Thread>>,
    pub thread_program: Program<'info, ThreadProgram>,
    pub system_program: Program<'info, System>,
}

pub fn close_subscription_account(
    ctx: Context<CloseSubscriptionAccount>,
    subscription_bump: u8,
) -> Result<()> {
    let subscription = &ctx.accounts.subscription;
    let subscriber = &ctx.accounts.subscriber;
    let subscription_thread = &ctx.accounts.subscription_thread;
    let thread_program = &ctx.accounts.thread_program;
    let app = &ctx.accounts.app;

    let now_timestamp = Clock::get().unwrap().unix_timestamp;
    require!(
        now_timestamp > ctx.accounts.subscription.pay_period_expiration,
        PlegeError::SubscriptionNotExpired
    );

    clockwork_sdk::thread_program::cpi::thread_delete(CpiContext::new_with_signer(
        thread_program.to_account_info(),
        clockwork_sdk::thread_program::cpi::accounts::ThreadDelete {
            authority: subscription.to_account_info(),
            thread: subscription_thread.to_account_info(),
            close_to: subscriber.to_account_info(),
        },
        &[&[
            "SUBSCRIPTION".as_bytes(),
            app.key().as_ref(),
            subscriber.key().as_ref(),
            &[subscription_bump],
        ]],
    ))?;

    Ok(())
}
