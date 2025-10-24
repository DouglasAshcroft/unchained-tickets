# Vercel Environment Variables Setup Guide

## Overview

This guide explains how to configure environment variables in Vercel so that your deployments automatically use the correct blockchain network and payment settings:

- **Production** → Base Mainnet (chain 8453) with real payments
- **Preview/Development** → Base Sepolia Testnet (chain 84532) with mock payments

**No code changes needed!** Vercel automatically switches configurations based on the deployment environment.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Understanding Vercel Environments](#understanding-vercel-environments)
3. [Environment Variables Reference](#environment-variables-reference)
4. [Step-by-Step Setup](#step-by-step-setup)
5. [Verification](#verification)
6. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites

1. Vercel account with project connected
2. Database connection strings (Supabase or Vercel Postgres)
3. API keys from Coinbase, BaseScan, etc.
4. Smart contract deployed to both Base mainnet AND Base Sepolia testnet
5. Minting wallets with MINTER_ROLE on both contracts

### Setup Process

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to your project → Settings → Environment Variables
3. Add variables from [Environment Variables Reference](#environment-variables-reference)
4. For each variable, select appropriate environment(s):
   - **Shared variables**: Select all 3 (Production, Preview, Development)
   - **Network-specific variables**: Select only Production OR only Preview+Development
5. Run verification script: `node scripts/verify-env-config.mjs`
6. Deploy and test!

---

## Understanding Vercel Environments

Vercel provides three deployment environments:

| Environment | When Used | Branch Example | Your Configuration |
|------------|-----------|----------------|-------------------|
| **Production** | Main branch deployments | `main` | Base Mainnet + Real Payments |
| **Preview** | PR and branch deployments | `feature/*`, `dev` | Base Sepolia + Mock Payments |
| **Development** | Local `vercel dev` | N/A | Base Sepolia + Mock Payments |

### How It Works

When you add an environment variable in Vercel Dashboard, you choose which environment(s) should use it:

- **Production only** → Only production deployments from `main` branch get this value
- **Preview + Development** → All non-production deployments get this value
- **All environments** → Production, Preview, AND Development all get the same value

---

## Environment Variables Reference

### Shared Variables (Same Across All Environments)

These variables should be set with **"Production, Preview, Development"** selected (all three checkboxes).

#### Project Configuration

```bash
NEXT_PUBLIC_PROJECT_NAME="Unchained Tickets"
NODE_ENV=production
```

#### Database Configuration

```bash
# Use your Supabase or Vercel Postgres connection strings
DATABASE_URL="postgres://postgres.xxx:PASSWORD@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"
DIRECT_URL="postgres://postgres.xxx:PASSWORD@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"
```

**Where to get:**
- Supabase: Project Settings → Database → Connection string (Session mode for DATABASE_URL)
- Vercel Postgres: Storage → Your database → .env.local tab

#### Authentication & Security

```bash
# Generate with: openssl rand -hex 32
JWT_SECRET="your_generated_jwt_secret_here"

# Strong password for seeding admin account
ADMIN_PASSWORD="your_secure_admin_password"
```

#### Developer Access (RBAC)

```bash
# Your personal wallet address for elevated developer access
DEV_WALLET_ADDRESS=0x44Df6638425A44FA72ac83BBEbdf45f5391a17c2
NEXT_PUBLIC_DEV_WALLET_ADDRESS=0x44Df6638425A44FA72ac83BBEbdf45f5391a17c2
```

#### OnchainKit & Coinbase

```bash
# Get from: https://portal.cdp.coinbase.com/
NEXT_PUBLIC_ONCHAINKIT_API_KEY="your_coinbase_api_key"

# Coinbase Developer Platform (CDP) - For onramp functionality
NEXT_PUBLIC_CDP_PROJECT_ID="your_cdp_project_id"
CDP_API_KEY_NAME="organizations/YOUR_ORG_ID/apiKeys/YOUR_KEY_ID"
CDP_API_KEY_PRIVATE_KEY="-----BEGIN EC PRIVATE KEY-----\nYOUR_KEY\n-----END EC PRIVATE KEY-----"

# Coinbase Commerce (for crypto payments)
COINBASE_COMMERCE_API_KEY="your_commerce_api_key"
COINBASE_WEBHOOK_SECRET="your_webhook_secret"

# Coinbase Onramp Configuration
NEXT_PUBLIC_COINBASE_ONRAMP_ENABLED=true
COINBASE_ONRAMP_MINIMUM_USD=10.00
COINBASE_ONRAMP_API_URL=https://api.developer.coinbase.com
```

#### BaseScan API

```bash
# Get from: https://basescan.org/myapikey
BASESCAN_API_KEY="your_basescan_api_key"
```

#### External Services (Optional)

```bash
# SerpAPI for event discovery (optional)
SERPAPI_KEY="your_serpapi_key"

# Stability AI for poster generation (optional)
STABILITY_API_KEY="your_stability_api_key"
NEXT_PUBLIC_POSTER_GENERATION_ENABLED=true
```

#### Application URLs

```bash
# Set to your production domain for Production environment
# Set to your preview domain for Preview/Development
NEXT_PUBLIC_APP_URL="https://unchainedtickets.xyz"
NEXT_PUBLIC_API_BASE_URL="https://unchainedtickets.xyz"
```

#### Monitoring (Optional)

```bash
# Sentry error tracking (optional but recommended)
NEXT_PUBLIC_SENTRY_DSN="https://YOUR_KEY@sentry.io/YOUR_PROJECT"
SENTRY_AUTH_TOKEN="your_sentry_auth_token"
SENTRY_ORG="your-org-name"
SENTRY_PROJECT="unchained-tickets"
```

---

### Environment-Specific Variables

These variables **differ** between Production and Preview/Development environments.

#### Production Environment ONLY

Select **"Production"** only (uncheck Preview and Development).

```bash
# Base Mainnet Configuration
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_NETWORK=mainnet
NEXT_PUBLIC_DEV_MODE=false
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org

# Your MAINNET smart contract address
NFT_CONTRACT_ADDRESS=0xYOUR_MAINNET_CONTRACT_ADDRESS
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0xYOUR_MAINNET_CONTRACT_ADDRESS

# MAINNET minting wallet (must have MINTER_ROLE on mainnet contract)
# CRITICAL: Keep this wallet funded with ETH for gas!
MINTING_PRIVATE_KEY=0xYOUR_MAINNET_MINTER_PRIVATE_KEY
MINTING_WALLET_ADDRESS=0xYOUR_MAINNET_MINTER_ADDRESS
```

#### Preview + Development Environments ONLY

Select **"Preview"** and **"Development"** (uncheck Production).

```bash
# Base Sepolia Testnet Configuration
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_DEV_MODE=true
NEXT_PUBLIC_BASE_RPC_URL=https://sepolia.base.org

# Your TESTNET smart contract address (currently deployed)
NFT_CONTRACT_ADDRESS=0xeDAE8268830E998Ff359Fdd62CE33E3131731Aa3
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0xeDAE8268830E998Ff359Fdd62CE33E3131731Aa3

# TESTNET minting wallet (must have MINTER_ROLE on testnet contract)
MINTING_PRIVATE_KEY=0xc2d4c6b6adfdeba5a4a8c73d8e908aa0fdcd3da03f4ac0cde264064aeac2f068
MINTING_WALLET_ADDRESS=0x5B33aA418a6d455AADc391841788e8F72Df5ECd9
```

---

## Step-by-Step Setup

### Step 1: Access Vercel Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **Unchained Tickets** project
3. Click **Settings** in the top navigation
4. Click **Environment Variables** in the left sidebar

### Step 2: Add Shared Variables

For each variable in the **Shared Variables** section above:

1. Click **"Add New"** button
2. Enter the **Key** (variable name)
3. Enter the **Value**
4. **IMPORTANT**: Check all 3 boxes: **Production**, **Preview**, **Development**
5. Click **"Save"**

Repeat for all 24 shared variables.

### Step 3: Add Production-Specific Variables

For each variable in the **Production Environment ONLY** section:

1. Click **"Add New"** button
2. Enter the **Key** (variable name)
3. Enter your **MAINNET** value
4. **IMPORTANT**: Check ONLY **"Production"** (uncheck Preview and Development)
5. Click **"Save"**

Repeat for all 8 production variables.

### Step 4: Add Preview/Development-Specific Variables

For each variable in the **Preview + Development Environments ONLY** section:

1. Click **"Add New"** button
2. Enter the **Key** (variable name)
3. Enter your **TESTNET** value
4. **IMPORTANT**: Check ONLY **"Preview"** and **"Development"** (uncheck Production)
5. Click **"Save"**

Repeat for all 8 preview/development variables.

### Step 5: Verify Configuration

Your environment variables list should show:

- Shared variables with badges: `Production` `Preview` `Development` (all 3)
- Mainnet variables with badge: `Production` (only 1)
- Testnet variables with badges: `Preview` `Development` (2)

### Step 6: Redeploy

After adding/updating environment variables:

1. Go to **Deployments** tab
2. Click the **three dots** on the latest deployment
3. Click **"Redeploy"**
4. Or push a new commit to trigger automatic deployment

---

## Verification

### Verify Environment Configuration Script

Run the verification script to check your environment is configured correctly:

```bash
# Verify current environment (local)
node scripts/verify-env-config.mjs

# Check which network you're connected to
node scripts/verify-minting-key.mjs
```

The script will report:
- ✅ Which environment is active (production/preview/development)
- ✅ Blockchain network (mainnet/testnet)
- ✅ Chain ID (8453 or 84532)
- ✅ Contract address
- ✅ Payment mode (real/mock)
- ✅ All required variables present
- ✅ Private key format validation
- ✅ Database connection test

### Manual Verification Checklist

#### For Production Deployments:

- [ ] `NEXT_PUBLIC_CHAIN_ID` = `8453`
- [ ] `NEXT_PUBLIC_NETWORK` = `mainnet`
- [ ] `NEXT_PUBLIC_DEV_MODE` = `false`
- [ ] `NEXT_PUBLIC_BASE_RPC_URL` contains `mainnet.base.org`
- [ ] `NFT_CONTRACT_ADDRESS` is your mainnet contract
- [ ] `MINTING_PRIVATE_KEY` is your mainnet minting wallet
- [ ] Minting wallet has MINTER_ROLE on mainnet contract
- [ ] Minting wallet has ETH for gas fees

#### For Preview/Development Deployments:

- [ ] `NEXT_PUBLIC_CHAIN_ID` = `84532`
- [ ] `NEXT_PUBLIC_NETWORK` = `testnet`
- [ ] `NEXT_PUBLIC_DEV_MODE` = `true`
- [ ] `NEXT_PUBLIC_BASE_RPC_URL` contains `sepolia.base.org`
- [ ] `NFT_CONTRACT_ADDRESS` = `0xeDAE8268830E998Ff359Fdd62CE33E3131731Aa3`
- [ ] `MINTING_PRIVATE_KEY` = `0xc2d4c6b6adfdeba5a4a8c73d8e908aa0fdcd3da03f4ac0cde264064aeac2f068`
- [ ] Minting wallet has MINTER_ROLE on testnet contract
- [ ] Minting wallet has Sepolia ETH for gas

---

## Troubleshooting

### Issue: Build failing with "MINTING_PRIVATE_KEY is not configured"

**Solution**: This error should NOT occur anymore due to lazy initialization. If you see it:

1. Verify the variable is set in Vercel for the correct environment
2. Check variable name is exactly `MINTING_PRIVATE_KEY` (no typos)
3. Redeploy after adding the variable

### Issue: "Invalid private key format" error

**Solution**: Private key must be:

- Exactly 66 characters long (including `0x` prefix)
- Format: `0x` followed by 64 hexadecimal characters (0-9, a-f)
- Example: `0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef`

Run `node scripts/verify-minting-key.mjs` to diagnose the issue.

### Issue: Production deployment using testnet

**Solution**:

1. Go to Vercel → Settings → Environment Variables
2. Find `NEXT_PUBLIC_CHAIN_ID`
3. Verify it has TWO entries:
   - One with value `8453` for **Production** only
   - One with value `84532` for **Preview + Development** only
4. If you see only one entry, delete it and recreate both
5. Redeploy

### Issue: Preview deployment using mainnet

**Solution**:

1. Check that mainnet variables (chain ID 8453, mainnet contract) are set to **Production ONLY**
2. Check that testnet variables (chain ID 84532, testnet contract) are set to **Preview + Development**
3. Verify no environment variables are missing the environment selection
4. Redeploy the preview branch

### Issue: Payments not working in testnet

**Solution**:

1. Verify `NEXT_PUBLIC_DEV_MODE=true` is set for Preview + Development
2. Check minting wallet has Sepolia ETH (get from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet))
3. Verify minting wallet has MINTER_ROLE on testnet contract
4. Run: `node scripts/verify-minting-key.mjs`

### Issue: Database connection failing

**Solution**:

1. Verify `DATABASE_URL` and `DIRECT_URL` are set for all environments
2. Check connection strings are correct (copy from Supabase/Vercel)
3. Ensure connection string includes `?sslmode=require` parameter
4. For Supabase, use **Session mode** connection string for DATABASE_URL
5. Test connection: `npx prisma db pull`

### Issue: Different environment in Vercel vs Local

**Solution**:

- **Local development** always uses your `.env` file
- **Vercel deployments** use environment variables from Vercel Dashboard
- To sync local with Preview/Development, copy Preview values to your `.env` file
- Never commit `.env` file to git!

---

## Security Best Practices

### Private Keys

- ✅ **DO**: Keep production private keys in Vercel ONLY (never in code/git)
- ✅ **DO**: Use separate wallets for mainnet vs testnet
- ✅ **DO**: Fund mainnet minting wallet with only enough ETH for ~100 transactions
- ✅ **DO**: Rotate private keys if compromised
- ❌ **DON'T**: Share private keys in Slack/Discord/email
- ❌ **DON'T**: Commit `.env` files to git
- ❌ **DON'T**: Use the same wallet for minting and treasury

### API Keys

- ✅ **DO**: Rotate JWT_SECRET periodically (every 6 months)
- ✅ **DO**: Use API key restrictions where possible (IP allowlist, domain restrictions)
- ✅ **DO**: Enable 2FA on all service accounts (Coinbase, BaseScan, etc.)
- ✅ **DO**: Use different API keys for production vs development if possible
- ❌ **DON'T**: Use production API keys in development
- ❌ **DON'T**: Share API keys publicly or in screenshots

### Database

- ✅ **DO**: Use connection pooling (Supabase Session/Transaction modes)
- ✅ **DO**: Enable SSL mode (`sslmode=require`)
- ✅ **DO**: Regularly backup production database
- ✅ **DO**: Test migrations on testnet database first
- ❌ **DON'T**: Use production database for development
- ❌ **DON'T**: Expose database credentials in client-side code

---

## Maintenance

### When You Deploy New Contract

1. Deploy contract to testnet first → Test thoroughly
2. Deploy same contract to mainnet
3. Grant MINTER_ROLE to minting wallets on both networks
4. Update Vercel environment variables:
   - Production: Update `NFT_CONTRACT_ADDRESS` with mainnet address
   - Preview+Dev: Update `NFT_CONTRACT_ADDRESS` with testnet address
5. Update `deployments/base.json` (mainnet)
6. Update `deployments/baseSepolia.json` (testnet)
7. Redeploy all environments
8. Verify with `node scripts/verify-env-config.mjs`

### When You Rotate Private Keys

1. Generate new wallet: `npx hardhat accounts` or use hardware wallet
2. Grant MINTER_ROLE to new wallet on contract
3. Update Vercel environment variable `MINTING_PRIVATE_KEY`
4. Update `MINTING_WALLET_ADDRESS`
5. Redeploy
6. Test minting on affected environment
7. Revoke MINTER_ROLE from old wallet (after 24hr grace period)

### When You Change Blockchain Networks

If switching from testnet to mainnet or vice versa:

1. Update deployment documentation
2. Update contract addresses in Vercel
3. Update RPC URLs
4. Update chain ID
5. Update DEV_MODE flag
6. Redeploy
7. Run full integration test suite

---

## Quick Reference Table

| Variable | Production | Preview/Dev |
|----------|-----------|-------------|
| CHAIN_ID | 8453 | 84532 |
| NETWORK | mainnet | testnet |
| DEV_MODE | false | true |
| RPC_URL | mainnet.base.org | sepolia.base.org |
| CONTRACT | Mainnet address | 0xeDAE...1Aa3 |
| MINTING_KEY | Mainnet wallet | 0xc2d4...f068 |

---

## Additional Resources

- [Vercel Environment Variables Docs](https://vercel.com/docs/concepts/projects/environment-variables)
- [Base Network Documentation](https://docs.base.org/)
- [Base Sepolia Testnet Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
- [Coinbase Developer Platform](https://portal.cdp.coinbase.com/)
- [BaseScan API Keys](https://basescan.org/myapikey)
- [Supabase Documentation](https://supabase.com/docs)

---

## Questions?

If you encounter issues not covered in this guide:

1. Run `node scripts/verify-env-config.mjs` for diagnostic output
2. Check Vercel deployment logs for specific error messages
3. Verify all variables are set with correct environment scopes
4. Review [Troubleshooting](#troubleshooting) section above

---

**Last Updated**: October 2025
**Contract Version**: v1.0.0
**Testnet Contract**: `0xeDAE8268830E998Ff359Fdd62CE33E3131731Aa3`
