import { type NextRequest, NextResponse } from "next/server"
import { updateNFTListing } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nftId, price } = body

    if (!nftId || !price) {
      return NextResponse.json({ error: "NFT ID and price are required" }, { status: 400 })
    }

    const priceNumber = Number.parseFloat(price)
    if (isNaN(priceNumber) || priceNumber <= 0) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 })
    }

    const updatedNFT = await updateNFTListing(nftId, true, priceNumber)

    return NextResponse.json({ success: true, nft: updatedNFT })
  } catch (error) {
    console.error("[v0] Error listing NFT:", error)
    return NextResponse.json({ error: "Failed to list NFT" }, { status: 500 })
  }
}
