import type React from "react"
import type { Metadata } from "next"
import { Inter, Poppins } from "next/font/google"
import "./globals.css"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Toaster } from "@/components/ui/toaster"
import { WalletProvider } from "@/lib/wallet-adapter"
import { Analytics } from "@vercel/analytics/react"
import { Suspense } from "react"
import Script from "next/script"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
})

export const metadata: Metadata = {
  metadataBase: new URL("https://mintify.vercel.app"),
  title: {
    default: "NFT AI - AI-Powered NFT Launchpad on Solana",
    template: "%s | NFT AI",
  },
  description:
    "Create stunning AI-generated NFTs in seconds and mint directly to Solana. Discover, buy, and sell unique digital art on our NFT marketplace with Magic Eden integration. Earn $NFT rewards for trading and creating.",
  keywords: [
    "AI NFT generator",
    "Solana NFT marketplace",
    "create NFT with AI",
    "mint NFT Solana",
    "AI art generator",
    "NFT marketplace",
    "Magic Eden integration",
    "discover NFTs",
    "trending NFT collections",
    "AI-powered metadata",
    "Solana blockchain",
    "Web3 marketplace",
    "crypto art",
    "digital collectibles",
    "$NFT token",
    "NFT trading platform",
    "AI token metadata",
    "decentralized marketplace",
    "how to create NFT with AI",
    "best AI NFT generator",
    "Solana NFT minting platform",
    "buy and sell NFTs Solana",
    "AI generated artwork NFT",
    "NFT marketplace with rewards",
    "Magic Eden NFT trading",
    "Solana NFT collection",
    "AI art to NFT",
    "instant NFT creation",
    "NFT rewards program",
    "Web3 NFT platform",
    "decentralized NFT marketplace",
    "AI metadata generator",
    "NFT price tracking",
    "trending Solana NFTs",
    "NFT collection discovery",
    "AI NFT art platform",
  ],
  authors: [{ name: "NFT AI" }],
  creator: "NFT AI",
  publisher: "NFT AI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mintify.vercel.app",
    siteName: "NFT AI",
    title: "NFT AI - AI-Powered NFT Launchpad on Solana",
    description: "Create AI-generated NFTs in seconds | Discover & trade unique digital art | Earn $NFT rewards",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "NFT AI - AI-Powered NFT Launchpad",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@NFTAI_SOL",
    creator: "@NFTAI_SOL",
    title: "NFT AI - AI-Powered NFT Launchpad",
    description: "Create AI-generated NFTs, discover trending collections, and earn $NFT rewards. All on NFT AI.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://mintify.vercel.app",
  },
  verification: {
    // Add your verification codes here when available
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} antialiased dark`}>
      <head>
        <Script id="schema-org-website" type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "NFT AI",
            description:
              "AI-powered platform for generating NFTs, discovering digital art in our marketplace on Solana blockchain",
            url: "https://mintify.vercel.app",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://mintify.vercel.app/explore?search={search_term_string}",
              "query-input": "required name=search_term_string",
            },
            sameAs: ["https://x.com/NFTAI_SOL", "https://t.me/NFTAI_SOL"],
          })}
        </Script>
        <Script id="schema-org-organization" type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "NFT AI",
            url: "https://mintify.vercel.app",
            logo: "/favicon.png",
            description: "Leading AI-powered NFT generation and marketplace platform on Solana blockchain",
            sameAs: ["https://x.com/NFTAI_SOL", "https://t.me/NFTAI_SOL"],
          })}
        </Script>
        <Script id="schema-org-software" type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "NFT AI",
            applicationCategory: "FinanceApplication",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.8",
              ratingCount: "1250",
            },
            description: "Create AI-generated NFTs, discover and trade digital art on Solana blockchain",
          })}
        </Script>
        <Script id="schema-org-faq" type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "How do I create an NFT with AI on NFT AI?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Simply describe your idea in text, and our AI will generate unique artwork in seconds. You can then mint it directly to the Solana blockchain with just a few clicks.",
                },
              },
              {
                "@type": "Question",
                name: "Can I buy and sell NFTs on NFT AI?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes! NFT AI features a full NFT marketplace with Magic Eden integration where you can discover, buy, and sell unique digital art and collectibles.",
                },
              },
              {
                "@type": "Question",
                name: "What is the $NFT token?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "$NFT is our platform reward token. Earn $NFT by trading NFTs, creating content, and participating in the NFT AI ecosystem.",
                },
              },
            ],
          })}
        </Script>
      </head>
      <body className="bg-black text-white">
        <WalletProvider>
          <Suspense fallback={<div>Loading...</div>}>
            <SiteHeader />
            <main className="min-h-screen pt-0">{children}</main>
            <SiteFooter />
            <Toaster />
          </Suspense>
        </WalletProvider>
        <Analytics />
      </body>
    </html>
  )
}
