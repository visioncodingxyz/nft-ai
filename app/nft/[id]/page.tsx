import { NFTDetail } from "@/components/nft-detail"
import { getNFTById } from "@/lib/db"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

interface NFTPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: NFTPageProps): Promise<Metadata> {
  const nft = await getNFTById(Number.parseInt(params.id))

  if (!nft) {
    return {
      title: "NFT Not Found",
    }
  }

  const title = nft.name
  const description = nft.description || `Check out ${nft.name} on our Solana NFT marketplace`
  const imageUrl = nft.image_url

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 1200,
          alt: nft.name,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  }
}

export default async function NFTPage({ params }: NFTPageProps) {
  const nft = await getNFTById(Number.parseInt(params.id))

  if (!nft) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <NFTDetail nft={nft} />
    </div>
  )
}
