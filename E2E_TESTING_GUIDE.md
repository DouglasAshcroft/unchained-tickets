# End-to-End Testing Guide

Comprehensive testing checklist and procedures for Unchained Tickets.

## Overview

**Time**: 6-8 hours
**Goal**: Verify all critical user flows work correctly
**Environment**: Production (or staging that mirrors production)

---

## Pre-Testing Setup

### 1. Test Environment Checklist

- [ ] Application deployed and accessible
- [ ] Database has test events
- [ ] Smart contract deployed (testnet or mainnet)
- [ ] Wallet with test funds available
- [ ] All environment variables configured
- [ ] Monitoring enabled (Sentry)

### 2. Test Wallets

Create 3 test wallets for different scenarios:

**Wallet 1: Buyer**
- Purpose: Purchase tickets
- Needs: Small amount of ETH/USDC for testing

**Wallet 2: Scanner (Venue Staff)**
- Purpose: Scan tickets at venue
- Needs: No funds required

**Wallet 3: Secondary Buyer**
- Purpose: Test resale/transfers
- Needs: Small amount for gas

### 3. Test Data

Ensure database has:
- [ ] 5+ published events
- [ ] Multiple ticket tiers (GA, VIP, Premium)
- [ ] Events with different dates (past, present, future)
- [ ] Multiple venues and artists

---

## Test Suite 1: Core User Flows (Critical)

### 1.1 Homepage & Navigation

**Test Steps:**
1. Open homepage: `https://YOUR_DOMAIN.com`
2. Verify page loads within 3 seconds
3. Check all navigation links work:
   - [ ] Events
   - [ ] Artists
   - [ ] Venues
   - [ ] My Tickets
4. Verify responsive design (mobile/tablet/desktop)
5. Check that images load correctly

**Expected Result:**
- Homepage loads fast
- No 404 errors
- Mobile layout adapts
- Images display

---

### 1.2 Browse Events

**Test Steps:**
1. Navigate to `/events`
2. Verify events list loads
3. Test filters:
   - [ ] Search by name
   - [ ] Filter by genre
   - [ ] Filter by city
   - [ ] Filter by date range
4. Click on event card

**Expected Result:**
- All events display
- Filters work
- Search returns relevant results
- Event cards clickable

**Test Data:**
```javascript
// Test search terms
["Rock", "Jazz", "Concert", "Festival"]

// Test cities
["New York", "Los Angeles", "Chicago"]

// Test date filters
["This Week", "This Month", "All Upcoming"]
```

---

### 1.3 Event Detail Page

**Test Steps:**
1. Navigate to `/events/{id}`
2. Verify all information displays:
   - [ ] Event title
   - [ ] Date and time
   - [ ] Venue name and location
   - [ ] Artists
   - [ ] Description
   - [ ] Poster image
   - [ ] Ticket types and prices
3. Check "Get Tickets" button is visible

**Expected Result:**
- All event details display
- Images load
- Ticket types listed
- CTA button present

---

### 1.4 Wallet Connection

**Test Steps:**
1. Click "Connect Wallet" in navbar
2. Test with different wallets:
   - [ ] Coinbase Wallet
   - [ ] MetaMask
   - [ ] Rainbow Wallet
3. Verify network switches to Base (Chain ID: 8453)
4. Check wallet address displays correctly
5. Test disconnect

**Expected Result:**
- Wallet connects successfully
- Network auto-switches
- Address displayed: `0x1234...5678`
- Can disconnect

**Error Cases:**
- Wrong network → Should prompt to switch
- No wallet installed → Shows install prompt
- User rejects → Shows friendly error

---

### 1.5 Purchase Flow (CRITICAL)

**Test Steps:**

#### A. Select Tickets
1. On event detail page, click "Get Tickets"
2. Select ticket type (GA, VIP, Premium)
3. Select quantity (1-5)
4. Verify price calculation updates

#### B. Checkout
1. Click "Checkout" or "Purchase"
2. Coinbase Commerce modal opens
3. Review order summary:
   - [ ] Event name
   - [ ] Ticket type
   - [ ] Quantity
   - [ ] Total price
4. Select payment method (ETH/USDC/Card)

#### C. Payment
1. Complete payment:
   - **Crypto**: Send from wallet
   - **Card**: Use test card (if available)
2. Wait for confirmation

#### D. Verification
1. Check webhook processes payment:
   - Monitor Vercel logs: `/api/webhooks/coinbase`
   - Should see: `[Webhook] Successfully minted NFT`
2. Verify database updated:
   ```sql
   SELECT * FROM "Charge"
   WHERE "walletAddress" = 'YOUR_WALLET'
   ORDER BY "createdAt" DESC LIMIT 1;
   ```
