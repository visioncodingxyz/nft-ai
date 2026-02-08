import { type Connection, PublicKey } from "@solana/web3.js"

const MINT_TOKEN_MINT = "24UBwtKAxBg2vx4Ua3fTkR4UBZtnuvKtY5j22i1HoTAX"

export type MintTier = "none" | "creator" | "professional" | "ultimate"

export interface MintTierInfo {
  tier: MintTier
  balance: number
  freeGenerations: number
  discountPercent: number
  tierName: string
}

const TIER_THRESHOLDS = {
  creator: 1_000_000,
  professional: 5_000_000,
  ultimate: 10_000_000,
}

export function getMintTier(balance: number): MintTierInfo {
  // Round up to nearest whole number
  const roundedBalance = Math.ceil(balance)

  console.log("[v0] getMintTier called with balance:", balance, "rounded:", roundedBalance)

  if (roundedBalance >= TIER_THRESHOLDS.ultimate) {
    console.log("[v0] Tier: ultimate")
    return {
      tier: "ultimate",
      balance: roundedBalance,
      freeGenerations: -1, // Unlimited
      discountPercent: 75,
      tierName: "Ultimate",
    }
  } else if (roundedBalance >= TIER_THRESHOLDS.professional) {
    console.log("[v0] Tier: professional")
    return {
      tier: "professional",
      balance: roundedBalance,
      freeGenerations: 25,
      discountPercent: 50,
      tierName: "Professional",
    }
  } else if (roundedBalance >= TIER_THRESHOLDS.creator) {
    console.log("[v0] Tier: creator")
    return {
      tier: "creator",
      balance: roundedBalance,
      freeGenerations: 5,
      discountPercent: 25,
      tierName: "Creator",
    }
  }

  console.log("[v0] Tier: none (no qualifying balance)")
  return {
    tier: "none",
    balance: roundedBalance,
    freeGenerations: 1,
    discountPercent: 0,
    tierName: "None",
  }
}

export async function checkMintTokenBalance(connection: Connection, walletAddress: PublicKey): Promise<MintTierInfo> {
  try {
    const mintPublicKey = new PublicKey(MINT_TOKEN_MINT)

    // Get all token accounts for this wallet with the MINT token mint
    const tokenAccounts = await connection.getTokenAccountsByOwner(walletAddress, {
      mint: mintPublicKey,
    })

    if (tokenAccounts.value.length === 0) {
      return getMintTier(0)
    }

    // Parse the token account data to get the balance
    let totalBalance = 0
    for (const { account } of tokenAccounts.value) {
      const data = account.data
      // Token amount is stored at bytes 64-72 (8 bytes for u64)
      const amount = data.readBigUInt64LE(64)
      totalBalance += Number(amount)
    }

    // Token amounts are stored with decimals, MINT has 9 decimals
    const actualBalance = totalBalance / 1_000_000_000

    console.log("[v0] MINT token balance:", actualBalance)

    return getMintTier(actualBalance)
  } catch (error) {
    console.error("[v0] Error checking MINT token balance:", error)
    return getMintTier(0)
  }
}

export async function checkMintBalanceViaSolscan(walletAddress: string): Promise<MintTierInfo> {
  try {
    const response = await fetch(`/api/mint-balance?address=${walletAddress}`)

    if (!response.ok) {
      throw new Error("Failed to fetch MINT balance")
    }

    const data = await response.json()
    const balance = data.balance || 0

    console.log("[v0] MINT balance from API:", balance)

    return getMintTier(balance)
  } catch (error) {
    console.error("[v0] Error checking MINT balance:", error)
    return getMintTier(0)
  }
}
