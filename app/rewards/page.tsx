"use client"

import { useEffect, useState } from "react"
import { Poppins } from "next/font/google"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Gift, DollarSign, Repeat, ShieldCheck, Activity, ExternalLink } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
})

interface RevshareData {
  totalSolDistributed: number
  totalDistributions: number
  minimumRequired: number
  lastUpdated: string
  dataSource: string
}

interface Distribution {
  id: string
  dateTime: string
  amountDistributed: number
  status: string
}

export default function RewardsPage() {
  const [data, setData] = useState<RevshareData | null>(null)
  const [distributions, setDistributions] = useState<Distribution[]>([])
  const [loading, setLoading] = useState(true)
  const [distributionsLoading, setDistributionsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRewardsData() {
      try {
        setLoading(true)
        const response = await fetch("/api/revshare")
        const result = await response.json()

        if (result.success) {
          setData(result.data)
        } else {
          setError("Failed to load rewards data")
        }
      } catch (err) {
        setError("Failed to fetch rewards data")
        console.error("[v0] Error fetching rewards:", err)
      } finally {
        setLoading(false)
      }
    }

    async function fetchDistributions() {
      try {
        setDistributionsLoading(true)
        const response = await fetch("/api/distributions")
        const result = await response.json()

        if (result.success) {
          setDistributions(result.data)
        }
      } catch (err) {
        console.error("[v0] Error fetching distributions:", err)
      } finally {
        setDistributionsLoading(false)
      }
    }

    fetchRewardsData()
    fetchDistributions()

    const interval = setInterval(() => {
      console.log("[v0] Auto-refreshing distributions data...")
      fetchRewardsData()
      fetchDistributions()
    }, 60000) // 60 seconds

    return () => clearInterval(interval)
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString.replace(" ", "T") + "Z")
    date.setHours(date.getHours() + 4) // Convert from UTC-4 (EST) to UTC by adding 4 hours
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString.replace(" ", "T") + "Z")
    date.setHours(date.getHours() + 4) // Convert from UTC-4 (EST) to UTC by adding 4 hours
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black ${poppins.className}`}>
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-zinc-800/50">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-transparent to-transparent" />
        <div className="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />

        <div className="relative z-10 px-4 py-16 md:py-24 flex justify-center">
          <div className="w-full max-w-4xl">
            <div className="flex flex-col items-center text-center gap-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20">
                <Gift className="h-4 w-4 text-purple-400" />
                <span className={`text-sm font-medium text-purple-300 ${poppins.className}`}>
                  Revenue Sharing Program
                </span>
              </div>

              <h1 className={`text-4xl md:text-6xl font-bold gradient-text mythic-brand ${poppins.className}`}>
                MINT Token Rewards
              </h1>

              <p className={`text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed ${poppins.className}`}>
                Hold NFT tokens and earn passive SOL rewards from tax revenue. The more you hold, the more you earn.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-12 md:py-16 flex justify-center">
        <div className="w-full max-w-6xl">
          <div className="grid gap-6 md:grid-cols-3 mb-12">
            {loading ? (
              <>
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className={`text-sm font-medium ${poppins.className}`}>Total SOL Distributed</CardTitle>
                    <Skeleton className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-24 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </CardContent>
                </Card>
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className={`text-sm font-medium ${poppins.className}`}>Total Distributions</CardTitle>
                    <Skeleton className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-24 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </CardContent>
                </Card>
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className={`text-sm font-medium ${poppins.className}`}>Minimum Required</CardTitle>
                    <Skeleton className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-24 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </CardContent>
                </Card>
              </>
            ) : error ? (
              <Card className="md:col-span-3 bg-zinc-900/50 border-zinc-800">
                <CardContent className="pt-6">
                  <p className={`text-center text-muted-foreground ${poppins.className}`}>{error}</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card className="bg-zinc-900/50 border-zinc-800 hover:border-purple-500/50 transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className={`text-sm font-medium ${poppins.className}`}>Total SOL Distributed</CardTitle>
                    <DollarSign className="h-5 w-5 text-amber-400" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-3xl font-bold gradient-text mythic-brand ${poppins.className}`}>
                      {data?.totalSolDistributed.toFixed(4)} SOL
                    </div>
                    <p className={`text-xs text-muted-foreground mt-1 ${poppins.className}`}>
                      Lifetime rewards to holders
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-900/50 border-zinc-800 hover:border-purple-500/50 transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className={`text-sm font-medium ${poppins.className}`}>Total Distributions</CardTitle>
                    <Repeat className="h-5 w-5 text-purple-400" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-3xl font-bold gradient-text mythic-brand ${poppins.className}`}>
                      {data?.totalDistributions}
                    </div>
                    <p className={`text-xs text-muted-foreground mt-1 ${poppins.className}`}>Reward events completed</p>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-900/50 border-zinc-800 hover:border-purple-500/50 transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className={`text-sm font-medium ${poppins.className}`}>Minimum Required</CardTitle>
                    <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-3xl font-bold gradient-text mythic-brand ${poppins.className}`}>
                      {data?.minimumRequired.toLocaleString()} MINT
                    </div>
                    <p className={`text-xs text-muted-foreground mt-1 ${poppins.className}`}>To qualify for rewards</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Info Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${poppins.className}`}>
                  <Gift className="h-5 w-5 text-purple-500" />
                  How It Works
                </CardTitle>
                <CardDescription className={poppins.className}>
                  Earn passive rewards by holding NFT tokens
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className={`font-medium text-sm ${poppins.className}`}>1. Hold NFT Tokens</h4>
                  <p className={`text-sm text-muted-foreground ${poppins.className}`}>
                    Maintain at least {data?.minimumRequired.toLocaleString() || "1,000,000"} NFT tokens in your wallet
                    to qualify for rewards.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className={`font-medium text-sm ${poppins.className}`}>2. Automatic Distribution</h4>
                  <p className={`text-sm text-muted-foreground ${poppins.className}`}>
                    Revenue from the tax on $NFT is automatically distributed to eligible holders proportionally.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className={`font-medium text-sm ${poppins.className}`}>3. Receive SOL Rewards</h4>
                  <p className={`text-sm text-muted-foreground ${poppins.className}`}>
                    SOL rewards are sent directly to your wallet. The more NFT you hold, the more you earn.
                  </p>
                </div>

                <div className="pt-4">
                  <Button asChild className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                    <a
                      href="https://solscan.io/account/EZXnAriUkVUsPDTtenrBjVaSERY24Mco5hAJv4hZCGzc"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-center gap-2 ${poppins.className}`}
                    >
                      View Distribution Wallet
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${poppins.className}`}>
                  <Activity className="h-5 w-5 text-purple-500" />
                  Live Distribution Tracking
                </CardTitle>
                <CardDescription className={poppins.className}>Recent reward distributions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {distributionsLoading ? (
                    <>
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </>
                  ) : (
                    <div className="space-y-1">
                      {/* Table Header */}
                      <div className="grid grid-cols-3 gap-4 pb-2 border-b border-zinc-800">
                        <div className={`text-xs font-medium text-muted-foreground ${poppins.className}`}>
                          Date/Time
                        </div>
                        <div className={`text-xs font-medium text-muted-foreground ${poppins.className}`}>
                          Amount Distributed
                        </div>
                        <div className={`text-xs font-medium text-muted-foreground ${poppins.className}`}>Status</div>
                      </div>

                      {/* Table Rows */}
                      <div className="max-h-[300px] overflow-y-auto space-y-1">
                        {distributions.slice(0, 10).map((dist) => (
                          <div key={dist.id} className="grid grid-cols-3 gap-4 py-2 border-b border-zinc-800/50">
                            <div className="space-y-0.5">
                              <div className={`text-sm font-medium ${poppins.className}`}>
                                {formatDate(dist.dateTime)}
                              </div>
                              <div className={`text-xs text-muted-foreground ${poppins.className}`}>
                                {formatTime(dist.dateTime)}
                              </div>
                            </div>
                            <div className={`text-sm font-medium ${poppins.className}`}>
                              {dist.amountDistributed.toFixed(4)} SOL
                            </div>
                            <div>
                              <Badge
                                variant="outline"
                                className={`bg-green-500/10 text-green-300 border-green-500/20 ${poppins.className}`}
                              >
                                {dist.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
