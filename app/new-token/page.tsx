"use client"

import { AITokenGeneratorForm } from "@/components/ai-token-generator-form"
import { ManualTokenUploadForm } from "@/components/manual-token-upload-form"
import { Poppins } from "next/font/google"
import { useState } from "react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { useSearchParams } from "next/navigation"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
})

type LauncherType = "bonding" | "pumpfun" | "raydium" | null

export default function NewTokenPage() {
  const searchParams = useSearchParams()
  const mode = searchParams.get("mode")
  const isManualMode = mode === "manual"

  const [selectedLauncher, setSelectedLauncher] = useState<LauncherType>(null)

  if (!selectedLauncher) {
    return (
      <div className="container mx-auto px-2 sm:px-4 py-8 sm:py-12 md:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 sm:mb-12 text-center px-2">
            <h1
              className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 gradient-text mythic-brand ${poppins.className}`}
            >
              Launch Token
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Choose your preferred platform to get started
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bonding Token Option */}
            <Card
              className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg"
              onClick={() => setSelectedLauncher("bonding")}
            >
              <CardHeader>
                <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                  <Image
                    src="/logo-meteora-symbol-onDark.webp"
                    alt="Meteora Bonding Token"
                    width={120}
                    height={120}
                    className="object-contain"
                  />
                </div>
                <CardTitle className="text-xl">Bonding Token</CardTitle>
                <CardDescription>
                  Launch tokens with Meteora bonding curve. Earn rewards and share them with your holders.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Pumpfun Option */}
            <Card
              className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg"
              onClick={() => setSelectedLauncher("pumpfun")}
            >
              <CardHeader>
                <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-green-500/20 to-blue-500/20 flex items-center justify-center">
                  <Image src="/pumpfun-logo.png" alt="Pumpfun" width={200} height={200} className="object-contain" />
                </div>
                <CardTitle className="text-xl">Pumpfun</CardTitle>
                <CardDescription>Fair launch platform for community-driven tokens</CardDescription>
              </CardHeader>
            </Card>

            {/* Raydium Option */}
            <Card
              className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg"
              onClick={() => setSelectedLauncher("raydium")}
            >
              <CardHeader>
                <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                  <Image
                    src="/raydium-ray-logo.png"
                    alt="Raydium"
                    width={140}
                    height={140}
                    className="object-contain"
                  />
                </div>
                <CardTitle className="text-xl">Raydium</CardTitle>
                <CardDescription>Launch tokens directly on Raydium DEX with liquidity</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-8 sm:py-12 md:py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 sm:mb-12 text-center px-2">
          <button
            onClick={() => setSelectedLauncher(null)}
            className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-2"
          >
            ← Back to platform selection
          </button>
          <h1
            className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 gradient-text mythic-brand ${poppins.className}`}
          >
            {isManualMode ? (
              <>
                {selectedLauncher === "bonding" && "Create Bonding Token"}
                {selectedLauncher === "raydium" && "Create Raydium Token"}
                {selectedLauncher === "pumpfun" && "Create Pumpfun Token"}
              </>
            ) : (
              <>
                {selectedLauncher === "bonding" && "Create Bonding Token"}
                {selectedLauncher === "raydium" && "Create Raydium Token"}
                {selectedLauncher === "pumpfun" && "Create Pumpfun Token"}
              </>
            )}
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {isManualMode ? (
              <>
                {selectedLauncher === "bonding" &&
                  "Create your custom token with your own logo and metadata. Deploy on Solana with Meteora Bond Curve."}
                {selectedLauncher === "raydium" &&
                  "Create your token with custom assets and launch with instant Raydium liquidity."}
                {selectedLauncher === "pumpfun" && "Create your token and launch on the fair launch platform."}
              </>
            ) : (
              <>
                {selectedLauncher === "bonding" &&
                  "Transform your ideas into profitable projects. Generate custom tokens with AI, deploy on Solana with Meteora Bond Curve."}
                {selectedLauncher === "raydium" &&
                  "Launch tokens with instant Raydium liquidity. Create professional tokens with AI and deploy directly to Raydium DEX."}
                {selectedLauncher === "pumpfun" && "Fair launch platform for community-driven tokens."}
              </>
            )}
          </p>
        </div>

        {isManualMode ? (
          <ManualTokenUploadForm launcherType={selectedLauncher} />
        ) : (
          <AITokenGeneratorForm launcherType={selectedLauncher} />
        )}
      </div>
    </div>
  )
}
