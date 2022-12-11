import { web3 } from "@project-serum/anchor"
import disburseFunds from "./airdrop"

export default async function generateFundedKeypair(
  connection: web3.Connection
): Promise<web3.Keypair> {
  const keypair = web3.Keypair.generate()
  await disburseFunds(connection, keypair.publicKey, 0.5)
  return keypair
}
