"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X, Plus, ImageIcon } from "lucide-react"
import { toast } from "sonner"
import { put } from "@vercel/blob"

interface NFT {
  id: number
  name: string
  description: string
  image_url: string
  attributes: any
  crossmint_id: string
}

interface MetadataEditorFormProps {
  nft: NFT | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function MetadataEditorForm({ nft, isOpen, onClose, onSuccess }: MetadataEditorFormProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [attributes, setAttributes] = useState<Array<{ trait_type: string; value: string }>>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  useEffect(() => {
    if (nft) {
      setName(nft.name || "")
      setDescription(nft.description || "")
      setImageUrl(nft.image_url || "")
      setImagePreview(nft.image_url || null)
      setAttributes(Array.isArray(nft.attributes) ? nft.attributes : [])
      setImageFile(null)
    } else {
      setName("")
      setDescription("")
      setImageUrl("")
      setImagePreview(null)
      setAttributes([])
      setImageFile(null)
    }
  }, [nft])

  const handleAddAttribute = () => {
    setAttributes([...attributes, { trait_type: "", value: "" }])
  }

  const handleRemoveAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index))
  }

  const handleAttributeChange = (index: number, field: "trait_type" | "value", value: string) => {
    const newAttributes = [...attributes]
    newAttributes[index][field] = value
    setAttributes(newAttributes)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith("image/")) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const uploadImage = async (file: File): Promise<string> => {
    setIsUploading(true)
    try {
      const blob = await put(file.name, file, {
        access: "public",
      })
      return blob.url
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nft) {
      console.error("[v0] Cannot submit: NFT is null")
      return
    }

    setIsSubmitting(true)

    try {
      let finalImageUrl = imageUrl
      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile)
      }

      const response = await fetch("/api/nft/update-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nftId: nft.id,
          metadata: {
            name,
            description,
            image: finalImageUrl,
            attributes: attributes.filter((attr) => attr.trait_type && attr.value),
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update metadata")
      }

      toast.success("Metadata updated successfully!")
      onSuccess()
      onClose()
    } catch (error) {
      console.error("Error updating metadata:", error)
      toast.error("Failed to update metadata")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!nft) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-transparent">
            Edit NFT Metadata
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="NFT Name"
              required
              className="bg-zinc-800 border-zinc-700"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="NFT Description"
              rows={4}
              className="bg-zinc-800 border-zinc-700"
            />
          </div>

          <div className="space-y-2">
            <Label>Image</Label>
            <div className="relative border-2 border-zinc-700 rounded-lg p-4 bg-zinc-800">
              {imagePreview ? (
                <div className="space-y-2">
                  <div className="relative w-full h-48 rounded-lg overflow-hidden">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">Current NFT Image</p>
                </div>
              ) : (
                <div className="flex items-center justify-center h-48 text-muted-foreground">
                  <ImageIcon className="h-12 w-12" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Attributes</Label>
              <Button
                type="button"
                onClick={handleAddAttribute}
                size="sm"
                variant="outline"
                className="border-zinc-700 bg-transparent"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Attribute
              </Button>
            </div>

            {attributes.map((attr, index) => (
              <div key={index} className="flex gap-2 items-start">
                <div className="flex-1 space-y-2">
                  <Input
                    value={attr.trait_type}
                    onChange={(e) => handleAttributeChange(index, "trait_type", e.target.value)}
                    placeholder="Trait Type (e.g., Background)"
                    className="bg-zinc-800 border-zinc-700"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Input
                    value={attr.value}
                    onChange={(e) => handleAttributeChange(index, "value", e.target.value)}
                    placeholder="Value (e.g., Blue)"
                    className="bg-zinc-800 border-zinc-700"
                  />
                </div>
                <Button
                  type="button"
                  onClick={() => handleRemoveAttribute(index)}
                  size="icon"
                  variant="ghost"
                  className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 border-zinc-700 bg-transparent"
              disabled={isSubmitting || isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              disabled={isSubmitting || isUploading}
            >
              {isUploading ? "Uploading..." : isSubmitting ? "Updating..." : "Update Metadata"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
