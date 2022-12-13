"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tier = exports.app = exports.user = void 0;
var creator_actions_1 = require("./creator-actions/creator-actions");
var subscription_queries_1 = require("./queries/subscription-queries");
var tier_queries_1 = require("./queries/tier-queries");
var user_queries_1 = require("./queries/user-queries");
exports.user = {
    create: creator_actions_1.createUser,
    get: user_queries_1.fetch,
};
exports.app = {
    create: creator_actions_1.createApp,
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
};
exports.default = {
    user: exports.user,
    app: exports.app,
    tier: exports.tier,
};
