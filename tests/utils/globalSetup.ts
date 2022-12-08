import { Program, web3 } from "@project-serum/anchor"
import * as anchor from "@project-serum/anchor"
import { Plege } from "../../target/types/plege"
import generateFundedKeypair from "./keypair"
import { createMint } from "@solana/spl-token"

var connection: web3.Connection
var program
var connection: web3.Connection

exports.mochaGlobalSetup = async function () {
  anchor.setProvider(anchor.AnchorProvider.env())
  program = anchor.workspace.Plege as Program<Plege>
  connection = program.provider.connection
  global.program = program
  global.connection = connection
  await setTestKeypairs()

  global.mint = await createMint(
    global.connection,
    global.testKeypairs.colossal,
    global.testKeypairs.colossal.publicKey,
    global.testKeypairs.colossal.publicKey,
    5
  )
}

async function setTestKeypairs() {
  global.testKeypairs = {
    colossal: await generateFundedKeypair(connection),
    subscriber: await generateFundedKeypair(connection), //keypairs[1],
    hacker: await generateFundedKeypair(connection), //keypairs[2],
  }
}
