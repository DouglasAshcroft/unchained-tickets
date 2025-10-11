# Unchained Tickets - Deployment Plan

**Last Updated:** 2025-10-15
**Status:** In Progress
**Estimated Total Time:** 13-18 hours

---

## Executive Summary

This document tracks the comprehensive code review findings and deployment roadmap for Unchained Tickets. The codebase has partial implementations across RBAC, payment integrations, and performance optimizations that need completion before production deployment. Recent work focused on venue onboarding: seat-map uploads now live in the dashboard, the onboarding checklist persists completion state, and the event wizard handles ticket tiers without requiring per-event seat-map setup.

### Critical Issues Identified
1. ❌ Build failing due to missing `ethers` dependency and viem version conflicts
2. ⚠️ RBAC partially implemented - `dev` role in code but not in database schema
3. ⚠️ Performance issues - 3.5MB bundle size, 37/100 Lighthouse score on events page
4. ⚠️ Payment integrations stubbed - returning mock data instead of real transactions
5. ⚠️ Environment variables exposed in committed .env file

---

## Phase 1: Fix Build & Core Functionality ✅
**Priority:** CRITICAL
**Estimated Time:** 2-3 hours
**Status:** COMPLETED 2025-10-10

### 1.1 Fix Dependency Issues ✅
- [x] **Decision:** Temporarily disabled NFTMintingService (renamed to .disabled)
  - Reasoning: ethers not compatible with viem stack, will rewrite in Phase 3.1
  - NFT minting commented out in checkout flows with TODO markers
- [x] Updated viem to latest version (resolves wagmi compatibility)
  - Updated from 2.37.11 to latest
  - Fixed `sendCallsSync` and `sendTransactionSync` import errors
- [x] Fixed all TypeScript type errors
  - Next.js 15 dynamic params (now Promise-based)
  - Artist/Venue/Event type nullability
  - OnchainKit address types (hex string format)
  - zustand circular reference in useAuth
- [x] Excluded `scripts/` folder from TypeScript compilation
- [x] Build succeeds: `npm run build` ✅

**Files Modified:**
- `app/api/checkout/create-charge/route.ts` - Commented out NFT minting
- `app/api/webhooks/coinbase/route.ts` - Commented out NFT minting
- `lib/services/NFTMintingService.ts` → `.disabled` - Renamed to disable
- `package.json` - Updated viem
- `app/api/metadata/[tokenId]/route.ts` - Fixed params Promise type
- `components/ArtistCard.tsx` - Fixed genre nullability
- `components/VenueCard.tsx` - Fixed field nullability
- `components/EventCard.tsx` - Fixed startsAt Date|string type
- `components/CardCheckoutForm.tsx` - Fixed address hex type
- `lib/hooks/useAuth.ts` - Fixed circular reference with get()
- `lib/hooks/useIdleTimer.ts` - Fixed useRef default value
- `tsconfig.json` - Excluded scripts folder

**Completion Criteria:** ✅ `npm run build` completes without errors

---

### 1.2 Complete RBAC Implementation ✅
- [x] Add `dev` to Prisma UserRole enum
  - Edit: `prisma/schema.prisma` line 14-19
  - Add: `dev` to enum values
- [ ] Create and run Prisma migration
  - Run: `npx prisma migrate dev --name add-dev-role`
- [ ] Implement wallet-based dev role provisioning
  - Create: `lib/services/DevRoleService.ts`
  - On wallet connect, check if address matches `DEV_WALLET_ADDRESS`
  - Auto-upgrade user role to `dev` in database
- [ ] Test dev role access to venue dashboard
- [ ] **Decision:** Keep RBAC tables (Role, Permission, etc.) for future OR remove unused tables
  - Current state: Tables exist but completely unused
  - Recommendation: Keep for Phase 3 expansion, document as "future use"

**Files to Modify:**
- `prisma/schema.prisma` (add `dev` enum value)
- `lib/services/AuthService.ts` (add dev role check)
- NEW: `lib/services/DevRoleService.ts` (wallet-based provisioning)
- `lib/constants/roles.ts` (already has DEV role defined ✅)

**Completion Criteria:**
✅ Dev role exists in database
✅ User with DEV_WALLET_ADDRESS gets `dev` role automatically
✅ Dev role can access venue dashboard

---

### 1.3 Fix Venue Dashboard
- [x] Remove hardcoded venue selection (now loads first available venue and logs fallback)
- [ ] Implement authenticated venue context
  - Add server-side auth check to get current user
  - Query user's associated venue from database
  - Handle case: user has no venue (show onboarding message)
