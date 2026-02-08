"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { ExternalLink } from "lucide-react"
import type { NFT } from "@/lib/types"
import { RarityBadge } from "@/components/rarity-badge"
import type { getRarityTier } from "@/lib/rarity"

interface MarketplaceNFTCardProps {
  nft: NFT
}

export function MarketplaceNFTCard({ nft }: MarketplaceNFTCardProps) {
  const [rarityData, setRarityData] = useState<{
    percentile: number
    tier: ReturnType<typeof getRarityTier>
  } | null>(null)

  useEffect(() => {
    const fetchRarity = async () => {
      try {
        const response = await fetch(`/api/nfts/${nft.id}/rarity`)

        if (!response.ok) {
          console.error("[v0] Rarity API returned error status:", response.status)
          return
        }

        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          console.error("[v0] Rarity API returned non-JSON response")
          return
        }

        const data = await response.json()

        // Validate that we have the expected data structure
        if (data && typeof data.percentile === "number" && data.tier && !data.error) {
          setRarityData({
            percentile: data.percentile,
            tier: data.tier,
          })
        }
      } catch (error) {
        console.error("[v0] Failed to fetch rarity:", error)
        // Don't set any rarity data on error - component will just not show badge
      }
    }

    fetchRarity()
  }, [nft.id])

  const handleListDelist = () => {
    const magicEdenUrl = `https://magiceden.io/item-details/${nft.mint_address}`
    window.open(magicEdenUrl, "_blank")
  }

  const formatPrice = (price: number) => {
    return price % 1 === 0 ? price.toString() : price.toFixed(2).replace(/\.?0+$/, "")
  }

  const priceData = {
    price: nft.price,
    isListed: nft.is_listed,
  }

  return (
    <Card className="group cursor-pointer bg-zinc-900/50 border-border card-hover glow-effect-hover overflow-hidden p-0">
      <CardContent className="p-0">
        <Link href={`/nft/${nft.id}`}>
          <div className="relative aspect-square overflow-hidden bg-muted">
            <Image
              src={nft.image_url || "/placeholder.svg?height=400&width=400"}
              alt={nft.name}
              fill
              className="object-cover transition-all duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {rarityData && (
              <div className="absolute top-3 right-3">
                <RarityBadge tier={rarityData.tier} />
              </div>
            )}
          </div>
        </Link>

        <div className="p-4">
          <div className="mb-3">
            <p className="text-xs text-muted-foreground mb-1">{nft.collection_name || "NFT AI"}</p>
            <Link href={`/nft/${nft.id}`}>
              <h3 className="font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors">
                {nft.name}
              </h3>
            </Link>
          </div>

          <div className="mb-3">
            <p className="text-xs text-muted-foreground mb-1">Price</p>
            {priceData?.isListed && priceData.price ? (
              <p className="font-bold text-lg gradient-text">{formatPrice(priceData.price)} SOL</p>
            ) : (
              <p className="font-bold text-lg gradient-text">Not Listed</p>
            )}
          </div>

          <Button
            onClick={handleListDelist}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all"
            size="sm"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            {priceData?.isListed ? "Delist NFT" : "List for Sale"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