3. Check NFT minted:
   - Transaction hash present
   - Token ID recorded

**Expected Result:**
- Payment completes
- Webhook processes within 30 seconds
- NFT mints to wallet
- No errors in logs

**Performance:**
- Checkout opens: < 1 second
- Payment confirmation: < 30 seconds
- NFT minting: < 2 minutes

---

### 1.6 My Tickets Page

**Test Steps:**
1. Navigate to `/my-tickets`
2. Verify ticket displays:
   - [ ] Event name
   - [ ] Date and venue
   - [ ] Ticket tier
   - [ ] Token ID
   - [ ] Status badge (Active/Used/Souvenir)
3. Click "Show QR Code"
4. Verify QR code generates
5. Check perks section (if VIP/Premium)

**Expected Result:**
- Tickets list loads
- QR code displays
- All ticket details correct
- Perks listed (if applicable)

---

### 1.7 QR Code Scanning (CRITICAL)

**Test Steps:**

#### A. Scan Ticket
1. Open staff scanner: `/staff/scanner`
2. Allow camera access
3. Scan QR code from My Tickets page
4. OR manually enter ticket ID

#### B. Verify Ticket
1. Scanner shows ticket details:
   - [ ] Event name
   - [ ] Ticket holder (wallet address)
   - [ ] Ticket tier
   - [ ] Status
2. Click "Admit" or "Use Ticket"

#### C. Transform to Souvenir
1. System calls `/api/tickets/validate` (PATCH)
2. Blockchain transaction sent
3. Ticket marked as "used"
4. Wait for confirmation (30-60 seconds)

#### D. Verify Transformation
1. Refresh My Tickets page
2. Ticket should now show:
   - [ ] 🎨 **Souvenir** badge
   - [ ] Poster image displayed
   - [ ] QR code hidden
   - [ ] "Event Memento" message
3. Check metadata API:
   ```bash
   curl https://YOUR_DOMAIN/api/metadata/{tokenId}
   ```
   Should return: `"On-Chain State": "Souvenir"`

**Expected Result:**
- Scan succeeds
- Ticket transforms on-chain
- UI updates to show souvenir
- Original QR code no longer works

**Error Cases:**
- Ticket already used → Show error message
- Ticket doesn't exist → Show error
- Wallet doesn't own ticket → Show error

---

## Test Suite 2: Blockchain Interactions

### 2.1 NFT Ownership Verification

**Test Steps:**
1. Check NFT in wallet (Coinbase Wallet / OpenSea)
2. Navigate to OpenSea: `https://opensea.io/assets/base/{contract}/{tokenId}`
3. Verify metadata displays:
   - [ ] Event name
   - [ ] Image
   - [ ] Attributes
   - [ ] On-chain state

**Expected Result:**
- NFT visible in wallet
- OpenSea displays correctly
- Metadata matches

---

### 2.2 Transfer / Resale

**Test Steps:**
1. In wallet, initiate transfer to Wallet 3
2. Send NFT to test address
3. Verify 10% royalty deducted (if sold on marketplace)
4. Check original owner no longer has access
5. New owner can view ticket in My Tickets

**Expected Result:**
- Transfer succeeds
- Royalty enforced
- Ownership updates

---

### 2.3 Time-Based Transfer Restrictions

**Test Steps:**
1. For event happening "now" (between start and end time)
2. Try to transfer ticket
3. Should fail with error: "Cannot transfer during event"

**Expected Result:**
- Transfer blocked during event
- Transfer succeeds before/after event

---

## Test Suite 3: Edge Cases & Error Handling

### 3.1 Network Issues

**Test Steps:**
1. Disconnect internet during purchase
2. Reconnect
3. Verify system recovers

**Expected Result:**
- Error message displayed
- Can retry
- No duplicate charges

---

### 3.2 Webhook Failures

**Test Steps:**
1. Make purchase
2. Simulate webhook failure (disconnect temporarily)
3. Check retry mechanism

**Expected Result:**
- System retries minting
- Eventually succeeds
- User notified

---

### 3.3 Double-Scanning Prevention

**Test Steps:**
1. Scan same ticket twice
2. System should reject second scan

**Expected Result:**
- First scan: Success
- Second scan: "Ticket already used"

---

### 3.4 Invalid QR Codes

**Test with:**
- [ ] Expired ticket
- [ ] Random QR code
- [ ] Ticket from different event
- [ ] Malformed ticket ID

**Expected Result:**
- All show appropriate error messages
- No system crashes

---

## Test Suite 4: Performance Testing

### 4.1 Page Load Times

**Test with Lighthouse:**

```bash
npm install -g lighthouse

lighthouse https://YOUR_DOMAIN \
  --output=html \
  --output-path=./lighthouse-report.html \
  --view
```

**Target Scores:**
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

