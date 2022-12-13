import { web3 } from "@project-serum/anchor";
import { Subscription, Tier, App, User } from "../../subscription-sdk/src/types/interfaces";
export declare function convertSubscription(sub: any, pubkey: web3.PublicKey): Subscription;
export declare function convertTier(tier: any, pubkey: web3.PublicKey): Tier;
export declare function convertApp(app: any, pubkey: web3.PublicKey): App;
export declare function convertUser(user: any, pubkey: web3.PublicKey): User;
