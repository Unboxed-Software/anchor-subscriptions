use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};
use mpl_token_metadata::state::{CollectionDetails, Metadata};
use plege::{program::Plege, state::App};

use crate::{
    error::ReferralError,
    state::{Referralship, Splits8},
};

#[derive(Accounts)]
#[instruction(splits: Splits8, app_id: u8)]
pub struct CreateReferralship<'info> {
    #[account(
        init,
        payer = app_authority,
        space = 1000, 
        seeds = [],
        bump
    )]
    pub referralship: Account<'info, Referralship>,
    #[account(
        seeds = ["APP".as_bytes(), app.auth.key().as_ref(), app_id.to_be_bytes().as_ref()],
        bump,
        owner = plege_program.key()
    )]
    pub app: Account<'info, App>,
    pub referral_agents_collection_nft_mint: Account<'info, Mint>,
    /// CHECK: we will manually deserialize and check this account
    pub referral_agents_collection_nft_metadata: UncheckedAccount<'info>,
    #[account(mut)]
    #[account(constraint = app_authority.key() == app.auth.key() @ ReferralError::InvalidAppAuthority)]
    pub app_authority: Signer<'info>,
    pub plege_program: Program<'info, Plege>,
    pub system_program: Program<'info, System>,
}

pub fn create_referralship(
    ctx: Context<CreateReferralship>,
    splits: Splits8,
    app_id: u8,
) -> Result<()> {
    Ok(())
}