- [ ] Add proper error states
  - No venue assigned → "Complete venue profile" CTA
  - API error → Retry button with error message
  - No events → "Create your first event" empty state
- [ ] Remove fallback to mock data (line 19)
- [x] Add venue onboarding panel grouping seat-map uploads and checklist with collapse-on-completion behaviour
- [x] Persist checklist updates via dedicated API (manual tasks toggle, seat map auto-completes)
- [x] Surface seat-map preview within dashboard and streamline event wizard to focus on ticket tiers

**Files to Modify:**
- `app/dashboard/venue/page.tsx`
- `lib/services/VenueDashboardService.ts` (add getUserVenue method)
- `components/dashboard/venue/VenueDashboardGate.tsx` (enhance error messaging)

**Completion Criteria:**
✅ Dashboard loads real data for authenticated venue owner *(pending auth integration; currently selects first venue or falls back to mock)*
✅ Proper error handling for all failure cases
✅ No mock data fallbacks in code
✅ Onboarding panel collapses automatically at 100% and can be reopened to view seat maps

---

## Phase 2: Optimize Performance 🎯
**Priority:** HIGH
**Estimated Time:** 3-4 hours
**Status:** Not Started

### 2.1 Bundle Size Optimization
**Current Issues:**
- `WalletControls_tsx.js`: 3.5MB (!!!)
- Events page: 11MB total payload
- 1MB+ unused JavaScript

**Tasks:**
- [ ] Implement proper code splitting for OnchainKit
  - Add dynamic imports for heavy components
  - Use `next/dynamic` with `loading` fallback
- [ ] Move WalletPanel to separate chunk
  - Already partially done (dynamic import exists)
  - Add prefetch on hover for better UX
- [ ] Tree-shake unused wagmi/viem exports
  - Configure `modularizeImports` in next.config.ts
  - Import only needed functions, not entire modules
- [ ] Enable server component optimization
  - Add `experimental.optimizeServerComponents` to next.config
- [ ] Analyze bundle with `@next/bundle-analyzer`
  - Run: `npm install --save-dev @next/bundle-analyzer`
  - Target: Reduce main bundle to <500KB gzipped

**Files to Modify:**
- `next.config.ts`
- `components/layout/WalletControls.tsx`
- `app/layout.tsx` (OnchainKit provider optimization)

**Completion Criteria:**
✅ WalletControls chunk < 1MB
✅ Events page Lighthouse performance > 70
✅ Unused JavaScript < 200KB

---

### 2.2 Image & Asset Optimization
- [ ] Add proper Next.js Image component usage
  - Convert `<img>` tags to `<Image>` where applicable
  - Add `width` and `height` props (prevents CLS)
- [ ] Implement `priority` prop on LCP images
  - Events page: First event card image
  - Home page: Hero image
- [ ] Add image optimization pipeline
  - Compress poster uploads on server
  - Generate WebP versions
  - Add responsive srcSet

**Lighthouse Issues to Fix:**
- CLS (Cumulative Layout Shift): 0.103 → target < 0.1
- LCP (Largest Contentful Paint): 3.5s → target < 2.5s

**Completion Criteria:**
✅ All images use Next.js Image component
✅ LCP images have priority flag
✅ CLS score < 0.1

---

### 2.3 Data Fetching Optimization
- [ ] Add React Query caching to browsers
  - Events browser: Cache for 5 minutes
  - Venues/Artists: Cache for 10 minutes
  - Add stale-while-revalidate strategy
- [ ] Implement ISR for static pages
  - Event detail pages: Revalidate every 60 seconds
  - Venue/Artist pages: Revalidate every 5 minutes
- [ ] Add database connection pooling
  - Configure Prisma connection pool size
  - Add `connection_limit` to DATABASE_URL
  - Monitor connection usage in production

**Files to Modify:**
- `app/events/page.tsx` (add ISR config)
- `app/events/[id]/page.tsx` (add ISR config)
- `lib/db/prisma.ts` (connection pooling)

**Completion Criteria:**
✅ Pages load from cache when available
✅ ISR working on event pages
✅ Database connections properly pooled

---

## Phase 3: Complete Integrations 🔌
**Priority:** MEDIUM
**Estimated Time:** 4-6 hours
**Status:** Not Started

### 3.1 Rewrite NFT Minting Service
**Current State:** Uses ethers (incompatible), not wired to payment flow

- [ ] Replace ethers with viem/wagmi
  - Use `writeContract` from wagmi
  - Use `publicClient` and `walletClient` from viem
- [ ] Integrate Base Paymaster SDK
  - Install: `@base-org/paymaster-sdk` or use CDP SDK
  - Implement gas sponsorship for mints
  - Add retry logic for failed transactions
