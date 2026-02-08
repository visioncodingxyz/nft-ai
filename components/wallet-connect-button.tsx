"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Wallet, LogOut, User, Settings } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { ProfileSetupModal } from "@/components/profile-setup-modal"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ExternalLink } from "lucide-react"

export function WalletConnectButton({ className }: { className?: string }) {
  const { publicKey, connected, disconnect } = useWallet()
  const { setVisible } = useWalletModal()
  const { toast } = useToast()
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [isNewUser, setIsNewUser] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const [showIosModal, setShowIosModal] = useState(false)

  const walletAddress = publicKey?.toString() || ""

  useEffect(() => {
    if (connected && walletAddress) {
      checkUserExists()
    }
  }, [connected, walletAddress])

  const checkUserExists = async () => {
    try {
      const res = await fetch(`/api/user?wallet=${walletAddress}`)
      const data = await res.json()

      if (!data.user) {
        setIsNewUser(true)
        setShowProfileModal(true)
      } else {
        setUserData(data.user)
        setIsNewUser(false)
      }
    } catch (error) {
      console.error("Failed to check user:", error)
    }
  }

  const handleConnect = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const userAgent = navigator.userAgent.toLowerCase()
    const isInWalletBrowser = userAgent.includes("phantom") || userAgent.includes("solflare")

    // If on iOS and not in wallet browser, show redirect modal
    if (isIOS && !isInWalletBrowser) {
      setShowIosModal(true)
    } else {
      // Otherwise show normal wallet modal
      setVisible(true)
    }
  }

  const handleDisconnect = async () => {
    try {
      await disconnect()
      setUserData(null)
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected",
      })
    } catch (error) {
      toast({
        title: "Disconnection Failed",
        description: "Failed to disconnect wallet",
        variant: "destructive",
      })
    }
  }

  const handleSettingsClick = async () => {
    try {
      const res = await fetch(`/api/user?wallet=${walletAddress}`)
      const data = await res.json()

      if (data.user) {
        setUserData(data.user)
      }

      setIsNewUser(false)
      setShowProfileModal(true)
    } catch (error) {
      console.error("Failed to fetch user data:", error)
      setIsNewUser(false)
      setShowProfileModal(true)
    }
  }

  const openInPhantom = () => {
    const currentUrl = window.location.href
    const phantomUrl = `https://phantom.app/ul/browse/?url=${encodeURIComponent(currentUrl)}&ref=${encodeURIComponent(currentUrl)}`
    window.location.href = phantomUrl
  }

  const openInSolflare = () => {
    const currentUrl = window.location.href
    const solflareUrl = `https://solflare.com/ul/v1/browse/?url=${encodeURIComponent(currentUrl)}&ref=${encodeURIComponent(currentUrl)}`
    window.location.href = solflareUrl
  }

  const continueInSafari = () => {
    setShowIosModal(false)
    setVisible(true)
  }

  if (!connected) {
    return (
      <>
        <Button
          onClick={handleConnect}
          className={`gradient-purple-gold hover:opacity-90 transition-opacity h-10 px-4 text-white ${className || ""}`}
        >
          <Wallet className="mr-2 h-4 w-4" />
          Connect Wallet
        </Button>

        <Dialog open={showIosModal} onOpenChange={setShowIosModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Connect on iPhone</DialogTitle>
              <DialogDescription className="text-left space-y-4 pt-4">
                <p>To connect your wallet on iPhone, please open this site in your wallet app's browser:</p>

                <div className="space-y-2">
                  <Button onClick={openInPhantom} className="w-full justify-between bg-transparent" variant="outline">
                    <span>Open in Phantom</span>
                    <ExternalLink className="h-4 w-4" />
                  </Button>

                  <Button onClick={openInSolflare} className="w-full justify-between bg-transparent" variant="outline">
                    <span>Open in Solflare</span>
                    <ExternalLink className="h-4 w-4" />
                  </Button>

                  <Button onClick={continueInSafari} className="w-full" variant="ghost" size="sm">
                    Continue in Safari (limited functionality)
                  </Button>
                </div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={`border-gradient bg-transparent h-10 px-4 text-white ${className || ""}`}
          >
            <Avatar className="h-6 w-6 mr-2">
              <AvatarImage src={userData?.avatar_url || "/placeholder.svg"} />
              <AvatarFallback>{userData?.username?.[0] || walletAddress[0]}</AvatarFallback>
            </Avatar>
            <span className="font-mono text-sm">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-card border-border">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Wallet</span>
              <span className="font-mono text-xs">{walletAddress.slice(0, 12)}...</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={`/profile/${walletAddress}`} className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              My Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSettingsClick} className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDisconnect} className="cursor-pointer text-red-500">
            <LogOut className="mr-2 h-4 w-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProfileSetupModal
        open={showProfileModal}
        onOpenChange={setShowProfileModal}
        walletAddress={walletAddress}
        isEdit={!isNewUser}
        initialData={
          userData
            ? {
                username: userData.username,
                bio: userData.bio,
                avatarUrl: userData.avatar_url,
              }
            : undefined
        }
      />
    </>
  )
}
