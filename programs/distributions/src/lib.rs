mod error;
mod instructions;
mod state;

use error::*;
use instructions::*;
use state::*;

use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod distributions {
    use super::*;

    pub fn create_distribution(ctx: Context<CreateDistribution>) -> Result<()> {
        instructions::create_distribution(ctx)
    }
}
