"use client"

import type React from "react"

import type { ReactElement } from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, X, ImageIcon, Rocket, ChevronDown, ChevronUp, AlertCircle } from "lucide-react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { WalletConnectButton } from "@/components/wallet-connect-button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { getSdk, prepareTokenCreation, finalizeTokenCreation, type FinalizeTokenParams } from "@/lib/revshare"
import { prepareRaydiumToken, createRaydiumToken } from "@/lib/raydium"
import { uploadMetadataToPumpFun, createPumpFunTokenTransaction } from "@/lib/pumpportal"
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, Keypair, VersionedTransaction } from "@solana/web3.js"

type LauncherType = "bonding" | "pumpfun" | "raydium"

interface ManualTokenUploadFormProps {
  launcherType: LauncherType
}

export function ManualTokenUploadForm({ launcherType }: ManualTokenUploadFormProps): ReactElement {
  const { publicKey, connected, sendTransaction } = useWallet()
  const { connection } = useConnection()
  const { toast } = useToast()
  const [isCreating, setIsCreating] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [solBalance, setSolBalance] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    description: "",
    twitter: "",
    telegram: "",
    website: "",
    initialBuy: launcherType === "bonding" || launcherType === "pumpfun" ? "0" : "",
    liquidityAmount: launcherType === "raydium" ? "0.1" : "",
    // Advanced bonding curve options
    taxTier: "6",
    rewardToken: "So11111111111111111111111111111111111111112", // SOL
    mode: "0", // Rewards
    devFeePercentage: "50",
  })

  useState(() => {
    const checkBalance = async () => {
      if (!publicKey || !connection) {
        setSolBalance(null)
        return
      }
      try {
        const balance = await connection.getBalance(publicKey)
        setSolBalance(balance / LAMPORTS_PER_SOL)
        console.log("[v0] Wallet SOL balance:", balance / LAMPORTS_PER_SOL)
      } catch (error) {
        console.error("[v0] Failed to check balance:", error)
      }
    }
    checkBalance()
  }, [publicKey, connection])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file")
      return
    }

    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const REF_WALLET = "nBSgYVouHELGQTpmKmFaJqKNcryK19EhdSSZWAT9RLT"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!publicKey) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet first",
        variant: "destructive",
      })
      return
    }

    if (!imageFile) {
      toast({
        title: "Image Required",
        description: "Please upload an image",
        variant: "destructive",
      })
      return
    }

    if (launcherType === "raydium") {
      const liquidityAmount = Number.parseFloat(formData.liquidityAmount)
      if (liquidityAmount < 0.1) {
        toast({
          title: "Invalid Liquidity",
          description: "Minimum liquidity amount is 0.1 SOL",
          variant: "destructive",
        })
        return
      }
    }

    const BASE_FEE_SOL = 0.05
    let TOTAL_SOL_REQUIRED: number
    if (launcherType === "raydium") {
      const liquidityAmount = Number.parseFloat(formData.liquidityAmount) || 0.1
      TOTAL_SOL_REQUIRED = 0.43 + liquidityAmount
    } else if (launcherType === "pumpfun") {
      const initialBuy = Number.parseFloat(formData.initialBuy) || 0
      TOTAL_SOL_REQUIRED = initialBuy + 0.0005
    } else {
      const initialBuy = Number.parseFloat(formData.initialBuy) || 0
      TOTAL_SOL_REQUIRED = BASE_FEE_SOL + initialBuy
    }

    if (solBalance !== null && solBalance < TOTAL_SOL_REQUIRED) {
      toast({
        title: "Insufficient SOL Balance",
        description: `You need at least ${TOTAL_SOL_REQUIRED.toFixed(4)} SOL. Your balance: ${solBalance.toFixed(4)} SOL`,
        variant: "destructive",
      })
      return
    }

    const walletAddress = publicKey.toString()

    setIsCreating(true)

    try {
      toast({
        title: "Uploading Image",
        description: "Uploading your token logo...",
      })

      const formDataToSend = new FormData()
      formDataToSend.append("image", imageFile)

      const uploadResponse = await fetch("/api/upload-image", {
        method: "POST",
        body: formDataToSend,
      })

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json()
        throw new Error(error.error || "Failed to upload image")
      }

      const { url: imageUrl } = await uploadResponse.json()
      console.log("[v0] Image uploaded successfully:", imageUrl)

      if (launcherType === "pumpfun") {
        toast({
          title: "Preparing Pumpfun Token",
          description: "Uploading metadata to IPFS...",
        })

        const imageResponse = await fetch(imageUrl)
        const imageBlob = await imageResponse.blob()

        const metadataResponse = await uploadMetadataToPumpFun(
          imageBlob,
          formData.name,
          formData.symbol,
          formData.description || `${formData.name} token`,
          formData.twitter || undefined,
          formData.telegram || undefined,
          formData.website || undefined,
        )

        toast({
          title: "Creating Pumpfun Token",
          description: "Generating transaction...",
        })

        const mintKeypair = Keypair.generate()

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
          amount: Number.parseFloat(formData.initialBuy) || 0,
          slippage: 10,
          priorityFee: 0.0005,
          pool: "pump",
        })

        toast({
          title: "Signing Transaction",
          description: "Please approve in your wallet...",
        })

        const tx = VersionedTransaction.deserialize(new Uint8Array(txBuffer))
        tx.sign([mintKeypair])

        const signature = await sendTransaction(tx, connection)

        toast({
          title: "Confirming Transaction",
          description: "Waiting for blockchain confirmation...",
        })

        const mint = mintKeypair.publicKey.toBase58()

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
              name: formData.name,
              symbol: formData.symbol,
              description: formData.description || `${formData.name} token`,
              imageUrl: imageUrl,
              creatorWallet: walletAddress,
              launcherType: "pumpfun",
              initialBuyAmount: Number.parseFloat(formData.initialBuy) || 0,
              decimals: 9,
              metadata: {
                twitter: formData.twitter || null,
                telegram: formData.telegram || null,
                website: formData.website || null,
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

        toast({
          title: "Pumpfun Token Created! 🎉",
          description: `Your token ${formData.symbol} is now live!`,
        })

        setTimeout(() => {
          window.open(`https://pump.fun/${mint}`, "_blank")
        }, 1500)
      } else if (launcherType === "raydium") {
        toast({
          title: "Preparing Raydium Token",
          description: "Setting up your liquidity token...",
        })

        const prepareResult = await prepareRaydiumToken()
        const { request_id, funding_wallet } = prepareResult

        toast({
          title: "Funding Token Creation",
          description: `Sending ${TOTAL_SOL_REQUIRED.toFixed(2)} SOL...`,
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

        await connection.confirmTransaction({
          signature: signature1,
          blockhash: blockhash1,
          lastValidBlockHeight: lastValidBlockHeight1,
        })

        toast({
          title: "Creating Raydium Token",
          description: "Deploying to Raydium...",
        })

        const raydiumResult = await createRaydiumToken({
          request_id: request_id,
          name: formData.name,
          ticker: formData.symbol,
          description: formData.description || `${formData.name} token`,
          imageUrl: imageUrl,
          developerWallet: walletAddress,
          website: formData.website || undefined,
          twitter: formData.twitter || undefined,
          telegram: formData.telegram || undefined,
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
              name: formData.name,
              symbol: formData.symbol,
              description: formData.description || `${formData.name} token`,
              imageUrl: imageUrl,
              creatorWallet: walletAddress,
              requestId: request_id,
              launcherType: "raydium",
              poolTax: 4,
              initialBuyAmount: 0,
              decimals: 9,
              metadata: {
                twitter: formData.twitter || null,
                telegram: formData.telegram || null,
                website: formData.website || null,
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

        toast({
          title: "Raydium Token Created! 🎉",
          description: `Your token ${formData.symbol} is now live!`,
        })

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
        const { request_id, funding_wallet } = prepareResult

        toast({
          title: "Funding Token Creation",
          description: `Transferring ${TOTAL_SOL_REQUIRED.toFixed(4)} SOL...`,
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

        const signature = await sendTransaction(transaction, connection)

        await connection.confirmTransaction({
          signature,
          blockhash,
          lastValidBlockHeight,
        })

        toast({
          title: "Creating Token",
          description: "Deploying to Solana blockchain...",
        })

        const tokenParams: FinalizeTokenParams = {
          request_id: request_id,
          name: formData.name,
          symbol: formData.symbol,
          description: formData.description || `${formData.name} token`,
          imageUrl: imageUrl,
          developerWallet: walletAddress,
          mode: Number.parseInt(formData.mode),
          bondingCurveType: 1,
          initialBuy: Number.parseFloat(formData.initialBuy),
          twitter: formData.twitter,
          telegram: formData.telegram,
          website: formData.website,
          taxTier: Number.parseInt(formData.taxTier),
          devFeePercentage: Number.parseInt(formData.devFeePercentage),
          rewardToken: formData.rewardToken,
          ref: REF_WALLET,
        }

        const { mint } = await finalizeTokenCreation(sdk, tokenParams)

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
              name: formData.name,
              symbol: formData.symbol,
              description: formData.description || `${formData.name} token`,
              imageUrl: imageUrl,
              creatorWallet: walletAddress,
              requestId: request_id,
              bondingCurveType: 1,
              initialBuyAmount: Number.parseFloat(formData.initialBuy),
              decimals: 9,
              metadata: {
                twitter: formData.twitter || null,
                telegram: formData.telegram || null,
                website: formData.website || null,
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

        toast({
          title: "Token Created! 🎉",
          description: `Your token ${formData.symbol} is now live!`,
        })

        setTimeout(() => {
          window.open(`https://solscan.io/token/${mint}`, "_blank")
        }, 1500)
      }
    } catch (error) {
      console.error("[v0] Error:", error)
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create token. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const REQUIRED_SOL =
    launcherType === "raydium"
      ? 0.43 + (Number.parseFloat(formData.liquidityAmount) || 0.1)
      : launcherType === "pumpfun"
        ? (Number.parseFloat(formData.initialBuy) || 0) + 0.0005
        : 0.05 + (Number.parseFloat(formData.initialBuy) || 0)
  const hasInsufficientBalance = solBalance !== null && solBalance < REQUIRED_SOL

  return (
    <div className="space-y-6 sm:space-y-8">
      <Card className="border-2 border-white/10 bg-gradient-to-br from-background via-purple-500/5 to-background backdrop-blur-xl overflow-hidden relative shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5" />
        <CardHeader className="relative pb-2 space-y-3 px-4 sm:px-6 pt-4 sm:pt-6">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="flex items-start gap-2 sm:gap-3 w-full sm:w-auto">
              <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 shadow-lg flex-shrink-0">
                <Rocket className="h-5 w-5 sm:h-6 sm:w-6 text-purple-300" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Create Your Token
                </CardTitle>
                <CardDescription className="text-sm sm:text-base mt-1">
                  Create your token and deploy on{" "}
                  {launcherType === "bonding" ? "Meteora" : launcherType === "pumpfun" ? "Pumpfun" : "Raydium"}
                </CardDescription>
              </div>
            </div>
            <WalletConnectButton />
          </div>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 relative px-4 sm:px-6 pb-4 sm:pb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div
              className={`relative border-2 border-dashed rounded-2xl transition-all duration-300 ${
                isDragging
                  ? "border-purple-500/60 bg-purple-500/10"
                  : "border-white/10 bg-background/60 backdrop-blur-sm"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {!imagePreview ? (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 shadow-lg mb-4">
                    <Upload className="h-12 w-12 text-purple-300" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Upload Token Logo
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
                    Drag and drop your logo here, or click to browse
                  </p>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <Label htmlFor="file-upload">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      asChild
                      className="bg-transparent border-2 border-transparent bg-gradient-to-r from-purple-600 to-amber-500 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300"
                      style={{
                        backgroundClip: "padding-box",
                        border: "2px solid transparent",
                        backgroundImage: "linear-gradient(#000, #000), linear-gradient(to right, #9945FF, #14F195)",
                        backgroundOrigin: "border-box",
                        backgroundClip: "padding-box, border-box",
                      }}
                    >
                      <span className="cursor-pointer">
                        <ImageIcon className="mr-2 h-5 w-5" />
                        Choose Image
                      </span>
                    </Button>
                  </Label>
                </div>
              ) : (
                <div className="relative p-4">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Preview"
                    className="w-full h-auto rounded-xl max-h-96 object-contain mx-auto shadow-2xl"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-6 right-6 rounded-full shadow-lg"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <Label htmlFor="name" className="text-base font-semibold flex items-center gap-2">
                    <span className="text-purple-400">🏷️</span>
                    Token Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., My Token"
                    required
                    className="bg-background/60 backdrop-blur-sm border-2 border-white/10 focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/20 h-14 rounded-xl text-base font-medium shadow-md transition-all duration-300"
                  />
                </div>

                <div className="space-y-4">
                  <Label htmlFor="symbol" className="text-base font-semibold flex items-center gap-2">
                    <span className="text-pink-400">🎯</span>
                    Symbol *
                  </Label>
                  <Input
                    id="symbol"
                    value={formData.symbol}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                    placeholder="e.g., MTK"
                    required
                    maxLength={10}
                    className="bg-background/60 backdrop-blur-sm border-2 border-white/10 focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/20 h-12 rounded-xl text-base shadow-md transition-all duration-300"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label htmlFor="description" className="text-base font-semibold flex items-center gap-2">
                  <span className="text-amber-400">📝</span>
                  Description *
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your token..."
                  required
                  rows={4}
                  className="resize-none bg-background/60 backdrop-blur-sm border-2 border-white/10 focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 rounded-xl text-base shadow-inner"
                />
              </div>

              <div className="space-y-4 pt-4 border-t-2 border-white/10">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <span className="text-green-400">💰</span>
                  Launch Parameters
                </h3>

                {(launcherType === "bonding" || launcherType === "pumpfun") && (
                  <div className="space-y-4">
                    <Label htmlFor="initialBuy" className="text-sm font-semibold">
                      Initial Buy (SOL)
                    </Label>
                    <Input
                      id="initialBuy"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.initialBuy}
                      onChange={(e) => setFormData({ ...formData, initialBuy: e.target.value })}
                      placeholder="0.1"
                      className="bg-background/60 backdrop-blur-sm border-2 border-white/10 focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/20 h-12 rounded-xl text-base shadow-md transition-all duration-300"
                    />
                    <p className="text-xs text-muted-foreground">Amount of SOL to buy initially (optional)</p>
                  </div>
                )}

                {launcherType === "raydium" && (
                  <div className="space-y-4">
                    <Label htmlFor="liquidityAmount" className="text-sm font-semibold">
                      Liquidity Amount (SOL) *
                    </Label>
                    <Input
                      id="liquidityAmount"
                      type="number"
                      step="0.01"
                      min="0.1"
                      value={formData.liquidityAmount}
                      onChange={(e) => setFormData({ ...formData, liquidityAmount: e.target.value })}
                      placeholder="0.1"
                      required
                      className="bg-background/60 backdrop-blur-sm border-2 border-white/10 focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/20 h-12 rounded-xl text-base shadow-md transition-all duration-300"
                    />
                    <p className="text-xs text-muted-foreground">Minimum 0.1 SOL required for liquidity</p>
                  </div>
                )}
              </div>

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
                    <div className="space-y-4 pl-4 border-l-2 border-purple-500/30">
                      <div className="space-y-4">
                        <Label htmlFor="taxTier" className="text-sm font-semibold">
                          Tax Tier
                        </Label>
                        <Select
                          value={formData.taxTier}
                          onValueChange={(value) => setFormData({ ...formData, taxTier: value })}
                        >
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
                        <Select
                          value={formData.mode}
                          onValueChange={(value) => setFormData({ ...formData, mode: value })}
                        >
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
                          value={formData.devFeePercentage}
                          onChange={(e) => setFormData({ ...formData, devFeePercentage: e.target.value })}
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
                          value={formData.rewardToken}
                          onChange={(e) => setFormData({ ...formData, rewardToken: e.target.value })}
                          placeholder="So11111111111111111111111111111111111111112"
                          className="bg-background/60 backdrop-blur-sm border-2 border-white/10 focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/20 h-12 rounded-xl text-base shadow-md transition-all duration-300 font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground">Token used for rewards (default: SOL)</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-4 pt-4 border-t-2 border-white/10">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <span className="text-blue-400">🔗</span>
                  Social Links (Optional)
                </h3>

                <div className="space-y-4">
                  <Label htmlFor="twitter" className="text-sm font-semibold">
                    Twitter
                  </Label>
                  <Input
                    id="twitter"
                    value={formData.twitter}
                    onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                    placeholder="https://twitter.com/yourtoken"
                    className="bg-background/60 backdrop-blur-sm border-2 border-white/10 focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/20 h-12 rounded-xl text-base shadow-md transition-all duration-300"
                  />
                </div>

                <div className="space-y-4">
                  <Label htmlFor="telegram" className="text-sm font-semibold">
                    Telegram
                  </Label>
                  <Input
                    id="telegram"
                    value={formData.telegram}
                    onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                    placeholder="https://t.me/yourtoken"
                    className="bg-background/60 backdrop-blur-sm border-2 border-white/10 focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/20 h-12 rounded-xl text-base shadow-md transition-all duration-300"
                  />
                </div>

                <div className="space-y-4">
                  <Label htmlFor="website" className="text-sm font-semibold">
                    Website
                  </Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://yourtoken.com"
                    className="bg-background/60 backdrop-blur-sm border-2 border-white/10 focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/20 h-12 rounded-xl text-base shadow-md transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            {connected && hasInsufficientBalance && (
              <div className="p-6 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-xl border-2 border-red-500/30 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-2">
                    <h4 className="font-bold text-base text-red-400">Insufficient SOL Balance</h4>
                    <p className="text-sm text-muted-foreground">
                      You need at least{" "}
                      <span className="font-semibold text-foreground">{REQUIRED_SOL.toFixed(4)} SOL</span>
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Your balance:</span>
                      <span className="font-semibold text-foreground">{solBalance?.toFixed(4)} SOL</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={isCreating || !imageFile || !connected || hasInsufficientBalance}
              className="w-full bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 hover:from-purple-500 hover:via-purple-400 hover:to-pink-500 transition-all duration-300 h-14 sm:h-16 text-base sm:text-lg font-bold shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] rounded-xl"
            >
              {isCreating ? (
                <>
                  <Rocket className="mr-2 h-5 w-5 animate-spin" />
                  Creating Token...
                </>
              ) : !connected ? (
                "Connect Wallet to Continue"
              ) : hasInsufficientBalance ? (
                <>
                  <AlertCircle className="mr-2 h-5 w-5" />
                  Insufficient SOL ({REQUIRED_SOL.toFixed(4)} SOL Required)
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-5 w-5" />
                  Launch on{" "}
                  {launcherType === "bonding" ? "Meteora" : launcherType === "pumpfun" ? "Pumpfun" : "Raydium"} (
                  {REQUIRED_SOL.toFixed(4)} SOL)
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
