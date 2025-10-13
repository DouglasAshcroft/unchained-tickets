# Production Deployment Guide - Phase 3

Complete guide for deploying Unchained Tickets to Vercel with production database.

## Overview

**Estimated Time**: 4-6 hours
**Prerequisites**:
- Phase 2 completed (contract deployed to Base mainnet)
- Vercel account
- Domain name (optional but recommended)

---

## Step 1: Database Setup (1-2 hours)

### Option A: Vercel Postgres (Recommended)

Vercel Postgres is recommended for seamless integration and automatic scaling.

#### 1.1 Create Database

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to **Storage** tab
3. Click **Create Database**
4. Select **Postgres**
5. Choose a name: `unchained-tickets-prod`
6. Select region: `US East (iad1)` (or closest to your users)
7. Click **Create**

#### 1.2 Get Connection Strings

Once created, you'll see three connection strings:

```env
POSTGRES_URL="postgres://..."
POSTGRES_PRISMA_URL="postgres://...?pgbouncer=true&connect_timeout=15"
POSTGRES_URL_NON_POOLING="postgres://..."
```

**Save these securely!** You'll need them for deployment.

#### 1.3 Run Migrations

```bash
# Set the database URL
export DATABASE_URL="your_postgres_prisma_url_here"

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Verify migrations
npx prisma migrate status
```

**Expected output:**
```
✅ All migrations have been applied
```

#### 1.4 Seed Production Data

```bash
# Seed with production events/venues/artists
npx prisma db seed
```

This will:
- Create 25+ events
- Create 10+ venues
- Create 15+ artists
- Set up ticket types and tiers

**Review seeded data:**
```bash
# Connect to database
npx prisma studio
```

---

### Option B: Supabase

Alternative database option with more free tier storage.

#### 1.1 Create Project

