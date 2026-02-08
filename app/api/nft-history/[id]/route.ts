import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const nftId = Number.parseInt(params.id)

    const transactions = await sql`
      SELECT 
        t.*,
        n.name as nft_name,
        n.image_url as nft_image
      FROM transactions t
      LEFT JOIN nfts n ON t.nft_id = n.id
      WHERE t.nft_id = ${nftId}
      ORDER BY t.created_at DESC
    `

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error("Failed to fetch NFT history:", error)
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 })
  }
}
