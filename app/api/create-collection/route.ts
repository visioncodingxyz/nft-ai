import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)
const CROSSMINT_API_KEY = process.env.CROSSMINT_API_KEY
const CROSSMINT_BASE_URL = "https://www.crossmint.com/api/2022-06-09"

export async function POST(request: NextRequest) {
  try {
    const { name, description, imageUrl, symbol, supplyLimit, transferable, walletAddress } = await request.json()

    if (!name || !imageUrl || !symbol || !walletAddress) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!CROSSMINT_API_KEY) {
      return NextResponse.json({ error: "Crossmint API key not configured" }, { status: 500 })
    }

    console.log("[v0] Creating collection with Crossmint:", { name, symbol })

    // Create collection with Crossmint
    const crossmintResponse = await fetch(`${CROSSMINT_BASE_URL}/collections/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": CROSSMINT_API_KEY,
      },
      body: JSON.stringify({
        chain: "solana",
        metadata: {
          name,
          imageUrl,
          description: description || "",
          symbol,
        },
        fungibility: "non-fungible",
        transferable: transferable !== false,
        ...(supplyLimit && { supplyLimit: Number.parseInt(supplyLimit) }),
      }),
    })

    if (!crossmintResponse.ok) {
      const error = await crossmintResponse.json().catch(() => ({ message: "Unknown error" }))
      console.error("[v0] Crossmint collection creation error:", error)
      return NextResponse.json(
        { error: `Crossmint API error: ${error.message || crossmintResponse.statusText}` },
        { status: crossmintResponse.status },
      )
    }

    const crossmintData = await crossmintResponse.json()
    console.log("[v0] Crossmint collection created:", crossmintData)

    const result = await sql`
      INSERT INTO collections (
        crossmint_id,
        name,
        description,
        symbol,
        image_url,
        supply_limit,
        transferable,
        creator_wallet,
        action_id,
        fungibility,
        on_chain_type,
        on_chain_chain,
        subscription_enabled,
        metadata
      ) VALUES (
        ${crossmintData.id},
        ${crossmintData.metadata?.name || name},
        ${crossmintData.metadata?.description || description || null},
        ${crossmintData.metadata?.symbol || symbol},
        ${crossmintData.metadata?.imageUrl || imageUrl},
        ${supplyLimit ? Number.parseInt(supplyLimit) : null},
        ${transferable !== false},
        ${walletAddress},
        ${crossmintData.actionId || null},
        ${crossmintData.fungibility || "non-fungible"},
        ${crossmintData.onChain?.type || null},
        ${crossmintData.onChain?.chain || "solana"},
        ${crossmintData.subscription?.enabled || false},
        ${JSON.stringify(crossmintData)}
      )
      RETURNING *
    `

    console.log("[v0] Collection saved to database:", result[0])

    return NextResponse.json({
      success: true,
      collection: result[0],
      crossmintData,
    })
  } catch (error) {
    console.error("[v0] Collection creation error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create collection" },
      { status: 500 },
    )
  }
}
