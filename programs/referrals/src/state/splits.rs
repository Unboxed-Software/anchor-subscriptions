use anchor_lang::prelude::*;

use crate::error::ReferralError;

#[derive(AnchorDeserialize, AnchorSerialize, Clone, Default, Debug)]
pub struct AddressWithWeight {
    address: Pubkey,
    weight: u8,
}

#[derive(AnchorDeserialize, AnchorSerialize, Clone, Default)]
pub struct Splits8 {
    pub referral_agent: u8,
    pub slot_1: Option<AddressWithWeight>,
    pub slot_2: Option<AddressWithWeight>,
    pub slot_3: Option<AddressWithWeight>,
    pub slot_4: Option<AddressWithWeight>,
    pub slot_5: Option<AddressWithWeight>,
    pub slot_6: Option<AddressWithWeight>,
    pub slot_7: Option<AddressWithWeight>,
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
}
