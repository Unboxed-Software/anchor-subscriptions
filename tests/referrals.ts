import { assert } from "chai";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import { Referrals } from "../target/types/referrals";
import { Plege } from "../target/types/plege";
import generateFundedKeypair from "./utils/keypair";
import {
  findAppAddress,
  numberToAppId,
  userAccountKeyFromPubkey,
} from "./utils/basic-functions";
import { createAssociatedTokenAccount, createMint } from "@solana/spl-token";
import {
  keypairIdentity,
  Metaplex,
  mockStorage,
} from "@metaplex-foundation/js";

function findReferralshipAddress(
  app: PublicKey,
  programId: PublicKey,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([
    Buffer.from("REFERRALSHIP"),
    app.toBuffer(),
  ], programId);
}

describe("referrals", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const referralProgram = anchor.workspace.Referrals as anchor.Program<
    Referrals
  >;
  const subscriptionProgram = anchor.workspace.Plege as anchor.Program<
    Plege
  >;

  it("creates a referralship", async () => {
    // create app authority
    const appAuthorityKeypair = await generateFundedKeypair(
      anchor.getProvider().connection,
    );
    const referralAgentKeypair = await generateFundedKeypair(
      anchor.getProvider().connection,
    );
    const subscriber = await generateFundedKeypair(
      anchor.getProvider().connection,
    );
    const treasuryAuthorityKeypair = await generateFundedKeypair(
      anchor.getProvider().connection,
    );

    // create a token mint
    let treasuryMint = await createMint(
      anchor.getProvider().connection,
      treasuryAuthorityKeypair,
      treasuryAuthorityKeypair.publicKey,
      treasuryAuthorityKeypair.publicKey,
      0,
    );

    let treasuryTokenAccount = await createAssociatedTokenAccount(
      anchor.getProvider().connection,
      treasuryAuthorityKeypair,
      treasuryMint,
      treasuryAuthorityKeypair.publicKey,
    );

    const metaplex = Metaplex.make(anchor.getProvider().connection).use(
      keypairIdentity(treasuryAuthorityKeypair),
    ).use(mockStorage());

    let userMetaAddress = userAccountKeyFromPubkey(
      appAuthorityKeypair.publicKey,
    );

    // create user meta -- required by the subscription program's createApp instruction
    const createUserMetaIx = await subscriptionProgram.methods.createUser()
      .accounts({
        userMeta: userMetaAddress,
        auth: appAuthorityKeypair.publicKey,
        systemProgram: SystemProgram.programId,
      }).instruction();

    // create an app
    let appId = 1;
    let formattedAppId = numberToAppId(appId);
    let [appAddress] = findAppAddress(
      appAuthorityKeypair.publicKey,
      appId,
      subscriptionProgram.programId,
    );

    const createAppIx = await subscriptionProgram.methods.createApp(
      appId,
      "nil studios super app",
    )
      .accounts(
        {
          app: appAddress,
          auth: appAuthorityKeypair.publicKey,
          userMeta: userMetaAddress,
          treasury: treasuryTokenAccount,
          systemProgram: SystemProgram.programId,
        },
      ).instruction();

    let createUserAndAppTx = new Transaction()
      .add(createUserMetaIx)
      .add(createAppIx);

    await anchor.getProvider().sendAndConfirm(createUserAndAppTx, [
      appAuthorityKeypair,
    ], { skipPreflight: true });

    let [referralshipAddress] = findReferralshipAddress(
      appAddress,
      referralProgram.programId,
    );

    let referralAgentsCollectionNFT = await metaplex.nfts().create({
      name: "Referral Agents",
      uri: "https://example.com/nil",
      symbol: "REF_AG",
      sellerFeeBasisPoints: 0,
      isCollection: true,
      collectionAuthority: appAuthorityKeypair,
    });

    // create a referralship account
    let createReferralshipIx = await referralProgram.methods
      .createReferralship(appId, 90, [{
        address: Keypair.generate().publicKey,
        weight: 10,
      }]).accounts({
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
      }).instruction();

    let createReferralshipTx = new Transaction().add(createReferralshipIx);

    await anchor.getProvider().sendAndConfirm(createReferralshipTx, [
      appAuthorityKeypair,
    ], { skipPreflight: true });

    let referralship = await referralProgram.account.referralship.fetch(
      referralshipAddress,
    );

    console.log(referralship);
  });
});
