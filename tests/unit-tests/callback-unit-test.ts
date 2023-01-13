import * as anchor from "@project-serum/anchor"
import {
    createAssociatedTokenAccount,
    getAccount,
    mintToChecked,
    createMint,
    mintTo,
    programSupportsExtensions,
    TOKEN_PROGRAM_ID,
    getOrCreateAssociatedTokenAccount,
    getAssociatedTokenAddress
} from "@solana/spl-token"
import { BN, Program } from "@project-serum/anchor"
import { Callback, AccountMeta } from "../utils/callback"
import { Plege } from "../../target/types/plege"
import { Referrals } from "../../target/types/referrals"
import generateFundedKeypair from "../utils/keypair"
import {
    completePayment,
    createSubscription,
    THREAD_PROGRAM,
    subscriptionThreadKey
} from "../utils/basic-functions"
import { Account, keypairIdentity, Metaplex, mockStorage, token } from "@metaplex-foundation/js"
import { PROGRAM_ADDRESS as METADATA_PROGRAM_ID } from '@metaplex-foundation/mpl-token-metadata'
import { test } from "mocha"

anchor.setProvider(anchor.AnchorProvider.env())
const provider = anchor.AnchorProvider.env()
const program = anchor.workspace.Plege as Program<Plege>
const referralProgram = anchor.workspace.Referrals as Program<Referrals>


const authority = anchor.web3.Keypair.generate()
const subscriber = anchor.web3.Keypair.generate()
const referee = anchor.web3.Keypair.generate()

const metaplex = Metaplex.make(anchor.getProvider().connection)
    .use(keypairIdentity(authority))
    .use(mockStorage())

let tokenMint: anchor.web3.PublicKey = null
let treasuryATA: anchor.web3.PublicKey = null
let subscriberAta: anchor.web3.PublicKey = null
let subscriptionPda: anchor.web3.PublicKey = null
let destinationAta: anchor.web3.PublicKey = null
let refereeAta: anchor.web3.PublicKey = null
let referralTreasuryTokenAcct: anchor.web3.PublicKey = null

let referralAgentsCollectionNFT = null
let referralAgentNFT= null

const callbackProgramId = new anchor.web3.PublicKey("2Mv4SLASEdH47uUB73n4Ft13ufzJoS2jomis27kqfLyW")
//const callbackProgramId = new anchor.web3.PublicKey("5sNX72Q73PcBLCmxScHjUbRAX1F8KPa7wr1fKGnSr9sm")

