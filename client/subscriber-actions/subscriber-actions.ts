import { Instruction, web3 } from "@project-serum/anchor"
import { getProgram } from "../config/config"
import { THREAD_PROGRAM } from "../utils/constants"
import {
  subscriptionAccountKey,
  subscriptionThreadKey,
} from "../utils/pda-derivations"

const program = getProgram()

export async function subscribeToTier(
  subscriber: web3.PublicKey,
  subscriberAta: web3.PublicKey,
  app: web3.PublicKey,

  tier: web3.PublicKey,
  appTreasury: web3.PublicKey
) {
  let [subscription, subscriptionBump] = subscriptionAccountKey(subscriber, app)

  let thread = subscriptionThreadKey(subscription)

  let subscribeIx = await program.methods
    .createSubscription()
    .accounts({
      threadProgram: THREAD_PROGRAM,
      subscriptionThread: thread,
      app,
      tier,
      subscriber: subscriber,
      subscriberAta,
    })
    .instruction()

  let completePaymentIx = await program.methods
    .completePayment()
    .accounts({
      app,
      tier,
      destination: appTreasury,
      subscriberAta,
      subscription,
      subscriptionThread: thread,
    })
    .instruction()

  return {
    instructions: [subscribeIx, completePaymentIx],
    subscription,
    subscriptionBump,
  }
}

export async function cancelSubscription(
  app: web3.PublicKey,
  tier: web3.PublicKey,
  subscriber: web3.PublicKey,
  subscriberAta: web3.PublicKey
) {
  let [subscription] = subscriptionAccountKey(subscriber, app)
  let thread = subscriptionThreadKey(subscription)

  const instruction = await program.methods
    .cancelSubscription()
    .accounts({
      app,
      tier,
      subscriber: subscriber,
      subscriberAta,
      subscriptionThread: thread,
      threadProgram: THREAD_PROGRAM,
    })
    .instruction()

  return { instruction }
}

export async function closeSubscriptionAccount(
  app: web3.PublicKey,
  subscriber: web3.PublicKey
) {
  let [subscription, bump] = subscriptionAccountKey(subscriber, app)
  let thread = subscriptionThreadKey(subscription)

  const instruction = await program.methods
    .closeSubscriptionAccount(bump)
    .accounts({
      app,
      subscription,
      subscriber: subscriber,
      subscriptionThread: thread,
      threadProgram: THREAD_PROGRAM,
    })
    .instruction()

  return { instruction }
}

export async function switchSubscriptionTier(
  oldTier: web3.PublicKey,
  newTier: web3.PublicKey,
  app: web3.PublicKey,
  subscriber: web3.PublicKey,
  subscriberAta: web3.PublicKey
) {
  let [subscription] = subscriptionAccountKey(subscriber, app)
  let thread = subscriptionThreadKey(subscription)

  const instruction = await program.methods
    .switchSubscriptionTier()
    .accounts({
      oldTier,
      newTier,
      app,
      subscriber: subscriber,
      subscriberAta: subscriberAta,
      subscriptionThread: thread,
      threadProgram: THREAD_PROGRAM,
    })
    .instruction()

  return { instruction }
}
