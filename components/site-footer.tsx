import Link from "next/link"
import Image from "next/image"
import { Twitter, Send } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="bg-gradient-to-t from-zinc-950 via-black to-black mt-20 relative overflow-hidden border-t border-zinc-800/50">
      <div className="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />

      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-32 bg-gradient-to-t from-zinc-800/20 to-transparent blur-2xl" />

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Image src="/images/nft-ai-logo.png" alt="NFT AI" width={40} height={40} className="h-10 w-10" />
              <span className="text-xl font-bold gradient-text mythic-brand">NFT AI</span>
            </div>
            <p className="text-muted-foreground max-w-md leading-relaxed">
              The most accessible NFT launchpad on Solana. Generate legendary art with DALL-E 3. Mint on-chain instantly.
            </p>
            <div className="flex items-center gap-2 mt-4"></div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/explore" className="text-muted-foreground hover:text-white transition-colors">
                  Explore NFTs
                </Link>
              </li>
              <li>
                <Link href="/create" className="text-muted-foreground hover:text-white transition-colors">
                  Create NFT
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/docs" className="text-muted-foreground hover:text-white transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/whitepaper" className="text-muted-foreground hover:text-white transition-colors">
                  Whitepaper
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Community</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://x.com/NFTAI_SOL"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors group"
                >
                  <Twitter className="h-4 w-4 group-hover:text-primary transition-colors" />
                  Twitter
                </a>
              </li>
              <li>
                <a
                  href="https://t.me/NFTAI_SOL"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors group"
                >
                  <Send className="h-4 w-4 group-hover:text-primary transition-colors" />
                  Telegram
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">© 2025 NFT AI. All rights reserved.</p>
          <a
            href="https://visioncoding.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors"
          >
            Built by
            <Image src="/images/vision-coding-logo.png" alt="Vision Coding" width={20} height={20} className="h-5 w-5" />
            <span className="font-semibold">Vision Coding</span>
          </a>
        </div>
      </div>
    </footer>
  )
}
