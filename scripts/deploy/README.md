# Contract Deployment Guide

## Quick Start

### 1. Test on Sepolia First (ALWAYS!)

```bash
# Make sure you have testnet ETH
# Get from: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet

# Deploy to Sepolia
npx hardhat run scripts/deploy/deploy-sepolia.cjs --network baseSepolia

# Update .env with the deployed address
# Test minting, metadata, transfers

# If everything works, proceed to mainnet
```

### 2. Deploy to Base Mainnet

```bash
# Ensure wallet has at least 0.05 ETH on Base mainnet
# Deploy to mainnet
npx hardhat run scripts/deploy/deploy-mainnet.cjs --network baseMainnet

# Follow the post-deployment checklist
```

---

## Prerequisites

### Environment Variables Required

```bash
# In .env file:
MINTING_WALLET_PRIVATE_KEY=0xYOUR_PRIVATE_KEY
BASESCAN_API_KEY=YOUR_BASESCAN_API_KEY
NEXT_PUBLIC_BASE_RPC_URL=https://api.developer.coinbase.com/rpc/v1/base/YOUR_KEY
```

### Wallet Requirements

- **Sepolia**: ~0.01 ETH (free from faucet)
- **Mainnet**: ~0.05 ETH (covers deployment + ~100 mints)

---

## Deployment Process

### Phase 1: Sepolia Testing

1. **Get Testnet ETH**
   ```bash
   # Visit: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
   # Enter your wallet address
   # Receive 0.5 ETH on Base Sepolia
   ```

2. **Deploy Contract**
   ```bash
   npx hardhat run scripts/deploy/deploy-sepolia.cjs --network baseSepolia
   ```

3. **Update Environment**
   ```bash
   # Add to .env:
   NFT_CONTRACT_ADDRESS="0xYOUR_DEPLOYED_ADDRESS"
   NEXT_PUBLIC_NETWORK="testnet"
   NEXT_PUBLIC_CHAIN_ID="84532"
   ```

4. **Test Everything**
   - Create test event
   - Buy ticket with testnet wallet
   - Verify NFT mints
   - Check metadata API
   - Test ticket transfer
   - Test perk redemption
   - Verify QR code works

5. **Fix Any Issues**
   - If minting fails, check gas limits
   - If metadata fails, check API endpoint
   - If transfers fail, check contract permissions

### Phase 2: Mainnet Deployment

⚠️ **ONLY proceed if Sepolia tests pass!**

1. **Fund Mainnet Wallet**
   ```bash
   # Send 0.05 ETH to your minting wallet on Base mainnet
   # Check balance: cast balance YOUR_WALLET --rpc-url https://mainnet.base.org
   ```

2. **Deploy to Mainnet**
   ```bash
   npx hardhat run scripts/deploy/deploy-mainnet.cjs --network baseMainnet

   # When prompted, type 'DEPLOY' to confirm
   ```

3. **Update Vercel Environment Variables**
   ```
   Go to: Vercel Dashboard → Your Project → Settings → Environment Variables

   Update these:
   - NFT_CONTRACT_ADDRESS = (new mainnet address)
   - NEXT_PUBLIC_NETWORK = "mainnet"
   - NEXT_PUBLIC_CHAIN_ID = "8453"

   Then: Trigger Redeploy
   ```

4. **Update Local Environment**
   ```bash
   # Update .env with mainnet contract address
   NFT_CONTRACT_ADDRESS="0xYOUR_MAINNET_ADDRESS"
   NEXT_PUBLIC_NETWORK="mainnet"
   NEXT_PUBLIC_CHAIN_ID="8453"
   ```

5. **Add Contract to Database**
   ```bash
   npm run tsx scripts/ops/add-contract-to-db.ts
   ```

6. **Verify on Basescan**
   ```
   Visit: https://basescan.org/address/YOUR_CONTRACT_ADDRESS

   Check:
   - Contract is verified (green checkmark)
   - Source code is visible
   - Read/Write contract tabs work
   ```

7. **Production Test** (Use Small Amount!)
   - Create real event
   - Buy ticket with $1-5
   - Verify NFT mints to buyer
   - Check metadata in wallet (Rainbow, MetaMask, Coinbase Wallet)
   - Verify ticket shows in "My Tickets"

