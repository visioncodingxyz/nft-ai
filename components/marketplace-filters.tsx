"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Filter, X } from "lucide-react"

interface MarketplaceFiltersProps {
  onFilterChange?: (filters: { minPrice: number; maxPrice: number }) => void
}

export function MarketplaceFilters({ onFilterChange }: MarketplaceFiltersProps) {
  const [priceRange, setPriceRange] = useState([0, 100])
  const [selectedCollections, setSelectedCollections] = useState<string[]>([])

  const collections = ["Legendary Dragons", "Cyber Punks", "Fantasy Realms", "Abstract Dreams", "AI Creations"]

  useEffect(() => {
    if (onFilterChange) {
      onFilterChange({
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
      })
    }
  }, [priceRange, onFilterChange])

  const handleReset = () => {
    setPriceRange([0, 100])
    setSelectedCollections([])
  }

  const handlePriceRangeChange = (newRange: number[]) => {
    setPriceRange(newRange)
  }

  return (
    <div className="space-y-4">
      <Card className="border-gradient glass-effect">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 px-2">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Status</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="buy-now" defaultChecked />
                <label htmlFor="buy-now" className="text-sm cursor-pointer">
                  Buy Now
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="on-auction" />
                <label htmlFor="on-auction" className="text-sm cursor-pointer">
                  On Auction
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="new" />
                <label htmlFor="new" className="text-sm cursor-pointer">
                  New
                </label>
              </div>
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Price Range (SOL)</Label>
            <div className="space-y-4">
              <Slider
                value={priceRange}
                onValueChange={handlePriceRangeChange}
                max={100}
                step={0.1}
                className="w-full"
              />
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={priceRange[0]}
                  onChange={(e) => handlePriceRangeChange([Number(e.target.value), priceRange[1]])}
                  className="h-9 bg-card"
                  step="0.1"
                  min="0"
                />
                <span className="text-muted-foreground">to</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={priceRange[1]}
                  onChange={(e) => handlePriceRangeChange([priceRange[0], Number(e.target.value)])}
                  className="h-9 bg-card"
                  step="0.1"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Collections */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Collections</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {collections.map((collection) => (
                <div key={collection} className="flex items-center space-x-2">
                  <Checkbox
                    id={collection}
                    checked={selectedCollections.includes(collection)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedCollections([...selectedCollections, collection])
                      } else {
                        setSelectedCollections(selectedCollections.filter((c) => c !== collection))
                      }
                    }}
                  />
                  <label htmlFor={collection} className="text-sm cursor-pointer">
                    {collection}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
