"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tier = exports.app = exports.user = void 0;
var creator_actions_1 = require("./creator-actions/creator-actions");
var app_queries_1 = require("./queries/app-queries");
var subscription_queries_1 = require("./queries/subscription-queries");
var tier_queries_1 = require("./queries/tier-queries");
var user_queries_1 = require("./queries/user-queries");
var createReferralApp_1 = require("../../referral-sdk/src/createReferralApp");
var subscribeWithReferral_1 = require("../../referral-sdk/src/subscribeWithReferral");
exports.user = {
    create: creator_actions_1.createUser,
    fetch: user_queries_1.fetchUser,
};
exports.app = {
    create: creator_actions_1.createApp,
    createWithReferralship: createReferralApp_1.createReferralApp,
    subscribeWithReferral: subscribeWithReferral_1.subscribeWithReferral,
    get: {
        subscriptions: {
            all: subscription_queries_1.getAllActiveSubscriptionsToApp,
            count: subscription_queries_1.getActiveSubscriptionCountForApp,
            groupedByTier: subscription_queries_1.getActiveSubscriptionsToAppGroupedByTier,
        },
        tiers: {
            all: tier_queries_1.getAllTiersForApp,
            count: tier_queries_1.getTierCountForApp,
        },
    },
    fetch: app_queries_1.fetchApp,
};
exports.tier = {
    create: creator_actions_1.createTier,
    pause: creator_actions_1.pauseTier,
    unpause: creator_actions_1.unpauseTier,
    disable: creator_actions_1.disableTier,
    get: {
        subscriptions: {
            all: subscription_queries_1.getAllActiveSubscriptionsToTier,
            count: subscription_queries_1.getActiveSubscriptionCountForTier,
        },
    },
    fetch: tier_queries_1.fetchTier,
};
exports.default = {
    user: exports.user,
    app: exports.app,
    tier: exports.tier,
};
