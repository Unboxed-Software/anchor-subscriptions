import { web3 } from "@project-serum/anchor"
import { getProgram } from "../config/config"
import { getAllTiersForApp } from "./tier-queries"

const program = getProgram()

export async function getAllSubscriptionsToApp(app: web3.PublicKey) {
  const subscriptions = await program.account.subscription.all([
    { memcmp: { offset: 8, bytes: app.toBase58() } },
  ])

  return subscriptions
}

export async function getAllActiveSubscriptionsToApp(app: web3.PublicKey) {
  let subscriptions = await getAllSubscriptionsToApp(app)

  subscriptions = subscriptions.filter((sub) => {
    return (
      sub.account.payPeriodExpiration.toNumber() > new Date().getTime() / 1000
    )
  })

  return subscriptions
}

export async function getAllSubscriptionsToTier(tier: web3.PublicKey) {
  const subscriptions = await program.account.subscription.all([
    { memcmp: { offset: 40, bytes: tier.toBase58() } },
  ])

  return subscriptions
}

export async function getAllActiveSubscriptionsToTier(tier: web3.PublicKey) {
  let subscriptions = await getAllSubscriptionsToTier(tier)

  subscriptions = subscriptions.filter((sub) => {
    return (
      sub.account.payPeriodExpiration.toNumber() > new Date().getTime() / 1000
    )
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
    if (grouped[sub.account.tier.toBase58()]) {
      grouped[sub.account.tier.toBase58()].push(sub)
    } else {
      grouped[sub.account.tier.toBase58()] = [sub]
    }
  })

  return grouped
}
