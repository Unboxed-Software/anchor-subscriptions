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

describe("distributions", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.Distributions as anchor.Program<
    Distributions
  >;

  it("creates a distribution", async () => {
    let authorityKeypair = await generateFundedKeypair(
      anchor.getProvider().connection,
    );
    let createDistributionIx = await program.methods.createDistribution()
      .accounts({}).instruction();
    let createDistributionTx = new Transaction().add(createDistributionIx);
    let sig = await anchor.getProvider().send(createDistributionTx, [
      authorityKeypair,
    ]);

    console.log({ sig });
  });
});
