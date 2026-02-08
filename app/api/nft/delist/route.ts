import { type NextRequest, NextResponse } from "next/server"
import { updateNFTListing } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nftId } = body

    if (!nftId) {
      return NextResponse.json({ error: "NFT ID is required" }, { status: 400 })
    }

    const updatedNFT = await updateNFTListing(nftId, false, null)

    return NextResponse.json({ success: true, nft: updatedNFT })
  } catch (error) {
    console.error("[v0] Error delisting NFT:", error)
    return NextResponse.json({ error: "Failed to delist NFT" }, { status: 500 })
  }
}
