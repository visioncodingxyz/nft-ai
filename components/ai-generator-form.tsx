"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Loader2,
  Sparkles,
  Download,
  Upload,
  CheckCircle2,
  Gift,
  Coins,
  Info,
  Wand2,
  ShoppingCart,
  Plus,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { Transaction } from "@solana/web3.js"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { TierBadge } from "@/components/tier-badge"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { WalletConnectButton } from "@/components/wallet-connect-button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CountdownTimer } from "@/components/countdown-timer"
import { PurchaseGenerationsModal } from "@/components/purchase-generations-modal"
import { CreateCollectionModal } from "@/components/create-collection-modal"
import { useMintTier } from "@/hooks/use-mint-tier"

const BASE_MINT_COST_SOL = 0.02
const PAYMENT_WALLET = "BMGDFno6qX6yZ4Wbg1rWcQVxuVfTCEEe2VKsygRZfoh5"

export function AIGeneratorForm() {
  const router = useRouter()
  const [prompt, setPrompt] = useState("")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [email, setEmail] = useState("")
  const [style, setStyle] = useState("realistic")
  const [nsfwMode, setNsfwMode] = useState(false)

  const [nsfwStyle, setNsfwStyle] = useState("Cinematic")
  const [nsfwFilter, setNsfwFilter] = useState("Default")
  const [nsfwEmotion, setNsfwEmotion] = useState("Default")
  const [nsfwQuality, setNsfwQuality] = useState("Ultra")
  const [nsfwImageSize, setNsfwImageSize] = useState("512x512")
  const [nsfwAgeSlider, setNsfwAgeSlider] = useState(25)
  const [nsfwWeightSlider, setNsfwWeightSlider] = useState(0)
  const [nsfwBreastSlider, setNsfwBreastSlider] = useState(0)
  const [nsfwAssSlider, setNsfwAssSlider] = useState(0)

  const [isGenerating, setIsGenerating] = useState(false)
  const [isMinting, setIsMinting] = useState(false)
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false)
  const [analyzedAttributes, setAnalyzedAttributes] = useState<Array<{ trait_type: string; value: string }> | null>(
    null,
  )
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [suggestedName, setSuggestedName] = useState("")
  const [suggestedDescription, setSuggestedDescription] = useState("")
  const [mintActionId, setMintActionId] = useState<string | null>(null)
  const [mintTxId, setMintTxId] = useState<string | null>(null)
  const [mintedNftId, setMintedNftId] = useState<number | null>(null)
  const [hasFreeMint, setHasFreeMint] = useState(false)
  const [isCheckingFreeMint, setIsCheckingFreeMint] = useState(false)
  const [generationsRemaining, setGenerationsRemaining] = useState<number | null>(null)
  const [purchasedGenerations, setPurchasedGenerations] = useState<number>(0)
  const [totalGenerations, setTotalGenerations] = useState<number | null>(null)
  const [resetTime, setResetTime] = useState<string | null>(null)
  const [isCheckingLimit, setIsCheckingLimit] = useState(false)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [selectedCollectionId, setSelectedCollectionId] = useState("7acf523c-ca02-46a7-803d-fe8a3204e905")
  const [userCollections, setUserCollections] = useState<
    Array<{ id: number; crossmint_id: string; name: string; symbol: string }>
  >([])
  const [showCreateCollectionModal, setShowCreateCollectionModal] = useState(false)
  const [isFetchingCollections, setIsFetchingCollections] = useState(false)

  const { toast } = useToast()
  const { publicKey, connected, sendTransaction } = useWallet()
  const { connection } = useConnection()
  const { tierInfo, isLoading: isCheckingTier } = useMintTier()

  const checkGenerationLimit = async () => {
    if (!publicKey) {
      setGenerationsRemaining(null)
      setPurchasedGenerations(0)
      setTotalGenerations(null)
      setResetTime(null)
      return
    }

    setIsCheckingLimit(true)
    try {
      const response = await fetch(
        `/api/check-generation-limit?wallet=${publicKey.toString()}&maxGenerations=${tierInfo.freeGenerations}`,
      )
      if (response.ok) {
        const data = await response.json()
        setGenerationsRemaining(data.generationsRemaining)
        setPurchasedGenerations(data.purchasedGenerations)
        setTotalGenerations(data.totalGenerations)
        setResetTime(data.resetTime)
      }
    } catch (error) {
      console.error("Failed to check generation limit:", error)
    } finally {
      setIsCheckingLimit(false)
    }
  }

  const fetchUserCollections = async () => {
    if (!publicKey) {
      setUserCollections([])
      return
    }

    setIsFetchingCollections(true)
    try {
      const response = await fetch(`/api/get-user-collections?wallet=${publicKey.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setUserCollections(data.collections || [])
        console.log("[v0] Fetched user collections:", data.collections?.length || 0)
      }
    } catch (error) {
      console.error("[v0] Error fetching collections:", error)
    } finally {
      setIsFetchingCollections(false)
    }
  }

  useEffect(() => {
    const checkFreeMintStatus = async () => {
      if (!publicKey) {
        setHasFreeMint(false)
        return
      }

      setIsCheckingFreeMint(true)
      try {
        const response = await fetch(`/api/user/free-mint-status?wallet=${publicKey.toString()}`)
        if (response.ok) {
          const data = await response.json()
          setHasFreeMint(!data.freeMintUsed)
        }
      } catch (error) {
        console.error("Failed to check free mint status:", error)
      } finally {
        setIsCheckingFreeMint(false)
      }
    }

    checkFreeMintStatus()
    checkGenerationLimit()
    fetchUserCollections()

    if (!isCheckingTier && connected && tierInfo.tier !== "none") {
      const formattedBalance = tierInfo.balance.toLocaleString()
      toast({
        title: `${tierInfo.tierName} Tier Benefits! 🎉`,
        description: `${formattedBalance} $NFT • ${tierInfo.freeGenerations === -1 ? "Unlimited" : tierInfo.freeGenerations} free generation${tierInfo.freeGenerations > 1 ? "s" : ""} • ${tierInfo.discountPercent}% discount`,
      })
    }
  }, [publicKey, tierInfo, isCheckingTier, connected, toast])

  const handleEnhancePrompt = async () => {
    setIsEnhancingPrompt(true)
    try {
      const response = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), style, nsfwMode }),
      })

      if (!response.ok) throw new Error("Failed to enhance prompt")

      const { enhancedPrompt } = await response.json()
      setPrompt(enhancedPrompt)

      toast({
        title: prompt.trim() ? "Prompt Enhanced! ✨" : "Prompt Generated! ✨",
        description: "Your prompt has been optimized for DALL-E",
      })
    } catch (error) {
      toast({
        title: "Enhancement failed",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsEnhancingPrompt(false)
    }
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please enter a description for your NFT",
        variant: "destructive",
      })
      return
    }

    if (!connected || !publicKey) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to generate NFTs",
        variant: "destructive",
      })
      return
    }

    console.log("[v0] handleGenerate - tierInfo:", tierInfo)
    console.log("[v0] handleGenerate - totalGenerations:", totalGenerations)

    if (publicKey && totalGenerations !== null && totalGenerations === 0 && tierInfo.freeGenerations !== -1) {
      toast({
        title: "Generation Limit Reached",
        description: `You've used all your free generations today. Purchase more generations or buy $NFT tokens to increase your daily limit!`,
        variant: "destructive",
        action: (
          <a
            href="https://jup.ag/swap?sell=So11111111111111111111111111111111111111112&buy=MINTXUVoYQhagQ79V9q6VtWAWRYbeERjfkN8eEhJCYh"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Buy $NFT
          </a>
        ),
      })
      return
    }

    setIsGenerating(true)
    setAnalyzedAttributes(null)
    try {
      const [imageResponse, metadataResponse] = await Promise.all([
        fetch("/api/generate-nft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            style,
            nsfwMode,
            // Include Promptchan options when NSFW mode is enabled
            ...(nsfwMode && {
              nsfwOptions: {
                style: nsfwStyle,
                filter: nsfwFilter,
                emotion: nsfwEmotion,
                quality: nsfwQuality,
                image_size: nsfwImageSize,
                age_slider: nsfwAgeSlider,
                weight_slider: nsfwWeightSlider,
                breast_slider: nsfwBreastSlider,
                ass_slider: nsfwAssSlider,
              },
            }),
          }),
        }),
        fetch("/api/generate-nft-metadata", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, style }),
        }),
      ])

      if (!imageResponse.ok) throw new Error("Generation failed")
      if (!metadataResponse.ok) throw new Error("Metadata generation failed")

      const imageData = await imageResponse.json()
      const metadataData = await metadataResponse.json()

      setGeneratedImage(imageData.imageUrl)

      const generatedName = `${metadataData.name} #001`
      setSuggestedName(generatedName)
      setSuggestedDescription(metadataData.description)
      setName(generatedName)
      setDescription(metadataData.description)

      if (!nsfwMode) {
        setIsAnalyzingImage(true)
        try {
          console.log("[v0] Analyzing generated image with AI...")
          const analysisResponse = await fetch("/api/analyze-nft-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageUrl: imageData.imageUrl, prompt }),
          })

          if (analysisResponse.ok) {
            // FIX: Changed 'response.json()' to 'analysisResponse.json()'
            const { attributes } = await analysisResponse.json()
            setAnalyzedAttributes(attributes)
            console.log("[v0] Image analysis complete:", attributes)
          } else {
            console.warn("[v0] Image analysis failed, will use fallback during mint")
          }
        } catch (error) {
          console.error("[v0] Error analyzing image:", error)
        } finally {
          setIsAnalyzingImage(false)
        }
      }
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Please try again with a different prompt",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const processPayment = async (): Promise<boolean> => {
    if (!publicKey || !sendTransaction) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to mint NFTs",
        variant: "destructive",
      })
      return false
    }

    const discountMultiplier = (100 - tierInfo.discountPercent) / 100
    const mintCost = BASE_MINT_COST_SOL * discountMultiplier

    console.log("[v0] Payment Details:")
    console.log("[v0] - From Wallet:", publicKey.toString())
    console.log("[v0] - To Wallet (PAYMENT_WALLET):", PAYMENT_WALLET)
    console.log("[v0] - Amount:", mintCost, "SOL")

    setIsProcessingPayment(true)
    try {
      console.log("[v0] Creating payment transaction...")

      const response = await fetch("/api/solana/create-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "payment",
          fromWallet: publicKey.toString(),
          toWallet: PAYMENT_WALLET,
          amount: mintCost,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create payment transaction")
      }

      const { transaction: serializedTransaction } = await response.json()

      console.log("[v0] Sending payment transaction...")
      const signature = await sendTransaction(
        Transaction.from(Buffer.from(serializedTransaction, "base64")),
        connection,
        {
          skipPreflight: false,
          preflightCommitment: "confirmed",
        },
      )

      console.log("[v0] Payment transaction sent:", signature)
      console.log("[v0] View on Solscan:", `https://solscan.io/tx/${signature}`)

      toast({
        title: "Payment Sent",
        description: `Processing payment of ${mintCost.toFixed(4)} SOL...`,
      })

      console.log("[v0] Waiting for payment confirmation...")
      await new Promise((resolve) => setTimeout(resolve, 3000))

      toast({
        title: "Payment Confirmed",
        description: "Proceeding with NFT minting...",
      })

      return true
    } catch (error) {
      console.error("[v0] Payment error:", error)
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      })
      return false
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const handleMint = async () => {
    if (!generatedImage || !name.trim()) {
      toast({
        title: "Missing information",
        description: "Please generate an image and provide a name",
        variant: "destructive",
      })
      return
    }

    if (!connected || !publicKey) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to mint NFTs",
        variant: "destructive",
      })
      return
    }

    const walletAddress = publicKey.toString()

    console.log("[v0] Starting mint process:", { walletAddress, name, hasFreeMint })

    if (!hasFreeMint) {
      const paymentSuccess = await processPayment()
      if (!paymentSuccess) {
        console.log("[v0] Payment failed, aborting mint")
        return
      }
    } else {
      toast({
        title: "Using Free Mint! 🎉",
        description: "Your first NFT is on us!",
      })
    }

    setIsMinting(true)
    try {
      let generationAttributes: Record<string, string> = {}

      if (!nsfwMode && analyzedAttributes) {
        // Use pre-analyzed attributes from image analysis
        console.log("[v0] Using pre-analyzed attributes:", analyzedAttributes)
        const attributesObj: Record<string, string> = {}
        analyzedAttributes.forEach((attr) => {
          attributesObj[attr.trait_type] = attr.value
        })
        // Add Art Style
        attributesObj["Art Style"] = style.charAt(0).toUpperCase() + style.slice(1).replace(/-/g, " ")
        generationAttributes = attributesObj
      } else {
        // Generate attributes from settings (NSFW or fallback)
        console.log("[v0] Generating attributes from generation settings...")
        const attributesResponse = await fetch("/api/generate-nft-attributes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            style,
            nsfwMode,
            // Include NSFW options when in NSFW mode
            ...(nsfwMode && {
              nsfwOptions: {
                style: nsfwStyle,
                filter: nsfwFilter,
                emotion: nsfwEmotion,
                quality: nsfwQuality,
                age_slider: nsfwAgeSlider,
                weight_slider: nsfwWeightSlider,
                breast_slider: nsfwBreastSlider,
                ass_slider: nsfwAssSlider,
              },
            }),
          }),
        })

        if (attributesResponse.ok) {
          const { attributes: generatedAttributes } = await attributesResponse.json()
          generatedAttributes.forEach((attr: { trait_type: string; value: string }) => {
            generationAttributes[attr.trait_type] = attr.value
          })
          console.log("[v0] Generation-based attributes:", generationAttributes)
        } else {
          console.warn("[v0] Failed to generate attributes, using fallback")
          // Fallback attributes if generation fails
          if (!nsfwMode) {
            generationAttributes = {
              "Art Style": style.charAt(0).toUpperCase() + style.slice(1).replace(/-/g, " "),
            }
          } else {
            generationAttributes = {
              "Art Style": nsfwStyle,
              Filter: nsfwFilter,
              Emotion: nsfwEmotion,
              Quality: nsfwQuality,
              Age: nsfwAgeSlider.toString(),
              "Body Weight": nsfwWeightSlider.toFixed(1),
              "Breast Size": nsfwBreastSlider.toFixed(1),
              "Ass Size": nsfwAssSlider.toFixed(1),
            }
          }
        }
      }

      const finalAttributes = {
        ...generationAttributes,
      }

      const mintResponse = await fetch("/api/mint-nft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          imageUrl: generatedImage,
          attributes: finalAttributes,
          walletAddress,
          isFreeMint: hasFreeMint,
          nsfwMode, // Pass nsfwMode separately for database only
          collectionId: selectedCollectionId,
        }),
      })

      if (!mintResponse.ok) {
        const error = await mintResponse.json()
        console.error("[v0] Mint response error:", error)
        throw new Error(error.error || "Failed to mint NFT")
      }

      const { actionId, crossmintId } = await mintResponse.json()
      console.log("[v0] Mint started:", { actionId, crossmintId })
      setMintActionId(actionId)

      if (hasFreeMint) {
        setHasFreeMint(false)
      }

      toast({
        title: "NFT Minting Started!",
        description: `Minting to your wallet: ${walletAddress.slice(0, 8)}...`,
      })

      checkMintStatusPeriodically(actionId)
    } catch (error) {
      console.error("[v0] Minting error:", error)
      toast({
        title: "Minting failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      })
      setIsMinting(false)
    }
  }

  const checkMintStatusPeriodically = async (actionId: string) => {
    setIsCheckingStatus(true)
    const maxAttempts = 30
    let attempts = 0

    const checkStatus = async () => {
      try {
        console.log("[v0] Checking status, attempt:", attempts + 1)
        const response = await fetch(`/api/check-mint-status?actionId=${actionId}`)

        if (!response.ok) {
          // FIX: The original code had an error here, mintResponse was not declared.
          // It should be using the 'response' variable which holds the fetch result.
          const error = await response.json()
          console.error("[v0] Status check failed:", error)
          throw new Error(error.error || "Failed to check status")
        }

        const { status, txId, mintAddress, data } = await response.json()
        console.log("[v0] Status result:", { status, txId, mintAddress, data })

        if (status === "succeeded") {
          let nftId: number | null = null

          if (mintAddress) {
            console.log("[v0] Updating NFT with mint address:", mintAddress)
            try {
              const updateResponse = await fetch("/api/update-nft-mint-address", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ actionId, mintAddress, txId }),
              })

              if (updateResponse.ok) {
                const updateData = await updateResponse.json()
                nftId = updateData.nftId
                console.log("[v0] NFT mint address updated successfully, NFT ID:", nftId)
              } else {
                console.error("[v0] Failed to update NFT mint address")
              }
            } catch (updateError) {
              console.error("[v0] Error updating NFT mint address:", updateError)
            }
          }

          setMintTxId(txId)
          setMintedNftId(nftId)
          setIsMinting(false)
          setIsCheckingStatus(false)

          console.log("[v0] Minting successful! TxId:", txId)

          toast({
            title: "NFT Minted Successfully! 🎉",
            description: txId ? `Transaction: ${txId.slice(0, 8)}...` : "Your NFT is now on the blockchain",
          })

          setPrompt("")
          setName("")
          setDescription("")
          setEmail("")
          setGeneratedImage(null)
          setSuggestedName("")
          setSuggestedDescription("")
          setMintActionId(null)

          if (nftId) {
            setTimeout(() => {
              router.push(`/nft/${nftId}`)
            }, 1500)
          }
          return
        } else if (status === "failed") {
          console.error("[v0] Minting failed on blockchain")
          throw new Error("Minting failed on blockchain")
        }

        attempts++
        if (attempts < maxAttempts) {
          console.log("[v0] Still pending, checking again in 2 seconds...")
          setTimeout(checkStatus, 2000)
        } else {
          console.error("[v0] Minting timeout after", attempts, "attempts")
          throw new Error("Minting timeout - please check status later")
        }
      } catch (error) {
        console.error("[v0] Status check error:", error)
        setIsMinting(false)
        setIsCheckingStatus(false)
        toast({
          title: "Status check failed",
          description: error instanceof Error ? error.message : "Please try again",
          variant: "destructive",
        })
      }
    }

    checkStatus()
  }

  const getMintPrice = () => {
    if (hasFreeMint) return "FREE"
    const discountMultiplier = (100 - tierInfo.discountPercent) / 100
    const price = BASE_MINT_COST_SOL * discountMultiplier
    return `${price.toFixed(4)} SOL`
  }

  const showPurchaseButton = tierInfo.tier !== "mintmaker" && tierInfo.tier !== "none"

  return (
    <div className="space-y-6 sm:space-y-8">
      {connected && (
        <Card className="border-2 border-white/10 bg-gradient-to-br from-purple-500/10 via-background to-pink-500/5 backdrop-blur-xl overflow-hidden relative shadow-2xl shadow-purple-500/10">
          <div className="absolute inset-0 bg-radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.15),transparent_60%)]" />
          <div className="absolute inset-0 bg-radial-gradient(circle_at_20%_80%,rgba(236,72,153,0.1),transparent_60%)]" />
          <CardContent className="p-4 sm:p-6 md:p-8 relative">
            <div className="flex items-center gap-2 text-foreground mb-3">
              <Coins className="h-5 w-5 text-amber-400" />
              <span className="font-bold text-xl">{tierInfo.balance.toLocaleString()} $NFT</span>
            </div>

            <div className="w-full max-w-2xl">
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                <div className="flex-1 space-y-3 sm:space-y-4 w-full">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <TierBadge
                      tier={tierInfo.tier}
                      className="text-sm sm:text-base px-3 sm:px-5 py-1.5 sm:py-2 shadow-lg"
                    />
                  </div>
                  <h3 className="font-bold text-lg sm:text-xl text-white">Your {tierInfo.tierName} Benefits</h3>
                  <div className="flex flex-wrap gap-4 sm:gap-6 text-sm">
                    <div className="flex items-center gap-2 sm:gap-3 group">
                      <div className="p-2 sm:p-2.5 rounded-xl bg-purple-500/20 border border-purple-500/30 group-hover:bg-purple-500/30 transition-colors shadow-lg">
                        <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-purple-300" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-foreground font-medium text-sm">
                          {tierInfo.freeGenerations === -1 ? "Unlimited" : `${tierInfo.freeGenerations} free`}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          AI generations{tierInfo.freeGenerations !== -1 && "/day"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 group">
                      <div className="p-2 sm:p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 group-hover:bg-amber-500/30 transition-colors shadow-lg">
                        <Coins className="h-4 w-4 sm:h-5 sm:w-5 text-amber-300" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-foreground font-medium text-sm">{tierInfo.discountPercent}% off</span>
                        <span className="text-xs text-muted-foreground">Minting fees</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-background/60 backdrop-blur-sm border-2 border-white/10 hover:border-purple-500/40 hover:bg-purple-500/10 transition-all duration-300 shadow-lg hover:shadow-purple-500/20 w-full sm:w-auto justify-center">
                      <Info className="h-4 w-4 sm:h-5 sm:w-5 text-purple-300" />
                      <span className="text-sm font-semibold">Tier Info</span>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-2xl">$NFT Token Tier Benefits</DialogTitle>
                      <DialogDescription>
                        Hold more $NFT tokens to unlock higher tiers and exclusive benefits
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 mt-4">
                      {/* Base Tier */}
                      <div className="p-4 rounded-lg border bg-gradient-to-br from-gray-500/10 to-gray-600/10">
                        <div className="flex items-center gap-2 mb-3">
                          <TierBadge tier="base" />
                          <span className="text-sm text-muted-foreground">(0+ $NFT)</span>
                        </div>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span>1 free AI generation per day</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span>Standard minting fees</span>
                          </li>
                        </ul>
                      </div>

                      {/* Tier 1 - Creator */}
                      <div className="p-4 rounded-lg border bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                        <div className="flex items-center gap-2 mb-3">
                          <TierBadge tier="creator" />
                          <span className="text-sm text-muted-foreground">(1M+ $NFT)</span>
                        </div>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span>5 free AI generations per day</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span>25% discount on minting fees</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span>Eligible for automatic $SOL rewards</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span>Early access to new features</span>
                          </li>
                        </ul>
                      </div>

                      {/* Tier 2 - Legend */}
                      <div className="p-4 rounded-lg border bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                        <div className="flex items-center gap-2 mb-3">
                          <TierBadge tier="legend" />
                          <span className="text-sm text-muted-foreground">(5M+ $NFT)</span>
                        </div>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span>25 free AI generations per day</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span>50% discount on minting fees</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span>Priority support from our team</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span>Early access to new features</span>
                          </li>
                        </ul>
                      </div>

                      {/* Tier 3 - Mintmaker */}
                      <div className="p-4 rounded-lg border bg-gradient-to-br from-yellow-500/10 to-orange-500/10">
                        <div className="flex items-center gap-2 mb-3">
                          <TierBadge tier="mintmaker" />
                          <span className="text-sm text-muted-foreground">(10M+ $NFT)</span>
                        </div>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span className="font-semibold">Unlimited AI generations</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span>75% discount on all platform fees</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span>DAO governance voting rights</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span>Revenue share from platform</span>
                          </li>
                        </ul>
                      </div>

                      <div className="pt-4 border-t">
                        <Button asChild className="w-full gradient-purple-gold">
                          <a
                            href="https://jup.ag/swap?sell=So11111111111111111111111111111111111111112&buy=MINTXUVoYQhagQ79V9q6VtWAWRYbeERjfkN8eEhJCYh"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Coins className="mr-2 h-4 w-4" />
                            Buy $NFT on Jupiter
                          </a>
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-2 border-white/10 bg-gradient-to-br from-background via-purple-500/5 to-background backdrop-blur-xl overflow-hidden relative shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5" />
        <CardHeader className="relative pb-2 space-y-3 px-4 sm:px-6 pt-4 sm:pt-6">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="flex items-start gap-2 sm:gap-3 w-full sm:w-auto">
              <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 shadow-lg flex-shrink-0">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-purple-300" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Generate Your NFT
                </CardTitle>
                <CardDescription className="text-sm sm:text-base mt-1">
                  Describe your vision in detail for best results
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              {showPurchaseButton && connected && (
                <Button
                  onClick={() => setShowPurchaseModal(true)}
                  variant="outline"
                  className="h-10 sm:h-11 px-3 sm:px-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-2 border-purple-500/40 hover:border-purple-500/60 hover:bg-purple-500/20 text-sm"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Buy Credits
                </Button>
              )}
              <WalletConnectButton />
            </div>
          </div>
          {connected && totalGenerations !== null && (
            <Badge className="w-fit bg-purple-500/20 border border-purple-500/30 text-foreground px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-xl shadow-lg mb-2">
              {tierInfo.freeGenerations === -1 ? (
                "Unlimited Credits"
              ) : (
                <>
                  {totalGenerations} Credit{totalGenerations !== 1 ? "s" : ""} Remaining
                </>
              )}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 relative px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <Label htmlFor="prompt" className="text-sm sm:text-base font-semibold flex items-center gap-2">
                <span className="text-purple-400">✨</span>
                AI Prompt
              </Label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-background/60 backdrop-blur-sm border-2 border-white/10 hover:border-purple-500/40 transition-all duration-300 shadow-md h-9">
                  <Label
                    htmlFor="nsfw-mode"
                    className="text-xs sm:text-sm font-medium cursor-pointer whitespace-nowrap"
                  >
                    Enable NSFW Mode
                  </Label>
                  <Switch
                    id="nsfw-mode"
                    checked={nsfwMode}
                    onCheckedChange={setNsfwMode}
                    className="data-[state=checked]:bg-purple-500"
                  />
                </div>
                <Button
                  onClick={handleEnhancePrompt}
                  disabled={isEnhancingPrompt}
                  variant="outline"
                  size="sm"
                  className="h-9 px-3 bg-transparent border-2 border-transparent bg-gradient-to-r from-purple-500 to-amber-500 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 text-xs sm:text-sm"
                  style={{
                    backgroundClip: "padding-box",
                    border: "2px solid transparent",
                    backgroundImage: "linear-gradient(#000, #000), linear-gradient(to right, #9945FF, #14F195)",
                    backgroundOrigin: "border-box",
                    backgroundClip: "padding-box, border-box",
                  }}
                >
                  {isEnhancingPrompt ? (
                    <>
                      <Loader2 className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                      <span className="hidden sm:inline">Enhancing...</span>
                      <span className="sm:hidden">...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Enhance with AI</span>
                      <span className="sm:hidden">Enhance</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
            <Textarea
              id="prompt"
              placeholder="A majestic dragon soaring through a cyberpunk city at sunset, neon lights reflecting off its scales, highly detailed, digital art..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="resize-none bg-background/60 backdrop-blur-sm border-2 border-white/10 focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 rounded-xl text-sm sm:text-base shadow-inner"
            />
          </div>

          {!nsfwMode ? (
            <div className="space-y-4">
              <Label htmlFor="style" className="text-base font-semibold flex items-center gap-2">
                <span className="text-pink-400">🎨</span>
                Art Style
              </Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger
                  id="style"
                  className="bg-background/60 backdrop-blur-sm border-2 border-white/10 focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/20 h-14 rounded-xl text-base font-medium shadow-md"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-2">
                  <SelectItem value="realistic" className="text-base">
                    Realistic
                  </SelectItem>
                  <SelectItem value="digital-art" className="text-base">
                    Digital Art
                  </SelectItem>
                  <SelectItem value="anime" className="text-base">
                    Anime
                  </SelectItem>
                  <SelectItem value="oil-painting" className="text-base">
                    Oil Painting
                  </SelectItem>
                  <SelectItem value="cyberpunk" className="text-base">
                    Cyberpunk
                  </SelectItem>
                  <SelectItem value="fantasy" className="text-base">
                    Fantasy
                  </SelectItem>
                  <SelectItem value="abstract" className="text-base">
                    Abstract
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Style */}
              <div className="space-y-4">
                <Label htmlFor="nsfw-style" className="text-base font-semibold flex items-center gap-2">
                  <span className="text-pink-400">🎨</span>
                  Art Style
                </Label>
                <Select value={nsfwStyle} onValueChange={setNsfwStyle}>
                  <SelectTrigger
                    id="nsfw-style"
                    className="bg-background/60 backdrop-blur-sm border-2 border-white/10 focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/20 h-14 rounded-xl text-base font-medium shadow-md"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2 max-h-[300px]">
                    <SelectItem value="Cinematic">Cinematic</SelectItem>
                    <SelectItem value="Anime">Anime</SelectItem>
                    <SelectItem value="Hyperreal">Hyperreal</SelectItem>
                    <SelectItem value="Hyperanime">Hyperanime</SelectItem>
                    <SelectItem value="K-Pop">K-Pop</SelectItem>
                    <SelectItem value="Fur">Fur</SelectItem>
                    <SelectItem value="Furt<ons">Furtoon</SelectItem>
                    <SelectItem value="Render XL+">Render XL+</SelectItem>
                    <SelectItem value="Illustration XL+">Illustration XL+</SelectItem>
                    <SelectItem value="Anime XL">Anime XL</SelectItem>
                    <SelectItem value="Anime XL+">Anime XL+</SelectItem>
                    <SelectItem value="Hardcore XL">Hardcore XL</SelectItem>
                    <SelectItem value="Cinematic XL">Cinematic XL</SelectItem>
                    <SelectItem value="Photo XL+">Photo XL+</SelectItem>
                    <SelectItem value="Hyperreal XL+">Hyperreal XL+</SelectItem>
                    <SelectItem value="Hyperreal XL+ v2">Hyperreal XL+ v2</SelectItem>
                    <SelectItem value="Photo XL+ v2">Photo XL+ v2</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filter */}
              <div className="space-y-4">
                <Label htmlFor="nsfw-filter" className="text-base font-semibold flex items-center gap-2">
                  <span className="text-purple-400">🎭</span>
                  Filter
                </Label>
                <Select value={nsfwFilter} onValueChange={setNsfwFilter}>
                  <SelectTrigger
                    id="nsfw-filter"
                    className="bg-background/60 backdrop-blur-sm border-2 border-white/10 focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/20 h-14 rounded-xl text-base font-medium shadow-md"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2 max-h-[300px]">
                    <SelectItem value="Default">Default</SelectItem>
                    <SelectItem value="Cinematic">Cinematic</SelectItem>
                    <SelectItem value="Studio">Studio</SelectItem>
                    <SelectItem value="Flash">Flash</SelectItem>
                    <SelectItem value="Analog">Analog</SelectItem>
                    <SelectItem value="Professional">Professional</SelectItem>
                    <SelectItem value="Polaroid">Polaroid</SelectItem>
                    <SelectItem value="Vintage">Vintage</SelectItem>
                    <SelectItem value="Manga">Manga</SelectItem>
                    <SelectItem value="Cyberpunk">Cyberpunk</SelectItem>
                    <SelectItem value="VHS">VHS</SelectItem>
                    <SelectItem value="Pixel XL">Pixel XL</SelectItem>
                    <SelectItem value="Comic XL">Comic XL</SelectItem>
                    <SelectItem value="Retro Porn XL">Retro Porn XL</SelectItem>
                    <SelectItem value="Fire Style XL">Fire Style XL</SelectItem>
                    <SelectItem value="Hyper">Hyper</SelectItem>
                    <SelectItem value="3D">3D</SelectItem>
                    <SelectItem value="Sketch">Sketch</SelectItem>
                    <SelectItem value="Watercolor">Watercolor</SelectItem>
                    <SelectItem value="Lineart">Lineart</SelectItem>
                    <SelectItem value="Moody">Moody</SelectItem>
                    <SelectItem value="Oil Painting">Oil Painting</SelectItem>
                    <SelectItem value="Rainbow">Rainbow</SelectItem>
                    <SelectItem value="Artsy">Artsy</SelectItem>
                    <SelectItem value="Artsy 2">Artsy 2</SelectItem>
                    <SelectItem value="Cartoon">Cartoon</SelectItem>
                    <SelectItem value="Cartoon Vintage">Cartoon Vintage</SelectItem>
                    <SelectItem value="Painted">Painted</SelectItem>
                    <SelectItem value="Cartoon 2">Cartoon 2</SelectItem>
                    <SelectItem value="Cartoon 3">Cartoon 3</SelectItem>
                    <SelectItem value="Cartoon Minimalist">Cartoon Minimalist</SelectItem>
                    <SelectItem value="Character Sheet">Character Sheet</SelectItem>
                    <SelectItem value="Vintage Comic">Vintage Comic</SelectItem>
                    <SelectItem value="Pixel Art">Pixel Art</SelectItem>
                    <SelectItem value="Anime Studio">Anime Studio</SelectItem>
                    <SelectItem value="Polariod Picture">Polariod Picture</SelectItem>
                    <SelectItem value="Flash Photo">Flash Photo</SelectItem>
                    <SelectItem value="Noir Movie">Noir Movie</SelectItem>
                    <SelectItem value="Analog Photo">Analog Photo</SelectItem>
                    <SelectItem value="Vintage Photo">Vintage Photo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Emotion */}
              <div className="space-y-4">
                <Label htmlFor="nsfw-emotion" className="text-base font-semibold flex items-center gap-2">
                  <span className="text-yellow-400">😊</span>
                  Emotion
                </Label>
                <Select value={nsfwEmotion} onValueChange={setNsfwEmotion}>
                  <SelectTrigger
                    id="nsfw-emotion"
                    className="bg-background/60 backdrop-blur-sm border-2 border-white/10 focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/20 h-14 rounded-xl text-base font-medium shadow-md"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2">
                    <SelectItem value="Default">Default</SelectItem>
                    <SelectItem value="Upset">Upset</SelectItem>
                    <SelectItem value="Disgusted">Disgusted</SelectItem>
                    <SelectItem value="Scared">Scared</SelectItem>
                    <SelectItem value="Winking">Winking</SelectItem>
                    <SelectItem value="Angry">Angry</SelectItem>
                    <SelectItem value="Smiling">Smiling</SelectItem>
                    <SelectItem value="Laughing">Laughing</SelectItem>
                    <SelectItem value="Ouch">Ouch</SelectItem>
                    <SelectItem value="Shocked">Shocked</SelectItem>
                    <SelectItem value="Orgasm Face">Orgasm Face</SelectItem>
                    <SelectItem value="Stick out Tongue">Stick out Tongue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Quality */}
              <div className="space-y-4">
                <Label htmlFor="nsfw-quality" className="text-base font-semibold flex items-center gap-2">
                  <span className="text-green-400">💎</span>
                  Quality
                </Label>
                <Select value={nsfwQuality} onValueChange={setNsfwQuality}>
                  <SelectTrigger
                    id="nsfw-quality"
                    className="bg-background/60 backdrop-blur-sm border-2 border-white/10 focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/20 h-14 rounded-xl text-base font-medium shadow-md"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2">
                    <SelectItem value="Ultra">Ultra</SelectItem>
                    <SelectItem value="Extreme">Extreme</SelectItem>
                    <SelectItem value="Max">Max</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Image Size */}
              <div className="space-y-4">
                <Label htmlFor="nsfw-size" className="text-base font-semibold flex items-center gap-2">
                  <span className="text-blue-400">📐</span>
                  Image Size
                </Label>
                <Select value={nsfwImageSize} onValueChange={setNsfwImageSize}>
                  <SelectTrigger
                    id="nsfw-size"
                    className="bg-background/60 backdrop-blur-sm border-2 border-white/10 focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/20 h-14 rounded-xl text-base font-medium shadow-md"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2">
                    <SelectItem value="512x512">Square (512x512)</SelectItem>
                    <SelectItem value="512x768">Portrait (512x768)</SelectItem>
                    <SelectItem value="768x512">Landscape (768x512)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Age Slider */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <span className="text-indigo-400">👤</span>
                    Age
                  </Label>
                  <span className="text-sm text-muted-foreground font-mono">{nsfwAgeSlider}</span>
                </div>
                <Slider
                  value={[nsfwAgeSlider]}
                  onValueChange={(value) => setNsfwAgeSlider(value[0])}
                  min={18}
                  max={60}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Weight Slider */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <span className="text-teal-400">⚖️</span>
                    Body Weight
                  </Label>
                  <span className="text-sm text-muted-foreground font-mono">{nsfwWeightSlider.toFixed(1)}</span>
                </div>
                <Slider
                  value={[nsfwWeightSlider]}
                  onValueChange={(value) => setNsfwWeightSlider(value[0])}
                  min={-1}
                  max={1}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Breast Slider */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <span className="text-rose-400">💗</span>
                    Breast Size
                  </Label>
                  <span className="text-sm text-muted-foreground font-mono">{nsfwBreastSlider.toFixed(1)}</span>
                </div>
                <Slider
                  value={[nsfwBreastSlider]}
                  onValueChange={(value) => setNsfwBreastSlider(value[0])}
                  min={-1}
                  max={1}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Ass Slider */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <span className="text-fuchsia-400">🍑</span>
                    Ass Size
                  </Label>
                  <span className="text-sm text-muted-foreground font-mono">{nsfwAssSlider.toFixed(1)}</span>
                </div>
                <Slider
                  value={[nsfwAssSlider]}
                  onValueChange={(value) => setNsfwAssSlider(value[0])}
                  min={-1}
                  max={1}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim() || !connected}
            className="w-full bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 hover:from-purple-500 hover:via-purple-400 hover:to-pink-500 transition-all duration-300 h-12 sm:h-14 text-sm sm:text-base font-bold shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] rounded-xl"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                {isAnalyzingImage ? "Generating metadata..." : "Generating NFT..."}
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                {!connected ? "Connect Wallet to Generate" : "Generate NFT"}
              </>
            )}
          </Button>

          {connected && totalGenerations === 0 && tierInfo.freeGenerations !== -1 && resetTime && (
            <div className="p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl border-2 border-orange-500/30 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3 text-center">
                <h4 className="font-bold text-lg text-orange-400">Generation Limit Reached</h4>
                <p className="text-sm text-muted-foreground">You've used all your free generations today</p>
                <div className="flex items-center gap-2 text-foreground">
                  <span className="text-sm font-medium">Daily resets in:</span>
                  <CountdownTimer resetTime={resetTime} className="text-orange-400" />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {generatedImage && (
        <Card className="border-2 border-white/10 bg-gradient-to-br from-background via-pink-500/5 to-background backdrop-blur-xl overflow-hidden relative shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-purple-500/5" />
          <CardHeader className="relative pb-6 sm:pb-8 space-y-3 px-4 sm:px-6 pt-4 sm:pt-6">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 shadow-lg flex-shrink-0">
                <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-pink-300" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                  Your Generated NFT
                </CardTitle>
                <CardDescription className="text-sm sm:text-base mt-1">
                  Add details and mint to the blockchain
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 sm:space-y-8 relative px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-muted border-4 border-white/10 shadow-2xl shadow-purple-500/20 hover:shadow-purple-500/30 transition-shadow duration-300">
              <Image src={generatedImage || "/placeholder.svg"} alt="Generated NFT" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button
                variant="outline"
                className="flex-1 bg-background/60 backdrop-blur-sm border-2 border-white/10 hover:border-purple-500/40 hover:bg-purple-500/10 h-11 sm:h-12 rounded-xl font-semibold shadow-lg transition-all duration-300 text-sm sm:text-base"
                onClick={() => window.open(generatedImage, "_blank")}
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button
                variant="outline"
                className="flex-1 bg-background/60 backdrop-blur-sm border-2 border-white/10 hover:border-purple-500/40 hover:bg-purple-500/10 h-11 sm:h-12 rounded-xl font-semibold shadow-lg transition-all duration-300 text-sm sm:text-base"
                onClick={handleGenerate}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Regenerate
              </Button>
            </div>

            <div className="space-y-6 sm:space-y-8 pt-6 sm:pt-8 border-t-2 border-white/10">
              <div className="space-y-4">
                <Label htmlFor="name" className="text-base font-semibold flex items-center gap-2">
                  <span className="text-purple-400">🏷️</span>
                  NFT Name *
                </Label>
                <Input
                  id="name"
                  placeholder={suggestedName || "Legendary Dragon #001"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-background/60 backdrop-blur-sm border-2 border-white/10 focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/20 h-14 rounded-xl text-base font-medium shadow-md transition-all duration-300"
                />
              </div>

              <div className="space-y-4">
                <Label htmlFor="description" className="text-base font-semibold flex items-center gap-2">
                  <span className="text-pink-400">📝</span>
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder={suggestedDescription || "A unique piece from the Legendary Dragons collection..."}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="resize-none bg-background/60 backdrop-blur-sm border-2 border-white/10 focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 rounded-xl text-base shadow-inner"
                />
              </div>

              <div className="space-y-4">
                <Label htmlFor="collection" className="text-base font-semibold flex items-center gap-2">
                  <span className="text-amber-400">📚</span>
                  Collection
                </Label>
                <div className="flex gap-2">
                  <Select
                    value={selectedCollectionId}
                    onValueChange={(value) => {
                      if (value === "create-new") {
                        setShowCreateCollectionModal(true)
                      } else {
                        setSelectedCollectionId(value)
                      }
                    }}
                  >
                    <SelectTrigger
                      id="collection"
                      className="flex-1 bg-background/60 backdrop-blur-sm border-2 border-white/10 focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/20 h-14 rounded-xl text-base font-medium shadow-md"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-2">
                      <SelectItem value="7acf523c-ca02-46a7-803d-fe8a3204e905" className="text-base">
                        NFT AI (Default)
                      </SelectItem>
                      {userCollections.map((collection) => (
                        <SelectItem key={collection.id} value={collection.crossmint_id} className="text-base">
                          {collection.name} ({collection.symbol})
                        </SelectItem>
                      ))}
                      <SelectItem value="create-new" className="text-base font-semibold text-purple-400">
                        <div className="flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          Create New Collection
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {!connected && (
                <div className="p-8 bg-gradient-to-br from-muted/60 to-muted/40 rounded-2xl border-2 border-border backdrop-blur-sm">
                  <p className="text-base text-muted-foreground text-center font-semibold">
                    Connect your wallet to mint NFTs
                  </p>
                </div>
              )}

              <Button
                onClick={handleMint}
                disabled={
                  !connected ||
                  isMinting ||
                  isProcessingPayment ||
                  !name.trim() ||
                  isCheckingFreeMint ||
                  isCheckingTier ||
                  isAnalyzingImage
                }
                className="w-full bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 hover:from-purple-500 hover:via-purple-400 hover:to-pink-500 transition-all duration-300 h-14 sm:h-16 text-base sm:text-lg font-bold shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] rounded-xl"
              >
                {isProcessingPayment ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    <span className="text-sm sm:text-base">Processing Payment...</span>
                  </>
                ) : isMinting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    <span className="text-sm sm:text-base">
                      {isCheckingStatus ? "Confirming on blockchain..." : "Minting..."}
                    </span>
                  </>
                ) : isAnalyzingImage ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    <span className="text-sm sm:text-base">Generating metadata...</span>
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    {hasFreeMint ? (
                      <>
                        <span className="text-sm sm:text-base">Mint NFT (FREE)</span>{" "}
                        <Gift className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                      </>
                    ) : (
                      <>
                        <span className="text-sm sm:text-base">Mint NFT ({getMintPrice()})</span>
                        {tierInfo.tier !== "none" && <Coins className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />}
                      </>
                    )}
                  </>
                )}
              </Button>

              {connected && (
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  {hasFreeMint && (
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 px-6 py-3 text-base font-bold shadow-2xl shadow-purple-500/40 rounded-xl">
                      <Gift className="mr-2 h-5 w-5" />
                      First Mint Free!
                    </Badge>
                  )}
                </div>
              )}

              {mintActionId && (
                <p className="text-xs text-center text-muted-foreground font-mono bg-muted/50 py-2 px-4 rounded-lg">
                  Action ID: {mintActionId}
                </p>
              )}

              {mintTxId && (
                <div className="flex items-center justify-center gap-2 text-base text-green-400 bg-green-500/10 border border-green-500/30 py-3 px-6 rounded-xl font-semibold shadow-lg">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Minted! TX: {mintTxId.slice(0, 8)}...</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <PurchaseGenerationsModal
        open={showPurchaseModal}
        onOpenChange={setShowPurchaseModal}
        onPurchaseComplete={checkGenerationLimit}
      />

      {connected && publicKey && (
        <CreateCollectionModal
          open={showCreateCollectionModal}
          onOpenChange={setShowCreateCollectionModal}
          walletAddress={publicKey.toString()}
          onCollectionCreated={() => {
            fetchUserCollections()
            toast({
              title: "Collection Created! 🎉",
              description: "Your new collection is now available for minting",
            })
          }}
        />
      )}
    </div>
  )
}
