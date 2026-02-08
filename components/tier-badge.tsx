import { Badge } from "@/components/ui/badge"
import type { MintTier } from "@/lib/solana-utils"

interface TierBadgeProps {
  tier: MintTier
  className?: string
}

export function TierBadge({ tier, className }: TierBadgeProps) {
  if (tier === "none") return null

  const tierConfig = {
    creator: {
      label: "Creator",
      gradient: "from-orange-500 via-pink-500 to-purple-500",
      textColor: "text-orange-300",
    },
    professional: {
      label: "Professional",
      gradient: "from-purple-500 via-pink-500 to-blue-500",
      textColor: "text-purple-300",
    },
    ultimate: {
      label: "Ultimate",
      gradient: "from-orange-500 via-purple-500 to-blue-500",
      textColor: "text-pink-300",
    },
  }

  const config = tierConfig[tier]

  return (
    <div className={`relative inline-flex ${className}`}>
      <Badge
        className={`relative bg-transparent ${config.textColor} font-bold border-0`}
        style={{
          background: "transparent",
        }}
      >
        <span className="relative z-10">{config.label}</span>
      </Badge>
    </div>
  )
}
