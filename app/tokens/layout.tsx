import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Token Explorer",
  description:
    "Discover and explore Solana tokens created with Mintify's AI-powered Token Launcher. Browse tokens launched on Raydium, PumpFun, and Bonding Curve platforms.",
  keywords: [
    "solana tokens",
    "token explorer",
    "AI token creation",
    "mintify tokens",
    "raydium tokens",
    "pumpfun tokens",
    "bonding curve tokens",
    "solana token launcher",
    "discover tokens",
    "browse tokens",
    "token marketplace",
    "SPL tokens",
    "solana SPL",
    "token search",
  ],
  openGraph: {
    title: "Token Explorer | Mintify",
    description:
      "Discover and explore Solana tokens created with Mintify's AI-powered Token Launcher. Browse tokens launched on Raydium, PumpFun, and Bonding Curve platforms.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Token Explorer | Mintify",
    description:
      "Discover and explore Solana tokens created with Mintify's AI-powered Token Launcher. Browse tokens launched on Raydium, PumpFun, and Bonding Curve platforms.",
  },
}

export default function TokensLayout({ children }: { children: React.ReactNode }) {
  return children
}
