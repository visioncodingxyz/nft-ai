import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET(request: NextRequest, { params }: { params: { mintAddress: string } }) {
  try {
    const { mintAddress } = params

    console.log(`[v0] [SERVER] Fetching Magic Eden data for mint: ${mintAddress}`)

    const response = await fetch(`https://api-mainnet.magiceden.dev/v2/tokens/${mintAddress}`, {
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      console.log(`[v0] [SERVER] Magic Eden API error: ${response.status} for ${mintAddress}`)
      return NextResponse.json(
        { error: `Magic Eden API error: ${response.status}`, isListed: false },
        { status: response.status },
      )
    }

    let data
    try {
      data = await response.json()
    } catch (jsonError) {
      console.error(`[v0] [SERVER] Failed to parse Magic Eden response as JSON for ${mintAddress}:`, jsonError)
      // Try to get the raw text to see what the error is
      const text = await response.text().catch(() => "Unable to read response")
      console.error(`[v0] [SERVER] Raw response text:`, text)
      return NextResponse.json({ error: "Invalid JSON response from Magic Eden", isListed: false }, { status: 500 })
    }

    console.log(`[v0] [SERVER] Magic Eden API response for ${mintAddress}:`, JSON.stringify(data))

    const result = {
      price: data.price, // Already in SOL
      listStatus: data.listStatus,
      isListed: data.listStatus === "listed",
    }

    console.log(`[v0] [SERVER] Parsed Magic Eden data:`, result)

    if (process.env.DATABASE_URL) {
      try {
        const sql = neon(process.env.DATABASE_URL)

        // Update the NFT price and listing status in the database
        await sql`
          UPDATE nfts 
          SET 
            price = ${result.price ?? null},
            is_listed = ${result.isListed},
            updated_at = NOW()
          WHERE mint_address = ${mintAddress}
        `

        console.log(
          `[v0] [SERVER] Updated database price for ${mintAddress}: ${result.price} SOL, listed: ${result.isListed}`,
        )
      } catch (dbError) {
        console.error(`[v0] [SERVER] Failed to update database:`, dbError)
        // Don't fail the request if database update fails
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error(`[v0] [SERVER] Failed to fetch Magic Eden data:`, error)
    return NextResponse.json({ error: "Failed to fetch Magic Eden data", isListed: false }, { status: 500 })
  }
}
