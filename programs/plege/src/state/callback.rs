use anchor_lang::{
    prelude::*,
    solana_program::{
        instruction::{AccountMeta, Instruction},
        pubkey::Pubkey,
    },
};

// define callback struct
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct Callback {
    pub program_id: Pubkey,
    pub additional_accounts: Vec<bool>,
    //pub ix_data: Vec<u8>,
    pub ix_data: Option<u8>,
    // only for Anchor programs
    pub ix_name: Option<String>,
}

#[zero_copy]
#[repr(packed)]
#[derive(AnchorSerialize, AnchorDeserialize, Debug)]
pub struct AccountMetaBorsh {
    pub pubkey: Pubkey,
    pub is_signer: bool,
    pub is_writable: bool,
}

#[zero_copy]
#[repr(packed)]
#[derive(AnchorSerialize, AnchorDeserialize, Debug)]
pub struct DynamicAccountMetaBorsh {
    pub is_signer: bool,
    pub is_writable: bool,
}

pub static DEFAULT_CALLBACK_SIZE: usize = 32 + 34 * 13 + 2 + 10;

impl Callback {
    pub fn construct_callback(&self, dynamic_accounts: Option<Vec<AccountMeta>>) -> Instruction {
        let mut accounts_meta_vec = vec![];
        accounts_meta_vec =
            self.add_account_meta_borsh_vec(accounts_meta_vec, &self.static_accounts);

        if let Some(dynamic_accounts) = dynamic_accounts {
            accounts_meta_vec = self.add_dynamic_account_meta(accounts_meta_vec, &dynamic_accounts);
        }

        let mut ix_data: Vec<u8> = vec![];
        // ix data to target the intended program instruction
        if let Some(callback_ix_name) = &self.ix_name {
            ix_data = self.anchor_sighash(&callback_ix_name).into();
        }
        if let Some(callback_ix_data) = &self.ix_data {
            ix_data.push(*callback_ix_data);
        }

        Instruction {
            program_id: self.program_id,
            data: ix_data,
            accounts: accounts_meta_vec,
        }
    }

    pub fn create_dynamic_account_meta(&self, dynamic_pubkeys: Vec<Pubkey>) {
        let pubkey_iter = dynamic_pubkeys.iter();
    }

    /// The sighash of a named instruction in an Anchor program.
    pub fn anchor_sighash(&self, name: &str) -> [u8; 8] {
        let namespace = "global";
        let preimage = format!("{}:{}", namespace, name);
        let mut sighash = [0u8; 8];
        sighash.copy_from_slice(
            &anchor_lang::solana_program::hash::hash(preimage.as_bytes()).to_bytes()[..8],
        );
        sighash
    }

    pub fn add_account_meta_borsh_vec(
        &self,
        mut accounts_meta_vec: Vec<AccountMeta>,
        accounts_meta_borsh: &Vec<AccountMetaBorsh>,
    ) -> Vec<AccountMeta> {
        for account in accounts_meta_borsh {
            if account.is_writable {
                accounts_meta_vec.push(AccountMeta::new(account.pubkey, account.is_signer));
            } else {
                accounts_meta_vec
                    .push(AccountMeta::new_readonly(account.pubkey, account.is_signer));
            }
        }

        accounts_meta_vec
    }

    pub fn add_dynamic_account_meta(
        &self,
        mut accounts_meta_vec: Vec<AccountMeta>,
        dynamic_accounts: &Vec<AccountMeta>,
    ) -> Vec<AccountMeta> {
        for account in dynamic_accounts {
            accounts_meta_vec.push(account.clone())
        }

        accounts_meta_vec
    }

    pub fn callback_size(&self) -> usize {
        let accounts_meta_size: usize = 34 * self.accounts.len();
        //let ix_data_len: usize = self.ix_data.unwrap().len();
        let ix_name_size: usize = self.ix_name.as_ref().unwrap().len();

        32 + accounts_meta_size + 2 + 1 + ix_name_size
    }
}
