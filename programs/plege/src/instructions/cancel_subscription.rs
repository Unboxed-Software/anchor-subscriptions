use crate::state::*;
use anchor_lang::prelude::*;
use anchor_spl::token::{revoke, Revoke, Token, TokenAccount};

#[derive(Accounts)]
pub struct CancelSubscription<'info> {
    pub app: Account<'info, App>,
    #[account(mut,
        constraint = tier.app == app.key(),
    )]
    pub tier: Account<'info, Tier>,
    #[account(mut,
        close = subscriber,
        seeds = ["SUBSCRIPTION".as_bytes(), app.key().as_ref(), subscriber.key().as_ref()],
        bump,
    )]
    pub subscription: Account<'info, Subscription>,
    #[account(mut)]
    pub subscriber: Signer<'info>,
    #[account(mut,
        constraint = subscriber_ata.mint == app.mint && subscriber_ata.owner == subscriber.key() && subscriber_ata.amount >= tier.price,
    )]
    pub subscriber_ata: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn cancel_subscription(ctx: Context<CancelSubscription>) -> Result<()> {
    let subscription = &mut ctx.accounts.subscription;
    let subscriber = &mut ctx.accounts.subscriber.to_account_info();
    let subscriber_ata = &mut ctx.accounts.subscriber_ata.to_account_info();
    let token_program = ctx.accounts.token_program.to_account_info();

    subscription.accept_new_payments = false;

    let revoke_accounts = Revoke {
        source: subscriber_ata.clone(),
        authority: subscriber.clone(),
    };

    let revoke_ctx = CpiContext::new(token_program.clone(), revoke_accounts);
    revoke(revoke_ctx)?;

    Ok(())
}
