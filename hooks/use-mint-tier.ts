"use client"

import { useState, useEffect } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { checkMintTokenBalance, type MintTierInfo } from "@/lib/solana-utils"

export function useMintTier() {
  const [tierInfo, setTierInfo] = useState<MintTierInfo>({
    tier: "none",
    balance: 0,
    freeGenerations: 0,
    discountPercent: 0,
    tierName: "None",
  })
  const [isLoading, setIsLoading] = useState(false)
  const { publicKey } = useWallet()
  const { connection } = useConnection()

  useEffect(() => {
    const checkTier = async () => {
      if (!publicKey || !connection) {
        setTierInfo({
          tier: "none",
          balance: 0,
          freeGenerations: 0,
          discountPercent: 0,
          tierName: "None",
        })
        return
      }

      setIsLoading(true)
      try {
        const info = await checkMintTokenBalance(connection, publicKey)
        setTierInfo(info)
      } catch (error) {
        console.error("Failed to check MINT tier:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkTier()
  }, [publicKey, connection])

  return { tierInfo, isLoading, refetch: () => {} }
}
