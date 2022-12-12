import {
  createUser,
  createApp,
  createTier,
  pauseTier,
  disableTier,
  unpauseTier,
} from "./creator-actions/creator-actions";
import {
  getActiveSubscriptionCountForApp,
  getActiveSubscriptionCountForTier,
  getActiveSubscriptionsToAppGroupedByTier,
  getAllActiveSubscriptionsToApp,
  getAllActiveSubscriptionsToTier,
} from "./queries/subscription-queries";
import {
  getAllTiersForApp,
  getTierCountForApp,
} from "./queries/tier-queries";

export const user = {
  create: createUser,
};

export const app = {
  create: createApp,
  get: {
    subscriptions: {
      all: getAllActiveSubscriptionsToApp,
      count: getActiveSubscriptionCountForApp,
      groupedByTier: getActiveSubscriptionsToAppGroupedByTier,
    },
    tiers: {
      all: getAllTiersForApp,
      count: getTierCountForApp,
    },
  },
};

export const tier = {
  create: createTier,
  pause: pauseTier,
  unpause: unpauseTier,
  disable: disableTier,
  get: {
    subscriptions: {
      all: getAllActiveSubscriptionsToTier,
      count: getActiveSubscriptionCountForTier,
    },
  },
};

export default {
  user,
  app,
  tier,
};
