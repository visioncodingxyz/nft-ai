-- Create users table
CREATE TABLE IF NOT EXISTS users (
  wallet_address VARCHAR(44) PRIMARY KEY,
  username VARCHAR(50) UNIQUE,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create collections table
CREATE TABLE IF NOT EXISTS collections (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  creator_wallet VARCHAR(44) REFERENCES users(wallet_address),
  banner_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create nfts table
CREATE TABLE IF NOT EXISTS nfts (
  id SERIAL PRIMARY KEY,
  mint_address VARCHAR(44) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  price DECIMAL(20, 9),
  owner_wallet VARCHAR(44) REFERENCES users(wallet_address),
  creator_wallet VARCHAR(44) REFERENCES users(wallet_address),
  collection_id INTEGER REFERENCES collections(id),
  attributes JSONB,
  is_listed BOOLEAN DEFAULT false,
  rarity_score DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  nft_id INTEGER REFERENCES nfts(id),
  from_wallet VARCHAR(44),
  to_wallet VARCHAR(44),
  price DECIMAL(20, 9),
  transaction_hash VARCHAR(88) UNIQUE,
  transaction_type VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_nfts_owner ON nfts(owner_wallet);
CREATE INDEX IF NOT EXISTS idx_nfts_creator ON nfts(creator_wallet);
CREATE INDEX IF NOT EXISTS idx_nfts_collection ON nfts(collection_id);
CREATE INDEX IF NOT EXISTS idx_nfts_listed ON nfts(is_listed);
CREATE INDEX IF NOT EXISTS idx_transactions_nft ON transactions(nft_id);
CREATE INDEX IF NOT EXISTS idx_transactions_from ON transactions(from_wallet);
CREATE INDEX IF NOT EXISTS idx_transactions_to ON transactions(to_wallet);