**Key Metrics:**
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3.5s

---

### 4.2 API Response Times

**Test endpoints:**

```bash
# Health check
time curl https://YOUR_DOMAIN/api/health

# Events API
time curl https://YOUR_DOMAIN/api/events

# Metadata API
time curl https://YOUR_DOMAIN/api/metadata/1000001
```

**Targets:**
- Health check: < 100ms
- Events API: < 500ms
- Metadata API: < 300ms

---

### 4.3 Concurrent Users

**Load test with:**

```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Test with 100 concurrent requests
ab -n 1000 -c 100 https://YOUR_DOMAIN/

# Test API endpoint
ab -n 500 -c 50 https://YOUR_DOMAIN/api/events
```

**Targets:**
- 95% of requests < 1 second
- 99% of requests < 3 seconds
- 0% failures

---

## Test Suite 5: Security Testing

### 5.1 Authentication

**Test:**
- [ ] Protected routes require wallet connection
- [ ] Admin routes require authentication
- [ ] JWT tokens expire correctly
- [ ] Can't access other users' data

---

### 5.2 Input Validation

**Test with malicious input:**
- SQL injection attempts
- XSS attempts
- CSRF tokens
- Rate limiting

**Expected Result:**
- All rejected safely
- No data leakage
- Appropriate error messages

---

### 5.3 Environment Variables

**Verify:**
- [ ] No secrets in client-side code
- [ ] Private keys not exposed
- [ ] API keys properly restricted

---

## Test Suite 6: Cross-Browser Testing

### 6.1 Desktop Browsers

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**Test:**
- Wallet connection
- Purchase flow
- QR code display
- Responsive layout

---

### 6.2 Mobile Browsers

Test on:
- [ ] Chrome Mobile (Android)
- [ ] Safari Mobile (iOS)
- [ ] Samsung Internet

**Test:**
- Touch interactions
- Camera access (QR scanning)
- Wallet apps integration
- Mobile layout

---

## Test Suite 7: Accessibility Testing

### 7.1 Keyboard Navigation

**Test:**
- [ ] Tab through all interactive elements
- [ ] Enter/Space activate buttons
- [ ] Focus indicators visible
- [ ] Skip navigation links work

---

### 7.2 Screen Reader

Test with:
- VoiceOver (Mac)
- NVDA (Windows)
- TalkBack (Android)

**Verify:**
- [ ] All content announced
- [ ] Images have alt text
- [ ] Forms have labels
- [ ] Error messages announced

---

### 7.3 Color Contrast

**Test:**
- Run Wave browser extension
- Check contrast ratios: > 4.5:1
- Test with color blindness simulators

---

## Testing Checklist Summary

### Critical Path (Must Pass)
- [ ] Homepage loads
- [ ] Can browse events
- [ ] Wallet connects
- [ ] Can purchase ticket
- [ ] NFT mints successfully
- [ ] Ticket appears in My Tickets
- [ ] QR code displays
- [ ] Ticket can be scanned
- [ ] Transforms to souvenir
- [ ] Poster image displays

### Important (Should Pass)
- [ ] All API endpoints work
- [ ] Performance targets met
- [ ] Mobile layout works
- [ ] Error handling graceful
- [ ] Security tests pass

### Nice to Have (Can Improve Later)
- [ ] Lighthouse score 95+
- [ ] All browsers identical
- [ ] Perfect accessibility
- [ ] Load testing passed

---

## Bug Reporting Template

When you find issues, document:

```markdown
**Title**: Brief description

**Severity**: Critical / High / Medium / Low

**Steps to Reproduce:**
1. Go to...
2. Click on...
3. See error

**Expected Result:**
What should happen

**Actual Result:**
What actually happened

**Environment:**
- Browser: Chrome 120
- OS: macOS 14
- Network: Base Mainnet
- Wallet: Coinbase Wallet

**Screenshots:**
[Attach if relevant]

**Console Errors:**
[Paste any console errors]
```

---

## Test Results Template

Track results in spreadsheet:

| Test | Status | Notes | Tester | Date |
|------|--------|-------|--------|------|
| Homepage Load | ✅ Pass | 1.2s load time | John | 2025-01-15 |
| Purchase Flow | ❌ Fail | Webhook timeout | Sarah | 2025-01-15 |
| QR Scanning | ⚠️ Partial | Works on iOS, not Android | Mike | 2025-01-15 |

---

## Automated Testing (Future)

Consider adding:
- Playwright for E2E automation
- Jest for unit tests
- Cypress for integration tests

---

## Testing Complete! 🎉

When all tests pass:
1. ✅ Document any known issues
2. ✅ Create bug tickets
3. ✅ Update team on status
4. ✅ Prepare for launch

Ready to deploy! 🚀
