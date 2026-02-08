import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { wallet: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "owned"
    const { wallet } = params

    let nfts

    switch (type) {
      case "owned":
        nfts = await sql`
          SELECT n.*, u.username as owner_username, u.avatar_url as owner_avatar
          FROM nfts n
          LEFT JOIN users u ON n.owner_wallet = u.wallet_address
          WHERE n.owner_wallet = ${wallet}
          ORDER BY n.created_at DESC
        `
        break

      case "created":
        nfts = await sql`
          SELECT n.*, u.username as owner_username, u.avatar_url as owner_avatar
          FROM nfts n
          LEFT JOIN users u ON n.owner_wallet = u.wallet_address
          WHERE n.creator_wallet = ${wallet}
          ORDER BY n.created_at DESC
        `
        break

      case "listed":
        const allOwnedNfts = await sql`
          SELECT n.*, u.username as owner_username, u.avatar_url as owner_avatar
          FROM nfts n
          LEFT JOIN users u ON n.owner_wallet = u.wallet_address
          WHERE n.owner_wallet = ${wallet}
          ORDER BY n.created_at DESC
        `

        // Check each NFT's listing status on Magic Eden for display purposes
        const nftsWithListingStatus = await Promise.all(
          allOwnedNfts.map(async (nft) => {
            try {
              const response = await fetch(
                `${request.url.split("/api")[0]}/api/magic-eden-listing?mintAddress=${nft.mint_address}`,
              )
              const data = await response.json()
              return { ...nft, isListedOnME: data.isListed }
            } catch (error) {
              console.error(`[v0] Failed to check listing for ${nft.mint_address}:`, error)
              return { ...nft, isListedOnME: false }
            }
          }),
        )

        nfts = nftsWithListingStatus
        break

      default:
        return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 })
    }

    return NextResponse.json({ nfts })
  } catch (error) {
    console.error("Failed to fetch user NFTs:", error)
    return NextResponse.json({ error: "Failed to fetch NFTs" }, { status: 500 })
  }
}
