-- Create user_free_mints table to track free mint usage
CREATE TABLE IF NOT EXISTS user_free_mints (
  wallet_address VARCHAR(44) PRIMARY KEY,
  free_mint_used BOOLEAN DEFAULT false,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_user_free_mints_wallet ON user_free_mints(wallet_address);
