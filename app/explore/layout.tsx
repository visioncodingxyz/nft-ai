import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Explore NFTs",
  description:
    "Discover and explore thousands of AI-generated NFTs on Solana. Browse unique digital art, filter by collection, and find your next NFT. Real-time Magic Eden pricing and instant trading.",
  keywords: [
    "explore NFTs",
    "Solana NFT gallery",
    "AI art marketplace",
    "browse NFTs",
    "digital art collection",
    "NFT discovery",
    "Magic Eden NFTs",
    "Solana collectibles",
  ],
  openGraph: {
    title: "Explore NFTs",
    description:
      "Discover and explore thousands of AI-generated NFTs on Solana. Browse unique digital art, filter by collection, and find your next NFT.",
    type: "website",
    images: [
      {
        url: "/nft-marketplace-gallery-with-ai-generated-digital-.jpg",
        width: 1200,
        height: 630,
        alt: "Mintify NFT Marketplace Gallery",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Explore NFTs",
    description:
      "Discover and explore thousands of AI-generated NFTs on Solana. Browse unique digital art and find your next NFT.",
    images: ["/nft-marketplace-gallery-with-ai-generated-digital-.jpg"],
  },
}

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
