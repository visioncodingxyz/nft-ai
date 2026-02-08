# NFT-AI Platform

A comprehensive AI-powered NFT and token generation, management, and marketplace platform built on the Solana blockchain. Create, mint, trade, and analyze AI-generated digital assets with integrated marketplace functionality, tokenomics support, and advanced rarity analytics.

## 🚀 Features

### NFT Creation & Generation
- **AI-Powered NFT Generation** - Generate unique NFTs using OpenAI's image generation
- **Batch NFT Creation** - Create multiple NFTs with custom metadata
- **Attribute Analysis** - AI-driven attribute extraction and analysis for NFTs
- **Image Upload Support** - Upload custom images for NFT creation
- **Metadata Management** - Full control over NFT metadata, descriptions, and properties
- **Collection Management** - Organize NFTs into custom collections

### Tokenomics & Token Generation
- **AI Token Generator** - Create custom tokens with AI-assisted metadata
- **Token Metadata** - Complete token metadata management (name, symbol, description, image)
- **Multiple Launch Platforms** - Integration with:
  - Pump.fun (Bonding Curve Model)
  - Raydium (DEX)
  - Meteora (AMM)
- **Token Pricing** - Real-time token price tracking via Raydium

### Marketplace Features
- **NFT Marketplace** - Browse, filter, and trade AI-generated NFTs
- **Marketplace Filters** - Advanced filtering by rarity, attributes, and properties
- **Price History** - Track price movements over time
- **Trending Analysis** - Discover trending NFTs based on trading volume
- **Wallet Integration** - Seamless Solana wallet connectivity

### Advanced Analytics
- **Rarity Scoring** - Sophisticated rarity calculation based on attribute frequency
- **Rarity Rankings** - NFT rarity tiers and percentile rankings
- **Price Tracking** - Historical price caching and trend analysis
- **Generation Tracking** - Monitor NFT generation metrics and statistics

### User Features
- **Wallet Connection** - Support for multiple Solana wallets:
  - Phantom
  - Backpack
  - Solflare
  - Coinbase Wallet
  - Trust Wallet
- **User Profiles** - Customizable profiles with avatar uploads
- **User Collections** - Manage personal NFT collections
- **Like System** - Favorite and track liked NFTs
- **Free Mint System** - Limited free NFT generation per user
- **Generation Credits** - Purchasable credits for NFT generation

### Transaction & Payment
- **NFT Minting** - Mint NFTs directly to Solana wallets
- **NFT Listing** - List NFTs for sale on marketplace
- **Transaction Verification** - Secure transaction confirmation on Solana
- **Cross-chain Compatibility** - Crossmint integration for broader accessibility
- **Magic Eden Integration** - Direct Magic Eden marketplace integration

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15.5.4
- **React**: 19.1.0 with React Server Components
- **UI Components**: Radix UI with custom Tailwind CSS styling
- **Form Management**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization
- **Styling**: Tailwind CSS v4 with custom animations
- **Icons**: Lucide React icons
- **Theme Management**: next-themes for dark mode

### Blockchain & Web3
- **Solana**: @solana/web3.js for blockchain interactions
- **Wallet Adapters**: Multiple Solana wallet support
- **NFT Standard**: Metaplex Foundation (MPL Token Metadata)
- **Token Management**: SPL Token support
- **RevShare SDK**: Revenue sharing functionality

### Backend & API
- **Server**: Next.js API routes
- **Database**: Neon PostgreSQL (serverless)
- **Storage**: Vercel Blob for file storage
- **AI Integration**: OpenAI API for image generation and text enhancement
- **APIs Integrated**:
  - Magic Eden (NFT marketplace)
  - Raydium (Token pricing/DEX)
  - Pump Portal (Token launch)
  - Metaplex (NFT standards)

### Development Tools
- **Language**: TypeScript
- **Linting**: ESLint
- **Build**: Vercel deployment
- **Package Manager**: pnpm
- **Analytics**: Vercel Analytics

