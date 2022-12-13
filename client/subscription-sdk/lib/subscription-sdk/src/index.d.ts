import { createUser, createApp, createTier, pauseTier, disableTier, unpauseTier } from "./creator-actions/creator-actions";
import { getActiveSubscriptionCountForApp, getActiveSubscriptionCountForTier, getActiveSubscriptionsToAppGroupedByTier, getAllActiveSubscriptionsToApp, getAllActiveSubscriptionsToTier } from "./queries/subscription-queries";
import { getAllTiersForApp, getTierCountForApp } from "./queries/tier-queries";
import { fetch } from "./queries/user-queries";
export declare const user: {
    create: typeof createUser;
    get: typeof fetch;
};
export declare const app: {
    create: typeof createApp;
    get: {
        subscriptions: {
            all: typeof getAllActiveSubscriptionsToApp;
            count: typeof getActiveSubscriptionCountForApp;
            groupedByTier: typeof getActiveSubscriptionsToAppGroupedByTier;
        };
        tiers: {
            all: typeof getAllTiersForApp;
            count: typeof getTierCountForApp;
        };
    };
};
export declare const tier: {
    create: typeof createTier;
    pause: typeof pauseTier;
    unpause: typeof unpauseTier;
    disable: typeof disableTier;
    get: {
        subscriptions: {
            all: typeof getAllActiveSubscriptionsToTier;
            count: typeof getActiveSubscriptionCountForTier;
        };
    };
};
declare const _default: {
    user: {
        create: typeof createUser;
        get: typeof fetch;
    };
    app: {
        create: typeof createApp;
        get: {
            subscriptions: {
                all: typeof getAllActiveSubscriptionsToApp;
                count: typeof getActiveSubscriptionCountForApp;
                groupedByTier: typeof getActiveSubscriptionsToAppGroupedByTier;
            };
            tiers: {
                all: typeof getAllTiersForApp;
                count: typeof getTierCountForApp;
            };
        };
    };
    tier: {
        create: typeof createTier;
        pause: typeof pauseTier;
        unpause: typeof unpauseTier;
        disable: typeof disableTier;
        get: {
            subscriptions: {
                all: typeof getAllActiveSubscriptionsToTier;
                count: typeof getActiveSubscriptionCountForTier;
            };
        };
    };
};
export default _default;
