import * as anchor from "@project-serum/anchor"
import {
  createAssociatedTokenAccount,
  getAccount,
  mintToChecked,
} from "@solana/spl-token"
import { BN, Program } from "@project-serum/anchor"
import chai from "chai"
import chaiAsPromised from "chai-as-promised"
import {
  cancelSubscription,
  completePayment,
  createSubscription,
} from "./utils/basic-functions"
import { Plege } from "../target/types/plege"

chai.use(chaiAsPromised)
const expect = chai.expect

describe("basic flow", () => {
  it("creates user", async () => {
    await program.methods
      .createUser()
      .accounts({
        auth: global.testKeypairs.colossal.publicKey,
      })
      .signers([global.testKeypairs.colossal])
      .rpc()
  })

  it("creates app", async () => {
    await program.methods
      .createApp(1, "Test App", null)
      .accounts({
        mint: global.mint,
        auth: global.testKeypairs.colossal.publicKey,
        treasury: global.testKeypairs.hacker.publicKey,
      })
      .signers([global.testKeypairs.colossal])
      .rpc()

    const appPDA = await program.account.app.fetch(app)
    console.log(appPDA.callback)
    expect(appPDA.auth.toBase58()).to.equal(
      global.testKeypairs.colossal.publicKey.toBase58()
    )
  })

  it("create tier", async () => {
    await program.methods
      .createTier(1, "Test Tier", new BN(10), { month: {} })
      .accounts({
        app,
        signer: global.testKeypairs.colossal.publicKey,
      })
      .signers([global.testKeypairs.colossal])
      .rpc()

    const tierPDA = await program.account.tier.fetch(tier)
    expect(tierPDA.app.toBase58()).to.equal(app.toBase58())
    expect(tierPDA.price.toNumber()).to.equal(10)
    expect((tierPDA.interval as any).month).to.not.equal(undefined)
  })

  it("create subscription", async () => {
    const { subscription, subscriptionThread } = await createSubscription(
      app,
      tier,
      global.testKeypairs.subscriber,
      subscriberAta
    )

    const subscriptionPDA = await program.account.subscription.fetch(
      subscription
    )

    expect(subscriptionPDA.app.toBase58()).to.equal(app.toBase58())
    expect(subscriptionPDA.tier.toBase58()).to.equal(tier.toBase58())
    expect(subscriptionPDA.subscriber.toBase58()).to.equal(
      global.testKeypairs.subscriber.publicKey.toBase58()
    )
    const startTime = new Date(subscriptionPDA.start.toNumber() * 1000)
    expect(new Date().getTime() - startTime.getTime()).to.be.lessThan(5000)
    expect(subscriptionPDA.start.toNumber()).to.equal(
      subscriptionPDA.payPeriodExpiration.toNumber()
    )
  })

  it("completes payment", async () => {
    const before = await program.account.subscription.fetch(subscription)

    await completePayment(app, tier, hackerAta, subscriberAta, subscription)

    const subscriptionPDA = await program.account.subscription.fetch(
      subscription
    )

    const ownerATA = await getAccount(global.connection, hackerAta)

    let payPeriod = new Date(before.payPeriodExpiration.toNumber() * 1000)
    payPeriod.setMonth(payPeriod.getMonth() + 1)
    expect(subscriptionPDA.payPeriodExpiration.toNumber() * 1000).to.equal(
      payPeriod.getTime()
    )
    expect(Number(ownerATA.amount)).to.equal(10)
  })

  it("cancels subscription", async () => {
    await cancelSubscription(
      app,
      tier,
      global.testKeypairs.subscriber,
      subscriberAta
    )

    const subscriptionPDA = await program.account.subscription.fetch(
      subscription
    )
    expect(subscriptionPDA.acceptNewPayments).to.equal(false)
  })

  it("attempting to create subscription again fails", async () => {
    expect(
      createSubscription(
        app,
        tier,
        global.testKeypairs.subscriber,
        subscriberAta
      )
    ).to.eventually.be.rejected
  })

  // it("can close subscription")

  // it("can create subscription again after closing account", async () => {
  //   await global.program.methods
  //     .createSubscription()
  //     .accounts({
  //       threadProgram: threadProgram,
  //       subscriptionThread: thread,
  //       app,
  //       tier,
  //       subscriber: global.testKeypairs.subscriber.publicKey,
  //       subscriberAta,
  //     })
  //     .signers([global.testKeypairs.subscriber])
  //     .rpc()

  //   const subscriptionPDA = await global.program.account.subscription.fetch(
  //     subscription
  //   )

  //   expect(subscriptionPDA.app.toBase58()).to.equal(app.toBase58())
  //   expect(subscriptionPDA.tier.toBase58()).to.equal(tier.toBase58())
  //   expect(subscriptionPDA.subscriber.toBase58()).to.equal(
  //     global.testKeypairs.subscriber.publicKey.toBase58()
  //   )
  //   const startTime = new Date(subscriptionPDA.start * 1000)
  //   expect(new Date().getTime() - startTime.getTime()).to.be.lessThan(5000)
  //   expect(subscriptionPDA.start.toNumber()).to.equal(
  //     subscriptionPDA.payPeriodExpiration.toNumber()
  //   )
  // })

  before(async () => {
    program = global.program as Program<Plege>
    ;[app] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("APP"),
        global.testKeypairs.colossal.publicKey.toBuffer(),
        new BN([1]).toArrayLike(Buffer, "be", 1),
      ],
      program.programId
    )
    ;[tier] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("SUBSCRIPTION_TIER"),
        app.toBuffer(),
        new BN([1]).toArrayLike(Buffer, "be", 1),
      ],
      program.programId
    )
    ;[subscription] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("SUBSCRIPTION"),
        app.toBuffer(),
        global.testKeypairs.subscriber.publicKey.toBuffer(),
      ],
      program.programId
    )

    threadProgram = new anchor.web3.PublicKey(
      "3XXuUFfweXBwFgFfYaejLvZE4cGZiHgKiGfMtdxNzYmv"
    )
    ;[thread] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("thread"),
        subscription.toBuffer(),
        Buffer.from("subscriber_thread"),
      ],
      threadProgram
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

  let colossalAta,
    subscriberAta,
    hackerAta,
    app,
    tier,
    subscription,
    thread,
    threadProgram

  let program: Program<Plege>
})
