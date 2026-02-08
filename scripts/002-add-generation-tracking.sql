-- Add generation tracking columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS generations_used_today INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_generation_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS free_mint_used BOOLEAN DEFAULT false;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_generation_reset ON users(last_generation_reset);
