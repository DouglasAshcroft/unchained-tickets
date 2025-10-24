# Base Mainnet Deployment Guide

## Overview

This guide walks you through deploying the UnchainedTickets smart contract to Base Mainnet for production use.

**⚠️ WARNING:** This deployment uses **REAL ETH** and cannot be undone. Follow all steps carefully.

---

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] Successfully deployed and tested contract on Base Sepolia testnet
- [ ] Tested complete flow (event creation, purchases, minting) on testnet
- [ ] Generated new mainnet minting wallet (separate from testnet)
- [ ] Access to wallet with 0.05-0.1 ETH on Base Mainnet for deployment
- [ ] BaseScan API key for contract verification
- [ ] Vercel account with project configured
- [ ] Read and understood [VERCEL_ENV_SETUP.md](./VERCEL_ENV_SETUP.md)

---

## Security: Wallet Separation

**❌ DO NOT** reuse your testnet wallet for mainnet!

| Wallet Type | Network | Use Case | Security Level |
|-------------|---------|----------|----------------|
| **Testnet Wallet** | Base Sepolia | Testing, development | Lower (shareable) |
| **Mainnet Minting Wallet** | Base Mainnet | Minting NFTs in production | High (secure storage) |
| **Mainnet Deployer Wallet** | Base Mainnet | Deploying contract | High (can be same as minting) |

**Your Wallet Addresses:**

```bash
# Testnet (Base Sepolia) - Preview/Development
Testnet Minting Wallet: 0x5B33aA418a6d455AADc391841788e8F72Df5ECd9

# Mainnet (Base) - Production
Mainnet Minting Wallet: 0x0792dfF6A79E81bB83280fb8E57E488a2907bbA0
```

---

## Step-by-Step Deployment

### Step 1: Generate Mainnet Minting Wallet (COMPLETED ✅)

You've already generated a new secure wallet:

**Address:** `0x0792dfF6A79E81bB83280fb8E57E488a2907bbA0`

**Private Key:** `0xd34c899e81238a09e2adc43bc922ab8a81d00e281793497ef0bc73c43c2e1205`

**Mnemonic:** `sting cargo direct venture brush oyster cotton tower exact sibling foil throw`

**Security Actions:**
1. ✅ Save private key to password manager (1Password, LastPass, Bitwarden)
2. ✅ Save mnemonic phrase to secure backup (separate from private key)
3. ✅ Label as "Unchained Tickets Mainnet Minting Wallet"
4. ⏳ Add to Vercel (will do in Step 6)

---

### Step 2: Fund Mainnet Wallets

You need TWO funded wallets:

#### 2a. Fund Deployer Wallet (for contract deployment)

**Amount needed:** 0.05-0.1 ETH on Base Mainnet

**Options:**

