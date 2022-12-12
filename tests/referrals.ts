import { assert } from "chai"
import {
  AccountMeta,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js"
import * as anchor from "@project-serum/anchor"
import { Referrals } from "../target/types/referrals"
import { Plege } from "../target/types/plege"
import generateFundedKeypair from "./utils/keypair"
import {
  findAppAddress,
  findSubscriptionAddress,
  numberToAppId,
  tierAccountKey,
  userAccountKeyFromPubkey,
} from "./utils/basic-functions"
import {
  createAssociatedTokenAccount,
  createMint,
  mintTo,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token"
import { keypairIdentity, Metaplex, mockStorage } from "@metaplex-foundation/js"

function findReferralshipAddress(
  app: PublicKey,
  programId: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("REFERRALSHIP"), app.toBuffer()],
    programId
  )
}

function findReferralAddress(
  app: PublicKey,
  subscription: PublicKey,
  referralAgentNFTMint: PublicKey,
  programId: PublicKey
) {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("REFERRAL"),
      app.toBuffer(),
      subscription.toBuffer(),
      referralAgentNFTMint.toBuffer(),
    ],
    programId
  )
}

function findReferralshipTreasuryAccountAddress(
  app: PublicKey,
  treasuryMint: PublicKey,
  programId: PublicKey
) {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("REFERRALSHIP"),
      app.toBuffer(),
      Buffer.from("TREASURY"),
      treasuryMint.toBuffer(),
    ],
    programId
  )
}

