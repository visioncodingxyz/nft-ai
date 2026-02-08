"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Share2, ExternalLink, Copy, Check, TrendingUp, TrendingDown, Globe, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Token {
  id: number
  name: string
  symbol: string
  description: string | null
  image_url: string
  token_address: string
  creator_wallet: string
  total_supply: string | null
  decimals: number | null
  created_at: string
  metadata: any
}

interface TokenDetailProps {
  token: Token
}

interface PriceData {
  priceUsd: string | null
  priceChange24h: number | null
  volume24h: number | null
  liquidity: number | null
  marketCap: number | null
  pairAddress: string | null
  dexId: string | null
}

declare global {
  interface Window {
    Jupiter: {
      init: (config: any) => void
      close: () => void
      resume: () => void
      _instance?: any
    }
  }
  interface Navigator {
    wallets?: any[]
  }
}

export function TokenDetail({ token }: TokenDetailProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()
  const [priceData, setPriceData] = useState<PriceData | null>(null)
  const [priceLoading, setPriceLoading] = useState(true)

  const [showSwap, setShowSwap] = useState(false)
  const [swapType, setSwapType] = useState<"buy" | "sell">("buy")
  const [jupiterLoaded, setJupiterLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const jupiterInitialized = useRef(false)

  useEffect(() => {
    if (typeof window !== "undefined" && !window.Jupiter) {
      if (typeof navigator !== "undefined" && !navigator.wallets) {
        ;(navigator as any).wallets = []
      }

      const script = document.createElement("script")
      script.src = "https://terminal.jup.ag/main-v4.js"
      script.async = true
      script.onload = () => {
        console.log("[v0] Jupiter Terminal script loaded successfully")
        setJupiterLoaded(true)
      }
      script.onerror = () => {
        console.error("[v0] Failed to load Jupiter Terminal script")
        setError("Failed to load Jupiter Terminal")
      }
      document.head.appendChild(script)

      return () => {
        try {
          document.head.removeChild(script)
        } catch (e) {
          // Script might already be removed
        }
      }
    } else if (window.Jupiter) {
      setJupiterLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (!showSwap || !jupiterLoaded || !window.Jupiter) {
      return
    }

    setLoading(true)
    setError(null)

    const initTimeout = setTimeout(() => {
      const targetElement = document.getElementById("jupiter-terminal")

      console.log("[v0] Jupiter initialization check:", {
        showSwap,
        jupiterLoaded,
        targetElement: !!targetElement,
        windowJupiter: !!window.Jupiter,
        swapType,
      })

      if (!targetElement) {
        console.error("[v0] Jupiter Terminal target element not found")
        setError("Failed to initialize swap interface")
        setLoading(false)
        return
      }

      try {
        // Close any existing instance
        if (window.Jupiter._instance) {
          console.log("[v0] Closing existing Jupiter instance")
          window.Jupiter.close()
          jupiterInitialized.current = false
        }

        // SOL mint address
        const SOL_MINT = "So11111111111111111111111111111111111111112"

        // For "buy": User buys token with SOL (SOL -> Token, lock token as output)
        // For "sell": User sells token for SOL (Token -> SOL, lock token as input)
        const inputMint = swapType === "buy" ? SOL_MINT : token.token_address
        const outputMint = swapType === "buy" ? token.token_address : SOL_MINT
        const fixedMint = token.token_address // Always lock the token side

        const config = {
          displayMode: "integrated",
          integratedTargetId: "jupiter-terminal",
          endpoint: process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com",
          formProps: {
            initialInputMint: inputMint,
            initialOutputMint: outputMint,
            fixedMint: fixedMint,
          },
        }

        console.log(`[v0] Initializing Jupiter Terminal for ${swapType}`, {
          inputMint,
          outputMint,
          fixedMint,
          tokenAddress: token.token_address,
          tokenSymbol: token.symbol,
          config: JSON.stringify(config.formProps),
        })

        window.Jupiter.init(config)
        jupiterInitialized.current = true

        setTimeout(() => {
          console.log("[v0] Jupiter Terminal should be initialized now")
          console.log("[v0] Jupiter instance:", window.Jupiter._instance ? "exists" : "missing")
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error("[v0] Jupiter Terminal initialization error:", error)
        setError("Failed to initialize swap interface")
        setLoading(false)
      }
    }, 300)

    return () => {
      clearTimeout(initTimeout)
    }
  }, [showSwap, jupiterLoaded, token.token_address, swapType, token.symbol])

  const handleOpenSwap = (type: "buy" | "sell") => {
    console.log("[v0] Opening swap dialog:", type)
    setSwapType(type)
    setShowSwap(true)
  }

  const handleCloseSwap = () => {
    if (window.Jupiter && jupiterInitialized.current) {
      try {
        console.log("[v0] Closing Jupiter Terminal")
        window.Jupiter.close()
        jupiterInitialized.current = false
      } catch (e) {
        console.error("[v0] Error closing Jupiter:", e)
      }
    }
    setShowSwap(false)
    setError(null)
    setLoading(false)
  }

  const fetchPriceData = async () => {
    try {
      setPriceLoading(true)
      const response = await fetch(`/api/token-price?mint=${token.token_address}`)
      const data = await response.json()
      setPriceData(data)
    } catch (error) {
      console.error("[v0] Failed to fetch token price:", error)
      setPriceData(null)
    } finally {
      setPriceLoading(false)
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

  const handleShare = () => {
    const text = `Check out ${token.name} (${token.symbol})`
    const url = window.location.href
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
    window.open(twitterUrl, "_blank", "width=550,height=420")
  }

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(token.token_address)
    setCopied(true)
    toast({
      title: "Address Copied!",
      description: "Token address copied to clipboard",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const handleViewOnExplorer = () => {
    const solscanUrl = `https://solscan.io/token/${token.token_address}`
    window.open(solscanUrl, "_blank")
  }

  const handleViewOnDexScreener = () => {
    const dexScreenerUrl = `https://dexscreener.com/solana/${token.token_address}`
    window.open(dexScreenerUrl, "_blank")
  }

  const priceChange = priceData?.priceChange24h || 0
  const isPositive = priceChange >= 0

  useEffect(() => {
    fetchPriceData()
  }, [token.token_address])

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        {/* Left Column - Image & Chart */}
        <div className="space-y-4">
          <Card className="border-gradient glass-effect overflow-hidden p-0">
            <CardContent className="p-0">
              <div className="relative aspect-square bg-muted">
                <Image
                  src={token.image_url || "/placeholder.svg?height=800&width=800"}
                  alt={token.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </CardContent>
          </Card>

          {/* DexScreener Chart Embed */}
          <Card className="border-gradient glass-effect overflow-hidden p-0">
            <CardContent className="p-0">
              <div className="relative w-full" style={{ height: "500px" }}>
                <iframe
                  src={`https://dexscreener.com/solana/${token.token_address}?embed=1&theme=dark&trades=0&info=0`}
                  className="w-full h-full border-0"
                  title="DexScreener Chart"
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent" onClick={handleViewOnExplorer}>
              <ExternalLink className="mr-2 h-4 w-4" />
              Solscan
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent" onClick={handleViewOnDexScreener}>
              <ExternalLink className="mr-2 h-4 w-4" />
              DexScreener
            </Button>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">{token.name}</h1>
            <p className="text-xl text-muted-foreground">${token.symbol}</p>
          </div>

          <p className="text-muted-foreground leading-relaxed">{token.description || "No description available"}</p>

          {/* Price Card */}
          <Card className="border-gradient glass-effect">
            <CardContent className="p-6">
              {priceLoading ? (
                <div className="space-y-4">
                  <div className="h-12 bg-muted animate-pulse rounded" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-16 bg-muted animate-pulse rounded" />
                    <div className="h-16 bg-muted animate-pulse rounded" />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Current Price</p>
                      <p className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        {formatPrice(priceData?.priceUsd || null)}
                      </p>
                    </div>
                    {priceData?.priceChange24h !== null && priceData?.priceChange24h !== 0 && (
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground mb-1">24h Change</p>
                        <div
                          className={`inline-flex items-center gap-2 font-bold text-2xl ${
                            isPositive ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {isPositive ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
                          {isPositive ? "+" : ""}
                          {priceChange.toFixed(2)}%
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-x-8 gap-y-6 pt-4 border-t border-border">
                    <div className="text-left">
                      <p className="text-sm text-muted-foreground mb-2">24h Volume</p>
                      <p className="text-2xl font-bold">{formatVolume(priceData?.volume24h || null)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground mb-2">Market Cap</p>
                      <p className="text-2xl font-bold">{formatVolume(priceData?.marketCap || null)}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-muted-foreground mb-2">Liquidity</p>
                      <p className="text-2xl font-bold">{formatVolume(priceData?.liquidity || null)}</p>
                    </div>
                    {priceData?.dexId && (
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground mb-2">DEX</p>
                        <p className="text-2xl font-bold capitalize">{priceData.dexId}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-gradient glass-effect">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  size="lg"
                  className="h-14 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold text-lg"
                  onClick={() => handleOpenSwap("buy")}
                  disabled={!jupiterLoaded}
                >
                  {jupiterLoaded ? `Buy $${token.symbol}` : "Loading..."}
                </Button>
                <Button
                  size="lg"
                  className="h-14 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-bold text-lg"
                  onClick={() => handleOpenSwap("sell")}
                  disabled={!jupiterLoaded}
                >
                  {jupiterLoaded ? `Sell $${token.symbol}` : "Loading..."}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tabs - Details */}
          <div className="mb-4">
            <h2 className="text-4xl font-bold mb-3">
              <span className="gradient-text">Details</span>
            </h2>
          </div>
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-card">
              <TabsTrigger value="details">Token Info</TabsTrigger>
              <TabsTrigger value="socials">Socials</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-4">
              <Card className="border-gradient glass-effect">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Token Address</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">
                        {token.token_address.slice(0, 8)}...{token.token_address.slice(-6)}
                      </span>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopyAddress}>
                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Blockchain</span>
                    <span className="font-semibold">Solana</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Token Standard</span>
                    <span className="font-semibold">SPL Token</span>
                  </div>
                  {token.decimals !== null && (
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Decimals</span>
                      <span className="font-semibold">{token.decimals}</span>
                    </div>
                  )}
                  {token.total_supply && (
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">Total Supply</span>
                      <span className="font-semibold">{Number(token.total_supply).toLocaleString()}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="socials" className="mt-4">
              <Card className="border-gradient glass-effect">
                <CardContent className="p-4">
                  {token.metadata?.twitter || token.metadata?.telegram || token.metadata?.website ? (
                    <div className="space-y-3">
                      {token.metadata.website && (
                        <a
                          href={token.metadata.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between py-3 px-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Globe className="h-5 w-5 text-muted-foreground" />
                            <span className="font-semibold">Website</span>
                          </div>
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      {token.metadata.twitter && (
                        <a
                          href={
                            token.metadata.twitter.startsWith("http")
                              ? token.metadata.twitter
                              : `https://twitter.com/${token.metadata.twitter.replace("@", "")}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between py-3 px-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <svg className="h-5 w-5 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                            <span className="font-semibold">Twitter</span>
                          </div>
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      {token.metadata.telegram && (
                        <a
                          href={
                            token.metadata.telegram.startsWith("http")
                              ? token.metadata.telegram
                              : `https://t.me/${token.metadata.telegram.replace("@", "")}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between py-3 px-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Send className="h-5 w-5 text-muted-foreground" />
                            <span className="font-semibold">Telegram</span>
                          </div>
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No social links available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Creator Info Card */}
          <Card className="border-gradient glass-effect">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Created by</p>
                  <Link href={`/profile/${token.creator_wallet}`}>
                    <span className="font-semibold hover:text-primary transition-colors font-mono text-sm">
                      {token.creator_wallet.slice(0, 8)}...{token.creator_wallet.slice(-6)}
                    </span>
                  </Link>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Created</p>
                  <span className="font-semibold">{new Date(token.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showSwap} onOpenChange={handleCloseSwap}>
        <DialogContent className="max-w-md p-0 overflow-hidden bg-black border-black">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="text-white">
              {swapType === "buy" ? `Buy ${token.symbol}` : `Sell ${token.symbol}`}
            </DialogTitle>
          </DialogHeader>
          <div className="w-full h-[600px] p-4">
            <div
              id="jupiter-terminal"
              className="w-full h-full rounded-lg overflow-hidden"
              style={{ minHeight: "500px" }}
            />
            {(!jupiterLoaded || loading || error) && (
              <div className="flex items-center justify-center h-full absolute inset-0 bg-black/90">
                <div className="text-center">
                  {error ? (
                    <div className="text-red-500">{error}</div>
                  ) : !jupiterLoaded ? (
                    <div className="text-white">Loading Jupiter Terminal...</div>
                  ) : (
                    <div className="text-white">Initializing swap...</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
