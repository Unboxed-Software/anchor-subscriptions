"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findReferralAddress = exports.findReferralshipTreasuryAccountAddress = exports.findReferralshipAddress = void 0;
var anchor_1 = require("@project-serum/anchor");
function findReferralshipAddress(app, programId) {
    return anchor_1.web3.PublicKey.findProgramAddressSync([Buffer.from("REFERRALSHIP"), app.toBuffer()], programId);
}
exports.findReferralshipAddress = findReferralshipAddress;
function findReferralshipTreasuryAccountAddress(app, treasuryMint, programId) {
    return anchor_1.web3.PublicKey.findProgramAddressSync([
        Buffer.from("REFERRALSHIP"),
        app.toBuffer(),
        Buffer.from("TREASURY"),
        treasuryMint.toBuffer(),
    ], programId);
}
exports.findReferralshipTreasuryAccountAddress = findReferralshipTreasuryAccountAddress;
function findReferralAddress(app, subscription, referralAgentNFTMint, programId) {
    return anchor_1.web3.PublicKey.findProgramAddressSync([
        Buffer.from("REFERRAL"),
        app.toBuffer(),
        subscription.toBuffer(),
        referralAgentNFTMint.toBuffer(),
    ], programId);
}
exports.findReferralAddress = findReferralAddress;
