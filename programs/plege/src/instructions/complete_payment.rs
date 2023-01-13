use anchor_lang::prelude::*;
use anchor_spl::token::{transfer, Token, TokenAccount, Transfer};
use clockwork_sdk::ThreadResponse;
use clockwork_sdk::thread_program::accounts::Thread;
use anchor_lang::solana_program::{instruction::Instruction, program::{invoke, invoke_signed}};
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

pub fn complete_payment<'info>(ctx: Context<'_, '_, '_, 'info, CompletePayment<'info>>) -> Result<ThreadResponse> {
    //let subscription = &mut ctx.accounts.subscription;
    let app = &mut ctx.accounts.app;
    //let tier = &mut ctx.accounts.tier;
    let destination = ctx.accounts.destination.to_account_info();
    let subscriber_ata = &mut ctx.accounts.subscriber_ata.to_account_info();
    let token_program = ctx.accounts.token_program.to_account_info();

    let now_timestamp = Clock::get().unwrap().unix_timestamp;

    let last_pay_period: i64 = ctx.accounts.subscription.pay_period_expiration;

    require!(ctx.accounts.tier.interval.grace_period() > now_timestamp - last_pay_period, PlegeError::MissedPayment);
    require!(ctx.accounts.subscription.accept_new_payments, PlegeError::InactiveSubscription);

    let balance = ctx.accounts.tier.price - ctx.accounts.subscription.credits;

    msg!("balance is {:?}", balance);

    if balance > 0 {
        // if callback exists, call callback ix
        if let Some(callback_ix) = &app.callback {

            // build instruction
            let dynamic_accounts_meta = vec![
                AccountMeta::new_readonly(ctx.accounts.subscription.key(), false),
                AccountMeta::new_readonly(ctx.accounts.tier.key(), false),
                AccountMeta::new_readonly(ctx.remaining_accounts[0].key(), false),
                AccountMeta::new_readonly(ctx.remaining_accounts[1].key(), false),
                AccountMeta::new(ctx.accounts.subscriber_ata.key(), false),
                ];
            let instruction: Instruction = callback_ix.construct_callback(Some(dynamic_accounts_meta));

            // way to iterate over remaining_accounts
            // let user_account_info = ctx
            //     .remaining_accounts
            //     .iter()
            //     .find(|remaining_account| remaining_account.key() == user_pubkey)
            //     .ok_or(error!(CustomErrors::MissingOpenOrdersPubkeyInRemainingAccounts))?;

            // invoke cpi, hard coding required split_payment accounts for now
            invoke(
                &instruction,
                &[
                    ctx.accounts.app.to_account_info(), // *static*
                    ctx.accounts.subscriber_ata.to_account_info(), // *dynamic*
                    ctx.accounts.subscription.to_account_info(), // *dynamic*
                    ctx.accounts.tier.to_account_info(), // *dynamic*
                    ctx.accounts.token_program.to_account_info(), // *static*
                    ctx.remaining_accounts[0].clone(), // subscriber *dynamic*
                    ctx.remaining_accounts[1].clone(), // referral *dynamic*
                    ctx.remaining_accounts[2].clone(), // app authority *static*
                    ctx.remaining_accounts[3].clone(), // referralship *static*
                    ctx.remaining_accounts[4].clone(), // referral_agent_nft_mint *static*
                    ctx.remaining_accounts[5].clone(), // referral_agent_nft_metadata *staic*
                    ctx.remaining_accounts[6].clone(), // referral_agent_nft_token_account *static*
                    ctx.remaining_accounts[7].clone(), // referral_agent_treasury_token_account *staic*
                    ctx.remaining_accounts[8].clone(), // referral_agents_collection_nft_mint *static*
                    ctx.remaining_accounts[9].clone(), // referral_agents_collection_nft_metadata *static*
                    ctx.remaining_accounts[10].clone(), // treasury mint *static*
                    ctx.remaining_accounts[11].clone(), // treasury token account *static*
                    ctx.remaining_accounts[12].clone(), // plege program *static*
                ]
            )?;
            
        } else {
            // else continue with transfer
            let transfer_accounts = Transfer {  
                from: subscriber_ata.clone(),
                to: destination.clone(),
                authority: ctx.accounts.subscription.to_account_info().clone(),
            };

            let app_key = app.key();
            let subscriber_key = ctx.accounts.subscription.subscriber;
            let subscription_bump = ctx.accounts.subscription.bump;
            let seeds = &["SUBSCRIPTION".as_bytes(), app_key.as_ref(), subscriber_key.as_ref(), &[subscription_bump]];
            let signers = [&seeds[..]];
            let transfer_amount = balance;

            let transfer_ctx =
                    CpiContext::new_with_signer(token_program.clone(), transfer_accounts, &signers);

            transfer(transfer_ctx, transfer_amount)?;
        }
    } else {
        ctx.accounts.subscription.credits -= ctx.accounts.tier.price;
    }

    let subscription = &mut ctx.accounts.subscription;
    let tier = &mut ctx.accounts.tier;
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