import { web3 } from "@project-serum/anchor"

export default async function airdropWithConfirmation(
  connection: web3.Connection,
  recipient: web3.PublicKey,
  solAmount: number
) {
  const sig = await connection.requestAirdrop(
    recipient,
    web3.LAMPORTS_PER_SOL * solAmount
  )
  const latestBlockHash = await connection.getLatestBlockhash()
  await connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature: sig,
  })
}
