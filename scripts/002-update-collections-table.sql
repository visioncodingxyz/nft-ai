-- Update collections table to include all Crossmint response fields
ALTER TABLE collections 
ADD COLUMN IF NOT EXISTS crossmint_id VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS symbol VARCHAR(10),
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS supply_limit INTEGER,
ADD COLUMN IF NOT EXISTS transferable BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS action_id VARCHAR(255),
-- Added fields to store all Crossmint response data
ADD COLUMN IF NOT EXISTS fungibility VARCHAR(50),
ADD COLUMN IF NOT EXISTS on_chain_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS on_chain_chain VARCHAR(50),
ADD COLUMN IF NOT EXISTS subscription_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Update existing columns to allow null for creator_wallet (in case we need it)
ALTER TABLE collections 
ALTER COLUMN creator_wallet DROP NOT NULL;

-- Create index on crossmint_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_collections_crossmint_id ON collections(crossmint_id);
CREATE INDEX IF NOT EXISTS idx_collections_creator ON collections(creator_wallet);
-- Added index on chain for filtering by blockchain
CREATE INDEX IF NOT EXISTS idx_collections_chain ON collections(on_chain_chain);
