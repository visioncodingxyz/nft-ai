"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface NFT {
  id: number
  name: string
  description: string
  image_url: string
  price: number | null
  is_listed: boolean
  collection_name: string | null
  likes_count: number
  attributes: any
  crossmint_id: string
  mint_address: string
}

interface MetadataEditorNFTCardProps {
  nft: NFT
  onEdit: (nft: NFT) => void
}

export function MetadataEditorNFTCard({ nft, onEdit }: MetadataEditorNFTCardProps) {
  const formatPrice = (price: number) => {
    return price % 1 === 0 ? price.toString() : price.toFixed(2).replace(/\.?0+$/, "")
  }

  return (
    <Card className="group cursor-pointer bg-zinc-900/50 border-border card-hover glow-effect-hover overflow-hidden p-0">
      <CardContent className="p-0">
        {/* Image - matches marketplace NFT card */}
        <Link href={`/nft/${nft.id}`}>
          <div className="relative aspect-square overflow-hidden bg-muted">
            <Image
              src={nft.image_url || "/placeholder.svg?height=400&width=400"}
              alt={nft.name}
              fill
              className="object-cover transition-all duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </Link>

        {/* Info - matches marketplace card structure */}
        <div className="p-4">
          <div className="mb-3">
            <p className="text-xs text-muted-foreground mb-1">{nft.collection_name || "NFT AI"}</p>
            <Link href={`/nft/${nft.id}`}>
              <h3 className="font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors">
                {nft.name}
              </h3>
            </Link>
          </div>

          {/* Price display - matches marketplace style */}
          <div className="mb-3">
            <p className="text-xs text-muted-foreground mb-1">Price</p>
            {nft.is_listed && nft.price ? (
              <p className="font-bold text-lg gradient-text">{formatPrice(nft.price)} SOL</p>
            ) : (
              <p className="font-bold text-lg gradient-text">Not Listed</p>
            )}
          </div>

          <Button
            onClick={() => onEdit(nft)}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all"
            size="sm"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Metadata
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
