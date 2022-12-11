use anchor_lang::prelude::*;

use crate::state::*;
use crate::error::PlegeError;

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
        constraint = tier_id == app.num_tiers + 1 @ PlegeError::InvalidTierId
    )]
    pub app: Account<'info, App>,
    #[account(mut, 
        constraint = app.auth == signer.key(),
    )]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn create_tier(ctx: Context<CreateTier>, _tier_id: u8, name: String, price: u64, interval: Interval) -> Result<()> {
    let tier = &mut ctx.accounts.tier;
    let app = &mut ctx.accounts.app;
    tier.app = app.key();
    tier.name = name;
    tier.price = price;
    tier.interval = interval;
    tier.accepting_new_subs = true;
    tier.active = true;

    app.num_tiers += 1;

    Ok(())
}