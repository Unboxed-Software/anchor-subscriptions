import { web3, BN } from "@project-serum/anchor"

export type AccountMeta = {
    pubkey: web3.PublicKey,
    isSigner: boolean,
    isWritable: boolean
}

export type Callback = {
    programId: web3.PublicKey,
    accounts: AccountMeta[],
    //ixData: Buffer
    ixData: number,
    ixName: string
}