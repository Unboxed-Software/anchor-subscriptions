use anchor_lang::prelude::*;

#[account]
pub struct UserMeta {
    pub auth: Pubkey,
    pub num_apps: u8,
}
