import { generateText } from "ai"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { prompt, style, nsfwMode, type } = await req.json()

    const styleDescriptions: Record<string, string> = {
      realistic: "photorealistic, highly detailed, professional photography",
      "digital-art": "digital art, vibrant colors, modern illustration",
      anime: "anime style, manga inspired, expressive characters",
      "oil-painting": "oil painting, classical art, textured brushstrokes",
      cyberpunk: "cyberpunk aesthetic, neon lights, futuristic dystopian",
      fantasy: "fantasy art, magical elements, epic composition",
      abstract: "abstract art, geometric shapes, bold colors",
    }

    const styleContext = styleDescriptions[style] || "artistic"

    const isTokenImage = type === "token"
    const imageType = isTokenImage ? "cryptocurrency token logo" : "NFT artwork"
    const tokenGuidance = isTokenImage
      ? `
CRITICAL TOKEN LOGO REQUIREMENTS:
- MUST be a circular coin/token design (perfect circle shape)
- Clean, minimalist, professional branding
- Bold, iconic imagery that works at 32x32px size
- Strong contrast and clear focal point
- No text, letters, or words in the image
- Centered composition with balanced elements
- Think: Bitcoin, Ethereum, Solana logo style
- Suitable for use as app icon or profile picture
- Single dominant color scheme or gradient
- Instantly recognizable symbol or emblem
- Professional cryptocurrency branding aesthetic`
      : ""

    let systemPrompt: string
    let userPrompt: string

    if (!prompt || prompt.trim() === "") {
      // Generate a random creative prompt
      systemPrompt = `You are a creative AI prompt generator for ${nsfwMode ? "Promptchan" : "DALL-E"} image generation. Generate a unique, detailed, and imaginative prompt for creating ${imageType} in the ${style} style (${styleContext}).

The prompt should be:
- Highly descriptive and vivid
- Include specific details about composition, lighting, colors, and mood
- Be optimized for ${nsfwMode ? "Promptchan" : "DALL-E"} to generate stunning artwork
- Be 2-3 sentences long
- Focus on creating something unique and collectible
${nsfwMode ? "- Can include mature themes and artistic nudity if appropriate" : ""}
${tokenGuidance}

Return ONLY the prompt text, nothing else.`

      userPrompt = `Generate a creative and detailed ${nsfwMode ? "Promptchan" : "DALL-E"} prompt for a ${style} style ${imageType}.`
    } else {
      // Enhance the existing prompt
      systemPrompt = `You are an expert at optimizing prompts for ${nsfwMode ? "Promptchan" : "DALL-E"} image generation. Your task is to enhance the user's prompt while PRESERVING their core concept and vision.

CRITICAL: You MUST keep the user's main subject, theme, and concept intact. Only add technical and artistic improvements.

Enhance the prompt by:
- KEEPING the user's original subject and concept (this is mandatory)
- Adding specific artistic details and techniques that complement their vision
- Including composition, lighting, and color guidance that enhances their idea
- Adding quality modifiers (highly detailed, professional, 4K, etc.)
- Making it 2-3 sentences long while preserving their core concept
- Optimizing for ${nsfwMode ? "Promptchan" : "DALL-E"}'s strengths
${isTokenImage ? "- EMPHASIZE circular coin shape, clean logo design, professional branding, and icon-suitable imagery" : ""}
${nsfwMode ? "- Can include mature themes and artistic nudity if appropriate" : ""}
${tokenGuidance}

Example:
User: "a dragon"
Enhanced: "A majestic dragon with iridescent scales, ${styleContext}, dramatic lighting, highly detailed, professional quality"

DO NOT change the user's core concept. DO NOT replace their subject with something else.
Return ONLY the enhanced prompt text, nothing else.`

      userPrompt = `The user wants to create ${imageType} with this concept: "${prompt}"

Enhance this prompt while keeping their exact concept and subject. Style: ${style} (${styleContext})`
    }

    if (nsfwMode) {
      const openrouterApiKey = process.env.OPENROUTER_API_KEY
      if (!openrouterApiKey) {
        return NextResponse.json({ error: "OpenRouter API key not configured" }, { status: 500 })
      }

      console.log("[v0] Using OpenRouter API directly with Llama 70B (NSFW mode)")

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openrouterApiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          "X-Title": "Solana NFT Marketplace",
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3.1-70b-instruct",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.8,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] OpenRouter API error:", errorText)
        throw new Error(`OpenRouter API error: ${response.status}`)
      }

      const data = await response.json()
      const text = data.choices[0]?.message?.content || ""
      const cleanedText = text.trim().replace(/^["']|["']$/g, "")

      return NextResponse.json({ enhancedPrompt: cleanedText })
    }

    console.log("[v0] Using AI SDK with OpenAI (non-NSFW mode)")
    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.8,
    })

    const cleanedText = text.trim().replace(/^["']|["']$/g, "")

    return NextResponse.json({ enhancedPrompt: cleanedText })
  } catch (error) {
    console.error("Error enhancing prompt:", error)
    return NextResponse.json({ error: "Failed to enhance prompt" }, { status: 500 })
  }
}
