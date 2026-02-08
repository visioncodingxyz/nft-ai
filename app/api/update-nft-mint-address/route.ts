import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function POST(request: Request) {
  try {
    const { actionId, mintAddress, txId } = await request.json()

    if (!actionId || !mintAddress) {
      return NextResponse.json({ error: "actionId and mintAddress are required" }, { status: 400 })
    }

    console.log("[v0] Updating NFT with mint address:", { actionId, mintAddress, txId })

    const sql = neon(process.env.DATABASE_URL!)

    const result = await sql`
      UPDATE nfts 
      SET mint_address = ${mintAddress}, 
          updated_at = CURRENT_TIMESTAMP
      WHERE mint_address = ${actionId}
        AND mint_address != ${mintAddress}
      RETURNING id, name, mint_address
    `

    if (result.length === 0) {
      const existing = await sql`
        SELECT id, name, mint_address 
        FROM nfts 
        WHERE mint_address = ${mintAddress}
        LIMIT 1
      `

      if (existing.length > 0) {
        console.log("[v0] NFT already has correct mint address:", existing[0])
        return NextResponse.json({
          success: true,
          nft: existing[0],
          nftId: existing[0].id,
          message: "NFT already updated",
        })
      }

      console.error("[v0] NFT not found for actionId:", actionId)
      return NextResponse.json({ error: "NFT not found" }, { status: 404 })
    }

    console.log("[v0] NFT updated successfully:", result[0])

    return NextResponse.json({
      success: true,
      nft: result[0],
      nftId: result[0].id,
      message: "NFT mint address updated successfully",
    })
  } catch (error) {
    console.error("[v0] Update NFT mint address error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}
