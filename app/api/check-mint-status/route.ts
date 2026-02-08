import { NextResponse } from "next/server"
import { checkMintStatus } from "@/lib/crossmint"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const actionId = searchParams.get("actionId")

    if (!actionId) {
      return NextResponse.json({ error: "actionId is required" }, { status: 400 })
    }

    console.log("[v0] Checking status for actionId:", actionId)

    const status = await checkMintStatus(actionId)

    console.log("[v0] Status check result:", { status: status.status, txId: status.data?.txId })

    const mintAddress =
      status.data?.nft?.onChain?.mintHash ||
      status.data?.mintHash ||
      status.data?.token?.mintHash ||
      status.data?.collection?.mintAddress

    return NextResponse.json({
      success: true,
      status: status.status,
      data: status.data,
      txId: status.data?.txId,
      mintAddress, // Include mint address in response
      completedAt: status.completedAt,
    })
  } catch (error) {
    console.error("[v0] Check mint status error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}
