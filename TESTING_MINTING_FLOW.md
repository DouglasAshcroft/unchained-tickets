# Testing NFT Minting Flow on Base Sepolia Testnet

This guide walks you through testing the complete NFT minting flow from purchase to souvenir transformation.

## Prerequisites

### 1. Environment Setup

Your `.env` file should have these values configured:

```env
# Testnet Configuration
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_BASE_RPC_URL="https://api.developer.coinbase.com/rpc/v1/base/bLrd4jUzZLpBkX1C7BrU0KHk1QWFOPSF"
NFT_CONTRACT_ADDRESS="0xC37Ca890666a8F637484a45aA5F436ce553d49e6"

# Minting Wallet (Base Sepolia Testnet)
MINTING_WALLET_PRIVATE_KEY="0xc2d4c6b6adfdeba5a4a8c73d8e908aa0fdcd3da03f4ac0cde264064aeac2f068"
MINTING_WALLET_ADDRESS="0x5B33aA418a6d455AADc391841788e8F72Df5ECd9"

# Development Mode (true = mock payments, false = real payments)
NEXT_PUBLIC_DEV_MODE=true

# Database
DATABASE_URL="postgresql://unchained:unchained@localhost:5433/unchained?schema=public"
```

### 2. Required Tools

- **Wallet**: Coinbase Wallet, MetaMask, or Rainbow Wallet
- **Testnet Funds**: Base Sepolia ETH for gas (get from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet))
- **Database**: PostgreSQL running (Docker container)

### 3. Start the Application

```bash
# Make sure database is running
npm run start:db

# Start development server
npm run dev
```

The app should be running at `http://localhost:3000`

---

## Test Flow 1: End-to-End Purchase → Mint → Scan → Souvenir

### Step 1: Browse and Select Event

1. Navigate to `http://localhost:3000/events`
2. Browse available events
3. Click on any event to view details
4. Note the **Event ID** from the URL (e.g., `/events/5` → Event ID is `5`)

### Step 2: Connect Wallet (Development Mode)

Since `NEXT_PUBLIC_DEV_MODE=true`, wallet connection is optional for purchase testing.

If you want to test with a real wallet:
1. Click "Connect Wallet" in the navbar
2. Connect with Coinbase Wallet or MetaMask
3. Ensure you're on Base Sepolia network (Chain ID: 84532)

### Step 3: Purchase Ticket (Dev Mode)

With dev mode enabled, the payment flow is mocked:

1. On the event detail page, click **"Get Tickets"**
2. Select ticket type (GA, VIP, Premium, etc.)
3. Select quantity
4. Click **"Purchase"**
5. In dev mode, you'll see a mock checkout
6. The purchase will be stored in `localStorage`
7. Note your **wallet address** (you'll need this for minting)

### Step 4: Manually Trigger Minting

Since we're in dev mode with mock payments, we need to manually trigger the minting process.

**Option A: Via API Call**

Open your browser console and run:

```javascript
// Replace these values
const ticketId = 'ticket-uuid-from-database'; // Get from database
const walletAddress = '0xYourWalletAddress';
const eventId = 5; // Your event ID
const tierId = 0; // 0=GA, 1=VIP, 2=Premium

// Call the minting service
fetch('/api/test/mint', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ticketId,
    walletAddress,
    eventId,
    tierId,
    section: 'GA',
    row: 'A',
    seat: '10'
  })
}).then(r => r.json()).then(console.log);
```

**Option B: Create a Test Script**

Create `scripts/test-mint.ts`:

```typescript
import { mintTicket } from '@/lib/services/NFTMintingService';
import type { Address } from 'viem';

const testMint = async () => {
  const result = await mintTicket({
    eventId: 5, // Replace with your event ID
    tierId: 0, // 0=GA, 1=VIP, 2=Premium
    recipient: '0xYourWalletAddress' as Address,
    section: 'GA',
    row: 'A',
    seat: '10',
  });

  console.log('Mint Result:', result);

  if (result.success) {
    console.log('✅ NFT Minted!');
    console.log(`Token ID: ${result.tokenId}`);
    console.log(`Transaction: https://sepolia.basescan.org/tx/${result.transactionHash}`);
  } else {
    console.error('❌ Minting failed:', result.error);
  }
};

