use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, TokenAccount};

use crate::state::RoyaltyCollectedTreasury;

#[derive(Accounts)]
pub struct CreateRoyaltyCollectedTreasury<'info> {
    pub royalty_collected_treasury: Account<'info, RoyaltyCollectedTreasury>,
    pub treasury_account: Account<'info, TokenAccount>,
    pub royalties_account: Account<'info, TokenAccount>,
    pub mint: Account<'info, Mint>,
    pub shareholder_nft_collection_mint: Account<'info, Mint>,
    /// CHECK: We are manually deserializing the metadata account, and performing assertions
    pub shareholder_nft_collection_metadata: UncheckedAccount<'info>,
    pub authority: Signer<'info>,
}

pub fn create_royalty_collected_treasury(
    ctx: Context<CreateRoyaltyCollectedTreasury>,
) -> Result<()> {
    Ok(())
}
