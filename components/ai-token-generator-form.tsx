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
  CheckCircle2,
  Coins,
  Wand2,
  ShoppingCart,
  Rocket,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { WalletConnectButton } from "@/components/wallet-connect-button"
import { CountdownTimer } from "@/components/countdown-timer"
import { PurchaseGenerationsModal } from "@/components/purchase-generations-modal"
import { useMintTier } from "@/hooks/use-mint-tier"
import { getSdk, prepareTokenCreation, finalizeTokenCreation, type FinalizeTokenParams } from "@/lib/revshare"
import { prepareRaydiumToken, createRaydiumToken } from "@/lib/raydium"
import { uploadMetadataToPumpFun, createPumpFunTokenTransaction } from "@/lib/pumpportal"
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, Keypair, VersionedTransaction } from "@solana/web3.js"

export function AITokenGeneratorForm({
  launcherType = "bonding",
}: { launcherType?: "bonding" | "raydium" | "pumpfun" }) {
  const router = useRouter()
  const [prompt, setPrompt] = useState("")
  const [name, setName] = useState("")
  const [symbol, setSymbol] = useState("")
  const [description, setDescription] = useState("")
  const [style, setStyle] = useState("realistic")
  const [showSocialLinks, setShowSocialLinks] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [twitter, setTwitter] = useState("")
  const [telegram, setTelegram] = useState("")
  const [website, setWebsite] = useState("")
  const [initialBuyAmount, setInitialBuyAmount] = useState("0.1")
  const [taxTier, setTaxTier] = useState("6")
  const [rewardToken, setRewardToken] = useState("So11111111111111111111111111111111111111112") // SOL
  const [mode, setMode] = useState("0") // Rewards
  const [devFeePercentage, setDevFeePercentage] = useState("50")

  const [isGenerating, setIsGenerating] = useState(false)
  const [isCreatingToken, setIsCreatingToken] = useState(false)
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [suggestedName, setSuggestedName] = useState("")
  const [suggestedSymbol, setSuggestedSymbol] = useState("")
  const [suggestedDescription, setSuggestedDescription] = useState("")
  const [createdTokenMint, setCreatedTokenMint] = useState<string | null>(null)
  const [generationsRemaining, setGenerationsRemaining] = useState<number | null>(null)
  const [purchasedGenerations, setPurchasedGenerations] = useState<number>(0)
  const [totalGenerations, setTotalGenerations] = useState<number | null>(null)
  const [resetTime, setResetTime] = useState<string | null>(null)
  const [isCheckingLimit, setIsCheckingLimit] = useState(false)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [solBalance, setSolBalance] = useState<number | null>(null)
  const [isCheckingBalance, setIsCheckingBalance] = useState(false)

  const { toast } = useToast()
  const { publicKey, connected, sendTransaction } = useWallet()
  const { connection } = useConnection()
  const { tierInfo, isLoading: isCheckingTier } = useMintTier()

  const REF_WALLET = "nBSgYVouHELGQTpmKmFaJqKNcryK19EhdSSZWAT9RLT"

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

  const checkSolBalance = async () => {
    if (!publicKey || !connection) {
      setSolBalance(null)
      return
    }

    setIsCheckingBalance(true)
    try {
      const balance = await connection.getBalance(publicKey)
      const solAmount = balance / LAMPORTS_PER_SOL
      setSolBalance(solAmount)
      console.log("[v0] Wallet SOL balance:", solAmount)
    } catch (error) {
      console.error("[v0] Failed to check SOL balance:", error)
      setSolBalance(null)
    } finally {
      setIsCheckingBalance(false)
    }
  }

  useEffect(() => {
    checkGenerationLimit()
    checkSolBalance()

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
        body: JSON.stringify({ prompt: prompt.trim(), style, nsfwMode: false, type: "token" }),
      })

      if (!response.ok) throw new Error("Failed to enhance prompt")

      const { enhancedPrompt } = await response.json()
      setPrompt(enhancedPrompt)

      toast({
        title: prompt.trim() ? "Prompt Enhanced! ✨" : "Prompt Generated! ✨",
        description: "Your prompt has been optimized for token generation",
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
        description: "Please enter a description for your token",
        variant: "destructive",
      })
      return
    }

    if (!connected || !publicKey) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to generate tokens",
        variant: "destructive",
      })
      return
    }

    if (publicKey && totalGenerations !== null && totalGenerations === 0 && tierInfo.freeGenerations !== -1) {
      toast({
        title: "Generation Limit Reached",
        description: `You've used all your free generations today. Purchase more generations or buy $NFT tokens to increase your daily limit!`,
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    try {
      const [imageResponse, metadataResponse] = await Promise.all([
        fetch("/api/generate-nft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            style,
            nsfwMode: false,
          }),
        }),
        fetch("/api/generate-token-metadata", {
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

      const generatedName = metadataData.name
      const generatedSymbol = metadataData.symbol

      setSuggestedName(generatedName)
      setSuggestedSymbol(generatedSymbol)
      setSuggestedDescription(metadataData.description)
      setName(generatedName)
      setSymbol(generatedSymbol)
      setDescription(metadataData.description)

      toast({
        title: "Token Design Generated! 🎉",
        description: "Review and customize your token details",
      })
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

  const handleCreateToken = async () => {
    if (!generatedImage || !name.trim() || !symbol.trim()) {
      toast({
        title: "Missing information",
        description: "Please generate an image and provide name and symbol",
        variant: "destructive",
      })
      return
    }

    if (!connected || !publicKey) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to create tokens",
        variant: "destructive",
      })
      return
    }

    const BASE_FEE_SOL = 0.05
    const PLATFORM_WALLET = "BMGDFno6qX6yZ4Wbg1rWcQVxuVfTCEEe2VKsygRZfoh5"

    let TOTAL_SOL_REQUIRED: number
    if (launcherType === "raydium") {
      // Raydium: 0.43 SOL base fees + liquidity amount
      // Breakdown: 0.1 (maintenance) + 0.03 (creation) + 0.2 (Raydium pool) + 0.1 (platform) = 0.43
      const liquidityAmount = Number.parseFloat(initialBuyAmount) || 0.1
      TOTAL_SOL_REQUIRED = 0.43 + liquidityAmount
    } else if (launcherType === "pumpfun") {
      // Pumpfun: Initial buy amount + platform fee (e.g., 0.0005 SOL priority fee)
      // The actual creation cost is handled by pump.fun internally after the transaction is signed.
      const initialBuy = Number.parseFloat(initialBuyAmount) || 0
      TOTAL_SOL_REQUIRED = initialBuy + 0.0005 // Add a small buffer for priority fee
    } else {
      // Bonding: 0.05 base + initial buy amount
      const initialBuy = Number.parseFloat(initialBuyAmount) || 0
      TOTAL_SOL_REQUIRED = BASE_FEE_SOL + initialBuy
    }

    if (solBalance !== null && solBalance < TOTAL_SOL_REQUIRED) {
      const feeBreakdown =
        launcherType === "raydium"
          ? `0.1 (maintenance) + 0.03 (creation) + 0.2 (Raydium pool) + 0.1 (platform) + ${(Number.parseFloat(initialBuyAmount) || 0.1).toFixed(2)} (liquidity)`
          : launcherType === "pumpfun"
            ? `0.0005 (priority fee) + ${(Number.parseFloat(initialBuyAmount) || 0).toFixed(2)} (initial buy)`
            : `0.05 (base fee) + ${(Number.parseFloat(initialBuyAmount) || 0).toFixed(2)} (initial buy)`

      toast({
        title: "Insufficient SOL Balance",
        description: `You need at least ${TOTAL_SOL_REQUIRED.toFixed(4)} SOL (${feeBreakdown}). Your balance: ${solBalance.toFixed(4)} SOL`,
        variant: "destructive",
      })
      return
    }

    const walletAddress = publicKey.toString()

    console.log("[v0] Starting token creation:", {
      launcherType,
      walletAddress,
      name,
      symbol,
      solBalance,
      totalRequired: TOTAL_SOL_REQUIRED,
    })

    setIsCreatingToken(true)
    try {
      if (launcherType === "pumpfun") {
        toast({
          title: "Preparing Pumpfun Token",
          description: "Uploading metadata to IPFS...",
        })

        // Fetch the image as a blob
        const imageResponse = await fetch(generatedImage)
        const imageBlob = await imageResponse.blob()

        // Upload metadata to PumpFun IPFS
        const metadataResponse = await uploadMetadataToPumpFun(
          imageBlob,
          name,
          symbol,
          description || `${name} token created with AI`,
          twitter || undefined,
          telegram || undefined,
          website || undefined,
        )

        console.log("[v0] Metadata uploaded:", metadataResponse)

        toast({
          title: "Creating Pumpfun Token",
          description: "Generating transaction...",
        })

        // Generate a random keypair for the token mint
        const mintKeypair = Keypair.generate()
        console.log("[v0] Generated mint keypair:", mintKeypair.publicKey.toBase58())

        // Get the transaction from PumpPortal
        const txBuffer = await createPumpFunTokenTransaction({
          action: "create",
          publicKey: walletAddress,
          tokenMetadata: {
            name: metadataResponse.metadata.name,
            symbol: metadataResponse.metadata.symbol,
            uri: metadataResponse.metadataUri,
          },
          mint: mintKeypair.publicKey.toBase58(),
          denominatedInSol: "true",
          amount: Number.parseFloat(initialBuyAmount) || 0,
          slippage: 10,
          priorityFee: 0.0005,
          pool: "pump",
        })

        console.log("[v0] Transaction received from PumpPortal")

        toast({
          title: "Signing Transaction",
          description: "Please approve in your wallet...",
        })

        // Deserialize and sign the transaction
        const tx = VersionedTransaction.deserialize(new Uint8Array(txBuffer))
        tx.sign([mintKeypair])

        console.log("[v0] Transaction signed with mint keypair, sending to wallet...")

        // Send the transaction
        const signature = await sendTransaction(tx, connection)
        console.log("[v0] Pumpfun token transaction sent:", signature)

        toast({
          title: "Confirming Transaction",
          description: "Waiting for blockchain confirmation...",
        })

        // Wait for confirmation
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
        await connection.confirmTransaction({
          signature,
          blockhash,
          lastValidBlockHeight,
        })

        const mint = mintKeypair.publicKey.toBase58()
        console.log("[v0] Pumpfun token created:", mint)

        toast({
          title: "Saving Token Data",
          description: "Recording token information...",
        })

        try {
          const saveResponse = await fetch("/api/save-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tokenAddress: mint,
              name: name,
              symbol: symbol,
              description: description || `${name} token created with AI`,
              imageUrl: generatedImage,
              creatorWallet: walletAddress,
              launcherType: "pumpfun",
              initialBuyAmount: Number.parseFloat(initialBuyAmount) || 0,
              decimals: 9,
              metadata: {
                twitter: twitter || null,
                telegram: telegram || null,
                website: website || null,
                prompt: prompt,
                style: style,
                metadataUri: metadataResponse.metadataUri,
              },
            }),
          })

          if (!saveResponse.ok) {
            const errorData = await saveResponse.json()
            console.error("[v0] Failed to save token to database:", errorData)
            throw new Error(errorData.error || "Failed to save token to database")
          }

          const saveData = await saveResponse.json()
          console.log("[v0] Token saved to database successfully:", saveData)
        } catch (dbError) {
          console.error("[v0] Database save error:", dbError)
          toast({
            title: "Warning: Database Save Failed",
            description: "Token was created but failed to save to database. Please contact support.",
            variant: "destructive",
          })
        }

        setCreatedTokenMint(mint)

        toast({
          title: "Pumpfun Token Created Successfully! 🎉",
          description: `Your token ${symbol} is now live on Pump.fun!`,
        })

        // Reset form
        setPrompt("")
        setName("")
        setSymbol("")
        setDescription("")
        setGeneratedImage(null)
        setSuggestedName("")
        setSuggestedSymbol("")
        setSuggestedDescription("")
        setTwitter("")
        setTelegram("")
        setWebsite("")
        setInitialBuyAmount("0.1")

        setTimeout(() => {
          window.open(`https://pump.fun/${mint}`, "_blank")
        }, 1500)
      } else if (launcherType === "raydium") {
        toast({
          title: "Preparing Raydium Token",
          description: "Setting up your liquidity token...",
        })

        const prepareResult = await prepareRaydiumToken()
        console.log("[v0] Raydium prepare result:", prepareResult)

        const { request_id, funding_wallet } = prepareResult

        const liquidityAmount = Number.parseFloat(initialBuyAmount) || 0.1

        toast({
          title: "Funding Token Creation",
          description: `Sending ${TOTAL_SOL_REQUIRED.toFixed(2)} SOL to funding wallet...`,
        })

        const transaction1 = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: new PublicKey(funding_wallet),
            lamports: Math.floor(TOTAL_SOL_REQUIRED * LAMPORTS_PER_SOL),
          }),
        )

        const { blockhash: blockhash1, lastValidBlockHeight: lastValidBlockHeight1 } =
          await connection.getLatestBlockhash()
        transaction1.recentBlockhash = blockhash1
        transaction1.feePayer = publicKey

        const signature1 = await sendTransaction(transaction1, connection)
        console.log("[v0] Funding wallet transfer sent:", signature1)

        await connection.confirmTransaction({
          signature: signature1,
          blockhash: blockhash1,
          lastValidBlockHeight: lastValidBlockHeight1,
        })

        console.log("[v0] Funding wallet transfer confirmed:", signature1)

        toast({
          title: "Creating Raydium Token",
          description: "Deploying to Raydium with liquidity pool...",
        })

        const raydiumResult = await createRaydiumToken({
          request_id: request_id,
          name: name,
          ticker: symbol,
          description: description || `${name} token created with AI`,
          imageUrl: generatedImage,
          developerWallet: walletAddress,
          website: website || undefined,
          twitter: twitter || undefined,
          telegram: telegram || undefined,
          visible: 0,
          decimals: 9,
          initialSupply: 1000000000,
          poolTax: 4,
          mode: 0,
          dev_fee_percentage: 50,
          ref: REF_WALLET,
        })

        if (!raydiumResult.success || !raydiumResult.mintAddress) {
          throw new Error(raydiumResult.error || "Failed to create Raydium token")
        }

        const mint = raydiumResult.mintAddress
        console.log("[v0] Raydium token created:", mint)

        toast({
          title: "Saving Token Data",
          description: "Recording token information...",
        })

        try {
          const saveResponse = await fetch("/api/save-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tokenAddress: mint,
              name: name,
              symbol: symbol,
              description: description || `${name} token created with AI`,
              imageUrl: generatedImage,
              creatorWallet: walletAddress,
              requestId: request_id,
              launcherType: "raydium",
              poolTax: 4,
              initialBuyAmount: 0,
              decimals: 9,
              metadata: {
                twitter: twitter || null,
                telegram: telegram || null,
                website: website || null,
                prompt: prompt,
                style: style,
                liquidityPoolId: raydiumResult.data?.liquidityPoolId,
                liquidityTxSignature: raydiumResult.liquidityTxSignature,
              },
            }),
          })

          if (!saveResponse.ok) {
            const errorData = await saveResponse.json()
            console.error("[v0] Failed to save token to database:", errorData)
            throw new Error(errorData.error || "Failed to save token to database")
          }

          const saveData = await saveResponse.json()
          console.log("[v0] Token saved to database successfully:", saveData)
        } catch (dbError) {
          console.error("[v0] Database save error:", dbError)
          toast({
            title: "Warning: Database Save Failed",
            description: "Token was created but failed to save to database. Please contact support.",
            variant: "destructive",
          })
        }

        setCreatedTokenMint(mint)

        toast({
          title: "Raydium Token Created Successfully! 🎉",
          description: `Your token ${symbol} is now live on Raydium!`,
        })

        // Reset form
        setPrompt("")
        setName("")
        setSymbol("")
        setDescription("")
        setGeneratedImage(null)
        setSuggestedName("")
        setSuggestedSymbol("")
        setSuggestedDescription("")
        setTwitter("")
        setTelegram("")
        setWebsite("")
        setInitialBuyAmount("0.1")

        setTimeout(() => {
          window.open(`https://solscan.io/token/${mint}`, "_blank")
        }, 1500)
      } else {
        // Bonding token flow
        const sdk = getSdk(process.env.NEXT_PUBLIC_SOLANA_RPC_URL)

        toast({
          title: "Preparing Token Creation",
          description: "Setting up your token...",
        })

        const prepareResult = await prepareTokenCreation(sdk)
        console.log("[v0] Prepare result:", prepareResult)

        const { request_id, funding_wallet, amount_to_fund } = prepareResult

        toast({
          title: "Funding Token Creation",
          description: `Transferring ${TOTAL_SOL_REQUIRED.toFixed(4)} SOL to distribution wallet...`,
        })

        console.log("[v0] Creating transfer transaction:", {
          from: walletAddress,
          to: funding_wallet,
          amount: TOTAL_SOL_REQUIRED,
          breakdown: { baseFee: BASE_FEE_SOL, initialBuy: Number.parseFloat(initialBuyAmount) || 0 },
        })

        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: new PublicKey(funding_wallet),
            lamports: Math.floor(TOTAL_SOL_REQUIRED * LAMPORTS_PER_SOL),
          }),
        )

        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
        transaction.recentBlockhash = blockhash
        transaction.feePayer = publicKey

        console.log("[v0] Requesting wallet signature for funding transfer...")

        const signature = await sendTransaction(transaction, connection)

        console.log("[v0] Transfer transaction sent:", signature)

        toast({
          title: "Confirming Transfer",
          description: "Waiting for blockchain confirmation...",
        })

        await connection.confirmTransaction({
          signature,
          blockhash,
          lastValidBlockHeight,
        })

        console.log("[v0] Transfer confirmed:", signature)

        toast({
          title: "Creating Token",
          description: "Deploying to Solana blockchain...",
        })

        const tokenParams: FinalizeTokenParams = {
          request_id: request_id,
          name: name,
          symbol: symbol,
          description: description || `${name} token created with AI`,
          imageUrl: generatedImage,
          developerWallet: walletAddress,
          mode: Number.parseInt(mode),
          bondingCurveType: 1,
          initialBuy: Number.parseFloat(initialBuyAmount),
          twitter: twitter,
          telegram: telegram,
          website: website,
          taxTier: Number.parseInt(taxTier),
          devFeePercentage: Number.parseInt(devFeePercentage),
          rewardToken: rewardToken,
          ref: REF_WALLET,
        }

        const { mint } = await finalizeTokenCreation(sdk, tokenParams)
        console.log("[v0] Token created:", mint)

        toast({
          title: "Saving Token Data",
          description: "Recording token information...",
        })

        try {
          const saveResponse = await fetch("/api/save-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tokenAddress: mint,
              name: name,
              symbol: symbol,
              description: description || `${name} token created with AI`,
              imageUrl: generatedImage,
              creatorWallet: walletAddress,
              requestId: request_id,
              bondingCurveType: 1,
              initialBuyAmount: Number.parseFloat(initialBuyAmount),
              decimals: 9,
              metadata: {
                twitter: twitter || null,
                telegram: telegram || null,
                website: website || null,
                prompt: prompt,
                style: style,
              },
            }),
          })

          if (!saveResponse.ok) {
            const errorData = await saveResponse.json()
            console.error("[v0] Failed to save token to database:", errorData)
            throw new Error(errorData.error || "Failed to save token to database")
          }

          const saveData = await saveResponse.json()
          console.log("[v0] Token saved to database successfully:", saveData)
        } catch (dbError) {
          console.error("[v0] Database save error:", dbError)
          toast({
            title: "Warning: Database Save Failed",
            description: "Token was created but failed to save to database. Please contact support.",
            variant: "destructive",
          })
        }

        setCreatedTokenMint(mint)

        toast({
          title: "Token Created Successfully! 🎉",
          description: `Your token ${symbol} is now live on Solana!`,
        })

        setPrompt("")
        setName("")
        setSymbol("")
        setDescription("")
        setGeneratedImage(null)
        setSuggestedName("")
        setSuggestedSymbol("")
        setSuggestedDescription("")
        setTwitter("")
        setTelegram("")
        setWebsite("")
        setInitialBuyAmount("0.1")

        setTimeout(() => {
          window.open(`https://solscan.io/token/${mint}`, "_blank")
        }, 1500)
      }
    } catch (error) {
      console.error("[v0] Token creation error:", error)
      toast({
        title: "Token creation failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsCreatingToken(false)
    }
  }

  const REQUIRED_SOL =
    launcherType === "raydium"
      ? 0.43 + (Number.parseFloat(initialBuyAmount) || 0.1)
      : launcherType === "pumpfun"
        ? (Number.parseFloat(initialBuyAmount) || 0) + 0.0005
        : 0.05 + (Number.parseFloat(initialBuyAmount) || 0)
  const hasInsufficientBalance = solBalance !== null && solBalance < REQUIRED_SOL
  const showPurchaseButton = tierInfo.tier !== "mintmaker" && tierInfo.tier !== "none"

  return (
    <div className="space-y-6 sm:space-y-8">
      <Card className="border-2 border-white/10 bg-gradient-to-br from-background via-purple-500/5 to-background backdrop-blur-xl overflow-hidden relative shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5" />
        <CardHeader className="relative pb-2 space-y-3 px-4 sm:px-6 pt-4 sm:pt-6">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="flex items-start gap-2 sm:gap-3 w-full sm:w-auto">
              <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 shadow-lg flex-shrink-0">
                <Coins className="h-5 w-5 sm:h-6 sm:w-6 text-purple-300" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Generate Your Token
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
            <Textarea
              id="prompt"
              placeholder="A revolutionary DeFi token with cosmic energy, featuring a glowing nebula design, futuristic and innovative..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="resize-none bg-background/60 backdrop-blur-sm border-2 border-white/10 focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 rounded-xl text-sm sm:text-base shadow-inner"
            />
          </div>

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

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim() || !connected}
            className="w-full bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 hover:from-purple-500 hover:via-purple-400 hover:to-pink-500 transition-all duration-300 h-12 sm:h-14 text-sm sm:text-base font-bold shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                Generating Token Design...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                {!connected ? "Connect Wallet to Generate" : "Generate Token (1 Credit)"}
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
                  Your Generated Token
                </CardTitle>
                <CardDescription className="text-sm sm:text-base mt-1">
                  Add details and launch on Solana
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 sm:space-y-8 relative px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-muted border-4 border-white/10 shadow-2xl shadow-purple-500/20 hover:shadow-purple-500/30 transition-shadow duration-300">
              <Image src={generatedImage || "/placeholder.svg"} alt="Generated Token" fill className="object-cover" />
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
                  Token Name *
                </Label>
                <Input
                  id="name"
                  placeholder={suggestedName || "Cosmic Token"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-background/60 backdrop-blur-sm border-2 border-white/10 focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/20 h-14 rounded-xl text-base font-medium shadow-md transition-all duration-300"
                />
              </div>

              <div className="space-y-4">
                <Label htmlFor="symbol" className="text-base font-semibold flex items-center gap-2">
                  <span className="text-amber-400">💎</span>
                  Token Symbol *
                </Label>
                <Input
                  id="symbol"
                  placeholder={suggestedSymbol || "COSMIC"}
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  maxLength={10}
                  className="bg-background/60 backdrop-blur-sm border-2 border-white/10 focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/20 h-14 rounded-xl"
                />
              </div>

              <div className="space-y-4">
                <Label htmlFor="description" className="text-base font-semibold flex items-center gap-2">
                  <span className="text-pink-400">📝</span>
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder={suggestedDescription || "A revolutionary token with cosmic energy..."}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="resize-none bg-background/60 backdrop-blur-sm border-2 border-white/10 focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 rounded-xl text-base shadow-inner"
                />
              </div>

              <div className="space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSocialLinks(!showSocialLinks)}
                  className="w-full bg-background/60 backdrop-blur-sm border-2 border-white/10 hover:border-purple-500/40 hover:bg-purple-500/10 h-12 rounded-xl font-semibold shadow-lg transition-all duration-300 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-blue-400">🔗</span>
                    Social Links
                  </span>
                  {showSocialLinks ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>

                {showSocialLinks && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="space-y-2">
                      <Label htmlFor="twitter" className="text-sm font-medium">
                        Twitter / X
                      </Label>
                      <Input
                        id="twitter"
                        placeholder="https://x.com/yourtoken"
                        value={twitter}
                        onChange={(e) => setTwitter(e.target.value)}
                        className="bg-background/60 backdrop-blur-sm border-2 border-white/10 focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/20 h-12 rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="telegram" className="text-sm font-medium">
                        Telegram
                      </Label>
                      <Input
                        id="telegram"
                        placeholder="https://t.me/yourtoken"
                        value={telegram}
                        onChange={(e) => setTelegram(e.target.value)}
                        className="bg-background/60 backdrop-blur-sm border-2 border-white/10 focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/20 h-12 rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website" className="text-sm font-medium">
                        Website
                      </Label>
                      <Input
                        id="website"
                        placeholder="https://yourtoken.com"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="bg-background/60 backdrop-blur-sm border-2 border-white/10 focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/20 h-12 rounded-xl"
                      />
                    </div>
                  </div>
                )}
              </div>

              {!connected && (
                <div className="p-8 bg-gradient-to-br from-muted/60 to-muted/40 rounded-2xl border-2 border-border backdrop-blur-sm">
                  <p className="text-base text-muted-foreground text-center font-semibold">
                    Connect your wallet to create tokens
                  </p>
                </div>
              )}

              {connected && hasInsufficientBalance && (
                <div className="p-6 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-xl border-2 border-red-500/30 backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-2">
                      <h4 className="font-bold text-base text-red-400">Insufficient SOL Balance</h4>
                      <p className="text-sm text-muted-foreground">
                        You need at least{" "}
                        <span className="font-semibold text-foreground">{REQUIRED_SOL.toFixed(2)} SOL</span> to create a
                        token
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Your balance:</span>
                        <span className="font-semibold text-foreground">{solBalance?.toFixed(4)} SOL</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {launcherType === "raydium"
                          ? "Please add SOL to your wallet to continue. The fee covers token creation (0.05 SOL) and platform fee (0.05 SOL)."
                          : launcherType === "pumpfun"
                            ? "Please add SOL to your wallet to continue. The fee covers the initial buy amount and a small priority fee."
                            : "Please add SOL to your wallet to continue. The fee covers token creation and any initial buy amount."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {launcherType === "raydium" && (
                <div className="space-y-4">
                  <Label htmlFor="initialBuy" className="text-base font-semibold flex items-center gap-2">
                    <span className="text-green-400">💰</span>
                    Liquidity Amount
                  </Label>
                  <div className="relative">
                    <Input
                      id="initialBuy"
                      type="number"
                      step="0.01"
                      min="0.1"
                      placeholder="0.1"
                      value={initialBuyAmount}
                      onChange={(e) => setInitialBuyAmount(e.target.value)}
                      className="bg-background/60 backdrop-blur-sm border-2 border-white/10 focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/20 h-14 rounded-xl text-base font-medium shadow-md transition-all duration-300 pr-16"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                      SOL
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Amount of SOL to provide as initial liquidity for the Raydium pool. Minimum 0.1 SOL required.
                  </p>
                </div>
              )}

              {launcherType === "pumpfun" && (
                <div className="space-y-4">
                  <Label htmlFor="initialBuy" className="text-base font-semibold flex items-center gap-2">
                    <span className="text-green-400">💰</span>
                    Initial Buy (Optional)
                  </Label>
                  <div className="relative">
                    <Input
                      id="initialBuy"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.1"
                      value={initialBuyAmount}
                      onChange={(e) => setInitialBuyAmount(e.target.value)}
                      className="bg-background/60 backdrop-blur-sm border-2 border-white/10 focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/20 h-14 rounded-xl text-base font-medium shadow-md transition-all duration-300 pr-16"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                      SOL
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Amount of SOL to use for initial token purchase on Pump.fun. This creates instant liquidity and
                    price discovery.
                  </p>
                </div>
              )}

              {launcherType !== "raydium" && launcherType !== "pumpfun" && (
                <div className="space-y-4">
                  <Label htmlFor="initialBuy" className="text-base font-semibold flex items-center gap-2">
                    <span className="text-green-400">💰</span>
                    Initial Buy (Optional)
                  </Label>
                  <div className="relative">
                    <Input
                      id="initialBuy"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.1"
                      value={initialBuyAmount}
                      onChange={(e) => setInitialBuyAmount(e.target.value)}
                      className="bg-background/60 backdrop-blur-sm border-2 border-white/10 focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/20 h-14 rounded-xl text-base font-medium shadow-md transition-all duration-300 pr-16"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                      SOL
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Amount of SOL to use for initial token purchase after creation. This will be added to the 0.05 SOL
                    base fee.
                  </p>
                </div>
              )}

              {launcherType === "bonding" && (
                <div className="space-y-4 pt-4 border-t-2 border-white/10">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="w-full flex items-center justify-between text-base font-bold hover:bg-white/5"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-blue-400">⚙️</span>
                      Advanced Configuration
                    </span>
                    {showAdvanced ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </Button>

                  {showAdvanced && (
                    <div className="space-y-4 pl-4 border-l-2 border-purple-500/30 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="space-y-4">
                        <Label htmlFor="taxTier" className="text-sm font-semibold">
                          Tax Tier
                        </Label>
                        <Select value={taxTier} onValueChange={setTaxTier}>
                          <SelectTrigger className="bg-background/60 backdrop-blur-sm border-2 border-white/10 focus:border-purple-500/60 h-12 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">0% - No Tax</SelectItem>
                            <SelectItem value="6">6% Tax</SelectItem>
                            <SelectItem value="10">10% Tax</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">Tax percentage on transactions</p>
                      </div>

                      <div className="space-y-4">
                        <Label htmlFor="mode" className="text-sm font-semibold">
                          Distribution Mode
                        </Label>
                        <Select value={mode} onValueChange={setMode}>
                          <SelectTrigger className="bg-background/60 backdrop-blur-sm border-2 border-white/10 focus:border-purple-500/60 h-12 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Rewards - Distribute to holders</SelectItem>
                            <SelectItem value="1">Jackpot - Winner takes all</SelectItem>
                            <SelectItem value="2">Lottery - Random winners</SelectItem>
                            <SelectItem value="3">Standard - No rewards</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">How tax revenue is distributed</p>
                      </div>

                      <div className="space-y-4">
                        <Label htmlFor="devFeePercentage" className="text-sm font-semibold">
                          Developer Fee Percentage
                        </Label>
                        <Input
                          id="devFeePercentage"
                          type="number"
                          min="0"
                          max="100"
                          value={devFeePercentage}
                          onChange={(e) => setDevFeePercentage(e.target.value)}
                          className="bg-background/60 backdrop-blur-sm border-2 border-white/10 focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/20 h-12 rounded-xl text-base shadow-md transition-all duration-300"
                        />
                        <p className="text-xs text-muted-foreground">
                          Percentage of tax that goes to developer (0-100%)
                        </p>
                      </div>

                      <div className="space-y-4">
                        <Label htmlFor="rewardToken" className="text-sm font-semibold">
                          Reward Token Address
                        </Label>
                        <Input
                          id="rewardToken"
                          value={rewardToken}
                          onChange={(e) => setRewardToken(e.target.value)}
                          placeholder="So11111111111111111111111111111111111111112"
                          className="bg-background/60 backdrop-blur-sm border-2 border-white/10 focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/20 h-12 rounded-xl text-base shadow-md transition-all duration-300 font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground">Token used for rewards (default: SOL)</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Button
                onClick={handleCreateToken}
                disabled={!connected || isCreatingToken || !name.trim() || !symbol.trim() || hasInsufficientBalance}
                className="w-full bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 hover:from-purple-500 hover:via-purple-400 hover:to-pink-500 transition-all duration-300 h-14 sm:h-16 text-sm sm:text-lg font-bold shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingToken ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    <span className="text-sm sm:text-base">Creating Token...</span>
                  </>
                ) : hasInsufficientBalance ? (
                  <>
                    <AlertCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-sm sm:text-base">
                      Insufficient SOL (
                      {launcherType === "raydium"
                        ? (0.43 + (Number.parseFloat(initialBuyAmount) || 0.1)).toFixed(2)
                        : launcherType === "pumpfun"
                          ? ((Number.parseFloat(initialBuyAmount) || 0) + 0.0005).toFixed(4)
                          : REQUIRED_SOL.toFixed(2)}{" "}
                      SOL Required)
                    </span>
                  </>
                ) : (
                  <>
                    <Rocket className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-sm sm:text-base">
                      {launcherType === "raydium"
                        ? "Create Token"
                        : launcherType === "pumpfun"
                          ? "Launch Token"
                          : "Launch Token"}{" "}
                      (
                      {launcherType === "raydium"
                        ? (0.43 + (Number.parseFloat(initialBuyAmount) || 0.1)).toFixed(2)
                        : launcherType === "pumpfun"
                          ? ((Number.parseFloat(initialBuyAmount) || 0) + 0.0005).toFixed(4)
                          : (0.05 + (Number.parseFloat(initialBuyAmount) || 0)).toFixed(4)}{" "}
                      SOL)
                    </span>
                  </>
                )}
              </Button>

              {createdTokenMint && (
                <div className="flex items-center justify-center gap-2 text-base text-green-400 bg-green-500/10 border border-green-500/30 py-3 px-6 rounded-xl font-semibold shadow-lg">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Token Created! Mint: {createdTokenMint.slice(0, 8)}...</span>
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
    </div>
  )
}
