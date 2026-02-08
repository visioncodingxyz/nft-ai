"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { NFTAttribute } from "@/lib/types"

interface NFTAttributesProps {
  attributes: NFTAttribute[] | Record<string, any>
}

export function NFTAttributes({ attributes }: NFTAttributesProps) {
  const [showPromptDialog, setShowPromptDialog] = useState(false)
  const [selectedPrompt, setSelectedPrompt] = useState("")

  const attributeEntries: Array<{ key: string; value: any }> = Array.isArray(attributes)
    ? attributes
        .map((attr) => ({ key: attr.trait_type, value: attr.value }))
        .filter(({ key }) => key.toLowerCase() !== "prompt" && key.toLowerCase() !== "nsfwmode")
    : Object.entries(attributes)
        .map(([key, value]) => ({ key, value }))
        .filter(({ key }) => key.toLowerCase() !== "prompt" && key.toLowerCase() !== "nsfwmode")

  const truncatePrompt = (text: string) => {
    if (!text || typeof text !== "string") return text

    if (text.length <= 100) {
      return text
    }

    return text.slice(0, 100) + "..."
  }

  const shouldTruncate = (key: string, value: any) => {
    return key.toLowerCase() === "prompt" && typeof value === "string" && value.length > 100
  }

  const handlePromptClick = (value: string) => {
    setSelectedPrompt(value)
    setShowPromptDialog(true)
  }

  if (attributeEntries.length === 0) {
    return (
      <Card className="border-gradient glass-effect">
        <CardContent className="p-8 text-center text-muted-foreground">
          No attributes available for this NFT
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {attributeEntries.map(({ key, value }, index) => {
          const displayValue = String(value)

          return (
            <Card
              key={`${key}-${index}`}
              className="border-gradient glass-effect hover:border-primary/50 transition-colors"
            >
              <CardContent className="p-4">
                <p className="text-xs text-primary font-semibold uppercase mb-1">{key}</p>
                <p className="font-bold text-lg break-words">{displayValue}</p>
                {typeof value === "number" && value > 50 && (
                  <Badge variant="secondary" className="mt-2 text-xs">
                    Rare
                  </Badge>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </>
  )
}
