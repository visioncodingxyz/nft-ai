import { sql } from "./db"
import type { NFTAttribute } from "./types"

export interface RarityTier {
  name: string
  emoji: string
  minPercentile: number
}

export const RARITY_TIERS: RarityTier[] = [
  { name: "Legendary", emoji: "🔥", minPercentile: 99 }, // Top 1%
  { name: "Epic", emoji: "💎", minPercentile: 95 }, // Top 5%
  { name: "Rare", emoji: "⭐", minPercentile: 90 }, // Top 10%
  { name: "Common", emoji: "⚪", minPercentile: 0 }, // Everything else
]

export function getRarityTier(percentile: number): RarityTier {
  for (const tier of RARITY_TIERS) {
    if (percentile >= tier.minPercentile) {
      return tier
    }
  }
  return RARITY_TIERS[RARITY_TIERS.length - 1]
}

/**
 * Calculate rarity score for a single NFT based on its attributes
 * Formula: For each trait, (1 / (number of NFTs with trait / total NFTs)) × 100
 */
export async function calculateNFTRarity(nftId: number): Promise<{
  rarityScore: number
  rank: number
  totalNFTs: number
  percentile: number
  tier: RarityTier
}> {
  const nftResult = await sql`
    SELECT attributes, created_at FROM nfts WHERE id = ${nftId}
  `

  if (!nftResult || nftResult.length === 0) {
    throw new Error("NFT not found")
  }

  const nft = nftResult[0]
  const attributes = nft.attributes

  // Parse attributes (handle both array and object formats)
  const attributeEntries: Array<{ trait_type: string; value: any }> = Array.isArray(attributes)
    ? attributes.map((attr: NFTAttribute) => ({ trait_type: attr.trait_type, value: attr.value }))
    : Object.entries(attributes).map(([key, value]) => ({ trait_type: key, value }))

  const totalResult = await sql`
    SELECT COUNT(*)::int as total 
    FROM nfts 
    WHERE rarity_score IS NOT NULL AND rarity_score > 0
  `
  const totalNFTs = totalResult[0].total

  if (totalNFTs === 0) {
    return {
      rarityScore: 0,
      rank: 0,
      totalNFTs: 0,
      percentile: 0,
      tier: RARITY_TIERS[RARITY_TIERS.length - 1],
    }
  }

  // Calculate rarity score for each trait
  let totalRarityScore = 0

  for (const { trait_type, value } of attributeEntries) {
    // Skip prompt attribute as it's unique for each NFT
    if (trait_type.toLowerCase() === "prompt") continue

    // Count how many NFTs have this exact trait_type and value combination
    const countResult = await sql`
      SELECT COUNT(*)::int as count
      FROM nfts
      WHERE 
        CASE 
          WHEN jsonb_typeof(attributes) = 'array' THEN
            EXISTS (
              SELECT 1 FROM jsonb_array_elements(attributes) AS attr
              WHERE attr->>'trait_type' = ${trait_type}
              AND attr->>'value' = ${String(value)}
            )
          ELSE
            attributes->${trait_type} = ${JSON.stringify(value)}
        END
    `

    const traitCount = countResult[0].count

    if (traitCount > 0) {
      // Calculate rarity: (1 / (traitCount / totalNFTs)) × 100
      const traitRarity = (1 / (traitCount / totalNFTs)) * 100
      totalRarityScore += traitRarity
    }
  }

  // Update the NFT's rarity score in the database
  await sql`
    UPDATE nfts
    SET rarity_score = ${totalRarityScore}
    WHERE id = ${nftId}
  `

  await recalculateAllRanks()

  const rankResult = await sql`
    SELECT rarity_rank FROM nfts WHERE id = ${nftId}
  `

  const rank = rankResult[0].rarity_rank || 1

  // Calculate percentile (what percentage of NFTs this is better than)
  const percentile = ((totalNFTs - rank + 1) / totalNFTs) * 100

  const tier = getRarityTier(percentile)

  return {
    rarityScore: Math.round(totalRarityScore * 100) / 100,
    rank,
    totalNFTs,
    percentile: Math.round(percentile * 100) / 100,
    tier,
  }
}

/**
 * Recalculate ranks for all NFTs using batch ranking with tie-breaker
 * Uses ROW_NUMBER() to ensure unique ranks, with older NFTs ranking higher when scores are tied
 */
export async function recalculateAllRanks(): Promise<void> {
  await sql`
    UPDATE nfts
    SET rarity_rank = ranked.rank
    FROM (
      SELECT 
        id,
        ROW_NUMBER() OVER (
          ORDER BY 
            rarity_score DESC NULLS LAST,
            created_at ASC
        ) as rank
      FROM nfts
      WHERE rarity_score IS NOT NULL AND rarity_score > 0
    ) AS ranked
    WHERE nfts.id = ranked.id
  `
}

/**
 * Recalculate rarity for all NFTs in the database
 */
export async function recalculateAllRarities(): Promise<void> {
  const nfts = await sql`SELECT id FROM nfts`

  for (const nft of nfts) {
    await calculateNFTRarity(nft.id)
  }
}

/**
 * Calculate individual trait rarity percentage
 */
export async function calculateTraitRarity(traitType: string, value: any): Promise<number> {
  const totalResult = await sql`SELECT COUNT(*)::int as total FROM nfts`
  const totalNFTs = totalResult[0].total

  if (totalNFTs === 0) return 0

  const countResult = await sql`
    SELECT COUNT(*)::int as count
    FROM nfts
    WHERE 
      CASE 
        WHEN jsonb_typeof(attributes) = 'array' THEN
          EXISTS (
            SELECT 1 FROM jsonb_array_elements(attributes) AS attr
            WHERE attr->>'trait_type' = ${traitType}
            AND attr->>'value' = ${String(value)}
          )
        ELSE
          attributes->${traitType} = ${JSON.stringify(value)}
      END
  `

  const traitCount = countResult[0].count

  // Return percentage of NFTs with this trait
  return Math.round((traitCount / totalNFTs) * 10000) / 100
}
