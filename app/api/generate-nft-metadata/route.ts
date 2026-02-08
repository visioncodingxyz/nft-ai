import { NextResponse } from "next/server"
import { generateText } from "ai"

export async function POST(request: Request) {
  try {
    const { prompt, style } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Generate a creative NFT name based on the prompt
    const { text: name } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `Based on this NFT image description: "${prompt}" with ${style} style, generate a creative, catchy NFT name. 
      
Rules:
- Keep it short (2-4 words max)
- Make it memorable and unique
- Capture the essence of the image
- Don't include "#001" or numbers
- Don't use quotes
- Just return the name, nothing else

Examples:
- "Cosmic Dragon Warrior"
- "Neon City Dreams"
- "Ethereal Phoenix"
- "Cyberpunk Samurai"

Generate the name:`,
      temperature: 0.8,
    })

    // Generate a compelling description
    const { text: description } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `Based on this NFT image description: "${prompt}" with ${style} style, write a compelling 2-3 sentence NFT description.

Rules:
- Make it engaging and artistic
- Highlight unique features
- Create emotional appeal
- Keep it concise but descriptive
- Don't use quotes
- Write in a professional, artistic tone

Generate the description:`,
      temperature: 0.7,
    })

    const cleanName = name.trim().replace(/^["']|["']$/g, "")
    const cleanDescription = description.trim().replace(/^["']|["']$/g, "")

    return NextResponse.json({
      name: cleanName,
      description: cleanDescription,
    })
  } catch (error) {
    console.error("[v0] Generate metadata error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate metadata" },
      { status: 500 },
    )
  }
}
