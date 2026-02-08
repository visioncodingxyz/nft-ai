"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Sparkles, Twitter, Send, Menu, ChevronDown, BookOpen, FileText, Command, ImageIcon } from "lucide-react"
import { useState } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-gradient-to-b from-zinc-950 via-black to-black relative overflow-hidden border-b border-zinc-800/50">
      <div className="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-gradient-to-b from-zinc-800/20 to-transparent blur-2xl" />

      <div className="container flex h-16 items-center justify-between px-4 relative z-10">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
            <Image src="/images/nft-ai-logo.png" alt="NFT AI" width={40} height={40} className="h-10 w-10" />
            <span className="text-xl font-bold gradient-text mythic-brand">NFT AI</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            <Link
              href="/explore"
              className="text-sm font-medium text-foreground hover:text-white transition-colors relative group"
            >
              NFT Marketplace
              <span
                className="absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300"
                style={{ backgroundImage: "linear-gradient(to right, #f59e0b, #ec4899, #a855f7, #3b82f6)" }}
              />
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger className="text-sm font-medium text-foreground hover:text-white transition-colors relative group flex items-center gap-1">
                Resources
                <ChevronDown className="h-4 w-4" />
                <span
                  className="absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300"
                  style={{ backgroundImage: "linear-gradient(to right, #f59e0b, #ec4899, #a855f7, #3b82f6)" }}
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/docs" className="cursor-pointer flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Documentation
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/whitepaper" className="cursor-pointer flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Whitepaper
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>

        <div className="hidden lg:flex items-center gap-4 ml-auto">
          {/* Social icons */}
          <div className="flex items-center gap-3 pl-8">
            <a
              href="https://x.com/NFTAI_SOL"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-white transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a
              href="https://t.me/NFTAI_SOL"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-white transition-colors"
              aria-label="Telegram"
            >
              <Send className="h-5 w-5" />
            </a>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <Link href="/create">
              <Button
                variant="outline"
                className="h-10 px-4 bg-transparent border-2 border-transparent bg-gradient-to-r from-orange-500 via-pink-500 to-blue-500 bg-clip-padding hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300 relative group overflow-hidden"
                style={{
                  backgroundClip: "padding-box",
                  border: "2px solid transparent",
                  backgroundImage:
                    "linear-gradient(#000, #000), linear-gradient(to right, #f59e0b, #ec4899, #a855f7, #3b82f6)",
                  backgroundOrigin: "border-box",
                  backgroundClip: "padding-box, border-box",
                }}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 flex-shrink-0" />
                  <span>Mint NFT</span>
                </div>
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button className="h-10 px-4 gradient-purple-gold hover:brightness-110 transition-all glow-effect-hover text-white font-semibold">
                <Command className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>

        <div className="lg:hidden absolute right-4 top-1/2 -translate-y-1/2">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button className="text-foreground hover:text-white transition-colors" aria-label="Toggle menu">
                <Menu className="h-6 w-6" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[300px] sm:w-[400px] backdrop-blur-xl bg-gradient-to-b from-zinc-950 via-black to-black border-l border-zinc-800/50"
            >
              <nav className="flex flex-col h-full py-6">
                <div className="flex flex-col gap-6 pl-4">
                  <Link
                    href="/explore"
                    className="text-2xl font-medium text-foreground hover:text-white transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    NFT Marketplace
                  </Link>

                  <div className="flex flex-col gap-3">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Resources
                    </span>
                    <Link
                      href="/docs"
                      className="text-xl font-medium text-foreground hover:text-white transition-colors flex items-center gap-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <BookOpen className="h-5 w-5" />
                      Documentation
                    </Link>
                    <Link
                      href="/whitepaper"
                      className="text-xl font-medium text-foreground hover:text-white transition-colors flex items-center gap-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <FileText className="h-5 w-5" />
                      Whitepaper
                    </Link>
                  </div>

                  <div className="flex flex-col gap-3 mt-4">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Connect
                    </span>
                    <a
                      href="https://x.com/NFTAI_SOL"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xl font-medium text-foreground hover:text-white transition-colors flex items-center gap-3"
                    >
                      <Twitter className="h-5 w-5" />
                      Twitter
                    </a>
                    <a
                      href="https://t.me/NFTAI_SOL"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xl font-medium text-foreground hover:text-white transition-colors flex items-center gap-3"
                    >
                      <Send className="h-5 w-5" />
                      Telegram
                    </a>
                  </div>
                </div>

                {/* Spacer to push bottom content down */}
                <div className="flex-1" />

                <div className="flex flex-col gap-3 border-t border-zinc-800/50 pt-6 px-4">
                  <Link href="/create" onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant="outline"
                      className="w-full h-12 px-4 bg-transparent border-2 border-transparent bg-gradient-to-r from-orange-500 via-pink-500 to-blue-500 bg-clip-padding hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300 justify-center"
                      style={{
                        backgroundClip: "padding-box",
                        border: "2px solid transparent",
                        backgroundImage:
                          "linear-gradient(#000, #000), linear-gradient(to right, #f59e0b, #ec4899, #a855f7, #3b82f6)",
                        backgroundOrigin: "border-box",
                        backgroundClip: "padding-box, border-box",
                      }}
                    >
                      <ImageIcon className="mr-2 h-4 w-4" />
                      Mint NFT
                    </Button>
                  </Link>

                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full h-12 gradient-purple-gold hover:brightness-110 transition-all glow-effect-hover text-white font-semibold">
                      <Command className="mr-2 h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
