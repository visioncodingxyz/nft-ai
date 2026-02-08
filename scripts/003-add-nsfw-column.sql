-- Add is_nsfw column to nfts table
ALTER TABLE nfts ADD COLUMN IF NOT EXISTS is_nsfw BOOLEAN DEFAULT false;

-- Create index for better query performance when filtering by NSFW status
CREATE INDEX IF NOT EXISTS idx_nfts_nsfw ON nfts(is_nsfw);
