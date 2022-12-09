use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};
use mpl_token_metadata::state::{CollectionDetails, Metadata};

use crate::state::Referralship;

#[derive(Accounts)]
pub struct SplitPayment<'info> {
    pub referralship: Account<'info, Referralship>,
    pub referral_agent_nft_token_account: Account<'info, TokenAccount>,
    /// CHECK: This account will be manually deserialized and checked.
    pub referral_agent_nft_token_metadata: UncheckedAccount<'info>,
    pub referral_agents_collection_nft_mint: Account<'info, Mint>,
    /// CHECK: This account will be manually deserialized and checked.
    pub referral_agents_collection_nft_metadata: UncheckedAccount<'info>,
    pub token_program: Program<'info, Token>,
}

pub fn split_payment(ctx: Context<SplitPayment>) -> Result<()> {
    Ok(())
}
