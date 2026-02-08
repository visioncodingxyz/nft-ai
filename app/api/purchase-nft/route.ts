import { NextResponse } from "next/server"
import { getNFTById, createTransaction } from "@/lib/db"
import { sql } from "@/lib/db"
import { verifyTransaction } from "@/lib/solana"

export async function POST(request: Request) {
  try {
    const { nftId, buyerWallet, transactionHash } = await request.json()

    if (!nftId || !buyerWallet || !transactionHash) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const nft = await getNFTById(nftId)

    if (!nft) {
      return NextResponse.json({ error: "NFT not found" }, { status: 404 })
    }

    if (!nft.is_listed) {
      return NextResponse.json({ error: "NFT is not listed for sale" }, { status: 400 })
    }

    const isValid = await verifyTransaction(transactionHash)
    if (!isValid) {
      return NextResponse.json({ error: "Invalid transaction" }, { status: 400 })
    }

    // Update NFT ownership and listing status
    await sql`
      UPDATE nfts
      SET owner_wallet = ${buyerWallet}, is_listed = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${nftId}
    `

    // Record transaction
    await createTransaction({
      nftId,
      fromWallet: nft.owner_wallet,
      toWallet: buyerWallet,
      price: nft.price || 0,
      transactionHash,
      transactionType: "sale",
    })

    return NextResponse.json({ success: true, transactionHash })
  } catch (error) {
    console.error("Purchase NFT error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
