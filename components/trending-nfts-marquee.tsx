"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import type { NFT } from "@/lib/types"
import { RarityBadge } from "@/components/rarity-badge"
import type { getRarityTier } from "@/lib/rarity"

interface Token {
  id: number
  name: string
  symbol: string
  image_url: string
  mint_address: string
  created_at: string
  price?: number
  price_change_24h?: number
  launcher_type?: string | null
}

interface TokenPriceData {
  priceUsd: string | null
  priceChange24h: number | null
  volume24h: number | null
  liquidity: number | null
  marketCap: number | null
}

export function TrendingNFTsMarquee() {
  const [trendingNFTs, setTrendingNFTs] = useState<NFT[]>([])
  const [loading, setLoading] = useState(true)
  const [nftRarityData, setNftRarityData] = useState<
    Record<number, { percentile: number; tier: ReturnType<typeof getRarityTier> }>
  >({})

  useEffect(() => {
    fetchTrendingData()
  }, [])

  const fetchTrendingData = async () => {
    try {
      const nftsResponse = await fetch("/api/trending-nfts").catch(() => null)

      if (nftsResponse && nftsResponse.ok) {
        try {
          const nftsData = await nftsResponse.json()
          setTrendingNFTs(nftsData.nfts || [])
          if (nftsData.nfts && nftsData.nfts.length > 0) {
            fetchNFTRarityData(nftsData.nfts)
          }
        } catch (error) {
          console.error("Failed to parse NFTs data:", error)
          setTrendingNFTs([])
        }
      }
    } catch (error) {
      console.error("Failed to fetch trending data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchNFTRarityData = async (nfts: NFT[]) => {
    const rarityDataMap: Record<number, any> = {}

    await Promise.all(
      nfts.map(async (nft) => {
        try {
          const response = await fetch(`/api/nfts/${nft.id}/rarity`)
          if (response.ok) {
            const data = await response.json()
            rarityDataMap[nft.id] = {
              percentile: data.percentile,
              tier: data.tier,
            }
          }
        } catch (error) {
          console.error(`Failed to fetch rarity data for NFT ${nft.id}:`, error)
        }
      }),
    )

    setNftRarityData(rarityDataMap)
  }

  const formatPrice = (price: number | undefined | null): string => {
    if (price === undefined || price === null) return "N/A"
    const numPrice = Number(price)
    if (isNaN(numPrice)) return "N/A"
    const formatted = Number.parseFloat(numPrice.toFixed(6))
    return formatted.toString()
  }

  if (loading || trendingNFTs.length === 0) {
    return null
  }

  const displayItems = trendingNFTs
  const duplicatedItems = [...displayItems, ...displayItems, ...displayItems]

  return (
    <section className="w-full bg-gradient-to-r from-background via-muted/30 to-background py-6 border-y border-border overflow-hidden">
      <div className="mb-4 flex items-center justify-center">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">🔥 Trending NFTs</h3>
      </div>

      <div className="relative">
        <div className="flex gap-4 animate-marquee hover:[animation-play-state:paused] will-change-transform">
          {duplicatedItems.map((item, index) => {
            const rank = (index % displayItems.length) + 1
            const linkHref = `/nft/${item.id}`
            const isExternal = false

            const rarityData = nftRarityData[(item as NFT).id]

            return (
              <Link
                key={`${item.id}-${index}`}
                href={linkHref}
                {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="flex-shrink-0 w-64 group"
              >
                <div className="relative bg-card border-2 border-border rounded-lg overflow-hidden transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/20">
                  <div
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{
                      background: "linear-gradient(135deg, #9945ff 0%, #14f195 100%)",
                    }}
                  />

                  <div className="aspect-square relative z-10 overflow-hidden bg-muted">
                    <Image
                      src={item.image_url || "/placeholder.svg"}
                      alt={item.name}
                      fill
                      loading="lazy"
                      placeholder="blur"
                      blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgZmlsbD0iIzIxMjEyMSIvPjwvc3ZnPg=="
                      sizes="256px"
                      className="object-cover transition-transform group-hover:scale-110"
                    />
                    {rarityData && (
                      <div className="absolute top-3 right-3">
                        <RarityBadge tier={rarityData.tier} />
                      </div>
                    )}
                  </div>

                  <div className="p-3 relative z-10">
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <h4 className="font-semibold text-sm truncate text-foreground flex-1">{item.name}</h4>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {(item as NFT).owner_username ||
                          ((item as NFT).owner_wallet ? `${(item as NFT).owner_wallet.slice(0, 6)}...` : "Unknown")}
                      </span>
                    </div>

                    <div className="text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        {formatPrice((item as NFT).price) === "N/A" ? (
                          <span className="text-muted-foreground text-xs">Not Listed</span>
                        ) : (
                          <span
                            className="font-semibold"
                            style={{
                              background: "linear-gradient(135deg, #f59e0b 0%, #ec4899 33%, #a855f7 66%, #3b82f6 100%)",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                              backgroundClip: "text",
                            }}
                          >
                            {formatPrice((item as NFT).price)} SOL
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
