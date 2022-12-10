use std::collections::{HashMap, HashSet};

use anchor_lang::prelude::*;

use crate::error::ReferralError;

#[derive(AnchorDeserialize, AnchorSerialize, Clone, Default, Debug)]
pub struct PubkeyWithWeight {
    pub address: Pubkey,
    pub weight: u8,
}

#[derive(AnchorDeserialize, AnchorSerialize, Clone, Default)]
pub struct Splits8 {
    pub referral_agent: u8,
    pub slot_1: Option<PubkeyWithWeight>,
    pub slot_2: Option<PubkeyWithWeight>,
    pub slot_3: Option<PubkeyWithWeight>,
    pub slot_4: Option<PubkeyWithWeight>,
    pub slot_5: Option<PubkeyWithWeight>,
    pub slot_6: Option<PubkeyWithWeight>,
    pub slot_7: Option<PubkeyWithWeight>,
}

impl Splits8 {
    pub fn validate_weights(&self) -> Result<()> {
        let total_weight = self.referral_agent
            + self.slot_1.as_ref().map(|a| a.weight).unwrap_or(0)
            + self.slot_2.as_ref().map(|a| a.weight).unwrap_or(0)
            + self.slot_3.as_ref().map(|a| a.weight).unwrap_or(0)
            + self.slot_4.as_ref().map(|a| a.weight).unwrap_or(0)
            + self.slot_5.as_ref().map(|a| a.weight).unwrap_or(0)
            + self.slot_6.as_ref().map(|a| a.weight).unwrap_or(0)
            + self.slot_7.as_ref().map(|a| a.weight).unwrap_or(0);

        if total_weight != 100 {
            return Err(ReferralError::TotalWeightIsNot100.into());
        }

        Ok(())
    }

    pub fn as_hashmap(&self) -> HashMap<Pubkey, u8> {
        self.into()
    }

    pub fn calculate_amount(weight: u8, amount: u64) -> u64 {
        amount * weight as u64 / 100
    }
}

impl From<&Splits8> for HashMap<Pubkey, u8> {
    fn from(splits: &Splits8) -> Self {
        let all_splits = vec![
            splits.slot_1.as_ref(),
            splits.slot_2.as_ref(),
            splits.slot_3.as_ref(),
            splits.slot_4.as_ref(),
            splits.slot_5.as_ref(),
            splits.slot_6.as_ref(),
            splits.slot_7.as_ref(),
        ];

        let mut tmp = HashMap::new();

        for split in all_splits.into_iter().flatten() {
            tmp.insert(split.address, split.weight);
        }

        tmp
    }
}
