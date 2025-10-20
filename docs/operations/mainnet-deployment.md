# Base Mainnet Deployment Guide

This guide walks through deploying the UnchainedTickets
contract to Base mainnet and initializing it with production data.

## Prerequisites

### 1. Mainnet Wallet Setup

⚠️ **IMPORTANT**: You'll need a new production wallet with Base mainnet ETH

**Current testnet wallet**: `0x5B33aA418a6d455AADc391841788e8F72Df5ECd9`

**Options:**
- **A) Use existing wallet on mainnet** (if it has sufficient ETH)
- **B) Generate new production wallet** (recommended for security)

#### Option B: Generate New Production Wallet

```bash
# Generate a new wallet
node scripts/onchain/generate-wallet.cjs

# Output will show:
# Address: 0x...
# Private Key: 0x...
```

**Save the private key securely** - you'll need it for production deployment.

### 2. Fund Production Wallet

Send **Base mainnet ETH** to your production wallet:
- **Minimum**: 0.01 ETH (~$30 at current prices)
- **Recommended**: 0.05 ETH (~$150) for deployment + initialization

Where to get Base mainnet ETH:
- Bridge from Ethereum: https://bridge.base.org
- Buy directly on Coinbase and send to Base
- Use a DEX on Base (Uniswap, etc.)

Check balance:
```bash
cast balance YOUR_WALLET_ADDRESS --rpc-url https://mainnet.base.org
```

### 3. Update Environment Variables

Update `.env` for mainnet deployment:

```env
# Production Mainnet Configuration
NEXT_PUBLIC_NETWORK=mainnet
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_BASE_RPC_URL="https://api.developer.coinbase.com/rpc/v1/base/YOUR_API_KEY"

# Production Minting Wallet (⚠️ KEEP SECURE!)
MINTING_WALLET_PRIVATE_KEY="0xYOUR_PRODUCTION_PRIVATE_KEY"
MINTING_WALLET_ADDRESS="0xYOUR_PRODUCTION_ADDRESS"

# Contract Address (will be set after deployment)
NFT_CONTRACT_ADDRESS=""

# Production App URL
NEXT_PUBLIC_APP_URL="https://tickets.unchained.xyz"

# Basescan API Key (for verification)
BASESCAN_API_KEY="YOUR_BASESCAN_API_KEY"
```

⚠️ **Security Best Practices:**
- Never commit `.env` to git
- Use Vercel environment variables for production
- Rotate keys if compromised
- Enable 2FA on all accounts

---

## Phase 1: Deploy Contract to Base Mainnet

### Step 1: Verify Configuration

Check that everything is set up correctly:

```bash
# Verify wallet has funds
cast balance $MINTING_WALLET_ADDRESS --rpc-url https://mainnet.base.org

# Verify Hardhat network config
cat hardhat.config.cjs | grep -A 6 "baseMainnet"
```

Expected output:
```
baseMainnet: {
  url: process.env.NEXT_PUBLIC_BASE_RPC_URL || "https://mainnet.base.org",
  accounts: process.env.MINTING_WALLET_PRIVATE_KEY
    ? [process.env.MINTING_WALLET_PRIVATE_KEY]
    : [],
  chainId: 8453,
}
```

### Step 2: Deploy Contract

```bash
# Deploy to Base mainnet
npx hardhat run scripts/onchain/deploy.cjs --network baseMainnet
```

**Expected Output:**
```
Deploying UnchainedTickets contract with account: 0x...
Account balance: 0.05 ETH
Base URI: https://tickets.unchained.xyz/api/metadata/

✅ UnchainedTickets deployed to: 0x...

📝 Save this information to your .env file:
NFT_CONTRACT_ADDRESS="0x..."
MINTING_WALLET_ADDRESS="0x..."

⚠️  Don't forget to:
1. Verify the contract on BaseScan (see instructions below)
2. Update your .env file with the contract address
3. Fund the minting wallet with Base ETH for gas fees

🔍 To verify on BaseScan, run:
npx hardhat verify --network baseMainnet 0x... "https://tickets.unchained.xyz/api/metadata/"
```

### Step 3: Update Environment Variables

Add the contract address to `.env`:

```env
NFT_CONTRACT_ADDRESS="0xYOUR_NEW_MAINNET_CONTRACT_ADDRESS"
```

