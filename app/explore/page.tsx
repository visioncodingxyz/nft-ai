"use client"

import { useState, useEffect } from "react"
import { NFTCard } from "@/components/nft-card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Search, Grid3x3, LayoutGrid } from "lucide-react"
import type { NFT } from "@/lib/types"
import { useSearchParams, useRouter } from "next/navigation"

export default function ExplorePage() {
  const [nfts, setNfts] = useState<NFT[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState("recent")
  const [viewMode, setViewMode] = useState<"grid" | "large">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [nsfwMode, setNsfwMode] = useState(false)

  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const urlSearch = searchParams.get("search")
    if (urlSearch) {
      setSearchQuery(urlSearch)
    }
  }, [searchParams])

  useEffect(() => {
    fetchNFTs()
  }, [sortBy, searchQuery, nsfwMode])

  const fetchNFTs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        sort: sortBy,
        limit: "100",
      })

      if (searchQuery.trim()) {
        params.append("search", searchQuery.trim())
      }

      if (nsfwMode) {
        params.append("nsfwFilter", "nsfw")
      } else {
        params.append("nsfwFilter", "sfw")
      }

      const response = await fetch(`/api/nfts?${params.toString()}`)
      const data = await response.json()
      setNfts(data.nfts || [])
    } catch (error) {
      console.error("Failed to fetch NFTs:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)

    const params = new URLSearchParams(searchParams.toString())
    if (value.trim()) {
      params.set("search", value.trim())
    } else {
      params.delete("search")
    }
    router.push(`/explore?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold">
          <span className="gradient-text">Marketplace</span>
        </h1>
        <p className="text-lg text-muted-foreground">Explore new creations, list NFTs for sale, and buy your favorites.</p>
      </div>

      {/* Search and Sort Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search NFTs by name or description..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 bg-card h-12"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-background/60 backdrop-blur-sm border-2 border-white/10 hover:border-purple-500/40 transition-all duration-300 shadow-md">
            <Label htmlFor="nsfw-mode-explore" className="text-sm font-medium cursor-pointer whitespace-nowrap">
              Enable NSFW Mode
            </Label>
            <Switch
              id="nsfw-mode-explore"
              checked={nsfwMode}
              onCheckedChange={setNsfwMode}
              className="data-[state=checked]:bg-purple-500"
            />
          </div>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40 bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recently Created</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-1 border rounded-md p-1 bg-card">
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 w-8 p-0 ${viewMode === "grid" ? "bg-primary/10" : ""}`}
              onClick={() => setViewMode("grid")}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 w-8 p-0 ${viewMode === "large" ? "bg-primary/10" : ""}`}
              onClick={() => setViewMode("large")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground mb-6">
        {nfts.length} {nfts.length === 1 ? "NFT" : "NFTs"} found
        {nsfwMode && <span className="ml-2 text-purple-400 font-semibold">(NSFW Mode)</span>}
      </div>

      {/* NFT Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-muted rounded-lg mb-3" />
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : nfts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">
            {searchQuery ? "No NFTs match your search" : "No NFTs available yet"}
          </p>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          }
        >
          {nfts.map((nft) => (
            <NFTCard key={nft.id} nft={nft} />
          ))}
        </div>
      )}
    </div>
  )
}
