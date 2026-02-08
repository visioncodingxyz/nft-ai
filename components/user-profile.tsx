"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { NFTCard } from "@/components/nft-card"
import { Copy, ExternalLink, Settings, Wallet, Grid3x3, Activity } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useWallet } from "@/lib/wallet-adapter"
import { ProfileSetupModal } from "@/components/profile-setup-modal"
import { TierBadge } from "@/components/tier-badge"
import { checkMintBalanceViaSolscan } from "@/lib/solana-utils"
import type { User, NFT } from "@/lib/types"
import type { MintTier } from "@/lib/solana-utils"

interface UserProfileProps {
  wallet: string
  user: User | null
}

export function UserProfile({ wallet, user }: UserProfileProps) {
  const [ownedNFTs, setOwnedNFTs] = useState<NFT[]>([])
  const [createdNFTs, setCreatedNFTs] = useState<NFT[]>([])
  const [listedNFTs, setListedNFTs] = useState<NFT[]>([])
  const [loading, setLoading] = useState(true)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [mintTier, setMintTier] = useState<MintTier>("none")
  const [isCheckingTier, setIsCheckingTier] = useState(true)
  const { toast } = useToast()
  const { publicKey } = useWallet()
  const connectedWallet = publicKey?.toBase58()
  const isOwnProfile = connectedWallet === wallet

  useEffect(() => {
    fetchUserNFTs()
    checkUserTier()
  }, [wallet])

  const checkUserTier = async () => {
    setIsCheckingTier(true)
    try {
      const tierInfo = await checkMintBalanceViaSolscan(wallet)
      setMintTier(tierInfo.tier)
    } catch (error) {
      console.error("Failed to check MINT tier:", error)
    } finally {
      setIsCheckingTier(false)
    }
  }

  const fetchUserNFTs = async () => {
    setLoading(true)
    try {
      const [ownedRes, createdRes, listedRes] = await Promise.all([
        fetch(`/api/user-nfts/${wallet}?type=owned`),
        fetch(`/api/user-nfts/${wallet}?type=created`),
        fetch(`/api/user-nfts/${wallet}?type=listed`),
      ])

      const [ownedData, createdData, listedData] = await Promise.all([
        ownedRes.json(),
        createdRes.json(),
        listedRes.json(),
      ])

      setOwnedNFTs(ownedData.nfts || [])
      setCreatedNFTs(createdData.nfts || [])
      setListedNFTs(listedData.nfts || [])
    } catch (error) {
      console.error("Failed to fetch user NFTs:", error)
    } finally {
      setLoading(false)
    }
  }

  const copyWallet = () => {
    navigator.clipboard.writeText(wallet)
    toast({
      title: "Wallet Address Copied!",
      description: "Address copied to clipboard",
    })
  }

  return (
    <>
      <div className="space-y-8">
        {/* Profile Header */}
        <Card className="border-gradient glass-effect">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              <Avatar className="h-24 w-24 border-4 border-primary/20">
                <AvatarImage src={user?.avatar_url || "/placeholder.svg"} />
                <AvatarFallback className="text-2xl">{user?.username?.[0] || wallet[0]}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{user?.username || "Unnamed User"}</h1>
                  {!isCheckingTier && <TierBadge tier={mintTier} />}
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <code className="text-sm text-muted-foreground font-mono">
                    {wallet.slice(0, 8)}...{wallet.slice(-6)}
                  </code>
                  <Button variant="ghost" size="sm" onClick={copyWallet} className="h-7 w-7 p-0">
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" asChild>
                    <a href={`https://solscan.io/account/${wallet}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>

                {user?.bio && <p className="text-muted-foreground mb-4 max-w-2xl leading-relaxed">{user.bio}</p>}

                <div className="flex flex-wrap gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Owned</p>
                    <p className="text-2xl font-bold">{ownedNFTs.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="text-2xl font-bold">{createdNFTs.length}</p>
                  </div>
                </div>
              </div>

              {isOwnProfile && (
                <Button
                  variant="outline"
                  className="border-gradient bg-transparent"
                  onClick={() => setShowProfileModal(true)}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* NFT Tabs */}
        <Tabs defaultValue="owned" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-card">
            <TabsTrigger value="owned" className="flex items-center gap-2">
              <Grid3x3 className="h-4 w-4" />
              Owned ({ownedNFTs.length})
            </TabsTrigger>
            <TabsTrigger value="created" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Created ({createdNFTs.length})
            </TabsTrigger>
            <TabsTrigger value="listed" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Listed ({listedNFTs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="owned" className="mt-6">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-square bg-muted rounded-lg mb-3" />
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : ownedNFTs.length === 0 ? (
              <Card className="border-gradient glass-effect">
                <CardContent className="p-12 text-center">
                  <Grid3x3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-semibold mb-2">No NFTs Owned</p>
                  <p className="text-muted-foreground">Start collecting NFTs from the marketplace</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {ownedNFTs.map((nft) => (
                  <NFTCard key={nft.id} nft={nft} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="created" className="mt-6">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-square bg-muted rounded-lg mb-3" />
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : createdNFTs.length === 0 ? (
              <Card className="border-gradient glass-effect">
                <CardContent className="p-12 text-center">
                  <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-semibold mb-2">No NFTs Created</p>
                  <p className="text-muted-foreground">Use the AI generator to create your first NFT</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {createdNFTs.map((nft) => (
                  <NFTCard key={nft.id} nft={nft} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="listed" className="mt-6">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-square bg-muted rounded-lg mb-3" />
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : listedNFTs.length === 0 ? (
              <Card className="border-gradient glass-effect">
                <CardContent className="p-12 text-center">
                  <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-semibold mb-2">No NFTs Listed</p>
                  <p className="text-muted-foreground">List your NFTs for sale on the marketplace</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {listedNFTs.map((nft) => (
                  <NFTCard key={nft.id} nft={nft} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <ProfileSetupModal
        open={showProfileModal}
        onOpenChange={setShowProfileModal}
        walletAddress={wallet}
        isEdit={true}
        initialData={
          user
            ? {
                username: user.username,
                bio: user.bio,
                avatarUrl: user.avatar_url,
              }
            : undefined
        }
      />
    </>
  )
}
