import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sort = searchParams.get("sort") || "recent"
    const limit = Number.parseInt(searchParams.get("limit") || "100")
    const search = searchParams.get("search") || ""

    let orderBy = "created_at DESC"
    if (sort === "name") {
      orderBy = "name ASC"
    }

    let tokens
    if (search.trim()) {
      // Use parameterized query with ILIKE for case-insensitive search
      const searchPattern = `%${search.trim()}%`
      if (sort === "name") {
        tokens = await sql`
          SELECT *, token_address as mint_address FROM tokens
          WHERE name ILIKE ${searchPattern} 
            OR symbol ILIKE ${searchPattern} 
            OR description ILIKE ${searchPattern}
          ORDER BY name ASC
          LIMIT ${limit}
        `
      } else {
        tokens = await sql`
          SELECT *, token_address as mint_address FROM tokens
          WHERE name ILIKE ${searchPattern} 
            OR symbol ILIKE ${searchPattern} 
            OR description ILIKE ${searchPattern}
          ORDER BY created_at DESC
          LIMIT ${limit}
        `
      }
    } else {
      if (sort === "name") {
        tokens = await sql`
          SELECT *, token_address as mint_address FROM tokens
          ORDER BY name ASC
          LIMIT ${limit}
        `
      } else {
        tokens = await sql`
          SELECT *, token_address as mint_address FROM tokens
          ORDER BY created_at DESC
          LIMIT ${limit}
        `
      }
    }

    console.log("[v0] Tokens API - Sample token data:", tokens[0])

    return NextResponse.json({ tokens })
  } catch (error) {
    console.error("Error fetching tokens:", error)
    return NextResponse.json({ error: "Failed to fetch tokens", tokens: [] }, { status: 500 })
  }
}
