import { type NextRequest, NextResponse } from "next/server"
import { getUserByWallet } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const wallet = searchParams.get("wallet")

    if (!wallet) {
      return NextResponse.json({ error: "Wallet address required" }, { status: 400 })
    }

    const user = await getUserByWallet(wallet)

    if (!user) {
      // New user, free mint available
      return NextResponse.json({ freeMintUsed: false })
    }

    return NextResponse.json({ freeMintUsed: user.free_mint_used })
  } catch (error) {
    console.error("Failed to check free mint status:", error)
    return NextResponse.json({ error: "Failed to check free mint status" }, { status: 500 })
  }
}
