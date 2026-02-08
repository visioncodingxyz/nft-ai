import { type NextRequest, NextResponse } from "next/server"
import { updateNFTMetadata, getNFTById } from "@/lib/db"

const CROSSMINT_API_KEY = process.env.CROSSMINT_API_KEY
const DEFAULT_COLLECTION_ID = "7acf523c-ca02-46a7-803d-fe8a3204e905"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nftId, metadata } = body

    console.log("[v0] Update metadata request:", { nftId, metadata })

    if (!nftId || !metadata) {
      console.error("[v0] Missing required fields")
      return NextResponse.json({ error: "Missing required fields: nftId and metadata" }, { status: 400 })
    }

    if (!metadata.name || !metadata.image || !metadata.description) {
      console.error("[v0] Invalid metadata structure")
      return NextResponse.json({ error: "Metadata must include name, image, and description" }, { status: 400 })
    }

    // Get NFT from database
    const nft = await getNFTById(nftId)
    if (!nft) {
      console.error("[v0] NFT not found:", nftId)
      return NextResponse.json({ error: "NFT not found" }, { status: 404 })
    }

    console.log("[v0] Found NFT:", {
      id: nft.id,
      name: nft.name,
      crossmint_id: nft.crossmint_id,
      collection_id: nft.collection_id,
    })

    const updatedNFT = await updateNFTMetadata(nftId, {
      name: metadata.name,
      description: metadata.description,
      imageUrl: metadata.image,
      attributes: metadata.attributes || [],
    })

    console.log("[v0] Database updated successfully")

    // If no Crossmint ID, return success (database-only update)
    if (!nft.crossmint_id) {
      console.warn("[v0] NFT does not have a Crossmint ID, database updated only")
      return NextResponse.json({
        success: true,
        nft: updatedNFT,
        warning: "NFT updated in database only. Crossmint ID not available for blockchain sync.",
      })
    }

    let collectionId = DEFAULT_COLLECTION_ID
    if (nft.collection_id) {
      const { sql } = await import("@/lib/db")
      const collectionResult = await sql`
        SELECT crossmint_id FROM collections WHERE id = ${nft.collection_id} LIMIT 1
      `
      if (collectionResult.length > 0 && collectionResult[0].crossmint_id) {
        collectionId = collectionResult[0].crossmint_id
        console.log("[v0] Using collection Crossmint ID from database:", collectionId)
      } else {
        console.log("[v0] Collection has no Crossmint ID, using default:", DEFAULT_COLLECTION_ID)
      }
    } else {
      console.log("[v0] No collection_id, using default collection:", DEFAULT_COLLECTION_ID)
    }

    console.log("[v0] Syncing with Crossmint API:", {
      collectionId,
      nftId: nft.crossmint_id,
      url: `https://www.crossmint.com/api/2022-06-09/collections/${collectionId}/nfts/${nft.crossmint_id}`,
    })

    const crossmintPayload = {
      metadata: {
        name: metadata.name,
        image: metadata.image,
        description: metadata.description,
        ...(metadata.attributes && metadata.attributes.length > 0 ? { attributes: metadata.attributes } : {}),
      },
      reuploadLinkedFiles: true,
    }

    console.log("[v0] Crossmint payload:", JSON.stringify(crossmintPayload, null, 2))

    const response = await fetch(
      `https://www.crossmint.com/api/2022-06-09/collections/${collectionId}/nfts/${nft.crossmint_id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": CROSSMINT_API_KEY || "",
        },
        body: JSON.stringify(crossmintPayload),
      },
    )

    const responseText = await response.text()
    console.log("[v0] Crossmint API response status:", response.status)
    console.log("[v0] Crossmint API response:", responseText)

    if (!response.ok) {
      console.error("[v0] Crossmint API error:", {
        status: response.status,
        statusText: response.statusText,
        body: responseText,
      })

      return NextResponse.json({
        success: true,
        nft: updatedNFT,
        warning: `NFT updated in database. Crossmint sync failed: ${responseText}`,
      })
    }

    let crossmintData
    try {
      crossmintData = JSON.parse(responseText)
      console.log("[v0] Crossmint sync successful:", crossmintData)
    } catch (e) {
      console.warn("[v0] Could not parse Crossmint response as JSON:", responseText)
    }

    return NextResponse.json({
      success: true,
      nft: updatedNFT,
      crossmint: crossmintData,
      message: "NFT metadata updated successfully in database and synced with Crossmint",
    })
  } catch (error) {
    console.error("[v0] Error updating NFT metadata:", error)
    return NextResponse.json(
      {
        error: "Failed to update metadata",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
