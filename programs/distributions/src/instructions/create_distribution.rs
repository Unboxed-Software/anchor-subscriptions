use std::borrow::BorrowMut;

use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, TokenAccount};
use mpl_token_metadata::{
    assertions::assert_owned_by,
    state::{CollectionDetails, Metadata, TokenMetadataAccount},
};
use num::rational::Ratio;

use crate::{error::DistributionError, state::Distribution};

#[derive(Accounts)]
pub struct CreateDistribution<'info> {
    // #[account(
    //     init,
    //     seeds = [b"DISTRIBUTION".as_ref()]
    // )]
    pub distribution: Account<'info, Distribution>,
    pub distribution_token_account: Account<'info, TokenAccount>,
    pub distribution_authority: Signer<'info>,
    pub shareholder_nft_collection_mint: Account<'info, Mint>,
    pub shareholder_nft_collection_metadata: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

pub fn create_distribution(ctx: Context<CreateDistribution>) -> Result<()> {
    let distribution = &mut ctx.accounts.distribution;
    // TODO: 1. ensure that there are sufficient funds in the distribution token account
    let distribution_token_account = &mut ctx.accounts.distribution_token_account;
    let shareholder_nft_collection_mint = &ctx.accounts.shareholder_nft_collection_mint;
    let mut maybe_collection_metadata = &ctx.accounts.shareholder_nft_collection_metadata;

    // 1. make sure the metadata is owned by mpl token program
    assert_owned_by(
        &maybe_collection_metadata.to_account_info(),
        &mpl_token_metadata::id(),
    )?;

    // 2. make sure the metadata can be deserialized
    let collection_metadata = Metadata::from_account_info(maybe_collection_metadata.borrow_mut())
        .map_err(|_| DistributionError::InvalidMetadata)?;

    // 3. make sure the metadata belongs to the mint.
    if collection_metadata.mint != shareholder_nft_collection_mint.key() {
        return Err(DistributionError::InvalidMetadata.into());
    }

    // 4. make sure the metadata has collection_details
    if collection_metadata.collection_details.is_none() {
        return Err(DistributionError::InvalidCollectionDetails.into());
    }

    // 5. make sure the collection_details is V1 (sized)
    let collection_size = match collection_metadata.collection_details {
        Some(CollectionDetails::V1 { size }) => Some(size),
        _ => None,
    }
    .ok_or(DistributionError::InvalidCollectionDetails)?;

    distribution.amount_total = distribution_token_account.amount;
    distribution.recipient_count = collection_size;
    distribution.amount_per_share =
        Ratio::new(distribution.amount_total, distribution.recipient_count).to_integer();

    Ok(())
}
