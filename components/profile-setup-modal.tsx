"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Upload, CheckCircle2, XCircle } from "lucide-react"

interface ProfileSetupModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  walletAddress: string
  isEdit?: boolean
  initialData?: {
    username?: string
    bio?: string
    avatarUrl?: string
  }
}

const DEFAULT_AVATAR_URL =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled%20design%20-%202025-10-05T012205.480-btjVNi7ok1WN0wKfn73CnRVaZNmBUo.png"

const generateRandomUsername = () => {
  const adjectives = [
    "Mintify",
    "Cosmic",
    "Epic",
    "Legendary",
    "Divine",
    "Mystic",
    "Stellar",
    "Ethereal",
    "Celestial",
    "Arcane",
  ]
  const nouns = ["Warrior", "Creator", "Artist", "Collector", "Mage", "Knight", "Sage", "Voyager", "Pioneer", "Legend"]
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)]
  const randomNumber = Math.floor(Math.random() * 9999)
  return `${randomAdjective}${randomNoun}${randomNumber}`.toLowerCase()
}

export function ProfileSetupModal({
  open,
  onOpenChange,
  walletAddress,
  isEdit = false,
  initialData,
}: ProfileSetupModalProps) {
  const [username, setUsername] = useState(initialData?.username || "")
  const [bio, setBio] = useState(initialData?.bio || "")
  const [avatarUrl, setAvatarUrl] = useState(initialData?.avatarUrl || DEFAULT_AVATAR_URL)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [usernameError, setUsernameError] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    if (open && !isEdit && !initialData?.username) {
      const generatedUsername = generateRandomUsername()
      setUsername(generatedUsername)
      if (!initialData?.avatarUrl) {
        setAvatarUrl(DEFAULT_AVATAR_URL)
      }
    }
  }, [open, isEdit, initialData?.username, initialData?.avatarUrl])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Avatar must be less than 5MB",
          variant: "destructive",
        })
        return
      }
      setAvatarFile(file)
      setAvatarUrl(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username) {
      toast({
        title: "Username Required",
        description: "Please enter a username",
        variant: "destructive",
      })
      return
    }

    if (!isEdit && usernameAvailable === false) {
      toast({
        title: "Username Unavailable",
        description: "Please choose a different username",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      let finalAvatarUrl = avatarUrl || DEFAULT_AVATAR_URL

      if (avatarFile) {
        const formData = new FormData()
        formData.append("file", avatarFile)
        formData.append("walletAddress", walletAddress)

        const uploadRes = await fetch("/api/upload-avatar", {
          method: "POST",
          body: formData,
        })

        if (!uploadRes.ok) {
          throw new Error("Failed to upload avatar")
        }

        const uploadData = await uploadRes.json()
        finalAvatarUrl = uploadData.url
      }

      const res = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress,
          username,
          bio,
          avatarUrl: finalAvatarUrl,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to save profile")
      }

      toast({
        title: isEdit ? "Profile Updated!" : "Profile Created!",
        description: isEdit ? "Your profile has been updated successfully" : "Welcome to Mintify!",
      })

      onOpenChange(false)

      window.location.reload()
    } catch (error) {
      console.error("Failed to save profile:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save profile",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{isEdit ? "Edit Your Profile" : "Create Your Profile"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update your profile information and avatar" : "Set up your profile to get started on Mintify"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24 border-4 border-primary/20">
              <AvatarImage src={avatarUrl || "/placeholder.svg"} />
              <AvatarFallback className="text-2xl">{username?.[0] || "?"}</AvatarFallback>
            </Avatar>
            <div>
              <Input id="avatar" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              <Label htmlFor="avatar" className="cursor-pointer">
                <Button type="button" variant="outline" size="sm" asChild>
                  <span>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Avatar
                  </span>
                </Button>
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">
              Username <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                placeholder="Enter username"
                required
                maxLength={50}
                className="pr-10"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {checkingUsername && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                {!checkingUsername && usernameAvailable === true && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                {!checkingUsername && usernameAvailable === false && <XCircle className="h-4 w-4 text-red-500" />}
              </div>
            </div>
            {usernameError && <p className="text-sm text-red-500">{usernameError}</p>}
            <p className="text-xs text-muted-foreground">Only letters, numbers, and underscores. No spaces.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">{bio.length}/500</p>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || checkingUsername || (!isEdit && usernameAvailable === false)}
              className="flex-1 gradient-purple-gold"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Create Profile"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
