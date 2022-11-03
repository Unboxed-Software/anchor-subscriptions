use anchor_lang::prelude::*;
use anchor_spl::token::Mint;

use crate::instructions::App;

#[account]
pub struct Tier {
    pub app: Pubkey,
    pub mint: Pubkey,
    pub price: u64,
    pub interval: i64,
}

#[derive(Accounts)]
pub struct CreateTier<'info> {
    #[account(init,
        payer = signer,
        space = 8 + 32 + 32 + 8 + 8,
        seeds = [b"tier".as_ref(), app.key().as_ref()],
        bump,
    )]
    pub tier: Account<'info, Tier>,
    #[account(mut)]
    pub app: Account<'info, App>,
    pub mint: Account<'info, Mint>,
    #[account(mut, 
        constraint = app.owner == signer.key(),
    )]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn create_tier(ctx: Context<CreateTier>, price: u64, interval: i64) -> Result<()> {
    let tier = &mut ctx.accounts.tier;
    let mint = ctx.accounts.mint.clone();
    tier.app = *ctx.accounts.app.to_account_info().key;
    tier.mint = mint.key();
    tier.price = price * 10u64.pow(mint.decimals as u32);
    tier.interval = interval;

    Ok(())
}
