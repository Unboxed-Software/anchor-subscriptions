import { createAssociatedTokenAccount, mintToChecked } from "@solana/spl-token"
import { expect } from "chai"
import {
  createGeneralScaffolding,
  subscriptionAccountKey,
} from "./utils/basic-functions"
import generateFundedKeypair from "./utils/keypair"

describe("tier functionality", () => {
  it("new tier accepts subscribers", async () => {
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

    await global.program.methods
      .createSubscription()
      .accounts({
        app,
        tier: tier1,
        subscriber: subscriber2.publicKey,
        subscriberAta: subscriber2Ata,
      })
      .signers([subscriber2])
      .rpc()

    const subscription1 = subscriptionAccountKey(subscriber1.publicKey, app)
    const subscription1PDA = await global.program.account.subscription.fetch(
      subscription1
    )

    const subscription2 = subscriptionAccountKey(subscriber1.publicKey, app)
    const subscription2PDA = await global.program.account.subscription.fetch(
      subscription2
    )

    expect(subscription1PDA)
    expect(subscription2PDA)
  })

  it("tier can stop accepting subscribers", async () => {
    await global.program.methods
      .disallowNewSubscribers()
      .accounts({
        app,
        tier: tier1,
        auth: auth.publicKey,
      })
      .signers([auth])
      .rpc()

    try {
      await global.program.methods
        .createSubscription()
        .accounts({
          app,
          tier: tier1,
          subscriber: subscriber2.publicKey,
          subscriberAta: subscriber2Ata,
        })
        .signers([subscriber2])
        .rpc()
    } catch (error) {
      expect(error.error.errorCode.number).to.equal(2003)
    }
  })

  it("tier can accept subscribers again", async () => {
    await global.program.methods
      .disallowNewSubscribers()
      .accounts({
        app,
        tier: tier1,
        auth: auth.publicKey,
      })
      .signers([auth])
      .rpc()

    await global.program.methods
      .allowNewSubscribers()
      .accounts({ app, tier: tier1, auth: auth.publicKey })
      .signers([auth])
      .rpc()

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

    const subscription1 = subscriptionAccountKey(subscriber1.publicKey, app)
    const subscription1PDA = await global.program.account.subscription.fetch(
      subscription1
    )

    expect(subscription1PDA)
  })

  it("disabled tier cannot add subscribers", async () => {
    await global.program.methods
      .disableTier()
      .accounts({
        app,
        tier: tier1,
        auth: auth.publicKey,
      })
      .signers([auth])
      .rpc()

    try {
      await global.program.methods
        .createSubscription()
        .accounts({
          app,
          tier: tier1,
          subscriber: subscriber2.publicKey,
          subscriberAta: subscriber2Ata,
        })
        .signers([subscriber2])
        .rpc()
    } catch (error) {
      expect(error.error.errorCode.number).to.equal(2003)
    }
  })

  it("disabling a tier stops future payments", async () => {
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

    const subscription1 = subscriptionAccountKey(subscriber1.publicKey, app)

    await global.program.methods
      .disableTier()
      .accounts({
        app,
        tier: tier1,
        auth: auth.publicKey,
      })
      .signers([auth])
      .rpc()

    let destination = await createAssociatedTokenAccount(
      global.connection,
      auth,
      global.mint,
      auth.publicKey
    )

    try {
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
    } catch (error) {
      expect(error.error.errorCode.number).to.equal(2003)
    }
  })

  let user,
    app,
    tier1,
    auth,
    subscriber1,
    subscriber1Ata,
    subscriber2,
    subscriber2Ata

  beforeEach(async () => {
    ;({ user, app, tier1, auth } = await createGeneralScaffolding())
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
