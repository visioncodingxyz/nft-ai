export const runtime = "edge"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const mintAddress = searchParams.get("mintAddress")

    if (!mintAddress) {
      return new Response(JSON.stringify({ error: "Mint address is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Fetch listing data from Magic Eden API v2
    const response = await fetch(`https://api-mainnet.magiceden.dev/v2/tokens/${mintAddress}/listings`, {
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      console.error(`[v0] [SERVER] Magic Eden API error: ${response.status}`)
      return new Response(JSON.stringify({ isListed: false, listings: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    }

    const listings = await response.json()

    // Check if there are any active listings
    const isListed = Array.isArray(listings) && listings.length > 0

    return new Response(
      JSON.stringify({
        isListed,
        listings: isListed ? listings : [],
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("[v0] [SERVER] Error checking Magic Eden listing:", error)
    return new Response(JSON.stringify({ isListed: false, listings: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  }
}
