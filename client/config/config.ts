import { AnchorProvider, Idl, Program, web3 } from "@project-serum/anchor"
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet"
import { IDL } from "../types/idl/plege"

export let program: Program

export function config(connection: web3.Connection) {
  const wallet = new NodeWallet(web3.Keypair.generate())
  const provider = new AnchorProvider(connection, wallet, {})
  program = new Program(
    IDL as Idl,
    new web3.PublicKey("2KiKoVaRF894axqfgEbuQhgHmNWbMY1fgC1NBEqQNu4c"),
    provider
  )
}

export function getProgram(): Program {
  if (!program) {
    throw "No Program"
  }

  return program
}
