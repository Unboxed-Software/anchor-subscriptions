mod error;
mod instructions;
mod state;

use instructions::*;

use anchor_lang::prelude::*;

declare_id!("Eh4LJZXujWvWotqd2ENhG2v7ha8DmKnKaDNbnNuUpK27");

#[program]
pub mod distributions {
    use super::*;

    pub fn create_royalty_collected_treasury(
        ctx: Context<CreateRoyaltyCollectedTreasury>,
        royalty_percentage: u8,
    ) -> Result<()> {
        instructions::create_royalty_collected_treasury(ctx, royalty_percentage)
    }

    pub fn create_distribution(
        ctx: Context<CreateDistribution>,
        date: String,
        amount: u64,
    ) -> Result<()> {
        instructions::create_distribution(ctx, date, amount)
    }
}
