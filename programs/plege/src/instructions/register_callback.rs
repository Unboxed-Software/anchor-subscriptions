use crate::error::PlegeError;
use crate::state::*;
use anchor_lang::{
    prelude::*,
    solana_program::program::invoke
};

#[derive(Accounts)]
#[instruction(app_id: u8)]
pub struct RegisterCallback<'info> {
    #[account(
        mut,
        seeds = ["APP".as_bytes(), auth.key().as_ref(), app_id.to_be_bytes().as_ref()],
        bump
    )]
    pub app: Account<'info, App>,
    #[account(
        seeds = ["USER_META".as_bytes(), auth.key().as_ref()],
        bump,
        has_one = auth,
        constraint = app_id == user_meta.num_apps @ PlegeError::InvalidAppId,
    )]
    pub user_meta: Account<'info, UserMeta>,
    #[account(mut)]
    pub auth: Signer<'info>
}

pub fn register_callback(ctx: Context<RegisterCallback>, _app_id: u8, callback: Callback) -> Result<()> {
    let app = &mut ctx.accounts.app;

    msg!("Registering Callback...");
    app.callback = Some(callback);

    msg!("Callback struct: {:?}", app.callback);

    Ok(())
}