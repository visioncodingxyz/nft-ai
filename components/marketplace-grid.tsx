"use client"

import { useState, useEffect } from "react"
import { NFTCard } from "@/components/nft-card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search, Grid3x3, LayoutGrid } from "lucide-react"
import type { NFT } from "@/lib/types"

interface MarketplaceGridProps {
  priceFilters?: { minPrice: number; maxPrice: number }
}

export function MarketplaceGrid({ priceFilters }: MarketplaceGridProps) {
  const [nfts, setNfts] = useState<NFT[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState("recent")
  const [viewMode, setViewMode] = useState<"grid" | "large">("grid")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchNFTs()
  }, [sortBy, priceFilters])

  const fetchNFTs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        sort: sortBy,
      })

      if (priceFilters) {
        params.append("minPrice", priceFilters.minPrice.toString())
        params.append("maxPrice", priceFilters.maxPrice.toString())
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

  const filteredNFTs = nfts.filter((nft) => nft.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="space-y-6">
      {/* Search and Sort Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search NFTs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40 bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recently Listed</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="rarity">Rarity</SelectItem>
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
      <div className="text-sm text-muted-foreground">
        {filteredNFTs.length} {filteredNFTs.length === 1 ? "item" : "items"}
      </div>

      {/* NFT Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-muted rounded-lg mb-3" />
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredNFTs.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground">No NFTs found</p>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          }
        >
          {filteredNFTs.map((nft) => (
            <NFTCard key={nft.id} nft={nft} />
          ))}
        </div>
      )}
    </div>
  )
}
