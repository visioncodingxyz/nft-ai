// Crossmint API integration for NFT minting on Solana

const CROSSMINT_API_KEY = process.env.CROSSMINT_API_KEY
const CROSSMINT_ENV = process.env.CROSSMINT_ENV || "www" // "staging" or "www"
const CROSSMINT_BASE_URL = `https://${CROSSMINT_ENV}.crossmint.com/api/2022-06-09`
const CROSSMINT_COLLECTION_ID = "7acf523c-ca02-46a7-803d-fe8a3204e905"

export interface CrossmintMintRequest {
  recipient: string // Format: "email:user@example.com:solana" or wallet address
  metadata: {
    name: string
    image: string
    description: string
    attributes?: Array<{ trait_type: string; value: string }>
  }
  compressed?: boolean // Use compressed NFTs for lower cost
  reuploadLinkedFiles?: boolean
}

export interface CrossmintMintResponse {
  id: string
  actionId: string
  onChain: {
    status: "pending" | "success" | "failed"
    chain: string
    txId?: string
  }
}

export interface CrossmintActionStatus {
  actionId: string
  action: string
  status: "pending" | "success" | "failed"
  data?: {
    chain: string
    txId: string
    collection: any
    recipient: any
    token: any
  }
  startedAt: string
  completedAt?: string
  resource?: string
}

/**
 * Mint an NFT using Crossmint API
 * @param request - The mint request data
 * @param collectionId - Optional collection ID (defaults to Mythic Labs collection)
 */
export async function mintNFTWithCrossmint(
  request: CrossmintMintRequest,
  collectionId?: string,
): Promise<CrossmintMintResponse> {
  if (!CROSSMINT_API_KEY) {
    throw new Error("CROSSMINT_API_KEY environment variable is not set")
  }

  const targetCollectionId = collectionId || CROSSMINT_COLLECTION_ID
  const url = `${CROSSMINT_BASE_URL}/collections/${targetCollectionId}/nfts`

  console.log("[v0] Crossmint mint request:", {
    url,
    recipient: request.recipient,
    name: request.metadata.name,
    collectionId: targetCollectionId,
  })

  const response = await fetch(url, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "x-api-key": CROSSMINT_API_KEY,
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Unknown error" }))
    console.error("[v0] Crossmint mint error:", error)
    throw new Error(`Crossmint API error: ${error.message || response.statusText}`)
  }

  const result = await response.json()
  console.log("[v0] Crossmint mint response:", result)
  return result
}

/**
 * Check the status of a minting action
 */
export async function checkMintStatus(actionId: string): Promise<CrossmintActionStatus> {
  if (!CROSSMINT_API_KEY) {
    throw new Error("CROSSMINT_API_KEY environment variable is not set")
  }

  const url = `${CROSSMINT_BASE_URL}/actions/${actionId}`

  console.log("[v0] Checking mint status for actionId:", actionId)

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "x-api-key": CROSSMINT_API_KEY,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Unknown error" }))
    console.error("[v0] Crossmint status check error:", error)
    throw new Error(`Crossmint API error: ${error.message || response.statusText}`)
  }

  const result = await response.json()
  console.log("[v0] Crossmint status response:", result)
  return result
}

/**
 * Format recipient address for Crossmint
 * Can be email or wallet address
 */
export function formatRecipient(emailOrWallet: string, chain = "solana"): string {
  // Check if it's an email
  if (emailOrWallet.includes("@")) {
    return `email:${emailOrWallet}:${chain}`
  }
  // Otherwise treat as wallet address
  return emailOrWallet
}
