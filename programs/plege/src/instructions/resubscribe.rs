use crate::instructions::{App, Subscription, Tier};
use anchor_lang::prelude::*;
use anchor_spl::token::{transfer, Token, TokenAccount, Transfer};

#[derive(Accounts)]
pub struct Resubscribe<'info> {
    #[account(mut, 
        constraint = {msg!("subscription");subscription.expires < Clock::get().unwrap().unix_timestamp},
    )]
    pub subscription: Account<'info, Subscription>,
    #[account(mut)]
    pub app: Account<'info, App>,
    #[account(mut,
        constraint = {msg!("tier");tier.app == app.key() && tier.key() == subscription.tier},
        seeds = [b"tier", app.key().as_ref()],
        bump,
    )]
    pub tier: Account<'info, Tier>,
    #[account(mut,
        constraint = {msg!("owner"); owner.owner == app.owner.key() && owner.mint == tier.mint},
    )]
    pub owner: Account<'info, TokenAccount>,
    #[account(mut, constraint = {msg!("subscriber_ata"); subscriber_ata.owner == subscription.subscriber.key()
        && subscriber_ata.mint == tier.mint && subscriber_ata.amount >= tier.price},
    )]
    pub subscriber_ata: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn resubscribe(ctx: Context<Resubscribe>) -> Result<()> {
    let subscription = &mut ctx.accounts.subscription;
    let app = &mut ctx.accounts.app;
    let tier = &mut ctx.accounts.tier;
    let owner = ctx.accounts.owner.to_account_info();
    let subscriber_ata = &mut ctx.accounts.subscriber_ata.to_account_info();
    let token_program = ctx.accounts.token_program.to_account_info();

    subscription.expires = Clock::get().unwrap().unix_timestamp + (tier.interval as i64);

    let transfer_accounts = Transfer {
        from: subscriber_ata.clone(),
        to: owner.clone(),
        authority: tier.to_account_info().clone(),
    };
    
    let app_key = app.key();
    let tier_bump = *ctx.bumps.get("tier").unwrap();
    let seeds = &[b"tier".as_ref(), app_key.as_ref(), &[tier_bump]];
    let signers = [&seeds[..]];
    let transfer_amount = tier.price;

    let transfer_ctx =
            CpiContext::new_with_signer(token_program.clone(), transfer_accounts, &signers);

    transfer(transfer_ctx, transfer_amount)?;

    Ok(())
}