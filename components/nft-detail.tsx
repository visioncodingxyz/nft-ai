"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Heart, Share2, ExternalLink, Copy, Check, ShoppingCart, Tag } from "lucide-react"
import type { NFT } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { NFTAttributes } from "@/components/nft-attributes"
import { PriceHistory } from "@/components/price-history"
import { useWallet } from "@solana/wallet-adapter-react"
import { getMagicEdenNFTData } from "@/lib/magic-eden"
import { RarityBadge } from "@/components/rarity-badge"
import type { getRarityTier } from "@/lib/rarity"

interface NFTDetailProps {
  nft: NFT
}

export function NFTDetail({ nft }: NFTDetailProps) {
  const { publicKey } = useWallet()
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(nft.likes_count || 0)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()
  const [priceData, setPriceData] = useState<{ price: number | null; isListed: boolean } | null>(null)
  const [priceLoading, setPriceLoading] = useState(true)
  const [showPromptDialog, setShowPromptDialog] = useState(false)
  const [rarityData, setRarityData] = useState<{
    rarityScore: number
    rank: number
    totalNFTs: number
    percentile: number
    tier: ReturnType<typeof getRarityTier>
  } | null>(null)

  const isCreator = publicKey && nft.creator_wallet === publicKey.toBase58()

  const fetchLikeStatus = async () => {
    try {
      const wallet = publicKey ? `?wallet=${publicKey.toBase58()}` : ""
      const response = await fetch(`/api/nfts/${nft.id}/like${wallet}`)
      const data = await response.json()
      setLikesCount(data.likesCount)
      if (publicKey) {
        setIsLiked(data.userHasLiked)
      }
    } catch (error) {
      console.error("Failed to fetch like status:", error)
    }
  }

  const fetchPriceData = async () => {
    try {
      setPriceLoading(true)
      const data = await getMagicEdenNFTData(nft.mint_address)
      setPriceData(data)
    } catch (error) {
      console.error("[v0] Failed to fetch Magic Eden price:", error)
      setPriceData(null)
    } finally {
      setPriceLoading(false)
    }
  }

  const fetchRarityData = async () => {
    try {
      const response = await fetch(`/api/nfts/${nft.id}/rarity`)
      const data = await response.json()
      setRarityData(data)
    } catch (error) {
      console.error("[v0] Failed to fetch rarity:", error)
    }
  }

  const formatPrice = (price: number) => {
    return price % 1 === 0 ? price.toString() : price.toString().replace(/\.?0+$/, "")
  }

  const handleLike = async () => {
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
        const response = await fetch(`/api/nfts/${nft.id}/like?wallet=${publicKey.toBase58()}`, {
          method: "DELETE",
        })
        const data = await response.json()
        setIsLiked(false)
        setLikesCount(data.likesCount)
        toast({
          title: "Unliked",
          description: "NFT removed from your favorites",
        })
      } else {
        const response = await fetch(`/api/nfts/${nft.id}/like`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ walletAddress: publicKey.toBase58() }),
        })
        const data = await response.json()
        setIsLiked(true)
        setLikesCount(data.likesCount)
        toast({
          title: "Liked!",
          description: "NFT added to your favorites",
        })
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

  const handleShare = () => {
    const text = `Check out my NFT: ${nft.name}`
    const url = window.location.href
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
    window.open(twitterUrl, "_blank", "width=550,height=420")
  }

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(nft.mint_address)
    setCopied(true)
    toast({
      title: "Address Copied!",
      description: "Contract address copied to clipboard",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const handleViewOnExplorer = () => {
    const heliumUrl = `https://orb.helius.dev/address/${nft.mint_address}/history?cluster=mainnet-beta`
    window.open(heliumUrl, "_blank")
  }

  const handleBuy = () => {
    const magicEdenUrl = `https://magiceden.io/item-details/${nft.mint_address}`
    window.open(magicEdenUrl, "_blank")
    toast({
      title: "Opening Magic Eden",
      description: "You'll be redirected to complete your purchase",
    })
  }

  const handleListForSale = () => {
    if (!publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to list NFTs",
        variant: "destructive",
      })
      return
    }
    if (!isCreator) {
      toast({
        title: "Not authorized",
        description: "Only the creator can list this NFT for sale",
        variant: "destructive",
      })
      return
    }
    const magicEdenUrl = `https://magiceden.io/item-details/${nft.mint_address}`
    window.open(magicEdenUrl, "_blank")
  }

  const truncatedPrompt = nft.prompt && nft.prompt.length > 100 ? nft.prompt.slice(0, 100) + "..." : nft.prompt || ""
  const isPromptTruncated = nft.prompt && nft.prompt.length > 100

  useEffect(() => {
    fetchLikeStatus()
    fetchPriceData()
    fetchRarityData()
  }, [nft.id, publicKey])

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Left Column - Image */}
      <div className="space-y-4">
        <Card className="border-gradient glass-effect overflow-hidden p-0">
          <CardContent className="p-0">
            <div className="relative aspect-square bg-muted">
              <Image
                src={nft.image_url || "/placeholder.svg?height=800&width=800"}
                alt={nft.name}
                fill
                className="object-cover"
                priority
              />
              {rarityData && (
                <div className="absolute top-4 right-4">
                  <RarityBadge tier={rarityData.tier} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 bg-transparent" onClick={handleLike} disabled={isLoading}>
            <Heart className={`mr-2 h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
            {likesCount > 0 ? `${likesCount} ${likesCount === 1 ? "Like" : "Likes"}` : "Like"}
          </Button>
          <Button variant="outline" className="flex-1 bg-transparent" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" size="icon" className="bg-transparent" onClick={handleViewOnExplorer}>
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Right Column - Details */}
      <div className="space-y-6">
        {nft.collection_name && (
          <Link href={`/collection/${nft.collection_id}`}>
            <p className="text-sm text-primary hover:underline mb-2">{nft.collection_name}</p>
          </Link>
        )}

        <h1 className="text-4xl font-bold">{nft.name}</h1>

        {rarityData && (
          <div className="text-sm text-muted-foreground">
            Rank: #{rarityData.rank} / {rarityData.totalNFTs} │ Rarity Score: {rarityData.rarityScore}
          </div>
        )}

        <p className="text-muted-foreground leading-relaxed">{nft.description || "No description available"}</p>

        {nft.prompt && (
          <Card className="border-gradient glass-effect">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-2">Generation Prompt</p>
              <div className="text-sm leading-relaxed">
                <span>{truncatedPrompt}</span>
                {isPromptTruncated && (
                  <button
                    onClick={() => setShowPromptDialog(true)}
                    className="text-primary ml-1 font-semibold hover:underline cursor-pointer"
                  >
                    Read more
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-gradient glass-effect">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Current Price</p>
                {priceLoading ? (
                  <div className="h-8 w-32 bg-muted animate-pulse rounded" />
                ) : priceData?.isListed && priceData.price ? (
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      {formatPrice(priceData.price)}
                    </p>
                    <p className="text-xl text-muted-foreground">SOL</p>
                  </div>
                ) : (
                  <p className="text-lg text-muted-foreground">Not Listed</p>
                )}
              </div>

              <div>
                {priceData?.isListed ? (
                  <Button
                    onClick={handleBuy}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Buy Now
                  </Button>
                ) : (
                  <Button
                    onClick={handleListForSale}
                    disabled={!isCreator}
                    variant={isCreator ? "default" : "outline"}
                    className={
                      isCreator
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                        : ""
                    }
                  >
                    <Tag className="mr-2 h-4 w-4" />
                    List for Sale
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Owner Info */}
        <Card className="border-gradient glass-effect">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={nft.owner_avatar || "/placeholder.svg"} />
                  <AvatarFallback>{nft.owner_username?.[0] || "?"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs text-muted-foreground">Owned by</p>
                  <Link href={`/profile/${nft.owner_wallet}`}>
                    <p className="font-semibold hover:text-primary transition-colors">
                      {nft.owner_username ||
                        (nft.owner_wallet
                          ? `${nft.owner_wallet.slice(0, 6)}...${nft.owner_wallet.slice(-4)}`
                          : "Unknown")}
                    </p>
                  </Link>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Creator</p>
                <Link href={`/profile/${nft.creator_wallet}`}>
                  <p className="font-semibold hover:text-primary transition-colors">
                    {nft.creator_wallet
                      ? `${nft.creator_wallet.slice(0, 6)}...${nft.creator_wallet.slice(-4)}`
                      : "Unknown"}
                  </p>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs - Details, Attributes, History */}
        <div className="mb-4">
          <h2 className="text-4xl font-bold mb-3">
            <span className="gradient-text">Features</span>
          </h2>
        </div>
        <Tabs defaultValue="attributes" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-card">
            <TabsTrigger value="attributes">Attributes</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="attributes" className="mt-4">
            <NFTAttributes attributes={nft.attributes || {}} />
          </TabsContent>

          <TabsContent value="details" className="mt-4">
            <Card className="border-gradient glass-effect">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Contract Address</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">
                      {nft.mint_address ? `${nft.mint_address.slice(0, 8)}...${nft.mint_address.slice(-6)}` : "N/A"}
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
                  <span className="font-semibold">Compressed NFT</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Created</span>
                  <span className="text-sm">{new Date(nft.created_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <PriceHistory nftId={nft.id} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog for full prompt display */}
      <Dialog open={showPromptDialog} onOpenChange={setShowPromptDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generation Prompt</DialogTitle>
            <DialogDescription>The full prompt used to generate this NFT</DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{nft.prompt}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
