# 🚀 Production Deployment Checklist

Quick reference guide for deploying Unchained Tickets to Base Mainnet.

## Pre-Deployment Checklist

### Environment Setup
- [ ] Production wallet created/selected
- [ ] Production wallet funded (minimum 0.05 ETH on Base mainnet)
- [ ] `.env` updated with production values
- [ ] `NEXT_PUBLIC_APP_URL` set to production domain
- [ ] `BASESCAN_API_KEY` obtained and configured
- [ ] Backup of all private keys stored securely

### Code Preparation
- [ ] All code committed to git
- [ ] Build passes: `npm run build`
- [ ] Tests passing: `npm test`
- [ ] No console.log statements in production code
- [ ] Environment variables reviewed

---

## Phase 1: Contract Deployment (30-60 min)

### 1. Deploy Contract
```bash
# Verify balance first
cast balance $MINTING_WALLET_ADDRESS --rpc-url https://mainnet.base.org

# Deploy
npx hardhat run scripts/deploy.cjs --network baseMainnet
```

**Save output:**
- Contract Address: `0x...`
- Deployer Address: `0x...`

### 2. Update Environment
```bash
# Add to .env
NFT_CONTRACT_ADDRESS="0xYOUR_CONTRACT_ADDRESS"
```

### 3. Verify Contract
```bash
npx hardhat verify \
  --network baseMainnet \
  0xYOUR_CONTRACT_ADDRESS \
  "https://tickets.unchained.xyz/api/metadata/"
```

**Verify at:** `https://basescan.org/address/0xYOUR_CONTRACT_ADDRESS#code`

- [ ] Contract deployed successfully
- [ ] Contract address saved
- [ ] Contract verified on Basescan
- [ ] Environment variables updated

---

## Phase 2: Contract Initialization (1-2 hours)

### 1. Test Initialization (Dry Run)
```bash
npx tsx scripts/initialize-production-contract.ts --dry-run
```

### 2. Initialize Contract
```bash
# Initialize all events
npx tsx scripts/initialize-production-contract.ts

# Or initialize specific event
npx tsx scripts/initialize-production-contract.ts --eventId=5
```

### 3. Verify Initialization
```bash
# Check event exists on-chain
cast call 0xYOUR_CONTRACT "events(uint256)" 1 --rpc-url https://mainnet.base.org
```

- [ ] Events created on-chain
- [ ] Tiers created for each event
- [ ] Royalty recipients configured
- [ ] Metadata URIs set correctly

---

## Phase 3: Database Setup (2-4 hours)

### Option A: Vercel Postgres

1. Create database in Vercel dashboard
2. Copy `POSTGRES_PRISMA_URL`
3. Run migrations:
```bash
npx prisma migrate deploy
npx prisma db seed
```

### Option B: Supabase

1. Create project at supabase.com
2. Copy connection string
3. Run migrations:
```bash
DATABASE_URL="postgresql://..." npx prisma migrate deploy
DATABASE_URL="postgresql://..." npx prisma db seed
```

- [ ] Production database created
- [ ] Migrations run successfully
- [ ] Database seeded (if needed)
- [ ] Connection string saved securely

---

## Phase 4: Vercel Deployment (1-2 hours)

### 1. Configure Environment Variables

In Vercel dashboard → Project → Settings → Environment Variables:

```env
# Database
DATABASE_URL=postgresql://...

# Authentication
JWT_SECRET=<64-char hex string>
ADMIN_PASSWORD=<secure password>

# Blockchain
NEXT_PUBLIC_BASE_RPC_URL=https://api.developer.coinbase.com/rpc/v1/base/YOUR_KEY
NFT_CONTRACT_ADDRESS=0xYOUR_MAINNET_ADDRESS
MINTING_WALLET_PRIVATE_KEY=0xYOUR_PRODUCTION_KEY
MINTING_WALLET_ADDRESS=0xYOUR_ADDRESS

# Payments
COINBASE_COMMERCE_API_KEY=<production key>
COINBASE_WEBHOOK_SECRET=<from dashboard>

# OnchainKit
NEXT_PUBLIC_ONCHAINKIT_API_KEY=<your key>
NEXT_PUBLIC_CHAIN_ID=8453

# App URLs
NEXT_PUBLIC_APP_URL=https://tickets.unchained.xyz
NEXT_PUBLIC_API_BASE_URL=https://tickets.unchained.xyz

# Basescan
BASESCAN_API_KEY=<your key>

# Development Mode
NEXT_PUBLIC_DEV_MODE=false
```

### 2. Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

**OR** push to main branch for auto-deploy

- [ ] All environment variables configured
- [ ] Deployment successful
- [ ] App accessible at production URL
- [ ] Health check passes: `/api/health`

