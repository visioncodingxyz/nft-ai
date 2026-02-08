import { generateText } from "ai"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { prompt, style } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const systemPrompt = `You are an expert cryptocurrency token branding specialist. Based on the user's token concept, generate professional token metadata that DIRECTLY REFLECTS their vision.

CRITICAL: The metadata MUST be based on and aligned with the user's specific concept. Do not create generic or unrelated token names.

Generate:
1. A catchy, memorable token name (2-4 words max) that DIRECTLY relates to the user's concept
2. A short token symbol (3-5 characters, all caps) derived from the concept or name
3. A compelling description that explains the user's specific token concept, its utility, and value proposition

The metadata should:
- DIRECTLY reflect the user's concept and vision (this is mandatory)
- Sound professional and trustworthy
- Emphasize the specific utility and innovation from their concept
- Be concise and impactful
- Avoid generic crypto buzzwords unless relevant to their concept
- Focus on what makes their specific token unique
- Appeal to potential holders and investors

Example:
User concept: "a cosmic energy DeFi token"
Output: {"name": "Cosmic Energy Protocol", "symbol": "COSMO", "description": "A revolutionary DeFi token harnessing cosmic energy themes to power decentralized finance. Features innovative staking mechanisms and community-driven governance with a space-age aesthetic."}

Return ONLY a JSON object with this exact structure:
{
  "name": "Token Name Based On User Concept",
  "symbol": "SYMB",
  "description": "A compelling 2-3 sentence description that explains the user's specific token concept, its purpose, utility, and value proposition."
}

Do not include any markdown formatting, code blocks, or additional text. Return only the raw JSON object.`

    const userPrompt = `The user wants to create a token with this specific concept: "${prompt}"

Generate token metadata (name, symbol, description) that DIRECTLY reflects this concept. The name and description must be based on their vision, not generic token ideas.

Style context for visual design: ${style}`

    console.log("[v0] Generating token metadata with AI SDK")

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.7,
    })

    // Parse the JSON response
    const cleanedText = text.trim().replace(/```json\n?|\n?```/g, "")
    const metadata = JSON.parse(cleanedText)

    // Validate the response structure
    if (!metadata.name || !metadata.symbol || !metadata.description) {
      throw new Error("Invalid metadata structure returned from AI")
    }

    // Ensure symbol is uppercase and reasonable length
    metadata.symbol = metadata.symbol.toUpperCase().slice(0, 10)

    console.log("[v0] Generated token metadata:", metadata)

    return NextResponse.json(metadata)
  } catch (error) {
    console.error("Error generating token metadata:", error)
    return NextResponse.json(
      { error: "Failed to generate token metadata", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
