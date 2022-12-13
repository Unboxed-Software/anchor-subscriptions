import { web3 } from "@project-serum/anchor";
export declare function subscribeToTier(subscriber: web3.PublicKey, subscriberAta: web3.PublicKey, app: web3.PublicKey, tier: web3.PublicKey, appTreasury: web3.PublicKey): Promise<{
    instructions: web3.TransactionInstruction[];
    subscription: web3.PublicKey;
    subscriptionBump: number;
}>;
export declare function cancelSubscription(app: web3.PublicKey, tier: web3.PublicKey, subscriber: web3.PublicKey, subscriberAta: web3.PublicKey): Promise<{
    instruction: web3.TransactionInstruction;
}>;
export declare function closeSubscriptionAccount(app: web3.PublicKey, subscriber: web3.PublicKey): Promise<{
    instruction: web3.TransactionInstruction;
}>;
export declare function switchSubscriptionTier(oldTier: web3.PublicKey, newTier: web3.PublicKey, app: web3.PublicKey, subscriber: web3.PublicKey, subscriberAta: web3.PublicKey): Promise<{
    instruction: web3.TransactionInstruction;
}>;
