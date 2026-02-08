import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function POST(request: NextRequest) {
  try {
    const {
      tokenAddress,
      name,
      symbol,
      description,
      imageUrl,
      creatorWallet,
      requestId,
      bondingCurveType,
      bondingCurveAddress,
      initialBuyAmount,
      totalSupply,
      decimals,
      metadata,
      launcherType,
    } = await request.json()

    if (!tokenAddress || !name || !symbol || !creatorWallet) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const sql = neon(process.env.DATABASE_URL!)

    // Insert token into database
    const result = await sql`
      INSERT INTO tokens (
        token_address,
        name,
        symbol,
        description,
        image_url,
        creator_wallet,
        request_id,
        bonding_curve_type,
        bonding_curve_address,
        initial_buy_amount,
        total_supply,
        decimals,
        metadata,
        launcher_type,
        created_at,
        updated_at
      ) VALUES (
        ${tokenAddress},
        ${name},
        ${symbol},
        ${description || null},
        ${imageUrl || null},
        ${creatorWallet},
        ${requestId || null},
        ${bondingCurveType || null},
        ${bondingCurveAddress || null},
        ${initialBuyAmount || 0},
        ${totalSupply || null},
        ${decimals || 9},
        ${metadata ? JSON.stringify(metadata) : null},
        ${launcherType || "bonding"},
        NOW(),
        NOW()
      )
      RETURNING *
    `

    console.log("[v0] Token saved to database:", result[0])

    return NextResponse.json({ success: true, token: result[0] })
  } catch (error) {
    console.error("[v0] Error saving token to database:", error)
    return NextResponse.json(
      { error: "Failed to save token", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
