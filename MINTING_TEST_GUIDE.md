# NFT Minting Test Guide

## Your Wallet Setup ✅

- **Minting Wallet** (pays gas): `0x5B33aA418a6d455AADc391841788e8F72Df5ECd9`
  - Funded with testnet ETH
  - Private key in `.env` (line 10)
  - Used by backend to mint NFTs

- **Your Connected Wallet** (receives NFTs):
  - Connect via Coinbase Wallet extension
  - Will receive the NFT tickets
  - This is YOUR wallet that you control

---

## Testing Steps

### 1. Connect Your Wallet
1. Open http://localhost:3000
2. Click "Connect Wallet" button
3. Select "Coinbase Wallet" from the modal
4. Approve connection in extension
5. Verify your address shows in navbar

### 2. Purchase a Ticket
1. Go to Events page
2. Click on any event
3. Select ticket tier (GA or VIP)
4. Choose quantity (1-8)
5. Click "Purchase Tickets"

### 3. Mint the NFT
1. Modal opens with order summary
2. Click "🎫 Purchase & Mint NFT Ticket"
3. **Wait for blockchain transaction** (~10-30 seconds)
4. Success toast appears with transaction hash
5. Modal closes automatically

### 4. View Your NFT

**In the App:**
- Go to "My Tickets" page (if implemented)
- See your minted ticket with token ID

**On Block Explorer:**
1. Get your connected wallet address
2. Go to: https://sepolia.basescan.org/address/[YOUR_ADDRESS]
3. Click "Tokens" tab
4. See your NFT ticket

**Check Transaction:**
- Console will log: `✅ NFT minted successfully: { txHash, tokenId }`
- Visit: https://sepolia.basescan.org/tx/[TX_HASH]
- See minting transaction details

---

## Expected Console Output

```
🧪 DEV MODE: Creating mock charge and minting NFT ticket...
Minting ticket for event 1, tier 1, to 0x[YOUR_ADDRESS]...
✅ NFT minted successfully: {
  txHash: '0x123abc...',
  tokenId: '1'
}
```

---

## Troubleshooting

### "Insufficient funds for gas"
**Cause:** Minting wallet ran out of testnet ETH

**Fix:**
1. Check minting wallet balance: https://sepolia.basescan.org/address/0x5B33aA418a6d455AADc391841788e8F72Df5ECd9
2. Use faucet to add more: https://portal.cdp.coinbase.com/products/faucet
3. Retry purchase

### "Wallet not connected"
**Cause:** Coinbase Wallet extension not connected

**Fix:**
1. Click "Connect Wallet" in navbar
2. Select Coinbase Wallet
3. Approve connection
4. Retry purchase

### "Contract not found" or "Contract call error"
**Cause:** NFT contract may not be deployed or address is wrong

**Fix:**
1. Verify contract address in `.env`: `NFT_CONTRACT_ADDRESS`
2. Check contract on BaseScan: https://sepolia.basescan.org/address/[CONTRACT_ADDRESS]
3. Ensure contract is verified and deployed

### Transaction Takes Forever
**Cause:** Network congestion or RPC issues

**Fix:**
1. Wait 1-2 minutes
2. Check Base Sepolia network status
3. If timeout, retry the purchase

---

## What Gets Created

### Database Records:
- **Ticket** record (status: 'minted')
- **NFTMint** record (txHash, tokenId, ownerWalletId)
- **Wallet** record (your connected address)

### Blockchain:
- **ERC-721/1155 NFT** minted to your address
- **Transaction** recorded on Base Sepolia
- **Event logs** with TicketMinted event

### Response:
```json
{
  "chargeId": "mock-123",
  "ticketId": 123,
  "tokenId": "1",
  "txHash": "0x123abc...",
  "status": "completed",
  "message": "Mock charge created and NFT minted successfully"
}
```

---

## Verify Everything Worked

### ✅ Checklist:
- [ ] Wallet connected successfully
- [ ] Purchase button enabled
- [ ] Transaction approved in extension
- [ ] Console shows success message
- [ ] Transaction hash appears
- [ ] Token ID received
- [ ] NFT visible on BaseScan
- [ ] Database record created

### View NFT Metadata:
Once minted, you can view the NFT:
- **OpenSea Testnet**: https://testnets.opensea.io/assets/base-sepolia/[CONTRACT_ADDRESS]/[TOKEN_ID]
- **BaseScan**: https://sepolia.basescan.org/token/[CONTRACT_ADDRESS]?a=[TOKEN_ID]

---

## Gas Costs

- **Per mint**: ~0.0001-0.0005 ETH (~$0.30-$1.50 on mainnet)
- **Testnet**: Free (uses testnet ETH)
- **Who pays**: Minting wallet (`0x5B33...ECd9`)
- **Who receives**: Your connected wallet

---

## Next Steps After Testing

Once minting works:
1. Test with multiple tickets (quantity > 1)
2. Test with different tiers (GA vs VIP)
3. Verify ticket status updates in database
4. Check NFT metadata shows correct event info
5. Test transfer restrictions (if implemented)

---

## Production Considerations

Before going live:
- [ ] Deploy new smart contract to Base mainnet
- [ ] Generate new minting wallet (don't use testnet wallet)
- [ ] Fund minting wallet with real ETH (~0.1 ETH = $300)
- [ ] Update contract address in `.env`
- [ ] Change `NEXT_PUBLIC_CHAIN_ID` to `8453` (Base mainnet)
- [ ] Set `NEXT_PUBLIC_DEV_MODE=false`
- [ ] Test with small amounts first

---

**Ready to mint!** 🎫🔗

Connect your wallet at http://localhost:3000 and try purchasing a ticket!
