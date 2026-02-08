import { type NextRequest, NextResponse } from "next/server"
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js"

const connection = new Connection(
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com",
  "confirmed",
)

export async function POST(request: NextRequest) {
  try {
    const { type, fromWallet, toWallet, amount, nftMint } = await request.json()

    console.log("[v0] [SERVER] Creating transaction:")
    console.log("[v0] [SERVER] - Type:", type)
    console.log("[v0] [SERVER] - From:", fromWallet)
    console.log("[v0] [SERVER] - To:", toWallet)
    console.log("[v0] [SERVER] - Amount:", amount, "SOL")

    const fromPubkey = new PublicKey(fromWallet)
    const toPubkey = new PublicKey(toWallet)

    // Get recent blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()

    const transaction = new Transaction({
      feePayer: fromPubkey,
      blockhash,
      lastValidBlockHeight,
    })

    if (type === "payment") {
      // Create SOL payment instruction
      const lamports = Math.floor(amount * LAMPORTS_PER_SOL)
      console.log("[v0] [SERVER] Creating payment instruction for", lamports, "lamports")
      transaction.add(
        SystemProgram.transfer({
          fromPubkey,
          toPubkey,
          lamports,
        }),
      )
    } else if (type === "nft-transfer") {
      // For NFT transfers, we'll use Metaplex in production
      // For now, return a placeholder transaction structure
      // In production, you'd use @metaplex-foundation/js to create the transfer instruction
    }

    // Serialize transaction
    const serializedTransaction = transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    })

    console.log("[v0] [SERVER] Transaction created successfully")

    return NextResponse.json({
      transaction: Buffer.from(serializedTransaction).toString("base64"),
      blockhash,
      lastValidBlockHeight,
    })
  } catch (error) {
    console.error("[v0] [SERVER] Transaction creation error:", error)
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 })
  }
}
