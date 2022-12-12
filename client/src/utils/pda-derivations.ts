import { BN, web3 } from "@project-serum/anchor"
import { getProgram } from "../config/config"
import { THREAD_PROGRAM } from "./constants"

const program = getProgram()

export function userAccountKeyFromPubkey(
  pubkey: web3.PublicKey
): web3.PublicKey {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("USER_META"), pubkey.toBuffer()],
    program.programId
  )[0]
}

export function findUserMetaAddress(pubkey: web3.PublicKey) {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("USER_META"), pubkey.toBuffer()],
    program.programId
  )
}

export function appAccountKey(
  auth: web3.PublicKey,
  appId: number
): web3.PublicKey {
  return web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("APP"),
      auth.toBuffer(),
      new BN(appId).toArrayLike(Buffer, "be", 1),
    ],
    program.programId
  )[0]
}

export function findAppAddress(
  auth: web3.PublicKey,
  appId: number,
  programId: web3.PublicKey
) {
  return web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("APP"),
      auth.toBuffer(),
      new BN(appId).toArrayLike(Buffer, "be", 1),
    ],
    programId
  )
}

export function numberToAppId(appId: number): Buffer {
  return new BN(appId).toArrayLike(Buffer, "be", 1)
}

export function tierAccountKey(
  app: web3.PublicKey,
  tierId: number
): web3.PublicKey {
  return web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("SUBSCRIPTION_TIER"),
      app.toBuffer(),
      new BN(tierId).toArrayLike(Buffer, "be", 1),
    ],
    program.programId
  )[0]
}

export function subscriptionAccountKey(
  subscriber: web3.PublicKey,
  app: web3.PublicKey
): [web3.PublicKey, number] {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("SUBSCRIPTION"), app.toBuffer(), subscriber.toBuffer()],
    program.programId
  )
}

export function subscriptionThreadKey(
  subscription: web3.PublicKey
): web3.PublicKey {
  return web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("thread"),
      subscription.toBuffer(),
      Buffer.from("subscriber_thread"),
    ],
    THREAD_PROGRAM
  )[0]
}

export function findSubscriptionAddress(
  subscriber: web3.PublicKey,
  app: web3.PublicKey,
  programId: web3.PublicKey
) {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("SUBSCRIPTION"), app.toBuffer(), subscriber.toBuffer()],
    programId
  )
}
