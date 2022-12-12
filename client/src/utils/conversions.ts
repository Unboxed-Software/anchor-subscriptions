import { web3 } from "@project-serum/anchor"
import { Subscription, Tier, App, User, Interval } from "../types/interfaces"

export function convertSubscription(
  sub: any,
  pubkey: web3.PublicKey
): Subscription {
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
  }
}

export function convertTier(tier: any, pubkey: web3.PublicKey): Tier {
  return {
    pubkey: pubkey,
    app: tier.app,
    price: tier.price,
    interval: tier.interval,
    acceptingNewSubs: tier.acceptingNewSubs,
    active: tier.acceptingNewSubs,
    name: tier.name,
  }
}

export function convertApp(app: any, pubkey: web3.PublicKey): App {
  return {
    pubkey: pubkey,
    auth: app.auth,
    numTiers: app.numTiers,
  }
}

export function convertUser(user: any, pubkey: web3.PublicKey): User {
  return {
    pubkey: pubkey,
    auth: user.auth,
    numApps: user.numApps,
  }
}

function convertInterval(interval: any): Interval {
  if (interval.month) {
    return Interval.Monthly
  } else if (interval.year) {
    return Interval.Yearly
  } else {
    throw "DOESN'T MATCH INTERVAL ENUM"
  }
}
