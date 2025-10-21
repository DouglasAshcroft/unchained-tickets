# 🚀 Complete Production Deployment Guide

**Last Updated:** 2025-10-19
**Estimated Time:** 7-9 hours total
**Status:** Ready for deployment

This guide consolidates all the steps you need to deploy Unchained Tickets to production. Follow each phase in order.

---

## Prerequisites Checklist

Before starting, ensure you have:
- [X] GitHub repository access
- [X] Credit card for service signups (most have free tiers)
- [X] Domain name (or use Vercel's provided domain)
- [X] Base wallet with 0.1 ETH for gas fees
- [ ] 4-8 hours of uninterrupted time

---

## Phase 1: Third-Party Service Setup (2-3 hours)

### 1.1 Coinbase Developer Platform

**Get OnchainKit API Key:**
1. Go to [developer.coinbase.com](https:/developer.coinbase.com)
2. Sign in or create account
3. Navigate to OnchainKit section
4. Create new API key
5. **Save:** `NEXT_PUBLIC_ONCHAINKIT_API_KEY`

**Get Base RPC URL:**
1. In same dashboard, go to CDP Portal
2. Create new project or select existing
3. Get Base Mainnet RPC URL
4. **Save:** `NEXT_PUBLIC_BASE_RPC_URL` (format: `https://api.developer.coinbase.com/rpc/v1/base/YOUR_API_KEY`)

**Cost:** Free tier available

---

### 1.2 Coinbase Commerce (Payment Processing)

**Setup Account:**
1. Go to [commerce.coinbase.com](https://commerce.coinbase.com)
2. Sign up for business account
3. Complete KYC verification (may take 1-2 days)
4. Go to Settings → API Keys
5. Create new API key
6. **Save:** `COINBASE_COMMERCE_API_KEY`

**Setup Webhook (do after Vercel deployment):**
1. Go to Settings → Webhook subscriptions
2. Add endpoint: `https://YOUR_DOMAIN.com/api/webhooks/coinbase`
3. Copy webhook secret
4. **Save:** `COINBASE_WEBHOOK_SECRET`

**Cost:** 1% transaction fee

---

### 1.3 Basescan API (Contract Verification)

1. Go to [basescan.org](https://basescan.org)
2. Sign up for free account
3. Go to API-KEYs section
4. Create new API key
5. **Save:** `BASESCAN_API_KEY`

**Cost:** Free

---

### 1.4 Production Wallet Setup

**Generate New Wallet:**
```bash
cd /home/dougaj/Projects/unchained-tickets
node scripts/onchain/generate-wallet.cjs
```

**CRITICAL - Save These Securely:**
- Address: `MINTING_WALLET_ADDRESS`
- Private Key: `MINTING_WALLET_PRIVATE_KEY`

**⚠️ SECURITY WARNING:**
- Store private key in password manager
- Never commit to git
- Never share with anyone
- Consider using hardware wallet for maximum security

**Fund Wallet:**
1. Send **0.05-0.1 ETH** on Base mainnet to the address
2. Get ETH via:
   - Bridge from Ethereum: [bridge.base.org](https://bridge.base.org)
   - Buy on Coinbase and send to Base
   - Use Base DEX (Uniswap, etc.)

**Verify Balance:**
```bash
cast balance YOUR_WALLET_ADDRESS --rpc-url https://mainnet.base.org
```

---

### 1.5 Optional Services (Can Skip for MVP)

**Serper API (Google Events Sync):**
1. Go to [serpapi.com](https://serpapi.com)
2. Sign up for account
3. Get API key from dashboard
4. **Save:** `SERPAPI_KEY`
5. **Cost:** 100 free searches/month

**Upstash Redis (Persistent Rate Limiting):**
1. Go to [upstash.com](https://upstash.com)
2. Create Redis database
3. Copy REST URL and token
4. **Save:** `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
5. **Cost:** 10K requests/day free

**Sentry (Error Monitoring):**
1. Go to [sentry.io](https://sentry.io)
2. Create project (Next.js)
3. Copy DSN
4. **Save:** `NEXT_PUBLIC_SENTRY_DSN`
5. **Cost:** 5K errors/month free

---

## Phase 2: Database Setup (30 minutes)

### Option A: Vercel Postgres (Recommended)

**Why Vercel Postgres:**
- ✅ Integrated with Vercel deployment
- ✅ Automatic connection pooling
- ✅ Daily backups
- ✅ Easy setup
- ⚠️ Cost: ~$20/month after free tier

**Setup Steps:**
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Navigate to Storage tab
3. Click "Create Database"
4. Select "Postgres"
5. Choose region (same as your app for low latency)
6. Click "Create"

**Get Connection Strings:**
After creation, Vercel provides these automatically:
- `DATABASE_URL` - Direct connection (for migrations)
- `POSTGRES_PRISMA_URL` - Pooled connection (for app)
- `POSTGRES_URL_NON_POOLING` - Non-pooled connection

**Save all three connection strings!**

---

### Option B: Supabase (Alternative)

**Why Supabase:**
- ✅ Free tier includes 500MB database
- ✅ Built-in dashboard (like phpMyAdmin)
- ✅ Automatic backups
- ⚠️ Need to configure connection pooling manually

**Setup Steps:**
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Set database password (save securely!)
4. Wait for project initialization (2-3 minutes)
5. Go to Settings → Database
6. Copy connection string (URI format)
7. **Save:** `DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

---

### 2.1 Initialize Database Schema

**Update Local .env:**
```bash
# Add your production database URL
DATABASE_URL="postgresql://..."  # Use the connection string from above
```

**Run Migrations:**
```bash
cd /home/dougaj/Projects/unchained-tickets

# Generate Prisma client
npx prisma generate

# Apply all migrations to production database
npx prisma migrate deploy

# Verify migrations succeeded
npx prisma db pull
```

**Seed Initial Data:**
```bash
# This creates admin user and sample data
# Make sure ADMIN_PASSWORD is set in .env first!
npm run db:seed
```

**Expected Output:**
```
✅ Admin user created
✅ Sample venues created
✅ Sample events created
✅ Database seeded successfully
```

---

## Phase 3: Smart Contract Deployment (1-2 hours)

### 3.1 Prepare for Deployment

**Update .env for Mainnet:**
```bash
# Blockchain Configuration
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_NETWORK=mainnet
NEXT_PUBLIC_BASE_RPC_URL="https://api.developer.coinbase.com/rpc/v1/base/YOUR_API_KEY"

# Minting Wallet (from Phase 1.4)
MINTING_WALLET_PRIVATE_KEY="0xYOUR_PRIVATE_KEY"
MINTING_WALLET_ADDRESS="0xYOUR_ADDRESS"

# Basescan
BASESCAN_API_KEY="YOUR_BASESCAN_KEY"
```

**Verify Configuration:**
```bash
# Check wallet balance
cast balance $MINTING_WALLET_ADDRESS --rpc-url https://mainnet.base.org

# Should show at least 0.05 ETH
```

---

### 3.2 Deploy Contract to Base Mainnet

```bash
cd /home/dougaj/Projects/unchained-tickets

# Compile contracts first
npx hardhat compile

# Deploy to Base mainnet
npx hardhat run scripts/onchain/deploy.cjs --network baseMainnet
```

**Expected Output:**
```
Deploying UnchainedTickets contract with account: 0x...
Account balance: 0.05 ETH
Base URI: https://YOUR_DOMAIN.com/api/metadata/

✅ UnchainedTickets deployed to: 0xCONTRACT_ADDRESS

📝 Save this information to your .env file:
NFT_CONTRACT_ADDRESS="0xCONTRACT_ADDRESS"
```

**CRITICAL: Save the contract address immediately!**

**Update .env:**
```bash
NFT_CONTRACT_ADDRESS="0xCONTRACT_ADDRESS"  # Replace with actual address
```

---

### 3.3 Verify Contract on Basescan

```bash
# Verify contract source code (makes it publicly readable)
npx hardhat verify \
  --network baseMainnet \
  $NFT_CONTRACT_ADDRESS \
  "https://YOUR_DOMAIN.com/api/metadata/"
```

**Expected Output:**
```
Successfully verified contract UnchainedTickets on Basescan.
https://basescan.org/address/0xYOUR_CONTRACT_ADDRESS#code
```

**Verify Manually:**
1. Open the Basescan URL from output
2. Go to "Contract" tab
3. Verify green checkmark appears
4. You should see Solidity source code

---

### 3.4 Initialize Contract with Events

**Review Events in Database:**
```bash
# Check which events will be synced
npx prisma studio
# Navigate to Event table
# Note IDs of published events
```

**Initialize Contract (Dry Run First):**
```bash
# Test without making transactions
 px tsx scripts/onchain/initialize-production-contract.ts --dry-run
```

**Initialize Production:**
```bash
# This will create events on-chain (costs gas!)
npx tsx scripts/onchain/initialize-production-contract.ts
```

**Expected Output:**
```
Initializing production contract...
Contract Address: 0x...
Minting Wallet: 0x...

Creating event 1: Concert Name
✅ Event created on-chain (tx: 0x...)
✅ Tier 1 created
✅ Tier 2 created

Summary:
- 5 events created
- 15 tiers created
- Total gas used: 0.02 ETH
```

---

## Phase 4: Environment Configuration (30 minutes)

### 4.1 Generate Secure Secrets

**JWT Secret:**
```bash
openssl rand -hex 32
# Output: 64-character hex string
# Save as: JWT_SECRET
```

**Admin Password:**
```bash
# Use strong password generator or:
openssl rand -base64 32
# Save as: ADMIN_PASSWORD
```

---

### 4.2 Create Production .env File

**Copy template:**
```bash
cp .env.production.example .env.production
```

**Fill in ALL values in `.env.production`:**

```env
# ============================================
# PROJECT CONFIGURATION
# ============================================
NEXT_PUBLIC_PROJECT_NAME="Unchained Tickets"
NODE_ENV=production

# ============================================
# BLOCKCHAIN CONFIGURATION (BASE MAINNET)
# ============================================
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_NETWORK=mainnet
NEXT_PUBLIC_BASE_RPC_URL="https://api.developer.coinbase.com/rpc/v1/base/YOUR_API_KEY"

# Smart Contract (from Phase 3.2)
NFT_CONTRACT_ADDRESS="0xYOUR_DEPLOYED_CONTRACT_ADDRESS"

# Minting Wallet (from Phase 1.4)
MINTING_WALLET_PRIVATE_KEY="0xYOUR_PRIVATE_KEY"
MINTING_WALLET_ADDRESS="0xYOUR_WALLET_ADDRESS"

# Basescan (from Phase 1.3)
BASESCAN_API_KEY="YOUR_BASESCAN_API_KEY"

# ============================================
# DATABASE CONFIGURATION (from Phase 2)
# ============================================
# Vercel Postgres:
DATABASE_URL="postgresql://..."
POSTGRES_PRISMA_URL="postgresql://..."
POSTGRES_URL_NON_POOLING="postgresql://..."

# OR Supabase:
# DATABASE_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"

# ============================================
# AUTHENTICATION (from Phase 4.1)
# ============================================
JWT_SECRET="YOUR_64_CHAR_HEX_STRING"
ADMIN_PASSWORD="YOUR_SECURE_PASSWORD"

# Developer Access (optional - your personal wallet)
DEV_WALLET_ADDRESS="0xYOUR_PERSONAL_WALLET"
NEXT_PUBLIC_DEV_WALLET_ADDRESS="0xYOUR_PERSONAL_WALLET"

# ============================================
# PAYMENT PROCESSING (from Phase 1.2)
# ============================================
COINBASE_COMMERCE_API_KEY="YOUR_COMMERCE_API_KEY"
COINBASE_WEBHOOK_SECRET="YOUR_WEBHOOK_SECRET"

# ============================================
# ONCHAINKIT (from Phase 1.1)
# ============================================
NEXT_PUBLIC_ONCHAINKIT_API_KEY="YOUR_ONCHAINKIT_KEY"

# ============================================
# APPLICATION URLS
# ============================================
NEXT_PUBLIC_APP_URL="https://YOUR_DOMAIN.com"
NEXT_PUBLIC_API_BASE_URL="https://YOUR_DOMAIN.com"

# ============================================
# FEATURE FLAGS
# ============================================
NEXT_PUBLIC_DEV_MODE=false  # MUST be false for production!

# ============================================
# OPTIONAL SERVICES (from Phase 1.5)
# ============================================
SERPAPI_KEY="YOUR_SERPER_KEY"  # Optional
UPSTASH_REDIS_REST_URL="https://..."  # Optional
UPSTASH_REDIS_REST_TOKEN="..."  # Optional
NEXT_PUBLIC_SENTRY_DSN="https://..."  # Optional
```

---

### 4.3 Security Checklist

**⚠️ CRITICAL SECURITY STEPS:**

- [ ] **Never commit .env files to git**
  ```bash
  # Verify .env is in .gitignore
  git check-ignore .env.production
  # Should output: .env.production
  ```

- [ ] **Rotate secrets if .env was ever committed**
  - Generate new JWT_SECRET
  - Create new production wallet
  - Regenerate all API keys

- [ ] **Store backups securely**
  - Save .env.production in password manager (1Password, LastPass, etc.)
  - Store private key in hardware wallet (Ledger, Trezor) for maximum security

- [ ] **Enable 2FA on all accounts**
  - Vercel
  - Coinbase
  - Supabase/Database provider
  - GitHub

---

## Phase 5: Vercel Deployment (1 hour)

### 5.1 Prepare for Deployment

**Test Build Locally:**
```bash
cd /home/dougaj/Projects/unchained-tickets

# Install dependencies
npm install

# Build production bundle
npm run build

# Should complete without errors
```

**Commit Changes:**
```bash
git add -A
git commit -m "Production deployment preparation"
git push origin main
```

---

### 5.2 Deploy to Vercel

**Option A: Vercel CLI (Recommended)**
```bash
# Install Vercel CLI globally
npm install -g vercel

# Login
vercel login

# Deploy to production
vercel --prod

# Follow prompts:
# - Select scope (your account)
# - Link to existing project or create new
# - Use default settings
```

**Option B: Vercel Dashboard**
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import Git Repository
3. Select your GitHub repo
4. Configure project:
   - Framework Preset: Next.js
   - Build Command: `npx prisma generate && next build`
   - Output Directory: `.next`
5. Click "Deploy"

---

### 5.3 Configure Environment Variables in Vercel

**CRITICAL: All env vars must be added to Vercel!**

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to Settings → Environment Variables
4. Add ALL variables from `.env.production`

**Quick Add (Paste all at once):**
```
DATABASE_URL=postgresql://...
POSTGRES_PRISMA_URL=postgresql://...
JWT_SECRET=your_secret_here
ADMIN_PASSWORD=your_password_here
NFT_CONTRACT_ADDRESS=0x...
MINTING_WALLET_PRIVATE_KEY=0x...
MINTING_WALLET_ADDRESS=0x...
NEXT_PUBLIC_ONCHAINKIT_API_KEY=...
NEXT_PUBLIC_BASE_RPC_URL=https://...
COINBASE_COMMERCE_API_KEY=...
COINBASE_WEBHOOK_SECRET=...
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_DEV_MODE=false
NEXT_PUBLIC_APP_URL=https://YOUR_DOMAIN.com
NEXT_PUBLIC_API_BASE_URL=https://YOUR_DOMAIN.com
BASESCAN_API_KEY=...
NEXT_PUBLIC_PROJECT_NAME=Unchained Tickets
NODE_ENV=production
```

**Set Environment Scope:**
- Select "Production" for all variables
- Click "Save"

**Redeploy After Adding Variables:**
```bash
vercel --prod
```

---

### 5.4 Configure Custom Domain (Optional)

**Add Domain:**
1. Vercel Dashboard → Project → Settings → Domains
2. Add your domain (e.g., `tickets.unchained.xyz`)
3. Update DNS records (Vercel provides instructions)
4. Wait for SSL certificate (5-10 minutes)

**Update Environment Variables:**
```bash
# Update these in Vercel dashboard:
NEXT_PUBLIC_APP_URL=https://tickets.unchained.xyz
NEXT_PUBLIC_API_BASE_URL=https://tickets.unchained.xyz
```

---

### 5.5 Configure Coinbase Commerce Webhook

**Now that app is deployed, update webhook URL:**

1. Go to [commerce.coinbase.com](https://commerce.coinbase.com)
2. Settings → Webhook subscriptions
3. Add endpoint: `https://YOUR_DOMAIN.com/api/webhooks/coinbase`
4. Select events:
   - `charge:confirmed`
   - `charge:failed`
   - `charge:pending`
5. Save

**Test Webhook:**
```bash
# Send test webhook from Commerce dashboard
# Check Vercel logs for incoming request
```

---

## Phase 6: Testing & Validation (2-3 hours)

### 6.1 Smoke Tests

**Health Check:**
```bash
curl https://YOUR_DOMAIN.com/api/health
# Expected: {"status":"ok"}
```

**Events API:**
```bash
curl https://YOUR_DOMAIN.com/api/events
# Expected: JSON array of events
```

**Metadata API:**
```bash
# Test with a valid token ID (after first mint)
curl https://YOUR_DOMAIN.com/api/metadata/1000001
# Expected: OpenSea-compatible metadata JSON
```

---

### 6.2 Wallet Connection Testing

**Desktop Testing:**
- [ ] Open app in Chrome
- [ ] Click "Connect Wallet"
- [ ] Test Coinbase Wallet connection
- [ ] Verify address displays correctly
- [ ] Verify network shows "Base" (8453)
- [ ] Disconnect and reconnect
- [ ] Test MetaMask connection
- [ ] Verify wallet switching works

**Mobile Testing:**
- [ ] Open app in mobile browser
- [ ] Connect via Coinbase Wallet app
- [ ] Verify QR code scan works
- [ ] Test WalletConnect connection

---

### 6.3 End-to-End Purchase Flow

**Crypto Purchase Test:**
1. Browse to /events page
2. Click on an event
3. Click "Buy Tickets"
4. Select tier and quantity (start with 1 ticket)
5. Click "Purchase"
6. Coinbase Commerce modal appears
7. Complete payment with test amount ($1-5)
8. Wait for confirmation (1-2 minutes)
9. Verify NFT appears in wallet
10. Go to "My Tickets"
11. Verify ticket shows up

**Expected Results:**
- [ ] Payment completes successfully
- [ ] Webhook processes payment
- [ ] NFT mints to your wallet
- [ ] Ticket has valid QR code
- [ ] Metadata shows correct event info

**If Payment Fails:**
1. Check Vercel logs for errors
2. Verify webhook URL is correct
3. Check COINBASE_WEBHOOK_SECRET matches
4. Verify minting wallet has ETH for gas
5. Check contract is deployed correctly

---

### 6.4 Venue Dashboard Testing

**Access Control Test:**
- [ ] Log in as admin user
- [ ] Access /dashboard/venue
- [ ] Verify dashboard loads
- [ ] Check recent sales data
- [ ] Verify event stats display

**Dev Wallet Test:**
- [ ] Connect wallet with DEV_WALLET_ADDRESS
- [ ] Access /dashboard/venue
- [ ] Verify access granted
- [ ] Verify dev role badge shows

---

### 6.5 Cross-Browser Testing

**Desktop Browsers:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**Mobile Browsers:**
- [ ] Safari iOS (iPhone)
- [ ] Chrome Android
- [ ] Samsung Internet

**Test Each Browser:**
- [ ] Page loads correctly
- [ ] Wallet connects
- [ ] Images display
- [ ] Forms work
- [ ] Checkout completes

---

### 6.6 Performance Testing

**Lighthouse Audit:**
```bash
# Run on homepage and key pages
# Target scores:
# - Performance: 70+
# - Accessibility: 90+
# - Best Practices: 90+
# - SEO: 90+
```

**Page Load Testing:**
- [ ] Homepage: < 3 seconds
- [ ] Events page: < 3 seconds
- [ ] Event detail: < 2 seconds
- [ ] My Tickets: < 2 seconds

---

## Phase 7: Monitoring & Maintenance (Ongoing)

### 7.1 Set Up Error Monitoring (Optional but Recommended)

**Install Sentry:**
```bash
cd /home/dougaj/Projects/unchained-tickets
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

**Configure Sentry:**
1. Follow wizard prompts
2. Add SENTRY_DSN to Vercel env vars
3. Redeploy app

**Set Up Alerts:**
- New issue created → Slack/Email
- Error rate > 1% → Email
- Performance degradation → Slack

---

### 7.2 Daily Monitoring Checklist

**First Week After Launch:**
- [ ] Check Vercel deployment logs (daily)
- [ ] Monitor error rate in Sentry (< 1%)
- [ ] Verify webhook success rate (> 95%)
- [ ] Check minting wallet balance (> 0.01 ETH)
- [ ] Review user feedback/support tickets
- [ ] Monitor database performance
- [ ] Check API response times

**Weekly Tasks:**
- [ ] Review weekly analytics
- [ ] Check for failed transactions
- [ ] Verify all services are operational
- [ ] Update dependencies if needed

---

### 7.3 Minting Wallet Management

**Monitor Balance:**
```bash
# Check balance weekly
cast balance $MINTING_WALLET_ADDRESS --rpc-url https://mainnet.base.org
```

**Refill When Low:**
- Set alert when balance < 0.01 ETH
- Refill to 0.05-0.1 ETH
- Keep refill transactions documented

**Gas Optimization:**
- Monitor gas prices at [basescan.org](https://basescan.org/gastracker)
- Consider batching mints during low gas times
- Track average gas cost per mint

---

### 7.4 Database Maintenance

**Weekly Backups (if not automatic):**
```bash
# Export database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

**Monitor Query Performance:**
```sql
-- Check slow queries
SELECT
  query,
  mean_exec_time,
  calls
FROM pg_stat_statements
WHERE mean_exec_time > 1000
ORDER BY mean_exec_time DESC
LIMIT 10;
```

---

## Troubleshooting Guide

### Issue: Build Fails

**Error:** `Module not found` or TypeScript errors

**Solutions:**
1. Clear cache: `rm -rf .next node_modules && npm install`
2. Regenerate Prisma: `npx prisma generate`
3. Check TypeScript: `npm run lint`

---

### Issue: Webhook Not Receiving Payments

**Error:** Payments succeed but tickets don't mint

**Solutions:**
1. Verify webhook URL in Coinbase Commerce dashboard
2. Check COINBASE_WEBHOOK_SECRET matches exactly
3. Test webhook manually using Commerce dashboard
4. Check Vercel function logs for errors
5. Verify minting wallet has sufficient ETH

**Debug Webhook:**
```bash
# Check Vercel logs
vercel logs --follow

# Should see:
# POST /api/webhooks/coinbase 200
```

---

### Issue: NFT Not Minting

**Error:** Payment succeeds but NFT doesn't appear in wallet

**Solutions:**
1. Check minting wallet ETH balance
2. Verify NFT_CONTRACT_ADDRESS is correct
3. Check Vercel logs for minting errors
4. Verify MINTING_WALLET_PRIVATE_KEY has permissions
5. Check contract on Basescan for failed transactions

**Manual Retry:**
```sql
-- Find failed charges
SELECT id, status, "mintLastError"
FROM "Charge"
WHERE status = 'failed' AND "mintRetryCount" < 3;

-- Reset for retry (do in Prisma Studio or via API)
```

---

### Issue: Slow Page Load Times

**Error:** Pages take > 5 seconds to load

**Solutions:**
1. Enable Vercel Edge caching
2. Optimize images (use Next.js Image)
3. Add database connection pooling
4. Implement API caching (Redis)
5. Check database query performance

---

### Issue: Database Connection Errors

**Error:** `Too many connections` or timeout errors

**Solutions:**
1. Verify connection pooling is enabled
2. Check `POSTGRES_PRISMA_URL` is used (not `DATABASE_URL`)
3. Reduce `connection_limit` in connection string
4. Consider upgrading database plan
5. Add connection retry logic

---

## Rollback Plan

### Minor Issues (Can Fix Without Rollback)

1. Check Vercel logs for specific error
2. Fix in code
3. Commit and push
4. Vercel auto-deploys
5. Verify fix in production

---

### Critical Issues (Need Rollback)

**Rollback Deployment:**
1. Go to Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"
4. Verify rollback succeeded

**Fix Locally:**
1. Reproduce issue in development
2. Fix bug and test thoroughly
3. Create new deployment
4. Test in preview environment first
5. Promote to production when verified

---

### Nuclear Option (Database Issues)

**Restore Database Backup:**
```bash
# For Vercel Postgres
# Contact Vercel support to restore backup

# For Supabase
# Use Supabase dashboard → Database → Backups → Restore

# For self-hosted
psql $DATABASE_URL < backup_YYYYMMDD.sql
```

---

## Post-Deployment Checklist

### Immediate (Within 24 Hours)

- [ ] All smoke tests passing
- [ ] Test purchase completed successfully
- [ ] Webhook processing confirmed
- [ ] No critical errors in logs
- [ ] Performance acceptable (< 3s page loads)
- [ ] Mobile experience tested
- [ ] Error monitoring configured
- [ ] Team has access to dashboards

### Week 1

- [ ] Monitor error rates daily
- [ ] Check minting success rate (> 95%)
- [ ] Review user feedback
- [ ] Check database performance
- [ ] Verify backup strategy working
- [ ] Document any issues/resolutions

### Month 1

- [ ] Review analytics and usage
- [ ] Optimize slow queries
- [ ] Update dependencies
- [ ] Conduct security review
- [ ] Collect feature requests
- [ ] Plan next iteration

---

## Success Metrics

### Day 1 Goals
- ✅ 0 critical errors
- ✅ First successful purchase
- ✅ 100% webhook success rate
- ✅ < 3 second page loads

### Week 1 Goals
- ✅ 10+ successful purchases
- ✅ 95%+ minting success rate
- ✅ 99%+ uptime
- ✅ Positive user feedback

### Month 1 Goals
- ✅ 100+ tickets sold
- ✅ < 1% error rate
- ✅ Feature roadmap defined
- ✅ Performance optimized

---

## Support Resources

### Documentation
- [Mainnet Deployment](mainnet-deployment.md) - Detailed contract guide
- [Deployment Checklist](deployment-checklist.md) - Quick reference
- [Pre-Production Checklist Summary](../internal/risk/pre-production-checklist.md) - Code status
- [.env.production.example](.env.production.example) - Env template

### Community Support
- **Base Discord:** [discord.gg/base](https://discord.gg/base)
- **Vercel Support:** [vercel.com/help](https://vercel.com/help)
- **Coinbase Commerce:** commerce@coinbase.com

### Service Status Pages
- Vercel: [status.vercel.com](https://status.vercel.com)
- Base Network: [status.base.org](https://status.base.org)
- Coinbase: [status.coinbase.com](https://status.coinbase.com)

---

## Final Pre-Launch Checklist

**Before Going Live:**

**Security:**
- [ ] All private keys secured (not in git)
- [ ] Environment secrets rotated
- [ ] 2FA enabled on all accounts
- [ ] Rate limiting configured
- [ ] CORS properly set

**Functionality:**
- [ ] Test purchase successful
- [ ] NFT minting works
- [ ] Webhooks processing
- [ ] QR codes generate
- [ ] My Tickets page works

**Performance:**
- [ ] Lighthouse score > 70
- [ ] Page loads < 3 seconds
- [ ] Mobile experience smooth
- [ ] Images optimized

**Content:**
- [ ] Events loaded correctly
- [ ] Venue info accurate
- [ ] Pricing correct
- [ ] Images display properly

**Legal/Compliance:**
- [ ] Terms of Service available
- [ ] Privacy Policy available
- [ ] Contact information visible
- [ ] Refund policy defined

---

## 🎉 You're Ready to Launch!

Once all checklists are complete:

1. **Announce on social media**
2. **Submit to hackathon**
3. **Share with early users**
4. **Monitor closely for first 24 hours**

**Good luck with your deployment! 🚀**

---

**Questions or Issues?**
- Review troubleshooting guide above
- Check Vercel/service logs
- Reach out to community support
- Document issues for future reference