Also update:
- `NEXT_PUBLIC_CONTRACT_ADDRESS` (if used in frontend)

### Step 4: Verify Contract on Basescan

This makes your contract code visible and verifiable on Basescan:

```bash
# Verify contract (replace with your actual contract address)
npx hardhat verify \
  --network baseMainnet \
  0xYOUR_CONTRACT_ADDRESS \
  "https://tickets.unchained.xyz/api/metadata/"
```

**Expected Output:**
```
Successfully verified contract UnchainedTickets on Basescan.
https://basescan.org/address/0xYOUR_CONTRACT_ADDRESS#code
```

**Troubleshooting Verification:**

If verification fails with "already verified":
```bash
# Force re-verification
npx hardhat verify --force \
  --network baseMainnet \
  0xYOUR_CONTRACT_ADDRESS \
  "https://tickets.unchained.xyz/api/metadata/"
```

If verification fails with "constructor arguments":
```bash
# Manually provide constructor arguments
npx hardhat verify \
  --network baseMainnet \
  --constructor-args scripts/verify-args.js \
  0xYOUR_CONTRACT_ADDRESS
```

Create `scripts/verify-args.js`:
```javascript
module.exports = [
  "https://tickets.unchained.xyz/api/metadata/"
];
```

### Step 5: Test Contract Deployment

Verify the contract is working:

```bash
# Check contract owner
cast call 0xYOUR_CONTRACT_ADDRESS \
  "owner()(address)" \
  --rpc-url https://mainnet.base.org

# Should return your minting wallet address
```

---

## Phase 2: Initialize Production Contract

Now we need to create events and tiers on-chain so the contract knows about your events.

### Step 1: Review Database Events

Check which events should be created on-chain:

```sql
SELECT
  id,
  title,
  "startsAt",
  "endsAt",
  status,
  "venueId"
FROM "Event"
WHERE status = 'published'
ORDER BY "startsAt" ASC
LIMIT 10;
```

### Step 2: Create Initialization Script

Run the initialization script generator:

```bash
npx tsx scripts/onchain/initialize-production-contract.ts
```

If this script doesn't exist yet, create it (see below).

### Step 3: Verify Initialization

Check that events were created on-chain:

```bash
# Check if event 1 exists (replace with your event ID)
cast call 0xYOUR_CONTRACT_ADDRESS \
  "events(uint256)(uint256,uint256,uint256,string,string,address,uint256)" \
  1 \
  --rpc-url https://mainnet.base.org
```

---

## Phase 3: Update Application Configuration

### Step 1: Update Frontend Configuration

Update all references to the contract address:

**Files to update:**
- `.env` - Already done
- Any hardcoded contract addresses in frontend components

### Step 2: Test Metadata API

Verify metadata API works with new contract:

```bash
# Test metadata endpoint
curl https://tickets.unchained.xyz/api/metadata/1000001

# Should return JSON with event metadata
```

### Step 3: Test Minting (Testnet First)

Before going live, test the minting flow:

```bash
# Create a test purchase
# Use a small amount on mainnet or test on Sepolia first
```

---

## Cost Breakdown

### Deployment Costs (One-time)

| Item | Estimated Gas | Cost (at 1 gwei) | Cost (at 10 gwei) |
|------|---------------|-------------------|-------------------|
| Contract Deployment | ~2,000,000 gas | $5-10 | $50-100 |
| Contract Verification | Free | Free | Free |
| Create Event (per event) | ~100,000 gas | $0.25 | $2.50 |
| Create Tier (per tier) | ~50,000 gas | $0.12 | $1.20 |

**Example for 10 events with 3 tiers each:**
- Deployment: $50-100
- 10 events: $25
- 30 tiers: $36
- **Total**: ~$111-161

### Ongoing Costs (Per Transaction)

| Operation | Estimated Gas | Cost (at 1 gwei) | Cost (at 10 gwei) |
|-----------|---------------|-------------------|-------------------|
| Mint Ticket | ~150,000 gas | $0.37 | $3.70 |
| Use Ticket (scan) | ~80,000 gas | $0.20 | $2.00 |
| Batch Transform (10 tickets) | ~200,000 gas | $0.50 | $5.00 |