- [ ] Wire to checkout flow
  - Connect `app/api/checkout/card-charge/route.ts` to real minting
  - Add transaction confirmation polling
  - Update Charge status in database after mint
- [ ] Add error handling
  - Insufficient gas → Notify admin, retry
  - Contract revert → Parse reason, show to user
  - Network errors → Exponential backoff retry

**Files to Modify:**
- `lib/services/NFTMintingService.ts` (complete rewrite)
- `lib/services/PaymasterService.ts` (implement real paymaster calls)
- `app/api/checkout/card-charge/route.ts`
- `app/api/webhooks/coinbase/route.ts` (mint on payment confirm)

**Completion Criteria:**
✅ NFT mints successfully after payment
✅ Transaction hash stored in database
✅ Gas sponsored by Base Paymaster
✅ Proper error handling and retries

---

### 3.2 Finish Payment Flows
**Current State:** Both Coinbase Pay and card checkout return mock data

- [ ] Implement Coinbase Pay session creation
  - Use Coinbase Commerce API v3
  - Create real checkout session
  - Return session URL to frontend
- [ ] Add payment validation webhook
  - Verify Coinbase webhook signature
  - Handle `charge:confirmed`, `charge:failed` events
  - Update Charge and Ticket records
- [ ] Wire card checkout to Stripe/Square/etc
  - Decision needed: Which payment processor?
  - Recommendation: Stripe (best crypto-fiat bridge)
  - Add payment intent creation
  - Handle 3D Secure authentication
- [ ] Add transaction confirmation polling
  - Frontend polls `/api/charge/[id]` for status
  - Show loading state during payment
  - Redirect to success/failure page

**Files to Modify:**
- `app/api/coinbase-pay/session/route.ts`
- `app/api/webhooks/coinbase/route.ts`
- `app/api/checkout/card-charge/route.ts`
- NEW: `app/api/charge/[id]/route.ts` (status polling endpoint)

**Completion Criteria:**
✅ Real Coinbase Pay sessions created
✅ Webhook validates and processes payments
✅ Card payments work end-to-end
✅ Status polling updates UI

---

### 3.3 Complete Venue Onboarding
**Current State:** Venue role exists, but no signup/approval flow

- [ ] Create venue signup flow
  - Form: Venue name, address, capacity, contact info
  - Upload venue image
  - Submit for admin approval
- [ ] Add venue approval workflow
  - Admin dashboard to review pending venues
  - Approve/reject with notes
  - Email notifications on status change
- [ ] Implement venue profile management
  - Edit venue details
  - Upload additional images
  - Manage payout settings
- [ ] Add event creation UI for venues
  - Multi-step form: Event details, tickets, pricing
  - Poster upload with preview
  - Publish/draft/schedule options

**Files to Create:**
- `app/venues/onboard/page.tsx`
- `app/admin/venues/page.tsx` (approval dashboard)
- `app/dashboard/venue/events/new/page.tsx`
- `app/api/venues/onboard/route.ts`
- `app/api/admin/venues/[id]/approve/route.ts`

**Completion Criteria:**
✅ Venue owners can sign up
✅ Admins can approve/reject venues
✅ Approved venues can create events
✅ Email notifications working

---

## Phase 4: Environment & Deployment Prep 🚀
**Priority:** CRITICAL
**Estimated Time:** 2 hours
**Status:** Not Started

### 4.1 Environment Variable Cleanup
**⚠️ SECURITY CRITICAL:** Current .env is committed to git with production secrets!

- [ ] Rotate ALL secrets immediately
  - [x] JWT_SECRET (generate new: `openssl rand -base64 32`)
  - [ ] COINBASE_COMMERCE_API_KEY
  - [ ] MINTING_WALLET_PRIVATE_KEY (create new wallet, fund with ETH)
  - [ ] NEXT_PUBLIC_ONCHAINKIT_API_KEY
  - [ ] BASESCAN_API_KEY
- [ ] Create production .env template
  - Document all required variables
  - Add example values (not real secrets)
  - Save as `.env.production.example`
- [ ] Set up deployment platform env vars
  - Vercel: Project Settings → Environment Variables
  - Railway: Service → Variables
  - Add production, preview, development environments
- [ ] Remove .env from git history
  - Run: `git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch .env' --prune-empty --tag-name-filter cat -- --all`
  - Add to .gitignore (already there ✅)

