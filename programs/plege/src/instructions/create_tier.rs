use anchor_lang::prelude::*;
use anchor_spl::token::Mint;

use crate::state::*;

#[derive(Accounts)]
pub struct CreateTier<'info> {
    #[account(init,
        payer = signer,
        space = 8 + std::mem::size_of::<Tier>(),
        seeds = ["SUBSCRIPTION_TIER".as_bytes(), app.key().as_ref()],
        bump,
    )]
    pub tier: Account<'info, Tier>,
    #[account(mut)]
    pub app: Account<'info, App>,
    pub mint: Account<'info, Mint>,
    #[account(mut, 
        constraint = app.auth == signer.key(),
    )]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn create_tier(ctx: Context<CreateTier>, name: String, price: u64, interval: Interval) -> Result<()> {
    let tier = &mut ctx.accounts.tier;
    let mint = ctx.accounts.mint.clone();
    tier.app = *ctx.accounts.app.to_account_info().key;
    tier.name = name;
    tier.mint = mint.key();
    tier.price = price;
    tier.interval = interval;

    Ok(())
}
