import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export const maxDuration = 30
export const dynamic = "force-dynamic"

interface NFTToUpdate {
  id: number
  mint_address: string
  name: string
}

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 10000) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

export async function GET(request: Request) {
  try {
    // Verify this is a cron request (optional security check)
    const authHeader = request.headers.get("authorization")
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sql = neon(process.env.DATABASE_URL!)

    const nftsToUpdate = await sql<NFTToUpdate[]>`
      SELECT id, mint_address, name
      FROM nfts 
      WHERE price_last_updated < NOW() - INTERVAL '30 seconds'
         OR price_last_updated IS NULL
      ORDER BY price_last_updated ASC NULLS FIRST
      LIMIT 10
    `

    console.log(`[v0] [CRON] Starting update for ${nftsToUpdate.length} NFTs`)

    let successCount = 0
    let errorCount = 0
    const errors: { nft: string; type: string; message: string }[] = []

    const batchSize = 3
    for (let i = 0; i < nftsToUpdate.length; i += batchSize) {
      const batch = nftsToUpdate.slice(i, i + batchSize)

      await Promise.all(
        batch.map(async (nft) => {
          try {
            const response = await fetchWithTimeout(
              `https://api-mainnet.magiceden.dev/v2/tokens/${nft.mint_address}`,
              {
                headers: {
                  Accept: "application/json",
                },
              },
              10000, // 10 second timeout
            )

            if (!response.ok) {
              const errorType = response.status === 500 ? "API Error" : `HTTP ${response.status}`
              console.error(`[v0] [CRON] ${errorType} for ${nft.name}`)
              errors.push({ nft: nft.name, type: errorType, message: `Status ${response.status}` })
              errorCount++
              await sql`
                UPDATE nfts 
                SET price_last_updated = NOW()
                WHERE id = ${nft.id}
              `
              return
            }

            const data = await response.json()

            const price = data.price ?? null
            const isListed = data.listStatus === "listed"

            // Update database
            await sql`
              UPDATE nfts 
              SET 
                price = ${price},
                is_listed = ${isListed},
                price_last_updated = NOW(),
                updated_at = NOW()
              WHERE id = ${nft.id}
            `

            successCount++
            console.log(`[v0] [CRON] ✓ Updated ${nft.name}: price=${price}, listed=${isListed}`)
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error"
            const errorType = errorMessage.includes("aborted") ? "Timeout" : "Error"

            console.error(`[v0] [CRON] ${errorType} updating ${nft.name}: ${errorMessage}`)
            errors.push({ nft: nft.name, type: errorType, message: errorMessage })
            errorCount++

            try {
              await sql`
                UPDATE nfts 
                SET price_last_updated = NOW()
                WHERE id = ${nft.id}
              `
            } catch (dbError) {
              console.error(`[v0] [CRON] Failed to update timestamp for ${nft.name}`)
            }
          }
        }),
      )

      if (i + batchSize < nftsToUpdate.length) {
        await new Promise((resolve) => setTimeout(resolve, 300))
      }
    }

    console.log(`[v0] [CRON] Completed: ${successCount} success, ${errorCount} errors`)
    if (errors.length > 0) {
      console.log(`[v0] [CRON] Error summary:`, errors)
    }

    return NextResponse.json({
      success: true,
      updated: successCount,
      errors: errorCount,
      total: nftsToUpdate.length,
      errorDetails: errors,
    })
  } catch (error) {
    console.error("[v0] [CRON] Failed to update NFT prices:", error)
    return NextResponse.json({ error: "Failed to update prices" }, { status: 500 })
  }
}
