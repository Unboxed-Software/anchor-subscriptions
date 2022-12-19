import * as anchor from "@project-serum/anchor"
import {
    createAssociatedTokenAccount,
    getAccount,
    mintToChecked,
    createMint
} from "@solana/spl-token"
import { BN, Program } from "@project-serum/anchor"
import { Callback, AccountMeta } from "../utils/callback"
import { Plege } from "../../target/types/plege"

anchor.setProvider(anchor.AnchorProvider.env())
const provider = anchor.AnchorProvider.env()
const program = anchor.workspace.Plege as Program<Plege>

const authority = anchor.web3.Keypair.generate()

let tokenMint: anchor.web3.PublicKey = null
let treasuryATA: anchor.web3.PublicKey = null
//const callbackProgramId = new anchor.web3.PublicKey("CcZJCkaMtt4gupyVBw33PFkAZY4qxwbPcnktwjmFh6sQ")
const callbackProgramId = new anchor.web3.PublicKey("5sNX72Q73PcBLCmxScHjUbRAX1F8KPa7wr1fKGnSr9sm")

describe("test callback ix", async () => {

    it("creates user", async () => {
        await safeAirdrop(authority.publicKey, provider.connection)
        await program.methods
            .createUser()
            .accounts({
                auth: authority.publicKey,
            })
            .signers([authority])
            .rpc()
        })

    it("creating app with callback ix", async () => {
        tokenMint = await createMint(
            provider.connection,
            authority,
            authority.publicKey,
            null,
            9
        )

        treasuryATA = await createAssociatedTokenAccount(
            provider.connection,
            authority,
            tokenMint,
            authority.publicKey
        )
        
        const referee = await anchor.web3.Keypair.generate()
        const referralATA = await createAssociatedTokenAccount(
            provider.connection,
            authority,
            tokenMint,
            referee.publicKey
        )
        console.log("Referral address:", referralATA.toBase58())

        await program.methods.createApp(1, "Test App")
            .accounts({
                mint: tokenMint,
                auth: authority.publicKey,
                treasury: treasuryATA,
            })
            .signers([authority])
            .rpc()
    })

    it("Register Callback", async () => {
        const [app, bump] = await anchor.web3.PublicKey.findProgramAddressSync(
            [
                Buffer.from("APP"),
                authority.publicKey.toBuffer(),
                new BN([1]).toArrayLike(Buffer, "be", 1),
            ],
            program.programId
            )

        const accounts: AccountMeta[] = [
            {pubkey: treasuryATA, isSigner: false, isWritable: true}
        ]
        const ixCallback: Callback = {
            programId: callbackProgramId,
            accounts: accounts,
            ixData: null,
            ixName: "initialize"
        }

        const registerTx = await program.methods.registerCallback(1, ixCallback)
        .accounts({
            app: app,
            auth: authority.publicKey
        })
        .signers([authority])
        .rpc()
        await provider.connection.confirmTransaction(registerTx)

        const appPDA = await program.account.app.fetch(app)
        console.log(appPDA)
    })
})


async function safeAirdrop(address: anchor.web3.PublicKey, connection: anchor.web3.Connection) {
    const acctInfo = await connection.getAccountInfo(address, "confirmed")

    if (acctInfo == null || acctInfo.lamports < anchor.web3.LAMPORTS_PER_SOL) {
        let signature = await connection.requestAirdrop(
            address,
            anchor.web3.LAMPORTS_PER_SOL
        )
        await connection.confirmTransaction(signature)
    }
}