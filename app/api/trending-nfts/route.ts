import { NextResponse } from "next/server"
import { getTrendingNFTs } from "@/lib/db"

// <CHANGE> Added caching headers to reduce load
export const revalidate = 30 // Cache for 30 seconds

export async function GET() {
  try {
    const trendingNFTs = await getTrendingNFTs(10)
    
    // <CHANGE> NFTs now include cached price and is_listed from database
    return NextResponse.json({ nfts: trendingNFTs })
  } catch (error) {
    console.error("Failed to fetch trending NFTs:", error)
    return NextResponse.json({ error: "Failed to fetch trending NFTs" }, { status: 500 })
  }
}
