# Unchained Tickets - Updated Production Roadmap
**Project:** NFT Ticketing Platform on Base Blockchain
**Target:** Coinbase Hackathon Submission
**Timeline:** 7-10 days to production-ready MVP
**Last Updated:** October 11, 2025

---

## 🎯 **Current Status: 85% Complete**

### ✅ **COMPLETED COMPONENTS**

#### **Smart Contract (100%)** 🎉
**Status:** FULLY IMPLEMENTED - All MVP features ready
**Deployed:** Base Sepolia Testnet (`0xC37Ca890666a8F637484a45aA5F436ce553d49e6`)
**Location:** [contracts/UnchainedTickets.sol](contracts/UnchainedTickets.sol) (506 lines)

**Implemented Features:**
- ✅ **ERC-1155 Multi-Token Standard** - Single contract for all events
- ✅ **Royalty Enforcement (ERC2981)** - 10% on secondary sales (5% Unchained + 5% Venue)
- ✅ **Configurable Ticket Tiers** - VIP, GA, Premium, Backstage, Custom with access control
- ✅ **Perk Tracking System** - Track meals, drinks, etc. with consumption limits
- ✅ **Time-Based Resale Restrictions** - Blocks transfers during event hours (anti-scalping)
- ✅ **Souvenir NFT Transformation** - ACTIVE → USED → SOUVENIR state machine
- ✅ **Dynamic Metadata URIs** - Different metadata for tickets vs. collectible posters
- ✅ **Seat Assignments** - Section/Row/Seat metadata per ticket
- ✅ **Batch Operations** - Transform all event tickets to souvenirs post-event
- ✅ **Area Access Control** - Check if ticket tier grants access to VIP/Backstage areas

**Key Functions:**
- `createEvent()` - Initialize event with royalty config
- `createTier()` - Set up ticket tiers with perks and access areas
- `mintTicketWithTier()` - Mint NFT with tier assignment
- `useTicket(tokenId, holder, transformToSouvenir)` - Check-in + optional transformation
- `consumePerk()` - Redeem venue perks (drinks, meals)
- `canAccessArea()` - Verify ticket grants area access
- `batchTransformToSouvenirs()` - Convert all used tickets post-event
- `getTicketState()` - Returns ACTIVE, USED, or SOUVENIR

---

#### **Backend & Infrastructure (95%)**
- ✅ Next.js 15 + TypeScript foundation
- ✅ Prisma database schema (599 lines, 25+ models)
- ✅ 12+ API routes (auth, events, tickets, checkout, webhooks)
- ✅ Hardhat deployment configuration (Base Sepolia + Mainnet ready)
- ✅ Coinbase Commerce webhook handler (signature verification working)
- ✅ Security: Rate limiting, CSP headers, JWT auth, input validation
- ✅ Database seeded with 25 events/venues/artists
- ✅ Metadata API endpoint (`/api/metadata/[tokenId]`) - OpenSea compatible
- ✅ Docker PostgreSQL database running locally

---

#### **Frontend Components (90%)**
- ✅ OnchainKit wallet integration (Coinbase Wallet, MetaMask, Smart Wallet)
- ✅ Events browser with search, filtering, and genre categories
- ✅ Artist and venue detail pages
- ✅ Checkout flow with Coinbase Commerce modal
- ✅ QR code generation component
- ✅ My Tickets page with wallet integration
- ✅ Venue dashboard with seat map management
- ✅ Venue onboarding workflow (checklist system)

---

### ❌ **CRITICAL GAPS - Production Blockers**

#### **1. NFT Minting Service - NOT IMPLEMENTED** 🚨🚨🚨
**Status:** Webhook receives payments but doesn't mint NFTs

**Problem:**
- `lib/services/PaymasterService.ts` is a placeholder (returns mock UUID)
- `NFTMintingService.ts` doesn't exist yet
- Webhook handler has minting code commented out ([app/api/webhooks/coinbase/route.ts:48-59](app/api/webhooks/coinbase/route.ts))
- 2/3 unit tests failing (expecting minting behavior)

**Impact:** Users pay successfully but NFT tickets are NOT minted to their wallets

---

#### **2. Souvenir Transformation Flow - NOT IMPLEMENTED** 🎨
**Contract has the feature, but frontend/backend don't use it**

**Missing Components:**
- No frontend UI to display collectible poster after ticket is scanned
- No service to call `useTicket(tokenId, holder, true)` when QR code is scanned
- Metadata API checks time-based (line 48) but not on-chain ticket state
- My Tickets page shows QR code but doesn't reveal poster art for used tickets
- No admin interface to batch transform tickets post-event

**User Journey Gap:**
1. ✅ User buys ticket → Gets NFT with QR code (works)
2. ✅ User shows QR at venue entrance → Scanned (works)
3. ❌ **QR disappears, collectible poster art reveals** → NOT IMPLEMENTED
4. ❌ User keeps souvenir NFT forever → NOT VISIBLE IN UI

This is the **KEY DIFFERENTIATOR** for fan satisfaction and engagement.

---

