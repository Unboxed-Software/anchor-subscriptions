use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};
use plege::state::App;

declare_id!("DWPZARiryrryvhsmvvkV18pzCafD69ZjpGkhnEGwbSgt");

const REFERRAL_AGENT: &str = "referral_agent";

#[program]
pub mod referrals {
    use super::*;

    pub fn create_referralship(ctx: Context<CreateReferralship>) -> Result<()> {
        Ok(())
    }

    pub fn subscribe_with_referral(ctx: Context<SubscribeWithReferral>) -> Result<()> {
        Ok(())
    }

    pub fn split_payment(ctx: Context<SplitPayment>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateReferralship<'info> {
    pub referralship: Account<'info, Referralship>,
    pub app: Account<'info, App>,
    pub referral_agents_collection_nft_mint: Account<'info, Mint>,
    pub referral_agents_collection_nft_metadata: UncheckedAccount<'info>,
    pub app_authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SubscribeWithReferral<'info> {
    pub subscriber: AccountInfo<'info>,
    pub referral: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct SplitPayment<'info> {
    pub referralship: Account<'info, Referralship>,
    pub referral_agent: AccountInfo<'info>,
    pub referral_agents_collection_nft_mint: Account<'info, TokenAccount>,
    /// CHECK: This account will be manually deserialized and checked.
    pub referral_agents_collection_nft_metadata: UncheckedAccount<'info>,
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct Referralship {
    pub app: Pubkey,
    pub referral_agents_collection_nft_mint: Pubkey,
    pub splits: Splits8,
}

#[derive(AnchorDeserialize, AnchorSerialize, Clone, Default)]
pub struct AddressWithWeight {
    address: Pubkey,
    weight: u8,
}

#[derive(AnchorDeserialize, AnchorSerialize, Clone)]
pub struct Splits8 {
    pub referral_agent: u8,
    pub slot_1: Option<AddressWithWeight>,
    pub slot_2: Option<AddressWithWeight>,
    pub slot_3: Option<AddressWithWeight>,
    pub slot_4: Option<AddressWithWeight>,
    pub slot_5: Option<AddressWithWeight>,
    pub slot_6: Option<AddressWithWeight>,
    pub slot_7: Option<AddressWithWeight>,
}

impl Splits8 {
    pub fn validate_weights(&self) -> Result<()> {
        let total_weight = self.referral_agent
            + self.slot_1.as_ref().map(|a| a.weight).unwrap_or(0)
            + self.slot_2.as_ref().map(|a| a.weight).unwrap_or(0)
            + self.slot_3.as_ref().map(|a| a.weight).unwrap_or(0)
            + self.slot_4.as_ref().map(|a| a.weight).unwrap_or(0)
            + self.slot_5.as_ref().map(|a| a.weight).unwrap_or(0)
            + self.slot_6.as_ref().map(|a| a.weight).unwrap_or(0)
            + self.slot_7.as_ref().map(|a| a.weight).unwrap_or(0);

        if total_weight != 100 {
            return Err(ReferralError::TotalWeightIsNot100.into());
        }

        Ok(())
    }
}

#[error_code]
pub enum ReferralError {
    ReferralAgentSplitNotSet,
    TotalWeightIsNot100,
}
