"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, ImageIcon, Sparkles, CheckCircle2, Loader2, Upload, Gift, Coins, Plus } from "lucide-react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { useRouter } from "next/navigation"
import { WalletConnectButton } from "@/components/wallet-connect-button"
import { useToast } from "@/hooks/use-toast"
import { Transaction } from "@solana/web3.js"
import { Badge } from "@/components/ui/badge"
import { TierBadge } from "@/components/tier-badge"
import { useMintTier } from "@/hooks/use-mint-tier"
import { CreateCollectionModal } from "@/components/create-collection-modal"

const BASE_MINT_COST_SOL = 0.02
const PAYMENT_WALLET = "BMGDFno6qX6yZ4Wbg1rWcQVxuVfTCEEe2VKsygRZfoh5"

export function ManualNFTUploadForm() {
  const { publicKey, connected, sendTransaction } = useWallet()
  const { connection } = useConnection()
  const router = useRouter()
  const { toast } = useToast()
  const { tierInfo, isLoading: isCheckingTier } = useMintTier()

  const [isUploading, setIsUploading] = useState(false)
  const [isMinting, setIsMinting] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [hasFreeMint, setHasFreeMint] = useState(false)
  const [isCheckingFreeMint, setIsCheckingFreeMint] = useState(false)
  const [mintActionId, setMintActionId] = useState<string | null>(null)
  const [mintTxId, setMintTxId] = useState<string | null>(null)
  const [mintedNftId, setMintedNftId] = useState<number | null>(null)
  const [selectedCollectionId, setSelectedCollectionId] = useState("7acf523c-ca02-46a7-803d-fe8a3204e905")
  const [userCollections, setUserCollections] = useState<
    Array<{ id: number; crossmint_id: string; name: string; symbol: string }>
  >([])
  const [showCreateCollectionModal, setShowCreateCollectionModal] = useState(false)
  const [isFetchingCollections, setIsFetchingCollections] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    description: "",
  })

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
        }
      } catch (error) {
        console.error("[v0] Error fetching collections:", error)
      } finally {
        setIsFetchingCollections(false)
      }
    }

    checkFreeMintStatus()
    fetchUserCollections()
  }, [publicKey])

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
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      })
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
    setUploadedImageUrl(null)
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

    setIsProcessingPayment(true)
    try {
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

      const signature = await sendTransaction(
        Transaction.from(Buffer.from(serializedTransaction, "base64")),
        connection,
        {
          skipPreflight: false,
          preflightCommitment: "confirmed",
        },
      )

      toast({
        title: "Payment Sent",
        description: `Processing payment of ${mintCost.toFixed(4)} SOL...`,
      })

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

  const checkMintStatusPeriodically = async (actionId: string) => {
    setIsCheckingStatus(true)
    const maxAttempts = 30
    let attempts = 0

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/check-mint-status?actionId=${actionId}`)

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Failed to check status")
        }

        const { status, txId, mintAddress } = await response.json()

        if (status === "succeeded") {
          let nftId: number | null = null

          if (mintAddress) {
            try {
              const updateResponse = await fetch("/api/update-nft-mint-address", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ actionId, mintAddress, txId }),
              })

              if (updateResponse.ok) {
                const updateData = await updateResponse.json()
                nftId = updateData.nftId
              }
            } catch (updateError) {
              console.error("[v0] Error updating NFT mint address:", updateError)
            }
          }

          setMintTxId(txId)
          setMintedNftId(nftId)
          setIsMinting(false)
          setIsCheckingStatus(false)

          toast({
            title: "NFT Minted Successfully! 🎉",
            description: txId ? `Transaction: ${txId.slice(0, 8)}...` : "Your NFT is now on the blockchain",
          })

          // Reset form
          setFormData({ name: "", symbol: "", description: "" })
          setImageFile(null)
          setImagePreview(null)
          setUploadedImageUrl(null)
          setMintActionId(null)

          if (nftId) {
            setTimeout(() => {
              router.push(`/nft/${nftId}`)
            }, 1500)
          }
          return
        } else if (status === "failed") {
          throw new Error("Minting failed on blockchain")
        }

        attempts++
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 2000)
        } else {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!publicKey) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to mint NFTs",
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

    if (!formData.name.trim()) {
      toast({
        title: "Name Required",
        description: "Please provide a name for your NFT",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    try {
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
      setUploadedImageUrl(imageUrl)

      toast({
        title: "Image Uploaded",
        description: "Proceeding with minting...",
      })

      if (!hasFreeMint) {
        const paymentSuccess = await processPayment()
        if (!paymentSuccess) {
          setIsUploading(false)
          return
        }
      } else {
        toast({
          title: "Using Free Mint! 🎉",
          description: "Your first NFT is on us!",
        })
      }

      setIsUploading(false)
      setIsMinting(true)

      const mintResponse = await fetch("/api/mint-nft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          imageUrl: imageUrl,
          attributes: {
            Symbol: formData.symbol,
            "Creation Method": "Manual Upload",
          },
          walletAddress: publicKey.toString(),
          isFreeMint: hasFreeMint,
          nsfwMode: false,
          collectionId: selectedCollectionId,
        }),
      })

      if (!mintResponse.ok) {
        const error = await mintResponse.json()
        throw new Error(error.error || "Failed to mint NFT")
      }

      const { actionId } = await mintResponse.json()
      setMintActionId(actionId)

      if (hasFreeMint) {
        setHasFreeMint(false)
      }

      toast({
        title: "NFT Minting Started!",
        description: `Minting to your wallet: ${publicKey.toString().slice(0, 8)}...`,
      })

      checkMintStatusPeriodically(actionId)
    } catch (error) {
      console.error("[v0] Error:", error)
      toast({
        title: "Minting Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      })
      setIsUploading(false)
      setIsMinting(false)
    }
  }

  const getMintPrice = () => {
    if (hasFreeMint) return "FREE"
    const discountMultiplier = (100 - tierInfo.discountPercent) / 100
    const price = BASE_MINT_COST_SOL * discountMultiplier
    return `${price.toFixed(4)} SOL`
  }

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
                  Create Your NFT
                </CardTitle>
                <CardDescription className="text-sm sm:text-base mt-1">
                  Upload your image and mint to Solana
                </CardDescription>
              </div>
            </div>
            <WalletConnectButton />
          </div>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 relative px-4 sm:px-6 pb-4 sm:pb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload Section */}
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
                    <ImageIcon className="h-12 w-12 text-purple-300" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Upload Your NFT Image
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
                    Drag and drop your image here, or click to browse
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
                      className="bg-transparent border-2 border-transparent bg-gradient-to-r from-purple-500 to-amber-500 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300"
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

            {/* Form Fields */}
            <div className="space-y-6">
              <div className="space-y-4">
                <Label htmlFor="name" className="text-base font-semibold flex items-center gap-2">
                  <span className="text-purple-400">🏷️</span>
                  NFT Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Cosmic Dragon #001"
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
                  onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                  placeholder="e.g., DRAGON"
                  required
                  maxLength={10}
                  className="bg-background/60 backdrop-blur-sm border-2 border-white/10 focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/20 h-14 rounded-xl text-base font-medium shadow-md transition-all duration-300"
                />
              </div>

              <div className="space-y-4">
                <Label htmlFor="description" className="text-base font-semibold flex items-center gap-2">
                  <span className="text-amber-400">📝</span>
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your NFT..."
                  rows={4}
                  className="resize-none bg-background/60 backdrop-blur-sm border-2 border-white/10 focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 rounded-xl text-base shadow-inner"
                />
              </div>

              <div className="space-y-4">
                <Label htmlFor="collection" className="text-base font-semibold flex items-center gap-2">
                  <span className="text-blue-400">📚</span>
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
            </div>

            <Button
              type="submit"
              disabled={
                isUploading ||
                isMinting ||
                isProcessingPayment ||
                !imageFile ||
                !formData.name.trim() ||
                !connected ||
                isCheckingFreeMint ||
                isCheckingTier
              }
              className="w-full bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 hover:from-purple-500 hover:via-purple-400 hover:to-pink-500 transition-all duration-300 h-14 sm:h-16 text-base sm:text-lg font-bold shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] rounded-xl"
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing Payment...
                </>
              ) : isUploading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Uploading Image...
                </>
              ) : isMinting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {isCheckingStatus ? "Confirming on blockchain..." : "Minting..."}
                </>
              ) : !connected ? (
                "Connect Wallet to Continue"
              ) : (
                <>
                  <Upload className="mr-2 h-5 w-5" />
                  {hasFreeMint ? (
                    <>
                      Mint NFT (FREE) <Gift className="ml-2 h-5 w-5" />
                    </>
                  ) : (
                    <>
                      Mint NFT ({getMintPrice()}){tierInfo.tier !== "none" && <Coins className="ml-2 h-5 w-5" />}
                    </>
                  )}
                </>
              )}
            </Button>

            {connected && hasFreeMint && (
              <div className="flex items-center justify-center">
                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 px-6 py-3 text-base font-bold shadow-2xl shadow-purple-500/40 rounded-xl">
                  <Gift className="mr-2 h-5 w-5" />
                  First Mint Free!
                </Badge>
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
          </form>
        </CardContent>
      </Card>

      {connected && publicKey && (
        <CreateCollectionModal
          open={showCreateCollectionModal}
          onOpenChange={setShowCreateCollectionModal}
          walletAddress={publicKey.toString()}
          onCollectionCreated={async () => {
            setIsFetchingCollections(true)
            try {
              const response = await fetch(`/api/get-user-collections?wallet=${publicKey.toString()}`)
              if (response.ok) {
                const data = await response.json()
                setUserCollections(data.collections || [])
              }
            } catch (error) {
              console.error("[v0] Error fetching collections:", error)
            } finally {
              setIsFetchingCollections(false)
            }
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