**Environment Variables Checklist:**
```bash
# Critical (must set for deploy)
DATABASE_URL="postgresql://..."
JWT_SECRET="64_char_random_string"
NFT_CONTRACT_ADDRESS="0x..."
MINTING_PRIVATE_KEY="0x..."
NEXT_PUBLIC_ONCHAINKIT_API_KEY="..."
NEXT_PUBLIC_BASE_RPC_URL="https://..."

# Important
COINBASE_COMMERCE_API_KEY="..."
ADMIN_PASSWORD="..." # Min 12 chars
NEXT_PUBLIC_APP_URL="https://unchained.xyz"

# Optional
DEV_WALLET_ADDRESS="0x..."
COINBASE_PAY_API_KEY="..."
SERPAPI_KEY="..."
```

**Completion Criteria:**
✅ All secrets rotated
✅ .env removed from git history
✅ Production env vars configured in deployment platform
✅ .env.production.example created

---

### 4.2 Database Preparation
- [ ] Set up production database
  - Option 1: Vercel Postgres (easy, integrated)
  - Option 2: Supabase (feature-rich, good free tier)
  - Option 3: Neon (serverless, auto-scaling)
  - Recommendation: Vercel Postgres for simplicity
- [ ] Run all pending migrations
  - Run: `npx prisma migrate deploy`
  - Verify all tables created
- [ ] Seed production database
  - Create admin user with ADMIN_PASSWORD
  - Add sample venues/events (optional)
  - Run: `npm run db:seed`
- [ ] Configure connection pooling
  - Add to DATABASE_URL: `?connection_limit=10&pool_timeout=20`
  - For serverless: Use Prisma Data Proxy or PgBouncer
- [ ] Set up database backups
  - Vercel Postgres: Automatic daily backups ✅
  - Self-hosted: Configure pg_dump cron job

**Completion Criteria:**
✅ Production database created
✅ Migrations applied successfully
✅ Admin user can log in
✅ Backups configured

---

### 4.3 Smart Contract Deployment
**Current State:** Contract deployed to Base Sepolia testnet

- [ ] **Decision:** Deploy new contract to Base mainnet OR keep testnet for MVP?
  - Mainnet: Real ETH costs, production-ready
  - Testnet: Free, good for beta testing
  - Recommendation: Start on testnet, migrate to mainnet at launch
- [ ] Deploy UnchainedTickets contract to Base mainnet
  - Use Hardhat/Foundry deployment script
  - Fund deployer wallet with ETH for gas
  - Save deployment address
- [ ] Verify contract on BaseScan
  - Run: `npx hardhat verify --network base <CONTRACT_ADDRESS>`
  - Enables public contract reading
- [ ] Update NFT_CONTRACT_ADDRESS in env
  - Production: Use mainnet address
  - Preview/Development: Use testnet address
- [ ] Fund minting wallet with ETH
  - Testnet: Get from Base Sepolia faucet
  - Mainnet: Transfer 0.1-0.5 ETH for gas
  - Monitor balance, set up alerts

**Current Contract Address (Testnet):**
`0xC37Ca890666a8F637484a45aA5F436ce553d49e6`

**Completion Criteria:**
✅ Contract deployed to chosen network
✅ Contract verified on BaseScan
✅ Minting wallet funded
✅ Environment variables updated

---

## Phase 5: Testing & Polish ✨
**Priority:** HIGH
**Estimated Time:** 2-3 hours
**Status:** Not Started

### 5.1 Critical Path Testing
- [ ] Test wallet connection flow
  - Connect with Coinbase Wallet
  - Connect with MetaMask
  - Connect with WalletConnect (mobile)
  - Verify address displayed correctly
- [ ] Test event browsing and search
  - Search by event name
  - Filter by venue/artist
  - Sort by date
  - Verify pagination works
- [ ] Test ticket purchase (crypto)
  - Select event → Choose tier → Set quantity
  - Click Purchase → Coinbase Pay modal
  - Complete payment → Receive NFT
  - Verify NFT shows in "My Tickets"
- [ ] Test ticket purchase (card)
  - Same flow but with card checkout
  - Verify 3D Secure works
  - Check NFT minted after payment
- [ ] Test venue dashboard access control
  - Venue owner: Can access dashboard ✅
  - Admin: Can access all dashboards ✅
  - Dev: Can access all dashboards ✅
  - Fan: Access denied ✅

**Testing Checklist:**
- [ ] Desktop: Chrome, Firefox, Safari
- [ ] Mobile: iOS Safari, Android Chrome
- [ ] Tablet: iPad, Android tablet

**Completion Criteria:**
✅ All critical paths working
✅ No console errors
✅ Tested on 3+ browsers

---

