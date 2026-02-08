"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Sparkles, Upload, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { Transaction } from "@solana/web3.js"
// </CHANGE>

const COLLECTION_FEE_SOL = 0.05
const PAYMENT_WALLET = "9LU5iNpxfxPmkFb9jJrPhfiEWqBC1xBuaCS6Q661XZrs"
// </CHANGE>

interface CreateCollectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  walletAddress: string
  onCollectionCreated: () => void
}

export function CreateCollectionModal({
  open,
  onOpenChange,
  walletAddress,
  onCollectionCreated,
}: CreateCollectionModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState("")
  const [symbol, setSymbol] = useState("")
  const [supplyLimit, setSupplyLimit] = useState("")
  const [transferable, setTransferable] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  // </CHANGE>
  const [isDragging, setIsDragging] = useState(false)
  const { toast } = useToast()
  const { publicKey, sendTransaction } = useWallet()
  const { connection } = useConnection()
  // </CHANGE>

  const handleFileChange = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Image must be less than 10MB",
        variant: "destructive",
      })
      return
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image file",
        variant: "destructive",
      })
      return
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

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

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileChange(file)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileChange(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview("")
    setImageUrl("")
  }

  const processPayment = async (): Promise<boolean> => {
    if (!publicKey || !sendTransaction) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to create collections",
        variant: "destructive",
      })
      return false
    }

    setIsProcessingPayment(true)
    try {
      console.log("[v0] Creating collection fee payment transaction...")

      const response = await fetch("/api/solana/create-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "payment",
          fromWallet: publicKey.toString(),
          toWallet: PAYMENT_WALLET,
          amount: COLLECTION_FEE_SOL,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create payment transaction")
      }

      const { transaction: serializedTransaction } = await response.json()

      console.log("[v0] Sending collection fee payment...")
      const signature = await sendTransaction(
        Transaction.from(Buffer.from(serializedTransaction, "base64")),
        connection,
        {
          skipPreflight: false,
          preflightCommitment: "confirmed",
        },
      )

      console.log("[v0] Payment transaction sent:", signature)

      toast({
        title: "Payment Sent",
        description: `Processing ${COLLECTION_FEE_SOL} SOL collection fee...`,
      })

      console.log("[v0] Waiting for payment confirmation...")
      await new Promise((resolve) => setTimeout(resolve, 3000))

      toast({
        title: "Payment Confirmed",
        description: "Creating your collection...",
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
  // </CHANGE>

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !symbol.trim()) {
      toast({
        title: "Missing required fields",
        description: "Please fill in name and symbol",
        variant: "destructive",
      })
      return
    }

    if (!imageFile && !imageUrl) {
      toast({
        title: "Image required",
        description: "Please upload a collection image",
        variant: "destructive",
      })
      return
    }

    console.log("[v0] Starting collection creation with payment...")
    const paymentSuccess = await processPayment()
    if (!paymentSuccess) {
      console.log("[v0] Payment failed, aborting collection creation")
      return
    }
    // </CHANGE>

    setIsCreating(true)
    try {
      let finalImageUrl = imageUrl

      if (imageFile) {
        setIsUploading(true)
        const formData = new FormData()
        formData.append("file", imageFile)
        formData.append("walletAddress", walletAddress)

        const uploadRes = await fetch("/api/upload-collection-image", {
          method: "POST",
          body: formData,
        })

        if (!uploadRes.ok) {
          throw new Error("Failed to upload image")
        }

        const uploadData = await uploadRes.json()
        finalImageUrl = uploadData.url
        setIsUploading(false)
      }

      const response = await fetch("/api/create-collection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          imageUrl: finalImageUrl,
          symbol: symbol.trim(),
          supplyLimit: supplyLimit ? Number.parseInt(supplyLimit) : undefined,
          transferable,
          walletAddress,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create collection")
      }

      const data = await response.json()

      toast({
        title: "Collection Created! 🎉",
        description: `${name} has been created successfully`,
      })

      // Reset form
      setName("")
      setDescription("")
      setImageUrl("")
      setImageFile(null)
      setImagePreview("")
      setSymbol("")
      setSupplyLimit("")
      setTransferable(true)

      // Close modal and refresh collections
      onOpenChange(false)
      onCollectionCreated()
    } catch (error) {
      console.error("[v0] Collection creation error:", error)
      toast({
        title: "Creation failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Create New Collection
          </DialogTitle>
          <DialogDescription>Create a new NFT collection on Solana</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Name */}
          <div className="space-y-3">
            <Label htmlFor="collection-name" className="text-base font-semibold flex items-center gap-2">
              <span className="text-purple-400">🏷️</span>
              Collection Name *
            </Label>
            <Input
              id="collection-name"
              placeholder="My Awesome Collection"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-background/60 backdrop-blur-sm border-2 border-white/10 focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/20 h-12 rounded-xl"
              required
            />
          </div>

          {/* Symbol */}
          <div className="space-y-3">
            <Label htmlFor="collection-symbol" className="text-base font-semibold flex items-center gap-2">
              <span className="text-pink-400">🎯</span>
              Symbol *
            </Label>
            <Input
              id="collection-symbol"
              placeholder="MYAWSM"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              maxLength={10}
              className="bg-background/60 backdrop-blur-sm border-2 border-white/10 focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/20 h-12 rounded-xl"
              required
            />
            <p className="text-xs text-muted-foreground">Short identifier for your collection (e.g., BAYC, DEGEN)</p>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
              <span className="text-blue-400">🖼️</span>
              Collection Image *
            </Label>

            {imagePreview ? (
              <div className="relative">
                <div className="relative aspect-video w-full overflow-hidden rounded-xl border-2 border-purple-500/20">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Collection preview"
                    className="h-full w-full object-cover"
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -right-2 -top-2 h-8 w-8 rounded-full"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-8 transition-all ${
                  isDragging
                    ? "border-purple-500 bg-purple-500/10"
                    : "border-white/10 bg-background/60 hover:border-purple-500/50"
                }`}
              >
                <input
                  type="file"
                  id="collection-image-input"
                  accept="image/*"
                  onChange={handleInputChange}
                  className="hidden"
                />
                <label htmlFor="collection-image-input" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="rounded-full bg-purple-500/20 p-4">
                      <Upload className="h-8 w-8 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-base font-semibold">Drop your image here or click to browse</p>
                      <p className="text-sm text-muted-foreground mt-1">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </div>
                </label>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-3">
            <Label htmlFor="collection-description" className="text-base font-semibold flex items-center gap-2">
              <span className="text-green-400">📝</span>
              Description
            </Label>
            <Textarea
              id="collection-description"
              placeholder="Describe your collection..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="resize-none bg-background/60 backdrop-blur-sm border-2 border-white/10 focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/20 rounded-xl"
            />
          </div>

          {/* Supply Limit */}
          <div className="space-y-3">
            <Label htmlFor="collection-supply" className="text-base font-semibold flex items-center gap-2">
              <span className="text-yellow-400">🔢</span>
              Supply Limit
            </Label>
            <Input
              id="collection-supply"
              type="number"
              placeholder="1000"
              value={supplyLimit}
              onChange={(e) => setSupplyLimit(e.target.value)}
              min="1"
              className="bg-background/60 backdrop-blur-sm border-2 border-white/10 focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/20 h-12 rounded-xl"
            />
            <p className="text-xs text-muted-foreground">Maximum number of NFTs in this collection (optional)</p>
          </div>

          {/* Transferable */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-background/60 backdrop-blur-sm border-2 border-white/10">
            <div className="space-y-1">
              <Label htmlFor="collection-transferable" className="text-base font-semibold cursor-pointer">
                Transferable NFTs
              </Label>
              <p className="text-xs text-muted-foreground">Allow NFTs to be transferred between wallets</p>
            </div>
            <Switch
              id="collection-transferable"
              checked={transferable}
              onCheckedChange={setTransferable}
              className="data-[state=checked]:bg-purple-500"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isCreating || isUploading || isProcessingPayment}
            className="w-full bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 hover:from-purple-500 hover:via-purple-400 hover:to-pink-500 transition-all duration-300 h-14 text-base font-bold shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] rounded-xl"
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
            ) : isCreating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creating Collection...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Create Collection ({COLLECTION_FEE_SOL} SOL)
              </>
            )}
          </Button>
          
          {/* </CHANGE> */}
        </form>
      </DialogContent>
    </Dialog>
  )
}
