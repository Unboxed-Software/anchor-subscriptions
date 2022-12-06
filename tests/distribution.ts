import * as anchor from "@project-serum/anchor";
import generateFundedKeypair from "./utils/keypair";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import {
  createAssociatedTokenAccount,
  createMint,
  getAccount,
  mintToChecked,
} from "@solana/spl-token";
import { BN } from "bn.js";
import { expect } from "chai";
import { Distributions } from "../target/types/distributions";
import {
  keypairIdentity,
  Metaplex,
  mockStorage,
} from "@metaplex-foundation/js";

function findRoyaltyCollectedTreasuryAddress(
  treasuryTokenMint: PublicKey,
  nftCollectionMint: PublicKey,
  programId: PublicKey,
) {
  return PublicKey.findProgramAddressSync([
    Buffer.from("royalty_collected_treasury"),
    treasuryTokenMint.toBuffer(),
    nftCollectionMint.toBuffer(),
  ], programId);
}

function findDistributionAddress(
  royaltyCollectedTreasury: PublicKey,
  date: String,
  programId: PublicKey,
) {
  return PublicKey.findProgramAddressSync([
    Buffer.from("distribution"),
    royaltyCollectedTreasury.toBuffer(),
    Buffer.from(date),
  ], programId);
}

describe("distributions", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.Distributions as anchor.Program<
    Distributions
  >;

  it("creates a royalty collected treasury", async () => {
    let authorityKeypair = await generateFundedKeypair(
      anchor.getProvider().connection,
    );
    let thirdPartyKeypair = await generateFundedKeypair(
      anchor.getProvider().connection,
    );
    let anotherKeypair = await generateFundedKeypair(
      anchor.getProvider().connection,
    );

    const metaplex = Metaplex.make(anchor.getProvider().connection)
      .use(keypairIdentity(authorityKeypair))
      .use(mockStorage());

    let treasuryTokenMint = await createMint(
      anchor.getProvider().connection,
      authorityKeypair,
      authorityKeypair.publicKey,
      authorityKeypair.publicKey,
      0,
    );

    let treasuryTokenAccount = await createAssociatedTokenAccount(
      anchor.getProvider().connection,
      authorityKeypair,
      treasuryTokenMint,
      authorityKeypair.publicKey,
    );

    let royaltiesTokenAccount = await createAssociatedTokenAccount(
      anchor.getProvider().connection,
      thirdPartyKeypair,
      treasuryTokenMint,
      thirdPartyKeypair.publicKey,
    );

    let distributionTokenAccount = await createAssociatedTokenAccount(
      anchor.getProvider().connection,
      anotherKeypair,
      treasuryTokenMint,
      anotherKeypair.publicKey,
    );

    let collectionNFT = await metaplex.nfts().create({
      name: "Collection NFT",
      uri: "https://example.com/my-nft",
      symbol: "COLLECTION",
      sellerFeeBasisPoints: 250,
      isCollection: true,
      collectionAuthority: authorityKeypair,
    });

    let [royaltyCollectedTreasuryAddress] = findRoyaltyCollectedTreasuryAddress(
      treasuryTokenMint,
      collectionNFT.mintAddress,
      program.programId,
    );

    let createTreasuryIx = await program.methods
      .createRoyaltyCollectedTreasury().accounts({
        royaltyCollectedTreasury: royaltyCollectedTreasuryAddress,
        authority: authorityKeypair.publicKey,
        mint: treasuryTokenMint,
        royaltiesTokenAccount,
        treasuryTokenAccount,
        shareholderNftCollectionMint: collectionNFT.mintAddress,
        shareholderNftCollectionMetadata: collectionNFT.metadataAddress,
        systemProgram: SystemProgram.programId,
      }).instruction();

    let createTreasuryTx = new Transaction().add(createTreasuryIx);

    await anchor.getProvider().sendAndConfirm(
      createTreasuryTx,
      [authorityKeypair],
    );

    // create a distribution account.
    let date = new Date().toISOString();
    let [distributionAddress] = findDistributionAddress(
      royaltyCollectedTreasuryAddress,
      date,
      program.programId,
    );

    let createDistributionIx = await program.methods.createDistribution(
      date,
    ).accounts({
      distribution: distributionAddress,
      treasury: royaltyCollectedTreasuryAddress,
      treasuryAuthority: authorityKeypair.publicKey,
      distributionTokenAccount,
      royaltiesTokenAccount,
      shareholderNftCollectionMetadata: collectionNFT.metadataAddress,
      shareholderNftCollectionMint: collectionNFT.mintAddress,
      systemProgram: SystemProgram.programId,
    }).instruction();

    let createDistributionTx = new Transaction().add(createDistributionIx);

    await anchor.getProvider().sendAndConfirm(createDistributionTx, [
      authorityKeypair,
    ], { skipPreflight: true });
  });

  it("creates a distribution", async () => {
    let authorityKeypair = await generateFundedKeypair(
      anchor.getProvider().connection,
    );

    // let date = new Date();

    // let createDistributionIx = await program.methods.createDistribution(
    //   date.toISOString(),
    // )
    //   .accounts({
    //     authority: authorityKeypair.publicKey,
    //   }).instruction();

    // let createDistributionTx = new Transaction().add(createDistributionIx);
    // let sig = await anchor.getProvider().send(createDistributionTx, [
    //   authorityKeypair,
    // ]);

    // console.log({ sig });
  });
});
