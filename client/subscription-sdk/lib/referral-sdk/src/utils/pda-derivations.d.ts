import { web3 } from "@project-serum/anchor";
export declare function findReferralshipAddress(app: web3.PublicKey, programId: web3.PublicKey): [web3.PublicKey, number];
export declare function findReferralshipTreasuryAccountAddress(app: web3.PublicKey, treasuryMint: web3.PublicKey, programId: web3.PublicKey): [web3.PublicKey, number];
export declare function findReferralAddress(app: web3.PublicKey, subscription: web3.PublicKey, referralAgentNFTMint: web3.PublicKey, programId: web3.PublicKey): [web3.PublicKey, number];
