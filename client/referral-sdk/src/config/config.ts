import { AnchorProvider, Idl, Program, web3 } from "@project-serum/anchor"
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet"
import { IDL, Referrals } from "../../../shared/idl/referrals"
import { REFERRAL_PROGRAM_ID } from "../../../shared/utils/constants"

let _program: Program<Referrals> | null = null

export function setup(
  connection: web3.Connection,
  programId: web3.PublicKey | null = null
) {
  const wallet = new NodeWallet(web3.Keypair.generate())
  const provider = new AnchorProvider(connection, wallet, {})
  const program = new Program(
    IDL as Idl,
    programId ?? REFERRAL_PROGRAM_ID,
    provider
  )

  _program = program as unknown as Program<Referrals>
}

export function getProgram(): Program<Referrals> {
  if (_program) {
    return _program
  }

  console.log("NO PROGRAM")
  const wallet = new NodeWallet(web3.Keypair.generate())
  const provider = new AnchorProvider(
    new web3.Connection(web3.clusterApiUrl("devnet")),
    wallet,
    {}
  )
  const program = new Program(IDL as Idl, REFERRAL_PROGRAM_ID, provider)

  _program = program as unknown as Program<Referrals>

  return program as unknown as Program<Referrals>
}
