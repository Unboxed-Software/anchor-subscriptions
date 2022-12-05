# Distributions

## Royalty Collected Treasury Account
Royalty Collected Treasury Accounts will control an associated token account and hold general inflows of spl-token for a given token mint. This account will be responsible for splitting the inflows of tokens into a treasury account from which profits will be withdrawn, and into a royalty escrow account that will accumulate token to be distributed to NFT owners.

## Distribution
Distribution accounts will hold token for a given distribution instance and keep track of which NFTs have received a distribution. Royalty payments (distributions) from the distribution account will be tracked with a zero-byte PDA of the distribution address and the NFT mint address.