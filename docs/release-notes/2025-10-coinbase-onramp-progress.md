# Coinbase Onramp Implementation - Progress Report

## ✅ COMPLETED (Sprint 1 & 2.1)

### 1. Environment Configuration
- ✅ Added CDP environment variables to `.env.example`
- ✅ Updated `lib/config/env.ts` with CDP schema
- ✅ Configured Coinbase Onramp settings (minimum USD, API URL, etc.)

### 2. Backend Services Created
- ✅ **CoinbaseOnrampService** (`lib/services/CoinbaseOnrampService.ts`)
  - JWT generation for CDP API authentication
  - Session token creation
  - Minimum purchase validation
  - Funding amount calculations
  - Onramp configuration fetching

- ✅ **UserService** (`lib/services/UserService.ts`)
  - User creation from onramp flow
  - Find or create user logic
  - Onboarding status management
  - Email verification helpers

### 3. API Endpoints Implemented
- ✅ **Session Token API** (`app/api/onramp/session/route.ts`)
  - Secure session token generation
  - Client IP extraction and validation
  - Minimum purchase enforcement
  - Email requirement validation

- ✅ **Onramp Webhook Handler** (`app/api/webhooks/coinbase-onramp/route.ts`)
  - Webhook signature verification
  - Success/failure/pending event handling
  - User creation on successful onramp
  - Charge status updates
  - Ticket linking

### 4. Database Schema Updates
- ✅ Updated User model in `prisma/schema.prisma`:
  - `emailVerified` field
  - `walletAddress` field (unique)
  - `walletProvider` field
  - `createdViaOnramp` flag
  - `onboardingComplete` flag
  - Indexes for wallet lookups

### 5. Cleanup
- ✅ Deleted broken `/app/api/coinbase-pay/session/route.ts`

---

## 🚧 REMAINING WORK

### Sprint 2.2: Update create-charge Endpoint

**File:** `app/api/checkout/create-charge/route.ts`

**Changes needed:**
1. Add `email` parameter (required)
2. Add `paymentMethod` parameter ('wallet' | 'onramp')
3. Add `onrampSessionId` parameter (optional, for tracking)
4. Validate email format
5. For onramp payments:
   - Create ticket reservation with 15-min expiration
   - Store email with charge
   - Wait for webhook confirmation before minting
6. For wallet payments:
   - Keep existing immediate minting flow
7. Link email to user profile

**Implementation pattern:**
```typescript
const { email, paymentMethod = 'wallet', onrampSessionId } = body;

// Validate email (required for all purchases now)
if (!email || !isValidEmail(email)) {
  return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
}

if (paymentMethod === 'onramp') {
  // Create ticket reservation
  // Set expiration: 15 minutes from now
  // Status: 'reserved' (will be 'minted' by webhook)
  // Store email + walletAddress in charge
} else {
  // Existing wallet payment flow
  // Immediate minting
}
```

---

### Sprint 2.3: Delete Broken Components & Simplify CheckoutModal

**Files to delete:**
1. ✅ `app/api/coinbase-pay/session/route.ts` (already deleted)
2. `components/CardCheckoutForm.tsx`

**Files to modify:**
1. `components/CheckoutModal.tsx`
   - Remove payment method toggle
   - Remove `CardCheckoutForm` import and usage
   - Remove scroll lock code
   - Change z-index from z-50 to z-[100]
   - Keep only: Order Summary + existing Checkout (crypto wallet flow)

---

### Sprint 3: Frontend Components

#### 3.1 Create OnrampPurchaseFlow Component

**New file:** `components/checkout/OnrampPurchaseFlow.tsx`

**Purpose:** Smart checkout that detects wallet status and shows appropriate flow

**Logic:**
```typescript
const { address, isConnected } = useAccount();
const [balance, setBalance] = useState(0);

useEffect(() => {
  if (isConnected && address) {
    checkUSDCBalance(address).then(setBalance);
  }
}, [isConnected, address]);

if (isConnected) {
  if (balance >= ticketPrice) {
    return <DirectPurchaseUI />;  // Existing wallet flow
  } else {
    const needed = ticketPrice - balance;
    const fundAmount = Math.max(needed, MINIMUM_ONRAMP);
    return <FundingRequiredUI amountNeeded={fundAmount} />;
  }
} else {
  return <GuestOnrampUI />;  // New onramp flow
}
```

**Sub-components to create:**
- `EmailInput.tsx` - Required email field with validation
- `FundingAmountDisplay.tsx` - Show breakdown when below minimum
- `WalletSavePrompt.tsx` - Post-purchase wallet save modal

#### 3.2 Integrate OnchainKit FundCard

Use OnchainKit's `<FundCard>` component for the actual onramp UI:

```typescript
import { FundCard } from '@coinbase/onchainkit/fund';

<FundCard
  assetSymbol="USDC"
  country="US"
  currency="USD"
  presetAmountInputs={[
    Math.ceil(fundingAmount),
    Math.ceil(fundingAmount * 1.5),
    Math.ceil(fundingAmount * 2)
  ]}
  onSuccess={async (transaction) => {
    // Handle successful onramp
    const walletAddress = transaction.destinationAddress;
    showWalletSavePrompt(walletAddress);
  }}
/>
```

#### 3.3 Update CheckoutModal Integration

**File:** `components/CheckoutModal.tsx`

