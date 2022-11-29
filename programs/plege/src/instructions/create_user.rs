use anchor_lang::prelude::*;

use crate::state::*;

#[derive(Accounts)]
pub struct CreateUser<'info> {
    #[account(
        init,
        payer = auth,
        space = 8 + std::mem::size_of::<UserMeta>(),
        seeds = ["USER_META".as_bytes(), auth.key().as_ref()],
        bump,
    )]
    pub user_meta: Account<'info, UserMeta>,
    #[account(mut)]
    pub auth: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn create_user(ctx: Context<CreateUser>) -> Result<()> {
    let user = &mut ctx.accounts.user_meta;
    let auth = ctx.accounts.auth.to_account_info().key;
    user.auth = *auth;
    Ok(())
}
