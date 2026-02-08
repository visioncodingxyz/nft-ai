-- Create nft_likes table to track which users liked which NFTs
CREATE TABLE IF NOT EXISTS nft_likes (
  id SERIAL PRIMARY KEY,
  nft_id INTEGER NOT NULL REFERENCES nfts(id) ON DELETE CASCADE,
  wallet_address VARCHAR(44) NOT NULL REFERENCES users(wallet_address) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(nft_id, wallet_address)
);

-- Add likes_count column to nfts table for performance
ALTER TABLE nfts ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_nft_likes_nft ON nft_likes(nft_id);
CREATE INDEX IF NOT EXISTS idx_nft_likes_wallet ON nft_likes(wallet_address);

-- Update existing NFTs to have correct like counts
UPDATE nfts
SET likes_count = (
  SELECT COUNT(*) FROM nft_likes WHERE nft_likes.nft_id = nfts.id
);
