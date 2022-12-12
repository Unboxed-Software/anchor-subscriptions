use std::{borrow::Borrow, collections::HashSet};

use anchor_lang::{prelude::*, solana_program::program_pack::Pack};
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};
use mpl_token_metadata::{
    assertions::assert_owned_by,
    state::{CollectionDetails, Metadata, TokenMetadataAccount},
};
use plege::{
    program::Plege,
    state::{App, Subscription, Tier},
};

use crate::{
    error::ReferralError,
    state::{
        Referral, Referralship, Splits8, APP, REFERRAL, REFERRALSHIP, SUBSCRIPTION,
        SUBSCRIPTION_TIER, TREASURY,
    },
};

use clockwork_sdk::thread_program::{
    self,
    accounts::{Thread, Trigger},
    ThreadProgram,
};

#[derive(Accounts)]
pub struct SplitPayment<'info> {
    #[account(
        seeds = [APP.as_bytes(), app_authority.key().as_ref(), referralship.app_id.to_be_bytes().as_ref()],
        seeds::program = plege_program.key(),
        bump
    )]
    pub app: Account<'info, App>,
    /// CHECK: only being used for seeds.
    pub app_authority: UncheckedAccount<'info>,
    #[account(
        seeds = [SUBSCRIPTION.as_bytes(), app.key().as_ref(), subscriber.key().as_ref()],
        seeds::program = plege_program.key(),
        bump,
        has_one = tier
    )]
    pub subscription: Box<Account<'info, Subscription>>,
    /// CHECK: Just needs to be a system account.
    pub subscriber: UncheckedAccount<'info>,
    #[account(
        constraint = subscription.tier == tier.key(),
        // seeds = [SUBSCRIPTION_TIER.as_bytes(), app.key().as_ref(), tier_id.to_be_bytes().as_ref()],
        // seeds::program = plege_program.key(),
        // bump
    )]
    pub tier: Box<Account<'info, Tier>>,
    #[account(
        seeds = [
            REFERRAL.as_bytes(),
            app.key().as_ref(),
            subscription.key().as_ref(),
            referral_agent_nft_mint.key().as_ref()
        ],
        bump
    )]
    pub referral: Box<Account<'info, Referral>>,
    #[account(
        seeds = [REFERRALSHIP.as_bytes(), app.key().as_ref()],
        bump
    )]
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
    #[account(
        mut,
        token::mint = treasury_mint,
        token::authority = referralship,
        seeds = [REFERRALSHIP.as_bytes(), app.key().as_ref(), TREASURY.as_bytes(), treasury_mint.key().as_ref()],
        bump
    )]
    pub treasury_token_account: Box<Account<'info, TokenAccount>>,
    pub plege_program: Program<'info, Plege>,
    pub token_program: Program<'info, Token>,
}

pub fn split_payment<'info>(ctx: Context<'_, '_, '_, 'info, SplitPayment<'info>>) -> Result<()> {
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
    if treasury_mint.key() != app.mint.key() {
        return Err(ReferralError::InvalidTreasuryMint.into());
    }

    // make sure the referral agent treasury token account belongs to the same account as the referral agent nft token account
    if referral_agent_nft_token_account.owner.key()
        != referral_agent_treasury_token_account.owner.key()
    {
        return Err(ReferralError::InvalidReferralAgentTreasuryTokenAccount.into());
    }

    // calculate the referral agent's split amount
    let referral_agent_claim_amount =
        Splits8::calculate_amount(referralship.splits.referral_agent, tier.price);

    // let signer_seeds: &[&[&[u8]]] = &[&[
    //     b"canvas".as_ref(),
    //     canvas.creator.as_ref(),
    //     canvas.canvas_model.as_ref(),
    //     canvas.name.as_bytes(),
    //     bump_vector.as_ref(),
    // ]];

    let wrapped_referralship_bump = ctx
        .bumps
        .get("referralship")
        .ok_or(ReferralError::InvalidBump)?
        .to_le_bytes();

    // seeds = [REFERRALSHIP.as_bytes(), app.key().as_ref()],
    let app_key = app.key();
    let referralship_signer_seeds: &[&[&[u8]]] = &[&[
        REFERRALSHIP.as_bytes(),
        app_key.as_ref(),
        wrapped_referralship_bump.as_ref(),
    ]];

    // transfer the referral agent's split amount to their treasury token account

    let transfer_accounts = Transfer {
        from: treasury_token_account.to_account_info(),
        to: referral_agent_treasury_token_account.to_account_info(),
        authority: referralship.to_account_info(),
    };

    let transfer_context = CpiContext::new_with_signer(
        token_program.to_account_info(),
        transfer_accounts,
        referralship_signer_seeds,
    );
    token::transfer(transfer_context, referral_agent_claim_amount)?;

    let splits = referralship.splits.as_hashmap();

    // get the account infos here because we can't get them inside the loop,
    // or our references will be invalidated
    let token_program_account_info = token_program.to_account_info().clone();

    // for each split in the referralship's splits:
    let mut visited = HashSet::new();

    for token_account_info in ctx.remaining_accounts {
        if visited.contains(&token_account_info.key()) {
            return Err(ReferralError::DuplicateSplit.into());
        }

        // make sure it's present in the splits hashmap
        let weight = splits
            .get(&token_account_info.key())
            .ok_or(ReferralError::InvalidSplit)?;

        // make sure it's owned by the token program
        assert_owned_by(token_account_info, &token_program.key())?;

        // make sure it can be deserialized into an token Account
        let token_account =
            token::spl_token::state::Account::unpack(&token_account_info.try_borrow_data()?)?;

        // make sure the next account's mint matches the treasury mint
        if token_account.mint.key() != treasury_mint.key() {
            return Err(ReferralError::InvalidSplitRecipientTreasuryTokenAccount.into());
        }

        // calculate their split amount
        let split_recipient_claim_amount = Splits8::calculate_amount(*weight, tier.price);

        // transfer the split amount to their token account
        let transfer_accounts = Transfer {
            from: treasury_token_account.to_account_info(),
            to: token_account_info.clone(),
            authority: referralship.to_account_info(),
        };
        let transfer_context = CpiContext::new_with_signer(
            token_program_account_info.clone(),
            transfer_accounts,
            referralship_signer_seeds,
        );

        token::transfer(transfer_context, split_recipient_claim_amount)?;
        visited.insert(token_account_info.key());
    }

    Ok(())
}
