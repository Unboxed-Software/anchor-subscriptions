use anchor_lang::prelude::*;

#[error_code]
pub enum ReferralError {
    ReferralAgentSplitNotSet,
    TotalWeightIsNot100,
    InvalidAppAuthority,
    TooManySplitsProvided,
    InvalidCollectionMetadata,
    CollectionMetadataMintMismatch,
}
