import { web3 } from "@project-serum/anchor"
import { subscriptionAccountKey } from "../../shared/utils/pda-derivations"
import { getProgram } from "./config/config"
import {
  findReferralAddress,
  findReferralshipAddress,
} from "./utils/pda-derivations"
import { tier as Tier, app as App } from "../../subscription-sdk/src"
import {
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token"
import { SUBSCRIPTION_PROGRAM_ID } from "../../shared/utils/constants"
import { Metaplex } from "@metaplex-foundation/js"

const program = getProgram()

export async function subscribeWithReferral(
  subscriber: web3.PublicKey,
  tier: web3.PublicKey,
  referralAgentNFTMint: web3.PublicKey
) {
  const tierAccount = await Tier.fetch(tier)
  const app = tierAccount.app
  const appAccount = await App.fetch(app)
  const treasury = appAccount.treasury
  const mint = appAccount.mint
  const subscriberAta = getAssociatedTokenAddressSync(mint, subscriber)
  const [subscription] = subscriptionAccountKey(subscriber, app)
  const [referralAddress] = findReferralAddress(
    app,
    subscription,
    referralAgentNFTMint,
    program.programId
  )
  const [referralshipAddress] = findReferralshipAddress(app, program.programId)

  const metaplex = Metaplex.make(program.provider.connection)
  const referralAgentNft = await metaplex
    .nfts()
    .findByMint({ mintAddress: referralAgentNFTMint })
  const referralshipCollectionNft = await metaplex
    .nfts()
    .findByMint({ mintAddress: referralAgentNft.collection.address })

  const instruction = await program.methods
    .subscribeWithReferral()
    .accounts({
      referral: referralAddress,
      referralship: referralshipAddress,
      subscription: subscription,
      subscriber: subscriber,
      app: app,
      treasuryMint: mint,
      referralAgentNftMint: referralAgentNFTMint,
      referralAgentNftMetadata: referralAgentNft.metadataAddress,
      referralAgentsCollectionNftMetadata:
        referralshipCollectionNft.metadataAddress,
      referralshipCollectionNftMint: referralshipCollectionNft.mint.address,
      subscriberTokenAccount: subscriberAta,
      tier: tier,
      appAuthority: appAccount.auth,
      plegeProgram: SUBSCRIPTION_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: web3.SystemProgram.programId,
    })
    .instruction()

  return { instruction }
}
