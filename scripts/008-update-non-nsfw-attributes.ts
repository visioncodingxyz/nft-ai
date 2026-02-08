import { sql } from "../lib/db"

async function updateNonNsfwAttributes() {
  console.log("[v0] Starting retroactive attribute update for non-NSFW NFTs...")

  try {
    // Get all non-NSFW NFTs
    const nfts = await sql`
      SELECT id, image_url, prompt, attributes
      FROM nfts
      WHERE is_nsfw = false
      ORDER BY id
    `

    console.log(`[v0] Found ${nfts.length} non-NSFW NFTs to update`)

    let successCount = 0
    let errorCount = 0

    for (const nft of nfts) {
      try {
        console.log(`[v0] Processing NFT #${nft.id}...`)

        // Call the image analysis API
        const response = await fetch("http://localhost:3000/api/analyze-nft-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl: nft.image_url,
            prompt: nft.prompt || "",
          }),
        })

        if (!response.ok) {
          console.error(`[v0] Failed to analyze NFT #${nft.id}`)
          errorCount++
          continue
        }

        const { attributes: aiAttributes } = await response.json()

        // Get existing attributes
        const existingAttributes = typeof nft.attributes === "string" ? JSON.parse(nft.attributes) : nft.attributes

        // Find Art Style attribute
        const artStyleAttr = Array.isArray(existingAttributes)
          ? existingAttributes.find((attr: any) => attr.trait_type === "Art Style")
          : null

        // Combine Art Style with new AI attributes
        const updatedAttributes = artStyleAttr ? [artStyleAttr, ...aiAttributes] : aiAttributes

        // Update the NFT in the database
        await sql`
          UPDATE nfts
          SET attributes = ${JSON.stringify(updatedAttributes)}
          WHERE id = ${nft.id}
        `

        console.log(`[v0] Successfully updated NFT #${nft.id}`)
        successCount++

        // Add a small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`[v0] Error processing NFT #${nft.id}:`, error)
        errorCount++
      }
    }

    console.log(`[v0] Retroactive update complete!`)
    console.log(`[v0] Success: ${successCount}, Errors: ${errorCount}`)
  } catch (error) {
    console.error("[v0] Fatal error during retroactive update:", error)
    throw error
  }
}

// Run the update
updateNonNsfwAttributes()
  .then(() => {
    console.log("[v0] Script completed successfully")
    process.exit(0)
  })
  .catch((error) => {
    console.error("[v0] Script failed:", error)
    process.exit(1)
  })
