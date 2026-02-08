import { NextResponse } from "next/server"
import { analyzeNFTImage } from "@/lib/analyze-image"

export async function POST(request: Request) {
  try {
    const { imageUrl, prompt } = await request.json()

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 })
    }

    const attributes = await analyzeNFTImage(imageUrl, prompt)

    return NextResponse.json({ attributes })
  } catch (error) {
    console.error("[v0] Image analysis API error:", error)
    return NextResponse.json(
      { error: "Failed to analyze image", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
