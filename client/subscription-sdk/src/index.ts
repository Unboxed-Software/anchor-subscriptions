import {
  createUser,
  createApp,
  createTier,
  pauseTier,
  disableTier,
  unpauseTier,
} from "./creator-actions/creator-actions"
import { fetchApp } from "./queries/app-queries"
import {
  getActiveSubscriptionCountForApp,
  getActiveSubscriptionCountForTier,
  getActiveSubscriptionsToAppGroupedByTier,
  getAllActiveSubscriptionsToApp,
  getAllActiveSubscriptionsToTier,
} from "./queries/subscription-queries"
import {
  fetchTier,
  getAllTiersForApp,
  getTierCountForApp,
} from "./queries/tier-queries"
import { fetchUser } from "./queries/user-queries"
import { createReferralApp } from "../../referral-sdk/src/createReferralApp"
import { subscribeWithReferral } from "../../referral-sdk/src/subscribeWithReferral"

export const user = {
  create: createUser,
  fetch: fetchUser,
}

export const app = {
  create: createApp,
  createWithReferralship: createReferralApp,
  subscribeWithReferral: subscribeWithReferral,
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
  fetch: fetchApp,
}

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
  fetch: fetchTier,
}

export default {
  user,
  app,
  tier,
}
