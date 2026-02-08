import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get("wallet")

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address required" }, { status: 400 })
    }

    console.log("[v0] Fetching collections for wallet:", walletAddress)

    const collections = await sql`
      SELECT 
        id,
        crossmint_id,
        name,
        description,
        symbol,
        image_url,
        supply_limit,
        transferable,
        creator_wallet,
        created_at
      FROM collections
      WHERE creator_wallet = ${walletAddress}
      ORDER BY created_at DESC
    `

    console.log("[v0] Found collections:", collections.length)

    return NextResponse.json({ collections })
  } catch (error) {
    console.error("[v0] Error fetching collections:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch collections" },
      { status: 500 },
    )
  }
}
