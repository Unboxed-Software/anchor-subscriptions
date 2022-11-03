use anchor_lang::prelude::*;
// use anchor_spl::associated_token::{
//     get_associated_token_address,
// };

pub mod instructions;
use instructions::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod plege {
    use super::*;

    pub fn create_app(ctx: Context<CreateApp>) -> Result<()> {
        instructions::create_app(ctx)
    }

    pub fn create_tier(ctx: Context<CreateTier>, price: u64, interval: i64) -> Result<()> {
        instructions::create_tier(ctx, price, interval)
    }

    pub fn subscribe(ctx: Context<Subscribe>, duration: u64) -> Result<()> {
        instructions::subscribe(ctx, duration)
    }

    pub fn resubscribe(ctx: Context<Resubscribe>) -> Result<()> {
        instructions::resubscribe(ctx)
    }
}
