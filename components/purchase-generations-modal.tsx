"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Sparkles, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { Transaction, PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js"

const GENERATIONS_PER_SOL = 500 // 5 generations per 0.01 SOL = 500 per 1 SOL
const MIN_SOL = 0.01
const PAYMENT_WALLET = "9LU5iNpxfxPmkFb9jJrPhfiEWqBC1xBuaCS6Q661XZrs"

interface PurchaseGenerationsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPurchaseComplete: () => void
}

export function PurchaseGenerationsModal({ open, onOpenChange, onPurchaseComplete }: PurchaseGenerationsModalProps) {
  const [solAmount, setSolAmount] = useState("0.01")
  const [isPurchasing, setIsPurchasing] = useState(false)
  const { toast } = useToast()
  const { publicKey, sendTransaction } = useWallet()
  const { connection } = useConnection()

  const calculateCredits = (sol: number) => {
    return Math.floor(sol * GENERATIONS_PER_SOL)
  }

  const handlePurchase = async () => {
    if (!publicKey || !sendTransaction) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to purchase credits",
        variant: "destructive",
      })
      return
    }

    const amount = Number.parseFloat(solAmount)
    if (Number.isNaN(amount) || amount < MIN_SOL) {
      toast({
        title: "Invalid amount",
        description: `Minimum purchase is ${MIN_SOL} SOL`,
        variant: "destructive",
      })
      return
    }

    setIsPurchasing(true)
    try {
      // Create transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(PAYMENT_WALLET),
          lamports: Math.floor(amount * LAMPORTS_PER_SOL),
        }),
      )

      // Send transaction
      const signature = await sendTransaction(transaction, connection, {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      })

      toast({
        title: "Payment Sent",
        description: `Processing payment of ${amount.toFixed(4)} SOL...`,
      })

      // Wait for confirmation
      await connection.confirmTransaction(signature, "confirmed")

      // Update user's purchased credits
      const creditsPurchased = calculateCredits(amount)
      const response = await fetch("/api/purchase-generations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
          creditsPurchased,
          transactionSignature: signature,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update credits")
      }

      toast({
        title: "Purchase Successful! 🎉",
        description: `Added ${creditsPurchased} credits to your account`,
      })

      onPurchaseComplete()
      onOpenChange(false)
      setSolAmount("0.01")
    } catch (error) {
      console.error("Purchase error:", error)
      toast({
        title: "Purchase Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsPurchasing(false)
    }
  }

  const credits = calculateCredits(Number.parseFloat(solAmount) || 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-400" />
            Purchase Credits
          </DialogTitle>
          <DialogDescription>Buy additional AI credits that never expire</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm space-y-1">
                <p className="font-semibold text-purple-400">Pricing: 5 credits per 0.01 SOL</p>
                <p className="text-muted-foreground">
                  Purchased credits never expire and stack with your daily free credits
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Label htmlFor="sol-amount" className="text-base font-semibold">
              SOL Amount
            </Label>
            <Input
              id="sol-amount"
              type="number"
              min={MIN_SOL}
              step="0.01"
              value={solAmount}
              onChange={(e) => setSolAmount(e.target.value)}
              placeholder="0.01"
              className="h-12 text-base"
            />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">You will receive:</span>
              <span className="font-bold text-lg text-purple-400">{credits} credits</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPurchasing} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handlePurchase}
              disabled={isPurchasing || !publicKey}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
            >
              {isPurchasing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Purchase
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
