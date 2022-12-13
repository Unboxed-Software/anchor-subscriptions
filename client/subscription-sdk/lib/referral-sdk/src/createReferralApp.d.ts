import { web3 } from "@project-serum/anchor";
export declare function createReferralApp(name: string, auth: web3.PublicKey, appId: number, treasuryMint: web3.PublicKey, referralPercent: number, additionalSplits: {
    address: web3.PublicKey;
    weight: number;
}[], referralCollectionNFTMint: web3.PublicKey): Promise<{
    instructions: any[];
    app: any;
}>;
