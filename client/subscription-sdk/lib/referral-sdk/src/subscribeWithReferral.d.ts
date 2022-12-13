import { web3 } from "@project-serum/anchor";
export declare function subscribeWithReferral(subscriber: web3.PublicKey, tier: web3.PublicKey, referralAgentNFTMint: web3.PublicKey): Promise<{
    instruction: web3.TransactionInstruction;
}>;
