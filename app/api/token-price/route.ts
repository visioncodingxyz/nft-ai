import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const mintAddress = searchParams.get("mint")

    if (!mintAddress) {
      return NextResponse.json({ error: "Mint address required" }, { status: 400 })
    }

    console.log("[v0] Fetching DexScreener data for token:", mintAddress)

    // First try the tokens endpoint
    let response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${mintAddress}`, {
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 30 }, // Cache for 30 seconds for more frequent updates
    })

    let data = await response.json()
    console.log("[v0] DexScreener tokens response:", JSON.stringify(data).substring(0, 500))

    // Get the first pair (usually the most liquid)
    let pair = data.pairs?.[0]

    if (!pair) {
      console.log("[v0] No pairs found in tokens endpoint, trying search...")
      response = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${mintAddress}`, {
        headers: {
          Accept: "application/json",
        },
        next: { revalidate: 30 },
      })

      data = await response.json()
      console.log("[v0] DexScreener search response:", JSON.stringify(data).substring(0, 500))
      pair = data.pairs?.[0]
    }

    if (!pair) {
      console.log("[v0] No pair data found for token:", mintAddress)
      return NextResponse.json({
        priceUsd: null,
        priceChange24h: null,
        volume24h: null,
        liquidity: null,
        marketCap: null,
      })
    }

    console.log("[v0] Found pair data:", {
      priceUsd: pair.priceUsd,
      priceChange24h: pair.priceChange?.h24,
      volume24h: pair.volume?.h24,
      dexId: pair.dexId,
    })

    return NextResponse.json({
      priceUsd: pair.priceUsd || null,
      priceChange24h: pair.priceChange?.h24 || null,
      volume24h: pair.volume?.h24 || null,
      liquidity: pair.liquidity?.usd || null,
      marketCap: pair.marketCap || null,
      pairAddress: pair.pairAddress || null,
      dexId: pair.dexId || null,
    })
  } catch (error) {
    console.error("[v0] Error fetching token price:", error)
    return NextResponse.json({
      priceUsd: null,
      priceChange24h: null,
      volume24h: null,
      liquidity: null,
      marketCap: null,
    })
  }
}
