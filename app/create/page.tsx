"use client"

import { AIGeneratorForm } from "@/components/ai-generator-form"
import { ManualNFTUploadForm } from "@/components/manual-nft-upload-form"
import { Poppins } from "next/font/google"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
})

function CreatePageContent() {
  const searchParams = useSearchParams()
  const mode = searchParams.get("mode")
  const isManualMode = mode === "manual"

  return (
    <div className="container mx-auto px-2 sm:px-4 py-8 sm:py-12 md:py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 sm:mb-12 text-center px-2">
          <h1
            className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 gradient-text mythic-brand ${poppins.className}`}
          >
            {isManualMode ? "Upload Your NFT" : "Create Legendary NFTs"}
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {isManualMode
              ? "Upload your custom artwork and mint it as an NFT on Solana. Add metadata and deploy to the blockchain."
              : "Transform your ideas into unique digital art. Generate custom NFTs with AI, deploy on Solana, and share your creations with the world."}
          </p>
        </div>

        {isManualMode ? <ManualNFTUploadForm /> : <AIGeneratorForm />}
      </div>
    </div>
  )
}

export default function CreatePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreatePageContent />
    </Suspense>
  )
}
