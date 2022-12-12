import { Instruction, web3 } from "@project-serum/anchor"
import { THREAD_PROGRAM } from "../utils/constants"
import {
  subscriptionAccountKey,
  subscriptionThreadKey,
} from "../utils/pda-derivations"

export async function subscribeToTier(
  subscriber: web3.PublicKey,
  subscriberAta: web3.PublicKey,
  app: web3.PublicKey,
  tier: web3.PublicKey
): Promise<{
  instruction: Instruction
  subscription: web3.PublicKey
  subscriptionBump: number
  thread: web3.PublicKey
}> {
  let [subscription, subscriptionBump] = subscriptionAccountKey(subscriber, app)

  let thread = subscriptionThreadKey(subscription)

  let instruction = await global.program.methods
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

  return {
    instruction,
    subscription,
    subscriptionBump,
    thread,
  }
}
