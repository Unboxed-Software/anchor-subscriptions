import { BN, web3 } from "@project-serum/anchor"
import generateFundedKeypair from "./keypair"

export function userAccountKeyFromPubkey(
  pubkey: web3.PublicKey
): web3.PublicKey {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("USER_META"), pubkey.toBuffer()],
    global.program.programId
  )[0]
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
  )[0]
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
  )[0]
}

export function subscriptionAccountKey(
  subscriber: web3.PublicKey,
  app: web3.PublicKey
): web3.PublicKey {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("SUBSCRIPTION"), app.toBuffer(), subscriber.toBuffer()],
    global.program.programId
  )[0]
}

export async function createGeneralScaffolding(): Promise<{
  user
  app
  tier1
  tier2
  tier3
  tier4
  auth
}> {
  const auth = await generateFundedKeypair(global.connection)
  const user = userAccountKeyFromPubkey(auth.publicKey)
  const app = appAccountKey(auth.publicKey, 1)
  const tier1 = tierAccountKey(app, 1)
  const tier2 = tierAccountKey(app, 2)
  const tier3 = tierAccountKey(app, 3)
  const tier4 = tierAccountKey(app, 4)

  const transaction = new web3.Transaction()
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
  )

  const sig = await global.connection.sendTransaction(transaction, [auth])

  const latestBlockHash = await global.connection.getLatestBlockhash()

  await global.connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature: sig,
  })

  return {
    auth,
    user,
    app,
    tier1,
    tier2,
    tier3,
    tier4,
  }
}