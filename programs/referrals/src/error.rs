use anchor_lang::prelude::*;

#[error_code]
pub enum ReferralError {
    InvalidAppAuthority,
    InvalidTreasuryMint,
    ReferralAgentSplitNotSet,
    TooManySplitsProvided,
    TotalWeightIsNot100,
    InvalidCollection,
    InvalidCollectionMetadata,
    CollectionMetadataMintMismatch,
    InvalidReferralAgentMetadata,
    ReferralAgentNFTMintMismatch,
    InvalidSubscriberTokenAccount,
    InvalidTier,
}
