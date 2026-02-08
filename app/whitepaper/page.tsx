import type { Metadata } from "next"
import Link from "next/link"
import { Poppins } from "next/font/google"
import {
  Coins,
  TrendingUp,
  Rocket,
  CheckCircle2,
  Clock,
  Gift,
  Flame,
  Users,
  Smartphone,
  Building2,
  Megaphone,
  Zap,
  Shield,
  Sparkles,
  Bot,
  Wallet,
  FileText,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: "Whitepaper",
  description:
    "Discover the $NFT token ecosystem with 1B supply, 5% tax structure, automatic SOL rewards every 15 minutes, and our roadmap for the future of AI-powered NFTs on Solana.",
  openGraph: {
    title: "Whitepaper",
    description:
      "Discover the $NFT token ecosystem with 1B supply, 5% tax structure, automatic SOL rewards every 15 minutes, and our roadmap for the future of AI-powered NFTs on Solana.",
    images: [
      {
        url: "/cryptocurrency-whitepaper-with-tokenomics-charts-a.jpg",
        width: 1200,
        height: 630,
        alt: "NFT AI Whitepaper",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Whitepaper",
    description:
      "Discover the $NFT token ecosystem with 1B supply, 5% tax structure, automatic SOL rewards every 15 minutes, and our roadmap for the future of AI-powered NFTs on Solana.",
    images: ["/cryptocurrency-whitepaper-with-tokenomics-charts-a.jpg"],
  },
}

export default function WhitepaperPage() {
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
                <FileText className="h-4 w-4 text-purple-400" />
                <span className={`text-sm font-medium text-purple-300 ${poppins.className}`}>
                  $NFT Token Whitepaper
                </span>
              </div>

              <h1 className={`text-4xl md:text-6xl font-bold gradient-text mythic-brand ${poppins.className}`}>
                Whitepaper
              </h1>

              <p className={`text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed ${poppins.className}`}>
                Discover the $NFT token ecosystem, holder rewards, and our vision for the future
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-6xl relative z-10">
        <div className="space-y-16">
          {/* Introduction Section */}
          <section>
            <div className="text-center mb-10">
              <h2
                className={`text-4xl font-bold mb-4 text-white flex items-center justify-center gap-3 ${poppins.className}`}
              >
                <Sparkles className="h-10 w-10 text-primary" />
                Introduction
              </h2>
            </div>
            <div className="gradient-border bg-card/50 backdrop-blur-sm p-8 rounded-lg">
              <p className={`text-lg text-muted-foreground leading-relaxed mb-4 ${poppins.className}`}>
                NFT AI is revolutionizing the NFT marketplace on Solana by combining cutting-edge AI technology with a
                sustainable tokenomics model. Our platform empowers creators and collectors with intelligent tools for
                NFT discovery, creation, and trading.
              </p>
              <p className={`text-lg text-muted-foreground leading-relaxed ${poppins.className}`}>
                The $NFT token is at the heart of our ecosystem, designed to reward long-term holders while funding
                continuous platform development. With automatic $SOL airdrops every 15 minutes and a deflationary burn
                mechanism, $NFT creates a sustainable economy that benefits all participants.
              </p>
            </div>
          </section>

          {/* Features Section */}
          <section>
            <div className="text-center mb-10">
              <h2
                className={`text-4xl font-bold mb-4 text-white flex items-center justify-center gap-3 ${poppins.className}`}
              >
                <Bot className="h-10 w-10 text-primary" />
                Key Features
              </h2>
              <p className={`text-lg text-muted-foreground max-w-3xl mx-auto ${poppins.className}`}>
                Discover what makes NFT AI the premier NFT marketplace on Solana
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="gradient-border bg-card/50 backdrop-blur-sm p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Bot className="h-8 w-8 text-purple-400" />
                  <h3 className={`text-xl font-bold text-white ${poppins.className}`}>AI-Powered NFT Creation</h3>
                </div>
                <p className={`text-muted-foreground ${poppins.className}`}>
                  Leverage advanced AI technology to generate unique NFT artwork and metadata. Create stunning digital
                  collectibles with intelligent prompts and automated trait generation.
                </p>
              </div>

              <div className="gradient-border bg-card/50 backdrop-blur-sm p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Coins className="h-8 w-8 text-amber-400" />
                  <h3 className={`text-xl font-bold text-white ${poppins.className}`}>AI Token Launcher</h3>
                </div>
                <p className={`text-muted-foreground ${poppins.className}`}>
                  Launch your own Solana token with AI-generated branding on Raydium, PumpFun, or Meteora. Complete with
                  automated logo creation, metadata generation, and DEX integration.
                </p>
              </div>

              <div className="gradient-border bg-card/50 backdrop-blur-sm p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Gift className="h-8 w-8 text-green-400" />
                  <h3 className={`text-xl font-bold text-white ${poppins.className}`}>Automatic Rewards</h3>
                </div>
                <p className={`text-muted-foreground ${poppins.className}`}>
                  Earn passive $SOL income every 15 minutes just by holding 1M+ $NFT tokens. No staking required.
                </p>
              </div>

              <div className="gradient-border bg-card/50 backdrop-blur-sm p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="h-8 w-8 text-blue-400" />
                  <h3 className={`text-xl font-bold text-white ${poppins.className}`}>Secure Trading</h3>
                </div>
                <p className={`text-muted-foreground ${poppins.className}`}>
                  Built on Solana's high-performance blockchain with industry-leading security practices to protect your
                  assets.
                </p>
              </div>

              <div className="gradient-border bg-card/50 backdrop-blur-sm p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Wallet className="h-8 w-8 text-amber-400" />
                  <h3 className={`text-xl font-bold text-white ${poppins.className}`}>Seamless Integration</h3>
                </div>
                <p className={`text-muted-foreground ${poppins.className}`}>
                  Connect with popular Solana wallets like Phantom and Solflare for a smooth, user-friendly experience.
                </p>
              </div>
            </div>
          </section>

          {/* Tokenomics Section */}
          <section>
            <div className="text-center mb-10">
              <h2
                className={`text-4xl font-bold mb-4 text-white flex items-center justify-center gap-3 ${poppins.className}`}
              >
                <Coins className="h-10 w-10 text-primary" />
                Tokenomics
              </h2>
              <p className={`text-lg text-muted-foreground max-w-3xl mx-auto ${poppins.className}`}>
                1 Billion Total Supply with a sustainable 5% tax structure designed to reward holders and grow the
                ecosystem
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* Holder Rewards */}
              <div className="gradient-border bg-card/50 backdrop-blur-sm p-6 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Gift className="h-8 w-8 text-green-400" />
                  <h3 className={`text-2xl font-bold ${poppins.className}`}>2.5%</h3>
                </div>
                <h4 className={`text-lg font-semibold text-white mb-3 ${poppins.className}`}>Holder Rewards</h4>
                <p className={`text-sm text-muted-foreground leading-relaxed ${poppins.className}`}>
                  Automatic $SOL airdrops every 15 minutes for holders with 1M+ $NFT tokens. Rewards are proportional to
                  your holdings - the more you hold, the more you earn.
                </p>
              </div>

              {/* Ecosystem Growth */}
              <div className="gradient-border bg-card/50 backdrop-blur-sm p-6 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-8 w-8 text-purple-400" />
                  <h3 className={`text-2xl font-bold ${poppins.className}`}>1.5%</h3>
                </div>
                <h4 className={`text-lg font-semibold text-white mb-3 ${poppins.className}`}>Ecosystem Growth</h4>
                <p className={`text-sm text-muted-foreground leading-relaxed ${poppins.className}`}>
                  Dedicated fund for platform growth and sustainability:
                </p>
                <ul className={`mt-3 space-y-1 text-sm text-muted-foreground ${poppins.className}`}>
                  <li>• Marketing: Expand reach and attract new investors</li>
                  <li>• Platform Development: Build new features</li>
                </ul>
              </div>

              {/* Buy Back & Burn */}
              <div className="gradient-border bg-card/50 backdrop-blur-sm p-6 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Flame className="h-8 w-8 text-amber-400" />
                  <h3 className={`text-2xl font-bold ${poppins.className}`}>1%</h3>
                </div>
                <h4 className={`text-lg font-semibold text-white mb-3 ${poppins.className}`}>Buy Back & Burn</h4>
                <p className={`text-sm text-muted-foreground leading-relaxed ${poppins.className}`}>
                  Regular buy back and burn of $NFT tokens, reducing total supply and increasing scarcity. This
                  deflationary mechanism increases the value of each remaining token.
                </p>
              </div>
            </div>

            <div className="gradient-border bg-card/50 backdrop-blur-sm p-6 rounded-lg">
              <h3 className={`text-xl font-semibold text-white mb-4 ${poppins.className}`}>Token Details</h3>
              <div className={`grid md:grid-cols-2 gap-4 text-muted-foreground ${poppins.className}`}>
                <div>
                  <p className={`text-sm font-semibold text-white mb-1 ${poppins.className}`}>Total Supply</p>
                  <p className={`text-lg ${poppins.className}`}>1,000,000,000 $NFT</p>
                </div>
                <div>
                  <p className={`text-sm font-semibold text-white mb-1 ${poppins.className}`}>Tax Structure</p>
                  <p className={`text-lg ${poppins.className}`}>5% (2.5% Rewards + 1.5% Growth + 1% Burn)</p>
                </div>
                <div>
                  <p className={`text-sm font-semibold text-white mb-1 ${poppins.className}`}>Reward Frequency</p>
                  <p className={`text-lg ${poppins.className}`}>Every 15 minutes</p>
                </div>
                <div>
                  <p className={`text-sm font-semibold text-white mb-1 ${poppins.className}`}>Minimum for Rewards</p>
                  <p className={`text-lg ${poppins.className}`}>1,000,000+ $NFT tokens</p>
                </div>
              </div>
            </div>
          </section>

          {/* Roadmap Section */}
          <section>
            <div className="text-center mb-10">
              <h2
                className={`text-4xl font-bold mb-4 text-white flex items-center justify-center gap-3 ${poppins.className}`}
              >
                <Rocket className="h-10 w-10 text-primary" />
                Roadmap
              </h2>
              <p className={`text-lg text-muted-foreground max-w-3xl mx-auto ${poppins.className}`}>
                Our journey to becoming the leading AI-powered NFT marketplace on Solana
              </p>
            </div>

            <div className="space-y-6">
              {/* Phase 1 - Complete */}
              <div className="gradient-border bg-card/50 backdrop-blur-sm p-8 rounded-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-3xl" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-8 w-8 text-green-400" />
                      <h3 className={`text-2xl font-bold text-white ${poppins.className}`}>Phase 1</h3>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Complete</Badge>
                  </div>
                  <ul className={`space-y-3 text-muted-foreground ${poppins.className}`}>
                    <li className="flex items-start gap-3">
                      <Rocket className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Platform Launch - NFT AI marketplace goes live</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Community Building - Establish presence on Twitter/X and Telegram</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Coins className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Deployment of $NFT token on Raydium DEX</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Phase 2 - In Progress */}
              <div className="gradient-border bg-card/50 backdrop-blur-sm p-8 rounded-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Clock className="h-8 w-8 text-purple-400" />
                      <h3 className={`text-2xl font-bold text-white ${poppins.className}`}>Phase 2</h3>
                    </div>
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">In Progress</Badge>
                  </div>
                  <ul className={`space-y-3 text-muted-foreground ${poppins.className}`}>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Verification on Jupiter DEX for increased visibility</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <TrendingUp className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Listing on CoinMarketCap and CoinGecko for price tracking</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Smartphone className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Mobile app for platform enabling wider adoption and accessibility</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Phase 3 - Future */}
              <div className="gradient-border bg-card/50 backdrop-blur-sm p-8 rounded-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Rocket className="h-8 w-8 text-amber-400" />
                      <h3 className={`text-2xl font-bold text-white ${poppins.className}`}>Phase 3</h3>
                    </div>
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Future</Badge>
                  </div>
                  <ul className={`space-y-3 text-muted-foreground ${poppins.className}`}>
                    <li className="flex items-start gap-3">
                      <Building2 className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                      <span>Centralized exchange listings on major platforms (Binance, Coinbase)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Megaphone className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                      <span>Global marketing campaign across X, Instagram, Facebook, TikTok, and YouTube</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                      <span>
                        Enhanced token launchpad with advanced features including liquidity locking, vesting schedules,
                        and anti-rug mechanisms
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Conclusion Section */}
          <section>
            <div className="gradient-border bg-card/50 backdrop-blur-sm p-8 rounded-lg">
              <div className="text-center mb-6">
                <h2
                  className={`text-3xl font-bold mb-4 text-white flex items-center justify-center gap-3 ${poppins.className}`}
                >
                  <Sparkles className="h-8 w-8 text-primary" />
                  Conclusion
                </h2>
              </div>
              <div className={`space-y-4 text-muted-foreground leading-relaxed ${poppins.className}`}>
                <p className={`text-lg ${poppins.className}`}>
                  NFT AI represents the future of NFT marketplaces on Solana, combining innovative AI technology with a
                  sustainable tokenomics model that rewards our community. The $NFT token is designed to create
                  long-term value through automatic holder rewards, ecosystem growth funding, and deflationary burn
                  mechanics.
                </p>
                <p className={`text-lg ${poppins.className}`}>
                  Our roadmap demonstrates our commitment to continuous innovation and expansion. From our successful
                  platform launch to our ambitious plans for centralized exchange listings and our own DEX, we're
                  building a comprehensive ecosystem that serves creators, collectors, and investors alike.
                </p>
                <p className={`text-lg ${poppins.className}`}>
                  Join us on this journey as we revolutionize the NFT space on Solana. Whether you're a creator looking
                  to showcase your work, a collector seeking the next big NFT, or an investor wanting to earn passive
                  income, NFT AI offers something for everyone. The future of NFTs is here, and it's powered by $NFT.
                </p>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section
            className={`gradient-border bg-card/50 backdrop-blur-sm p-8 rounded-lg text-center ${poppins.className}`}
          >
            <h2 className={`text-2xl font-bold mb-4 ${poppins.className}`}>Join the $NFT Ecosystem</h2>
            <p className={`text-muted-foreground mb-6 max-w-2xl mx-auto ${poppins.className}`}>
              Start earning automatic $SOL rewards by holding 1M+ $NFT tokens. The more you hold, the more you earn
              every 15 minutes.
            </p>
            <div className={`flex flex-col sm:flex-row gap-4 justify-center ${poppins.className}`}>
              <a
                href="https://jup.ag/swap?sell=So11111111111111111111111111111111111111112&buy=24UBwtKAxBg2vx4Ua3fTkR4UBZtnuvKtY5j22i1HoTAX"
                target="_blank"
                rel="noopener noreferrer"
                className="relative z-20 inline-flex items-center justify-center gap-2 text-white gradient-purple-gold hover:opacity-90 transition-all px-6 py-3 rounded-lg font-semibold cursor-pointer hover:scale-105"
                style={{ pointerEvents: "auto" }}
              >
                Buy $NFT on Jupiter
                <Rocket className="h-4 w-4" />
              </a>
              <Link
                href="/docs"
                className="relative z-20 inline-flex items-center justify-center gap-2 text-white border-2 border-white/20 hover:border-white/40 transition-all px-6 py-3 rounded-lg font-semibold cursor-pointer hover:scale-105"
                style={{ pointerEvents: "auto" }}
              >
                Read Documentation
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
