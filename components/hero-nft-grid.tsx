"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import type { NFT } from "@/lib/types"

export function HeroNFTGrid() {
  const [nfts, setNfts] = useState<NFT[]>([])

  useEffect(() => {
    fetchNFTs()
  }, [])

  const fetchNFTs = async () => {
    try {
      const response = await fetch("/api/nfts?limit=50&sort=recent&nsfwFilter=sfw")
      const data = await response.json()
      setNfts(data.nfts || [])
    } catch (error) {
      console.error("Failed to fetch NFTs for hero grid:", error)
    }
  }

  // If we don't have enough NFTs, repeat them to fill the grid
  const gridNFTs = nfts.length > 0 ? [...nfts, ...nfts, ...nfts].slice(0, 60) : []

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="grid grid-cols-6 md:grid-cols-10 lg:grid-cols-12 w-full h-full">
        {gridNFTs.map((nft, index) => (
          <div key={`${nft.id}-${index}`} className="relative aspect-square w-full h-full">
            <Image
              src={nft.image_url || "/placeholder.svg"}
              alt=""
              fill
              priority={index < 36}
              loading={index < 36 ? "eager" : "lazy"}
              fetchPriority={index < 36 ? "high" : "low"}
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzIxMjEyMSIvPjwvc3ZnPg=="
              className="object-cover"
              sizes="(max-width: 768px) 16.66vw, (max-width: 1024px) 10vw, 8.33vw"
            />
            {/* </CHANGE> */}
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/80" />
    </div>
  )
}
