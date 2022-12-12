import { AnchorProvider, Idl, Program, web3 } from "@project-serum/anchor"
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet"
import { IDL, Plege } from "../types/idl/plege"

let _program: Program<Plege> | null = null

export function setup(
  connection: web3.Connection,
  programId: web3.PublicKey | null = null
) {
  const wallet = new NodeWallet(web3.Keypair.generate())
  const provider = new AnchorProvider(connection, wallet, {})
  const program = new Program(
    IDL as Idl,
    programId ??
      new web3.PublicKey("4MHQj9xyrt9SDZiCt1awCLxveRYjdvGKTSftks7Uhxjb"),
    provider
  )

  _program = program as unknown as Program<Plege>
}

export function getProgram(): Program<Plege> {
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
  const program = new Program(
    IDL as Idl,
    new web3.PublicKey("4MHQj9xyrt9SDZiCt1awCLxveRYjdvGKTSftks7Uhxjb"),
    provider
  )

  _program = program as unknown as Program<Plege>

  return program as unknown as Program<Plege>
}