describe("referrals", () => {
  anchor.setProvider(anchor.AnchorProvider.env())
  const referralProgram = anchor.workspace
    .Referrals as anchor.Program<Referrals>
  const subscriptionProgram = anchor.workspace.Plege as anchor.Program<Plege>

  it("creates a referralship", async () => {
    const { connection } = anchor.getProvider()
    const appAuthorityKeypair = await generateFundedKeypair(connection)
    const referralAgentKeypair = await generateFundedKeypair(connection)
    const subscriberKeypair = await generateFundedKeypair(connection)
    const stakeholder1Keypair = await generateFundedKeypair(connection)
    const stakeholder2Keypair = await generateFundedKeypair(connection)
    const treasuryAuthorityKeypair = await generateFundedKeypair(connection)

    // create a token mint
    const treasuryMint = await createMint(
      anchor.getProvider().connection,
      treasuryAuthorityKeypair,
      treasuryAuthorityKeypair.publicKey,
      treasuryAuthorityKeypair.publicKey,
      0
    )

    const referralAgentTokenAccount = await createAssociatedTokenAccount(
      connection,
      referralAgentKeypair,
      treasuryMint,
      referralAgentKeypair.publicKey
    )

    const subscriberTokenAccount = await createAssociatedTokenAccount(
      connection,
      subscriberKeypair,
      treasuryMint,
      subscriberKeypair.publicKey
    )

    const stakeholder1TokenAccount = await createAssociatedTokenAccount(
      connection,
      stakeholder1Keypair,
      treasuryMint,
      stakeholder1Keypair.publicKey
    )

    const stakeholder2TokenAccount = await createAssociatedTokenAccount(
      connection,
      stakeholder1Keypair,
      treasuryMint,
      stakeholder2Keypair.publicKey
    )

    const metaplex = Metaplex.make(anchor.getProvider().connection)
      .use(keypairIdentity(appAuthorityKeypair))
      .use(mockStorage())

    const userMetaAddress = userAccountKeyFromPubkey(
      appAuthorityKeypair.publicKey
    )

    // create user meta -- required by the subscription program's createApp instruction
    const createUserMetaIx = await subscriptionProgram.methods
      .createUser()
      .accounts({
        userMeta: userMetaAddress,
        auth: appAuthorityKeypair.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .instruction()

    // create an app
    const appId = 1
    const [appAddress] = findAppAddress(
      appAuthorityKeypair.publicKey,
      appId,
      subscriptionProgram.programId
    )

    const [referralshipTreasuryAddress] =
      findReferralshipTreasuryAccountAddress(
        appAddress,
        treasuryMint,
        referralProgram.programId
      )

    const createAppIx = await subscriptionProgram.methods
      .createApp(appId, "super app")
      .accounts({
        app: appAddress,
        auth: appAuthorityKeypair.publicKey,
        userMeta: userMetaAddress,
        treasury: referralshipTreasuryAddress,
        systemProgram: SystemProgram.programId,
      })
      .instruction()

    const tierArgs = {
      name: "basic",
      id: 1,
      price: 100,
      interval: { month: {} }, // monthly
    }
    const tierAddress = tierAccountKey(appAddress, 1)

    const createTierIx = await subscriptionProgram.methods
      .createTier(
        tierArgs.id,
        tierArgs.name,
        new anchor.BN(tierArgs.price),
        tierArgs.interval
      )
      .accounts({
        tier: tierAddress,
        app: appAddress,
        mint: treasuryMint,
        signer: appAuthorityKeypair.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .instruction()

    const createUserAndAppTx = new Transaction()
      .add(createUserMetaIx)
      .add(createAppIx)
      .add(createTierIx)

    await anchor
      .getProvider()
      .sendAndConfirm(createUserAndAppTx, [appAuthorityKeypair], {
        skipPreflight: true,
      })

    const [referralshipAddress] = findReferralshipAddress(
      appAddress,
      referralProgram.programId
    )

    const referralAgentsCollectionNFT = await metaplex.nfts().create({
      name: "Referral Agents",
      uri: "https://example.com/nil",
      symbol: "REF_AGENTS",
      sellerFeeBasisPoints: 0,
      isCollection: true,
      collectionAuthority: appAuthorityKeypair,
    })

    const referralAgentNFT = await metaplex.nfts().create({
      name: "Referral Agent",
      uri: "https://example.com/nil/agent",
      symbol: "REF_AGENT",
      sellerFeeBasisPoints: 0,
      collection: referralAgentsCollectionNFT.mintAddress,
      collectionAuthority: appAuthorityKeypair,
      tokenOwner: referralAgentKeypair.publicKey,
    })

    // create a referralship account
    const createReferralshipIx = await referralProgram.methods
      .createReferralship(appId, 80, [
        { address: stakeholder1TokenAccount, weight: 10 },
        { address: stakeholder2TokenAccount, weight: 10 },
      ])
      .accounts({
        referralship: referralshipAddress,
        app: appAddress,
        appAuthority: appAuthorityKeypair.publicKey,
        treasuryMint: treasuryMint,
        referralAgentsCollectionNftMint:
          referralAgentsCollectionNFT.mintAddress,
        referralAgentsCollectionNftMetadata:
          referralAgentsCollectionNFT.metadataAddress,
        plegeProgram: subscriptionProgram.programId,
        systemProgram: SystemProgram.programId,
      })
      .instruction()

    const createReferralshipTx = new Transaction().add(createReferralshipIx)

    await anchor
      .getProvider()
      .sendAndConfirm(createReferralshipTx, [appAuthorityKeypair], {
        skipPreflight: true,
      })

    const referralship = await referralProgram.account.referralship.fetch(
      referralshipAddress
    )

    assert.equal(referralship.appId, appId)
    assert.equal(referralship.app.toBase58(), appAddress.toBase58())
    assert.equal(referralship.treasuryMint.toBase58(), treasuryMint.toBase58())

    const [subscriptionAddress] = findSubscriptionAddress(
      subscriberKeypair.publicKey,
      appAddress,
      subscriptionProgram.programId
    )

    const [referralAddress] = findReferralAddress(
      appAddress,
      subscriptionAddress,
      referralAgentNFT.mintAddress,
      referralProgram.programId
    )

    let treasuryInitialBalance = 100_000_000
    let subscriberInitialBalance = 100_000_000

    await mintTo(
      connection,
      subscriberKeypair,
      treasuryMint,
      subscriberTokenAccount,
      treasuryAuthorityKeypair,
      subscriberInitialBalance
    )

    await mintTo(
      connection,
      treasuryAuthorityKeypair,
      treasuryMint,
      referralshipTreasuryAddress,
      treasuryAuthorityKeypair,
      treasuryInitialBalance
    )

    const subscribeWithReferralIx = await referralProgram.methods
      .subscribeWithReferral(tierArgs.id)
      .accounts({
        referral: referralAddress,
        referralship: referralshipAddress,
        subscription: subscriptionAddress,
        subscriber: subscriberKeypair.publicKey,
        app: appAddress,
        treasuryMint: treasuryMint,
        referralAgentNftMint: referralAgentNFT.mintAddress,
        referralAgentNftMetadata: referralAgentNFT.metadataAddress,
        referralAgentsCollectionNftMetadata:
          referralAgentsCollectionNFT.metadataAddress,
        referralshipCollectionNftMint: referralAgentsCollectionNFT.mintAddress,
        subscriberTokenAccount,
        tier: tierAddress,
        appAuthority: appAuthorityKeypair.publicKey,
        plegeProgram: subscriptionProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .instruction()

    const subscribeWithReferralTx = new Transaction().add(
      subscribeWithReferralIx
    )

    await anchor
      .getProvider()
      .sendAndConfirm(subscribeWithReferralTx, [subscriberKeypair], {
        skipPreflight: true,
      })

    let ixAccounts = {
      app: appAddress,
      subscription: subscriptionAddress,
      tier: tierAddress,
      subscriber: subscriberKeypair.publicKey,
      referral: referralAddress,
      referralship: referralshipAddress,
      referralAgentNftMint: referralAgentNFT.mintAddress,
      referralAgentNftMetadata: referralAgentNFT.metadataAddress,
      referralAgentNftTokenAccount: referralAgentNFT.tokenAddress,
      referralAgentTreasuryTokenAccount: referralAgentTokenAccount,
      referralAgentsCollectionNftMint: referralAgentsCollectionNFT.mintAddress,
      referralAgentsCollectionNftMetadata:
        referralAgentsCollectionNFT.metadataAddress,
      treasuryMint: treasuryMint,
      treasuryTokenAccount: referralshipTreasuryAddress,
      treasuryAuthority: treasuryAuthorityKeypair.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
    }

    for (let account in ixAccounts) {
      console.log(account, ixAccounts[account].toBase58())
    }

    // simulate a call from the subscription program to split payments
    let splitIx = await referralProgram.methods
      .splitPayment(tierArgs.id)
      .accounts({
        app: appAddress,
        appAuthority: appAuthorityKeypair.publicKey,
        subscription: subscriptionAddress,
        tier: tierAddress,
        subscriber: subscriberKeypair.publicKey,
        referral: referralAddress,
        referralship: referralshipAddress,
        referralAgentNftMint: referralAgentNFT.mintAddress,
        referralAgentNftMetadata: referralAgentNFT.metadataAddress,
        referralAgentNftTokenAccount: referralAgentNFT.tokenAddress,
        referralAgentTreasuryTokenAccount: referralAgentTokenAccount,
        referralAgentsCollectionNftMint:
          referralAgentsCollectionNFT.mintAddress,
        referralAgentsCollectionNftMetadata:
          referralAgentsCollectionNFT.metadataAddress,
        treasuryMint: treasuryMint,
        treasuryTokenAccount: referralshipTreasuryAddress,
        plegeProgram: subscriptionProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .remainingAccounts([
        {
          pubkey: stakeholder1TokenAccount,
          isWritable: true,
          isSigner: false,
        },
        {
          pubkey: stakeholder2TokenAccount,
          isWritable: true,
          isSigner: false,
        },
      ])
      .instruction()

    let splitTx = new Transaction().add(splitIx)
    await anchor.getProvider().sendAndConfirm(splitTx, [], {
      skipPreflight: true,
    })
  })
})
