use std::borrow::Borrow;

use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};
use mpl_token_metadata::{
    assertions::assert_owned_by,
    state::{CollectionDetails, Metadata, TokenMetadataAccount},
};
use plege::state::{App, Subscription, Tier};

use crate::{
    error::ReferralError,
    state::{Referral, Referralship, Splits8, REFERRAL},
};

#[derive(Accounts)]
pub struct SplitPayment<'info> {
    // #[account(
    //     seeds = ["APP".as_bytes(), app.auth.key().as_ref(), referralship.app_id.to_be_bytes().as_ref()],
    //     seeds::program = plege_program.key(),
    //     bump
    // )]
    pub app: Box<Account<'info, App>>,
    // #[account(
    //     seeds = ["SUBSCRIPTION".as_bytes(), app.key().as_ref(), subscriber.key().as_ref()],
    //     seeds::program = plege_program.key(),
    //     bump
    // )]
    pub subscription: Box<Account<'info, Subscription>>,
    /// CHECK: Just needs to be a system account.
    pub subscriber: UncheckedAccount<'info>,
    // #[account(
    //     seeds = ["SUBSCRIPTION_TIER".as_bytes(), app.key().as_ref(), tier_id.to_be_bytes().as_ref()],
    //     seeds::program = plege_program.key(),
    //     bump
    // )]
    pub tier: Box<Account<'info, Tier>>,
    // #[account(
    //     seeds = [
    //         REFERRAL.as_bytes(),
    //         app.key().as_ref(),
    //         subscription.key().as_ref(),
    //         referral_agent_nft_mint.key().as_ref()
    //     ],
    //     bump
    // )]
    pub referral: Box<Account<'info, Referral>>,
    pub referralship: Box<Account<'info, Referralship>>,
    pub referral_agent_nft_mint: Box<Account<'info, Mint>>,
    /// CHECK: This account will be manually deserialized and checked.
    pub referral_agent_nft_metadata: UncheckedAccount<'info>,
    pub referral_agent_nft_token_account: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub referral_agent_treasury_token_account: Box<Account<'info, TokenAccount>>,
    pub referral_agents_collection_nft_mint: Box<Account<'info, Mint>>,
    /// CHECK: This account will be manually deserialized and checked.
    pub referral_agents_collection_nft_metadata: UncheckedAccount<'info>,
    pub treasury_mint: Box<Account<'info, Mint>>,
    #[account(mut)]
    pub treasury_token_account: Box<Account<'info, TokenAccount>>,
    pub treasury_authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

pub fn split_payment(ctx: Context<SplitPayment>) -> Result<()> {
    let app = &ctx.accounts.app;
    let subscription = &ctx.accounts.subscription;
    let tier = &ctx.accounts.tier;
    let referralship = &ctx.accounts.referralship;
    let referral_agent_nft_mint = &ctx.accounts.referral_agent_nft_mint;
    let referral_agent_nft_token_account = &ctx.accounts.referral_agent_nft_token_account;
    let referral_agent_treasury_token_account = &ctx.accounts.referral_agent_treasury_token_account;
    let maybe_referral_agent_nft_metadata = &ctx.accounts.referral_agent_nft_metadata;
    let referral_agents_collection_nft_mint = &ctx.accounts.referral_agents_collection_nft_mint;
    let maybe_referral_agents_collection_nft_metadata =
        &ctx.accounts.referral_agents_collection_nft_metadata;
    let treasury_mint = &ctx.accounts.treasury_mint;
    let treasury_token_account = &ctx.accounts.treasury_token_account;
    let treasury_authority = &ctx.accounts.treasury_authority;
    let token_program = &ctx.accounts.token_program;

    // make sure the referral agents collection nft metadata belongs to the token metadata program
    assert_owned_by(
        maybe_referral_agents_collection_nft_metadata,
        &mpl_token_metadata::id(),
    )?;

    // make sure the referral agents collection nft metadata is valid
    let collection_metadata = Metadata::from_account_info(
        maybe_referral_agents_collection_nft_metadata
            .to_account_info()
            .borrow(),
    )?;

    // make sure the referral agents collection nft matches what's stored in the referralship
    if collection_metadata.mint.key() != referralship.referral_agents_collection_nft_mint.key() {
        return Err(ReferralError::InvalidReferralAgentMetadata.into());
    }

    // make sure the referral agent nft metadata is owned by the token metadata program
    assert_owned_by(maybe_referral_agent_nft_metadata, &mpl_token_metadata::id())?;

    // make sure the referral agent nft metadata is valid
    let referral_agent_metadata =
        Metadata::from_account_info(maybe_referral_agent_nft_metadata.to_account_info().borrow())?;

    // make sure the referral agent nft metadata is a member of the referral agents collection nft
    match referral_agent_metadata.collection {
        Some(collection) => {
            if collection.key.key() != referral_agents_collection_nft_mint.key() {
                return Err(ReferralError::InvalidReferralAgentMetadata.into());
            }
        }
        None => return Err(ReferralError::InvalidReferralAgentMetadata.into()),
    }

    // make sure the referral agent nft metadata matches the referral agent nft token mint
    if referral_agent_metadata.mint.key() != referral_agent_nft_mint.key() {
        return Err(ReferralError::InvalidReferralAgentMetadata.into());
    }

    // make sure the referral agent nft token account matches the referral agent nft token mint
    if referral_agent_nft_mint.key() != referral_agent_nft_token_account.mint.key() {
        return Err(ReferralError::InvalidReferralAgentNftTokenAccount.into());
    }

    // make sure the referral agent treasury token account matches the treasury token mint
    if referral_agent_treasury_token_account.mint.key() != treasury_mint.key() {
        return Err(ReferralError::InvalidReferralAgentTreasuryTokenAccount.into());
    }

    // make sure the treasury mint matches what's stored in the tier
    if treasury_mint.key() != tier.mint.key() {
        return Err(ReferralError::InvalidTreasuryMint.into());
    }

    // make sure the referral agent treasury token account belongs to the same account as the referral agent nft token account
    if referral_agent_nft_token_account.owner.key()
        != referral_agent_treasury_token_account.owner.key()
    {
        return Err(ReferralError::InvalidReferralAgentTreasuryTokenAccount.into());
    }

    // let hm = referralship.splits.as_hashmap();

    // msg!("hm: {:?}", hm);

    // calculate the referral agent's split amount
    let referral_agent_claim_amount =
        Splits8::calculate_amount(referralship.splits.referral_agent, tier.price);

    // transfer the referral agent's split amount to their treasury token account
    let transfer_accounts = Transfer {
        from: treasury_token_account.to_account_info(),
        to: referral_agent_treasury_token_account.to_account_info(),
        authority: treasury_authority.to_account_info(),
    };

    let transfer_context = CpiContext::new(token_program.to_account_info(), transfer_accounts);
    token::transfer(transfer_context, referral_agent_claim_amount)?;
    // for each split in the referralship's splits:
    //    get the next account from ctx.remaining_accounts
    //    make sure the next account is a token account
    //    make sure the next account's mint matches the treasury mint
    //    calculate their split amount
    //    transfer the split amount to their token account
    //    TODO: emit an event for each split
    //    TODO: create a new SplitReceipt account.

    Ok(())
}
