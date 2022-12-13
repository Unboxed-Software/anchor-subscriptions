import { expect } from "chai"
import { web3 } from "@project-serum/anchor"
import {
  createGeneralScaffolding,
  createSubscription,
} from "./utils/basic-functions"
import { createAssociatedTokenAccount, createMint } from "@solana/spl-token"
import {
  createReferralApp,
  subscribeWithReferral,
} from "../client/referral-sdk/src"
import generateFundedKeypair from "./utils/keypair"

describe("sdk tests", () => {
  // it.only("random test", async () => {
  //   sdk.setup(global.connection, global.program.programId)

  //   const subscriber = web3.Keypair.generate()
  //   let subscriberAta = await createAssociatedTokenAccount(
  //     global.connection,
  //     subscriber,
  //     global.mint,
  //     subscriber.publicKey
  //   )
  //   await createSubscription(app, tier1, subscriber, subscriberAta)
  //   const count = await sdk.getActiveSubscriptionCountForApp(
  //     new web3.PublicKey("FZ3LyWWrorXTfNHp6v4tncoN7iojo1Dud9YofPizwycB")
  //   )

  //   const subscriptions = await sdk.getSubscriptionsToApp(
  //     new web3.PublicKey("FZ3LyWWrorXTfNHp6v4tncoN7iojo1Dud9YofPizwycB")
  //   )

  //   expect(count).to.equal(2)
  // })

  it("whatever", async () => {
    const auth = await generateFundedKeypair(global.connection)
    const split1 = web3.Keypair.generate()
    const split2 = web3.Keypair.generate()

    const mint = await createMint(
      global.connection,
      auth,
      auth.publicKey,
      auth.publicKey,
      0
    )

    const { instructions, app } = await createReferralApp(
      "great app",
      auth.publicKey,
      mint,
      20,
      [{ address: split1.publicKey, weight: 10 }],
      new web3.PublicKey("GnRPQpETZ2rsDKxxXVPgwjChcp1i1kh6FpvLZupS7ndR")
    )

    const tx = new web3.Transaction()
    tx.add(instructions[0]).add(instructions[1])

    await global.connection.sendAndConfirm(tx, [auth])
  })
})
// ;(async () => {
//   const subscriptions = await sdk.app.get.subscriptions.all(
//     new web3.PublicKey("FZ3LyWWrorXTfNHp6v4tncoN7iojo1Dud9YofPizwycB")
//   )

//   console.log(subscriptions)
// })()
