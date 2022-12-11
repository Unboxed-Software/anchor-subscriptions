use crate::error::PlegeError;
use crate::state::*;
use anchor_lang::prelude::*;
use anchor_spl::token::{approve, Approve, Token, TokenAccount};
use clockwork_sdk::thread_program::{
    accounts::{Thread, ThreadSettings, Trigger},
    ThreadProgram,
};

#[derive(Accounts)]
pub struct SwitchSubscriptionTier<'info> {
    pub app: Account<'info, App>,
    #[account(
      has_one = app,
      constraint = old_tier.active == true,
    )]
    pub old_tier: Account<'info, Tier>,
    #[account(
      has_one = app,
      constraint = new_tier.active == true,
      constraint = new_tier.accepting_new_subs == true
    )]
    pub new_tier: Account<'info, Tier>,
    #[account(
        mut,
        seeds = ["SUBSCRIPTION".as_bytes(), app.key().as_ref(), subscriber.key().as_ref()],
        bump,
        has_one = subscriber
    )]
    pub subscription: Account<'info, Subscription>,
    #[account(mut)]
    pub subscriber: Signer<'info>,
    #[account(mut,
      constraint = subscriber_ata.mint == app.mint && subscriber_ata.owner == subscriber.key() && subscriber_ata.amount >= new_tier.price,
    )]
    pub subscriber_ata: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = subscription_thread.authority == subscription.key(),
        constraint = subscription_thread.id == "subscriber_thread"
    )]
    pub subscription_thread: Box<Account<'info, Thread>>,
    pub thread_program: Program<'info, ThreadProgram>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn switch_subscription_tier(ctx: Context<SwitchSubscriptionTier>) -> Result<()> {
    let app = &ctx.accounts.app;
    let old_tier = &ctx.accounts.old_tier;
    let new_tier = &ctx.accounts.new_tier;
    let subscriber = &mut ctx.accounts.subscriber.to_account_info();
    let subscriber_ata = &mut ctx.accounts.subscriber_ata.to_account_info();
    let token_program = ctx.accounts.token_program.to_account_info();
    let system_program = ctx.accounts.system_program.to_account_info();
    let thread_program = ctx.accounts.thread_program.to_account_info();
    let subscription_thread = &ctx.accounts.subscription_thread;

    let subscription = &mut ctx.accounts.subscription;

    let now_timestamp = Clock::get().unwrap().unix_timestamp;

    let time_elapsed = now_timestamp - subscription.pay_period_start;
    let total_period_duration = subscription.pay_period_expiration - subscription.pay_period_start;

    require!(
        time_elapsed > 0 && time_elapsed < total_period_duration,
        PlegeError::InactiveSubscription
    );

    let unused_balance =
        old_tier.price - (old_tier.price * time_elapsed as u64 / total_period_duration as u64);
    msg!("unused balance: {}", unused_balance);

    subscription.credits += unused_balance;
    subscription.start = now_timestamp;
    subscription.pay_period_start = subscription.start;
    subscription.pay_period_expiration = subscription.start;
    subscription.tier = new_tier.clone().key();
    subscription.accept_new_payments = true;

    // approve
    let approve_amount = new_tier.price * new_tier.interval.max_approval_len();
    let approve_accounts = Approve {
        to: subscriber_ata.clone(),
        delegate: subscription.to_account_info().clone(),
        authority: subscriber.clone(),
    };
    let approve_ctx = CpiContext::new(token_program.clone(), approve_accounts);
    approve(approve_ctx, approve_amount)?;

    clockwork_sdk::thread_program::cpi::thread_update(
        CpiContext::new_with_signer(
            thread_program,
            clockwork_sdk::thread_program::cpi::accounts::ThreadUpdate {
                authority: subscription.to_account_info(),
                thread: subscription_thread.to_account_info(),
                system_program: system_program,
            },
            &[&[
                "SUBSCRIPTION".as_bytes(),
                app.key().as_ref(),
                subscriber.key().as_ref(),
                &[subscription.bump],
            ]],
        ),
        ThreadSettings {
            fee: None,
            kickoff_instruction: None,
            rate_limit: None,
            trigger: Some(Trigger::Cron {
                schedule: new_tier.interval.cron_schedule(now_timestamp).clone(),
                skippable: false,
            }),
        },
    )?;

    Ok(())
}
