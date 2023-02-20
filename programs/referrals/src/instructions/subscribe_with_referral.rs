use std::borrow::Borrow;

use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};
use mpl_token_metadata::{
    assertions::assert_owned_by,
    state::{Metadata, TokenMetadataAccount},
};

use plege::{
    cpi::accounts::CreateSubscription,
    program::Plege,
    state::{App, Subscription, Tier},
};

use clockwork_sdk::thread_program::{
        self,
        accounts::{Thread, Trigger},
        ThreadProgram,
    };

use crate::{
    error::ReferralError,
    state::{Referral, Referralship, REFERRAL, APP, REFERRALSHIP, SUBSCRIPTION_TIER, TREASURY},
};

#[derive(Accounts)]
pub struct SubscribeWithReferral<'info> {
    #[account(
        init,
        payer = subscriber,
        space = 8 + 32 + 32 + 32, 
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
    /// CHECK: we will manually deserialize and check this account
    pub referral_agent_nft_metadata: UncheckedAccount<'info>,
    pub referralship_collection_nft_mint: Box<Account<'info, Mint>>,
    /// CHECK: we will manually deserialize and check this account
    pub referral_agents_collection_nft_metadata: UncheckedAccount<'info>,
    pub treasury_mint: Box<Account<'info, Mint>>,
    #[account(
        seeds = [APP.as_bytes(), app_authority.key().as_ref(), referralship.app_id.to_be_bytes().as_ref()],
        seeds::program = plege_program.key(),
        bump,
    )]
    pub app: Account<'info, App>,
    /// CHECK: this account is uninitialized, and is initialized by the subscription program.
    #[account(
        mut,
        seeds = ["SUBSCRIPTION".as_bytes(), app.key().as_ref(), subscriber.key().as_ref()],
        seeds::program = plege_program.key(),
        bump
    )]
    pub subscription: UncheckedAccount<'info>,
    // The subscriber needs to sign because they need to delegate tokens to the subscription program.
    #[account(mut)]
    pub subscriber: Signer<'info>,
    #[account(mut)]
    pub subscriber_token_account: Box<Account<'info, TokenAccount>>,
    #[account(
        has_one = app
    )]
    pub tier: Box<Account<'info, Tier>>,
    /// CHECK: not being used, only for seeds
    pub app_authority: UncheckedAccount<'info>,
    pub plege_program: Program<'info, Plege>,
    /// CHECK: checked via PDA derivation
    #[account(mut, address = Thread::pubkey(subscription.key(),"subscriber_thread".to_string()))]
    pub subscription_thread: UncheckedAccount<'info>,
    #[account(address = thread_program::ID)]
    pub thread_program: Program<'info, ThreadProgram>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn subscribe_with_referral(ctx: Context<SubscribeWithReferral>) -> Result<()> {
    let referral = &mut ctx.accounts.referral;
    let referralship = &ctx.accounts.referralship;
    let referral_agent_nft_mint = &ctx.accounts.referral_agent_nft_mint;
    let maybe_referral_agent_nft_metadata = &ctx.accounts.referral_agent_nft_metadata;
    let maybe_referral_agents_collection_nft_metadata =
        &ctx.accounts.referral_agents_collection_nft_metadata;
    let treasury_mint = &ctx.accounts.treasury_mint;
    let subscriber_token_account = &ctx.accounts.subscriber_token_account;
    let subscriber = &ctx.accounts.subscriber;
    let subscription = &ctx.accounts.subscription;
    let app = &ctx.accounts.app;
    let tier = &ctx.accounts.tier;
    let plege_program = &ctx.accounts.plege_program;
    let token_program = &ctx.accounts.token_program;
    let system_program = &ctx.accounts.system_program;
    let subscription_thread = ctx.accounts.subscription_thread.to_account_info();
    let thread_program = ctx.accounts.thread_program.to_account_info();

    // make sure the treasury mint matches what's stored in the referralship.
    if treasury_mint.key() != referralship.treasury_mint.key() {
        return Err(ReferralError::InvalidTreasuryMint.into());
    }

    // make sure the collection NFT metadata is owned by the token metadata program.
    assert_owned_by(
        maybe_referral_agents_collection_nft_metadata,
        &mpl_token_metadata::id(),
    )?;

    // make sure the referral agent's NFT metadata is owned by the token metadata program.
    assert_owned_by(maybe_referral_agent_nft_metadata, &mpl_token_metadata::id())?;

    // make sure the we can deserialize the metadata.
    let collection_metadata = Metadata::from_account_info(
        maybe_referral_agents_collection_nft_metadata
            .to_account_info()
            .borrow(),
    )?;

    // make sure the referralship_collection_nft_mint matches what's stored in the referral.
    if referralship.referral_agents_collection_nft_mint.key() != collection_metadata.mint.key() {
        return Err(ReferralError::InvalidCollectionMetadata.into());
    }

    // make sure the referral agent's NFT metadata can be deserialized.
    let referral_agent_metadata =
        Metadata::from_account_info(maybe_referral_agent_nft_metadata.to_account_info().borrow())?;

    // make sure the referral agent's NFT mint matches the specified mint.
    if referral_agent_metadata.mint.key() != referral_agent_nft_mint.key() {
        return Err(ReferralError::InvalidReferralAgentMetadata.into());
    }

    // make sure the referrer's nft is a member of the collection.
    match referral_agent_metadata.collection {
        Some(collection) => {
            if collection.key != referralship.referral_agents_collection_nft_mint.key()
                || !collection.verified
            {
                return Err(ReferralError::InvalidCollection.into());
            }
        }
        None => {
            return Err(ReferralError::InvalidCollection.into());
        }
    }

    // make sure the subscriber's token account belongs to the treasury mint.
    if subscriber_token_account.mint.key() != treasury_mint.key() {
        return Err(ReferralError::InvalidSubscriberTokenAccount.into());
    }

    // make sure the subscriber's token account belongs to the subscriber.
    if subscriber_token_account.owner.key() != subscriber.key() {
        return Err(ReferralError::InvalidSubscriberTokenAccount.into());
    }

    // make sure the tier belongs to the app.
    if tier.app.key() != app.key() {
        return Err(ReferralError::InvalidTier.into());
    }

    // call the subscription program to create a subscription.
    let create_subscription_accounts = CreateSubscription {
        app: app.to_account_info(),
        tier: tier.to_account_info(),
        subscription: subscription.to_account_info(),
        subscriber: subscriber.to_account_info(),
        subscriber_ata: subscriber_token_account.to_account_info(),
        subscription_thread: subscription_thread.to_account_info(),
        thread_program: thread_program.to_account_info(),
        token_program: token_program.to_account_info(),
        system_program: system_program.to_account_info(),
    };

    let create_subscription_context = CpiContext::new(
        plege_program.to_account_info(),
        create_subscription_accounts,
    );

    msg!("Calling plege program");
    plege::cpi::create_subscription(create_subscription_context)?;

    // CPI to add callback
    // plege::cpi::add_subscription_callback()

    // set the referral account state
    referral.app = app.key();
    referral.referral_agent_nft_mint = referral_agent_nft_mint.key();
    referral.subscription = subscription.key();

    Ok(())
}