1. Go to [supabase.com](https://supabase.com)
2. Click **New Project**
3. Choose organization
4. Project name: `unchained-tickets`
5. Database password: Generate strong password
6. Region: Choose closest to users
7. Click **Create new project**

#### 1.2 Get Connection String

1. Go to **Settings** → **Database**
2. Find **Connection string** section
3. Select **URI** tab
4. Copy connection string:

```
postgresql://postgres:[YOUR-PASSWORD]@db.your-project.supabase.co:5432/postgres
```

#### 1.3 Run Migrations

```bash
# Set database URL
export DATABASE_URL="postgresql://postgres:..."

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed data
npx prisma db seed
```

#### 1.4 Configure Connection Pooling (Optional)

For better performance, enable Supavisor pooler:

1. Settings → Database → Connection Pooling
2. Enable pooler
3. Use pooled connection string in production

---

## Step 2: Prepare for Vercel Deployment (30 min)

### 2.1 Install Vercel CLI

```bash
npm install -g vercel

# Login to Vercel
vercel login
```

### 2.2 Link Project

```bash
# In project directory
vercel link
```

Follow prompts:
- **Set up existing project?** No
- **Link to existing project?** No
- **Project name:** unchained-tickets
- **Directory:** ./
- **Override settings?** No

### 2.3 Review Build Configuration

Verify [vercel.json](vercel.json) exists with:
- Build command with Prisma generation
- API function timeouts (30s)
- CORS headers
- Metadata caching

### 2.4 Test Build Locally

```bash
# Clean build
rm -rf .next

# Test production build
npm run build

# Check for errors
```

**Expected output:**
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
```

---

## Step 3: Configure Environment Variables (1 hour)

### 3.1 Generate Secure Values

```bash
# Generate JWT secret (64 chars)
openssl rand -hex 32

# Generate admin password
openssl rand -base64 32
```

**Save these securely!**

### 3.2 Add Variables to Vercel

Go to: **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**

**Click "Add New"** for each variable below:

#### Database Variables

```
DATABASE_URL
Value: [Your Postgres connection string]
Environment: Production
```

```
POSTGRES_PRISMA_URL
Value: [Your pooled connection string]
Environment: Production
```

#### Blockchain Variables

```
NEXT_PUBLIC_CHAIN_ID
Value: 8453
Environment: Production, Preview, Development
```

```
NEXT_PUBLIC_BASE_RPC_URL
Value: https://api.developer.coinbase.com/rpc/v1/base/YOUR_API_KEY
Environment: Production, Preview, Development
```

```
NFT_CONTRACT_ADDRESS
Value: 0xYOUR_MAINNET_CONTRACT_ADDRESS
Environment: Production
```

```
MINTING_WALLET_PRIVATE_KEY
Value: 0xYOUR_PRODUCTION_PRIVATE_KEY
Environment: Production
⚠️ Mark as "Sensitive" - this encrypts the value
```

```
MINTING_WALLET_ADDRESS
Value: 0xYOUR_PRODUCTION_WALLET_ADDRESS
Environment: Production
```

#### Authentication Variables

```
JWT_SECRET
Value: [Generated 64-char hex from step 3.1]
Environment: Production
⚠️ Mark as "Sensitive"
```

```
ADMIN_PASSWORD
Value: [Generated password from step 3.1]
Environment: Production
⚠️ Mark as "Sensitive"
```

#### Payment Variables

```
COINBASE_COMMERCE_API_KEY
Value: [Your Coinbase Commerce production API key]
Environment: Production
⚠️ Mark as "Sensitive"
```

```
COINBASE_WEBHOOK_SECRET
Value: [From Coinbase Commerce dashboard]
Environment: Production
⚠️ Mark as "Sensitive"
```

#### OnchainKit Variables

```
NEXT_PUBLIC_ONCHAINKIT_API_KEY
Value: [Your OnchainKit API key]
Environment: Production, Preview, Development
```

#### App URL Variables

```
NEXT_PUBLIC_APP_URL
Value: https://YOUR_DOMAIN.com
Environment: Production
```

```
NEXT_PUBLIC_API_BASE_URL
Value: https://YOUR_DOMAIN.com
Environment: Production
```

#### Feature Flags

```
NEXT_PUBLIC_DEV_MODE
Value: false
Environment: Production
```

#### Monitoring (Optional)

```
NEXT_PUBLIC_SENTRY_DSN
Value: [Your Sentry DSN]
Environment: Production
```

### 3.3 Verify Variables

Go to **Settings** → **Environment Variables** and verify:
- All 20+ variables added
- Sensitive variables marked as such
- Scopes set correctly (Production vs All)

---

## Step 4: Deploy to Vercel (30 min)

### 4.1 Deploy via CLI

```bash
# Deploy to production
vercel --prod
```

**Expected output:**
```
🔍 Inspect: https://vercel.com/...
✅ Production: https://YOUR_PROJECT.vercel.app
```

### 4.2 OR Deploy via Git (Recommended)

#### 4.2.1 Push to GitHub

```bash
# Add remote if needed
git remote add origin https://github.com/YOUR_USERNAME/unchained-tickets.git

# Commit all changes
git add .
git commit -m "Prepare for production deployment"

# Push to main
git push origin main
```

#### 4.2.2 Connect to Vercel

1. Vercel Dashboard → **Add New** → **Project**
2. **Import Git Repository**
3. Select your GitHub repo
4. Click **Import**
5. Framework: **Next.js** (auto-detected)
6. Build Command: `npx prisma generate && next build`
7. Click **Deploy**

### 4.3 Monitor Deployment

Watch the deployment logs:
- Build phase
- Prisma generation
- Next.js compilation
- Function deployment

**Wait for:** `✅ Deployment Ready`

---

## Step 5: Configure Custom Domain (Optional - 30 min)

### 5.1 Add Domain to Vercel

1. **Settings** → **Domains**
2. Click **Add**
3. Enter domain: `tickets.unchained.xyz`
4. Click **Add**

### 5.2 Configure DNS

Vercel will show DNS records to add:

**For root domain (tickets.unchained.xyz):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 5.3 Wait for DNS Propagation

- Usually takes 5-60 minutes
- Check status in Vercel dashboard
- SSL certificate auto-generated by Let's Encrypt

### 5.4 Update Environment Variables

Once domain is active, update:

```bash
# In Vercel dashboard, update these variables:
NEXT_PUBLIC_APP_URL=https://tickets.unchained.xyz
NEXT_PUBLIC_API_BASE_URL=https://tickets.unchained.xyz
```

**Redeploy** for changes to take effect.

---

## Step 6: Post-Deployment Configuration (1 hour)

### 6.1 Update Coinbase Commerce Webhook

1. Go to [Coinbase Commerce Dashboard](https://commerce.coinbase.com/)
2. **Settings** → **Webhook subscriptions**
3. Update webhook URL:
   ```
   https://tickets.unchained.xyz/api/webhooks/coinbase
   ```
4. Save changes

### 6.2 Test Webhook Delivery

```bash
# Test webhook endpoint
curl -X POST https://tickets.unchained.xyz/api/webhooks/coinbase \
  -H "Content-Type: application/json" \
  -H "X-CC-Webhook-Signature: test" \
  -d '{"type":"charge:created","data":{"id":"test"}}'

# Should return 401 (invalid signature) - this is expected
```

### 6.3 Configure CORS (if needed)

Verify CORS headers work:

```bash
curl -I https://tickets.unchained.xyz/api/health
```

Should include:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET,OPTIONS,PATCH,DELETE,POST,PUT
```

### 6.4 Update Contract Metadata URI (if changed)

If your domain changed from deployment, update contract:

```bash
# Check current URI
cast call $NFT_CONTRACT_ADDRESS \
  "uri(uint256)(string)" 1 \
  --rpc-url https://mainnet.base.org

# If needs update, would need contract owner to update
# (Not common - metadata API handles this dynamically)
```

---

## Step 7: Monitoring Setup (1 hour)

### 7.1 Install Sentry

```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

Follow wizard prompts:
- Create new project or use existing
- Get DSN key
- Configure source maps upload

### 7.2 Configure Sentry

Add to Vercel environment variables:

```
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=...
```

Redeploy to activate.

### 7.3 Set Up Alerts

In Sentry dashboard:
1. **Alerts** → **Create Alert**
2. Configure alert rules:
   - Error rate > 10/min
   - Failed minting transactions
   - Webhook failures
   - Database connection errors

### 7.4 Configure Vercel Monitoring

Enable in Vercel dashboard:
- **Analytics**: Track page views, Web Vitals
- **Log Drains**: Forward logs to external service (optional)
- **Speed Insights**: Monitor performance

---

## Step 8: Verification Testing (1 hour)

### 8.1 Health Checks

```bash
# API health check
curl https://tickets.unchained.xyz/api/health

# Expected: {"status":"ok","timestamp":"..."}

# Database check
curl https://tickets.unchained.xyz/api/health/ready

# Expected: {"database":"connected","status":"ready"}
```

### 8.2 API Endpoint Tests

```bash
# Events API
curl https://tickets.unchained.xyz/api/events | jq '.[:2]'

# Metadata API
curl https://tickets.unchained.xyz/api/metadata/1000001 | jq '.'

# Venues API
curl https://tickets.unchained.xyz/api/venues | jq '.[:2]'
```

### 8.3 Frontend Tests

Open browser and test:
- [ ] Homepage loads (`https://tickets.unchained.xyz`)
- [ ] Events page loads (`/events`)
- [ ] Event detail page loads (`/events/1`)
- [ ] Wallet connection works
- [ ] Network switches to Base (8453)

### 8.4 Purchase Flow Test (Small Amount)

**⚠️ Real money test - use small amount!**

1. Browse to event detail page
2. Click "Get Tickets"
3. Select quantity
4. Click "Checkout"
5. Complete payment with $1-5 test purchase
6. Check webhook logs in Vercel:
   - **Functions** → `/api/webhooks/coinbase` → View logs
7. Verify NFT mints successfully
8. Check ticket appears in My Tickets page

### 8.5 Performance Tests

Run Lighthouse audit:

```bash
npm install -g lighthouse

lighthouse https://tickets.unchained.xyz \
  --view \
  --output=html \
  --output-path=./lighthouse-report.html
```

**Target scores:**
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

---

## Troubleshooting

### Build Fails

**Error: "Cannot find module '@prisma/client'"**

Solution:
```bash
# Verify build command includes prisma generate
# In vercel.json:
"buildCommand": "npx prisma generate && next build"
```

**Error: "Database connection failed"**

Solution:
- Check DATABASE_URL in Vercel environment variables
- Verify database is accessible from Vercel's IP range
- Check database password is correct

### Runtime Errors

**Error: "NEXT_PUBLIC_CONTRACT_ADDRESS is not set"**

Solution:
- Add NFT_CONTRACT_ADDRESS to Vercel environment variables
- Redeploy

**Error: "Insufficient funds for gas"**

Solution:
```bash
# Check minting wallet balance
cast balance $MINTING_WALLET_ADDRESS --rpc-url https://mainnet.base.org

# If low, send more ETH to minting wallet
```

### Webhook Issues

**Webhooks not receiving events**

Solution:
1. Check webhook URL in Coinbase Commerce dashboard
2. Verify URL is accessible: `curl https://YOUR_DOMAIN/api/webhooks/coinbase`
3. Check Vercel function logs for errors
4. Verify COINBASE_WEBHOOK_SECRET is correct

---

## Post-Deployment Checklist

- [ ] Application deployed successfully
- [ ] Custom domain configured (if applicable)
- [ ] All environment variables set
- [ ] Database migrations run successfully
- [ ] Webhook URL updated in Coinbase Commerce
- [ ] Health checks passing
- [ ] Test purchase completed successfully
- [ ] NFT minting working
- [ ] My Tickets page displays correctly
- [ ] Sentry monitoring active
- [ ] Alert rules configured
- [ ] Performance scores acceptable
- [ ] CORS working correctly
- [ ] SSL certificate valid

---

## Maintenance

### Regular Tasks

**Daily:**
- Check Sentry for errors
- Monitor Vercel function logs
- Verify webhook success rate

**Weekly:**
- Review database performance
- Check minting wallet balance
- Update dependencies if needed

**Monthly:**
- Rotate JWT_SECRET
- Review and update dependencies
- Database performance optimization
- Check for security updates

### Backup Strategy

**Database Backups:**

Vercel Postgres:
- Automatic daily backups (retained 7 days)
- Manual backup: Export via Vercel dashboard

Supabase:
- Automatic daily backups (free tier: 7 days)
- Manual export: Settings → Database → Backups

**Environment Variables:**
- Keep copy in secure password manager
- Document all variables in team wiki

---

## Rollback Procedure

If critical issues occur:

### Quick Rollback (Vercel)

1. Vercel Dashboard → **Deployments**
2. Find last working deployment
3. Click **⋯** menu → **Promote to Production**
4. Confirm promotion

### Database Rollback

```bash
# If migrations caused issues
npx prisma migrate resolve --rolled-back <migration_name>

# Restore from backup (if needed)
# Use Vercel/Supabase dashboard to restore
```

---

## Next Steps

Once Phase 3 is complete:

✅ **Phase 4: Testing & Launch**
- End-to-end testing checklist
- Cross-browser testing
- Load testing
- Security review
- Demo video recording
- Hackathon submission

---

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Sentry Docs**: https://docs.sentry.io

---

**Deployment complete! 🎉**

Your application is now live at: `https://tickets.unchained.xyz`
