import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json()

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address required" }, { status: 400 })
    }

    // Increment generation count
    await sql`
      INSERT INTO users (wallet_address, generations_used_today, last_generation_reset)
      VALUES (${walletAddress}, 1, NOW())
      ON CONFLICT (wallet_address)
      DO UPDATE SET generations_used_today = users.generations_used_today + 1
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error incrementing generation:", error)
    return NextResponse.json({ error: "Failed to increment generation" }, { status: 500 })
  }
}
