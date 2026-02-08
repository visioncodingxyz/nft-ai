import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const collectionId = Number.parseInt(params.id)

    if (isNaN(collectionId)) {
      return NextResponse.json({ error: "Invalid collection ID" }, { status: 400 })
    }

    // Fetch NFTs that belong to this collection
    const nfts = await sql`
      SELECT 
        n.id,
        n.name,
        n.description,
        n.image_url,
        n.mint_address,
        n.owner_wallet,
        n.price,
        n.is_listed,
        n.created_at,
        n.attributes,
        n.rarity_score,
        u.username as owner_username,
        c.name as collection_name
      FROM nfts n
      LEFT JOIN users u ON n.owner_wallet = u.wallet_address
      LEFT JOIN collections c ON n.collection_id = c.id
      WHERE n.collection_id = ${collectionId}
      ORDER BY n.created_at DESC
    `

    return NextResponse.json({ nfts })
  } catch (error) {
    console.error("[v0] Error fetching collection NFTs:", error)
    return NextResponse.json({ error: "Failed to fetch NFTs" }, { status: 500 })
  }
}
