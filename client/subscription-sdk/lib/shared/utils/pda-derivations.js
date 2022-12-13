"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findSubscriptionAddress = exports.subscriptionThreadKey = exports.subscriptionAccountKey = exports.tierAccountKey = exports.numberToAppId = exports.findAppAddress = exports.appAccountKey = exports.findUserMetaAddress = exports.userAccountKeyFromPubkey = void 0;
var anchor_1 = require("@project-serum/anchor");
var config_1 = require("../../subscription-sdk/src/config/config");
var constants_1 = require("./constants");
var program = (0, config_1.getProgram)();
function userAccountKeyFromPubkey(pubkey) {
    return anchor_1.web3.PublicKey.findProgramAddressSync([Buffer.from("USER_META"), pubkey.toBuffer()], program.programId)[0];
}
exports.userAccountKeyFromPubkey = userAccountKeyFromPubkey;
function findUserMetaAddress(pubkey) {
    return anchor_1.web3.PublicKey.findProgramAddressSync([Buffer.from("USER_META"), pubkey.toBuffer()], program.programId);
}
exports.findUserMetaAddress = findUserMetaAddress;
function appAccountKey(auth, appId) {
    return anchor_1.web3.PublicKey.findProgramAddressSync([
        Buffer.from("APP"),
        auth.toBuffer(),
        new anchor_1.BN(appId).toArrayLike(Buffer, "be", 1),
    ], program.programId)[0];
}
exports.appAccountKey = appAccountKey;
function findAppAddress(auth, appId, programId) {
    return anchor_1.web3.PublicKey.findProgramAddressSync([
        Buffer.from("APP"),
        auth.toBuffer(),
        new anchor_1.BN(appId).toArrayLike(Buffer, "be", 1),
    ], programId);
}
exports.findAppAddress = findAppAddress;
function numberToAppId(appId) {
    return new anchor_1.BN(appId).toArrayLike(Buffer, "be", 1);
}
exports.numberToAppId = numberToAppId;
function tierAccountKey(app, tierId) {
    return anchor_1.web3.PublicKey.findProgramAddressSync([
        Buffer.from("SUBSCRIPTION_TIER"),
        app.toBuffer(),
        new anchor_1.BN(tierId).toArrayLike(Buffer, "be", 1),
    ], program.programId)[0];
}
exports.tierAccountKey = tierAccountKey;
function subscriptionAccountKey(subscriber, app) {
    return anchor_1.web3.PublicKey.findProgramAddressSync([Buffer.from("SUBSCRIPTION"), app.toBuffer(), subscriber.toBuffer()], program.programId);
}
exports.subscriptionAccountKey = subscriptionAccountKey;
function subscriptionThreadKey(subscription) {
    return anchor_1.web3.PublicKey.findProgramAddressSync([
        Buffer.from("thread"),
        subscription.toBuffer(),
        Buffer.from("subscriber_thread"),
    ], constants_1.THREAD_PROGRAM_ID)[0];
}
exports.subscriptionThreadKey = subscriptionThreadKey;
function findSubscriptionAddress(subscriber, app, programId) {
    return anchor_1.web3.PublicKey.findProgramAddressSync([Buffer.from("SUBSCRIPTION"), app.toBuffer(), subscriber.toBuffer()], programId);
}
exports.findSubscriptionAddress = findSubscriptionAddress;
