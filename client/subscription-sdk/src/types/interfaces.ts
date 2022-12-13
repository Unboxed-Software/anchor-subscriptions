import { web3 } from "@project-serum/anchor"

export interface Tier {
  pubkey: web3.PublicKey
  app: web3.PublicKey
  price: number
  interval: Interval
  acceptingNewSubs: boolean
  active: boolean
  name: string
}

export interface Subscription {
  pubkey: web3.PublicKey
  app: web3.PublicKey
  tier: web3.PublicKey
  subscriber: web3.PublicKey
  start: Date
  lastPaymentTime: Date
  payPeriodStart: Date
  payPeriodExpiration: Date
  acceptNewPayments: boolean
  credits: number
  bump: number
}

export interface App {
  pubkey: web3.PublicKey
  auth: web3.PublicKey
  numTiers: number
  treasury: web3.PublicKey
  mint: web3.PublicKey
  name: string
}

export interface User {
  pubkey: web3.PublicKey
  auth: web3.PublicKey
  numApps: number
}

export enum Interval {
  Monthly,
  Yearly,
}
