import { Subscription, web3 } from "@project-serum/anchor"
import { getProgram } from "../config/config"

const program = getProgram()

export async function getSubscriptionsToApp(app: web3.PublicKey) {
  const subscriptions = await program.account.Subscription.all([
    { memcmp: { offset: 8, bytes: app.toBase58() } },
  ])

  return subscriptions
}
