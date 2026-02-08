import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, creditsPurchased, generationsPurchased, transactionSignature } = await request.json()

    const creditsToAdd = creditsPurchased || generationsPurchased

    console.log("[v0] Purchase request:", { walletAddress, creditsToAdd, transactionSignature })

    if (!walletAddress || !creditsToAdd || !transactionSignature) {
      console.log("[v0] Missing required fields:", { walletAddress, creditsToAdd, transactionSignature })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await sql`
      INSERT INTO users (wallet_address, purchased_generations, generations_used_today, last_generation_reset)
      VALUES (${walletAddress}, ${creditsToAdd}, 0, NOW())
      ON CONFLICT (wallet_address) 
      DO UPDATE SET purchased_generations = users.purchased_generations + ${creditsToAdd}
    `

    console.log("[v0] Successfully added", creditsToAdd, "credits to", walletAddress)

    return NextResponse.json({
      success: true,
      creditsPurchased: creditsToAdd,
      transactionSignature,
    })
  } catch (error) {
    console.error("[v0] Error purchasing generations:", error)
    return NextResponse.json(
      { error: "Failed to purchase generations", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
