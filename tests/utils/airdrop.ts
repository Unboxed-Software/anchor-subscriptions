import { web3 } from "@project-serum/anchor";

export default async function dispurseFunds(
  connection: web3.Connection,
  recipient: web3.PublicKey,
  solAmount: number
) {
  if (solAmount > 1) {
    throw "Cannot disburse more than 0.5 SOL";
  }

  await connection.confirmTransaction(
    await connection.requestAirdrop(recipient, web3.LAMPORTS_PER_SOL * 0.5)
  );

  // let treasury = global.treasury

  // if (!treasury) {
  //   treasury = web3.Keypair.generate()
  //   global.treasury = treasury
  //   console.log(`Set treasury to ${treasury.publicKey.toBase58()}`)
  // }

  // const balance = await connection.getBalance(treasury.publicKey)
  // // console.log(`Current treasury balance is ${balance} lamports`)
  // if (balance < web3.LAMPORTS_PER_SOL * 0.5) {
  //   // console.log("Airdropping 2 SOL to treasury")
  //   const sig = await connection.requestAirdrop(
  //     treasury.publicKey,
  //     web3.LAMPORTS_PER_SOL * 2
  //   )

  //   const latestBlockHash = await connection.getLatestBlockhash()
  //   await connection.confirmTransaction({
  //     blockhash: latestBlockHash.blockhash,
  //     lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
  //     signature: sig,
  //   })

  //   const newBalance = await connection.getBalance(treasury.publicKey)
  //   // console.log(`New treasury balance is ${newBalance} lamports`)
  // }

  // // console.log(
  // //   `Sending ${solAmount} SOL from treasury ${treasury.publicKey.toBase58()} to recipient ${recipient.toBase58()}`
  // // )
  // await web3.sendAndConfirmTransaction(
  //   connection,
  //   new web3.Transaction().add(
  //     web3.SystemProgram.transfer({
  //       fromPubkey: treasury.publicKey,
  //       toPubkey: recipient,
  //       lamports: solAmount * web3.LAMPORTS_PER_SOL,
  //     })
  //   ),
  //   [treasury]
  // )
}
