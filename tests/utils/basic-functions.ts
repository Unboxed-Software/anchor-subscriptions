import { BN, web3 } from "@project-serum/anchor";
import generateFundedKeypair from "./keypair";

export function userAccountKeyFromPubkey(
  pubkey: web3.PublicKey
): web3.PublicKey {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("USER_META"), pubkey.toBuffer()],
    global.program.programId
  )[0];
}

export function findUserMetaAddress(pubkey: web3.PublicKey) {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("USER_META"), pubkey.toBuffer()],
    global.program.programId
  );
}

export function appAccountKey(
  auth: web3.PublicKey,
  appId: number
): web3.PublicKey {
  return web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("APP"),
      auth.toBuffer(),
      new BN(appId).toArrayLike(Buffer, "be", 1),
    ],
    global.program.programId
  )[0];
}

export function findAppAddress(
  auth: web3.PublicKey,
  appId: number,
  programId: web3.PublicKey
) {
  return web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("APP"),
      auth.toBuffer(),
      new BN(appId).toArrayLike(Buffer, "be", 1),
    ],
    programId
  );
}

export function numberToAppId(appId: number): Buffer {
  return new BN(appId).toArrayLike(Buffer, "be", 1);
}

export function tierAccountKey(
  app: web3.PublicKey,
  tierId: number
): web3.PublicKey {
  return web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("SUBSCRIPTION_TIER"),
      app.toBuffer(),
      new BN(tierId).toArrayLike(Buffer, "be", 1),
    ],
    global.program.programId
  )[0];
}

export function subscriptionAccountKey(
  subscriber: web3.PublicKey,
  app: web3.PublicKey
): [web3.PublicKey, number] {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("SUBSCRIPTION"), app.toBuffer(), subscriber.toBuffer()],
    global.program.programId
  );
}

export function subscriptionThreadKey(
  subscription: web3.PublicKey
): web3.PublicKey {
  return web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("thread"),
      subscription.toBuffer(),
      Buffer.from("subscriber_thread"),
    ],
    THREAD_PROGRAM
  )[0];
}

export function findSubscriptionAddress(
  subscriber: web3.PublicKey,
  app: web3.PublicKey,
  programId: web3.PublicKey
) {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("SUBSCRIPTION"), app.toBuffer(), subscriber.toBuffer()],
    programId
  );
}

export async function createGeneralScaffolding(): Promise<{
  user;
  app;
  tier1;
  tier2;
  tier3;
  tier4;
  auth;
}> {
  const auth = await generateFundedKeypair(global.connection);
  const user = userAccountKeyFromPubkey(auth.publicKey);
  const app = appAccountKey(auth.publicKey, 1);
  const tier1 = tierAccountKey(app, 1);
  const tier2 = tierAccountKey(app, 2);
  const tier3 = tierAccountKey(app, 3);
  const tier4 = tierAccountKey(app, 4);

  const transaction = new web3.Transaction();
  transaction.add(
    await global.program.methods
      .createUser()
      .accounts({
        auth: auth.publicKey,
      })
      .signers([auth])
      .instruction(),

    await global.program.methods
      .createApp(1, "Test App")
      .accounts({
        auth: auth.publicKey,
        mint: global.mint,
        treasury: auth.publicKey,
      })
      .signers([auth])
      .instruction(),

    await global.program.methods
      .createTier(new BN(1), "Test Tier 1", new BN(10), { month: {} })
      .accounts({
        app,
        signer: auth.publicKey,
      })
      .signers([auth])
      .instruction(),

    await global.program.methods
      .createTier(new BN(2), "Test Tier 2", new BN(10), { month: {} })
      .accounts({
        app,
        signer: auth.publicKey,
      })
      .signers([auth])
      .instruction(),

    await global.program.methods
      .createTier(new BN(3), "Test Tier 3", new BN(10), { month: {} })
      .accounts({
        app,
        signer: auth.publicKey,
      })
      .signers([auth])
      .instruction(),

    await global.program.methods
      .createTier(new BN(4), "Test Tier 4", new BN(10), { month: {} })
      .accounts({
        app,
        signer: auth.publicKey,
      })
      .signers([auth])
      .instruction()
  );

  const sig = await global.connection.sendTransaction(transaction, [auth]);

  const latestBlockHash = await global.connection.getLatestBlockhash();

  await global.connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature: sig,
  });

  return {
    auth,
    user,
    app,
    tier1,
    tier2,
    tier3,
    tier4,
  };
}

export async function createSubscription(
  app: web3.PublicKey,
  tier: web3.PublicKey,
  subscriber: web3.Keypair,
  subscriberAta: web3.PublicKey
): Promise<{
  subscription: any;
  subscriptionThread: any;
  subscriptionBump: number;
}> {
  let [subscription, subscriptionBump] = subscriptionAccountKey(
    subscriber.publicKey,
    app
  );

  let thread = subscriptionThreadKey(subscription);

  await global.program.methods
    .createSubscription()
    .accounts({
      threadProgram: THREAD_PROGRAM,
      subscriptionThread: thread,
      app,
      tier,
      subscriber: subscriber.publicKey,
      subscriberAta,
    })
    .signers([subscriber])
    .rpc();

  return { subscription, subscriptionThread: thread, subscriptionBump };
}

export const THREAD_PROGRAM = new web3.PublicKey(
  "3XXuUFfweXBwFgFfYaejLvZE4cGZiHgKiGfMtdxNzYmv"
);

export async function cancelSubscription(
  app: web3.PublicKey,
  tier: web3.PublicKey,
  subscriber: web3.Keypair,
  subscriberAta: web3.PublicKey
) {
  let [subscription] = subscriptionAccountKey(subscriber.publicKey, app);

  await global.program.methods
    .cancelSubscription()
    .accounts({
      app,
      tier,
      subscription,
      subscriber: subscriber.publicKey,
      subscriberAta,
    })
    .signers([subscriber])
    .rpc();
}

export async function completePayment(
  app: web3.PublicKey,
  tier: web3.PublicKey,
  destination: web3.PublicKey,
  subscriberAta: web3.PublicKey,
  subscription: web3.PublicKey
) {
  await global.program.methods
    .completePayment()
    .accounts({
      app,
      tier,
      destination,
      subscriberAta,
      subscription,
    })
    .rpc();
}
