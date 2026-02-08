-- Add columns to track when prices were last updated from Magic Eden
ALTER TABLE nfts 
ADD COLUMN IF NOT EXISTS price_last_updated TIMESTAMP DEFAULT NOW();

-- Create index for efficient querying of stale prices
CREATE INDEX IF NOT EXISTS idx_nfts_price_last_updated ON nfts(price_last_updated);

-- Update existing NFTs to have a timestamp
UPDATE nfts 
SET price_last_updated = updated_at 
WHERE price_last_updated IS NULL;
