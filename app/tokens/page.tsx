"use client"

import { useState, useEffect } from "react"
import { TokenCard } from "@/components/token-card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search, Grid3x3, LayoutGrid } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"

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
}

export default function TokensPage() {
  const [tokens, setTokens] = useState<Token[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState("recent")
  const [viewMode, setViewMode] = useState<"grid" | "large">("grid")
  const [searchQuery, setSearchQuery] = useState("")

  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const urlSearch = searchParams.get("search")
    if (urlSearch) {
      setSearchQuery(urlSearch)
    }
  }, [searchParams])

  useEffect(() => {
    fetchTokens()
  }, [sortBy, searchQuery])

  const fetchTokens = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        sort: sortBy,
        limit: "100",
      })

      if (searchQuery.trim()) {
        params.append("search", searchQuery.trim())
      }

      const response = await fetch(`/api/tokens?${params.toString()}`)
      const data = await response.json()
      setTokens(data.tokens || [])
    } catch (error) {
      console.error("Failed to fetch tokens:", error)
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
    router.push(`/tokens?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold">
          <span className="gradient-text">Token Explorer</span>
        </h1>
        <p className="text-lg text-muted-foreground">
          Discover tokens created using Mintify
        </p>
      </div>

      {/* Search and Sort Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tokens by name, symbol, or description..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 bg-card h-12"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40 bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recently Created</SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
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
        {tokens.length} {tokens.length === 1 ? "token" : "tokens"} found
      </div>

      {/* Token Grid */}
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
      ) : tokens.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">
            {searchQuery ? "No tokens match your search" : "No tokens available yet"}
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
          {tokens.map((token) => (
            <TokenCard key={token.id} token={token} />
          ))}
        </div>
      )}
    </div>
  )
}
