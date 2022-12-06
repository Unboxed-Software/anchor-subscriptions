use anchor_lang::prelude::*;
use anchor_spl::token::Mint;

use crate::error::PledgeError;
use crate::state::*;

#[derive(Accounts)]
#[instruction(tier_id: u8)]
pub struct CreateTier<'info> {
    #[account(init,
        payer = signer,
        space = 8 + std::mem::size_of::<Tier>(),
        seeds = ["SUBSCRIPTION_TIER".as_bytes(), app.key().as_ref(), tier_id.to_be_bytes().as_ref()],
        bump,
    )]
    pub tier: Account<'info, Tier>,
    #[account(
        mut,
        constraint = tier_id == app.num_tiers + 1 @ PledgeError::InvalidTierId
    )]
    pub app: Account<'info, App>,
    pub mint: Account<'info, Mint>,
    #[account(mut, 
        constraint = app.auth == signer.key(),
    )]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn create_tier(
    ctx: Context<CreateTier>,
    _tier_id: u8,
    name: String,
    price: u64,
    interval: Interval,
) -> Result<()> {
    let tier = &mut ctx.accounts.tier;
    let app = &mut ctx.accounts.app;
    let mint = ctx.accounts.mint.clone();
    tier.app = app.key();
    tier.name = name;
    tier.mint = mint.key();
    tier.price = price;
    tier.interval = interval;

    app.num_tiers += 1;

    Ok(())
}