testMint();
```

Run it:
```bash
npx tsx scripts/test-mint.ts
```

### Step 5: Verify Minting

**Check Transaction on BaseScan:**
1. Go to `https://sepolia.basescan.org/tx/{transactionHash}`
2. Verify the transaction succeeded
3. Check the "Logs" tab for the `TicketMinted` event

**Check Database:**
```sql
SELECT
  c.id,
  c."chargeId",
  c.status,
  c."mintedTokenId",
  c."transactionHash",
  t.id as ticket_id,
  t.status as ticket_status
FROM "Charge" c
LEFT JOIN "Ticket" t ON c."ticketId" = t.id
WHERE c."mintedTokenId" IS NOT NULL
ORDER BY c."createdAt" DESC
LIMIT 5;
```

**Check NFT Metadata:**
```bash
curl http://localhost:3000/api/metadata/{tokenId}
```

You should see JSON with:
- `name`: Event name
- `image`: Poster image URL
- `attributes`: Including "On-Chain State: Active"

### Step 6: View Ticket in My Tickets Page

1. Navigate to `http://localhost:3000/my-tickets`
2. You should see your ticket with:
   - Event details
   - **Active** badge
   - **Show QR Code** button
   - Perks (if VIP/Premium tier)
3. Click **"Show QR Code"** to reveal the QR code

### Step 7: Test Ticket Scanning

**Create a test scan:**

```javascript
// In browser console or via API tool
const ticketId = 'your-ticket-id'; // From database
const walletAddress = '0xYourWalletAddress';

fetch('/api/tickets/validate', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ticketId,
    walletAddress,
    transformToSouvenir: true
  })
}).then(r => r.json()).then(console.log);
```

Expected response:
```json
{
  "success": true,
  "ticket": {
    "id": "ticket-uuid",
    "eventId": 5,
    "eventName": "Event Title",
    "status": "used"
  },
  "transactionHash": "0x...",
  "souvenirMetadataUrl": "/api/metadata/12345678",
  "message": "Ticket scanned successfully - entry approved"
}
```

**Verify on BaseScan:**
- Check the `useTicket` transaction
- Verify the ticket state changed from ACTIVE → SOUVENIR

### Step 8: View Souvenir NFT

1. Refresh `http://localhost:3000/my-tickets`
2. Your ticket should now display:
   - **🎨 Souvenir** badge
   - Poster image (instead of QR code)
   - "Event Memento" section
   - Text: "Your ticket has been transformed into a collectible souvenir NFT"

**Check Updated Metadata:**
```bash
curl http://localhost:3000/api/metadata/{tokenId}
```

You should see:
- `name`: "Event Name - Collectible Ticket"
- `description`: Mentions "commemorative NFT"
- `attributes`: "On-Chain State: Souvenir"

---

## Test Flow 2: Testing with Real Coinbase Commerce Webhook

To test the full webhook flow with real payments:

### Step 1: Set Up Coinbase Commerce Webhook

