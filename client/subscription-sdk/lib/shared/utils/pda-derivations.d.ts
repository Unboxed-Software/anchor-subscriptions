/// <reference types="node" />
import { web3 } from "@project-serum/anchor";
export declare function userAccountKeyFromPubkey(pubkey: web3.PublicKey): web3.PublicKey;
export declare function findUserMetaAddress(pubkey: web3.PublicKey): [web3.PublicKey, number];
export declare function appAccountKey(auth: web3.PublicKey, appId: number): web3.PublicKey;
export declare function findAppAddress(auth: web3.PublicKey, appId: number, programId: web3.PublicKey): [web3.PublicKey, number];
export declare function numberToAppId(appId: number): Buffer;
export declare function tierAccountKey(app: web3.PublicKey, tierId: number): web3.PublicKey;
export declare function subscriptionAccountKey(subscriber: web3.PublicKey, app: web3.PublicKey): [web3.PublicKey, number];
export declare function subscriptionThreadKey(subscription: web3.PublicKey): web3.PublicKey;
export declare function findSubscriptionAddress(subscriber: web3.PublicKey, app: web3.PublicKey, programId: web3.PublicKey): [web3.PublicKey, number];
