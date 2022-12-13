import { web3 } from "@project-serum/anchor"
import { convertApp } from "../../../shared/utils/conversions"
import { getProgram } from "../config/config"

const program = getProgram()

export async function fetchApp(appKey: web3.PublicKey) {
  const app = await program.account.app.fetch(appKey)
  return convertApp(app, appKey)
}