1. Go to [Coinbase Commerce Dashboard](https://commerce.coinbase.com/)
2. Navigate to Settings → Webhook subscriptions
3. Add webhook URL: `https://your-ngrok-url.ngrok.io/api/webhooks/coinbase`
4. Copy the webhook secret to `.env`:
   ```env
   COINBASE_WEBHOOK_SECRET=your_webhook_secret
   ```

### Step 2: Expose Local Server

```bash
# Install ngrok if needed
npm install -g ngrok

# Expose port 3000
ngrok http 3000
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

### Step 3: Create Test Charge

```javascript
// Create a charge via API
fetch('/api/checkout/create-charge', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    eventId: 5,
    ticketTypeId: 1,
    quantity: 1,
    walletAddress: '0xYourWalletAddress',
    email: 'test@example.com'
  })
}).then(r => r.json()).then(data => {
  console.log('Charge created:', data);
  // Open the hosted_url to complete payment
  window.open(data.hosted_url, '_blank');
});
```

### Step 4: Complete Payment

1. Open the Coinbase Commerce checkout page
2. Send testnet crypto (use Base Sepolia testnet)
3. Wait for confirmation

### Step 5: Monitor Webhook

Watch your server logs:
```bash
# In terminal running npm run dev
# You should see:
[Webhook] Attempting to mint NFT for ticket: ticket-uuid
[NFTMintingService] Minting ticket: {...}
[NFTMintingService] Transaction sent: 0x...
[Webhook] Successfully minted NFT: {...}
```

### Step 6: Verify Everything

Check that:
1. ✅ Charge status updated to `confirmed`
2. ✅ `mintedTokenId` stored in database
3. ✅ `transactionHash` recorded
4. ✅ Ticket appears in My Tickets page
5. ✅ Metadata API returns correct data

---

## Test Flow 3: Batch Souvenir Transformation (Post-Event)

After an event ends, venue admins can batch-transform all used tickets to souvenirs.

### Step 1: Create Multiple Used Tickets

Repeat the scan process for several tickets (or update database directly):

```sql
-- Mark tickets as used
UPDATE "Ticket"
SET status = 'used'
WHERE "eventId" = 5 AND status = 'minted';
```

### Step 2: Run Batch Transform Script

Create `scripts/test-batch-transform.ts`:

```typescript
import { batchTransformToSouvenirs } from '@/lib/services/NFTMintingService';
import { prisma } from '@/lib/db/prisma';

const batchTransform = async (eventId: number) => {
  // Get all minted tickets for event
  const charges = await prisma.charge.findMany({
    where: {
      ticket: { eventId },
      mintedTokenId: { not: null },
    },
    select: { mintedTokenId: true },
  });

  const tokenIds = charges
    .map(c => c.mintedTokenId)
    .filter(Boolean)
    .map(id => BigInt(id!));

  console.log(`Transforming ${tokenIds.length} tickets to souvenirs...`);

  const result = await batchTransformToSouvenirs(tokenIds);

  if (result.success) {
    console.log('✅ Batch transformation successful!');
    console.log(`Transaction: https://sepolia.basescan.org/tx/${result.transactionHash}`);
  } else {
    console.error('❌ Batch transformation failed:', result.error);
  }
};

batchTransform(5); // Replace with your event ID
```

Run:
```bash
npx tsx scripts/test-batch-transform.ts
```

---

## Verification Checklist

### On-Chain Verification

- [ ] Contract deployed at `0xC37Ca890666a8F637484a45aA5F436ce553d49e6`
- [ ] Minting wallet has ETH for gas
- [ ] Mint transaction succeeds on BaseScan
- [ ] Token ID is emitted in `TicketMinted` event
- [ ] `useTicket` transaction changes state to SOUVENIR
- [ ] `getTicketState()` returns correct state (0=ACTIVE, 1=USED, 2=SOUVENIR)

### Database Verification

```sql
-- Check charges with minted tokens
SELECT
  c.id,
  c."chargeId",
  c.status,
  c."mintedTokenId",
  c."transactionHash",
  c."mintRetryCount",
  c."mintLastError",
  t.status as ticket_status
FROM "Charge" c
LEFT JOIN "Ticket" t ON c."ticketId" = t.id
ORDER BY c."createdAt" DESC
LIMIT 10;

-- Check ticket scans
SELECT
  ts.id,
  ts."ticketId",
  ts."scannedAt",
  ts.result,
  t.status,
  t."eventId"
