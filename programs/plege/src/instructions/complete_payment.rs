use anchor_lang::prelude::*;
use anchor_spl::token::{transfer, Token, TokenAccount, Transfer};
use crate::state::*;
use crate::error::PlegeError;

#[derive(Accounts)]
pub struct CompletePayment<'info> {
    #[account(mut, 
        // constraint = {msg!("subscription");subscription.expiration < Clock::get().unwrap().unix_timestamp},
    )]
    pub subscription: Account<'info, Subscription>,
    #[account(mut)]
    pub app: Account<'info, App>,
    #[account(mut,
        constraint = tier.app == app.key() && tier.key() == subscription.tier,
        constraint = tier.active == true
    )]
    pub tier: Account<'info, Tier>,
    #[account(mut,
        constraint = {msg!("destination"); destination.owner == app.treasury.key() && destination.mint == tier.mint},
    )]
    pub destination: Account<'info, TokenAccount>,
    #[account(mut, constraint = {msg!("subscriber_ata"); subscriber_ata.owner == subscription.subscriber.key()
        && subscriber_ata.mint == tier.mint && subscriber_ata.amount >= tier.price},
    )]
    pub subscriber_ata: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn complete_payment(ctx: Context<CompletePayment>) -> Result<()> {
    let subscription = &mut ctx.accounts.subscription;
    let app = &mut ctx.accounts.app;
    let tier = &mut ctx.accounts.tier;
    let destination = ctx.accounts.destination.to_account_info();
    let subscriber_ata = &mut ctx.accounts.subscriber_ata.to_account_info();
    let token_program = ctx.accounts.token_program.to_account_info();

    let now_timestamp = Clock::get().unwrap().unix_timestamp;

    let last_pay_period: i64 = subscription.active_through;

    require!(now_timestamp - last_pay_period < 60 * 60 * 24, PlegeError::MissedPayment);

    let balance = tier.price;

    msg!("balance is {:?}", balance);
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

    subscription.active_through = tier.interval.increment(last_pay_period);

    Ok(())
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