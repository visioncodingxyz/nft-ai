import { NextResponse } from "next/server"
import { recalculateAllRarities } from "@/lib/rarity"

export async function POST() {
  try {
    console.log("[v0] Starting rarity recalculation for all NFTs...")
    await recalculateAllRarities()
    console.log("[v0] Rarity recalculation complete!")

    return NextResponse.json({ success: true, message: "Rarity recalculated for all NFTs" })
  } catch (error) {
    console.error("[v0] Failed to recalculate rarity:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to recalculate rarity" },
      { status: 500 },
    )
  }
}
