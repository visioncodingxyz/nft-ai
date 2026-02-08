"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Wallet, Sparkles, Store, User, Compass } from "lucide-react"
import { cn } from "@/lib/utils"

export function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Home", icon: Store },
    { href: "/explore", label: "Explore", icon: Compass },
    { href: "/create", label: "AI Generator", icon: Sparkles },
    { href: "/profile", label: "Profile", icon: User },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 glass-effect">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <Image src="/images/mintify-logo.png" alt="NFT AI" width={40} height={40} className="h-10 w-10" />
          <span className="text-xl font-bold gradient-text">NFT AI</span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn("gap-2 transition-all", isActive && "bg-primary/10 text-primary")}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </div>

        {/* Wallet Connect Button */}
        <Button className="gradient-purple-gold hover:opacity-90 transition-opacity">
          <Wallet className="mr-2 h-4 w-4" />
          Connect Wallet
        </Button>
      </div>
    </nav>
  )
}
