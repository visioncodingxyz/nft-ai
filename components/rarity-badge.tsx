import { Badge } from "@/components/ui/badge"
import type { RarityTier } from "@/lib/rarity"

interface RarityBadgeProps {
  tier: RarityTier | null | undefined
  rank?: number
  totalNFTs?: number
  rarityScore?: number
  showDetails?: boolean
}

export function RarityBadge({ tier, rank, totalNFTs, rarityScore, showDetails = false }: RarityBadgeProps) {
  if (!tier) {
    return null
  }

  const getBadgeClass = (tierName: string) => {
    switch (tierName) {
      case "Legendary":
        return "gradient-purple-gold border-0 text-white font-semibold"
      case "Epic":
        return "bg-gradient-to-r from-purple-500 to-blue-500 border-0 text-white font-semibold"
      case "Rare":
        return "bg-gradient-to-r from-blue-500 to-cyan-500 border-0 text-white font-semibold"
      default:
        return "bg-zinc-700 border-0 text-white"
    }
  }

  if (showDetails && rank && totalNFTs && rarityScore) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Badge className={getBadgeClass(tier.name)}>
          {tier.emoji} {tier.name}
        </Badge>
        <span className="text-muted-foreground">
          Rank: #{rank} / {totalNFTs}
        </span>
        <span className="text-muted-foreground">│</span>
        <span className="text-muted-foreground">Rarity Score: {rarityScore}</span>
      </div>
    )
  }

  return (
    <Badge className={getBadgeClass(tier.name)}>
      {tier.emoji} {tier.name}
    </Badge>
  )
}
