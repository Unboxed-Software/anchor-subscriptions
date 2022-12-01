use anchor_lang::prelude::*;

use crate::error::PledgeError;
use crate::state::*;

#[derive(Accounts)]
#[instruction(app_id: u8)]
pub struct CreateApp<'info> {
    #[account(init,
        payer = auth,
        space = 8 + std::mem::size_of::<App>(),
        seeds = ["APP".as_bytes(), auth.key().as_ref(), app_id.to_be_bytes().as_ref()],
        bump
    )]
    pub app: Account<'info, App>,
    #[account(
        mut,
        seeds = ["USER_META".as_bytes(), auth.key().as_ref()],
        bump,
        has_one = auth,
        constraint = app_id == user_meta.num_apps + 1 @ PledgeError::InvalidAppId,
    )]
    pub user_meta: Account<'info, UserMeta>,
    #[account(mut)]
    pub auth: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn create_app(ctx: Context<CreateApp>, _app_id: u8, name: String) -> Result<()> {
    let app = &mut ctx.accounts.app;
    let auth = ctx.accounts.auth.to_account_info().key;
    app.auth = *auth;
    app.name = name;

    ctx.accounts.user_meta.num_apps += 1;

    Ok(())
}
