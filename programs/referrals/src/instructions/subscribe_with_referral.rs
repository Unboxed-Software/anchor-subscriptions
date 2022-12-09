use anchor_lang::prelude::*;
use plege::state::App;

use crate::state::Referral;

#[derive(Accounts)]
pub struct SubscribeWithReferral<'info> {
    pub app: Account<'info, App>,
    pub referral: Account<'info, Referral>,
    pub subscriber: Signer<'info>,
}

pub fn subscribe_with_referral(ctx: Context<SubscribeWithReferral>) -> Result<()> {
    Ok(())
}