FROM "TicketScan" ts
JOIN "Ticket" t ON ts."ticketId" = t.id
ORDER BY ts."scannedAt" DESC
LIMIT 10;
```

### Frontend Verification

- [ ] My Tickets page loads without errors
- [ ] Active tickets show QR code
- [ ] Souvenir tickets show poster image and "Event Memento" badge
- [ ] On-chain state badge displays correctly
- [ ] Perks display for VIP/Premium tickets
- [ ] Metadata API returns correct JSON

### API Verification

Test all endpoints:

```bash
# Health check
curl http://localhost:3000/api/health

# Get event
curl http://localhost:3000/api/events/5

# Get metadata (replace tokenId)
curl http://localhost:3000/api/metadata/5000001

# Validate ticket (replace ticketId)
curl "http://localhost:3000/api/tickets/validate?ticketId=ticket-uuid"

# Scan ticket
curl -X PATCH http://localhost:3000/api/tickets/validate \
  -H "Content-Type: application/json" \
  -d '{
    "ticketId": "ticket-uuid",
    "walletAddress": "0xYourAddress",
    "transformToSouvenir": true
  }'
```

---

## Common Issues & Troubleshooting

### Issue: "NEXT_PUBLIC_CONTRACT_ADDRESS is not set"

**Fix:** Update `NFTMintingService.ts` line 18 to check both env vars:
```typescript
const CONTRACT_ADDRESS = (process.env.NFT_CONTRACT_ADDRESS || process.env.NEXT_PUBLIC_CONTRACT_ADDRESS) as Address;
```

✅ **Already fixed in this session**

### Issue: "Insufficient funds for gas"

**Solution:**
1. Get testnet ETH from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
2. Send to minting wallet: `0x5B33aA418a6d455AADc391841788e8F72Df5ECd9`
3. Check balance:
   ```bash
   cast balance 0x5B33aA418a6d455AADc391841788e8F72Df5ECd9 --rpc-url https://sepolia.base.org
   ```

### Issue: "Ticket not found" or "Wallet does not own this ticket"

**Solution:**
1. Verify ticket exists in database
2. Check that `mintedTokenId` is set in `Charge` table
3. Verify wallet address matches the recipient address used in minting

### Issue: "Transaction simulation failed"

**Possible causes:**
1. Event not created on-chain (contract needs initialization)
2. Tier not configured
3. Max supply reached
4. Insufficient gas

**Solution:**
Create events and tiers on-chain (see Phase 2.2 in roadmap)

### Issue: Metadata returns 404

**Solution:**
1. Check that event exists in database
2. Token ID format should be: `eventId * 1000000 + counter`
3. Example: Event 5, Token 1 = `5000001`

---

## Quick Test Commands

```bash
# Check minting wallet balance
cast balance 0x5B33aA418a6d455AADc391841788e8F72Df5ECd9 --rpc-url https://sepolia.base.org

# Get ticket state
cast call 0xC37Ca890666a8F637484a45aA5F436ce553d49e6 \
  "getTicketState(uint256)(uint8)" 5000001 \
  --rpc-url https://sepolia.base.org

# Check if wallet owns ticket
cast call 0xC37Ca890666a8F637484a45aA5F436ce553d49e6 \
  "balanceOf(address,uint256)(uint256)" \
  0xYourWalletAddress 5000001 \
  --rpc-url https://sepolia.base.org
```

---

## Next Steps After Testing

Once testing is successful:

1. ✅ Deploy contract to **Base Mainnet** (Phase 2.1)
2. ✅ Initialize events and tiers on mainnet (Phase 2.2)
3. ✅ Set up production environment variables
4. ✅ Deploy to Vercel (Phase 3)
5. ✅ Conduct full end-to-end testing on production

---

## Support

If you encounter issues:
1. Check server logs: `npm run dev` console output
2. Check BaseScan for transaction details
3. Verify database state with SQL queries above
4. Review environment variables in `.env`

Good luck testing! 🚀
