export interface User {
  wallet_address: string
  username?: string
  bio?: string
  avatar_url?: string
  created_at: Date
  free_mint_used?: boolean
}

export interface NFT {
  id: number
  mint_address: string
  name: string
  description: string
  image_url: string
  price?: number
  owner_wallet: string
  creator_wallet: string
  collection_id?: number
  attributes?: Record<string, any>
  is_listed: boolean
  rarity_score?: number
  likes_count?: number
  is_nsfw?: boolean
  created_at: Date
  updated_at: Date
  // Joined fields
  owner_username?: string
  owner_avatar?: string
  collection_name?: string
  collection_description?: string
  user_has_liked?: boolean
}

export interface Collection {
  id: number
  name: string
  description?: string
  creator_wallet: string
  banner_url?: string
  created_at: Date
}

export interface Transaction {
  id: number
  nft_id: number
  from_wallet: string
  to_wallet: string
  price: number
  transaction_hash: string
  transaction_type: "mint" | "sale" | "transfer" | "list" | "delist"
  created_at: Date
  // Joined fields
  nft_name?: string
  nft_image?: string
}

export interface NFTAttribute {
  trait_type: string
  value: string | number
  rarity?: number
}
