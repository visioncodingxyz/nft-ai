import { NextResponse } from "next/server"
import { calculateNFTRarity } from "@/lib/rarity"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const nftId = Number.parseInt(params.id)

    if (isNaN(nftId)) {
      return NextResponse.json({ error: "Invalid NFT ID" }, { status: 400 })
    }

    const rarityData = await calculateNFTRarity(nftId)

    return NextResponse.json(rarityData)
  } catch (error) {
    console.error("[v0] Failed to calculate rarity:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to calculate rarity",
        rarityScore: 0,
        rank: 0,
        totalNFTs: 0,
        percentile: 0,
        tier: { name: "Common", emoji: "⚪", minPercentile: 0 },
      },
      { status: 500 },
    )
  }
}