**Option A: Use your existing wallet**
- If you already have a wallet with ETH on Base Mainnet, you can use that
- Make sure the private key is in your `.env` file as `MINTING_WALLET_PRIVATE_KEY` (we'll update hardhat config to use separate deployer key)

**Option B: Bridge ETH to Base**
1. Go to https://bridge.base.org/
2. Connect your Ethereum wallet
3. Bridge 0.1 ETH from Ethereum to Base Mainnet
4. Wait for confirmation (~5 minutes)
5. Add wallet private key to `.env` as `DEPLOYER_PRIVATE_KEY`

**Option C: Buy ETH directly on Base**
1. Use Coinbase or other exchange
2. Select Base network when withdrawing
3. Send to your deployer address

#### 2b. Fund Minting Wallet (for ongoing minting operations)

**Address:** `0x0792dfF6A79E81bB83280fb8E57E488a2907bbA0`

**Amount needed:** 0.05 ETH on Base Mainnet

**What this covers:**
- ~100 NFT mints: 0.03 ETH
- Gas price spikes buffer: 0.01 ETH
- Granting MINTER_ROLE: 0.001 ETH
- Reserve: 0.009 ETH

**How to fund:**
1. Send **0.05 ETH** to `0x0792dfF6A79E81bB83280fb8E57E488a2907bbA0`
2. **CRITICAL:** Select **Base Mainnet** network (chain ID 8453)
3. **NOT Ethereum mainnet!**
4. Verify transaction: https://basescan.org/address/0x0792dfF6A79E81bB83280fb8E57E488a2907bbA0

**Verification:**
```bash
# Check minting wallet balance
node scripts/generate-mainnet-wallet.mjs
# Or manually check: https://basescan.org/address/0x0792dfF6A79E81bB83280fb8E57E488a2907bbA0
```

---

### Step 3: Update Hardhat Configuration

We need to separate the deployer wallet from the minting wallet.

**Option A:** Update your `.env` file:

```bash
# Add deployer wallet (for contract deployment)
DEPLOYER_PRIVATE_KEY=0xYOUR_DEPLOYER_WALLET_PRIVATE_KEY_HERE

# Keep minting wallet separate (for MINTER_ROLE)
MAINNET_MINTING_PRIVATE_KEY=0xd34c899e81238a09e2adc43bc922ab8a81d00e281793497ef0bc73c43c2e1205
MAINNET_MINTING_ADDRESS=0x0792dfF6A79E81bB83280fb8E57E488a2907bbA0
```

**Option B:** Use same wallet for both (simpler):

```bash
# Use same wallet for deployment and minting
MINTING_WALLET_PRIVATE_KEY=0xd34c899e81238a09e2adc43bc922ab8a81d00e281793497ef0bc73c43c2e1205
MINTING_WALLET_ADDRESS=0x0792dfF6A79E81bB83280fb8E57E488a2907bbA0
```

**Recommended:** Option B (same wallet) for simplicity. Fund the minting wallet with 0.1 ETH to cover both deployment and minting.

---

### Step 4: Deploy Contract to Base Mainnet

**Pre-deployment checklist:**
- [ ] Minting wallet funded with ≥0.1 ETH on Base Mainnet
- [ ] `MINTING_WALLET_PRIVATE_KEY` set in `.env`
- [ ] `BASESCAN_API_KEY` set in `.env`
- [ ] Contract tested successfully on testnet
- [ ] Terminal clear (no other processes running)

**Run deployment:**

```bash
# Deploy to Base Mainnet
npx hardhat run scripts/deploy/deploy-mainnet.cjs --network baseMainnet
```

**What this does:**
1. Checks your wallet balance (minimum 0.05 ETH)
2. Asks for confirmation (type "DEPLOY" to continue)
3. Deploys UnchainedTickets contract
4. Waits for 5 block confirmations
5. Verifies contract on BaseScan
6. Saves deployment info to `deployments/baseMainnet.json`

**Expected output:**
```
🚀 Deploying UnchainedTickets to Base Mainnet...

⚠️  WARNING: You are deploying to MAINNET!
⚠️  This will use REAL ETH and cannot be undone!

📋 Deployment Configuration:
  Network: baseMainnet
  Chain ID: 8453
  Deployer: 0x0792dfF6A79E81bB83280fb8E57E488a2907bbA0
  Balance: 0.1000 ETH
  Base URI: https://unchainedtickets.xyz/api/metadata/

🔴 Are you SURE you want to deploy to MAINNET? Type 'DEPLOY' to continue:
```

**Type:** `DEPLOY` and press Enter.

**Deployment will take ~2-3 minutes.**

**Save the contract address!** It will be displayed and saved to `deployments/baseMainnet.json`.

---

### Step 5: Grant MINTER_ROLE to Minting Wallet

After deployment, the contract deployer (your wallet) has the DEFAULT_ADMIN_ROLE. You need to grant MINTER_ROLE to the minting wallet so it can mint NFTs.

**Check current deployment info:**
```bash
cat deployments/baseMainnet.json
```

**Grant MINTER_ROLE:**

Create a script or use Hardhat console:

```bash
# Using Hardhat console
npx hardhat console --network baseMainnet
```

Then in the console:
```javascript
const contractAddress = "0xYOUR_DEPLOYED_CONTRACT_ADDRESS"
const mintingWallet = "0x0792dfF6A79E81bB83280fb8E57E488a2907bbA0"

const UnchainedTickets = await ethers.getContractFactory("UnchainedTickets")
const contract = UnchainedTickets.attach(contractAddress)

// Get MINTER_ROLE
const MINTER_ROLE = await contract.MINTER_ROLE()
console.log("MINTER_ROLE:", MINTER_ROLE)

// Grant role
const tx = await contract.grantRole(MINTER_ROLE, mintingWallet)
await tx.wait()
console.log("✅ MINTER_ROLE granted to:", mintingWallet)
```

**Verify role was granted:**
```javascript
const hasRole = await contract.hasRole(MINTER_ROLE, mintingWallet)
console.log("Has MINTER_ROLE:", hasRole) // Should be true
```

**Alternative:** Use the grant-minter-role script (if it exists):
```bash
node scripts/grant-minter-role.cjs --network baseMainnet --contract 0xYOUR_CONTRACT --minter 0x0792dfF6A79E81bB83280fb8E57E488a2907bbA0
```

---

### Step 6: Update Vercel Environment Variables

Now that the contract is deployed, update Vercel with production configuration.

**Go to:** [Vercel Dashboard](https://vercel.com/dashboard) → Your Project → Settings → Environment Variables

**Add/Update these variables for PRODUCTION ONLY:**

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_CHAIN_ID` | `8453` | Production |
| `NEXT_PUBLIC_NETWORK` | `mainnet` | Production |
| `NEXT_PUBLIC_DEV_MODE` | `false` | Production |
| `NEXT_PUBLIC_BASE_RPC_URL` | `https://mainnet.base.org` | Production |
| `NFT_CONTRACT_ADDRESS` | `0xYOUR_DEPLOYED_CONTRACT` | Production |
| `NEXT_PUBLIC_NFT_CONTRACT_ADDRESS` | `0xYOUR_DEPLOYED_CONTRACT` | Production |
| `MINTING_PRIVATE_KEY` | `0xd34c899e81238a09e2adc43bc922ab8a81d00e281793497ef0bc73c43c2e1205` | Production |
| `MINTING_WALLET_ADDRESS` | `0x0792dfF6A79E81bB83280fb8E57E488a2907bbA0` | Production |

**IMPORTANT:** Check **ONLY** "Production" environment (uncheck Preview & Development)

**Verification:**
- [ ] All 8 variables added
- [ ] All set to "Production" only
- [ ] Preview/Development still have testnet values (chain ID 84532)

---

### Step 7: Deploy to Vercel Production

**Trigger production deployment:**

**Option A: Push to main branch**
```bash
git add deployments/baseMainnet.json
git commit -m "chore: add mainnet contract deployment"
git push origin main
```

**Option B: Manual redeploy**
1. Go to Vercel Dashboard → Deployments
2. Find latest deployment
3. Click three dots → Redeploy
4. Select "Use existing build cache: No"
5. Click "Redeploy"

**Monitor deployment:**
- Watch deployment logs in Vercel
- Look for errors related to environment variables
- Verify build completes successfully

---

### Step 8: Verify Deployment

#### 8a. Verify Contract on BaseScan

Visit: `https://basescan.org/address/YOUR_CONTRACT_ADDRESS`

**Check:**
- [ ] Contract is verified (green checkmark)
- [ ] Source code is visible
- [ ] Contract has correct name "UnchainedTickets"
- [ ] Deployer address matches your wallet

#### 8b. Verify Environment Configuration

**Run verification script:**
```bash
# Set environment to production temporarily
export VERCEL_ENV=production
export NEXT_PUBLIC_CHAIN_ID=8453
export NEXT_PUBLIC_NETWORK=mainnet
export NFT_CONTRACT_ADDRESS=YOUR_MAINNET_CONTRACT_ADDRESS

node scripts/verify-env-config.mjs
```

**Expected output:**
```
✅ Chain ID: 8453 (Base Mainnet)
✅ Network: mainnet
✅ Dev Mode: false (Real payments)
✅ RPC URL: https://mainnet.base.org
✅ Contract Address: 0xYOUR_CONTRACT_ADDRESS
✅ Smart contract found on chain
```

#### 8c. Verify Minting Wallet Has Role

```bash
npx hardhat console --network baseMainnet
```

```javascript
const contract = await ethers.getContractAt("UnchainedTickets", "YOUR_CONTRACT_ADDRESS")
const MINTER_ROLE = await contract.MINTER_ROLE()
const hasMinterRole = await contract.hasRole(MINTER_ROLE, "0x0792dfF6A79E81bB83280fb8E57E488a2907bbA0")
console.log("Minting wallet has MINTER_ROLE:", hasMinterRole)
```

**Should output:** `true`

---

### Step 9: Test Production Deployment

**⚠️ Test with small amounts first!**

#### Test Checklist:

1. **Create Test Event**
   - [ ] Go to production URL: https://unchainedtickets.xyz
   - [ ] Log in with dev wallet
   - [ ] Create a test event with cheap tickets ($1-5)
   - [ ] Verify event saves to database
   - [ ] Check event appears on events page

2. **Register Event On-Chain**
   - [ ] In event dashboard, click "Register On-Chain"
   - [ ] Verify transaction succeeds on Base Mainnet
   - [ ] Check transaction on BaseScan
   - [ ] Verify `onChainEventId` saved to database

3. **Test Ticket Purchase**
   - [ ] Buy a ticket as a test user
   - [ ] Verify payment processes (use real payment, not mock)
   - [ ] Check NFT mints to buyer's wallet
   - [ ] Verify NFT appears on OpenSea/BaseScan
   - [ ] Check metadata loads correctly

4. **Test Metadata API**
   - [ ] Visit: `https://unchainedtickets.xyz/api/metadata/1`
   - [ ] Verify JSON response with name, description, image
   - [ ] Test with multiple token IDs
   - [ ] Check image URLs work

5. **Monitor Minting Wallet Balance**
   - [ ] Check balance: https://basescan.org/address/0x0792dfF6A79E81bB83280fb8E57E488a2907bbA0
   - [ ] Verify ETH is being used for mints
   - [ ] Set up alert if balance drops below 0.01 ETH

---

## Post-Deployment Tasks

### Monitor and Maintain

**Daily:**
- Check Vercel deployment logs for errors
- Monitor Sentry for exceptions (if configured)
- Check minting wallet balance

**Weekly:**
- Review BaseScan transactions
- Check NFT metadata is loading
- Verify events registering on-chain successfully

**Monthly:**
- Refill minting wallet if balance < 0.02 ETH
- Review gas costs and optimize if needed
- Check for Hardhat/Solidity updates

### Security

- [ ] Remove `.env` files from local machine after deployment
- [ ] Verify mainnet private key stored only in password manager and Vercel
- [ ] Enable 2FA on Vercel account
- [ ] Set up Vercel deployment protection (require approval for production)
- [ ] Review Vercel access logs regularly

### Backup

- [ ] Save `deployments/baseMainnet.json` to secure backup
- [ ] Document contract address in team password manager
- [ ] Keep copy of contract ABI in secure location
- [ ] Save deployment transaction hash

---

## Troubleshooting

### Issue: Deployment fails with "Insufficient funds"

**Solution:**
```bash
# Check deployer wallet balance
npx hardhat console --network baseMainnet
```
```javascript
const [deployer] = await ethers.getSigners()
console.log("Balance:", await ethers.provider.getBalance(deployer.address))
```

Fund wallet with more ETH and retry.

### Issue: Contract verification fails

**Solution:** Manually verify:
```bash
npx hardhat verify --network baseMainnet YOUR_CONTRACT_ADDRESS "https://unchainedtickets.xyz/api/metadata/"
```

### Issue: Minting fails in production

**Checks:**
1. Verify minting wallet has MINTER_ROLE:
   ```bash
   # See Step 8c above
   ```
2. Check minting wallet has ETH for gas
3. Verify Vercel has correct `MINTING_PRIVATE_KEY`
4. Check Vercel logs for error messages

### Issue: Environment variables not switching

**Solution:**
1. Go to Vercel → Settings → Environment Variables
2. Verify production vars are set to "Production" only
3. Verify testnet vars are set to "Preview + Development" only
4. Redeploy production

---

## Rollback Procedure

If you need to rollback to testnet:

1. **In Vercel:**
   - Change `NEXT_PUBLIC_CHAIN_ID` to `84532` (Production)
   - Change `NEXT_PUBLIC_NETWORK` to `testnet` (Production)
   - Change `NEXT_PUBLIC_DEV_MODE` to `true` (Production)
   - Update contract address to testnet address
   - Redeploy

2. **Alternative:** Create new deployment from specific commit:
   - Go to Vercel → Deployments
   - Find last working testnet deployment
   - Click → Redeploy

**Note:** This doesn't delete the mainnet contract, just switches the app back to testnet.

---

## Summary

**What You've Deployed:**

- ✅ New secure mainnet minting wallet generated
- ✅ UnchainedTickets contract deployed to Base Mainnet
- ✅ Contract verified on BaseScan
- ✅ MINTER_ROLE granted to minting wallet
- ✅ Vercel configured with production environment variables
- ✅ Production deployment live on Base Mainnet

**Mainnet Configuration:**

```
Network: Base Mainnet
Chain ID: 8453
Contract: [Your deployed address]
Minting Wallet: 0x0792dfF6A79E81bB83280fb8E57E488a2907bbA0
BaseScan: https://basescan.org/address/[your-contract]
Production URL: https://unchainedtickets.xyz
```

**Next:** Monitor production, test thoroughly, and gradually roll out to users!

---

## Resources

- **Deployment Guide:** This file
- **Environment Setup:** [VERCEL_ENV_SETUP.md](./VERCEL_ENV_SETUP.md)
- **Base Mainnet Docs:** https://docs.base.org/
- **BaseScan:** https://basescan.org/
- **Base Bridge:** https://bridge.base.org/
- **Vercel Docs:** https://vercel.com/docs

---

**Deployment Date:** [To be filled in after deployment]
**Contract Address:** [To be filled in after deployment]
**Deployed By:** [Your name/handle]