---

## Phase 5: Testing (2-3 hours)

### 1. Smoke Tests

```bash
# Health check
curl https://tickets.unchained.xyz/api/health

# Events API
curl https://tickets.unchained.xyz/api/events

# Metadata API (use real tokenId after first mint)
curl https://tickets.unchained.xyz/api/metadata/1000001
```

### 2. Wallet Connection Test
- [ ] Connect wallet (Coinbase Wallet)
- [ ] Connect wallet (MetaMask)
- [ ] Network switches to Base (8453)
- [ ] Wallet address displays correctly

### 3. Purchase Flow Test
- [ ] Browse events page loads
- [ ] Event detail page loads
- [ ] Checkout modal opens
- [ ] Payment completes (small amount)
- [ ] Webhook processes payment
- [ ] NFT mints to wallet
- [ ] Ticket appears in My Tickets

### 4. Souvenir Flow Test
- [ ] Ticket shows QR code
- [ ] QR code scans successfully
- [ ] Ticket transforms to souvenir
- [ ] Poster image displays
- [ ] Metadata updates correctly

### 5. Cross-Browser Testing
- [ ] Chrome (desktop)
- [ ] Safari (desktop)
- [ ] Chrome (mobile)
- [ ] Safari (iOS)

---

## Phase 6: Monitoring Setup (1 hour)

### 1. Sentry Setup

```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

Configure:
```env
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=<token>
```

### 2. Set Up Alerts

Configure alerts for:
- Failed minting transactions
- Webhook failures
- Database connection errors
- High error rates

- [ ] Sentry installed and configured
- [ ] Error tracking working
- [ ] Alerts configured
- [ ] Team notifications set up

---

## Phase 7: Go Live (Final Checks)

### Pre-Launch Checklist

**Security:**
- [ ] Private keys not committed to git
- [ ] Environment secrets secured
- [ ] 2FA enabled on all accounts
- [ ] Rate limiting enabled
- [ ] CORS configured correctly

**Performance:**
- [ ] Lighthouse score > 90
- [ ] Page load times < 3s
- [ ] API response times < 500ms
- [ ] Images optimized

**Content:**
- [ ] Event listings accurate
- [ ] Poster images loading
- [ ] Venue information correct
- [ ] Pricing correct

**Legal/Compliance:**
- [ ] Terms of Service linked
- [ ] Privacy Policy linked
- [ ] Contact information visible
- [ ] GDPR compliance (if applicable)

### Launch Day

1. **Monitor Logs:**
   - Watch Vercel deployment logs
   - Monitor Sentry for errors
   - Check database queries

2. **Test First Purchase:**
   - Make a small test purchase
   - Verify webhook processes correctly
   - Check NFT mints successfully

3. **Announce:**
   - Share on social media
   - Submit to hackathon
   - Notify early users

---

## Rollback Plan

If issues occur:

### Minor Issues
1. Fix in code
2. Deploy fix: `vercel --prod`
3. Verify fix deployed

### Critical Issues
1. Roll back Vercel deployment
2. Investigate issue
3. Fix locally
4. Test thoroughly
5. Re-deploy

### Contract Issues
- Contract is immutable (can't be upgraded)
- Can deploy new contract if needed
- No data loss (all data in database)

---

## Post-Launch Monitoring

### First 24 Hours
- [ ] Check every 2 hours for errors
- [ ] Monitor minting success rate
- [ ] Respond to user issues
- [ ] Watch for performance problems

### First Week
- [ ] Daily error rate review
- [ ] Weekly usage statistics
- [ ] User feedback collection
- [ ] Performance optimization

### Ongoing
- [ ] Weekly health checks
- [ ] Monthly security reviews
- [ ] Quarterly dependency updates
- [ ] Regular backups

---

## Emergency Contacts

**Services:**
- Vercel Support: https://vercel.com/help
- Base Discord: https://discord.gg/base
- Coinbase Commerce: commerce@coinbase.com

**Documentation:**
- MAINNET_DEPLOYMENT.md - Detailed deployment guide
- TESTING_MINTING_FLOW.md - Testing instructions
- MVP_Deployment.md - Complete roadmap

---

## Success Metrics

**Day 1:**
- [ ] 0 critical errors
- [ ] 100% minting success rate
- [ ] < 5 second page load times

**Week 1:**
- [ ] 10+ successful ticket purchases
- [ ] 95%+ uptime
- [ ] 0 security incidents

**Month 1:**
- [ ] 100+ tickets sold
- [ ] Positive user feedback
- [ ] Feature requests collected

---

Ready to deploy? Let's go! 🚀
