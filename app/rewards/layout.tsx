import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Rewards",
  description:
    "Earn passive SOL rewards every 15 minutes by holding $NFT tokens. Track live distributions, view your earnings, and claim your share of platform revenue. No staking required.",
  keywords: [
    "$NFT rewards",
    "SOL rewards",
    "passive income crypto",
    "Solana rewards",
    "crypto earnings",
    "NFT rewards",
    "token holder benefits",
    "automatic airdrops",
    "DeFi rewards",
  ],
  openGraph: {
    title: "Rewards",
    description:
      "Earn passive SOL rewards every 15 minutes by holding $NFT tokens. Track live distributions and claim your share of platform revenue.",
    type: "website",
    images: [
      {
        url: "/cryptocurrency-rewards-dashboard-with-sol-tokens-a.jpg",
        width: 1200,
        height: 630,
        alt: "Mintify Rewards Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rewards",
    description:
      "Earn passive SOL rewards every 15 minutes by holding $NFT tokens. No staking required - just hold and earn.",
    images: ["/cryptocurrency-rewards-dashboard-with-sol-tokens-a.jpg"],
  },
}

export default function RewardsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
