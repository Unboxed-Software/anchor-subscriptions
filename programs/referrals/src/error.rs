use anchor_lang::prelude::*;

#[error_code]
pub enum ReferralError {
    InvalidAppAuthority,
    InvalidTreasuryMint,
    InvalidSubscriberTokenAccount,
    InvalidTier,
    ReferralAgentSplitNotSet,
    TooManySplitsProvided,
    TotalWeightIsNot100,
    InvalidCollection,
    InvalidCollectionMetadata,
    CollectionMetadataMintMismatch,
    InvalidReferralAgentMetadata,
    InvalidReferralAgentNftTokenAccount,
    InvalidReferralAgentTreasuryTokenAccount,
    ReferralAgentNFTMintMismatch,
    InvalidSplitRecipientTreasuryTokenAccount,
    InvalidSplit,
    DuplicateSplit,
    InvalidBump,
}
