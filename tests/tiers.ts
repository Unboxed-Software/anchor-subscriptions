import { createAssociatedTokenAccount, mintToChecked } from "@solana/spl-token";
import { expect } from "chai";
import {
  completePayment,
  createGeneralScaffolding,
  createSubscription,
  subscriptionAccountKey,
} from "./utils/basic-functions";
import generateFundedKeypair from "./utils/keypair";

describe("tier functionality", () => {
  it("new tier accepts subscribers", async () => {
    const { subscription: subscription1 } = await createSubscription(
      app,
      tier1,
      subscriber1,
      subscriber1Ata
    );

    const { subscription: subscription2 } = await createSubscription(
      app,
      tier1,
      subscriber2,
      subscriber2Ata
    );

    const subscription1PDA = await global.program.account.subscription.fetch(
      subscription1
    );
    const subscription2PDA = await global.program.account.subscription.fetch(
      subscription2
    );

    expect(subscription1PDA);
    expect(subscription2PDA);
  });

  it("tier can stop accepting subscribers", async () => {
    await global.program.methods
      .disallowNewSubscribers()
      .accounts({
        app,
        tier: tier1,
        auth: auth.publicKey,
      })
      .signers([auth])
      .rpc();

    try {
      await createSubscription(app, tier1, subscriber2, subscriber2Ata);
    } catch (error) {
      expect(error.error.errorCode.number).to.equal(2003);
    }
  });

  it("tier can accept subscribers again", async () => {
    await global.program.methods
      .disallowNewSubscribers()
      .accounts({
        app,
        tier: tier1,
        auth: auth.publicKey,
      })
      .signers([auth])
      .rpc();

    await global.program.methods
      .allowNewSubscribers()
      .accounts({ app, tier: tier1, auth: auth.publicKey })
      .signers([auth])
      .rpc();

    const { subscription: subscription1 } = await createSubscription(
      app,
      tier1,
      subscriber1,
      subscriber1Ata
    );

    const subscription1PDA = await global.program.account.subscription.fetch(
      subscription1
    );

    expect(subscription1PDA);
  });

  it("disabled tier cannot add subscribers", async () => {
    await global.program.methods
      .disableTier()
      .accounts({
        app,
        tier: tier1,
        auth: auth.publicKey,
      })
      .signers([auth])
      .rpc();

    try {
      await createSubscription(app, tier1, subscriber2, subscriber2Ata);
    } catch (error) {
      expect(error.error.errorCode.number).to.equal(2003);
    }
  });

  it("disabling a tier stops future payments", async () => {
    const { subscription: subscription1 } = await createSubscription(
      app,
      tier1,
      subscriber1,
      subscriber1Ata
    );

    await global.program.methods
      .disableTier()
      .accounts({
        app,
        tier: tier1,
        auth: auth.publicKey,
      })
      .signers([auth])
      .rpc();

    let destination = await createAssociatedTokenAccount(
      global.connection,
      auth,
      global.mint,
      auth.publicKey
    );

    try {
      await completePayment(
        app,
        tier1,
        destination,
        subscriber1Ata,
        subscription1
      );
    } catch (error) {
      expect(error.error.errorCode.number).to.equal(2003);
    }
  });

  let user,
    app,
    tier1,
    auth,
    subscriber1,
    subscriber1Ata,
    subscriber2,
    subscriber2Ata;

  beforeEach(async () => {
    ({ user, app, tier1, auth } = await createGeneralScaffolding());
    let subscriber = await generateFundedKeypair(global.connection);
    subscriber1 = await generateFundedKeypair(global.connection);
    subscriber2 = await generateFundedKeypair(global.connection);

    let subscriberAta = await createAssociatedTokenAccount(
      global.connection,
      subscriber,
      global.mint,
      subscriber.publicKey
    );

    subscriber1Ata = await createAssociatedTokenAccount(
      global.connection,
      subscriber1,
      global.mint,
      subscriber1.publicKey
    );

    subscriber2Ata = await createAssociatedTokenAccount(
      global.connection,
      subscriber2,
      global.mint,
      subscriber2.publicKey
    );

    await mintToChecked(
      global.connection,
      global.testKeypairs.colossal,
      global.mint,
      subscriberAta,
      global.testKeypairs.colossal.publicKey,
      1000 * 10 ** 5,
      5
    );

    await mintToChecked(
      global.connection,
      global.testKeypairs.colossal,
      global.mint,
      subscriber1Ata,
      global.testKeypairs.colossal.publicKey,
      1000 * 10 ** 5,
      5
    );

    await mintToChecked(
      global.connection,
      global.testKeypairs.colossal,
      global.mint,
      subscriber2Ata,
      global.testKeypairs.colossal.publicKey,
      1000 * 10 ** 5,
      5
    );

    await createSubscription(app, tier1, subscriber, subscriberAta);
  });
});
