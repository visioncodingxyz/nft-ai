import type { Metadata } from "next"
import Link from "next/link"
import { Poppins } from "next/font/google"
import { Sparkles, Wallet, Search, User, Share2, ExternalLink, Zap, Crown, Shield, BookOpen } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Complete guide to creating AI-generated NFTs, earning rewards, and trading on NFT AI. Learn about $NFT tiers, Magic Eden integration, and platform features.",
  openGraph: {
    title: "Documentation",
    description:
      "Complete guide to creating AI-generated NFTs, earning rewards, and trading on NFT AI. Learn about $NFT tiers, Magic Eden integration, and platform features.",
    images: [
      {
        url: "/technical-documentation-interface-with-ai-nft-crea.jpg",
        width: 1200,
        height: 630,
        alt: "NFT AI Documentation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Documentation",
    description:
      "Complete guide to creating AI-generated NFTs, earning rewards, and trading on NFT AI. Learn about $NFT tiers, Magic Eden integration, and platform features.",
    images: ["/technical-documentation-interface-with-ai-nft-crea.jpg"],
  },
}

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-zinc-800/50">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-transparent to-transparent" />
        <div className="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />

        <div className="relative z-10 px-4 py-16 md:py-24 flex justify-center">
          <div className="w-full max-w-4xl">
            <div className="flex flex-col items-center text-center gap-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20">
                <BookOpen className="h-4 w-4 text-purple-400" />
                <span className={`text-sm font-medium text-purple-300 ${poppins.className}`}>Platform Guide</span>
              </div>

              <h1 className={`text-4xl md:text-6xl font-bold gradient-text mythic-brand ${poppins.className}`}>
                Documentation
              </h1>

              <p className={`text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed ${poppins.className}`}>
                Everything you need to know about creating and trading AI-generated NFTs on NFT AI
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-6xl relative z-10">
        <div className="space-y-16">
          <section>
            <div className="text-center mb-10">
              <h2 className={`text-4xl font-bold mb-4 text-white ${poppins.className}`}>$NFT Token Tier System</h2>
              <p className={`text-lg text-muted-foreground max-w-3xl mx-auto ${poppins.className}`}>
                Hold $NFT tokens to unlock exclusive benefits, discounts, and unlimited AI generations
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Base Tier */}
              <div className="gradient-border bg-card/50 backdrop-blur-sm p-6 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-6 w-6 text-gray-400" />
                  <h3 className={`text-xl font-bold ${poppins.className}`}>Base</h3>
                </div>
                <div className="mb-4">
                  <Badge variant="secondary" className="text-xs">
                    0 $NFT
                  </Badge>
                </div>
                <ul className={`space-y-2 text-sm text-muted-foreground ${poppins.className}`}>
                  <li>✓ 1 free AI generation per day</li>
                  <li>✓ Standard minting fees</li>
                  <li>✓ Access to marketplace</li>
                </ul>
              </div>

              {/* Creator Tier */}
              <div className="gradient-border bg-card/50 backdrop-blur-sm p-6 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-6 w-6 text-blue-400" />
                  <h3 className={`text-xl font-bold ${poppins.className}`}>Creator</h3>
                </div>
                <div className="mb-4">
                  <Badge className="text-xs bg-gradient-to-r from-orange-500 via-pink-500 via-purple-500 to-blue-500">
                    1M+ $NFT
                  </Badge>
                </div>
                <ul className={`space-y-2 text-sm text-muted-foreground ${poppins.className}`}>
                  <li>✓ 5 free AI generations per day</li>
                  <li>✓ 25% discount on minting fees</li>
                  <li>✓ Eligible for automatic $SOL rewards</li>
                </ul>
              </div>

              {/* Professional Tier */}
              <div className="gradient-border bg-card/50 backdrop-blur-sm p-6 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Crown className="h-6 w-6 text-purple-400" />
                  <h3 className={`text-xl font-bold ${poppins.className}`}>Professional</h3>
                </div>
                <div className="mb-4">
                  <Badge className="text-xs bg-gradient-to-r from-orange-500 via-pink-500 via-purple-500 to-blue-500">
                    5M+ $NFT
                  </Badge>
                </div>
                <ul className={`space-y-2 text-sm text-muted-foreground ${poppins.className}`}>
                  <li>✓ 25 free AI generations per day</li>
                  <li>✓ 50% discount on fees</li>
                  <li>✓ Priority support from our team</li>
                  <li>✓ Early access to new features</li>
                </ul>
              </div>

              {/* Ultimate Tier */}
              <div className="gradient-border bg-card/50 backdrop-blur-sm p-6 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="h-6 w-6 text-yellow-400" />
                  <h3 className={`text-xl font-bold ${poppins.className}`}>Ultimate</h3>
                </div>
                <div className="mb-4">
                  <Badge className="text-xs bg-gradient-to-r from-orange-500 via-pink-500 via-purple-500 to-blue-500">
                    10M+ $NFT
                  </Badge>
                </div>
                <ul className={`space-y-2 text-sm text-muted-foreground ${poppins.className}`}>
                  <li>✓ Unlimited AI generations</li>
                  <li>✓ 75% discount on all platform fees</li>
                  <li>✓ DAO governance voting rights</li>
                  <li>✓ Revenue share from platform</li>
                </ul>
              </div>
            </div>

            <div className="gradient-border bg-card/50 backdrop-blur-sm p-6 rounded-lg text-center">
              <p className={`text-muted-foreground mb-4 ${poppins.className}`}>
                Ready to unlock more benefits? Purchase $NFT tokens on Jupiter DEX
              </p>
              <a
                href="https://jup.ag/swap?sell=So11111111111111111111111111111111111111112&buy=24UBwtKAxBg2vx4Ua3fTkR4UBZtnuvKtY5j22i1HoTAX"
                target="_blank"
                rel="noopener noreferrer"
                className="relative z-20 inline-flex items-center justify-center gap-2 text-white gradient-purple-gold hover:opacity-90 transition-all px-6 py-3 rounded-lg font-semibold cursor-pointer hover:scale-105"
                style={{ pointerEvents: "auto" }}
              >
                Buy $NFT on Jupiter
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </section>

          {/* Getting Started */}
          <section>
            <h2 className={`text-3xl font-bold mb-6 flex items-center gap-3 ${poppins.className}`}>
              <Wallet className="h-8 w-8 text-primary" />
              Getting Started
            </h2>

            <div className={`space-y-6 text-muted-foreground leading-relaxed ${poppins.className}`}>
              <div className="gradient-border bg-card/50 backdrop-blur-sm p-6 rounded-lg">
                <h3 className={`text-xl font-semibold text-white mb-3 ${poppins.className}`}>1. Connect Your Wallet</h3>
                <p className={`mb-2 ${poppins.className}`}>
                  To use NFT AI, you'll need a Solana wallet. We support popular wallets like Phantom, Solflare, and
                  more.
                </p>
                <ul className={`list-disc list-inside space-y-2 ml-4 ${poppins.className}`}>
                  <li>Click the "Connect Wallet" button in the top right corner</li>
                  <li>Select your preferred wallet from the list</li>
                  <li>Approve the connection request in your wallet</li>
                  <li>Once connected, you'll be prompted to create your profile</li>
                </ul>
              </div>

              <div className="gradient-border bg-card/50 backdrop-blur-sm p-6 rounded-lg">
                <h3 className={`text-xl font-semibold text-white mb-3 ${poppins.className}`}>2. Set Up Your Profile</h3>
                <p className={`mb-2 ${poppins.className}`}>
                  After connecting your wallet for the first time, you'll create your profile:
                </p>
                <ul className={`list-disc list-inside space-y-2 ml-4 ${poppins.className}`}>
                  <li>Choose a unique username (letters, numbers, and underscores only)</li>
                  <li>Upload a profile picture</li>
                  <li>Add a bio to tell others about yourself (optional)</li>
                  <li>Your profile is linked to your wallet address</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Creating NFTs */}
          <section>
            <h2 className={`text-3xl font-bold mb-6 flex items-center gap-3 ${poppins.className}`}>
              <Sparkles className="h-8 w-8 text-primary" />
              Creating NFTs with AI
            </h2>

            <div className={`space-y-6 text-muted-foreground leading-relaxed ${poppins.className}`}>
              <div className="gradient-border bg-card/50 backdrop-blur-sm p-6 rounded-lg">
                <h3 className={`text-xl font-semibold text-white mb-3 ${poppins.className}`}>AI-Powered Generation</h3>
                <p className={`mb-2 ${poppins.className}`}>
                  NFT AI uses DALL-E 3 to generate unique NFT artwork. Here's how to create your first NFT:
                </p>
                <ul className={`list-disc list-inside space-y-2 ml-4 ${poppins.className}`}>
                  <li>
                    Navigate to the{" "}
                    <Link
                      href="/create"
                      className="relative z-20 text-primary hover:underline cursor-pointer hover:text-primary/80 transition-colors"
                      style={{ pointerEvents: "auto" }}
                    >
                      Create page
                    </Link>
                  </li>
                  <li>Connect your wallet to access generation features</li>
                  <li>Enter a detailed prompt describing the artwork you want to generate</li>
                  <li>Select an art style (Digital Art, Oil Painting, Watercolor, etc.)</li>
                  <li>Click "Generate NFT" and wait for the AI to create your artwork</li>
                  <li>Review the generated image and mint it to the Solana blockchain</li>
                </ul>
              </div>

              <div className="gradient-border bg-card/50 backdrop-blur-sm p-6 rounded-lg">
                <h3 className={`text-xl font-semibold text-white mb-3 ${poppins.className}`}>
                  Daily Generation Limits
                </h3>
                <p className={`mb-2 ${poppins.className}`}>
                  Your daily generation limit depends on your $NFT token holdings:
                </p>
                <ul className={`list-disc list-inside space-y-2 ml-4 ${poppins.className}`}>
                  <li>Generation limits reset every 24 hours automatically</li>
                  <li>Hold more $NFT tokens to unlock higher daily limits</li>
                  <li>Ultimate tier (10M+ $NFT) gets unlimited generations</li>
                  <li>Track your remaining generations on the Create page</li>
                </ul>
              </div>

              <div className="gradient-border bg-card/50 backdrop-blur-sm p-6 rounded-lg">
                <h3 className={`text-xl font-semibold text-white mb-3 ${poppins.className}`}>Minting Process</h3>
                <p className={`mb-2 ${poppins.className}`}>Once you're happy with your generated artwork:</p>
                <ul className={`list-disc list-inside space-y-2 ml-4 ${poppins.className}`}>
                  <li>Base minting fee is 0.02 SOL (discounted based on your tier)</li>
                  <li>The NFT is automatically minted to your connected wallet</li>
                  <li>Your NFT is stored on the Solana blockchain</li>
                  <li>Images are permanently stored on IPFS via Vercel Blob</li>
                  <li>After minting, you'll be redirected to your NFT's detail page</li>
                </ul>
              </div>

              <div className="gradient-border bg-card/50 backdrop-blur-sm p-6 rounded-lg">
                <h3 className={`text-xl font-semibold text-white mb-3 ${poppins.className}`}>
                  Tips for Better Results
                </h3>
                <ul className={`list-disc list-inside space-y-2 ml-4 ${poppins.className}`}>
                  <li>Be specific and descriptive in your prompts</li>
                  <li>Include details about colors, mood, and composition</li>
                  <li>Experiment with different art styles to find your aesthetic</li>
                  <li>Try multiple generations to get the perfect result</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Magic Eden Integration */}
          <section>
            <h2 className={`text-3xl font-bold mb-6 flex items-center gap-3 ${poppins.className}`}>
              <ExternalLink className="h-8 w-8 text-primary" />
              Magic Eden Integration
            </h2>

            <div className={`space-y-6 text-muted-foreground leading-relaxed ${poppins.className}`}>
              <div className="gradient-border bg-card/50 backdrop-blur-sm p-6 rounded-lg">
                <h3 className={`text-xl font-semibold text-white mb-3 ${poppins.className}`}>List & Trade NFTs</h3>
                <p className={`mb-2 ${poppins.className}`}>
                  NFT AI integrates with Magic Eden, Solana's leading NFT marketplace:
                </p>
                <ul className={`list-disc list-inside space-y-2 ml-4 ${poppins.className}`}>
                  <li>View real-time floor prices for NFTs</li>
                  <li>List your NFTs for sale directly on Magic Eden</li>
                  <li>Buy NFTs from other creators</li>
                  <li>Track listing status on your profile's "Listed" tab</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Exploring NFTs */}
          <section>
            <h2 className={`text-3xl font-bold mb-6 flex items-center gap-3 ${poppins.className}`}>
              <Search className="h-8 w-8 text-primary" />
              Exploring & Discovering NFTs
            </h2>

            <div className={`space-y-6 text-muted-foreground leading-relaxed ${poppins.className}`}>
              <div className="gradient-border bg-card/50 backdrop-blur-sm p-6 rounded-lg">
                <h3 className={`text-xl font-semibold text-white mb-3 ${poppins.className}`}>Browse the Marketplace</h3>
                <p className={`mb-2 ${poppins.className}`}>
                  Discover amazing AI-generated NFTs created by the community:
                </p>
                <ul className={`list-disc list-inside space-y-2 ml-4 ${poppins.className}`}>
                  <li>
                    Visit the{" "}
                    <Link
                      href="/explore"
                      className="relative z-20 text-primary hover:underline cursor-pointer hover:text-primary/80 transition-colors"
                      style={{ pointerEvents: "auto" }}
                    >
                      Explore page
                    </Link>{" "}
                    to see all NFTs
                  </li>
                  <li>Use the search bar to find specific NFTs by name or description</li>
                  <li>Filter by collection, creator, or other attributes</li>
                  <li>Click on any NFT to view its full details</li>
                </ul>
              </div>

              <div className="gradient-border bg-card/50 backdrop-blur-sm p-6 rounded-lg">
                <h3 className={`text-xl font-semibold text-white mb-3 ${poppins.className}`}>NFT Details</h3>
                <p className={`mb-2 ${poppins.className}`}>Each NFT page shows comprehensive information:</p>
                <ul className={`list-disc list-inside space-y-2 ml-4 ${poppins.className}`}>
                  <li>High-resolution artwork display</li>
                  <li>NFT name, description, and collection</li>
                  <li>Creator information and profile link</li>
                  <li>Current floor price from Magic Eden</li>
                  <li>Contract address (copyable)</li>
                  <li>Links to view on Helius explorer</li>
                  <li>Share button to post on Twitter/X</li>
                </ul>
              </div>
            </div>
          </section>

          {/* User Profiles */}
          <section>
            <h2 className={`text-3xl font-bold mb-6 flex items-center gap-3 ${poppins.className}`}>
              <User className="h-8 w-8 text-primary" />
              User Profiles
            </h2>

            <div className={`space-y-6 text-muted-foreground leading-relaxed ${poppins.className}`}>
              <div className="gradient-border bg-card/50 backdrop-blur-sm p-6 rounded-lg">
                <h3 className={`text-xl font-semibold text-white mb-3 ${poppins.className}`}>Viewing Profiles</h3>
                <p className={`mb-2 ${poppins.className}`}>Every user has a profile page showing:</p>
                <ul className={`list-disc list-inside space-y-2 ml-4 ${poppins.className}`}>
                  <li>Profile picture and username</li>
                  <li>Bio and wallet address</li>
                  <li>$NFT tier badge (Creator, Professional, or Ultimate)</li>
                  <li>All NFTs created by that user</li>
                  <li>Listed NFTs tab showing active Magic Eden listings</li>
                  <li>Link to view wallet on Solscan</li>
                </ul>
              </div>

              <div className="gradient-border bg-card/50 backdrop-blur-sm p-6 rounded-lg">
                <h3 className={`text-xl font-semibold text-white mb-3 ${poppins.className}`}>Editing Your Profile</h3>
                <p className={`mb-2 ${poppins.className}`}>You can update your profile at any time:</p>
                <ul className={`list-disc list-inside space-y-2 ml-4 ${poppins.className}`}>
                  <li>Click "Edit Profile" on your profile page</li>
                  <li>Or select "Settings" from the wallet dropdown menu</li>
                  <li>Update your username, avatar, or bio</li>
                  <li>Changes are saved immediately</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Sharing & Social Features */}
          <section>
            <h2 className={`text-3xl font-bold mb-6 flex items-center gap-3 ${poppins.className}`}>
              <Share2 className="h-8 w-8 text-primary" />
              Sharing & Social Features
            </h2>

            <div className={`space-y-6 text-muted-foreground leading-relaxed ${poppins.className}`}>
              <div className="gradient-border bg-card/50 backdrop-blur-sm p-6 rounded-lg">
                <h3 className={`text-xl font-semibold text-white mb-3 ${poppins.className}`}>Share Your NFTs</h3>
                <p className={`mb-2 ${poppins.className}`}>Show off your creations to the world:</p>
                <ul className={`list-disc list-inside space-y-2 ml-4 ${poppins.className}`}>
                  <li>Click the share button on any NFT detail page</li>
                  <li>Share directly to Twitter/X with a pre-filled tweet</li>
                  <li>Copy the NFT's contract address to share elsewhere</li>
                  <li>Link to the Helius explorer for blockchain verification</li>
                </ul>
              </div>

              <div className="gradient-border bg-card/50 backdrop-blur-sm p-6 rounded-lg">
                <h3 className={`text-xl font-semibold text-white mb-3 ${poppins.className}`}>Join the Community</h3>
                <p className={`mb-2 ${poppins.className}`}>Connect with other creators and collectors:</p>
                <ul className={`list-disc list-inside space-y-2 ml-4 ${poppins.className}`}>
                  <li>
                    Follow us on{" "}
                    <a
                      href="https://x.com/NFTAI_SOL"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative z-20 text-primary hover:underline cursor-pointer hover:text-primary/80 transition-colors"
                      style={{ pointerEvents: "auto" }}
                    >
                      Twitter/X
                    </a>
                  </li>
                  <li>
                    Join our{" "}
                    <a
                      href="https://t.me/NFTAI_SOL"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative z-20 text-primary hover:underline cursor-pointer hover:text-primary/80 transition-colors"
                      style={{ pointerEvents: "auto" }}
                    >
                      Telegram
                    </a>{" "}
                    community
                  </li>
                  <li>Share your creations with #NFTAI</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Technical Details */}
          <section>
            <h2 className={`text-3xl font-bold mb-6 flex items-center gap-3 ${poppins.className}`}>
              <ExternalLink className="h-8 w-8 text-primary" />
              Technical Details
            </h2>

            <div className={`space-y-6 text-muted-foreground leading-relaxed ${poppins.className}`}>
              <div className="gradient-border bg-card/50 backdrop-blur-sm p-6 rounded-lg">
                <h3 className={`text-xl font-semibold text-white mb-3 ${poppins.className}`}>Blockchain & Storage</h3>
                <ul className={`list-disc list-inside space-y-2 ml-4 ${poppins.className}`}>
                  <li>NFTs are minted on the Solana blockchain</li>
                  <li>Images are stored permanently on IPFS via Vercel Blob</li>
                  <li>Metadata is stored on-chain for permanence</li>
                  <li>All transactions are verified on Solana mainnet</li>
                </ul>
              </div>

              <div className="gradient-border bg-card/50 backdrop-blur-sm p-6 rounded-lg">
                <h3 className={`text-xl font-semibold text-white mb-3 ${poppins.className}`}>AI Generation</h3>
                <ul className={`list-disc list-inside space-y-2 ml-4 ${poppins.className}`}>
                  <li>Powered by OpenAI's DALL-E 3 model</li>
                  <li>High-quality 1024x1024 image generation</li>
                  <li>Multiple art style options available</li>
                  <li>Each generation is unique and original</li>
                </ul>
              </div>

              <div className="gradient-border bg-card/50 backdrop-blur-sm p-6 rounded-lg">
                <h3 className={`text-xl font-semibold text-white mb-3 ${poppins.className}`}>Supported Wallets</h3>
                <ul className={`list-disc list-inside space-y-2 ml-4 ${poppins.className}`}>
                  <li>Phantom</li>
                  <li>Solflare</li>
                  <li>Backpack</li>
                  <li>And other Solana-compatible wallets</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Support */}
          <section className="gradient-border bg-card/50 backdrop-blur-sm p-8 rounded-lg">
            <h2 className={`text-2xl font-bold mb-4 ${poppins.className}`}>Need Help?</h2>
            <p className={`text-muted-foreground mb-4 ${poppins.className}`}>
              If you have questions or need assistance, we're here to help:
            </p>
            <ul className={`space-y-2 text-muted-foreground ${poppins.className}`}>
              <li>
                • Join our{" "}
                <a
                  href="https://t.me/NFTAI_SOL"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative z-20 text-primary hover:underline cursor-pointer hover:text-primary/80 transition-colors"
                  style={{ pointerEvents: "auto" }}
                >
                  Telegram community
                </a>{" "}
                for support
              </li>
              <li>
                • Follow us on{" "}
                <a
                  href="https://x.com/NFTAI_SOL"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative z-20 text-primary hover:underline cursor-pointer hover:text-primary/80 transition-colors"
                  style={{ pointerEvents: "auto" }}
                >
                  Twitter/X
                </a>{" "}
                for updates
              </li>
              <li>
                • Check out the{" "}
                <Link
                  href="/explore"
                  className="relative z-20 text-primary hover:underline cursor-pointer hover:text-primary/80 transition-colors"
                  style={{ pointerEvents: "auto" }}
                >
                  Explore page
                </Link>{" "}
                for inspiration
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
