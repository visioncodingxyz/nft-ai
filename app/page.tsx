"use client"

import type React from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Search, Zap } from "lucide-react"
import Image from "next/image"
import { NFTCard } from "@/components/nft-card"
import { useState, useEffect } from "react"
import type { NFT } from "@/lib/types"
import { useRouter } from "next/navigation"
import { HeroNFTGrid } from "@/components/hero-nft-grid"
import { TrendingNFTsMarquee } from "@/components/trending-nfts-marquee"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function HomePage() {
  const [nfts, setNfts] = useState<NFT[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [copied, setCopied] = useState(false)
  const router = useRouter()
  const [featuresState, setFeaturesState] = useState(0) // 0 = Platform Features, 1 = MINT Benefits

  const contractAddress = "24UBwtKAxBg2vx4Ua3fTkR4UBZtnuvKtY5j22i1HoTAX"

  useEffect(() => {
    fetchNFTs()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setFeaturesState((prev) => (prev === 0 ? 1 : 0))
    }, 7500) // 7.5 seconds

    return () => clearInterval(interval)
  }, [])

  const fetchNFTs = async () => {
    try {
      const response = await fetch("/api/nfts?limit=8&sort=recent&nsfwFilter=sfw")
      if (response.ok) {
        try {
          const data = await response.json()
          setNfts(data.nfts || [])
        } catch (error) {
          console.error("Failed to parse NFTs:", error)
          setNfts([])
        }
      }
    } catch (error) {
      console.error("Failed to fetch NFTs:", error)
      setNfts([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/explore?search=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      router.push("/explore")
    }
  }

  const copyContractAddress = async () => {
    try {
      await navigator.clipboard.writeText(contractAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <>
      <section className="hero-gradient-bg py-20 lg:py-32 text-center relative w-full overflow-hidden">
        <HeroNFTGrid />
        <div className="hero-grid-pattern border-b" />

        <div className="hero-content container mx-auto px-4 relative z-10">
          <Badge
            className="mb-6 bg-transparent border-2 border-transparent hover:shadow-lg hover:shadow-purple-500/20 transition-all px-4 py-2 text-sm font-medium inline-flex items-center text-white"
            style={{
              backgroundClip: "padding-box",
              border: "2px solid transparent",
              backgroundImage: "linear-gradient(#000, #000), linear-gradient(to right, #9945FF, #14F195)",
              backgroundOrigin: "border-box",
              backgroundClip: "padding-box, border-box",
            }}
          >
            <Image
              src="/images/design-mode/solanaLogoMark%20%281%29.png"
              alt="Solana"
              width={20}
              height={20}
              priority
              loading="eager"
              fetchPriority="high"
              className="mr-2"
            />
            Built on Solana
          </Badge>

          <h1 className="mb-6 text-5xl font-bold leading-none md:text-6xl lg:text-7xl">
            <span className="text-white">Create Legendary</span>
            <br />
            <span className="gradient-text">NFTs</span> <span className="text-white">using</span>{" "}
            <span className="gradient-text">AI</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground leading-relaxed">
            Turn your ideas into unique digital art. Generate custom NFTs with AI, deploy on Solana, and share your
            creations with the world.
          </p>
          <div className="flex flex-row flex-nowrap gap-2 sm:gap-4 justify-center">
            <Link href="/create">
              <Button
                size="lg"
                className="gradient-purple-gold hover:brightness-110 transition-all glow-effect-hover text-white font-semibold px-4 sm:px-8 py-4 sm:py-6 text-sm sm:text-lg whitespace-nowrap h-12 sm:h-14"
              >
                <Sparkles className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Mint NFT
              </Button>
            </Link>
            <Link href="/explore">
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-2 border-transparent hover:shadow-lg hover:shadow-orange-500/20 transition-all px-4 sm:px-8 py-4 sm:py-6 text-sm sm:text-lg font-semibold whitespace-nowrap h-12 sm:h-14"
                style={{
                  backgroundClip: "padding-box",
                  border: "2px solid transparent",
                  backgroundImage:
                    "linear-gradient(#000, #000), linear-gradient(to right, #f59e0b, #ec4899, #a855f7, #3b82f6)",
                  backgroundOrigin: "border-box",
                  backgroundClip: "padding-box, border-box",
                }}
              >
                Explore NFTs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="flex w-full bg-gradient-to-r from-[#f59e0b] via-[#ec4899] via-[#a855f7] to-[#3b82f6] py-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col sm:flex-row items-stretch justify-center gap-4">
            <Link
              href="https://jup.ag/swap?sell=So11111111111111111111111111111111111111112&buy=24UBwtKAxBg2vx4Ua3fTkR4UBZtnuvKtY5j22i1HoTAX"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center justify-center gap-3 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 border-2 border-white/40 hover:bg-white/30 hover:border-white/60 transition-all shadow-lg hover:shadow-xl group"
            >
              <Image
                src="/images/nft-token-logo.png"
                alt="$NFT Token"
                width={24}
                height={24}
                priority
                loading="eager"
                fetchPriority="high"
                className="object-contain group-hover:scale-110 transition-transform"
              />
              <span className="text-lg font-bold tracking-tight text-white">Buy $NFT</span>
              <svg
                className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>

            <button
              onClick={copyContractAddress}
              className="inline-flex items-center justify-center gap-2 bg-black/80 backdrop-blur-sm rounded-full px-4 sm:px-6 py-3 border-2 border-white/20 hover:border-white/40 transition-all group cursor-pointer shadow-lg overflow-hidden"
              title="Click to copy contract address"
            >
              <span className="text-xs sm:text-sm font-mono text-white/90 group-hover:text-white transition-colors truncate max-w-[200px] sm:max-w-none">
                {contractAddress}
              </span>
              {copied ? (
                <svg
                  className="w-4 h-4 text-green-400 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4 text-white/70 group-hover:text-white transition-colors flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </section>

      <TrendingNFTsMarquee />

      <div className="container mx-auto px-4 py-8 pb-0 mb-0 pt-28">
        {/* Platform Features State */}
        <section className="relative h-[450px]">
          <div
            className={`absolute inset-0 transition-opacity duration-1200 ease-in-out ${
              featuresState === 0 ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <div className="mb-10 text-center">
              <h2 className="text-4xl font-bold mb-3">
                <span className="gradient-text">Platform Features</span>
              </h2>
              <p className="text-muted-foreground text-lg">
                Everything you need to create, trade, and launch on Solana
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <Card className="bg-card border-border gradient-border glow-effect-hover relative overflow-hidden">
                <div
                  className="absolute inset-0 opacity-5 pointer-events-none"
                  style={{
                    background: "linear-gradient(135deg, #9945ff 0%, #14f195 100%)",
                  }}
                />
                <div className="p-6 relative z-10">
                  <div className="rounded-lg bg-primary/10 p-3 w-fit mb-4">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold gradient-text mb-2">AI NFT Generation</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Transform your ideas into stunning NFTs using advanced AI. Generate unique artwork in seconds and
                    mint directly to Solana.
                  </p>
                </div>
              </Card>

              <Card className="bg-card border-border gradient-border glow-effect-hover relative overflow-hidden">
                <div
                  className="absolute inset-0 opacity-5 pointer-events-none"
                  style={{
                    background: "linear-gradient(135deg, #9945ff 0%, #14f195 100%)",
                  }}
                />
                <div className="p-6 relative z-10">
                  <div className="rounded-lg bg-primary/10 p-3 w-fit mb-4">
                    <Search className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold gradient-text mb-2">NFT Marketplace</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Discover, collect, and showcase NFTs. Browse trending collections and explore unique digital art
                    from creators worldwide.
                  </p>
                </div>
              </Card>

              <Card className="bg-card border-border gradient-border glow-effect-hover relative overflow-hidden">
                <div
                  className="absolute inset-0 opacity-5 pointer-events-none"
                  style={{
                    background: "linear-gradient(135deg, #9945ff 0%, #14f195 100%)",
                  }}
                />
                <div className="p-6 relative z-10">
                  <div className="rounded-lg bg-primary/10 p-3 w-fit mb-4">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold gradient-text mb-2">NFT Collections</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Create and manage your own NFT collections. Organize your artwork into curated collections with
                    custom metadata and branding.
                  </p>
                </div>
              </Card>
            </div>
          </div>

          {/* $NFT Holder Benefits State */}
          <div
            className={`absolute inset-0 transition-opacity duration-1200 ease-in-out mt-0 pt-0 ${
              featuresState === 1 ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <div className="mb-10 text-center">
              <h2 className="text-4xl font-bold mb-3">
                <span className="gradient-text">$NFT Holder Benefits</span>
              </h2>
              <p className="text-muted-foreground text-lg">
                Unlock exclusive rewards and features by holding $NFT tokens
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {/* Tier 1 - Creator */}
              <Card className="bg-card border-border gradient-border glow-effect-hover relative overflow-hidden">
                <div
                  className="absolute inset-0 opacity-5 pointer-events-none"
                  style={{
                    background: "linear-gradient(135deg, #9945ff 0%, #14f195 100%)",
                  }}
                />
                <div className="p-6 relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="rounded-lg bg-blue-500/10 p-3 w-fit">
                      <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-blue-500">Creator</h3>
                      <p className="text-xs text-muted-foreground">1M+ $NFT</p>
                    </div>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-white font-bold mt-0.5">✓</span>
                      <span>5 free AI generations per day</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-white font-bold mt-0.5">✓</span>
                      <span>25% discount on minting fees</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-white font-bold mt-0.5">✓</span>
                      <span>Eligible for automatic $SOL rewards</span>
                    </li>
                  </ul>
                </div>
              </Card>

              {/* Tier 2 - Professional */}
              <Card className="bg-card border-border gradient-border glow-effect-hover relative overflow-hidden">
                <div
                  className="absolute inset-0 opacity-5 pointer-events-none"
                  style={{
                    background: "linear-gradient(135deg, #9945ff 0%, #14f195 100%)",
                  }}
                />
                <div className="p-6 relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="rounded-lg bg-purple-500/10 p-3 w-fit">
                      <svg className="h-6 w-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-purple-500">Professional</h3>
                      <p className="text-xs text-muted-foreground">5M+ $NFT</p>
                    </div>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-white font-bold mt-0.5">✓</span>
                      <span>25 free AI generations per day</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-white font-bold mt-0.5">✓</span>
                      <span>50% discount on fees</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-white font-bold mt-0.5">✓</span>
                      <span>Priority support from our team</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-white font-bold mt-0.5">✓</span>
                      <span>Early access to new features</span>
                    </li>
                  </ul>
                </div>
              </Card>

              {/* Tier 3 - Ultimate */}
              <Card className="bg-card border-border gradient-border glow-effect-hover relative overflow-hidden">
                <div
                  className="absolute inset-0 opacity-5 pointer-events-none"
                  style={{
                    background: "linear-gradient(135deg, #9945ff 0%, #14f195 100%)",
                  }}
                />
                <div className="p-6 relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="rounded-lg bg-yellow-500/10 p-3 w-fit">
                      <svg className="h-6 w-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-yellow-500">Ultimate</h3>
                      <p className="text-xs text-muted-foreground">10M+ $NFT</p>
                    </div>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-white font-bold mt-0.5">✓</span>
                      <span className="font-semibold">Unlimited AI generations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-white font-bold mt-0.5">✓</span>
                      <span>75% discount on all platform fees</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-white font-bold mt-0.5">✓</span>
                      <span>DAO governance voting rights</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-white font-bold mt-0.5">✓</span>
                      <span>Revenue share from platform</span>
                    </li>
                  </ul>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Marketplace Preview Section */}
        <section id="marketplace" className="py-16">
          <div className="mb-10 text-center">
            <h2 className="text-4xl font-bold mb-3">
              <span className="gradient-text">Discover NFTs</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-4">Explore the latest creations on our website</p>
          </div>

          <form onSubmit={handleSearch} className="relative w-full max-w-xl mx-auto mb-12">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search NFTs, collections, or creators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-input border-border h-12 text-base focus:ring-2 focus:ring-primary"
            />
          </form>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-muted rounded-lg mb-3" />
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : nfts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg mb-4">No NFTs available yet</p>
              <Link href="/create">
                <Button className="gradient-purple-gold">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Create Your First NFT
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {nfts.map((nft) => (
                <NFTCard key={nft.id} nft={nft} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/explore">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-transparent hover:shadow-lg hover:shadow-orange-500/20 transition-all px-8 bg-transparent"
                style={{
                  backgroundClip: "padding-box",
                  border: "2px solid transparent",
                  backgroundImage:
                    "linear-gradient(#000, #000), linear-gradient(to right, #f59e0b, #ec4899, #a855f7, #3b82f6)",
                  backgroundOrigin: "border-box",
                  backgroundClip: "padding-box, border-box",
                }}
              >
                View All NFTs
              </Button>
            </Link>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 pb-20">
          <div className="mb-10 text-center">
            <h2 className="text-4xl font-bold mb-3">
              <span className="gradient-text">Frequently Asked Questions</span>
            </h2>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full space-y-4">
              <AccordionItem
                value="item-1"
                className="border-2 border-white/10 bg-gradient-to-br from-background via-purple-500/5 to-background backdrop-blur-xl rounded-lg px-6 shadow-2xl relative overflow-hidden"
              >
                <div
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{
                    background: "linear-gradient(135deg, #9945ff 0%, #14f195 100%)",
                  }}
                />
                <AccordionTrigger className="text-left hover:no-underline relative z-10">
                  <span className="font-semibold text-lg">How does the $NFT token integrate with our platform?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed relative z-10">
                  You gain access to premium features on our website by holding $NFT. We have a tier system with three
                  levels:
                  <ul className="mt-3 space-y-2 ml-4">
                    <li>
                      <strong className="text-white font-bold">Creator (1M+ $NFT):</strong> 5 free AI generations/day,
                      25% discount on minting fees, eligible for $SOL rewards
                    </li>
                    <li>
                      <strong className="text-white font-bold">Professional (5M+ $NFT):</strong> 25 free AI
                      generations/day, 50% discount on fees, priority support, early access
                    </li>
                    <li>
                      <strong className="text-white font-bold">Ultimate (10M+ $NFT):</strong> Unlimited AI generations,
                      75% discount on all fees, DAO voting rights, revenue share
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-2"
                className="border-2 border-white/10 bg-gradient-to-br from-background via-purple-500/5 to-background backdrop-blur-xl rounded-lg px-6 shadow-2xl relative overflow-hidden"
              >
                <div
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{
                    background: "linear-gradient(135deg, #9945ff 0%, #14f195 100%)",
                  }}
                />
                <AccordionTrigger className="text-left hover:no-underline relative z-10">
                  <span className="font-semibold text-lg">What makes NFT AI different from other NFT platforms?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed relative z-10">
                  NFT AI combines the power of advanced AI generation with Solana's fast, low-cost blockchain. Our
                  platform offers instant AI-powered NFT creation using DALL-E 3, automatic metadata generation,
                  seamless minting directly to Solana, and a holder rewards system that distributes SOL to $NFT token
                  holders. Unlike other platforms, we prioritize both creative freedom and community rewards, making it
                  easy for anyone to create and earn from digital art.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-3"
                className="border-2 border-white/10 bg-gradient-to-br from-background via-purple-500/5 to-background backdrop-blur-xl rounded-lg px-6 shadow-2xl relative overflow-hidden"
              >
                <div
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{
                    background: "linear-gradient(135deg, #9945ff 0%, #14f195 100%)",
                  }}
                />
                <AccordionTrigger className="text-left hover:no-underline relative z-10">
                  <span className="font-semibold text-lg">How does the AI NFT generation work?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed relative z-10">
                  NFT AI uses OpenAI's DALL-E 3, one of the most advanced AI image generation models available. Simply
                  describe the artwork you want to create, select an art style (Digital Art, Oil Painting, Watercolor,
                  etc.), and our AI will generate a unique 1024x1024 high-quality image. Each generation is completely
                  original and can be minted directly to the Solana blockchain. Your daily generation limit depends on
                  your $NFT tier level.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      </div>
    </>
  )
}
