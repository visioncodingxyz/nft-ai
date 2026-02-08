"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Store, Wand2, FileEdit, Plus, ArrowLeft } from "lucide-react"
import { WalletConnectButton } from "@/components/wallet-connect-button"
import { useWallet } from "@solana/wallet-adapter-react"
import { CreateCollectionModal } from "@/components/create-collection-modal"
import { MetadataEditorForm } from "@/components/metadata-editor-form"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { NFTCard } from "@/components/nft-card"
import { MarketplaceNFTCard } from "@/components/marketplace-nft-card"
import { MetadataEditorNFTCard } from "@/components/metadata-editor-nft-card"
import type { NFT } from "@/lib/types"

type TabType = "collections" | "marketplace" | "ai-creator" | "metadata-editor"

interface Collection {
  id: number
  name: string
  description: string
  symbol: string
  image_url: string
  supply_limit: number | null
  created_at: string
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>("collections")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [collections, setCollections] = useState<Collection[]>([])
  const [isLoadingCollections, setIsLoadingCollections] = useState(false)
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null)
  const [collectionNFTs, setCollectionNFTs] = useState<NFT[]>([])
  const [isLoadingNFTs, setIsLoadingNFTs] = useState(false)
  const [marketplaceNFTs, setMarketplaceNFTs] = useState<NFT[]>([])
  const [isLoadingMarketplace, setIsLoadingMarketplace] = useState(false)
  const [metadataEditorNFTs, setMetadataEditorNFTs] = useState<NFT[]>([])
  const [isLoadingMetadataEditor, setIsLoadingMetadataEditor] = useState(false)
  const [selectedNFTForEdit, setSelectedNFTForEdit] = useState<NFT | null>(null)
  const [showMetadataEditor, setShowMetadataEditor] = useState(false)
  const { connected, publicKey } = useWallet()
  const { toast } = useToast()

  const menuItems = [
    { id: "collections" as TabType, label: "Collections", icon: Sparkles },
    { id: "marketplace" as TabType, label: "Marketplace", icon: Store },
    { id: "ai-creator" as TabType, label: "AI NFT Creator", icon: Wand2 },
    { id: "metadata-editor" as TabType, label: "Metadata Editor", icon: FileEdit },
  ]

  const fetchCollections = async () => {
    if (!publicKey) return

    setIsLoadingCollections(true)
    try {
      const response = await fetch(`/api/get-user-collections?wallet=${publicKey.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setCollections(data.collections)
      }
    } catch (error) {
      console.error("[v0] Error fetching collections:", error)
    } finally {
      setIsLoadingCollections(false)
    }
  }

  const fetchCollectionNFTs = async (collectionId: number) => {
    setIsLoadingNFTs(true)
    try {
      const response = await fetch(`/api/collections/${collectionId}/nfts`)
      if (response.ok) {
        const data = await response.json()
        setCollectionNFTs(data.nfts)
      }
    } catch (error) {
      console.error("[v0] Error fetching collection NFTs:", error)
      toast({
        title: "Error",
        description: "Failed to load collection NFTs",
        variant: "destructive",
      })
    } finally {
      setIsLoadingNFTs(false)
    }
  }

  const fetchMarketplaceNFTs = async () => {
    if (!publicKey) return

    setIsLoadingMarketplace(true)
    try {
      const response = await fetch(`/api/user-nfts?wallet=${publicKey.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setMarketplaceNFTs(data.nfts)
      }
    } catch (error) {
      console.error("[v0] Error fetching marketplace NFTs:", error)
      toast({
        title: "Error",
        description: "Failed to load your NFTs",
        variant: "destructive",
      })
    } finally {
      setIsLoadingMarketplace(false)
    }
  }

  const fetchMetadataEditorNFTs = async () => {
    if (!publicKey) return

    setIsLoadingMetadataEditor(true)
    try {
      const response = await fetch(`/api/user-nfts?wallet=${publicKey.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setMetadataEditorNFTs(data.nfts)
      }
    } catch (error) {
      console.error("[v0] Error fetching metadata editor NFTs:", error)
      toast({
        title: "Error",
        description: "Failed to load your NFTs",
        variant: "destructive",
      })
    } finally {
      setIsLoadingMetadataEditor(false)
    }
  }

  const handleCollectionClick = (collection: Collection) => {
    setSelectedCollection(collection)
    fetchCollectionNFTs(collection.id)
  }

  const handleBackToCollections = () => {
    setSelectedCollection(null)
    setCollectionNFTs([])
  }

  const handleEditMetadata = (nft: NFT) => {
    setSelectedNFTForEdit(nft)
    setShowMetadataEditor(true)
  }

  const handleMetadataUpdateSuccess = () => {
    fetchMetadataEditorNFTs()
    toast({
      title: "Success",
      description: "NFT metadata updated successfully",
    })
  }

  useEffect(() => {
    if (connected && publicKey) {
      fetchCollections()
      if (activeTab === "marketplace") {
        fetchMarketplaceNFTs()
      }
      if (activeTab === "metadata-editor") {
        fetchMetadataEditorNFTs()
      }
    } else {
      setCollections([])
      setMarketplaceNFTs([])
      setMetadataEditorNFTs([])
    }
  }, [connected, publicKey])

  useEffect(() => {
    if (activeTab === "marketplace" && connected && publicKey) {
      fetchMarketplaceNFTs()
    }
    if (activeTab === "metadata-editor" && connected && publicKey) {
      fetchMetadataEditorNFTs()
    }
  }, [activeTab, connected, publicKey])

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">
            <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="text-lg text-muted-foreground">Manage your NFTs and collections</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr] lg:items-start">
          {/* Sidebar Card */}
          <Card
            className="
              border-2 border-white/10 bg-gradient-to-br from-background via-purple-500/5 to-background 
              backdrop-blur-xl overflow-hidden relative shadow-2xl
              lg:sticky lg:top-8 lg:min-h-[450px]
            "
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5" />
            <CardHeader className="relative"></CardHeader>
            <CardContent className="space-y-2 relative">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id)
                      setSelectedCollection(null)
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg
                      transition-all duration-200
                      ${
                        isActive
                          ? "bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-2 border-purple-500/40 text-foreground shadow-lg shadow-purple-500/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted border-2 border-transparent"
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                )
              })}
              {/* Wallet Connect Button */}
              <div className="pt-4 border-t-2 border-white/10 mt-4">
                <WalletConnectButton className="w-full text-white" />
              </div>
            </CardContent>
          </Card>

          {/* Main Content Card */}
          <Card className="border-2 border-white/10 bg-gradient-to-br from-background via-purple-500/5 to-background backdrop-blur-xl overflow-hidden relative shadow-2xl lg:min-h-[450px]">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5" />

            {/* Collections Tab */}
            {activeTab === "collections" && (
              <div className="relative">
                <CardHeader className="relative pb-2 space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {selectedCollection && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleBackToCollections}
                          className="shrink-0 hover:bg-purple-500/20"
                        >
                          <ArrowLeft className="h-5 w-5" />
                        </Button>
                      )}
                      <div className="p-0 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 shadow-lg overflow-hidden h-12 w-12">
                        {selectedCollection ? (
                          <div className="relative h-full w-full">
                            <Image
                              src={selectedCollection.image_url || "/placeholder.svg"}
                              alt={selectedCollection.name}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Sparkles className="h-6 w-6 text-purple-300" />
                          </div>
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                          {selectedCollection ? selectedCollection.name : "Your Collections"}
                        </CardTitle>
                        <CardDescription className="text-base mt-1">
                          {selectedCollection ? selectedCollection.description : "View and manage your NFT collections"}
                        </CardDescription>
                      </div>
                    </div>
                    {!selectedCollection && collections.length > 0 && connected && (
                      <Button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 hover:from-purple-500 hover:via-purple-400 hover:to-pink-500 transition-all duration-300 h-11 px-5 font-bold shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] rounded-xl"
                      >
                        <Plus className="mr-2 h-5 w-5" />
                        New Collection
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="relative pt-0">
                  {selectedCollection ? (
                    <div>
                      {isLoadingNFTs ? (
                        <div className="text-center py-12">
                          <div className="animate-spin h-16 w-16 mx-auto border-4 border-purple-500 border-t-transparent rounded-full mb-4" />
                          <p className="text-muted-foreground text-lg">Loading NFTs...</p>
                        </div>
                      ) : collectionNFTs.length === 0 ? (
                        <div className="text-center py-12">
                          <Sparkles className="h-16 w-16 mx-auto text-purple-400 mb-4" />
                          <p className="text-muted-foreground mb-4 text-lg">No NFTs in this collection yet</p>
                          <Button
                            onClick={() => (window.location.href = "/create")}
                            className="bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 hover:from-purple-500 hover:via-purple-400 hover:to-pink-500 transition-all duration-300 h-12 px-6 text-base font-bold shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] rounded-xl"
                          >
                            <Wand2 className="mr-2 h-5 w-5" />
                            Create NFTs
                          </Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {collectionNFTs.map((nft) => (
                            <NFTCard key={nft.id} nft={nft} variant="collection" />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      {!connected ? (
                        <div className="text-center py-12">
                          <Sparkles className="h-16 w-16 mx-auto text-purple-400 mb-4" />
                          <p className="text-muted-foreground mb-4 text-lg">Connect wallet to view your collections</p>
                        </div>
                      ) : isLoadingCollections ? (
                        <div className="text-center py-12">
                          <div className="animate-spin h-16 w-16 mx-auto border-4 border-purple-500 border-t-transparent rounded-full mb-4" />
                          <p className="text-muted-foreground text-lg">Loading collections...</p>
                        </div>
                      ) : collections.length === 0 ? (
                        <div className="text-center py-12">
                          <Sparkles className="h-16 w-16 mx-auto text-purple-400 mb-4" />
                          <p className="text-muted-foreground mb-4 text-lg">No collections found</p>
                          <Button
                            onClick={() => setShowCreateModal(true)}
                            disabled={!connected}
                            className="bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 hover:from-purple-500 hover:via-purple-400 hover:to-pink-500 transition-all duration-300 h-12 px-6 text-base font-bold shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] rounded-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                          >
                            <Wand2 className="mr-2 h-5 w-5" />
                            Create New Collection
                          </Button>
                        </div>
                      ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {collections.map((collection) => (
                            <Card
                              key={collection.id}
                              onClick={() => handleCollectionClick(collection)}
                              className="border-2 border-white/10 bg-gradient-to-br from-background via-purple-500/5 to-background backdrop-blur-xl overflow-hidden relative shadow-xl hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 hover:scale-[1.02] cursor-pointer p-0"
                            >
                              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5" />
                              <div className="relative aspect-square w-full overflow-hidden border-b-2 border-white/10">
                                <Image
                                  src={collection.image_url || "/placeholder.svg"}
                                  alt={collection.name}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              </div>
                              <div className="px-3 pb-2 -mt-4 relative flex items-center justify-between gap-2">
                                <h3 className="font-bold text-lg truncate flex-1 m-0 leading-none">
                                  {collection.name}
                                </h3>
                                <Badge
                                  variant="secondary"
                                  className="bg-purple-500/20 text-purple-300 border-purple-500/30 shrink-0"
                                >
                                  {collection.symbol}
                                </Badge>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </div>
            )}

            {/* Marketplace Tab */}
            {activeTab === "marketplace" && (
              <div className="relative">
                <CardHeader className="relative pb-8 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 shadow-lg">
                      <Store className="h-6 w-6 text-purple-300" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        My NFTs
                      </CardTitle>
                      <CardDescription className="text-base mt-1">Manage your NFT listings and sales</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  {!connected ? (
                    <div className="text-center py-12">
                      <Store className="h-16 w-16 mx-auto text-purple-400 mb-4" />
                      <p className="text-muted-foreground mb-4 text-lg">Connect wallet to view your NFTs</p>
                    </div>
                  ) : isLoadingMarketplace ? (
                    <div className="text-center py-12">
                      <div className="animate-spin h-16 w-16 mx-auto border-4 border-purple-500 border-t-transparent rounded-full mb-4" />
                      <p className="text-muted-foreground text-lg">Loading your NFTs...</p>
                    </div>
                  ) : marketplaceNFTs.length === 0 ? (
                    <div className="text-center py-12">
                      <Store className="h-16 w-16 mx-auto text-purple-400 mb-4" />
                      <p className="text-muted-foreground mb-4 text-lg">You haven't created any NFTs yet</p>
                      <Button
                        onClick={() => (window.location.href = "/create")}
                        className="bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 hover:from-purple-500 hover:via-purple-400 hover:to-pink-500 transition-all duration-300 h-12 px-6 text-base font-bold shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] rounded-xl"
                      >
                        <Wand2 className="mr-2 h-5 w-5" />
                        Create Your First NFT
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {marketplaceNFTs.map((nft) => (
                        <MarketplaceNFTCard key={nft.id} nft={nft} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </div>
            )}

            {/* AI NFT Creator Tab */}
            {activeTab === "ai-creator" && (
              <div className="relative">
                <CardHeader className="relative pb-8 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 shadow-lg">
                      <Wand2 className="h-6 w-6 text-purple-300" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Create NFTs
                      </CardTitle>
                      <CardDescription className="text-base mt-1">
                        Use DALL-E 3 to generate stunning NFT artwork and mint on-chain instantly
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-center py-12">
                    <Wand2 className="h-16 w-16 mx-auto text-purple-400 mb-4" />
                    <p className="text-muted-foreground mb-4 text-lg">Ready to create something amazing?</p>
                    <Button
                      onClick={() => (window.location.href = "/create")}
                      className="bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 hover:from-purple-500 hover:via-purple-400 hover:to-pink-500 transition-all duration-300 h-12 px-6 text-base font-bold shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] rounded-xl"
                    >
                      <Sparkles className="mr-2 h-5 w-5" />
                      Go to AI Creator
                    </Button>
                  </div>
                </CardContent>
              </div>
            )}

            {/* Metadata Editor Tab */}
            {activeTab === "metadata-editor" && (
              <div className="relative">
                <CardHeader className="relative pb-8 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 shadow-lg">
                      <FileEdit className="h-6 w-6 text-purple-300" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Edit Metadata
                      </CardTitle>
                      <CardDescription className="text-base mt-1">
                        Update attributes, descriptions, and properties
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  {!connected ? (
                    <div className="text-center py-12">
                      <FileEdit className="h-16 w-16 mx-auto text-purple-400 mb-4" />
                      <p className="text-muted-foreground mb-4 text-lg">Connect wallet to edit your NFTs</p>
                    </div>
                  ) : isLoadingMetadataEditor ? (
                    <div className="text-center py-12">
                      <div className="animate-spin h-16 w-16 mx-auto border-4 border-purple-500 border-t-transparent rounded-full mb-4" />
                      <p className="text-muted-foreground text-lg">Loading your NFTs...</p>
                    </div>
                  ) : metadataEditorNFTs.length === 0 ? (
                    <div className="text-center py-12">
                      <FileEdit className="h-16 w-16 mx-auto text-purple-400 mb-4" />
                      <p className="text-muted-foreground mb-4 text-lg">You haven't created any NFTs yet</p>
                      <Button
                        onClick={() => (window.location.href = "/create")}
                        className="bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 hover:from-purple-500 hover:via-purple-400 hover:to-pink-500 transition-all duration-300 h-12 px-6 text-base font-bold shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] rounded-xl"
                      >
                        <Wand2 className="mr-2 h-5 w-5" />
                        Create Your First NFT
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {metadataEditorNFTs.map((nft) => (
                        <MetadataEditorNFTCard key={nft.id} nft={nft} onEdit={handleEditMetadata} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </div>
            )}
          </Card>
        </div>
      </div>

      {connected && publicKey && (
        <>
          <CreateCollectionModal
            open={showCreateModal}
            onOpenChange={setShowCreateModal}
            walletAddress={publicKey.toString()}
            onCollectionCreated={fetchCollections}
          />
          {selectedNFTForEdit && (
            <MetadataEditorForm
              nft={selectedNFTForEdit}
              isOpen={showMetadataEditor}
              onClose={() => {
                setShowMetadataEditor(false)
                setSelectedNFTForEdit(null)
              }}
              onSuccess={handleMetadataUpdateSuccess}
            />
          )}
        </>
      )}
    </div>
  )
}
