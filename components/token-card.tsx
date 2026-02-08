"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, ExternalLink } from "lucide-react"

interface Token {
  id: number
  name: string
  symbol: string
  description: string | null
  image_url: string
  mint_address: string
  creator_wallet: string
  initial_buy_amount: string | null
  bonding_curve_address: string | null
  twitter_url: string | null
  telegram_url: string | null
  website_url: string | null
  created_at: string
  launcher_type?: string | null
}

interface TokenCardProps {
  token: Token
}

interface PriceData {
  priceUsd: string | null
  priceChange24h: number | null
  volume24h: number | null
  liquidity: number | null
  marketCap: number | null
}

export function TokenCard({ token }: TokenCardProps) {
  const [priceData, setPriceData] = useState<PriceData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPriceData()
  }, [token.mint_address])

  const fetchPriceData = async () => {
    if (!token.mint_address) {
      console.error("[v0] Token missing mint_address:", token)
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/token-price?mint=${token.mint_address}`)
      const data = await response.json()
      setPriceData(data)
    } catch (error) {
      console.error("[v0] Failed to fetch price data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: string | null) => {
    if (!price) return "N/A"
    const num = Number.parseFloat(price)
    if (num === 0) return "$0.00"
    if (num < 0.00000001) return `$${num.toFixed(10)}`
    if (num < 0.000001) return `$${num.toFixed(8)}`
    if (num < 0.01) return `$${num.toFixed(6)}`
    if (num < 1) return `$${num.toFixed(4)}`
    return `$${num.toFixed(2)}`
  }

  const formatVolume = (volume: number | null) => {
    if (!volume) return "N/A"
    if (volume >= 1000000) return `$${(volume / 1000000).toFixed(2)}M`
    if (volume >= 1000) return `$${(volume / 1000).toFixed(2)}K`
    return `$${volume.toFixed(2)}`
  }

  const priceChange = priceData?.priceChange24h || 0
  const isPositive = priceChange >= 0

  const getDexLogo = (launcherType: string | null | undefined) => {
    if (launcherType === "raydium") {
      return "/images/raydium-logo.png"
    }
    if (launcherType === "bonding") {
      return "/images/meteora-logo.png"
    }
    if (launcherType === "pumpfun") {
      return "/images/pumpfun-logo.png"
    }
    return null
  }

  const dexLogo = getDexLogo(token.launcher_type)

  return (
    <Link href={`/token/${token.mint_address}`}>
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
              src={token.image_url || "/placeholder.svg?height=400&width=400"}
              alt={token.name}
              fill
              className="object-cover transition-all duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {dexLogo && (
              <div className="absolute top-3 right-3 z-20">
                <div className="p-2 rounded-full bg-black/60 backdrop-blur-sm border border-white/20">
                  <Image
                    src={dexLogo || "/placeholder.svg"}
                    alt="DEX Logo"
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                </div>
              </div>
            )}

            {(token.twitter_url || token.telegram_url || token.website_url) && (
              <div className="absolute top-3 left-3 flex gap-2 z-20">
                {token.website_url && (
                  <a
                    href={token.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all hover:scale-110"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-3 w-3 text-white" />
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="p-4">
            <div className="mb-3 flex items-center gap-2 min-w-0">
              <h3 className="font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors flex-shrink min-w-0">
                {token.name}
              </h3>
              <Badge className="gradient-purple-gold text-white border-0 font-bold px-2 py-0.5 text-xs flex-shrink-0 whitespace-nowrap">
                ${token.symbol}
              </Badge>
            </div>

            {loading ? (
              <div className="space-y-2">
                <div className="h-6 bg-muted rounded animate-pulse" />
                <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Price</p>
                    <p className="font-bold text-lg gradient-text">{formatPrice(priceData?.priceUsd || null)}</p>
                  </div>
                  {priceData?.priceChange24h !== null && priceData?.priceChange24h !== 0 && (
                    <div className="flex-1 text-right">
                      <p className="text-xs text-muted-foreground mb-1">24h Change</p>
                      <div
                        className={`inline-flex items-center gap-1 font-semibold text-sm ${
                          isPositive ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {isPositive ? "+" : ""}
                        {priceChange.toFixed(2)}%
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Volume 24h</p>
                    <p className="font-semibold text-sm">{formatVolume(priceData?.volume24h || null)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground mb-1">Market Cap</p>
                    <p className="font-semibold text-sm">{formatVolume(priceData?.marketCap || null)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
