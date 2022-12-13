import { createUser, createApp, createTier, pauseTier, disableTier, unpauseTier } from "./creator-actions/creator-actions";
import { fetchApp } from "./queries/app-queries";
import { getActiveSubscriptionCountForApp, getActiveSubscriptionCountForTier, getActiveSubscriptionsToAppGroupedByTier, getAllActiveSubscriptionsToApp, getAllActiveSubscriptionsToTier } from "./queries/subscription-queries";
import { fetchTier, getAllTiersForApp, getTierCountForApp } from "./queries/tier-queries";
import { fetchUser } from "./queries/user-queries";
import { createReferralApp } from "../../referral-sdk/src/createReferralApp";
import { subscribeWithReferral } from "../../referral-sdk/src/subscribeWithReferral";
export declare const user: {
    create: typeof createUser;
    fetch: typeof fetchUser;
};
export declare const app: {
    create: typeof createApp;
    createWithReferralship: typeof createReferralApp;
    subscribeWithReferral: typeof subscribeWithReferral;
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
    fetch: typeof fetchApp;
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
    fetch: typeof fetchTier;
};
declare const _default: {
    user: {
        create: typeof createUser;
        fetch: typeof fetchUser;
    };
    app: {
        create: typeof createApp;
        createWithReferralship: typeof createReferralApp;
        subscribeWithReferral: typeof subscribeWithReferral;
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
        fetch: typeof fetchApp;
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
        fetch: typeof fetchTier;
    };
};
export default _default;
