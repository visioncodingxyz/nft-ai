"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

export function IosWalletRedirect() {
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    // Check if user is on iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    if (!isIOS) return

    // Check if already in a wallet's in-app browser
    const userAgent = navigator.userAgent.toLowerCase()
    const isInWalletBrowser = userAgent.includes("phantom") || userAgent.includes("solflare")
    if (isInWalletBrowser) return

    // Check if user has dismissed the redirect
    const hasSkippedRedirect = localStorage.getItem("skipWalletRedirect")
    if (hasSkippedRedirect) return

    const timer = setTimeout(() => {
      const currentUrl = window.location.href
      const phantomUrl = `https://phantom.app/ul/browse/?url=${encodeURIComponent(currentUrl)}&ref=${encodeURIComponent(currentUrl)}`
      window.location.href = phantomUrl
    }, 1500)

    // Show modal briefly before redirect
    setShowModal(true)

    return () => clearTimeout(timer)
  }, [])

  const openInSolflare = () => {
    const currentUrl = window.location.href
    const solflareUrl = `https://solflare.com/ul/v1/browse/?url=${encodeURIComponent(currentUrl)}&ref=${encodeURIComponent(currentUrl)}`
    window.location.href = solflareUrl
  }

  const skipRedirect = () => {
    localStorage.setItem("skipWalletRedirect", "true")
    setShowModal(false)
  }

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Opening in Phantom...</DialogTitle>
          <DialogDescription className="text-left space-y-4 pt-4">
            <p>To use this app on iPhone, we're redirecting you to open it in Phantom's browser.</p>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Prefer a different wallet?</p>

              <Button onClick={openInSolflare} className="w-full justify-between bg-transparent" variant="outline">
                <span>Use Solflare Instead</span>
                <ExternalLink className="h-4 w-4" />
              </Button>

              <Button onClick={skipRedirect} className="w-full" variant="ghost" size="sm">
                Stay in Safari (limited functionality)
              </Button>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
