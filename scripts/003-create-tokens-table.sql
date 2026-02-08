-- Create tokens table for AI-generated tokens
CREATE TABLE IF NOT EXISTS tokens (
  id SERIAL PRIMARY KEY,
  token_address VARCHAR(44) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  symbol VARCHAR(10) NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  creator_wallet VARCHAR(44) REFERENCES users(wallet_address),
  total_supply BIGINT DEFAULT 1000000000,
  decimals INTEGER DEFAULT 9,
  bonding_curve_address VARCHAR(44),
  bonding_curve_type INTEGER,
  initial_buy_amount DECIMAL(20, 9),
  request_id VARCHAR(100),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tokens_creator ON tokens(creator_wallet);
CREATE INDEX IF NOT EXISTS idx_tokens_address ON tokens(token_address);
CREATE INDEX IF NOT EXISTS idx_tokens_symbol ON tokens(symbol);
