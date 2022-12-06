use std::borrow::Borrow;

use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, TokenAccount};
use mpl_token_metadata::{
    assertions::assert_owned_by,
    state::{CollectionDetails, Metadata, TokenMetadataAccount},
};

use crate::{error::DistributionError, state::RoyaltyCollectedTreasury};

#[derive(Accounts)]
pub struct CreateRoyaltyCollectedTreasury<'info> {
    #[account(
        init,
        payer = authority,
        space = 10000,
        seeds = [
            b"royalty_collected_treasury".as_ref(),
            mint.key().as_ref(),
            shareholder_nft_collection_mint.key().as_ref()
        ],
        bump
    )]
    pub royalty_collected_treasury: Account<'info, RoyaltyCollectedTreasury>,
    pub treasury_token_account: Account<'info, TokenAccount>,
    pub royalties_token_account: Account<'info, TokenAccount>,
    pub mint: Account<'info, Mint>,
    pub shareholder_nft_collection_mint: Account<'info, Mint>,
    /// CHECK: We are manually deserializing the metadata account, and performing assertions
    pub shareholder_nft_collection_metadata: UncheckedAccount<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn create_royalty_collected_treasury(
    ctx: Context<CreateRoyaltyCollectedTreasury>,
) -> Result<()> {
    let treasury = &mut ctx.accounts.royalty_collected_treasury;
    let treasury_account = &ctx.accounts.treasury_token_account;
    let royalties_account = &ctx.accounts.royalties_token_account;
    let mint = &ctx.accounts.mint;
    let shareholder_nft_collection_mint = &ctx.accounts.shareholder_nft_collection_mint;
    let maybe_collection_metadata = &ctx.accounts.shareholder_nft_collection_metadata;
    let authority = &ctx.accounts.authority;

    // 1. make sure the metadata is owned by mpl token program
    assert_owned_by(
        &maybe_collection_metadata.to_account_info(),
        &mpl_token_metadata::id(),
    )?;

    // 2. make sure the metadata can be deserialized
    let collection_metadata = Metadata::from_account_info(maybe_collection_metadata.borrow())
        .map_err(|_| DistributionError::InvalidMetadata)?;

    // 3. make sure the metadata belongs to the mint.
    if collection_metadata.mint != shareholder_nft_collection_mint.key() {
        return Err(DistributionError::InvalidMetadata.into());
    }

    // 4. make sure the metadata has collection_details
    if collection_metadata.collection_details.is_none() {
        return Err(DistributionError::InvalidCollectionDetails.into());
    }

    // 5. make sure the collection_details is V1 (sized), and get the size
    match collection_metadata.collection_details {
        Some(CollectionDetails::V1 { size }) => Some(size),
        _ => None,
    }
    .ok_or(DistributionError::InvalidCollectionDetails)?;

    treasury.authority = authority.key();
    treasury.treasury_account = treasury_account.key();
    treasury.royalties_account = royalties_account.key();
    treasury.mint = mint.key();
    treasury.shareholder_nft_collection_mint = shareholder_nft_collection_mint.key();
    treasury.total_inflows = 0;
    treasury.total_royalties = 0;

    Ok(())
}
