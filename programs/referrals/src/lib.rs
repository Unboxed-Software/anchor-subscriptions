mod error;
mod instructions;
mod state;

use anchor_lang::prelude::*;
use instructions::*;
use state::Splits8;

declare_id!("DWPZARiryrryvhsmvvkV18pzCafD69ZjpGkhnEGwbSgt");

#[program]
pub mod referrals {
    use super::*;

    pub fn create_referralship(
        ctx: Context<CreateReferralship>,
        splits: Splits8,
        app_id: u8,
    ) -> Result<()> {
        instructions::create_referralship(ctx, splits, app_id)
    }

    pub fn subscribe_with_referral(ctx: Context<SubscribeWithReferral>) -> Result<()> {
        instructions::subscribe_with_referral(ctx)
    }

    pub fn split_payment(ctx: Context<SplitPayment>) -> Result<()> {
        instructions::split_payment(ctx)
    }
}
