use anchor_lang::{prelude::*};
use anchor_spl::token::{transfer, Token, TokenAccount, Transfer};
use clockwork_sdk::ThreadResponse;
use clockwork_sdk::thread_program::accounts::Thread;
use plege::state::*;
use plege::error::PlegeError;
use referrals::cpi::{ accounts::SplitPayment };


declare_id!("ov9EhgYsv4QZozmTrXx8jnkC7LESA5kaCsXqRg2d6NM");

#[program]
pub mod payment {
    use super::*;

    pub fn complete_payment<'info>(ctx: Context<'_, '_, '_, 'info, CompletePayment<'info>>) -> Result<ThreadResponse> {
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

        if ctx.remaining_accounts.len() > 0 {
            let mut iter = ctx.remaining_accounts.into_iter();

            let maybe_app_authority = iter.next().ok_or(PaymentError::MissingAccount)?;
            let maybe_subscriber = iter.next().ok_or(PaymentError::MissingAccount)?;
            let maybe_referral = iter.next().ok_or(PaymentError::MissingAccount)?;
            // let referral = Referral::try_from_slice(*maybe_referral.try_borrow_data()?)?;
            let maybe_referralship = iter.next().ok_or(PaymentError::MissingAccount)?;
            // let referralship = Referralship::try_from_slice(*maybe_referralship.try_borrow_data()?)?;
            let maybe_referral_agent_nft_mint = iter.next().ok_or(PaymentError::MissingAccount)?;
            // let referral_agent_nft_mint = anchor_spl::token::spl_token::state::Mint::unpack(&maybe_referral_agent_nft_mint.try_borrow_data()?)?;
            let maybe_referral_agent_nft_metadata = iter.next().ok_or(PaymentError::MissingAccount)?;
            let maybe_referral_agent_nft_token_account = iter.next().ok_or(PaymentError::MissingAccount)?;
            // let referral_agent_nft_token_account = anchor_spl::token::spl_token::state::Account::unpack(&maybe_referral_agent_nft_mint.try_borrow_data()?)?;
            let maybe_referral_agent_treasury_token_account = iter.next().ok_or(PaymentError::MissingAccount)?;
            // let referral_agent_treasury_token_account = anchor_spl::token::spl_token::state::Account::unpack(&maybe_referral_agent_nft_mint.try_borrow_data()?)?;
            let maybe_referral_agents_collection_nft_mint = iter.next().ok_or(PaymentError::MissingAccount)?;
            // let referral_agents_collection_nft_mint = anchor_spl::token::spl_token::state::Mint::unpack(&maybe_referral_agent_nft_mint.try_borrow_data()?)?;
            let maybe_referral_agents_collection_nft_metadata = iter.next().ok_or(PaymentError::MissingAccount)?;
            let maybe_treasury_mint = iter.next().ok_or(PaymentError::MissingAccount)?;
            // let referral_agent_nft_token_account = anchor_spl::token::spl_token::state::Account::unpack(&maybe_referral_agent_nft_mint.try_borrow_data()?)?;
            let maybe_treasury_token_account = iter.next().ok_or(PaymentError::MissingAccount)?;
            // TokenAccount
            let maybe_plege_program = iter.next().ok_or(PaymentError::MissingAccount)?;
            let maybe_referrals_program = iter.next().ok_or(PaymentError::MissingAccount)?;

            require!(maybe_referrals_program.key() == referrals::ID, PaymentError::WrongReferralsProgram);
            require!(iter.next().is_some(), PaymentError::TooManyAccounts);

            let split_payment_accounts = SplitPayment {
                app: app.to_account_info(),
                app_authority: maybe_app_authority.to_owned(),
                subscriber: maybe_subscriber.to_owned(),
                subscription: subscription.to_account_info(),
                tier: tier.to_account_info(),
                referral: maybe_referral.to_owned(),
                referralship: maybe_referralship.to_owned(),
                referral_agent_nft_mint: maybe_referral_agent_nft_mint.to_owned(),
                referral_agent_nft_metadata: maybe_referral_agent_nft_metadata.to_owned(),
                referral_agent_nft_token_account: maybe_referral_agent_nft_token_account.to_owned(),
                referral_agent_treasury_token_account: maybe_referral_agent_treasury_token_account.to_owned(),
                referral_agents_collection_nft_mint: maybe_referral_agents_collection_nft_mint.to_owned(),
                referral_agents_collection_nft_metadata: maybe_referral_agents_collection_nft_metadata.to_owned(),
                treasury_mint: maybe_treasury_mint.to_owned(),
                treasury_token_account: maybe_treasury_token_account.to_owned(),
                plege_program: maybe_plege_program.to_owned(),
                token_program: token_program,
            };

            let app_key = app.key();
            let subscriber_key = maybe_subscriber.key();
            let seeds: &[&[&[u8]]] = &[&[
                    "SUBSCRIPTION".as_bytes(), 
                    app_key.as_ref(), 
                    subscriber_key.as_ref(), 
                    &[subscription.bump] 
                ]];

            let context = CpiContext::new_with_signer(
                maybe_referrals_program.to_owned(),
                split_payment_accounts, 
                seeds
            );

            referrals::cpi::split_payment(context)?;
        } 

        Ok(ThreadResponse::default())
    }
}

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
        constraint = {msg!("destination"); destination.owner == app.treasury.key() && destination.mint == app.mint},
    )]
    pub destination: Account<'info, TokenAccount>,
    #[account(mut, constraint = {msg!("subscriber_ata"); subscriber_ata.owner == subscription.subscriber.key()
        && subscriber_ata.mint == app.mint && subscriber_ata.amount >= tier.price},
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

#[error_code]
pub enum PaymentError {
    MissingAccount,
    TooManyAccounts,
    WrongReferralsProgram
}