-- Add crossmint_id column to nfts table
ALTER TABLE nfts ADD COLUMN IF NOT EXISTS crossmint_id VARCHAR(255);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_nfts_crossmint_id ON nfts(crossmint_id);