#### **3. Build Error** 🔴
**Error:** `'staticGenres' is assigned but never used` in [EventsPageClient.tsx:118](app/events/EventsPageClient.tsx)
**Impact:** Blocks production deployment (`npm run build` fails)

---

#### **4. Contract Not on Base Mainnet** ⚠️
**Current:** Deployed to Base Sepolia testnet only
**Need:** Production deployment to Base mainnet + Basescan verification

---

## 💰 **Revenue Model - Profit Sharing**

### **Primary Sales (Near Cost)**
Unchained keeps ticket service fees extremely low (~2-3% to cover operating costs):
- Coinbase Commerce fees: ~1%
- Gas sponsorship (Base Paymaster): ~$0.50-2 per mint
- Platform operations: ~1-2%

**Total Primary Fee:** ~2-3% (minimal, competitive with Eventbrite)

### **Secondary Sales (Profit Model)** 💎
**10% Royalty on ALL Resales (enforced by ERC2981):**
- **5% → Unchained** (platform profit)
- **5% → Venue** (new revenue stream venues can't access today)

**Value Proposition:**
- Venues currently earn $0 from secondary market (Craigslist, StubHub, scalpers)
- Unchained brings them 5% of every resale transaction
- This is NEW revenue that doesn't exist in traditional ticketing
- Unchained only profits when venues profit (aligned incentives)

**Example:**
- Ticket sold for $50 (Unchained earns $1.50 fee)
- Ticket resold for $200 on OpenSea (Unchained earns $10, Venue earns $10)
- Ticket resold again for $150 (Unchained earns $7.50, Venue earns $7.50)

**Why This Works:**
- Fans can resell tickets safely (no scams, blockchain verification)
- Venues monetize secondary market for first time
- Artists/venues earn ongoing royalties from popular events
- Reduces scalping incentive (10% royalty eats into margins)

---

## 📋 **PRODUCTION ROADMAP**

### **Phase 1: Fix Critical Issues (2-3 days)**

#### **1.1 Implement NFT Minting Service with Viem (6-8 hours)**

**CREATE:** `lib/services/NFTMintingService.ts`

**Requirements:**
```typescript
import { createWalletClient, createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import UnchainedTicketsABI from '@/contracts/UnchainedTickets.json';

export class NFTMintingService {
  private walletClient;
  private publicClient;
  private contract;

  constructor() {
    const account = privateKeyToAccount(process.env.MINTING_WALLET_PRIVATE_KEY);

    this.walletClient = createWalletClient({
      account,
      chain: base,
      transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL),
    });

    this.publicClient = createPublicClient({
      chain: base,
      transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL),
    });

    this.contract = {
      address: process.env.NFT_CONTRACT_ADDRESS,
      abi: UnchainedTicketsABI.abi,
    };
  }

  async mintTicket(params: {
    eventId: number;
    tierId: number;
    recipientAddress: string;
    section?: string;
    row?: string;
    seat?: string;
  }) {
    // Call contract.mintTicketWithTier()
    // Integrate Base Paymaster to sponsor gas
    // Return { tokenId, transactionHash }
  }

  async getTicketState(tokenId: string) {
    // Call contract.getTicketState(tokenId)
    // Return 'ACTIVE' | 'USED' | 'SOUVENIR'
  }

  async useTicketAndTransform(tokenId: string, holderAddress: string) {
    // Call contract.useTicket(tokenId, holder, transformToSouvenir=true)
    // Return transaction hash
  }
}
```

**UPDATE:** [app/api/webhooks/coinbase/route.ts](app/api/webhooks/coinbase/route.ts)
- Uncomment lines 48-59
- Replace placeholder with actual minting:
```typescript
const mintingService = new NFTMintingService();
const result = await mintingService.mintTicket({
  eventId: ticket.eventId,
  tierId: 0, // Map from ticketTypeId
  recipientAddress: walletAddress,
});

await prisma.charge.update({
  where: { id: chargeRecord.id },
  data: {
    status: 'confirmed',
    mintedTokenId: result.tokenId,
    transactionHash: result.transactionHash,
  },
});
```

**FIX:** Unit tests in `__tests__/unit/chargeHandler.test.ts`

---

#### **1.2 Implement Souvenir Transformation Flow (4-6 hours)** 🎨

**A. QR Scanning Service**

**CREATE:** `lib/services/TicketScanService.ts`

```typescript
import { NFTMintingService } from './NFTMintingService';
import { prisma } from '@/lib/db/prisma';

export class TicketScanService {
  private mintingService: NFTMintingService;

  constructor() {
    this.mintingService = new NFTMintingService();
  }

  async scanAndTransform(params: {
    qrCode: string;
    scannerId: number;
  }) {
    // 1. Parse QR code → extract ticketId, eventId
    // 2. Validate ticket exists and is ACTIVE
    // 3. Verify not already used
    // 4. Call contract: useTicket(tokenId, holder, transformToSouvenir=true)
    // 5. Update DB: ticket.status = 'used'
    // 6. Create TicketScan record
    // 7. Return success + souvenir metadata URL
  }
}
```

**CREATE:** [app/api/tickets/scan/route.ts](app/api/tickets/scan/route.ts)

```typescript
export async function POST(request: NextRequest) {
  const { qrCode, scannerId } = await request.json();

  const scanService = new TicketScanService();
  const result = await scanService.scanAndTransform({ qrCode, scannerId });

  return NextResponse.json({
    success: true,
    ticketState: 'SOUVENIR',
    posterUrl: result.posterUrl,
    transactionHash: result.txHash,
  });
}
```

---

**B. Frontend Souvenir Display**

**UPDATE:** [app/my-tickets/page.tsx](app/my-tickets/page.tsx)

Add ticket state detection:
```typescript
interface Ticket {
  // ... existing fields
  onChainState?: 'ACTIVE' | 'USED' | 'SOUVENIR';
  posterImageUrl?: string;
}

// Fetch on-chain state for each ticket:
const mintingService = new NFTMintingService();
const state = await mintingService.getTicketState(ticket.tokenId);

// Render logic:
{ticket.onChainState === 'SOUVENIR' ? (
  <div className="space-y-4">
    <img
      src={ticket.posterImageUrl}
      alt="Event Poster"
      className="w-full rounded-lg"
    />
    <Badge tone="info">Collectible Memento</Badge>
    <p className="text-sm text-grit-300">
      You attended this event on {eventDate}. This NFT is now a permanent collectible!
    </p>
  </div>
) : (
  <div className="space-y-4">
    <QRCode value={ticket.qrCode} />
    <Button onClick={() => setShowQRCode(ticket.id)}>
      Show Entry Code
    </Button>
  </div>
)}
```

---

**UPDATE:** [app/api/metadata/[tokenId]/route.ts](app/api/metadata/[tokenId]/route.ts)

Check on-chain state instead of time-based logic:
```typescript
// Import minting service
const mintingService = new NFTMintingService();
const ticketState = await mintingService.getTicketState(tokenId);

const isSouvenir = ticketState === 'SOUVENIR';

const metadata = {
  name: isSouvenir
    ? `${event.title} - Collectible Ticket`
    : `${event.title} - Admit One`,
  description: isSouvenir
    ? `Commemorative NFT from ${event.title}. You were there!`
    : `Admit one to ${event.title} at ${venue.name}`,
  image: isSouvenir
    ? sanitizePosterImageUrl(event.posterImageUrl) // Poster art
    : '/images/ticket-qr-placeholder.png', // QR design
  attributes: [
    // ... existing attributes
    {
      trait_type: 'Ticket State',
      value: ticketState,
    },
  ],
};
```

---

**C. Batch Transformation (Post-Event Admin Tool)**

**CREATE:** `scripts/transform-souvenirs.ts`

```typescript
import { NFTMintingService } from '@/lib/services/NFTMintingService';
import { prisma } from '@/lib/db/prisma';

async function transformEventSouvenirs(eventId: number) {
  // 1. Fetch all tickets for event with status='used'
  const usedTickets = await prisma.ticket.findMany({
    where: { eventId, status: 'used' },
  });

  // 2. Extract token IDs
  const tokenIds = usedTickets
    .map(t => t.mintedTokenId)
    .filter(Boolean);

  // 3. Call contract.batchTransformToSouvenirs(eventId, tokenIds)
  const mintingService = new NFTMintingService();
  const tx = await mintingService.batchTransformToSouvenirs(eventId, tokenIds);

  console.log(`Transformed ${tokenIds.length} tickets to souvenirs`);
  console.log(`Transaction: ${tx.hash}`);
}

// Usage: npx tsx scripts/transform-souvenirs.ts <eventId>
const eventId = parseInt(process.argv[2]);
transformEventSouvenirs(eventId);
```

---

#### **1.3 Implement Perk Tracking UI (Optional MVP - 2-3 hours)**

**UPDATE:** [app/my-tickets/page.tsx](app/my-tickets/page.tsx)

Add perk display section:
```typescript
// Fetch perks from contract
const perks = await mintingService.getTicketPerks(tokenId);

<div className="border-t border-grit-500/30 pt-4">
  <h4 className="text-sm font-semibold mb-2">Included Perks</h4>
  <div className="space-y-2">
    {perks.map(perk => (
      <div key={perk.name} className="flex items-center justify-between text-sm">
        <span>{perk.name}</span>
        <Badge tone={perk.consumed < perk.maxQuantity ? 'success' : 'neutral'}>
          {perk.consumed}/{perk.maxQuantity} Used
        </Badge>
      </div>
    ))}
  </div>
</div>
```

**CREATE:** Venue staff scanner interface (admin dashboard)
- Scan ticket QR → Display ticket holder + available perks
- "Redeem Free Beer" button → Call `contract.consumePerk()`
- Track redemptions in real-time

---

#### **1.4 Fix Build Error (5 minutes)**

**UPDATE:** [app/events/EventsPageClient.tsx:118](app/events/EventsPageClient.tsx)

Remove unused variable:
```typescript
// Remove this line:
const staticGenres = ['Rock', 'Hip Hop', 'Electronic', 'Country', 'Jazz'];
```

**ADD to .env:**
```env
COINBASE_WEBHOOK_SECRET=<generate in Coinbase Commerce dashboard>
COINBASE_PAY_API_KEY=<if using Coinbase Pay>
```

---

### **Phase 2: Deploy Contract to Base Mainnet (1 day)**

#### **2.1 Deploy & Verify (1 hour)**

```bash
# Deploy to Base mainnet
npx hardhat run scripts/deploy.js --network baseMainnet

# Output: Contract deployed to 0x...
# Save address to .env as NFT_CONTRACT_ADDRESS

# Verify on Basescan
npx hardhat verify --network baseMainnet <CONTRACT_ADDRESS>
```

---

#### **2.2 Initialize Production Contract (2-3 hours)**

**CREATE:** `scripts/initialize-production-contract.ts`

```typescript
import { NFTMintingService } from '@/lib/services/NFTMintingService';
import { prisma } from '@/lib/db/prisma';

async function initializeContract() {
  const mintingService = new NFTMintingService();

  // Fetch all published events from database
  const events = await prisma.event.findMany({
    where: { status: 'published' },
    include: { venue: true },
  });

  for (const event of events) {
    console.log(`Creating event ${event.id}: ${event.title}`);

    // 1. Create event on-chain
    await mintingService.createEvent({
      eventId: event.id,
      maxSupply: 1000, // Set per event capacity
      eventTimestamp: Math.floor(new Date(event.startsAt).getTime() / 1000),
      eventEndTimestamp: Math.floor(new Date(event.endsAt || event.startsAt).getTime() / 1000 + 3600 * 4),
      metadataURI: `${process.env.NEXT_PUBLIC_APP_URL}/api/metadata/{tokenId}`,
      souvenirMetadataURI: `${process.env.NEXT_PUBLIC_APP_URL}/api/metadata/{tokenId}?souvenir=true`,
      royaltyRecipient: event.venue.ownerWalletAddress || process.env.MINTING_WALLET_ADDRESS,
      royaltyBps: 1000, // 10% total (500 = 5% per recipient)
    });

    // 2. Create ticket tiers
    const tiers = [
      { name: 'General Admission', tier: 0, price: 5000, capacity: 500, areas: ['Main Floor'], perks: [] },
      { name: 'VIP', tier: 1, price: 15000, capacity: 100, areas: ['Main Floor', 'VIP Lounge'], perks: ['Free Beer (2x)', 'Meet & Greet'] },
      { name: 'Premium', tier: 2, price: 10000, capacity: 200, areas: ['Main Floor', 'Balcony'], perks: ['Free Drink'] },
    ];

    for (const tier of tiers) {
      await mintingService.createTier({
        eventId: event.id,
        tierName: tier.name,
        tier: tier.tier,
        maxSupply: tier.capacity,
        priceCents: tier.price,
        accessAreas: tier.areas,
        includedPerks: tier.perks,
      });
    }

    console.log(`✅ Event ${event.id} initialized with ${tiers.length} tiers`);
  }

  console.log('🎉 Contract initialization complete!');
}

initializeContract();
```

**Run:**
```bash
npx tsx scripts/initialize-production-contract.ts
```

---

#### **2.3 Configure Royalty Split** 💰

**Note:** ERC2981 supports only ONE royalty recipient per token. To split 10% between Unchained and Venue:

**Option A: Smart Contract Royalty Splitter** (Recommended)
- Deploy a royalty splitter contract (0xSplit.org or custom)
- Set splitter as royalty recipient
- Configure 50/50 split between Unchained wallet and venue wallet

**Option B: Manual Settlement**
- Set venue wallet as royalty recipient (gets all 10%)
- Invoice venue for 50% of royalties quarterly
- Simpler but requires trust + manual accounting

**Implementation:**
```typescript
// In initialize script:
const royaltySplitterAddress = await deployRoyaltySplitter({
  recipients: [
    process.env.UNCHAINED_TREASURY_WALLET, // 50%
    event.venue.ownerWalletAddress,        // 50%
  ],
  splits: [5000, 5000], // Basis points (5000 = 50%)
});

await mintingService.createEvent({
  // ...
  royaltyRecipient: royaltySplitterAddress,
  royaltyBps: 1000, // 10% total
});
```

---

#### **2.4 Update Environment Variables**

**Production .env:**
```env
# Update contract address
NFT_CONTRACT_ADDRESS=0x<mainnet_address>

# Confirm mainnet chain
NEXT_PUBLIC_CHAIN_ID=8453

# Production wallet (keep private key secure!)
MINTING_WALLET_PRIVATE_KEY=0x<production_private_key>
MINTING_WALLET_ADDRESS=0x<production_address>

# Treasury wallet for royalties
UNCHAINED_TREASURY_WALLET=0x<treasury_address>
```

---

### **Phase 3: Production Deployment (2-3 days)**

#### **3.1 Database Setup (2-4 hours)**

**Option A: Vercel Postgres (Recommended)**
1. Go to Vercel dashboard → Storage → Create Database → Postgres
2. Copy `POSTGRES_PRISMA_URL` to `.env.production`
3. Run migrations:
```bash
npx prisma migrate deploy
```

**Option B: Supabase**
1. Create project at supabase.com
2. Copy connection string to `.env.production`:
```env
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
```
3. Run migrations:
```bash
npx prisma migrate deploy
```

**Seed Production Data:**
```bash
npx prisma db seed
```

---

#### **3.2 Vercel Deployment (1-2 hours)**

**1. Install Vercel CLI:**
```bash
npm install -g vercel
vercel login
```

**2. Configure Environment Variables in Vercel Dashboard:**

Navigate to Project → Settings → Environment Variables:

```env
# Database
DATABASE_URL=postgresql://...

# Authentication
JWT_SECRET=<new 64-character hex string>
ADMIN_PASSWORD=<secure production password>

# Blockchain
NEXT_PUBLIC_BASE_RPC_URL=https://api.developer.coinbase.com/rpc/v1/base/<api_key>
NFT_CONTRACT_ADDRESS=0x<mainnet_address>
MINTING_WALLET_PRIVATE_KEY=0x<production_private_key>
MINTING_WALLET_ADDRESS=0x<address>
UNCHAINED_TREASURY_WALLET=0x<treasury>

# Payments
COINBASE_COMMERCE_API_KEY=<production_key>
COINBASE_WEBHOOK_SECRET=<from_dashboard>

# OnchainKit
NEXT_PUBLIC_ONCHAINKIT_API_KEY=<your_key>
NEXT_PUBLIC_CHAIN_ID=8453

# App URLs
NEXT_PUBLIC_APP_URL=https://tickets.unchained.xyz
NEXT_PUBLIC_API_BASE_URL=https://tickets.unchained.xyz

# Basescan
BASESCAN_API_KEY=<your_key>

# Developer Access
DEV_WALLET_ADDRESS=0x<your_dev_wallet>
NEXT_PUBLIC_DEV_WALLET_ADDRESS=0x<your_dev_wallet>

# Development Mode (set to false for production)
NEXT_PUBLIC_DEV_MODE=false
```

**3. Deploy:**
```bash
# Deploy to production
vercel --prod

# Or push to GitHub main branch for auto-deploy
git push origin main
```

**4. Verify Deployment:**
- Visit: `https://tickets.unchained.xyz`
- Check: `/api/health` returns 200 OK
- Test: Wallet connection works
- Test: Events load correctly
- Verify: CSP headers in browser dev tools

---

#### **3.3 Monitoring Setup (1 hour)**

**Install Sentry for Error Tracking:**
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

**Configure:**
```env
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=<auth_token>
```

**Key Metrics to Monitor:**
- NFT minting success rate
- Webhook processing latency
- Failed transactions (retry queue)
- Gas costs per mint
- Royalty payment volumes

**Create Alerts:**
- Minting service errors
- Webhook failures
- Database connection issues
- Gas price spikes

---

#### **3.4 Custom Domain (Optional - 30 minutes)**

**If you have a domain:**
1. Vercel dashboard → Project → Settings → Domains
2. Add domain: `tickets.unchained.xyz`
3. Update DNS records (Vercel provides values):
   - A record: `76.76.21.21`
   - CNAME: `cname.vercel-dns.com`
4. SSL automatically provisioned (Let's Encrypt)

**Cost:** $10-15/year for domain registration

---

### **Phase 4: Testing & Launch (2-3 days)**

#### **4.1 End-to-End Testing Checklist**

**Purchase Flow:**
- [ ] Browse events → Select event
- [ ] Click "Purchase NFT Tickets"
- [ ] Coinbase Commerce modal opens
- [ ] Complete payment with USDC/ETH
- [ ] Webhook receives confirmation
- [ ] NFT mints to user wallet
- [ ] Transaction hash recorded in database
- [ ] Token ID appears in My Tickets

**Souvenir Transformation Flow (CRITICAL UX):** 🎨
- [ ] Navigate to My Tickets
- [ ] See active ticket with "Show QR Code" button
- [ ] Click to display QR code
- [ ] Scan QR code with venue scanner (test mode)
- [ ] **QR disappears, poster art reveals instantly**
- [ ] NFT metadata updates (check OpenSea)
- [ ] On-chain state changed: ACTIVE → SOUVENIR
- [ ] Ticket marked as "Used" in database
- [ ] Collectible memento displayed permanently

**Perk Redemption:**
- [ ] VIP ticket shows "Free Beer (2x)" in perks section
- [ ] Venue staff scans ticket QR
- [ ] "Redeem Beer" button appears
- [ ] Staff clicks redeem
- [ ] On-chain: `consumePerk()` called successfully
- [ ] Perk count updates: 1/2 remaining
- [ ] Second redemption works
- [ ] Third redemption fails with "Perk limit exceeded"

**Resale & Royalty Testing:**
- [ ] Transfer ticket to another wallet (before event)
- [ ] Transfer succeeds, new owner sees ticket
- [ ] Try to transfer during event (between start and end time)
- [ ] Transfer fails with error: "Cannot transfer during event"
- [ ] After event ends, transfer succeeds again
- [ ] List ticket on OpenSea for secondary sale
- [ ] Complete sale, verify 10% royalty deducted
- [ ] Check royalty recipient received payment
- [ ] Verify royalty split (5% Unchained + 5% Venue) if using splitter

**Area Access Control:**
- [ ] GA ticket holder tries to access VIP lounge
- [ ] Scanner calls `canAccessArea(eventId, tokenId, "VIP Lounge")`
- [ ] Returns false → Access denied
- [ ] VIP ticket holder tries VIP lounge
- [ ] Returns true → Access granted

**Cross-Browser Testing:**
- [ ] Chrome (desktop + mobile)
- [ ] Safari (desktop + iOS)
- [ ] Firefox
- [ ] Edge

**Wallet Compatibility:**
- [ ] Coinbase Wallet
- [ ] MetaMask
- [ ] Rainbow Wallet
- [ ] Smart Wallet (OnchainKit)

---

#### **4.2 Performance Optimization**

**Lighthouse Audit (Target: 90+)**
```bash
npm install -g lighthouse
lighthouse https://tickets.unchained.xyz --view
```

**Optimize:**
- [ ] Image optimization (Next.js Image component with posterImageUrl)
- [ ] Code splitting (dynamic imports for heavy components)
- [ ] Bundle analysis: `npm run build` → check output size
- [ ] Database query optimization (Prisma indexes on frequently queried fields)
- [ ] CDN for static assets (Vercel Edge handles this)

---

#### **4.3 Hackathon Submission**

**1. Demo Video (2-3 minutes)**

**Script:**
1. **Intro (15 sec):** "Unchained Tickets - NFT ticketing on Base that gives fans collectible mementos"
2. **Browse & Purchase (30 sec):**
   - Browse events
   - Click event
   - Connect wallet
   - Purchase with USDC
3. **View NFT (15 sec):**
   - Show My Tickets page
   - Display QR code
   - Show in Coinbase Wallet
4. **Venue Entry (30 sec):**
   - Present QR code at scanner
   - Scanner validates ticket
   - Ticket marked as used
5. **Poster Reveal (30 sec):** 🎨
   - **QR disappears**
   - **Event poster art appears**
   - "This NFT is now a collectible memento!"
6. **OpenSea View (20 sec):**
   - Open OpenSea
   - Show souvenir NFT with poster image
   - Show attributes: "Ticket State: Souvenir"
7. **Resale Demo (20 sec):**
   - List NFT for sale
   - Show 10% royalty in listing
   - Explain revenue sharing model
8. **Outro (10 sec):** "Built on Base with OnchainKit"

---

**2. README Updates**

**Add sections:**
- Architecture diagram (contract → backend → frontend → wallets)
- Feature list with souvenir transformation highlighted
- Setup instructions for local development
- Environment variables reference
- Deployment guide
- Revenue model explanation (10% split)
- Screenshots:
  - Event browser
  - Checkout flow
  - QR code display
  - **Souvenir poster reveal (before/after)**
  - OpenSea listing

---

**3. GitHub Polish**
- [ ] Clean commit history (squash WIP commits)
- [ ] Add screenshots to README
- [ ] Update LICENSE
- [ ] Add badges (build status, license, Base logo)
- [ ] Add "Built for Coinbase Hackathon" badge
- [ ] Create GitHub Release with version tag

---

**4. Submit to Hackathon**

Follow Coinbase hackathon submission guidelines:
- [ ] Live demo URL: `https://tickets.unchained.xyz`
- [ ] GitHub repository: Public, with comprehensive README
- [ ] Demo video: Uploaded to YouTube (unlisted or public)
- [ ] Project description:
```
Unchained Tickets is an NFT ticketing platform on Base that transforms
event tickets into collectible mementos. After scanning your ticket at
the venue, the QR code disappears and reveals exclusive event poster art
that you keep forever.

Key features:
- 10% resale royalties (5% to venues, 5% to platform)
- Time-locked transfers prevent scalping during events
- VIP ticket perks tracked on-chain (drinks, meals, etc.)
- Built with OnchainKit for seamless wallet UX
- Low gas fees on Base (~$0.50-2 per mint)

Revenue model: We keep primary fees near cost and profit-share secondary
market revenue that venues can't access today. Venues earn 5% of every
resale, creating a new revenue stream while reducing scalping incentives.
```

---

## 📊 **FILES TO CREATE/UPDATE**

### **CREATE (New Files):**
1. `lib/services/NFTMintingService.ts` - Viem-based contract interaction
2. `lib/services/TicketScanService.ts` - QR scan → souvenir transformation
3. `app/api/tickets/scan/route.ts` - Scan endpoint
4. `scripts/initialize-production-contract.ts` - Set up events/tiers on-chain
5. `scripts/transform-souvenirs.ts` - Batch souvenir transformation
6. `contracts/RoyaltySplitter.sol` - (Optional) 50/50 royalty split contract

### **UPDATE (Existing Files):**
7. `app/api/webhooks/coinbase/route.ts` - Enable minting (lines 48-59)
8. `app/api/metadata/[tokenId]/route.ts` - Check on-chain state for poster
9. `app/my-tickets/page.tsx` - Add souvenir poster display logic
10. `app/events/EventsPageClient.tsx` - Remove unused variable (line 118)
11. `.env` - Add `COINBASE_WEBHOOK_SECRET`, update contract address
12. `README.md` - Add architecture, screenshots, setup guide
13. `StatusCheck.md` - This file (completed ✅)

---

## ⏱️ **TIMELINE ESTIMATE**

| Phase | Task | Time | Priority |
|-------|------|------|----------|
| **1.1** | NFT Minting Service | 6-8 hours | 🚨 CRITICAL |
| **1.2** | Souvenir Transformation | 4-6 hours | 🚨 CRITICAL (MVP KEY) |
| **1.3** | Perk Tracking UI | 2-3 hours | ⚠️ Optional MVP |
| **1.4** | Build Fixes + Env | 30 min | 🔴 Required |
| **2.1** | Deploy to Mainnet | 1 hour | 🔴 Required |
| **2.2** | Initialize Contract | 2-3 hours | 🔴 Required |
| **2.3** | Royalty Splitter | 1-2 hours | ⚠️ Optional (can use venue wallet) |
| **3.1** | Database Setup | 2-4 hours | 🔴 Required |
| **3.2** | Vercel Deployment | 1-2 hours | 🔴 Required |
| **3.3** | Monitoring Setup | 1 hour | ⚠️ Recommended |
| **3.4** | Custom Domain | 30 min | ⚠️ Optional |
| **4.1** | E2E Testing | 6-8 hours | 🔴 Required |
| **4.2** | Performance | 2-3 hours | ⚠️ Recommended |
| **4.3** | Submission | 3-4 hours | 🔴 Required |

**Total Time to MVP:** 7-10 days (with 1-2 developers)
**Minimum Viable:** ~5 days (skip optional items)

---

## 💰 **COST BREAKDOWN**

### **Initial Setup Costs**
| Item | Cost | Notes |
|------|------|-------|
| Base ETH (gas for deployment) | $25-50 | Deploy contract + initialize events |
| Domain (optional) | $10-15/year | tickets.unchained.xyz |
| **Total Initial** | **$35-75** | One-time |

### **Monthly Operating Costs (Starting)**
| Service | Free Tier | Paid Tier | Recommendation |
|---------|-----------|-----------|----------------|
| Vercel Hosting | Free (Hobby) | $20/mo Pro | Start free, upgrade at 100k requests/mo |
| Database (Vercel Postgres) | 256 MB free | $0.25/GB | Start free, ~5k events fits in 256 MB |
| Database (Supabase alt) | 500 MB free | $25/mo Pro | Alternative with more free storage |
| Sentry Error Tracking | 5k events/mo | $26/mo Team | Start free |
| **Total Monthly (Launch)** | **$0-10** | Free tiers sufficient for hackathon |

### **Scaled Operating Costs (With Traffic)**
| Service | Cost | Notes |
|---------|------|-------|
| Vercel Pro | $20/mo | After 100k requests/month |
| Database | $10-20/mo | As data grows beyond free tier |
| Sentry Team | $26/mo | When error tracking needs increase |
| Gas Fees | Variable | ~$0.50-2 per NFT mint on Base |
| **Total Monthly (Scaled)** | **$56-66/mo** | + gas fees per transaction |

### **Revenue Model (Profit Sharing)**

**Primary Sales:**
- Platform fee: ~2-3% (covers operating costs)
- Example: $50 ticket → $1.50 to Unchained

**Secondary Sales (PROFIT MODEL):**
- 10% royalty on ALL resales
- 5% → Unchained (profit)
- 5% → Venue (new revenue stream)

**Example Scenario:**
- 1000 tickets sold @ $50 avg = $50k revenue
  - Primary fees: $1.5k to Unchained
- 500 tickets resold @ $100 avg = $50k secondary volume
  - Royalties: $5k total ($2.5k Unchained, $2.5k Venue)

**Break-Even:** ~30-50 tickets sold/month
**Profit Scale:** Grows with secondary market activity (most profitable events see 30-50% resale rate)

---

## 🎯 **SUCCESS CRITERIA - MVP LAUNCH**

### **Core Flow (Must Work):**
✅ User buys ticket → NFT mints to wallet
✅ User sees QR code in My Tickets
✅ Venue scans QR → Ticket marked as used
**✅ QR disappears → Collectible poster reveals** 🎨
✅ NFT metadata updates to show poster art
✅ User keeps souvenir NFT forever
✅ Souvenir displays correctly on OpenSea

### **Anti-Scalping Features:**
✅ 10% royalty enforced on ALL secondary sales (split 5% Unchained + 5% Venue)
✅ Transfers blocked during event (from doors open to event end)
✅ Blockchain ownership prevents ticket counterfeiting

### **Optional (Nice to Have for Hackathon):**
⚠️ Perk redemption UI (drinks, meals tracking)
⚠️ VIP area access control at scanner
⚠️ Batch souvenir transformation admin tool
⚠️ Royalty splitter contract (can use venue wallet initially)

### **Hackathon Submission Requirements:**
✅ Live demo URL (https://tickets.unchained.xyz)
✅ Demo video (2-3 minutes with poster transformation)
✅ GitHub repository (public, with README)
✅ Built on Base blockchain
✅ Uses OnchainKit for wallet integration
✅ Uses Coinbase Commerce for payments

---

## 🌟 **WHAT MAKES THIS MVP SPECIAL**

### **1. Collectible Experience** 🎨
Unlike traditional e-tickets that become useless after scanning:
- **Transformation:** QR code → Event poster art
- **Permanence:** Fans collect NFTs from every concert they attend
- **Engagement:** Creates emotional connection to events
- **Virality:** Fans share collectible posters on social media

### **2. Revenue Model Innovation** 💎
- **Low primary fees:** 2-3% (competitive with Eventbrite/Ticketmaster)
- **Profit-sharing:** Only profit when venues profit (10% resale royalties)
- **New revenue stream:** Venues earn 5% of secondary market (currently $0)
- **Aligned incentives:** Platform succeeds when events succeed

### **3. Anti-Scalping Built-In** 🛡️
- **Time-locked transfers:** Can't resell during event hours
- **Royalty tax:** 10% eats into scalper profit margins
- **Blockchain verification:** Eliminates fake tickets
- **Dynamic pricing:** Future feature - adjust prices based on demand on-chain

### **4. Technical Excellence** ⚡
- **ERC-1155:** Gas-efficient multi-token standard
- **Base blockchain:** ~$0.50-2 per mint (vs $50+ on Ethereum)
- **OnchainKit:** Seamless wallet UX (Smart Wallet, Coinbase Wallet, MetaMask)
- **Real-time verification:** QR codes validated against blockchain
- **OpenSea compatible:** Metadata follows industry standards

### **5. Venue Benefits** 🎪
- **Zero upfront cost:** No contract, no monthly fees
- **Secondary market monetization:** 5% of every resale forever
- **Perk tracking:** On-chain verification prevents double-redemption
- **Fan data:** Wallet addresses create direct fan relationships
- **Marketing tool:** Collectible posters drive social media buzz

---

## ✅ **NEXT IMMEDIATE ACTIONS**

### **Today (2-3 hours):**
1. ✅ Fix build error in EventsPageClient.tsx (5 min)
2. ✅ Set up project structure for NFTMintingService.ts (15 min)
3. ✅ Install viem dependencies if needed (5 min)
4. ✅ Start implementing NFTMintingService.ts (2 hours)

### **Tomorrow (6-8 hours):**
5. ✅ Complete NFTMintingService.ts with paymaster integration
6. ✅ Update webhook handler to use minting service
7. ✅ Fix failing unit tests
8. ✅ Test end-to-end: purchase → mint → wallet

### **Day 3-4 (8-10 hours):**
9. ✅ Implement TicketScanService.ts
10. ✅ Create /api/tickets/scan endpoint
11. ✅ Update My Tickets page with souvenir display
12. ✅ Update metadata API to check on-chain state
13. ✅ Test souvenir transformation flow

### **Day 5 (3-4 hours):**
14. ✅ Deploy contract to Base mainnet
15. ✅ Verify on Basescan
16. ✅ Initialize production contract (events + tiers)
17. ✅ Update environment variables

### **Day 6-7 (8-12 hours):**
18. ✅ Set up production database (Vercel Postgres or Supabase)
19. ✅ Deploy to Vercel
20. ✅ Configure all environment variables
21. ✅ Set up monitoring (Sentry)
22. ✅ Test production deployment

### **Day 8-10 (12-16 hours):**
23. ✅ End-to-end testing checklist
24. ✅ Cross-browser and wallet testing
25. ✅ Performance optimization
26. ✅ Record demo video
27. ✅ Update README with screenshots
28. ✅ Submit to hackathon

---

## 📝 **NOTES & CONSIDERATIONS**

### **Security:**
- Keep `MINTING_WALLET_PRIVATE_KEY` secure (use Vercel secrets, not committed to git)
- Use environment variables for all sensitive config
- Enable 2FA on Vercel, Coinbase Commerce, and GitHub accounts
- Audit smart contract before mainnet deployment (consider OpenZeppelin Defender)

### **Gas Optimization:**
- Base Paymaster can sponsor gas for mints (free for users)
- Batch operations when possible (e.g., `batchTransformToSouvenirs`)
- Consider lazy minting for high-volume events (mint on first transfer)

### **Scalability:**
- ERC-1155 allows unlimited events in single contract (no redeployment)
- Metadata API caches responses (1 hour TTL)
- Database indexes on frequently queried fields (eventId, userId, status)
- Consider Redis cache for hot data (event details, ticket availability)

### **Future Enhancements (Post-Hackathon):**
- **Dynamic pricing:** Adjust ticket prices based on demand on-chain
- **Soulbound tickets:** Non-transferable tickets for certain events
- **Loyalty program:** Reward frequent attendees with perks/discounts
- **Fan-to-fan marketplace:** In-app resale with Unchained as escrow
- **Mobile app:** Native iOS/Android with wallet connect
- **QR code on NFT image:** Embed scannable QR in NFT metadata
- **Social features:** Share collectible posters, tag friends who attended
- **Artist royalties:** Split venue's 5% with artists (e.g., 2.5% venue + 2.5% artist)

---

**🚀 Ready to build the future of event ticketing!**

**Questions or blockers? Let's tackle them together.** 💪
