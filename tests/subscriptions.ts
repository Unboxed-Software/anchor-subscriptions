import {
  createAssociatedTokenAccount,
  createAssociatedTokenAccountInstruction,
  getAccount,
  getAssociatedTokenAddress,
  mintToChecked,
} from "@solana/spl-token"
import chaiAsPromised from "chai-as-promised"
import chai from "chai"
import {
  cancelSubscription,
  completePayment,
  createGeneralScaffolding,
  createSubscription,
  THREAD_PROGRAM,
} from "./utils/basic-functions"
import generateFundedKeypair from "./utils/keypair"
import { web3 } from "@project-serum/anchor"

chai.use(chaiAsPromised)
const expect = chai.expect

describe("subscription functionality", () => {
  it("subscriber can't switch tiers before paying", async () => {
    const { subscription, subscriptionThread } = await createSubscription(
      app,
      tier1,
      subscriber1,
      subscriber1Ata
    )

    await expect(
      global.program.methods
        .switchSubscriptionTier()
        .accounts({
          oldTier: tier1,
          newTier: tier2,
          app,
          subscriber: subscriber1.publicKey,
          subscriberAta: subscriber1Ata,
        })
        .signers([subscriber1])
        .rpc()
    ).to.eventually.be.rejected
  })

  it("subscriber can switch tier after paying", async () => {
    const { subscription } = await createSubscription(
      app,
      tier1,
      subscriber1,
      subscriber1Ata
    )

    let destination = await createAssociatedTokenAccount(
      global.connection,
      auth,
      global.mint,
      auth.publicKey
    )

    await completePayment(app, tier1, destination, subscriber1Ata, subscription)

    await global.program.methods
      .switchSubscriptionTier()
      .accounts({
        oldTier: tier1,
        newTier: tier2,
        app,
        subscriber: subscriber1.publicKey,
        subscriberAta: subscriber1Ata,
      })
      .signers([subscriber1])
      .rpc()

    const sub = await global.program.account.subscription.fetch(subscription)
    expect(sub.tier.toBase58()).to.equal(tier2.toBase58())
  })

  it("switching tiers credits unused balance to new tier", async () => {
    const { subscription, subscriptionThread } = await createSubscription(
      app,
      tier1,
      subscriber1,
      subscriber1Ata
    )

    let destination = await createAssociatedTokenAccount(
      global.connection,
      auth,
      global.mint,
      auth.publicKey
    )

    await completePayment(app, tier1, destination, subscriber1Ata, subscription)

    await global.program.methods
      .switchSubscriptionTier()
      .accounts({
        oldTier: tier1,
        newTier: tier2,
        app,
        subscriber: subscriber1.publicKey,
        subscriberAta: subscriber1Ata,
      })
      .signers([subscriber1])
      .rpc()

    await completePayment(app, tier2, destination, subscriber1Ata, subscription)

    const destinationAta = await getAccount(global.connection, destination)
    expect(Number(destinationAta.amount)).to.equal(10)
  })

  it.only("subscription can be closed if inactive", async () => {
    let subscription, subscriptionThread, subscriptionBump
    try {
      ;({ subscription, subscriptionThread, subscriptionBump } =
        await createSubscription(app, tier1, subscriber1, subscriber1Ata))
    } catch (error) {
      console.log("error on 1:", error)
    }

    try {
      await cancelSubscription(app, tier1, subscriber1, subscriber1Ata)
    } catch (error) {
      console.log("error on 2:", error)
    }

    try {
      await global.program.methods
        .closeSubscriptionAccount(subscriptionBump)
        .accounts({
          app,
          subscription,
          subscriber: subscriber1.publicKey,
          subscriptionThread,
          threadProgram: THREAD_PROGRAM,
        })
        .signers([subscriber1])
        .rpc()
    } catch (error) {
      console.log("error on 3", error)
    }
  })

  let user,
    app,
    tier1,
    tier2,
    auth,
    subscriber1,
    subscriber1Ata,
    subscriber2,
    subscriber2Ata

  beforeEach(async () => {
    await new Promise((x) => setTimeout(x, 4000))
    ;({ user, app, tier1, auth } = await createGeneralScaffolding())
    await new Promise((x) => setTimeout(x, 2000))
    let subscriber = await generateFundedKeypair(global.connection)
    subscriber1 = await generateFundedKeypair(global.connection)
    subscriber2 = await generateFundedKeypair(global.connection)

    let subscriberAta = await createAssociatedTokenAccount(
      global.connection,
      subscriber,
      global.mint,
      subscriber.publicKey
    )

    subscriber1Ata = await createAssociatedTokenAccount(
      global.connection,
      subscriber1,
      global.mint,
      subscriber1.publicKey
    )

    subscriber2Ata = await createAssociatedTokenAccount(
      global.connection,
      subscriber2,
      global.mint,
      subscriber2.publicKey
    )

    await mintToChecked(
      global.connection,
      global.testKeypairs.colossal,
      global.mint,
      subscriberAta,
      global.testKeypairs.colossal.publicKey,
      1000 * 10 ** 5,
      5
    )

    await mintToChecked(
      global.connection,
      global.testKeypairs.colossal,
      global.mint,
      subscriber1Ata,
      global.testKeypairs.colossal.publicKey,
      1000 * 10 ** 5,
      5
    )

    await mintToChecked(
      global.connection,
      global.testKeypairs.colossal,
      global.mint,
      subscriber2Ata,
      global.testKeypairs.colossal.publicKey,
      1000 * 10 ** 5,
      5
    )

    const { subscription, subscriptionThread } = await createSubscription(
      app,
      tier1,
      subscriber,
      subscriberAta
    )
  })
})
