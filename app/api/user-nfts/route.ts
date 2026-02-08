import { type NextRequest, NextResponse } from "next/server"
import { getNFTsByCreator } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const wallet = searchParams.get("wallet")

    if (!wallet) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 })
    }

    const nfts = await getNFTsByCreator(wallet)

    return NextResponse.json({ nfts })
  } catch (error) {
    console.error("[v0] Error fetching user NFTs:", error)
    return NextResponse.json({ error: "Failed to fetch NFTs" }, { status: 500 })
  }
}
