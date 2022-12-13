import { web3 } from "@project-serum/anchor"
import { convertUser } from "../../../shared/utils/conversions"
import { getProgram } from "../config/config"

const program = getProgram()

export async function fetchUser(userKey: web3.PublicKey) {
  const user = await program.account.userMeta.fetch(userKey)
  return convertUser(user, userKey)
}
