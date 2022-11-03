import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Plege } from "../target/types/plege";
import {
  createAssociatedTokenAccount,
  createMint,
  getAccount,
  getAssociatedTokenAddressSync,
  mintTo,
  mintToChecked,
} from "@solana/spl-token";
import { BN } from "bn.js";

describe("plege", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Plege as Program<Plege>;
  const connection = program.provider.connection;

  const colossal = anchor.web3.Keypair.generate();
  const subscriber = anchor.web3.Keypair.generate();
  const hacker = anchor.web3.Keypair.generate();

  let mint, colossalAta, subscriberAta, hackerAta;

  let [app] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("app"), colossal.publicKey.toBuffer()],
    program.programId
  );

  let [tier] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("tier"), app.toBuffer()],
    program.programId
  );

  let [subscription] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("subscription"),
      app.toBuffer(),
      tier.toBuffer(),
      subscriber.publicKey.toBuffer(),
    ],
    program.programId
  );

  it("airdrops", async () => {
    await connection.confirmTransaction(
      await connection.requestAirdrop(
        colossal.publicKey,
        anchor.web3.LAMPORTS_PER_SOL
      )
    );

    await connection.confirmTransaction(
      await connection.requestAirdrop(
        subscriber.publicKey,
        anchor.web3.LAMPORTS_PER_SOL
      )
    );

    await connection.confirmTransaction(
      await connection.requestAirdrop(
        hacker.publicKey,
        anchor.web3.LAMPORTS_PER_SOL
      )
    );
  });

  it("create spl token", async () => {
    mint = await createMint(
      connection,
      colossal,
      colossal.publicKey,
      colossal.publicKey,
      5
    );
  });

  it("airdrop tokens", async () => {
    colossalAta = await createAssociatedTokenAccount(
      connection,
      colossal,
      mint,
      colossal.publicKey
    );

    subscriberAta = await createAssociatedTokenAccount(
      connection,
      colossal,
      mint,
      subscriber.publicKey
    );

    hackerAta = await createAssociatedTokenAccount(
      connection,
      colossal,
      mint,
      hacker.publicKey
    );

    await mintToChecked(
      connection,
      colossal,
      mint,
      subscriberAta,
      colossal.publicKey,
      1000 * 10 ** 5,
      5
    );
  });

  it("create app", async () => {
    await program.methods
      .createApp()
      .accounts({
        app,
        signer: colossal.publicKey,
      })
      .signers([colossal])
      .rpc();

    const appPDA = await program.account.app.fetch(app);
    console.log(appPDA);
  });

  it("create tier", async () => {
    await program.methods
      .createTier(new BN(10), new BN(5))
      .accounts({
        app,
        tier,
        mint,
        signer: colossal.publicKey,
      })
      .signers([colossal])
      .rpc();

    const tierPDA = await program.account.tier.fetch(tier);
    console.log({
      price: tierPDA.price.toNumber(),
    });

    const subscriberAtaBalance = await getAccount(connection, subscriberAta);
    console.log({
      balance: subscriberAtaBalance.amount.toString(),
    });
  });

  it("create subscription", async () => {
    await program.methods
      .subscribe(new BN(2))
      .accounts({
        app,
        tier,
        owner: colossalAta,
        subscriber: subscriber.publicKey,
        subscriberAta,
        subscription,
      })
      .signers([subscriber])
      .rpc();

    const subscriptionPDA = await program.account.subscription.fetch(
      subscription
    );
    console.log(subscriptionPDA);

    // wait 6 seconds
    await new Promise((resolve) => setTimeout(resolve, 6000));
  });

  it("resubscribe", async () => {
    await program.methods
      .resubscribe()
      .accounts({
        app,
        tier,
        owner: colossalAta,
        subscriberAta,
        subscription,
      })
      .rpc();

    const subscriptionPDA = await program.account.subscription.fetch(
      subscription
    );
    console.log(subscriptionPDA);
  });
});