Replace CardCheckoutForm with OnrampPurchaseFlow:
```typescript
<CheckoutModal>
  <ModalBackdrop className="z-[100]">
    <ModalContent>
      <OrderSummary />
      <OnrampPurchaseFlow
        eventId={eventId}
        ticketTier={ticketTier}
        quantity={quantity}
        totalPrice={totalPrice}
        onSuccess={onSuccess}
      />
    </ModalContent>
  </ModalBackdrop>
</CheckoutModal>
```

---

### Sprint 4: Profile Setup & Onboarding

#### 4.1 Create Profile Setup Page

**New file:** `app/profile/setup/page.tsx`

**Features:**
- Accept query params: `?from=purchase&wallet={address}&email={email}`
- Pre-fill form with onramp data
- Show progress wizard:
  1. Email ✅ (already set)
  2. Wallet ✅ (already set)
  3. Display name (required)
  4. Favorite artists (optional)
  5. Notifications (optional)

**On submit:**
- Update user with `onboardingComplete = true`
- Redirect to `/my-tickets`

#### 4.2 Create Wallet Save Prompt

**New file:** `components/checkout/WalletSavePrompt.tsx`

**UI:**
```
✅ Purchase Complete!

Your NFT ticket has been minted to:
0x1234...5678

Important: Save your wallet information

[Save to Profile] [Copy Wallet Address]
```

**Actions:**
- "Save to Profile" → Navigate to `/profile/setup?from=purchase&wallet={address}&email={email}`
- Auto-populate form fields

---

### Sprint 5: Testing & Production Checklist

#### 5.1 Database Migration

**Run these commands:**
```bash
npx prisma migrate dev --name add_onramp_fields
npx prisma generate
```

#### 5.2 Environment Variables Setup

**Required variables:**
```bash
# From Coinbase Developer Platform
NEXT_PUBLIC_CDP_PROJECT_ID=your_project_id
CDP_API_KEY_NAME=organizations/xxx/apiKeys/xxx
CDP_API_KEY_PRIVATE_KEY="-----BEGIN EC PRIVATE KEY-----\n...\n-----END EC PRIVATE KEY-----"
COINBASE_WEBHOOK_SECRET=your_webhook_secret

# Optional overrides
COINBASE_ONRAMP_MINIMUM_USD=10.00
NEXT_PUBLIC_COINBASE_ONRAMP_ENABLED=true
```

#### 5.3 Testing Checklist

**Development (Base Sepolia testnet):**
- [ ] Session token generation works
- [ ] Onramp modal opens correctly
- [ ] Guest checkout creates user
- [ ] Webhook receives events
- [ ] User profile created with wallet
- [ ] Ticket linked to user
- [ ] Profile setup flow works
- [ ] Connected wallet balance check works
- [ ] Funding flow for insufficient balance
- [ ] Minimum purchase enforcement

**Production:**
- [ ] CDP credentials configured for mainnet
- [ ] Webhook endpoint publicly accessible
- [ ] Domain allowlist set in CDP Portal
- [ ] Email service configured
- [ ] Monitoring/logging enabled
- [ ] Error tracking (Sentry, etc.)

---

## Implementation Priority

### HIGH PRIORITY (Must complete for basic functionality)
1. ✅ CoinbaseOnrampService
2. ✅ Session token API endpoint
3. ✅ User schema updates
4. ✅ UserService
5. ✅ Webhook handler
6. Update create-charge endpoint
7. Delete CardCheckoutForm
8. Simplify CheckoutModal
9. Create OnrampPurchaseFlow basic version
10. Database migration

### MEDIUM PRIORITY (Enhance UX)
11. EmailInput component
12. FundingAmountDisplay component
13. Balance checking logic
14. WalletSavePrompt component
15. Profile setup page

### LOW PRIORITY (Nice to have)
16. Email notifications
17. Advanced error handling
18. Retry logic for failed webhooks
19. Analytics tracking
20. Load testing

---

## Key Files Reference

### Backend
- `lib/services/CoinbaseOnrampService.ts` - CDP integration
- `lib/services/UserService.ts` - User management
- `app/api/onramp/session/route.ts` - Session tokens
- `app/api/webhooks/coinbase-onramp/route.ts` - Webhook handler
- `app/api/checkout/create-charge/route.ts` - Payment processing

### Frontend
- `components/checkout/OnrampPurchaseFlow.tsx` - Main checkout component
- `components/CheckoutModal.tsx` - Modal wrapper
- `app/profile/setup/page.tsx` - Onboarding wizard

### Configuration
- `.env.example` - Environment variables template
- `lib/config/env.ts` - Config schema
- `prisma/schema.prisma` - Database schema

---

## Next Steps

1. **Run database migration:**
   ```bash
   npx prisma migrate dev --name add_onramp_fields
   ```

2. **Complete Sprint 2.2:** Update create-charge endpoint

3. **Complete Sprint 2.3:** Delete CardCheckoutForm & simplify CheckoutModal

4. **Start Sprint 3:** Build OnrampPurchaseFlow component

5. **Test end-to-end flow** in development

6. **Deploy to production** with CDP credentials

---

## Support & Resources

- **Coinbase Developer Portal:** https://portal.cdp.coinbase.com/
- **OnchainKit Docs:** https://docs.base.org/builderkits/onchainkit
- **Base Docs:** https://docs.base.org/

---

## Questions/Blockers

None currently - implementation is on track!