**Base mainnet typically runs at 0.1-1 gwei, so costs are very low!**

---

## Rollback Plan

If something goes wrong:

### Option 1: Redeploy Contract

If the contract has an issue:
1. Deploy a new contract
2. Update `NFT_CONTRACT_ADDRESS` in `.env`
3. Re-initialize with events/tiers
4. No data loss - all purchases stored in database

### Option 2: Pause Minting

If you need to stop minting temporarily:
1. Remove gas funds from minting wallet (prevents new mints)
2. Fix issues
3. Re-fund wallet when ready

### Option 3: Emergency Admin Functions

The contract owner can:
- Pause/unpause the contract (if implemented)
- Update metadata URIs
- Transfer ownership

---

## Post-Deployment Checklist

- [ ] Contract deployed successfully
- [ ] Contract verified on Basescan
- [ ] Events created on-chain
- [ ] Tiers created for each event
- [ ] Metadata API tested and working
- [ ] Environment variables updated everywhere
- [ ] Test mint succeeds
- [ ] Test scan succeeds
- [ ] Webhook integration tested
- [ ] Monitoring set up (Sentry)
- [ ] Backup minting wallet private key securely stored
- [ ] 2FA enabled on all production accounts

---

## Monitoring & Maintenance

### Monitor Contract Activity

**Basescan:**
- Contract page: `https://basescan.org/address/0xYOUR_CONTRACT`
- Watch for failed transactions
- Monitor gas costs

**Database:**
```sql
-- Check minting success rate
SELECT
  COUNT(*) as total_charges,
  COUNT(CASE WHEN "mintedTokenId" IS NOT NULL THEN 1 END) as minted,
  COUNT(CASE WHEN "mintLastError" IS NOT NULL THEN 1 END) as failed
FROM "Charge"
WHERE "createdAt" > NOW() - INTERVAL '24 hours';
```

**API Logs:**
- Watch for webhook failures
- Monitor minting service errors
- Check metadata API response times

### Regular Maintenance Tasks

**Weekly:**
- Check minting wallet balance (refill if needed)
- Review failed mint attempts
- Check for stuck charges

**After Each Event:**
- Run batch souvenir transformation
- Verify all tickets scanned correctly
- Check royalty payments

---

## Security Considerations

### Private Key Security

⚠️ **CRITICAL**: The minting wallet private key has full control over the contract

**Best Practices:**
1. Never commit to git
2. Use Vercel environment secrets (encrypted)
3. Rotate keys periodically
4. Use different keys for testnet vs mainnet
5. Consider hardware wallet for maximum security

### Contract Security

- The contract is deployed and immutable (can't be upgraded)
- Only the owner can create events/tiers
- Owner can transfer ownership if needed
- Consider audit before large-scale deployment

### Monitoring for Issues

Set up alerts for:
- Failed minting transactions
- Unusual gas costs
- Unauthorized access attempts
- Webhook failures

---

## Useful Commands

```bash
# Check contract balance
cast balance 0xYOUR_CONTRACT --rpc-url https://mainnet.base.org

# Check minting wallet balance
cast balance $MINTING_WALLET_ADDRESS --rpc-url https://mainnet.base.org

# Get current gas price
cast gas-price --rpc-url https://mainnet.base.org

# Call contract function (read-only)
cast call 0xYOUR_CONTRACT "functionName()(returnType)" --rpc-url https://mainnet.base.org

# Send transaction (write)
cast send 0xYOUR_CONTRACT "functionName()" --private-key $MINTING_WALLET_PRIVATE_KEY --rpc-url https://mainnet.base.org

# Get transaction receipt
cast receipt 0xTRANSACTION_HASH --rpc-url https://mainnet.base.org
```

---

## Support & Resources

- **Base Docs**: https://docs.base.org
- **Basescan**: https://basescan.org
- **Base Discord**: https://discord.gg/base
- **Hardhat Docs**: https://hardhat.org/docs

---

## Next Steps

After mainnet deployment:

1. ✅ Deploy to Vercel (Phase 3)
2. ✅ Set up production database
3. ✅ Configure monitoring (Sentry)
4. ✅ End-to-end testing
5. ✅ Record demo video
6. ✅ Submit to hackathon

Ready to deploy? 🚀
