import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get("wallet")
    const maxGenerations = Number.parseInt(searchParams.get("maxGenerations") || "0")

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address required" }, { status: 400 })
    }

    const now = new Date()
    await sql`
      INSERT INTO users (wallet_address, generations_used_today, last_generation_reset, purchased_generations)
      VALUES (${walletAddress}, 0, ${now.toISOString()}, 1)
      ON CONFLICT (wallet_address) DO NOTHING
    `

    const user = await sql`
      SELECT generations_used_today, last_generation_reset, purchased_generations
      FROM users
      WHERE wallet_address = ${walletAddress}
    `

    if (user.length === 0) {
      // This should never happen after UPSERT, but handle it just in case
      const resetTime = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      return NextResponse.json({
        canGenerate: true,
        generationsUsed: 0,
        generationsRemaining: maxGenerations === -1 ? -1 : maxGenerations,
        purchasedGenerations: 1,
        totalGenerations: maxGenerations === -1 ? -1 : maxGenerations + 1,
        resetTime: resetTime.toISOString(),
      })
    }

    const userData = user[0]
    const lastReset = new Date(userData.last_generation_reset)
    const currentTime = new Date()
    const hoursSinceReset = (currentTime.getTime() - lastReset.getTime()) / (1000 * 60 * 60)

    let generationsUsed = userData.generations_used_today
    let resetTime = new Date(lastReset.getTime() + 24 * 60 * 60 * 1000)

    // Reset if more than 24 hours have passed
    if (hoursSinceReset >= 24) {
      const newResetTime = new Date()
      await sql`
        UPDATE users
        SET generations_used_today = 0, last_generation_reset = ${newResetTime.toISOString()}
        WHERE wallet_address = ${walletAddress}
      `
      generationsUsed = 0
      resetTime = new Date(newResetTime.getTime() + 24 * 60 * 60 * 1000)
    }

    const purchasedGenerations = userData.purchased_generations || 1
    const dailyRemaining = maxGenerations === -1 ? -1 : Math.max(0, maxGenerations - generationsUsed)
    const totalGenerations = maxGenerations === -1 ? -1 : dailyRemaining + purchasedGenerations

    // Can generate if unlimited OR has daily generations left OR has purchased generations
    const canGenerate = maxGenerations === -1 || dailyRemaining > 0 || purchasedGenerations > 0

    return NextResponse.json({
      canGenerate,
      generationsUsed,
      generationsRemaining: dailyRemaining,
      purchasedGenerations,
      totalGenerations,
      resetTime: resetTime.toISOString(),
    })
  } catch (error) {
    console.error("[v0] Error checking generation limit:", error)
    return NextResponse.json({ error: "Failed to check generation limit" }, { status: 500 })
  }
}
