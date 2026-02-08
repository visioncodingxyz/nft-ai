import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const CROSSMINT_API_KEY = process.env.CROSSMINT_API_KEY
const CROSSMINT_API_URL = "https://www.crossmint.com/api/2022-06-09"

export async function POST(request: Request) {
  try {
    const { name, description, imageUrl, attributes, walletAddress, isFreeMint, nsfwMode, collectionId } =
      await request.json()

    console.log("[v0] Mint NFT request:", {
      name,
      walletAddress,
      isFreeMint,
      nsfwMode,
      collectionId,
    })

    if (!name || !imageUrl || !walletAddress) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!CROSSMINT_API_KEY) {
      return NextResponse.json({ error: "Crossmint API key not configured" }, { status: 500 })
    }

    const sql = neon(process.env.DATABASE_URL!)

    const existingMint = await sql`
      SELECT id, name, mint_address, created_at 
      FROM nfts 
      WHERE name = ${name} 
        AND owner_wallet = ${walletAddress}
        AND created_at > NOW() - INTERVAL '5 minutes'
      ORDER BY created_at DESC
      LIMIT 1
    `

    if (existingMint.length > 0) {
      console.log("[v0] Duplicate mint detected, returning existing NFT:", existingMint[0])
      return NextResponse.json({
        success: true,
        actionId: existingMint[0].mint_address,
        crossmintId: existingMint[0].mint_address,
        nftId: existingMint[0].id,
        message: "NFT already minting, please wait",
        isDuplicate: true,
      })
    }

    // Prepare metadata for Crossmint
    const metadata = {
      name,
      description: description || "",
      image: imageUrl,
      attributes: Object.entries(attributes || {}).map(([trait_type, value]) => ({
        trait_type,
        value,
      })),
    }

    console.log("[v0] Minting NFT with Crossmint...")

    // Call Crossmint API to mint NFT
    const crossmintResponse = await fetch(`${CROSSMINT_API_URL}/collections/${collectionId}/nfts`, {
      method: "POST",
      headers: {
        "X-API-KEY": CROSSMINT_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipient: `solana:${walletAddress}`,
        metadata,
      }),
    })

    if (!crossmintResponse.ok) {
      const errorText = await crossmintResponse.text()
      console.error("[v0] Crossmint API error:", errorText)
      throw new Error(`Crossmint API error: ${errorText}`)
    }

    const crossmintData = await crossmintResponse.json()
    const actionId = crossmintData.actionId

    console.log("[v0] Crossmint mint initiated:", { actionId })

    // Save to database with actionId as temporary mint_address
    console.log("[v0] Saving NFT to database...")

    const result = await sql`
      INSERT INTO nfts (
        name,
        description,
        image_url,
        mint_address,
        owner_wallet,
        attributes,
        is_nsfw,
        created_at,
        updated_at
      ) VALUES (
        ${name},
        ${description || ""},
        ${imageUrl},
        ${actionId},
        ${walletAddress},
        ${JSON.stringify(attributes || {})},
        ${nsfwMode || false},
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
      ON CONFLICT (mint_address) DO UPDATE 
      SET updated_at = CURRENT_TIMESTAMP
      RETURNING id, name, mint_address
    `

    console.log("[v0] NFT saved to database:", result[0])

    // Mark free mint as used if applicable
    if (isFreeMint) {
      console.log("[v0] Marking free mint as used for wallet:", walletAddress)
      await sql`
        INSERT INTO user_free_mints (wallet_address, free_mint_used, used_at)
        VALUES (${walletAddress}, true, CURRENT_TIMESTAMP)
        ON CONFLICT (wallet_address)
        DO UPDATE SET free_mint_used = true, used_at = CURRENT_TIMESTAMP
      `
    }

    return NextResponse.json({
      success: true,
      actionId,
      crossmintId: actionId,
      nftId: result[0].id,
      message: "NFT minting initiated successfully",
    })
  } catch (error) {
    console.error("[v0] Mint NFT error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}
