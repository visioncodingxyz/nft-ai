"use client"

import { MarketplaceGrid } from "@/components/marketplace-grid"
import { MarketplaceFilters } from "@/components/marketplace-filters"
import { useState } from "react"

export default function MarketplacePage() {
  const [priceFilters, setPriceFilters] = useState({ minPrice: 0, maxPrice: 100 })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold">
          <span className="gradient-text">NFT Marketplace</span>
        </h1>
        <p className="text-lg text-muted-foreground">Discover and collect legendary NFTs on Solana</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-4">
          <MarketplaceFilters onFilterChange={setPriceFilters} />
        </aside>

        <main>
          <MarketplaceGrid priceFilters={priceFilters} />
        </main>
      </div>
    </div>
  )
}
