use anchor_lang::prelude::*;
use anchor_spl::token::{transfer, Token, TokenAccount, Transfer};
use clockwork_sdk::ThreadResponse;
use clockwork_sdk::thread_program::accounts::Thread;
use crate::state::*;
use crate::error::PlegeError;

#[derive(Accounts)]
pub struct CompletePayment<'info> {
    #[account(mut, 
        has_one = tier
    )]
    pub subscription: Account<'info, Subscription>,
    #[account(mut)]
    pub app: Account<'info, App>,
    #[account(mut,
        has_one = app,
        constraint = tier.active == true
    )]
    pub tier: Account<'info, Tier>,
    #[account(mut,
        constraint = destination.owner == app.treasury.key(),
        constraint = destination.mint == app.mint,
    )]
    pub destination: Account<'info, TokenAccount>,
    #[account(mut, 
        constraint = subscriber_ata.owner == subscription.subscriber.key(),
        constraint = subscriber_ata.mint == app.mint,
        constraint = subscriber_ata.amount >= tier.price,
    )]
    pub subscriber_ata: Account<'info, TokenAccount>,
    #[account(
        constraint = subscription_thread.authority == subscription.key(),
        constraint = subscription_thread.id == "subscriber_thread"
    )]
    pub subscription_thread: Box<Account<'info, Thread>>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn complete_payment(ctx: Context<CompletePayment>) -> Result<ThreadResponse> {
    let subscription = &mut ctx.accounts.subscription;
    let app = &mut ctx.accounts.app;
    let tier = &mut ctx.accounts.tier;
    let destination = ctx.accounts.destination.to_account_info();
    let subscriber_ata = &mut ctx.accounts.subscriber_ata.to_account_info();
    let token_program = ctx.accounts.token_program.to_account_info();

    let now_timestamp = Clock::get().unwrap().unix_timestamp;

    let last_pay_period: i64 = subscription.pay_period_expiration;

    require!(tier.interval.grace_period() > now_timestamp - last_pay_period, PlegeError::MissedPayment);
    require!(subscription.accept_new_payments, PlegeError::InactiveSubscription);

    let balance = tier.price - subscription.credits;

    msg!("balance is {:?}", balance);

    if balance > 0 {
        let transfer_accounts = Transfer {  
            from: subscriber_ata.clone(),
            to: destination.clone(),
            authority: subscription.to_account_info().clone(),
        };

        let app_key = app.key();
        let subscriber_key = subscription.subscriber;
        let subscription_bump = subscription.bump;
        let seeds = &["SUBSCRIPTION".as_bytes(), app_key.as_ref(), subscriber_key.as_ref(), &[subscription_bump]];
        let signers = [&seeds[..]];
        let transfer_amount = balance;

        let transfer_ctx =
                CpiContext::new_with_signer(token_program.clone(), transfer_accounts, &signers);

        transfer(transfer_ctx, transfer_amount)?;
    } else {
        subscription.credits -= tier.price;
    }

    subscription.last_payment_time = Some(now_timestamp);
    subscription.pay_period_start = subscription.pay_period_expiration;
    subscription.pay_period_expiration = tier.interval.increment(last_pay_period);

    Ok(ThreadResponse::default())
}


// pub fn intervals_since_start(start: i64, now: i64, interval: Interval) -> u32 {
//     let now = NaiveDateTime::from_timestamp_opt(now, 0).unwrap();
//     let start = NaiveDateTime::from_timestamp_opt(start, 0).unwrap();

//     match interval {
//         Interval::Month => months_since_start(start, now) + 1,
//         Interval::Year => years_since_start(start, now) + 1
//     }
// }

// pub fn months_since_start(start: NaiveDateTime, now: NaiveDateTime) -> u32 {
//     let years = now.year() - start.year();
//     let months = now.month() - start.month();

//     let mut months = (years as u32)*12 + months;
//     if now.day() < start.day() {
//         months -= 1;
//     }

//     return months;
// }

// pub fn years_since_start(start: NaiveDateTime, now: NaiveDateTime) -> u32 {
//     let years = now.year() - start.year();
//     if (now.month() == start.month() && now.day() >= start.day()) ||
//         now.month() > start.month() {
//         return years as u32;
//     } else {
//         return max(0, (years as u32) - 1);
//     }
// }