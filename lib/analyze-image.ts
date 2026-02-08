import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function analyzeNFTImage(
  imageUrl: string,
  prompt?: string,
): Promise<Array<{ trait_type: string; value: string }>> {
  console.log("[v0] ========== AI IMAGE ANALYSIS START ==========")
  console.log("[v0] Image URL:", imageUrl.substring(0, 100) + "...")
  console.log("[v0] Original prompt:", prompt || "No prompt provided")

  try {
    const analysisPrompt = `Analyze this NFT image and extract 5-8 distinct visual attributes that would be valuable as NFT traits.

Focus on:
- Main subject/character (if present)
- Color palette and dominant colors
- Art style and technique
- Mood/atmosphere
- Composition and perspective
- Notable visual elements or features
- Background elements
- Lighting and effects

${prompt ? `Original generation prompt: "${prompt}"` : ""}

Return ONLY a valid JSON array of objects with this exact format:
[
  {"trait_type": "Main Subject", "value": "Dragon"},
  {"trait_type": "Color Palette", "value": "Vibrant Neon"},
  {"trait_type": "Mood", "value": "Epic"},
  {"trait_type": "Background", "value": "Cyberpunk City"},
  {"trait_type": "Lighting", "value": "Dramatic Sunset"}
]

Be specific and descriptive. Use 2-4 words per value. Do not include any text outside the JSON array.`

    console.log("[v0] Sending request to OpenAI GPT-4o vision model...")
    console.log("[v0] Analysis prompt length:", analysisPrompt.length, "characters")

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: analysisPrompt,
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "high",
              },
            },
          ],
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    })

    console.log("[v0] OpenAI response received")
    console.log("[v0] Response usage:", JSON.stringify(response.usage))

    const content = response.choices[0]?.message?.content
    console.log("[v0] Raw AI response content:", content)

    if (!content) {
      console.error("[v0] No content in AI response")
      throw new Error("No content in AI response")
    }

    // Extract JSON from the response (handle cases where AI adds markdown formatting)
    let jsonText = content.trim()

    // Remove markdown code blocks if present
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "")
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/g, "")
    }

    jsonText = jsonText.trim()
    console.log("[v0] Cleaned JSON text:", jsonText)

    // Parse the JSON
    const attributes = JSON.parse(jsonText)
    console.log("[v0] Parsed attributes:", JSON.stringify(attributes, null, 2))

    // Validate the structure
    if (!Array.isArray(attributes)) {
      console.error("[v0] Response is not an array:", typeof attributes)
      throw new Error("AI response is not an array")
    }

    if (attributes.length === 0) {
      console.error("[v0] Empty attributes array")
      throw new Error("AI returned empty attributes array")
    }

    // Validate each attribute has the correct structure
    const validAttributes = attributes.filter((attr) => {
      const isValid =
        attr && typeof attr === "object" && typeof attr.trait_type === "string" && typeof attr.value === "string"
      if (!isValid) {
        console.warn("[v0] Invalid attribute structure:", attr)
      }
      return isValid
    })

    console.log("[v0] Valid attributes count:", validAttributes.length)
    console.log("[v0] ========== AI IMAGE ANALYSIS SUCCESS ==========")

    return validAttributes
  } catch (error) {
    console.error("[v0] ========== AI IMAGE ANALYSIS ERROR ==========")
    console.error("[v0] Error type:", error instanceof Error ? error.constructor.name : typeof error)
    console.error("[v0] Error message:", error instanceof Error ? error.message : String(error))
    console.error("[v0] Full error:", error)
    console.error("[v0] ========== USING FALLBACK ATTRIBUTES ==========")

    // Return fallback attributes based on the prompt if available
    const fallbackAttributes: Array<{ trait_type: string; value: string }> = [
      { trait_type: "Art Style", value: "Digital Art" },
      { trait_type: "Quality", value: "High Detail" },
      { trait_type: "Generation", value: "AI Generated" },
    ]

    if (prompt) {
      // Try to extract some basic info from the prompt
      const lowerPrompt = prompt.toLowerCase()

      if (lowerPrompt.includes("dragon")) {
        fallbackAttributes.push({ trait_type: "Main Subject", value: "Dragon" })
      } else if (lowerPrompt.includes("robot") || lowerPrompt.includes("cyborg")) {
        fallbackAttributes.push({ trait_type: "Main Subject", value: "Robot" })
      } else if (lowerPrompt.includes("character") || lowerPrompt.includes("person")) {
        fallbackAttributes.push({ trait_type: "Main Subject", value: "Character" })
      }

      if (lowerPrompt.includes("cyberpunk")) {
        fallbackAttributes.push({ trait_type: "Theme", value: "Cyberpunk" })
      } else if (lowerPrompt.includes("fantasy")) {
        fallbackAttributes.push({ trait_type: "Theme", value: "Fantasy" })
      } else if (lowerPrompt.includes("sci-fi") || lowerPrompt.includes("futuristic")) {
        fallbackAttributes.push({ trait_type: "Theme", value: "Sci-Fi" })
      }
    }

    console.log("[v0] Returning fallback attributes:", JSON.stringify(fallbackAttributes, null, 2))
    return fallbackAttributes
  }
}
