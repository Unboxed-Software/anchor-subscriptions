import { web3 } from "@project-serum/anchor"
import airdropWithConfirmation from "./airdrop"

export default async function generateFundedKeypair(
  connection: web3.Connection
): Promise<web3.Keypair> {
  const keypair = web3.Keypair.generate()
  await airdropWithConfirmation(connection, keypair.publicKey, 2)
  return keypair
}
