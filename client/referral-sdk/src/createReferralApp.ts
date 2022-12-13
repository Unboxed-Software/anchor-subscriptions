import { getProgram } from "./config/config"
import { web3 } from "@project-serum/anchor"
import { appAccountKey } from "../../shared/utils/pda-derivations"
import { SUBSCRIPTION_PROGRAM_ID } from "../../shared/utils/constants"
import { app as App } from "../../subscription-sdk/src"
import {
  findReferralshipAddress,
  findReferralshipTreasuryAccountAddress,
} from "./utils/pda-derivations"
import { Metaplex } from "@metaplex-foundation/js"

const program = getProgram()

export async function createReferralApp(
  name: string,
  auth: web3.PublicKey,
  appId: number,
  treasuryMint: web3.PublicKey,
  referralPercent: number,
  additionalSplits: { address: web3.PublicKey; weight: number }[],
  referralCollectionNFTMint: web3.PublicKey
) {
  const appKey = appAccountKey(auth, appId)

  const metaplex = Metaplex.make(program.provider.connection)
  const collectionNFT = await metaplex
    .nfts()
    .findByMint({ mintAddress: referralCollectionNFTMint })

  const [treasury] = findReferralshipTreasuryAccountAddress(
    appKey,
    treasuryMint,
    program.programId
  )

  let createAppIx, newApp
  try {
    console.log(treasuryMint.toString())
    console.log(treasury.toString())
    const { instruction, app } = await App.create(
      name,
      auth,
      treasuryMint,
      treasury,
      appId
    )

    createAppIx = instruction
    newApp = app
  } catch (error) {
    console.log("WHETE", error)
  }

  const [referralshipAddress] = findReferralshipAddress(
    appKey,
    program.programId
  )

  const enableReferralsIx = await program.methods
    .createReferralship(appId, referralPercent, additionalSplits)
    .accounts({
      referralship: referralshipAddress,
      app: appKey,
      appAuthority: auth,
      treasuryMint,
      referralAgentsCollectionNftMint: referralCollectionNFTMint,
      referralAgentsCollectionNftMetadata: collectionNFT.metadataAddress,
      plegeProgram: SUBSCRIPTION_PROGRAM_ID,
      systemProgram: web3.SystemProgram.programId,
    })
    .instruction()

  return {
    instructions: [createAppIx, enableReferralsIx],
    app: newApp,
  }
}
