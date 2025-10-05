# Development Mode Guide

## Overview

The Unchained Tickets app now supports **Development Mode** for testing and demos without requiring wallet connections, API keys, or real blockchain payments.

---

## Quick Start

### Enable Development Mode

Set in `.env`:
```bash
NEXT_PUBLIC_DEV_MODE=true
```

### Disable for Production

Set in `.env`:
```bash
NEXT_PUBLIC_DEV_MODE=false
```

---

## Features

### ✅ Mock Payment Flow
- No wallet connection required
- No OnchainKit API key needed
- Simulates successful payments
- 2-second processing animation
- Stores tickets in browser localStorage

### ✅ Ticket Persistence
- Tickets saved to localStorage
- Persists across page refreshes
- Multiple tickets per purchase
- Unique QR codes per ticket

### ✅ Complete Demo Flow
1. Browse events → Select event
2. Choose tier & quantity
3. Click "Purchase Tickets"
4. Click "🧪 Simulate Payment (Dev Mode)"
5. 2-second loading animation
6. Auto-redirect to My Tickets
7. View tickets with QR codes

---

## Testing Instructions

### Test Complete Purchase Flow

1. **Start dev server** (if not running):
   ```bash
   npm run dev
   ```

2. **Navigate to Events**:
   - Go to http://localhost:3000/events
   - Click on any event

3. **Configure Purchase**:
   - Select tier (General Admission $25 or VIP $75)
   - Choose quantity (1-8 tickets)
   - Click "Purchase {N} Ticket(s)"

4. **Simulate Payment**:
   - Review order summary in modal
   - Click "🧪 Simulate Payment (Dev Mode)" button
   - Wait 2 seconds for animation
   - See success toast

5. **View Tickets**:
   - Auto-redirected to My Tickets page
   - See newly purchased tickets
   - Click "Show QR Code" on any ticket
   - Present QR code for "venue entry"

### Clear Test Data

To start fresh:
```javascript
// In browser console
localStorage.clear();
```

Or programmatically:
```javascript
localStorage.removeItem('unchained_purchases');
```

---

## What's Different in Dev Mode

| Feature | Development Mode | Production Mode |
|---------|------------------|-----------------|
| **Wallet** | Not required | Required (wagmi) |
| **Payments** | Mock/simulated | Real USDC on Base |
| **API Key** | Not required | OnchainKit API key required |
| **Tickets** | localStorage | Blockchain NFTs |
| **Button Text** | "🧪 Simulate Payment" | "Pay with Coinbase" |
| **Storage** | Browser localStorage | Base blockchain |

---

## File Changes

### Modified Files

**`.env`**
```bash
NEXT_PUBLIC_DEV_MODE=true
```

**`components/CheckoutModal.tsx`**
- Checks `NEXT_PUBLIC_DEV_MODE` flag
- Dev mode: Shows mock payment button
- Prod mode: Shows OnchainKit Checkout
- Saves purchases to localStorage in dev mode

**`app/my-tickets/page.tsx`**
- Loads tickets from localStorage (dev mode)
- Loads from blockchain (prod mode)
- No wallet prompt in dev mode
- Shows dev mode indicator

**`app/api/checkout/create-charge/route.ts`**
- Already returns mock data (no changes needed)

---

## localStorage Data Structure

### Purchases Storage

Key: `unchained_purchases`

Format:
```json
[
  {
    "id": "charge_1728123456_abc123xyz",
    "eventId": 1,
    "eventTitle": "Metal Fest 2025",
    "tier": "VIP",
    "quantity": 2,
    "totalPrice": 150,
    "transactionId": "charge_1728123456_abc123xyz",
    "purchasedAt": "2025-10-04T12:34:56.789Z"
  }
]
```

### Generated Tickets

Each purchase generates `quantity` tickets:
```javascript
{
  id: "charge_1728123456_abc123xyz-0",
  eventId: 1,
  eventTitle: "Metal Fest 2025",
  eventDate: "2025-11-03T12:34:56.789Z", // 30 days from purchase
  venue: "Local Venue",
  tier: "VIP",
  tokenId: "charge_1728...0",
  qrCode: "TICKET-VIP-1-charge_1728123456_abc123xyz-0",
  status: "active"
}
```

---

## Production Deployment

When ready to deploy to production:

### 1. Disable Dev Mode
```bash
NEXT_PUBLIC_DEV_MODE=false
```

### 2. Set Up Required Keys

See [developerTODO.md](developerTODO.md) for complete checklist:
- Obtain OnchainKit API key from CDP
- Deploy NFT smart contract on Base
- Configure Coinbase Commerce webhooks
- Set up production database
- Configure backend wallet for minting

### 3. Test Production Flow
- Connect wallet with test funds
- Purchase with real USDC on Base testnet
- Verify NFT minting
- Check blockchain transaction

---

## Troubleshooting

### Tickets Not Showing

**Issue**: Purchased tickets don't appear on My Tickets page

**Solution**:
1. Check browser console for errors
2. Verify `NEXT_PUBLIC_DEV_MODE=true` in `.env`
3. Check localStorage in browser DevTools:
   - Open DevTools → Application → Local Storage
   - Look for `unchained_purchases` key
4. Restart dev server after changing `.env`

### Payment Button Not Working

**Issue**: "Simulate Payment" button does nothing

**Solution**:
1. Check browser console for errors
2. Verify dev server is running
3. Check that `/api/checkout/create-charge` endpoint is accessible
4. Try clearing localStorage and retry

### Wrong Payment UI Showing

**Issue**: Seeing OnchainKit button instead of "Simulate Payment"

**Solution**:
1. Verify `.env` has `NEXT_PUBLIC_DEV_MODE=true`
2. Restart dev server (Next.js caches env variables)
3. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

---

## Demo Script

Perfect for presentations and demos:

1. **Show Events Page**
   - "Here's our upcoming events catalog"
   - "Each event shows date, venue, and available tickets"

2. **Select Event**
   - "Let's buy tickets to this show"
   - "We can choose between General Admission and VIP"

3. **Configure Purchase**
   - "I'll get 2 VIP tickets"
   - "Total is $150 USDC on Base blockchain"

4. **Simulate Payment**
   - "In dev mode, we can simulate the payment"
   - "This would normally connect your Coinbase wallet"
   - "Processing... and success!"

5. **Show Tickets**
   - "Now I can view my NFT tickets"
   - "Each ticket has a unique QR code"
   - "At the venue, staff scan this to verify and admit"

---

## Next Steps

- [x] Development mode implementation
- [ ] Deploy NFT smart contract (see [developerTODO.md](developerTODO.md))
- [ ] Integrate Coinbase Commerce API
- [ ] Set up payment webhooks
- [ ] Implement NFT minting on payment confirmation
- [ ] Production deployment

---

**Questions?** Check [developerTODO.md](developerTODO.md) for production requirements or see [PHASE3_COMPLETE.md](PHASE3_COMPLETE.md) for feature documentation.
