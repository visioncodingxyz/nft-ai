import { NextResponse } from "next/server"
import { put } from "@vercel/blob"

export async function POST(request: Request) {
  try {
    console.log("[v0] Parsing request body...")
    const body = await request.json()
    const { prompt, style, nsfwMode } = body
    console.log("[v0] Request parsed:", { prompt: prompt?.substring(0, 50), style, nsfwMode })

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    if (nsfwMode) {
      // Use Promptchan API for NSFW content
      console.log("[v0] NSFW mode enabled - using Promptchan API")

      const PROMPTCHAN_API_KEY = process.env.PROMPTCHAN_API_KEY

      if (!PROMPTCHAN_API_KEY) {
        console.log("[v0] Missing PROMPTCHAN_API_KEY")
        return NextResponse.json(
          {
            error: "NO_API_KEY",
            message:
              "Promptchan API key is required for NSFW mode. Please add PROMPTCHAN_API_KEY to your environment variables.",
          },
          { status: 400 },
        )
      }

      // Map style to Promptchan styles
      const styleMapping: Record<string, string> = {
        realistic: "Hyperreal XL+",
        "digital-art": "Cinematic",
        anime: "Anime XL+",
        "oil-painting": "Oil Painting",
        cyberpunk: "Cyberpunk",
        fantasy: "Fantasy",
        abstract: "Abstract",
      }

      const promptchanPayload = {
        prompt: prompt,
        negative_prompt: "low quality, blurry, distorted, deformed",
        style: styleMapping[style] || "Cinematic",
        poses: "Default",
        filter: "Default",
        emotion: "Default",
        quality: "Ultra",
        image_size: "512x512",
        age_slider: 25,
        weight_slider: 0,
        breast_slider: 0,
        ass_slider: 0,
        seed: Math.floor(Math.random() * 1000000),
      }

      console.log("[v0] Making request to Promptchan API")
      const response = await fetch("https://prod.aicloudnetservices.com/api/external/create", {
        method: "POST",
        headers: {
          "x-api-key": PROMPTCHAN_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(promptchanPayload),
      })

      console.log(`[v0] Promptchan API response status: ${response.status}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] Promptchan API error:", errorText)

        let errorMessage = "Failed to generate image with Promptchan API"
        try {
          const errorData = JSON.parse(errorText)
          if (errorData.error === "Insufficient gems") {
            errorMessage = "Insufficient gems in your Promptchan account. Please top up at promptchan.com/gems"
          } else if (errorData.error === "Invalid API key") {
            errorMessage = "Invalid Promptchan API key. Please check your API key configuration."
          } else if (errorData.error) {
            errorMessage = `Promptchan API error: ${errorData.error}`
          }
        } catch (e) {
          // Use default error message
        }

        return NextResponse.json(
          {
            error: "API_ERROR",
            message: errorMessage,
          },
          { status: response.status },
        )
      }

      const data = await response.json()
      console.log("[v0] Promptchan API response received successfully")

      if (!data.image) {
        return NextResponse.json({ error: "No image URL returned from Promptchan API" }, { status: 500 })
      }

      // Download and upload to Vercel Blob
      console.log("[v0] Downloading image from Promptchan...")
      const imageResponse = await fetch(data.image)
      if (!imageResponse.ok) {
        throw new Error("Failed to download generated image from Promptchan")
      }

      const imageBlob = await imageResponse.blob()

      console.log("[v0] Uploading image to Vercel Blob...")
      const filename = `nft-nsfw-${Date.now()}-${Math.random().toString(36).substring(7)}.png`
      const blob = await put(filename, imageBlob, {
        access: "public",
        contentType: "image/png",
      })

      console.log("[v0] Image uploaded to Blob:", blob.url)

      return NextResponse.json({
        imageUrl: blob.url,
        prompt: prompt,
        blobUrl: blob.url,
        model: "promptchan-ai",
      })
    } else {
      // Use DALL-E for SFW content
      console.log("[v0] SFW mode - using DALL-E")

      const stylePrompts: Record<string, string> = {
        realistic: "photorealistic, highly detailed, professional photography",
        "digital-art": "digital art, vibrant colors, modern illustration",
        anime: "anime style, manga art, Japanese animation",
        "oil-painting": "oil painting, classical art, textured brushstrokes",
        cyberpunk: "cyberpunk aesthetic, neon lights, futuristic, sci-fi",
        fantasy: "fantasy art, magical, epic, detailed illustration",
        abstract: "abstract art, geometric shapes, modern art",
      }

      const enhancedPrompt = `${prompt}, ${stylePrompts[style] || stylePrompts["digital-art"]}, high quality, 4k`

      console.log("[v0] Generating image with DALL-E...")

      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: enhancedPrompt,
          n: 1,
          size: "1024x1024",
          quality: "standard",
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error("[v0] OpenAI API error:", error)
        return NextResponse.json({ error: "Failed to generate image" }, { status: 500 })
      }

      const data = await response.json()
      const tempImageUrl = data.data[0].url

      console.log("[v0] Image generated, downloading from OpenAI...")

      const imageResponse = await fetch(tempImageUrl)
      if (!imageResponse.ok) {
        throw new Error("Failed to download generated image")
      }

      const imageBlob = await imageResponse.blob()

      console.log("[v0] Uploading image to Vercel Blob...")

      const filename = `nft-${Date.now()}-${Math.random().toString(36).substring(7)}.png`
      const blob = await put(filename, imageBlob, {
        access: "public",
        contentType: "image/png",
      })

      console.log("[v0] Image uploaded to Blob:", blob.url)

      return NextResponse.json({
        imageUrl: blob.url,
        prompt: enhancedPrompt,
        blobUrl: blob.url,
        model: "dall-e-3",
      })
    }
  } catch (error) {
    console.error("[v0] Generate NFT error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}
