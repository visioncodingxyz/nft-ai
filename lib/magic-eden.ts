export interface MagicEdenTokenData {
  price?: number // Price in SOL
  listStatus?: string // "listed" or "unlisted"
  isListed: boolean
}

/**
 * @deprecated This function is deprecated. Use database-cached prices instead.
 * Fetch NFT listing data from Magic Eden API via our proxy
 * @param mintAddress - The NFT's mint address
 * @returns Token data including price and listing status
 */
export async function fetchMagicEdenTokenData(mintAddress: string): Promise<MagicEdenTokenData> {
  try {
    console.log(`[v0] Fetching Magic Eden data for mint: ${mintAddress}`)

    const response = await fetch(`/api/magic-eden/${mintAddress}`, {
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      console.log(`[v0] Magic Eden proxy error: ${response.status} for ${mintAddress}`)
      throw new Error(`Magic Eden proxy error: ${response.status}`)
    }

    const data = await response.json()

    console.log(`[v0] Received Magic Eden data:`, data)

    return data
  } catch (error) {
    console.error(`[v0] Failed to fetch Magic Eden data for ${mintAddress}:`, error)
    return {
      isListed: false,
    }
  }
}

export const getMagicEdenNFTData = fetchMagicEdenTokenData
