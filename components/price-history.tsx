"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, ShoppingBag, Tag, Send } from "lucide-react"
import type { Transaction } from "@/lib/types"

interface PriceHistoryProps {
  nftId: number
}

export function PriceHistory({ nftId }: PriceHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHistory()
  }, [nftId])

  const fetchHistory = async () => {
    try {
      const response = await fetch(`/api/nft-history/${nftId}`)
      const data = await response.json()
      setTransactions(data.transactions || [])
    } catch (error) {
      console.error("Failed to fetch history:", error)
    } finally {
      setLoading(false)
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "sale":
        return <ShoppingBag className="h-4 w-4" />
      case "list":
        return <Tag className="h-4 w-4" />
      case "transfer":
        return <Send className="h-4 w-4" />
      default:
        return <ArrowRight className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <Card className="border-gradient glass-effect">
        <CardContent className="p-8 text-center text-muted-foreground">Loading history...</CardContent>
      </Card>
    )
  }

  if (transactions.length === 0) {
    return (
      <Card className="border-gradient glass-effect">
        <CardContent className="p-8 text-center text-muted-foreground">No transaction history available</CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-gradient glass-effect">
      <CardContent className="p-4">
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">{getTransactionIcon(tx.transaction_type)}</div>
                <div>
                  <p className="font-semibold capitalize">{tx.transaction_type}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>From {tx.from_wallet.slice(0, 6)}...</span>
                    <ArrowRight className="h-3 w-3" />
                    <span>To {tx.to_wallet.slice(0, 6)}...</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold gradient-text">{tx.price} SOL</p>
                <p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
