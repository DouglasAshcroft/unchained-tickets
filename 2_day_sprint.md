🚀 2-DAY PRODUCTION DEPLOYMENT PLAN - HACKATHON READY
OVERVIEW
Transform your testnet prototype into a fully functional Base mainnet alpha in 48 hours.
DAY 1: FOUNDATION & CONTRACT (14-16 hours)
PHASE 1: Database Connection (2 hours) - CRITICAL
Goal: Get Vercel production database working Tasks:
Use Vercel's Supabase Integration (Recommended)
Keep the empty database Vercel created
Update .env locally to use Vercel's POSTGRES_PRISMA_URL
Run migrations: npx prisma migrate deploy --schema=prisma/schema.prisma
Run seed: npx prisma db seed
Verify in Vercel Supabase dashboard
Configure Vercel Environment Variables
Add DATABASE_URL = (copy from Vercel's POSTGRES_PRISMA_URL)
Add DIRECT_URL = (copy from Vercel's POSTGRES_URL_NON_POOLING)
Update schema.prisma: add directUrl = env("DIRECT_URL")
Trigger Vercel redeploy
Expected Result: https://unchainedtickets.xyz/events shows seeded events
PHASE 2: Contract Deployment Setup (3 hours)
Goal: Prepare for Base mainnet deployment Tasks:
Install Hardhat (you have config but not the tool)
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts
Create Deployment Script (scripts/deploy-mainnet.cjs)
Deploy UnchainedTickets contract
Set base URI to: https://unchainedtickets.xyz/api/metadata/
Verify on Basescan
Save contract address
Fund Minting Wallet
Send 0.05 ETH to your minting wallet on Base mainnet
This covers ~100 mints + buffer
Test Deployment on Sepolia First
Deploy to Sepolia testnet
Test minting flow
Verify contract interactions work
DO NOT PROCEED TO MAINNET IF SEPOLIA FAILS
Expected Result: Working contract on Sepolia, ready for mainnet
PHASE 3: Base Mainnet Deployment (2 hours)
Goal: Deploy production contract Tasks:
Deploy to Base Mainnet
npx hardhat run scripts/deploy-mainnet.cjs --network baseMainnet
Verify Contract on Basescan
npx hardhat verify --network baseMainnet <CONTRACT_ADDRESS> "https://unchainedtickets.xyz/api/metadata/"
Update Vercel Environment Variables
NFT_CONTRACT_ADDRESS = (new mainnet address)
NEXT_PUBLIC_NETWORK = "mainnet"
NEXT_PUBLIC_CHAIN_ID = "8453"
Redeploy
Initialize Contract in Database
npm run tsx scripts/ops/add-contract-to-db.ts
Expected Result: Contract deployed, verified, configured
PHASE 4: Coinbase Commerce Setup (3 hours)
Goal: Enable crypto payments Tasks:
Coinbase Commerce Dashboard
Log into commerce.coinbase.com
Get production API key
Create webhook: https://unchainedtickets.xyz/api/webhooks/coinbase
Save webhook secret
Update Vercel Environment Variables
COINBASE_COMMERCE_API_KEY = (your production key)
COINBASE_WEBHOOK_SECRET = (from webhook settings)
Mark both as "Sensitive"
Redeploy
Test Webhook Locally
Use Coinbase Commerce "Test Webhook" button
Check Vercel function logs for success
Verify webhook signature validation works
Expected Result: Payments flow configured
PHASE 5: Basic Minting Flow (4 hours)
Goal: End-to-end ticket purchase → NFT mint Tasks:
Test Purchase Flow
Create test event in admin dashboard
Buy ticket with small amount ($1-5)
Monitor webhook logs in Vercel
Verify NFT mints to buyer's wallet
Check on Basescan
Fix Any Minting Errors
Debug gas estimation issues
Fix contract interaction errors
Ensure metadata API returns correct JSON
Verify on Frontend
User sees "My Tickets" page with NFT
Metadata displays correctly
QR code generates
Expected Result: Working buy → mint → view flow
DAY 2: POLISH & ADVANCED FEATURES (14-16 hours)
PHASE 6: Paymaster Integration (4 hours) - HIGH PRIORITY
Goal: Gas-sponsored transactions (wow factor) Tasks:
Get Paymaster Endpoints Ready
You mentioned you have test + mainnet endpoints
Get the mainnet paymaster URL from Base Developer Platform
Get API key/policy ID
Update NFTMintingService.ts
Add paymaster middleware to viem wallet client
Configure gas sponsorship policy
Test on Sepolia first, then mainnet
Add to Vercel Environment Variables
NEXT_PUBLIC_PAYMASTER_URL = (your mainnet endpoint)
PAYMASTER_POLICY_ID = (from Base dashboard)
Redeploy
Test Gas Sponsorship
Mint ticket without user paying gas
Verify paymaster paid the gas
Check Base Developer Platform for usage
FALLBACK: If paymaster takes too long, skip it. Regular minting (user pays gas) still works and is acceptable for alpha. Expected Result: Users don't pay gas fees (or fallback to regular minting)
PHASE 7: Admin Dashboard (3 hours)
Goal: Venue can create/manage events Tasks:
Test Admin Access
Log in with admin wallet (configured in DEV_WALLET_ADDRESS)
Navigate to /venues dashboard
Create new event
Upload poster image
Set ticket tiers/pricing
Verify Database Writes
Check event appears in Prisma Studio
Verify it shows on /events page
Ensure ticket types are configurable
Fix Any Admin UI Issues
Form validation errors
Image upload failures
Database write errors
Expected Result: Admin can create events end-to-end
PHASE 8: Poster Reveal Feature (3-4 hours) - WOW FACTOR
Goal: NFT transforms to collectible poster after "attending" Tasks:
Implement Souvenir Transform Flow
Admin marks ticket as "used" (simulates attendance)
Call contract's useTicket() with transformToSouvenir=true
Metadata API returns souvenir image URL for SOUVENIR state
Test Transform
Buy ticket
Admin "checks in" ticket
Verify NFT metadata updates to show poster
User sees transformation in wallet
Create Sample Poster Variants
Upload 2-3 poster images for demo
Associate with ticket tiers (VIP gets special poster)
Test rarity multiplier display
FALLBACK: If this takes too long, just show poster image in UI without on-chain transform. Still demonstrates concept. Expected Result: Ticket → Collectible transformation working
PHASE 9: Testing & Bug Fixes (3 hours)
Goal: Ensure everything works for demo Tasks:
End-to-End Test Script
Admin creates event ✓
User browses events ✓
User buys ticket with crypto ✓
NFT mints to wallet ✓
User views ticket in app ✓
Admin checks in ticket ✓
Poster reveals ✓
Cross-Browser Testing
Test on Chrome, Safari, mobile
Verify wallet connections work
Check responsive design
Performance Optimization
Enable Vercel caching for /api/events
Optimize image loading
Reduce API response times
Expected Result: Polished, functional alpha
PHASE 10: Final Deployment (1 hour)
Goal: Ship to production Tasks:
Final Git Commit
git add .
git commit -m "feat: production-ready alpha with Base mainnet integration"
git push origin main
Verify Vercel Deployment
Watch build logs
Check all functions deploy successfully
Test critical paths one final time
Update Documentation
Add deployed contract address to README
Document demo flow for judges
Create demo video if time permits
Expected Result: Live production site ready for judging
ENVIRONMENT VARIABLES CHECKLIST
Required for Vercel (mark sensitive where noted):
Database:
DATABASE_URL (from Vercel Supabase POSTGRES_PRISMA_URL)
DIRECT_URL (from Vercel Supabase POSTGRES_URL_NON_POOLING)
Contract & Blockchain:
NFT_CONTRACT_ADDRESS (deployed mainnet address)
MINTING_WALLET_PRIVATE_KEY [SENSITIVE]
MINTING_WALLET_ADDRESS
NEXT_PUBLIC_NETWORK=mainnet
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_BASE_RPC_URL (CDP API key URL)
BASESCAN_API_KEY
Payment:
COINBASE_COMMERCE_API_KEY [SENSITIVE]
COINBASE_WEBHOOK_SECRET [SENSITIVE]
Authentication:
JWT_SECRET [SENSITIVE]
ADMIN_PASSWORD [SENSITIVE]
NEXT_PUBLIC_DEV_WALLET_ADDRESS
Paymaster (Optional but recommended):
NEXT_PUBLIC_PAYMASTER_URL
PAYMASTER_POLICY_ID [SENSITIVE]
App URLs:
NEXT_PUBLIC_APP_URL=https://unchainedtickets.xyz
NEXT_PUBLIC_API_BASE_URL=https://unchainedtickets.xyz
OnchainKit:
NEXT_PUBLIC_ONCHAINKIT_API_KEY
CRITICAL SUCCESS METRICS
For hackathon judging, these MUST work: ✅ Onchain (Built on Base): Contract deployed to Base mainnet (8453) ✅ Technicality: Purchase flow → minting → viewing works ✅ Originality: Ticket → collectible poster transformation ✅ Viability: Admin dashboard for venues to create events ✅ Specific: Testing NFT ticketing UVP end-to-end ✅ Practicality: Anyone can browse, buy, receive NFT ✅ Wow Factor: Gas sponsorship + poster reveal + clean UX
FALLBACK OPTIONS (if running out of time)
Priority 1 (Must Have):
Database connection
Contract deployment to mainnet
Basic minting (user pays gas is OK)
Events browsing
Priority 2 (Nice to Have):
Paymaster (can skip if too complex)
Poster transformation (can show in UI only, skip on-chain)
Admin dashboard polish
Priority 3 (Bonus):
Performance optimization
Cross-browser testing
Demo video
DEPLOYMENT SCRIPTS TO CREATE
I will create these files during execution:
scripts/deploy-mainnet.cjs - Hardhat deployment script
scripts/configure-paymaster.ts - Paymaster integration
scripts/test-production.ts - E2E test script
.env.production.template - Complete env var reference
ESTIMATED TIMELINE
Day 1 (Today):
09:00-11:00: Database connection (Phase 1)
11:00-14:00: Contract setup (Phase 2)
14:00-16:00: Mainnet deployment (Phase 3)
16:00-19:00: Coinbase Commerce (Phase 4)
19:00-23:00: Minting flow (Phase 5)
Day 2 (Tomorrow):
09:00-13:00: Paymaster (Phase 6)
13:00-16:00: Admin dashboard (Phase 7)
16:00-20:00: Poster reveal (Phase 8)
20:00-23:00: Testing & final deploy (Phases 9-10)
Total: ~30 hours across 2 days = Intense but achievable
This plan prioritizes getting a working product deployed FIRST, then adding polish. If we encounter blockers, we have clear fallback options that still demonstrate a strong hackathon submission.
User approved the plan
Excellent! Let's get started immediately. I'll create a comprehensive todo list and begin with Phase 1 - the database connection, which is blocking everything else.
Update Todos

PHASE 1: Connect Vercel Supabase database and run migrations

PHASE 2: Install Hardhat and create deployment scripts

PHASE 3: Deploy contract to Base mainnet and verify

PHASE 4: Configure Coinbase Commerce and webhooks

PHASE 5: Test and fix basic minting flow end-to-end

PHASE 6: Integrate Base Paymaster for gas sponsorship

PHASE 7: Test admin dashboard and event creation

PHASE 8: Implement poster reveal transformation

PHASE 9: End-to-end testing and bug fixes

PHASE 10: Final deployment and documentation
Perfect! Let's dive into PHASE 1: Database Connection. This is the most critical blocker - once this works, everything else can function.
Step 1: Let me check what database connection strings Vercel created
First, I need to understand what Vercel gave you. Can you go to your Vercel dashboard and copy the exact values for these variables? In Vercel Dashboard → Your Project → Settings → Environment Variables, look for:
POSTGRES_PRISMA_URL
POSTGRES_URL_NON_POOLING
These are the two we need. They should look something like:
POSTGRES_PRISMA_URL=postgresql://...@...supabase.co:6543/postgres?pgbouncer=true
POSTGRES_URL_NON_POOLING=postgresql://...@...supabase.co:5432/postgres
Once you provide these, I'll:
Update your local .env to connect to the Vercel database
Update schema.prisma to use the pooled/direct URL pattern
Run migrations to create all tables in the Vercel database
Seed it with your event data
This should take about 30 minutes total. Please paste those two connection strings (you can mask the password partially if you want, like pass****word, I just need the format and host).