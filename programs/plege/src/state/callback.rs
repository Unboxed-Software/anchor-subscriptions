use anchor_lang::{
    prelude::*,
    solana_program::{
        instruction::{AccountMeta, Instruction},
        pubkey::Pubkey
    }
};

// define callback struct
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct Callback {
    pub program_id: Pubkey,
    pub accounts: Vec<AccountMetaBorsh>,
    //pub ix_data: Vec<u8>,
    pub ix_data: Option<u8>,
    // only for Anchor programs
    pub ix_name: Option<String>
}

#[zero_copy]
#[repr(packed)]
#[derive(AnchorSerialize, AnchorDeserialize, Debug)]
pub struct AccountMetaBorsh {
    pub pubkey: Pubkey,
    pub is_signer: bool,
    pub is_writable: bool,
}

impl Callback {
    pub fn construct_callback(&self, payer: Pubkey) -> Instruction {
        let mut accounts_meta_vec = vec![AccountMeta::new(payer, true)];
        for account in &self.accounts {
            if account.is_writable {
                accounts_meta_vec.push(AccountMeta::new(account.pubkey, account.is_signer));
            } else {
                accounts_meta_vec.push(AccountMeta::new_readonly(account.pubkey, account.is_signer));
            }
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
            accounts: accounts_meta_vec
        }
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
}