## 📦 Installation

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm
- PostgreSQL database (Neon recommended)
- Environment variables for API keys

### Setup Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd nft-ai
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Configure environment variables**
Create a `.env.local` file:
```env
# Database
DATABASE_URL=your_neon_postgres_url

# Solana
NEXT_PUBLIC_SOLANA_RPC=https://api.mainnet-beta.solana.com
SOLANA_PRIVATE_KEY=your_solana_key

# AI Services
OPENAI_API_KEY=your_openai_key

# Storage
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token

# Marketplace APIs
MAGIC_EDEN_API_KEY=your_magic_eden_key

# Wallet Adapters (Crossmint, etc.)
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta

# Contract Address
NEXT_PUBLIC_MINT_TOKEN_ADDRESS=24UBwtKAxBg2vx4Ua3fTkR4UBZtnuvKtY5j22i1HoTAX
```

4. **Run database migrations**
```bash
# Execute SQL scripts in scripts/ folder in order
# The scripts set up tables for NFTs, tokens, users, and collections
```

5. **Start development server**
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
├── app/
│   ├── api/                    # Backend API routes
│   │   ├── generate-nft/       # AI NFT generation
│   │   ├── generate-token/     # Token creation
│   │   ├── nfts/              # NFT CRUD operations
│   │   ├── tokens/            # Token management
│   │   ├── marketplace/       # Marketplace features
│   │   ├── user/              # User profile management
│   │   ├── solana/            # Solana transactions
│   │   ├── magic-eden/        # Marketplace integration
│   │   └── cron/              # Scheduled jobs
│   ├── page.tsx               # Homepage
│   ├── create/                # NFT creation page
│   ├── new-token/             # Token creation page
│   ├── explore/               # NFT discovery
│   ├── marketplace/           # Marketplace page
│   ├── tokens/                # Token listing
│   ├── dashboard/             # User dashboard
│   ├── profile/               # User profiles
│   ├── rewards/               # Rewards page
│   └── layout.tsx             # Root layout
│
├── components/
│   ├── ai-generator-form.tsx      # NFT generation form
│   ├── ai-token-generator-form.tsx # Token generation form
│   ├── nft-card.tsx              # NFT display component
│   ├── token-card.tsx            # Token display component
│   ├── marketplace-grid.tsx       # Marketplace layout
│   ├── nft-detail.tsx            # NFT detail view
│   ├── token-detail.tsx          # Token detail view
│   ├── wallet-connect-button.tsx  # Wallet integration
│   └── ui/                       # Radix UI components
│
├── lib/
│   ├── db.ts                  # Database client
│   ├── solana.ts              # Solana utilities
│   ├── solana-utils.ts        # Additional Solana functions
│   ├── metaplex.ts            # Metaplex integration
│   ├── magic-eden.ts          # Magic Eden API
│   ├── raydium.ts             # Raydium DEX integration
│   ├── rarity.ts              # Rarity calculation
│   ├── analyze-image.ts       # Image analysis
│   └── types.ts               # TypeScript type definitions
│
├── hooks/
│   ├── use-wallet.ts          # Wallet connection hook
│   ├── use-mint-tier.ts       # User tier/credits tracking
│   └── use-toast.ts           # Toast notifications
│
├── public/                    # Static assets
├── styles/                    # Global CSS
├── scripts/                   # Database migration scripts
└── package.json              # Dependencies & scripts
```

## 🔑 Key API Endpoints

### NFT Operations
- `POST /api/generate-nft` - Generate AI NFT
- `GET /api/nfts` - List NFTs with filters
- `GET /api/nfts/[id]` - Get NFT details
- `POST /api/mint-nft` - Mint NFT to wallet
- `POST /api/nfts/[id]/like` - Like an NFT
- `GET /api/trending-nfts` - Get trending NFTs

### Token Operations
- `POST /api/generate-token` - Create token metadata
- `GET /api/tokens` - List tokens
- `GET /api/token/[address]` - Get token details
- `GET /api/token-price` - Get token price

### User Management
- `GET/POST /api/user` - User profile
- `POST /api/check-username` - Username validation
- `POST /api/upload-avatar` - Upload profile picture
- `GET /api/user-nfts` - User's NFT collection

### Collections
- `POST /api/create-collection` - Create collection
- `GET /api/get-user-collections` - List user collections
- `GET /api/collections/[id]/nfts` - Collection NFTs

### Marketplace
- `POST /api/nft/list` - List NFT for sale
- `POST /api/nft/delist` - Remove NFT listing
- `GET /api/magic-eden/[mintAddress]` - Magic Eden listing info

## 🎨 UI Components

The project includes comprehensive Radix UI components:
- Buttons, Cards, Inputs, Forms
- Dialogs, Modals, Dropdowns
- Tabs, Accordions, Carousels
- Tables, Badges, Progress indicators
- Tooltips, Popovers, Alerts
- Custom theme support with Tailwind CSS

## 🔐 Security Features

- **Wallet Verification** - Cryptographic signature verification
- **Transaction Validation** - Solana transaction verification
- **Rate Limiting** - API rate limiting protection
- **CORS Protection** - Cross-origin security
- **Environment Variables** - Sensitive data protection
- **Input Validation** - Zod schema validation

## 📊 Database Schema

The application uses PostgreSQL with tables for:
- **nfts** - NFT metadata, attributes, and rarity scores
- **tokens** - Token information and metadata
- **users** - User profiles and preferences
- **collections** - User-created NFT collections
- **user_nft_likes** - Favorite NFT tracking
- **user_credits** - Generation credits system

## 🚀 Deployment

### Vercel (Recommended)
```bash
vercel deploy
```

### Environment Setup for Production
- Set all environment variables in Vercel dashboard
- Configure PostgreSQL connection for production
- Set up webhook URLs for cron jobs
- Enable analytics and monitoring

## 📈 Performance Optimizations

- Next.js Image optimization
- Server-side rendering for SEO
- Caching strategies for API responses
- Database query optimization
- Asset compression and CDN delivery

## 🔄 Cron Jobs

Automated tasks:
- `POST /api/cron/update-nft-prices` - Update price cache hourly

## 📝 Database Migrations

Migration scripts in `scripts/` folder:
1. `001-create-tables.sql` - Initial schema
2. `002-*.sql` - Feature additions
3. And more for updates and optimizations

Run migrations in order:
```bash
psql $DATABASE_URL < scripts/001-create-tables.sql
psql $DATABASE_URL < scripts/002-*.sql
# Continue with remaining scripts
```

## 🤝 Integration with External Services

- **OpenAI** - Image generation and text enhancement
- **Magic Eden** - NFT marketplace integration
- **Raydium** - Token pricing and DEX operations
- **Pump.fun** - Token launch platform
- **Metaplex** - NFT standard and metadata
- **Vercel Blob** - Image storage
- **Crossmint** - Cross-chain compatibility

## 🐛 Troubleshooting

### Wallet Connection Issues
- Ensure correct Solana network (mainnet-beta)
- Check wallet compatibility
- Clear browser cache and try again

### NFT Generation Fails
- Verify OpenAI API key is valid
- Check database connection
- Ensure user has generation credits

### Price Updates Not Working
- Check Raydium API connectivity
- Verify token contract addresses
- Check cron job execution logs

## 📚 Additional Resources

- [Solana Documentation](https://docs.solana.com)
- [Metaplex Documentation](https://docs.metaplex.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/docs/primitives/overview/introduction)

## 📄 License

[Add your license information here]

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For issues and questions:
- Open GitHub issues
- Check existing documentation
- Review API logs for errors

## 🎉 Credits

Built with cutting-edge web3 technology on the Solana blockchain, combining AI-powered content generation with decentralized asset trading.

---

**Happy Creating! 🎨**
