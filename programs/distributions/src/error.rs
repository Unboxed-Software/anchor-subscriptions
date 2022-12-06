use anchor_lang::error_code;

#[error_code]
pub enum DistributionError {
    InsufficientFunds,
    InvalidMetadata,
    InvalidCollectionDetails,
    ZeroCollectionSize,
    ZeroDistribution,
}
