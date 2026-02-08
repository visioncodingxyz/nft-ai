import { neon } from "@neondatabase/serverless"
import type { User } from "./types" // Assuming User type is declared in a separate file

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL

if (!databaseUrl) {
  throw new Error("DATABASE_URL or POSTGRES_URL environment variable is not set")
}

export const sql = neon(databaseUrl)

// Database query helpers
export async function getUserByWallet(wallet: string): Promise<User | null> {
  try {
    const result = await sql`
      SELECT * FROM users WHERE wallet_address = ${wallet} LIMIT 1
    `
    return result[0] || null
  } catch (error) {
    console.error("Failed to get user by wallet:", error)
    return null
  }
}

export async function createUser(data: {
  walletAddress: string
  username?: string
  bio?: string
  avatarUrl?: string
}): Promise<User> {
  const result = await sql`
    INSERT INTO users (wallet_address, username, bio, avatar_url, purchased_generations)
    VALUES (${data.walletAddress}, ${data.username || null}, ${data.bio || null}, ${data.avatarUrl || null}, 1)
    RETURNING *
  `
  return result[0]
}

export async function updateUser(
  wallet: string,
  data: {
    username?: string
    bio?: string
    avatarUrl?: string
  },
): Promise<User> {
  // If no updates provided, just return the existing user
  if (data.username === undefined && data.bio === undefined && data.avatarUrl === undefined) {
    const result = await sql`SELECT * FROM users WHERE wallet_address = ${wallet} LIMIT 1`
    return result[0]
  }

  // Build the update query using tagged template syntax
  const username = data.username !== undefined ? data.username : null
  const bio = data.bio !== undefined ? data.bio : null
  const avatarUrl = data.avatarUrl !== undefined ? data.avatarUrl : null

  const result = await sql`
    UPDATE users
    SET 
      username = COALESCE(${username}, username),
      bio = COALESCE(${bio}, bio),
      avatar_url = COALESCE(${avatarUrl}, avatar_url)
    WHERE wallet_address = ${wallet}
    RETURNING *
  `

  return result[0]
}

export async function getListedNFTs(limit = 50, offset = 0) {
  return await sql`
    SELECT 
      n.*,
      u.username as owner_username,
      u.avatar_url as owner_avatar,
      c.name as collection_name
    FROM nfts n
    LEFT JOIN users u ON n.owner_wallet = u.wallet_address
    LEFT JOIN collections c ON n.collection_id = c.id
    ORDER BY n.created_at DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `
}

export async function getNFTById(id: number) {
  const result = await sql`
    SELECT 
      n.*,
      u.username as owner_username,
      u.avatar_url as owner_avatar,
      c.name as collection_name,
      c.description as collection_description
    FROM nfts n
    LEFT JOIN users u ON n.owner_wallet = u.wallet_address
    LEFT JOIN collections c ON n.collection_id = c.id
    WHERE n.id = ${id}
  `
  return result[0] || null
}

export async function getNFTsByOwner(walletAddress: string) {
  return await sql`
    SELECT 
      n.*,
      c.name as collection_name
    FROM nfts n
    LEFT JOIN collections c ON n.collection_id = c.id
    WHERE n.owner_wallet = ${walletAddress}
    ORDER BY n.created_at DESC
  `
}

export async function getNFTsByCreator(walletAddress: string) {
  return await sql`
    SELECT 
      n.*,
      c.name as collection_name
    FROM nfts n
    LEFT JOIN collections c ON n.collection_id = c.id
    WHERE n.creator_wallet = ${walletAddress}
    ORDER BY n.created_at DESC
  `
}

export async function createNFT(data: {
  mintAddress: string
  name: string
  description: string
  imageUrl: string
  ownerWallet: string
  creatorWallet: string
  attributes?: any
  price?: number
  isListed?: boolean
  isNsfw?: boolean
  collectionId?: string // Added collectionId parameter (Crossmint ID)
  crossmintId?: string // Added crossmintId parameter
}) {
  const DEFAULT_COLLECTION_ID = "d8ad77a2-2812-4d5e-b435-1c7bc82920d7"
  let internalCollectionId: number | null = null

  // Only look up and store collection ID if it's not the default collection
  if (data.collectionId && data.collectionId !== "pending" && data.collectionId !== DEFAULT_COLLECTION_ID) {
    try {
      const collectionResult = await sql`
        SELECT id FROM collections WHERE crossmint_id = ${data.collectionId} LIMIT 1
      `
      if (collectionResult.length > 0) {
        internalCollectionId = collectionResult[0].id
        console.log("[v0] Found collection ID:", internalCollectionId, "for Crossmint ID:", data.collectionId)
      } else {
        console.warn("[v0] Collection not found for Crossmint ID:", data.collectionId)
      }
    } catch (error) {
      console.error("[v0] Error looking up collection:", error)
    }
  } else if (data.collectionId === DEFAULT_COLLECTION_ID) {
    console.log("[v0] Using default Mintify collection, not storing collection_id")
  }

  const result = await sql`
    INSERT INTO nfts (
      mint_address, name, description, image_url, 
      owner_wallet, creator_wallet, attributes, price, is_listed, is_nsfw, collection_id, crossmint_id
    )
    VALUES (
      ${data.mintAddress}, ${data.name}, ${data.description}, ${data.imageUrl},
      ${data.ownerWallet}, ${data.creatorWallet}, ${JSON.stringify(data.attributes || {})},
      ${data.price || null}, ${data.isListed || false}, ${data.isNsfw || false}, ${internalCollectionId}, ${data.crossmintId || null}
    )
    RETURNING *
  `
  return result[0]
}

