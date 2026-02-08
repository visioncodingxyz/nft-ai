-- Add rarity_rank column to nfts table
ALTER TABLE nfts ADD COLUMN IF NOT EXISTS rarity_rank INTEGER;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_nfts_rarity_rank ON nfts(rarity_rank);

-- Update existing NFTs to have NULL rarity_rank (will be calculated)
UPDATE nfts SET rarity_rank = NULL WHERE rarity_rank IS NULL;