---

## Troubleshooting

### Deployment Fails

**Error: Insufficient funds**
```bash
# Check balance
cast balance YOUR_WALLET --rpc-url https://mainnet.base.org

# Need at least 0.05 ETH
```

**Error: Invalid nonce**
```bash
# Clear Hardhat cache
rm -rf artifacts cache

# Try again
```

**Error: Contract already deployed**
```bash
# Check deployments/baseMainnet.json for existing address
# If you need to redeploy, use a different wallet or wait
```

### Verification Fails

```bash
# Manually verify on Basescan
npx hardhat verify --network baseMainnet YOUR_CONTRACT_ADDRESS "https://unchainedtickets.xyz/api/metadata/"
```

### Minting Fails in Production

1. **Check Contract Address**
   ```bash
   # Verify it matches Vercel env var
   echo $NFT_CONTRACT_ADDRESS
   ```

2. **Check Wallet Balance**
   ```bash
   # Minting wallet needs ETH for gas
   cast balance YOUR_MINTING_WALLET --rpc-url https://mainnet.base.org
   ```

3. **Check RPC URL**
   ```bash
   # Make sure Coinbase Developer Platform CDP key is valid
   # Check: https://portal.cdp.coinbase.com/
   ```

4. **Check Contract Permissions**
   ```bash
   # Ensure minting wallet is contract owner
   cast call YOUR_CONTRACT "owner()" --rpc-url https://mainnet.base.org
   ```

---

## Post-Deployment Checklist

- [ ] Contract deployed and verified on Basescan
- [ ] Vercel environment variables updated
- [ ] Local .env updated
- [ ] Contract added to database
- [ ] Test event created successfully
- [ ] Test purchase completed ($1-5)
- [ ] NFT minted and visible in wallet
- [ ] Metadata displays correctly
- [ ] QR code generates
- [ ] Ticket shows in "My Tickets"
- [ ] Basescan link works
- [ ] OpenSea collection visible (may take 24 hours)

---

## Deployment Artifacts

Deployment info is saved to:
```
deployments/
├── baseSepolia.json    # Testnet deployment
└── baseMainnet.json    # Production deployment
```

Each file contains:
- Contract address
- Deployer address
- Transaction hash
- Block number
- Gas used
- Basescan URL
- Timestamp

---

## Emergency Procedures

### If Something Goes Wrong

1. **Stop Taking Orders**
   - Pause event sales in admin dashboard
   - Set all events to "draft" status

2. **Investigate**
   - Check Vercel function logs
   - Check Basescan for failed transactions
   - Check minting wallet balance

3. **Rollback Options**
   - Can't undo contract deployment
   - Can update Vercel to use old contract
   - Can refund failed orders via Coinbase Commerce

4. **Contact Support**
   - Base Discord: https://discord.gg/buildonbase
   - Coinbase Commerce: commerce.coinbase.com/support
   - OpenZeppelin: forum.openzeppelin.com

---

## Production Monitoring

### Key Metrics to Watch

1. **Gas Costs**
   ```bash
   # Check current gas prices
   cast gas-price --rpc-url https://mainnet.base.org
   ```

2. **Minting Success Rate**
   - Monitor Vercel function logs
   - Check `/api/webhooks/coinbase` success rate

3. **Wallet Balance**
   ```bash
   # Alert if balance drops below 0.01 ETH
   cast balance YOUR_MINTING_WALLET --rpc-url https://mainnet.base.org
   ```

4. **Contract Health**
   - Check Basescan for failed transactions
   - Monitor event emissions
   - Track total minted vs capacity

---

## Useful Commands

```bash
# Check contract info
cast call CONTRACT_ADDRESS "name()" --rpc-url https://mainnet.base.org

# Check total supply
cast call CONTRACT_ADDRESS "totalSupply(uint256)" 1000001 --rpc-url https://mainnet.base.org

# Check token URI
cast call CONTRACT_ADDRESS "uri(uint256)" 1000001 --rpc-url https://mainnet.base.org

# Check owner
cast call CONTRACT_ADDRESS "owner()" --rpc-url https://mainnet.base.org
```
