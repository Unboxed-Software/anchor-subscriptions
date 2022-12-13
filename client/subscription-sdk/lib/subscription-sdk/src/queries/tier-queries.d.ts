import { web3 } from "@project-serum/anchor";
export declare function getAllTiersForApp(app: web3.PublicKey): Promise<import("../types/interfaces").Tier[]>;
export declare function getTierCountForApp(app: web3.PublicKey): Promise<number>;
export declare function fetchTier(tier: web3.PublicKey): Promise<import("../types/interfaces").Tier>;
