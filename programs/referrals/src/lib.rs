mod assertions;
mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;
use instructions::*;
use state::*;

declare_id!("AyiEeNNyt46iRMeN1kNUfBjdu9GdsDxuH7zAg9CgyLRC");

#[program]
pub mod referrals {
    use super::*;

    pub fn create_referralship(
        ctx: Context<CreateReferralship>,
        app_id: u8,
        referral_agent_split: u8,
        splits: Vec<PubkeyWithWeight>,
    ) -> Result<()> {
        instructions::create_referralship(ctx, app_id, referral_agent_split, splits)
    }

    pub fn subscribe_with_referral(ctx: Context<SubscribeWithReferral>) -> Result<()> {
        instructions::subscribe_with_referral(ctx)
    }

    pub fn split_payment<'info>(
        ctx: Context<'_, '_, '_, 'info, SplitPayment<'info>>,
    ) -> Result<()> {
        instructions::split_payment(ctx)
    }
}
