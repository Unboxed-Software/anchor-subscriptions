use std::collections::HashSet;

use anchor_lang::prelude::*;

use crate::{error::ReferralError, state::PubkeyWithWeight};

pub fn assert_unique_split(
    split: Option<PubkeyWithWeight>,
    visited: &mut HashSet<Pubkey>,
) -> Result<Option<PubkeyWithWeight>> {
    if let Some(PubkeyWithWeight { address, .. }) = split {
        if visited.contains(&address) {
            return Err(ReferralError::DuplicateSplit.into());
        }

        visited.insert(address);
    }

    Ok(split)
}