describe("test callback ix", async () => {
    const [app, bump] = await anchor.web3.PublicKey.findProgramAddressSync(
        [
            Buffer.from("APP"),
            authority.publicKey.toBuffer(),
            new BN([1]).toArrayLike(Buffer, "be", 1),
        ],
        program.programId
        )
    
    const [tier, tierBump] = await anchor.web3.PublicKey.findProgramAddressSync(
        [
            Buffer.from("SUBSCRIPTION_TIER"),
            app.toBuffer(),
            new BN([1]).toArrayLike(Buffer, "be", 1),
        ],
        program.programId
        )

    const [referralship, referralshipBump] = await anchor.web3.PublicKey.findProgramAddressSync(
        [
            Buffer.from("REFERRALSHIP"),
            app.toBuffer()
        ],
        referralProgram.programId
        )

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

    it("creating app", async () => {
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

        refereeAta = await createAssociatedTokenAccount(
            provider.connection,
            authority,
            tokenMint,
            referee.publicKey
        )

        const destination = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            authority,
            tokenMint,
            treasuryATA,
            true
        )
        destinationAta = destination.address

        const tx = await program.methods.createApp(1, "Test App")
            .accounts({
                mint: tokenMint,
                auth: authority.publicKey,
                treasury: treasuryATA,
            })
            .signers([authority])
            .rpc()
    })

    it("create referralship and register callback", async () => {
        const referralAgentKeypair = await generateFundedKeypair(provider.connection)
        referralTreasuryTokenAcct = await getAssociatedTokenAddress(
            tokenMint,
            referralship,
            true
            )

        referralAgentsCollectionNFT = await metaplex.nfts().create({
                name: "Referral Agents",
                uri: "https://example.com/nil",
                symbol: "REF_AGENTS",
                sellerFeeBasisPoints: 0,
                isCollection: true,
                collectionAuthority: authority,
            })
        referralAgentNFT = await metaplex.nfts().create({
            name: "Referral Agent",
            uri: "https://example.com/nil/agent",
            symbol: "REF_AGENT",
            sellerFeeBasisPoints: 0,
            collection: referralAgentsCollectionNFT.mintAddress,
            collectionAuthority: authority,
            tokenOwner: referralAgentKeypair.publicKey,
        })

        await referralProgram.methods.createReferralship(1, 10, [
            {address: refereeAta, weight: 90}
        ])
        .accounts({
            referralship: referralship,
            app: app,
            treasuryMint: tokenMint,
            referralAgentsCollectionNftMint: referralAgentsCollectionNFT.mintAddress,
            referralAgentsCollectionNftMetadata: referralAgentsCollectionNFT.metadataAddress,
            appAuthority: authority.publicKey,
            plegeProgram: program.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: anchor.web3.SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY
        })
        .signers([authority])
        .rpc()
    
        // static programs needed for split_payment ix
        const accounts: AccountMeta[] = [
            {pubkey: app, isSigner: false, isWritable: false},
            {pubkey: authority.publicKey, isSigner: false, isWritable: false},
            // subscription, will be dynamic
            // subscriber, will be dynamic
            // tier, will be dynamic
            // referral, will be dynamic
            {pubkey: referralship, isSigner: false, isWritable: false},
            {pubkey: referralAgentNFT.mintAddress, isSigner: false, isWritable: false},
            {pubkey: referralAgentNFT.metadataAddress, isSigner: false, isWritable: false},
            {pubkey: referralAgentNFT.tokenAddress, isSigner: false, isWritable: false},
            {pubkey: referralTreasuryTokenAcct, isSigner: false, isWritable: false},
            {pubkey: referralAgentsCollectionNFT.mintAddress, isSigner: false, isWritable: false},
            {pubkey: referralAgentsCollectionNFT.metadataAddress, isSigner: false, isWritable: false},
            {pubkey: tokenMint, isSigner: false, isWritable: false},
            {pubkey: referralTreasuryTokenAcct, isSigner: false, isWritable: false},
            {pubkey: program.programId, isSigner: false, isWritable: false},
            {pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false}
        ]

        for (let i =0; i < accounts.length; i++) {
            console.log(accounts[i].pubkey.toBase58())
        }

        const ixCallback: Callback = {
            programId: callbackProgramId,
            accounts: accounts,
            ixData: null,
            ixName: "split_payment"
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
        console.log(appPDA.callback.accounts)
        console.log("Callback registered for program: ", callbackProgramId)
    })
    it("create tier", async () => {
        await program.methods
        .createTier(1, "Test Tier", new BN(10), { month: {} })
        .accounts({
            tier,
            app,
            signer: authority.publicKey
        })
        .signers([authority])
        .rpc()
    })

    it("create subscription", async () => {
        const [subscription, subscriptionBump] = await anchor.web3.PublicKey.findProgramAddressSync(
            [
                Buffer.from("SUBSCRIPTION"),
                app.toBuffer(),
                subscriber.publicKey.toBuffer(),
            ],
            program.programId
            )
        subscriptionPda = subscription

        subscriberAta = await createAssociatedTokenAccount(
                    provider.connection,
                    authority,
                    tokenMint,
                    subscriber.publicKey
                )
        await mintTo(
                provider.connection,
                authority,
                tokenMint,
                subscriberAta,
                authority,
                100 * anchor.web3.LAMPORTS_PER_SOL
                )
        
        const [subThread, threadBump] = await anchor.web3.PublicKey.findProgramAddressSync(
            [
                Buffer.from("thread"),
                subscription.toBuffer(),
                Buffer.from("subscriber_thread"),
            ],
            THREAD_PROGRAM
            )

        await safeAirdrop(subscriber.publicKey, provider.connection)
        await program.methods.createSubscription()
        .accounts({
            app: app,
            tier: tier,
            subscription: subscription,
            subscriber: subscriber.publicKey,
            subscriberAta: subscriberAta,
            subscriptionThread: subThread,
            threadProgram: THREAD_PROGRAM,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: anchor.web3.SystemProgram.programId
        })
        .signers([subscriber])
        .rpc()
    })
    
    it("completes payment", async () => {
        let thread = subscriptionThreadKey(subscriptionPda)

        let remainingAccounts: AccountMeta[] = [
            {pubkey: subscriber.publicKey, isSigner: false, isWritable: false},
            {pubkey: referralProgram.programId, isSigner: false, isWritable:false},
            {pubkey: authority.publicKey, isSigner: false, isWritable: false},
            {pubkey: referralship, isSigner: false, isWritable: false},
            {pubkey: referralAgentNFT.mintAddress, isSigner: false, isWritable: false},
            {pubkey: referralAgentNFT.metadataAddress, isSigner: false, isWritable: false},
            {pubkey: referralAgentNFT.tokenAddress, isSigner: false, isWritable: false},
            {pubkey: referralTreasuryTokenAcct, isSigner: false, isWritable: false},
            {pubkey: referralAgentsCollectionNFT.mintAddress, isSigner: false, isWritable: false},
            {pubkey: referralAgentsCollectionNFT.metadataAddress, isSigner: false, isWritable: false},
            {pubkey: tokenMint, isSigner: false, isWritable: false},
            {pubkey: treasuryATA, isSigner: false, isWritable: false},
            {pubkey: program.programId, isSigner: false, isWritable: false},
            {pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false},
            {pubkey: callbackProgramId, isSigner: false, isWritable: false}
        ]
        for (let i = 0; i < remainingAccounts.length; i++) {
            console.log(remainingAccounts[i].pubkey.toBase58())
        }

        await program.methods
        .completePayment()
        .accounts({
            app,
            tier,
            destination: destinationAta,
            subscriberAta,
            subscription: subscriptionPda,
            subscriptionThread: thread,
        })
        .remainingAccounts([
            {pubkey: subscriber.publicKey, isSigner: false, isWritable: false},
            {pubkey: referralProgram.programId, isSigner: false, isWritable:false},
            {pubkey: authority.publicKey, isSigner: false, isWritable: false},
            {pubkey: referralship, isSigner: false, isWritable: false},
            {pubkey: referralAgentNFT.mintAddress, isSigner: false, isWritable: false},
            {pubkey: referralAgentNFT.metadataAddress, isSigner: false, isWritable: false},
            {pubkey: referralAgentNFT.tokenAddress, isSigner: false, isWritable: false},
            {pubkey: referralTreasuryTokenAcct, isSigner: false, isWritable: false},
            {pubkey: referralAgentsCollectionNFT.mintAddress, isSigner: false, isWritable: false},
            {pubkey: referralAgentsCollectionNFT.metadataAddress, isSigner: false, isWritable: false},
            {pubkey: tokenMint, isSigner: false, isWritable: false},
            {pubkey: treasuryATA, isSigner: false, isWritable: false},
            {pubkey: program.programId, isSigner: false, isWritable: false},
            {pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false},
            {pubkey: callbackProgramId, isSigner: false, isWritable: false},
        ])
        .rpc()
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