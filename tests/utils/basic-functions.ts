import { BN, web3 } from "@project-serum/anchor";
import generateFundedKeypair from "./keypair";

export function userAccountKeyFromPubkey(
  pubkey: web3.PublicKey,
): web3.PublicKey {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("USER_META"), pubkey.toBuffer()],
    global.program.programId,
  )[0];
}

export function findUserMetaAddress(
  pubkey: web3.PublicKey,
) {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("USER_META"), pubkey.toBuffer()],
    global.program.programId,
  );
}

export function appAccountKey(
  auth: web3.PublicKey,
  appId: number,
): web3.PublicKey {
  return web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("APP"),
      auth.toBuffer(),
      new BN(appId).toArrayLike(Buffer, "be", 1),
    ],
    global.program.programId,
  )[0];
}

export function findAppAddress(
  auth: web3.PublicKey,
  appId: number,
  programId: web3.PublicKey,
) {
  return web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("APP"),
      auth.toBuffer(),
      new BN(appId).toArrayLike(Buffer, "be", 1),
    ],
    programId,
  );
}

export function numberToAppId(appId: number): Buffer {
  return new BN(appId).toArrayLike(Buffer, "be", 1);
}

export function tierAccountKey(
  app: web3.PublicKey,
  tierId: number,
): web3.PublicKey {
  return web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("SUBSCRIPTION_TIER"),
      app.toBuffer(),
      new BN(tierId).toArrayLike(Buffer, "be", 1),
    ],
    global.program.programId,
  )[0];
}

export function subscriptionAccountKey(
  subscriber: web3.PublicKey,
  app: web3.PublicKey,
): web3.PublicKey {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("SUBSCRIPTION"), app.toBuffer(), subscriber.toBuffer()],
    global.program.programId,
  )[0];
}

export function findSubscriptionAddress(
  subscriber: web3.PublicKey,
  app: web3.PublicKey,
  programId: web3.PublicKey,
) {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("SUBSCRIPTION"), app.toBuffer(), subscriber.toBuffer()],
    programId,
  );
}

export async function createUserAppTier(): Promise<{ user; app; tier; auth }> {
  const auth = await generateFundedKeypair(global.connection);
  const user = userAccountKeyFromPubkey(auth.publicKey);
  const app = appAccountKey(auth.publicKey, 1);
  const tier = tierAccountKey(app, 1);

  await global.program.methods
    .createUser()
    .accounts({
      auth: auth.publicKey,
    })
    .signers([auth])
    .rpc();

  await global.program.methods
    .createApp(1, "Test App")
    .accounts({
      auth: auth.publicKey,
      treasury: auth.publicKey,
    })
    .signers([auth])
    .rpc();

  await global.program.methods
    .createTier(new BN(1), "Test Tier", new BN(10), { month: {} })
    .accounts({
      app,
      mint: global.mint,
      signer: auth.publicKey,
    })
    .signers([auth])
    .rpc();

  return {
    auth,
    user,
    app,
    tier,
  };
}
