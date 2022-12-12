import { web3 } from "@project-serum/anchor"
import { getProgram } from "../config/config"
import { subscriptionAccountKey } from "../utils/pda-derivations"
import { convertSubscription } from "../utils/conversions"

const program = getProgram()

export async function getAllSubscriptionsToApp(app: web3.PublicKey) {
  const subscriptions = await program.account.subscription.all([
    { memcmp: { offset: 8, bytes: app.toBase58() } },
  ])

  return subscriptions.map((s) => convertSubscription(s.account, s.publicKey))
}

export async function getAllActiveSubscriptionsToApp(app: web3.PublicKey) {
  let subscriptions = await getAllSubscriptionsToApp(app)

  const now = new Date().getTime()
  subscriptions = subscriptions.filter((sub) => {
    return sub.payPeriodExpiration.getTime() > now
  })

  return subscriptions
}

export async function getAllSubscriptionsToTier(tier: web3.PublicKey) {
  const subscriptions = await program.account.subscription.all([
    { memcmp: { offset: 40, bytes: tier.toBase58() } },
  ])

  return subscriptions.map((s) => convertSubscription(s.account, s.publicKey))
}

export async function getAllActiveSubscriptionsToTier(tier: web3.PublicKey) {
  let subscriptions = await getAllSubscriptionsToTier(tier)

  let now = new Date().getTime()
  subscriptions = subscriptions.filter((sub) => {
    return sub.payPeriodExpiration.getTime() > now
  })

  return subscriptions
}

export async function getActiveSubscriptionCountForTier(tier: web3.PublicKey) {
  const subscriptions = await getAllActiveSubscriptionsToTier(tier)
  return subscriptions.length
}

export async function getActiveSubscriptionCountForApp(app: web3.PublicKey) {
  const subscriptions = await getAllActiveSubscriptionsToApp(app)

  return subscriptions.length
}

export async function getActiveSubscriptionsToAppGroupedByTier(
  app: web3.PublicKey
) {
  let subscriptions = await getAllActiveSubscriptionsToApp(app)

  let grouped = {}

  subscriptions.map((sub) => {
    // @ts-ignore
    if (grouped[sub.account.tier.toBase58()]) {
      // @ts-ignore
      grouped[sub.account.tier.toBase58()].push(sub)
    } else {
      // @ts-ignore
      grouped[sub.account.tier.toBase58()] = [sub]
    }
  })

  return grouped
}

export async function getAllSubscriptionsForUser(user: web3.PublicKey) {
  const subscriptions = await program.account.subscription.all([
    { memcmp: { offset: 72, bytes: user.toBase58() } },
  ])

  return subscriptions.map((s) => convertSubscription(s.account, s.publicKey))
}

export async function getActiveSubscriptionsForUser(user: web3.PublicKey) {
  let subscriptions = await getAllSubscriptionsForUser(user)

  let now = new Date().getTime()
  subscriptions = subscriptions.filter((sub) => {
    return sub.payPeriodExpiration.getTime() > now
  })

  return subscriptions
}

export async function isActiveSubscriber(
  subscriber: web3.PublicKey,
  app: web3.PublicKey,
  tier: web3.PublicKey | null = null
) {
  const subscription = await getSubscription(subscriber, app)

  if (tier && subscription.tier !== tier) {
    return
  }

  const now = new Date().getTime()

  return subscription.payPeriodExpiration.getTime() > now
}

export async function getSubscription(
  subscriber: web3.PublicKey,
  app: web3.PublicKey
) {
  let [key] = subscriptionAccountKey(subscriber, app)
  let subscription = await program.account.subscription.fetch(key)
  return convertSubscription(subscription, key)
}
