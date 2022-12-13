import { web3 } from "@project-serum/anchor";
export declare function createUser(auth: web3.PublicKey): Promise<{
    instruction: web3.TransactionInstruction;
}>;
export declare function createApp(name: string, auth: web3.PublicKey, mint: web3.PublicKey, treasury: web3.PublicKey, appId?: number): Promise<{
    instruction: web3.TransactionInstruction;
    app: web3.PublicKey;
}>;
export declare function createTier(name: string, app: web3.PublicKey, price: number, interval: Interval, auth: web3.PublicKey, tierId?: number): Promise<{
    instruction: web3.TransactionInstruction;
    tier: web3.PublicKey;
}>;
export declare function pauseTier(app: web3.PublicKey, tier: web3.PublicKey, auth: web3.PublicKey): Promise<{
    instruction: web3.TransactionInstruction;
}>;
export declare function unpauseTier(app: web3.PublicKey, tier: web3.PublicKey, auth: web3.PublicKey): Promise<{
    instruction: web3.TransactionInstruction;
}>;
export declare function disableTier(app: web3.PublicKey, tier: web3.PublicKey, auth: web3.PublicKey): Promise<{
    instruction: web3.TransactionInstruction;
}>;
export declare enum Interval {
    Monthly = 0,
    Yearly = 1
}
