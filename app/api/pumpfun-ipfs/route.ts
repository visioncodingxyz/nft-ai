import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Get the form data from the client request
    const formData = await request.formData()

    console.log("[v0] Proxying IPFS upload to PumpFun")

    // Forward the request to pump.fun/api/ipfs
    const response = await fetch("https://pump.fun/api/ipfs", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] PumpFun IPFS upload failed:", errorText)
      return NextResponse.json(
        { error: `Failed to upload to PumpFun: ${response.statusText}` },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log("[v0] PumpFun IPFS upload successful:", data)

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error proxying IPFS upload:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload metadata" },
      { status: 500 },
    )
  }
}
