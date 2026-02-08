"use client"

import type React from "react"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Heart } from "lucide-react"
import type { NFT } from "@/lib/types"
import { useWallet } from "@solana/wallet-adapter-react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { RarityBadge } from "@/components/rarity-badge"
import type { getRarityTier } from "@/lib/rarity"

interface NFTCardProps {
  nft: NFT
  variant?: "default" | "collection"
}

export function NFTCard({ nft, variant = "default" }: NFTCardProps) {
  const { publicKey } = useWallet()
  const { toast } = useToast()
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(nft.likes_count || 0)
  const [isLoading, setIsLoading] = useState(false)
  const [rarityData, setRarityData] = useState<{
    percentile: number
    tier: ReturnType<typeof getRarityTier>
  } | null>(null)

  useEffect(() => {
    if (publicKey) {
      fetchLikeStatus()
    }
  }, [publicKey, nft.id])

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

  const fetchLikeStatus = async () => {
    if (!publicKey) return

    try {
      const response = await fetch(`/api/nfts/${nft.id}/like?wallet=${publicKey.toBase58()}`)
      const data = await response.json()
      setIsLiked(data.userHasLiked)
      setLikesCount(data.likesCount)
    } catch (error) {
      console.error("Failed to fetch like status:", error)
    }
  }

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to like NFTs",
        variant: "destructive",
      })
      return
    }

    if (isLoading) return
    setIsLoading(true)

    try {
      if (isLiked) {
        // Unlike
        const response = await fetch(`/api/nfts/${nft.id}/like?wallet=${publicKey.toBase58()}`, {
          method: "DELETE",
        })
        const data = await response.json()
        setIsLiked(false)
        setLikesCount(data.likesCount)
      } else {
        // Like
        const response = await fetch(`/api/nfts/${nft.id}/like`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ walletAddress: publicKey.toBase58() }),
        })
        const data = await response.json()
        setIsLiked(true)
        setLikesCount(data.likesCount)
      }
    } catch (error) {
      console.error("Failed to toggle like:", error)
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const displayPrice = nft.price
  const isListed = nft.is_listed

  const formatPrice = (price: number | string | null | undefined) => {
    if (price === null || price === undefined) return null
    const numPrice = typeof price === "string" ? Number.parseFloat(price) : price
    if (isNaN(numPrice)) return null
    return numPrice % 1 === 0 ? numPrice.toString() : numPrice.toFixed(2).replace(/\.?0+$/, "")
  }

  return (
    <Link href={`/nft/${nft.id}`}>
      <Card className="group cursor-pointer border-2 border-white/10 bg-gradient-to-br from-background via-purple-500/5 to-background backdrop-blur-xl card-hover glow-effect-hover overflow-hidden p-0 shadow-2xl relative">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            background: "linear-gradient(135deg, #9945ff 0%, #14f195 100%)",
          }}
        />
        <CardContent className="p-0 relative z-10">
          <div className="relative aspect-square overflow-hidden bg-muted">
            <Image
              src={nft.image_url || "/placeholder.svg?height=400&width=400"}
              alt={nft.name}
              fill
              loading="eager"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzIxMjEyMSIvPjwvc3ZnPg=="
              className="object-cover transition-all duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {rarityData && (
              <div className="absolute top-3 right-3">
                <RarityBadge tier={rarityData.tier} />
              </div>
            )}
            <button
              className="absolute top-3 left-3 p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all hover:scale-110 disabled:opacity-50"
              onClick={handleLike}
              disabled={isLoading}
            >
              <Heart className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : "text-white"}`} />
            </button>
          </div>

          {/* Info */}
          <div className="p-4">
            <p className="text-xs text-muted-foreground mb-1">{nft.collection_name || "NFT AI"}</p>
            <h3 className="font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors">
              {nft.name}
            </h3>

            <div className="border-t border-white/10 pt-3 mt-3">
              {variant === "collection" ? (
                // Collection variant: Only show price
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Price</p>
                  <p className="font-bold text-lg gradient-text">
                    {isListed && displayPrice ? `${formatPrice(displayPrice)} SOL` : "Not Listed"}
                  </p>
                </div>
              ) : (
                // Default variant: Show price and creator side by side
                <div className="flex items-baseline justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">Price</p>
                    <p className="font-bold text-lg gradient-text">
                      {isListed && displayPrice ? `${formatPrice(displayPrice)} SOL` : "Not Listed"}
                    </p>
                  </div>

                  {/* Creator - Right Side */}
                  {nft.owner_username && (
                    <div className="flex-1 min-w-0 text-right">
                      <p className="text-xs text-muted-foreground mb-1">Creator</p>
                      <p className="font-semibold text-sm truncate">{nft.owner_username}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
