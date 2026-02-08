import { type NextRequest, NextResponse } from "next/server"
import { Connection } from "@solana/web3.js"

const connection = new Connection(
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com",
  "confirmed",
)

export async function POST(request: NextRequest) {
  try {
    const { signature } = await request.json()

    // Verify transaction on Solana blockchain
    const confirmation = await connection.confirmTransaction(signature, "confirmed")

    if (confirmation.value.err) {
      return NextResponse.json({ verified: false, error: "Transaction failed" }, { status: 400 })
    }

    // Get transaction details
    const transaction = await connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    })

    return NextResponse.json({
      verified: true,
      transaction: {
        signature,
        slot: transaction?.slot,
        blockTime: transaction?.blockTime,
      },
    })
  } catch (error) {
    console.error("Transaction verification error:", error)
    return NextResponse.json({ error: "Failed to verify transaction" }, { status: 500 })
  }
}