### 5.2 Error Handling
- [ ] Add error boundaries to route components
  - Wrap each page in ErrorBoundary
  - Show user-friendly error message
  - Log error to console/Sentry
- [ ] Implement proper API error responses
  - Standardize error format: `{ error: "message", code: "ERROR_CODE" }`
  - Return correct HTTP status codes
  - Add request ID for debugging
- [ ] Add user-friendly error messages
  - Network error → "Connection lost. Please try again."
  - Auth error → "Please sign in to continue."
  - Payment error → "Payment failed: [reason]"
  - Not found → Custom 404 page (already exists ✅)
- [ ] Set up error tracking (optional but recommended)
  - Sentry free tier: 5k errors/month
  - Alternative: LogRocket, Bugsnag
  - Track: API errors, React errors, unhandled promises

**Files to Modify:**
- NEW: `components/ErrorBoundary.tsx`
- `app/layout.tsx` (wrap children in ErrorBoundary)
- All `app/api/*/route.ts` files (standardize error format)

**Completion Criteria:**
✅ Error boundaries prevent blank pages
✅ API errors have consistent format
✅ User sees helpful error messages
✅ (Optional) Error tracking configured

---

### 5.3 Security Audit
- [ ] Review all API routes for auth
  - Venue dashboard endpoints: Require venue/admin/dev role
  - Event creation: Require venue owner
  - Admin endpoints: Require admin role
  - Public endpoints: Add rate limiting
- [ ] Add rate limiting to sensitive endpoints
  - Already implemented in `lib/utils/rateLimit.ts` ✅
  - Wire to: `/api/auth/login`, `/api/auth/register`
  - Add: `/api/checkout/*` (prevent spam purchases)
- [ ] Validate all user inputs
  - Use Zod schemas (already in `lib/validators/eventSchemas.ts` ✅)
  - Add to: Venue onboarding, event creation, profile updates
  - Sanitize HTML inputs (prevent XSS)
- [ ] Check for SQL injection risks
  - Prisma ORM prevents SQL injection ✅
  - No raw SQL queries found ✅
- [ ] Review CORS and CSP headers
  - middleware.ts has CSP configured ✅
  - Verify allowed origins in production
  - Test cross-origin requests

**Security Checklist:**
- [ ] No API keys in client-side code
- [ ] All secrets in .env (not hardcoded)
- [ ] JWT tokens expire (7 days currently)
- [ ] Passwords hashed with bcrypt (12 rounds ✅)
- [ ] HTTPS enforced in production
- [ ] Rate limiting on auth endpoints
- [ ] Input validation on all forms
- [ ] CORS properly configured
- [ ] CSP headers prevent XSS

**Completion Criteria:**
✅ All API routes have proper auth
✅ Rate limiting enabled on sensitive endpoints
✅ Input validation on all user inputs
✅ Security headers verified

---

## Post-Deployment Monitoring 📊

### Week 1: Critical Monitoring
- [ ] Monitor error rates (target: < 1%)
- [ ] Check database performance (slow queries)
- [ ] Monitor API response times (target: < 500ms p95)
- [ ] Track minting wallet ETH balance
- [ ] Review user feedback/support tickets

### Month 1: Performance Optimization
- [ ] Lighthouse audits on all pages (target: 90+)
- [ ] Database query optimization (add indexes)
- [ ] CDN setup for static assets
- [ ] Implement Redis caching (optional)

---

## Decision Log

| Date | Decision | Reasoning | Status |
|------|----------|-----------|--------|
| 2025-10-10 | Keep RBAC tables for future | Already in schema, may use for fine-grained permissions | ✅ Decided |
| TBD | Rewrite NFT service to viem vs install ethers | TBD - affects bundle size | 🤔 Pending |
| TBD | Deploy to mainnet vs testnet for MVP | TBD - affects costs and risk | 🤔 Pending |
| TBD | Payment processor for card payments | TBD - Stripe recommended | 🤔 Pending |

---

## Progress Tracker

**Overall Progress:** 0/5 Phases Complete (0%)

### Completed ✅
- Initial code review
- Deployment plan created
- Issues identified and documented

### In Progress ⏳
- None

### Blocked 🚫
- None

### Next Steps 👉
1. Fix build errors (Phase 1.1)
2. Complete RBAC (Phase 1.2)
3. Rotate environment secrets (Phase 4.1)

---

**Notes:**
- This plan prioritizes getting to a working deployment quickly
- Recommended sequence: Phase 1 → Phase 4 → Phase 5 → Phase 2 → Phase 3
- Performance optimizations (Phase 2) can be done post-launch
- Advanced integrations (Phase 3) can be iterative improvements
