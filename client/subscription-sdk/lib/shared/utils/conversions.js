"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertUser = exports.convertApp = exports.convertTier = exports.convertSubscription = void 0;
var interfaces_1 = require("../../subscription-sdk/src/types/interfaces");
function convertSubscription(sub, pubkey) {
    return {
        pubkey: pubkey,
        app: sub.app,
        tier: sub.tier,
        subscriber: sub.subscriber,
        start: new Date(sub.start * 1000),
        payPeriodExpiration: new Date(sub.payPeriodExpiration * 1000),
        payPeriodStart: new Date(sub.payPeriodStart * 1000),
        lastPaymentTime: new Date(sub.lastPaymentTime * 1000),
        bump: sub.bump,
        acceptNewPayments: sub.acceptNewPayments,
        credits: sub.credits,
    };
}
exports.convertSubscription = convertSubscription;
function convertTier(tier, pubkey) {
    return {
        pubkey: pubkey,
        app: tier.app,
        price: tier.price,
        interval: tier.interval,
        acceptingNewSubs: tier.acceptingNewSubs,
        active: tier.acceptingNewSubs,
        name: tier.name,
    };
}
exports.convertTier = convertTier;
function convertApp(app, pubkey) {
    return {
        pubkey: pubkey,
        auth: app.auth,
        numTiers: app.numTiers,
    };
}
exports.convertApp = convertApp;
function convertUser(user, pubkey) {
    return {
        pubkey: pubkey,
        auth: user.auth,
        numApps: user.numApps,
    };
}
exports.convertUser = convertUser;
function convertInterval(interval) {
    if (interval.month) {
        return interfaces_1.Interval.Monthly;
    }
    else if (interval.year) {
        return interfaces_1.Interval.Yearly;
    }
    else {
        throw "DOESN'T MATCH INTERVAL ENUM";
    }
}
