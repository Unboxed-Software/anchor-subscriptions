import { expect } from "chai"
import * as anchor from "@project-serum/anchor"
import { web3 } from "@project-serum/anchor"
import {
  createGeneralScaffolding,
  createSubscription,
  tierAccountKey,
} from "./utils/basic-functions"
import { createAssociatedTokenAccount, createMint } from "@solana/spl-token"
import {
  createReferralApp,
  subscribeWithReferral,
} from "../client/referral-sdk/src"
import generateFundedKeypair from "./utils/keypair"
import { app } from "../client/subscription-sdk/src"
import { Metaplex } from "@metaplex-foundation/js"

describe("sdk tests", () => {
  it("subscription", async () => {
    const metaplex = Metaplex.make(global.connection)
    const nft = await metaplex.nfts().findByMint({
      mintAddress: new web3.PublicKey(
        "3UUhgaJbCRd95HjuD7tSBdRBqKJCPhBFcaVBQktLPa9E"
      ),
    })

    console.log(nft.collection.address.toBase58())

    const subs = await app.get.subscriptions.all(
      new web3.PublicKey("71XJV5xrYDog4frZaqv7eJ6R4L6NKHdnTk9nD9psfvmF")
    )

    console.log(subs)
  })
  // it.only("random test", async () => {
  //   const subscriber = web3.Keypair.generate()
  //   let subscriberAta = await createAssociatedTokenAccount(
  //     global.connection,
  //     subscriber,
  //     global.mint,
  //     subscriber.publicKey
  //   )
  //   await createSubscription(app, tier1, subscriber, subscriberAta)
  //   const count = await app.queries.getAllSubscriptionsToApp sdk.getActiveSubscriptionCountForApp(
  //     new web3.PublicKey("FZ3LyWWrorXTfNHp6v4tncoN7iojo1Dud9YofPizwycB")
  //   )
  //   const subscriptions = await sdk.getSubscriptionsToApp(
  //     new web3.PublicKey("FZ3LyWWrorXTfNHp6v4tncoN7iojo1Dud9YofPizwycB")
  //   )
  //   expect(count).to.equal(2)
  // })
  it.only("whatever", async () => {
    const split1 = global.testKeypairs.colossal

    const mint = await createMint(
      global.connection,
      auth,
      auth.publicKey,
      auth.publicKey,
      0
    )
    const { instructions, app: newApp } = await createReferralApp(
      "great app",
      auth.publicKey,
      2,
      mint,
      20,
      [{ address: split1.publicKey, weight: 80 }],
      new web3.PublicKey("GnRPQpETZ2rsDKxxXVPgwjChcp1i1kh6FpvLZupS7ndR")
    )
    const tx = new web3.Transaction()
    tx.add(instructions[0]).add(instructions[1])
    await global.program.provider.sendAndConfirm(tx, [auth])

    const tx2 = new web3.Transaction()
    tx2.add(
      await global.program.methods.createTier(1, "test", new anchor.BN(10), {
        month: {},
      })
    )

    const tierKey = tierAccountKey(newApp, 1)

    const { instruction } = await subscribeWithReferral(
      split1.publicKey,
      tierKey,
      new web3.PublicKey("3UUhgaJbCRd95HjuD7tSBdRBqKJCPhBFcaVBQktLPa9E")
    )

    tx2.add(instruction)

    await global.program.provider.sendAndConfirm(tx2, [split1])
  })

  beforeEach(async () => {
    ;({ user, app, tier1, auth } = await createGeneralScaffolding())
  })

  let user, app, tier1, auth
})
// ;(async () => {
//   const subscriptions = await sdk.app.get.subscriptions.all(
//     new web3.PublicKey("FZ3LyWWrorXTfNHp6v4tncoN7iojo1Dud9YofPizwycB")
//   )

//   console.log(subscriptions)
// })()
