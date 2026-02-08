import { NextResponse } from "next/server"
import { getListedNFTs } from "@/lib/db"
import { sql } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sort = searchParams.get("sort") || "recent"
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const search = searchParams.get("search")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const nsfwFilter = searchParams.get("nsfwFilter") // "nsfw", "sfw", or null (show all)

    let nfts

    let nsfwCondition = sql``
    if (nsfwFilter === "nsfw") {
      nsfwCondition = sql`AND n.is_nsfw = true`
    } else if (nsfwFilter === "sfw") {
      nsfwCondition = sql`AND n.is_nsfw = false`
    }
    // If nsfwFilter is null, show all NFTs (no filter)

    if (search && search.trim()) {
      const searchTerm = `%${search.trim().toLowerCase()}%`

      // Build price filter condition
      let priceCondition = sql``
      if (minPrice !== null && maxPrice !== null) {
        priceCondition = sql`AND n.price >= ${Number(minPrice)} AND n.price <= ${Number(maxPrice)}`
      }

      nfts = await sql`
        SELECT 
          n.*,
          u.username as owner_username,
          u.avatar_url as owner_avatar,
          c.name as collection_name
        FROM nfts n
        LEFT JOIN users u ON n.owner_wallet = u.wallet_address
        LEFT JOIN collections c ON n.collection_id = c.id
        WHERE 1=1
          ${priceCondition}
          ${nsfwCondition}
          AND (
            LOWER(n.name) LIKE ${searchTerm}
            OR LOWER(n.description) LIKE ${searchTerm}
            OR LOWER(c.name) LIKE ${searchTerm}
            OR LOWER(u.username) LIKE ${searchTerm}
          )
        ORDER BY n.created_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `
    } else {
      if (minPrice !== null && maxPrice !== null) {
        nfts = await sql`
          SELECT 
            n.*,
            u.username as owner_username,
            u.avatar_url as owner_avatar,
            c.name as collection_name
          FROM nfts n
          LEFT JOIN users u ON n.owner_wallet = u.wallet_address
          LEFT JOIN collections c ON n.collection_id = c.id
          WHERE 1=1
            AND n.price >= ${Number(minPrice)}
            AND n.price <= ${Number(maxPrice)}
            ${nsfwCondition}
          ORDER BY n.created_at DESC
          LIMIT ${limit}
          OFFSET ${offset}
        `
      } else {
        if (nsfwFilter) {
          const isNsfw = nsfwFilter === "nsfw"
          nfts = await sql`
            SELECT 
              n.*,
              u.username as owner_username,
              u.avatar_url as owner_avatar,
              c.name as collection_name
            FROM nfts n
            LEFT JOIN users u ON n.owner_wallet = u.wallet_address
            LEFT JOIN collections c ON n.collection_id = c.id
            WHERE n.is_nsfw = ${isNsfw}
            ORDER BY n.created_at DESC
            LIMIT ${limit}
            OFFSET ${offset}
          `
        } else {
          nfts = await getListedNFTs(limit, offset)
        }
      }
    }

    switch (sort) {
      case "price-low":
        nfts = nfts.sort((a, b) => {
          const priceA = a.price ?? 0
          const priceB = b.price ?? 0
          return priceA - priceB
        })
        break
      case "price-high":
        nfts = nfts.sort((a, b) => {
          const priceA = a.price ?? 0
          const priceB = b.price ?? 0
          return priceB - priceA
        })
        break
      case "recent":
      default:
        // Already sorted by created_at DESC in query
        break
    }

    return NextResponse.json({ nfts, total: nfts.length })
  } catch (error) {
    console.error("Failed to fetch NFTs:", error)
    return NextResponse.json({ error: "Failed to fetch NFTs" }, { status: 500 })
  }
}
