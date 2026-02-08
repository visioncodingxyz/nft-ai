import { sql } from "../lib/db"

interface NFT {
  id: number
  image_url: string
  attributes: any
  name: string
  description: string
}

async function analyzeImage(imageUrl: string, prompt: string) {
  try {
    const response = await fetch("http://localhost:3000/api/analyze-nft-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl, prompt }),
    })

    if (!response.ok) {
      console.error(`Failed to analyze image: ${response.statusText}`)
      return null
    }

    const { attributes } = await response.json()
    return attributes
  } catch (error) {
    console.error("Error analyzing image:", error)
    return null
  }
}

async function updateNFTAttributes() {
  console.log("Starting NFT attribute update process...")

  // Get all non-NSFW NFTs that don't have AI-analyzed attributes
  const nfts = (await sql`
    SELECT id, image_url, attributes, name, description
    FROM nfts
    WHERE (attributes->>'nsfwMode')::boolean = false OR attributes->>'nsfwMode' IS NULL
    ORDER BY id ASC
  `) as NFT[]

  console.log(`Found ${nfts.length} non-NSFW NFTs to process`)

  let updated = 0
  let failed = 0

  for (const nft of nfts) {
    console.log(`\nProcessing NFT #${nft.id}: ${nft.name}`)

    // Check if it already has AI-analyzed attributes
    const currentAttrs = nft.attributes || {}
    if (currentAttrs["Color Palette"] && currentAttrs["Mood"]) {
      console.log(`  ✓ Already has AI-analyzed attributes, skipping`)
      continue
    }

    // Extract prompt from attributes if available
    const prompt = currentAttrs.prompt || nft.description || ""

    // Analyze the image
    console.log(`  → Analyzing image...`)
    const analyzedAttributes = await analyzeImage(nft.image_url, prompt)

    if (!analyzedAttributes) {
      console.log(`  ✗ Failed to analyze image`)
      failed++
      continue
    }

    // Merge analyzed attributes with existing attributes
    const updatedAttributes = {
      ...currentAttrs,
    }

    // Add analyzed attributes
    analyzedAttributes.forEach((attr: { trait_type: string; value: string }) => {
      updatedAttributes[attr.trait_type] = attr.value
    })

    // Update the NFT in the database
    try {
      await sql`
        UPDATE nfts
        SET attributes = ${JSON.stringify(updatedAttributes)}
        WHERE id = ${nft.id}
      `
      console.log(
        `  ✓ Updated with attributes:`,
        analyzedAttributes.map((a: any) => `${a.trait_type}: ${a.value}`).join(", "),
      )
      updated++
    } catch (error) {
      console.error(`  ✗ Failed to update database:`, error)
      failed++
    }

    // Add a small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  console.log(`\n=== Update Complete ===`)
  console.log(`Total NFTs processed: ${nfts.length}`)
  console.log(`Successfully updated: ${updated}`)
  console.log(`Failed: ${failed}`)
  console.log(`Skipped (already had attributes): ${nfts.length - updated - failed}`)
}

// Run the update
updateNFTAttributes().catch(console.error)
