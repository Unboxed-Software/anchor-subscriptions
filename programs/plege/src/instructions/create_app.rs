use anchor_lang::prelude::*;

#[account]
pub struct App {
    pub owner: Pubkey,
}

#[derive(Accounts)]
pub struct CreateApp<'info> {
    #[account(init,
        payer = signer,
        space = 8 + 32,
        seeds = [b"app".as_ref(), signer.key().as_ref()],
        bump,
    )]
    pub app: Account<'info, App>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn create_app(ctx: Context<CreateApp>) -> Result<()> {
    let app = &mut ctx.accounts.app;
    let owner = ctx.accounts.signer.to_account_info().key;
    app.owner = *owner;
    Ok(())
}
