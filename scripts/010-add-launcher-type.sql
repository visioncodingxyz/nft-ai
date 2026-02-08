-- Add launcher_type column to tokens table to track which DEX the token was launched on
ALTER TABLE tokens ADD COLUMN IF NOT EXISTS launcher_type VARCHAR(20);

-- Create index for better query performance when filtering by launcher type
CREATE INDEX IF NOT EXISTS idx_tokens_launcher_type ON tokens(launcher_type);

-- Update existing tokens to have a default launcher type if needed
UPDATE tokens SET launcher_type = 'bonding' WHERE launcher_type IS NULL;
