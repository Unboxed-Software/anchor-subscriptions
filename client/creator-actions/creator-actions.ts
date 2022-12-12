import { web3 } from "@project-serum/anchor"
import { getProgram } from "../config/config"
import {
  appAccountKey,
  tierAccountKey,
  userAccountKeyFromPubkey,
} from "../utils/pda-derivations"

const program = getProgram()

export async function createUser(auth: web3.PublicKey): Promise<{
  instruction: web3.TransactionInstruction
}> {
  const instruction = await program.methods
    .createUser()
    .accounts({
      auth: auth,
    })
    .instruction()

  return {
    instruction,
  }
}

export async function createApp(
  name: string,
  auth: web3.PublicKey,
  mint: web3.PublicKey,
  treasury: web3.PublicKey,
  appId?: number
): Promise<{
  instruction: web3.TransactionInstruction
  app: web3.PublicKey
}> {
  const userKey = userAccountKeyFromPubkey(auth)
  if (!appId) {
    const user = await program.account.userMeta.fetch(userKey)
    appId = (user.numApps as number) + 1
  }
  const app = appAccountKey(auth, appId)
  const instruction = await program.methods
    .createApp(appId, name)
    .accounts({
      auth: auth,
      mint: mint,
      treasury: treasury,
    })
    .instruction()

  return {
    instruction,
    app,
  }
}

export async function createTier(
  name: string,
  app: web3.PublicKey,
  price: number,
  interval: Interval,
  auth: web3.PublicKey,
  tierId?: number
): Promise<{
  instruction: web3.TransactionInstruction
  tier: web3.PublicKey
}> {
  if (!tierId) {
    const appPDA = await program.account.App.fetch(app)
    tierId = (appPDA.numTiers as number) + 1
  }

  const tier = tierAccountKey(app, tierId)

  const instruction = await program.methods
    .createTier(tierId, name, price, intervalValueInternal(interval))
    .accounts({
      app,
      signer: auth,
    })
    .instruction()

  return {
    instruction,
    tier,
  }
}

export async function pauseTier(
  app: web3.PublicKey,
  tier: web3.PublicKey,
  auth: web3.PublicKey
): Promise<{
  instruction: web3.TransactionInstruction
}> {
  const instruction = await program.methods
    .disallowNewSubscribers()
    .accounts({
      app,
      tier: tier,
      auth: auth,
    })
    .instruction()

  return { instruction }
}

export async function unpauseTier(
  app: web3.PublicKey,
  tier: web3.PublicKey,
  auth: web3.PublicKey
): Promise<{ instruction: web3.TransactionInstruction }> {
  const instruction = await program.methods
    .allowNewSubscribers()
    .accounts({ app, tier, auth })
    .instruction()

  return { instruction }
}

export async function disableTier(
  app: web3.PublicKey,
  tier: web3.PublicKey,
  auth: web3.PublicKey
): Promise<{ instruction: web3.TransactionInstruction }> {
  const instruction = await program.methods
    .disableTier()
    .accounts({
      app,
      tier,
      auth,
    })
    .instruction()

  return { instruction }
}

function intervalValueInternal(interval: Interval): any {
  switch (interval) {
    case Interval.Monthly:
      return { monthly: {} }
    case Interval.Yearly:
      return { yearly: {} }
  }
}

export enum Interval {
  Monthly,
  Yearly,
}
