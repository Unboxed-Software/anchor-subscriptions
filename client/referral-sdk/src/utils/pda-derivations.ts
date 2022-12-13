import { web3 } from "@project-serum/anchor"

export function findReferralshipAddress(
  app: web3.PublicKey,
  programId: web3.PublicKey
): [web3.PublicKey, number] {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("REFERRALSHIP"), app.toBuffer()],
    programId
  )
}

export function findReferralshipTreasuryAccountAddress(
  app: web3.PublicKey,
  treasuryMint: web3.PublicKey,
  programId: web3.PublicKey
) {
  return web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("REFERRALSHIP"),
      app.toBuffer(),
      Buffer.from("TREASURY"),
      treasuryMint.toBuffer(),
    ],
    programId
  )
}

export function findReferralAddress(
  app: web3.PublicKey,
  subscription: web3.PublicKey,
  referralAgentNFTMint: web3.PublicKey,
  programId: web3.PublicKey
) {
  return web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("REFERRAL"),
      app.toBuffer(),
      subscription.toBuffer(),
      referralAgentNFTMint.toBuffer(),
    ],
    programId
  )
}