export async function updateNFTListing(id: number, isListed: boolean, price?: number) {
  const result = await sql`
    UPDATE nfts
    SET is_listed = ${isListed}, price = ${price || null}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `
  return result[0]
}

export async function createTransaction(data: {
  nftId: number
  fromWallet: string
  toWallet: string
  price: number
  transactionHash: string
  transactionType: string
}) {
  const result = await sql`
    INSERT INTO transactions (
      nft_id, from_wallet, to_wallet, price, transaction_hash, transaction_type
    )
    VALUES (
      ${data.nftId}, ${data.fromWallet}, ${data.toWallet}, 
      ${data.price}, ${data.transactionHash}, ${data.transactionType}
    )
    RETURNING *
  `
  return result[0]
}

export async function getTransactionsByWallet(walletAddress: string) {
  return await sql`
    SELECT 
      t.*,
      n.name as nft_name,
      n.image_url as nft_image
    FROM transactions t
    LEFT JOIN nfts n ON t.nft_id = n.id
    WHERE t.from_wallet = ${walletAddress} OR t.to_wallet = ${walletAddress}
    ORDER BY t.created_at DESC
  `
}

export async function likeNFT(nftId: number, walletAddress: string) {
  try {
    // Insert like record
    await sql`
      INSERT INTO nft_likes (nft_id, wallet_address)
      VALUES (${nftId}, ${walletAddress})
      ON CONFLICT (nft_id, wallet_address) DO NOTHING
    `

    // Increment likes count
    await sql`
      UPDATE nfts
      SET likes_count = likes_count + 1
      WHERE id = ${nftId}
    `

    return { success: true }
  } catch (error) {
    console.error("Failed to like NFT:", error)
    throw error
  }
}

export async function unlikeNFT(nftId: number, walletAddress: string) {
  try {
    // Delete the like record
    await sql`
      DELETE FROM nft_likes
      WHERE nft_id = ${nftId} AND wallet_address = ${walletAddress}
    `

    // Always decrement the count after successful DELETE
    // If DELETE didn't find a record, this is idempotent and safe
    await sql`
      UPDATE nfts
      SET likes_count = GREATEST(likes_count - 1, 0)
      WHERE id = ${nftId}
    `

    return { success: true }
  } catch (error) {
    console.error("Failed to unlike NFT:", error)
    throw error
  }
}

export async function getNFTLikes(nftId: number, walletAddress?: string) {
  try {
    console.log("[v0] Getting likes for NFT:", nftId, "wallet:", walletAddress)

    // Get likes count
    const countResult = await sql`
      SELECT likes_count FROM nfts WHERE id = ${nftId}
    `

    console.log("[v0] Count result:", countResult)

    const likesCount = countResult[0]?.likes_count || 0

    // Check if user has liked (if wallet provided)
    let userHasLiked = false
    if (walletAddress) {
      const likeResult = await sql`
        SELECT 1 FROM nft_likes
        WHERE nft_id = ${nftId} AND wallet_address = ${walletAddress}
        LIMIT 1
      `
      userHasLiked = likeResult.length > 0
    }

    console.log("[v0] Returning likes:", { likesCount, userHasLiked })

    return {
      likesCount,
      userHasLiked,
    }
  } catch (error) {
    console.error("[v0] Failed to get NFT likes - Full error:", error)
    console.error("[v0] Error details:", JSON.stringify(error, null, 2))
    return { likesCount: 0, userHasLiked: false }
  }
}

export async function markFreeMintUsed(walletAddress: string): Promise<void> {
  try {
    await sql`
      UPDATE users
      SET free_mint_used = true
      WHERE wallet_address = ${walletAddress}
    `
  } catch (error) {
    console.error("Failed to mark free mint as used:", error)
    throw error
  }
}

export async function getTrendingNFTs(limit = 10) {
  return await sql`
    SELECT 
      n.*,
      u.username as owner_username,
      u.avatar_url as owner_avatar,
      c.name as collection_name
    FROM nfts n
    LEFT JOIN users u ON n.owner_wallet = u.wallet_address
    LEFT JOIN collections c ON n.collection_id = c.id
    WHERE n.likes_count > 0
    ORDER BY n.likes_count DESC, n.created_at DESC
    LIMIT ${limit}
  `
}

export async function updateNFTMetadata(
  id: number,
  data: {
    name?: string
    description?: string
    imageUrl?: string
    attributes?: any
  },
) {
  const result = await sql`
    UPDATE nfts
    SET 
      name = COALESCE(${data.name || null}, name),
      description = COALESCE(${data.description || null}, description),
      image_url = COALESCE(${data.imageUrl || null}, image_url),
      attributes = COALESCE(${data.attributes ? JSON.stringify(data.attributes) : null}, attributes),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `
  return result[0]
}

export async function getNFTByCrossmintId(crossmintId: string) {
  const result = await sql`
    SELECT 
      n.*,
      c.crossmint_id as collection_crossmint_id
    FROM nfts n
    LEFT JOIN collections c ON n.collection_id = c.id
    WHERE n.crossmint_id = ${crossmintId}
  `
  return result[0] || null
}

export async function getTokenByAddress(tokenAddress: string) {
  const result = await sql`
    SELECT * FROM tokens WHERE token_address = ${tokenAddress} LIMIT 1
  `
  return result[0] || null
}

export async function getAllTokens() {
  return await sql`
    SELECT * FROM tokens ORDER BY created_at DESC
  `
}
