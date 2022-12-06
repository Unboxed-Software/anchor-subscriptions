use std::borrow::Borrow;

use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, TokenAccount};
use mpl_token_metadata::{
    assertions::assert_owned_by,
    state::{CollectionDetails, Metadata, TokenMetadataAccount},
};
use num::rational::Ratio;

use crate::{
    error::DistributionError,
    state::{Distribution, RoyaltyCollectedTreasury},
};

#[derive(Accounts)]
#[instruction(date: String)]
pub struct CreateDistribution<'info> {
    #[account(
        init,
        space = 10000, // TODO: Properly size this account.
        seeds = [
            b"distribution".as_ref(),
            treasury.key().as_ref(),
            date.as_ref()
        ],
        bump,
        payer = treasury_authority,
    )]
    pub distribution: Account<'info, Distribution>,
    pub distribution_token_account: Account<'info, TokenAccount>,
    pub royalties_token_account: Account<'info, TokenAccount>,
    pub shareholder_nft_collection_mint: Account<'info, Mint>,
    /// CHECK: We are manually deserializing the metadata account, and performing assertions
    pub shareholder_nft_collection_metadata: UncheckedAccount<'info>,
    pub treasury: Account<'info, RoyaltyCollectedTreasury>,
    #[account(mut)]
    pub treasury_authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn create_distribution(ctx: Context<CreateDistribution>, date: String) -> Result<()> {
    let distribution = &mut ctx.accounts.distribution;
    // TODO: 1. ensure that there are sufficient funds in the royalties token account
    // to be transferred to the distribution token account.
    let treasury = &mut ctx.accounts.treasury;
    let _royalties_token_account = &mut ctx.accounts.royalties_token_account;
    let distribution_token_account = &mut ctx.accounts.distribution_token_account;
    let shareholder_nft_collection_mint = &ctx.accounts.shareholder_nft_collection_mint;
    let maybe_collection_metadata = &ctx.accounts.shareholder_nft_collection_metadata;

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
    let collection_size = match collection_metadata.collection_details {
        Some(CollectionDetails::V1 { size }) => Some(size),
        _ => None,
    }
    .ok_or(DistributionError::InvalidCollectionDetails)?;

    if collection_size == 0 {
        return Err(DistributionError::ZeroCollectionSize.into());
    }

    if distribution_token_account.amount == 0 {
        return Err(DistributionError::ZeroDistribution.into());
    }

    // TODO: Maybe this needs to be paramaterized with an amount.
    // 6. transfer from the royalties account to the distribution account
    // let transfer_context = CpiContext::new_with_signer()
    // anchor_spl::token::transfer()?;

    // 7. set the distribution state
    distribution.treasury = treasury.key();
    distribution.amount_total = distribution_token_account.amount;
    distribution.recipient_count = collection_size;
    distribution.date = date;
    distribution.amount_per_share =
        Ratio::new(distribution.amount_total, distribution.recipient_count).to_integer();

    Ok(())
}
