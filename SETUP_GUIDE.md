# Unchained Tickets - Setup Guide

## 🎯 Current Status

**Phase 1 Complete:** ✅ NFT Minting & Souvenir Transformation System

### What's Working:
- ✅ Build passes successfully (all TypeScript errors fixed)
- ✅ NFT minting service integrated with webhook
- ✅ Ticket scanning and souvenir transformation
- ✅ On-chain state checking in metadata API
- ✅ Batch transformation script for post-event processing
- ✅ Contract deployed to Base Sepolia: `0xC37Ca890666a8F637484a45aA5F436ce553d49e6`

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Base wallet with testnet ETH

### 1. Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

**Critical Environment Variables:**

```env
# NFT Contract (REQUIRED for minting)
NEXT_PUBLIC_CONTRACT_ADDRESS=0xC37Ca890666a8F637484a45aA5F436ce553d49e6
MINTING_WALLET_PRIVATE_KEY=0xYourPrivateKeyHere
BASE_RPC_URL=https://sepolia.base.org

# Network Configuration
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_CHAIN_ID=84532

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/unchained?schema=public"

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your_jwt_secret_here_minimum_32_characters

# Admin Password (for seeding)
ADMIN_PASSWORD=your_secure_password_here
```

### 2. Database Setup

```bash
# Start PostgreSQL (if using Docker)
npm run start:db

# Run migrations
npx prisma migrate dev

# Seed database with test data
npm run db:seed
```

### 3. Run Development Server

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Start dev server
npm run dev
```

Access at: http://localhost:3000

---

## 🧪 Testing NFT Minting

### Test Flow:

1. **Purchase a ticket** (dev mode - no real payment required)
   - Browse events at `/events`
   - Select event and purchase ticket
   - Complete checkout with test wallet

2. **Simulate webhook** (payment confirmation)
   - The webhook at `/api/webhooks/coinbase` will:
     - Receive payment confirmation
     - Call `NFTMintingService.mintTicket()`
     - Store `transactionHash` and `mintedTokenId` in database

3. **View ticket** at `/my-tickets`
   - See QR code for venue entry
   - NFT minted to your wallet address

4. **Scan ticket** (simulate venue check-in)
   ```bash
   curl -X PATCH http://localhost:3000/api/tickets/validate \
     -H "Content-Type: application/json" \
     -d '{
       "ticketId": "YOUR_TICKET_ID",
       "walletAddress": "0xYourWalletAddress",
       "transformToSouvenir": true
     }'
   ```

5. **View souvenir metadata**
   ```bash
   curl http://localhost:3000/api/metadata/YOUR_TOKEN_ID
   ```

---

## 📦 Key Services

### NFTMintingService ([lib/services/NFTMintingService.ts](lib/services/NFTMintingService.ts))

Functions:
- `mintTicket()` - Mints NFT with transaction simulation
- `getTicketState()` - Reads on-chain ticket state (0=ACTIVE, 1=USED, 2=SOUVENIR)
- `useTicket()` - Scans ticket and transforms to souvenir
- `batchTransformToSouvenirs()` - Batch transform after event
- `ownsTicket()` - Verify ownership
- `getTokenURI()` - Get metadata URI

### TicketScanService ([lib/services/TicketScanService.ts](lib/services/TicketScanService.ts))

Functions:
- `scanTicket()` - Full scan process (validate, transform, update DB)
- `validateTicket()` - Quick validation without state changes

### API Endpoints

**Webhook (Payment → Mint):**
- `POST /api/webhooks/coinbase` - Handles payment confirmations, triggers minting

**Ticket Operations:**
- `PATCH /api/tickets/validate` - Scan ticket at venue
- `GET /api/tickets/validate?ticketId=xxx` - Quick validation
- `PUT /api/tickets/validate` - QR code validation

**Metadata:**
- `GET /api/metadata/[tokenId]` - ERC-1155 compliant metadata with on-chain state

---

## 🎨 Batch Transformation Script

Transform all used tickets to souvenirs after an event:

```bash
# Dry run (preview only)
npx tsx scripts/transform-souvenirs.ts --eventId=123 --dry-run

# Execute transformation
npx tsx scripts/transform-souvenirs.ts --eventId=123
```

---

## 🔧 Troubleshooting

### Build Errors

**"NEXT_PUBLIC_CONTRACT_ADDRESS is not set"**
- Solution: Ensure `.env` has all required variables
- The service uses lazy initialization to avoid build-time errors

**"BigInt literals not available"**
- Solution: Already fixed - `tsconfig.json` target is ES2020

### Minting Errors

**"Failed to mint NFT"**
- Check wallet has testnet ETH
- Verify contract address is correct
- Check `BASE_RPC_URL` is accessible
- Review logs in webhook handler

**"Ticket not found"**
- Ensure ticket was created in database
- Check charge record has `ticketId`
- Verify database connection

### Blockchain Errors

**"Transaction simulation failed"**
- Contract may not have event/tier set up
- Wallet may not have permission
- Check gas limits

---

## 📚 Next Steps

### For Local Testing:
1. ✅ Environment variables configured
2. ✅ Database seeded with events
3. ⏳ Test purchase → mint → wallet flow
4. ⏳ Test ticket scan → souvenir transformation
5. ⏳ Verify metadata API returns correct state

### For Production Deployment:
See [MVP_Deployment.md](MVP_Deployment.md) for:
- Phase 2: Deploy contract to Base Mainnet
- Phase 3: Production database setup
- Phase 4: Vercel deployment
- Phase 5: Testing & launch

---

## 🔐 Security Notes

**Never commit these to git:**
- `MINTING_WALLET_PRIVATE_KEY` - Store in Vercel secrets
- `JWT_SECRET` - Generate new for production
- `ADMIN_PASSWORD` - Strong password required
- Database credentials

**Best Practices:**
- Use different wallets for testnet/mainnet
- Enable 2FA on all services
- Audit smart contract before mainnet
- Monitor transaction costs
- Set up error alerts (Sentry)

---

## 📖 Documentation

- [MVP_Deployment.md](MVP_Deployment.md) - Full deployment roadmap
- [StatusCheck.md](StatusCheck.md) - Feature completeness
- [contracts/UnchainedTickets.sol](contracts/UnchainedTickets.sol) - Smart contract source

---

## 💡 Tips

**Development Mode:**
- Set `NEXT_PUBLIC_DEV_MODE=true` for mock payments
- Use `DEV_WALLET_ADDRESS` for instant access to venue dashboard
- Tickets stored in localStorage (no real blockchain txns)

**Production Mode:**
- Set `NEXT_PUBLIC_DEV_MODE=false`
- Requires real wallet connection
- Real blockchain transactions
- Coinbase Commerce for payments

---

**Questions?** Check the [MVP_Deployment.md](MVP_Deployment.md) roadmap or open an issue.
