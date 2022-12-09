import * as anchor from "@project-serum/anchor"
import {
  createAssociatedTokenAccount,
  getAccount,
  mintToChecked,
} from "@solana/spl-token"
import { BN } from "@project-serum/anchor"
import { expect } from "chai"

describe("basic flow", () => {
  it("creates user", async () => {
    await global.program.methods
      .createUser()
      .accounts({
        auth: global.testKeypairs.colossal.publicKey,
      })
      .signers([global.testKeypairs.colossal])
      .rpc()
  })

  it("creates app", async () => {
    await global.program.methods
      .createApp(1, "Test App")
      .accounts({
        auth: global.testKeypairs.colossal.publicKey,
        treasury: global.testKeypairs.colossal.publicKey,
      })
      .signers([global.testKeypairs.colossal])
      .rpc()

    const appPDA = await global.program.account.app.fetch(app)
    expect(appPDA.auth.toBase58()).to.equal(
      global.testKeypairs.colossal.publicKey.toBase58()
    )
  })

  it("create tier", async () => {
    await global.program.methods
      .createTier(new BN(1), "Test Tier", new BN(10), { month: {} })
      .accounts({
        app,
        mint: global.mint,
        signer: global.testKeypairs.colossal.publicKey,
      })
      .signers([global.testKeypairs.colossal])
      .rpc()

    const tierPDA = await global.program.account.tier.fetch(tier)
    expect(tierPDA.app.toBase58()).to.equal(app.toBase58())
    expect(tierPDA.mint.toBase58()).to.equal(global.mint.toBase58())
    expect(tierPDA.price.toNumber()).to.equal(10)
    expect(tierPDA.interval.month !== undefined)
  })

  it("create subscription", async () => {
    await global.program.methods
      .createSubscription()
      .accounts({
        app,
        tier,
        subscriber: global.testKeypairs.subscriber.publicKey,
        subscriberAta,
      })
      .signers([global.testKeypairs.subscriber])
      .rpc()

    const subscriptionPDA = await global.program.account.subscription.fetch(
      subscription
    )

    expect(subscriptionPDA.app.toBase58()).to.equal(app.toBase58())
    expect(subscriptionPDA.tier.toBase58()).to.equal(tier.toBase58())
    expect(subscriptionPDA.subscriber.toBase58()).to.equal(
      global.testKeypairs.subscriber.publicKey.toBase58()
    )
    const startTime = new Date(subscriptionPDA.start * 1000)
    expect(new Date().getTime() - startTime.getTime()).to.be.lessThan(5000)
    expect(subscriptionPDA.start.toNumber()).to.equal(
      subscriptionPDA.activeThrough.toNumber()
    )
  })

  it("completes payment", async () => {
    const before = await global.program.account.subscription.fetch(subscription)

    await global.program.methods
      .completePayment()
      .accounts({
        app,
        tier,
        destination: colossalAta,
        subscriberAta,
        subscription,
      })
      .rpc()

    const subscriptionPDA = await global.program.account.subscription.fetch(
      subscription
    )

    const ownerATA = await getAccount(global.connection, colossalAta)

    let payPeriod = new Date(before.activeThrough.toNumber() * 1000)
    payPeriod.setMonth(payPeriod.getMonth() + 1)
    expect(subscriptionPDA.activeThrough.toNumber() * 1000).to.equal(
      payPeriod.getTime()
    )
    expect(Number(ownerATA.amount)).to.equal(10)
  })

  it("cancels subscription", async () => {
    await global.program.methods
      .cancelSubscription()
      .accounts({
        app,
        tier,
        subscriber: global.testKeypairs.subscriber.publicKey,
        subscriberAta,
      })
      .signers([global.testKeypairs.subscriber])
      .rpc()

    const subscriptionPDA = await global.connection.getAccountInfo(subscription)
    expect(subscriptionPDA).to.equal(null)
  })

  it("creates subscription again", async () => {
    await global.program.methods
      .createSubscription()
      .accounts({
        app,
        tier,
        subscriber: global.testKeypairs.subscriber.publicKey,
        subscriberAta,
      })
      .signers([global.testKeypairs.subscriber])
      .rpc()

    const subscriptionPDA = await global.program.account.subscription.fetch(
      subscription
    )

    expect(subscriptionPDA.app.toBase58()).to.equal(app.toBase58())
    expect(subscriptionPDA.tier.toBase58()).to.equal(tier.toBase58())
    expect(subscriptionPDA.subscriber.toBase58()).to.equal(
      global.testKeypairs.subscriber.publicKey.toBase58()
    )
    const startTime = new Date(subscriptionPDA.start * 1000)
    expect(new Date().getTime() - startTime.getTime()).to.be.lessThan(5000)
    expect(subscriptionPDA.start.toNumber()).to.equal(
      subscriptionPDA.activeThrough.toNumber()
    )
  })

  before(async () => {
    ;[app] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("APP"),
        global.testKeypairs.colossal.publicKey.toBuffer(),
        new BN([1]).toArrayLike(Buffer, "be", 1),
      ],
      global.program.programId
    )
    ;[tier] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("SUBSCRIPTION_TIER"),
        app.toBuffer(),
        new BN([1]).toArrayLike(Buffer, "be", 1),
      ],
      global.program.programId
    )
    ;[subscription] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("SUBSCRIPTION"),
        app.toBuffer(),
        global.testKeypairs.subscriber.publicKey.toBuffer(),
      ],
      global.program.programId
    )

    colossalAta = await createAssociatedTokenAccount(
      global.connection,
      global.testKeypairs.colossal,
      global.mint,
      global.testKeypairs.colossal.publicKey
    )

    subscriberAta = await createAssociatedTokenAccount(
      global.connection,
      global.testKeypairs.subscriber,
      global.mint,
      global.testKeypairs.subscriber.publicKey
    )

    hackerAta = await createAssociatedTokenAccount(
      global.connection,
      global.testKeypairs.hacker,
      global.mint,
      global.testKeypairs.hacker.publicKey
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
  })
})

let colossalAta, subscriberAta, hackerAta, app, tier, subscription
