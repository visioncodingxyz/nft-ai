-- Add purchased_generations column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS purchased_generations INTEGER DEFAULT 0;

-- Add free_mint_used column if it doesn't exist
ALTER TABLE users
ADD COLUMN IF NOT EXISTS free_mint_used BOOLEAN DEFAULT false;

-- Add generation tracking columns if they don't exist
ALTER TABLE users
ADD COLUMN IF NOT EXISTS generations_used_today INTEGER DEFAULT 0;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS last_generation_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
