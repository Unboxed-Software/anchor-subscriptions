import {
  createAssociatedTokenAccount,
  getAccount,
  mintToChecked,
} from "@solana/spl-token"
import chaiAsPromised from "chai-as-promised"
import chai from "chai"
import {
  createGeneralScaffolding,
  subscriptionAccountKey,
} from "./utils/basic-functions"
import generateFundedKeypair from "./utils/keypair"

chai.use(chaiAsPromised)
const expect = chai.expect

describe("subscription functionality", () => {
  it("subscriber can't switch tiers before paying", async () => {
    await global.program.methods
      .createSubscription()
      .accounts({
        app,
        tier: tier1,
        subscriber: subscriber1.publicKey,
        subscriberAta: subscriber1Ata,
      })
      .signers([subscriber1])
      .rpc()

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
    await global.program.methods
      .createSubscription()
      .accounts({
        app,
        tier: tier1,
        subscriber: subscriber1.publicKey,
        subscriberAta: subscriber1Ata,
      })
      .signers([subscriber1])
      .rpc()

    let destination = await createAssociatedTokenAccount(
      global.connection,
      auth,
      global.mint,
      auth.publicKey
    )

    const subscription1 = subscriptionAccountKey(subscriber1.publicKey, app)

    await global.program.methods
      .completePayment()
      .accounts({
        app,
        tier: tier1,
        destination: destination,
        subscriberAta: subscriber1Ata,
        subscription: subscription1,
      })
      .rpc()

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

    const sub = await global.program.account.subscription.fetch(subscription1)
    expect(sub.tier.toBase58()).to.equal(tier2.toBase58())
  })

  it("switching tiers credits unused balance to new tier", async () => {
    await global.program.methods
      .createSubscription()
      .accounts({
        app,
        tier: tier1,
        subscriber: subscriber1.publicKey,
        subscriberAta: subscriber1Ata,
      })
      .signers([subscriber1])
      .rpc()

    let destination = await createAssociatedTokenAccount(
      global.connection,
      auth,
      global.mint,
      auth.publicKey
    )

    const subscription1 = subscriptionAccountKey(subscriber1.publicKey, app)

    await global.program.methods
      .completePayment()
      .accounts({
        app,
        tier: tier1,
        destination: destination,
        subscriberAta: subscriber1Ata,
        subscription: subscription1,
      })
      .rpc()

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

    await global.program.methods
      .completePayment()
      .accounts({
        app,
        tier: tier2,
        destination: destination,
        subscriberAta: subscriber1Ata,
        subscription: subscription1,
      })
      .rpc()

    const destinationAta = await getAccount(global.connection, destination)
    expect(Number(destinationAta.amount)).to.equal(10)
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
    ;({ user, app, tier1, tier2, auth } = await createGeneralScaffolding())
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

    await global.program.methods
      .createSubscription()
      .accounts({
        app,
        tier: tier1,
        subscriber: subscriber.publicKey,
        subscriberAta: subscriberAta,
      })
      .signers([subscriber])
      .rpc()
  })
})
