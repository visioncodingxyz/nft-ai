import { NextResponse } from "next/server"

function capitalizeFirstLetter(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function getBodyWeightLabel(value: number): string {
  if (value < -0.1) return "Skinny"
  if (value > 0.1) return "Curvy"
  return "Normal"
}

function getBreastSizeLabel(value: number): string {
  if (value < -0.1) return "Small"
  if (value > 0.1) return "Busty"
  return "Medium"
}

function getAssSizeLabel(value: number): string {
  if (value < -0.1) return "Small"
  if (value > 0.1) return "Bubble Butt"
  return "Medium"
}

export async function POST(request: Request) {
  try {
    const { prompt, style, nsfwMode, nsfwOptions, imageUrl } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    console.log("[v0] Generating attributes for NFT:", {
      prompt: prompt.substring(0, 50),
      style,
      nsfwMode,
      hasImageUrl: !!imageUrl,
    })

    let attributes: Array<{ trait_type: string; value: string }> = []

    if (!nsfwMode) {
      const baseAttributes = [
        {
          trait_type: "Art Style",
          value: capitalizeFirstLetter(style.replace(/-/g, " ")),
        },
      ]

      // If imageUrl is provided, analyze it with AI
      if (imageUrl) {
        try {
          console.log("[v0] Analyzing image for additional attributes...")
          const analysisResponse = await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/analyze-nft-image`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ imageUrl, prompt }),
            },
          )

          if (analysisResponse.ok) {
            const { attributes: aiAttributes } = await analysisResponse.json()
            attributes = [...baseAttributes, ...aiAttributes]
            console.log("[v0] Added AI-analyzed attributes:", aiAttributes)
          } else {
            console.log("[v0] Image analysis failed, using base attributes only")
            attributes = baseAttributes
          }
        } catch (error) {
          console.error("[v0] Error analyzing image:", error)
          attributes = baseAttributes
        }
      } else {
        attributes = baseAttributes
      }
    } else {
      // NSFW attributes remain unchanged
      if (nsfwOptions) {
        attributes = [
          { trait_type: "Art Style", value: capitalizeFirstLetter(nsfwOptions.style || "Cinematic") },
          { trait_type: "Filter", value: capitalizeFirstLetter(nsfwOptions.filter || "Default") },
          { trait_type: "Emotion", value: capitalizeFirstLetter(nsfwOptions.emotion || "Default") },
          { trait_type: "Quality", value: capitalizeFirstLetter(nsfwOptions.quality || "Ultra") },
          { trait_type: "Age", value: nsfwOptions.age_slider?.toString() || "25" },
          { trait_type: "Body Weight", value: getBodyWeightLabel(nsfwOptions.weight_slider || 0) },
          { trait_type: "Breast Size", value: getBreastSizeLabel(nsfwOptions.breast_slider || 0) },
          { trait_type: "Ass Size", value: getAssSizeLabel(nsfwOptions.ass_slider || 0) },
        ]
      } else {
        attributes = [
          { trait_type: "Art Style", value: "Cinematic" },
          { trait_type: "Filter", value: "Default" },
          { trait_type: "Emotion", value: "Default" },
          { trait_type: "Quality", value: "Ultra" },
          { trait_type: "Age", value: "25" },
          { trait_type: "Body Weight", value: "Normal" },
          { trait_type: "Breast Size", value: "Medium" },
          { trait_type: "Ass Size", value: "Medium" },
        ]
      }
    }

    console.log("[v0] Generated attributes:", attributes)

    return NextResponse.json({ attributes })
  } catch (error) {
    console.error("[v0] Generate attributes error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate attributes" },
      { status: 500 },
    )
  }
}
