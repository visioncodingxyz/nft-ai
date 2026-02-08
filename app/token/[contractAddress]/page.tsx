import { TokenDetail } from "@/components/token-detail"
import { getTokenByAddress } from "@/lib/db"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

interface TokenPageProps {
  params: {
    contractAddress: string
  }
}

export async function generateMetadata({ params }: TokenPageProps): Promise<Metadata> {
  const token = await getTokenByAddress(params.contractAddress)

  if (!token) {
    return {
      title: "Token Not Found",
    }
  }

  const title = `${token.name} (${token.symbol})`
  const description = token.description || `Check out ${token.name} on our Solana token marketplace`
  const imageUrl = token.image_url

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
          alt: token.name,
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

export default async function TokenPage({ params }: TokenPageProps) {
  const token = await getTokenByAddress(params.contractAddress)

  if (!token) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <TokenDetail token={token} />
    </div>
  )
}
