use anchor_lang::prelude::*;
use anchor_spl::token::Mint;

use crate::error::PledgeError;
use crate::state::*;

#[derive(Accounts)]
pub struct ToggleNewSubscribers<'info> {
    #[account(
        mut,
        has_one = app,
        constraint = tier.active == true
    )]
    pub tier: Account<'info, Tier>,
    #[account(
        has_one = auth
    )]
    pub app: Account<'info, App>,
    pub auth: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn disallow_new_subscribers(ctx: Context<ToggleNewSubscribers>) -> Result<()> {
    let tier = &mut ctx.accounts.tier;
    tier.accepting_new_subs = false;

    Ok(())
}

pub fn allow_new_subscribers(ctx: Context<ToggleNewSubscribers>) -> Result<()> {
    let tier = &mut ctx.accounts.tier;
    tier.accepting_new_subs = true;

    Ok(())
}

pub fn disable_tier(ctx: Context<ToggleNewSubscribers>) -> Result<()> {
    let tier = &mut ctx.accounts.tier;
    tier.active = false;
    tier.accepting_new_subs = false;

    Ok(())
}
