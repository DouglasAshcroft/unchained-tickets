# Unchained Tickets - Hackathon Production Roadmap

**Project:** Unchained Tickets - NFT Ticketing Platform on Base
**Target:** Coinbase Hackathon Submission
**Timeline:** 2-3 weeks to production
**Last Updated:** October 5, 2025

---

## 🎯 Current Status

### Migration Complete (85%)
- ✅ **Phase 1:** Next.js 15 + TypeScript foundation
- ✅ **Phase 2:** Backend migration (12 API routes, services, repositories)
- ✅ **Phase 3:** Frontend components (events, checkout, search, QR codes)
- ✅ **Security:** Rate limiting, CSP headers, JWT auth, input validation
- ✅ **Database:** 25 events/venues/artists with realistic data

### Production Ready
- ✅ OnchainKit wallet integration working
- ✅ Base RPC configured
- ✅ Coinbase Commerce API key added to .env
- ✅ Security audit complete (OWASP Top 10 compliant)
- ✅ Dev environment stable

### Missing for Production
- ❌ Smart contract (ERC-1155 NFT tickets)
- ❌ Coinbase Commerce payment integration
- ❌ NFT minting service
- ❌ Production database & deployment
- ❌ Webhook handlers for payment confirmations

---

## 📋 Production Deployment Plan

### Phase 1: Smart Contract Development (3-4 days)

#### 1.1 Design NFT Ticket Contract
**Technology:** ERC-1155 (Multi-token standard)

**Why ERC-1155?**
- Gas efficient for multiple events (batch minting)
- Single contract for all events (no need to deploy per event)
- Supports both fungible (GA tickets) and non-fungible (VIP seats)
- Industry standard for ticketing

**Contract Requirements:**
```solidity
// Core functionality needed:
- Mint tickets for specific events (event ID = token ID)
- Transfer restrictions (soulbound until event date)
- Ticket metadata (seat info, event details)
- Admin controls (pause, emergency stop)
- Royalty support (future revenue)
```

#### 1.2 Implementation Steps

**Step 1: Generate Contract with OpenZeppelin Wizard**
1. Visit https://wizard.openzeppelin.com/#erc1155
2. Configure:
   - Name: "UnchainedTickets"
   - Symbol: "UNCH"
   - Base URI: `https://tickets.unchained.xyz/api/metadata/`
   - Features: Mintable, Burnable, Supply Tracking
   - Access Control: Ownable (for admin)

**Step 2: Customize Contract**
Add to generated contract:
```solidity
// Custom functions to add:
- mintEventTicket(eventId, recipient, quantity)
- burnTicket(eventId, tokenId) // For check-in
- setEventMetadata(eventId, metadataURI)
- pauseEvent(eventId) // For cancellations
```

**Step 3: Test on Base Sepolia**
```bash
# Install Hardhat
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Initialize Hardhat project
npx hardhat init

# Deploy to Base Sepolia testnet
npx hardhat run scripts/deploy.js --network base-sepolia
```

**Step 4: Deploy to Base Mainnet**
```bash
# Deploy to production
npx hardhat run scripts/deploy.js --network base-mainnet

# Verify on BaseScan
npx hardhat verify --network base-mainnet <CONTRACT_ADDRESS>
```

**Step 5: Configure Backend**
Update `.env`:
```env
NFT_CONTRACT_ADDRESS="0x..." # Deployed contract address
MINTING_WALLET_PRIVATE_KEY="0x..." # Backend wallet for minting
BASE_CHAIN_ID=8453 # Base mainnet
```

#### 1.3 Deliverables
- ✅ Deployed ERC-1155 contract on Base mainnet
- ✅ Verified contract on BaseScan
- ✅ Metadata API endpoint (`/api/metadata/[tokenId]`)
- ✅ Admin minting wallet configured

---

### Phase 2: Payment Integration (2-3 days)

#### 2.1 Coinbase Commerce Integration

**Current State:**
- API key configured: `COINBASE_COMMERCE_API_KEY` ✅
- Mock charge creation in `/api/checkout/route.ts` ❌
- No webhook handler ❌

**Step 1: Replace Mock Charge Creation**

Update `/app/api/checkout/route.ts`:
```typescript
import { Commerce } from '@coinbase/coinbase-commerce-node';

const commerce = Commerce.Client({
  apiKey: env.COINBASE_COMMERCE_API_KEY
});

// Replace mock charge creation with:
const charge = await commerce.charges.create({
  name: `Ticket - ${event.title}`,
  description: `Event on ${new Date(event.startsAt).toLocaleDateString()}`,
  pricing_type: 'fixed_price',
  local_price: {
    amount: (ticket.priceCents / 100).toString(),
    currency: 'USD'
  },
  metadata: {
    ticketId: ticket.id,
    eventId: event.id,
    userId: session.userId
  }
});
```

**Step 2: Create Webhook Handler**

Create `/app/api/webhooks/coinbase/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from '@coinbase/coinbase-commerce-node';
import { prisma } from '@/lib/db/prisma';
import { NFTMintingService } from '@/lib/services/NFTMintingService';

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-cc-webhook-signature');

  try {
    const event = Webhook.verifyEventBody(
      rawBody,
      signature,
      process.env.COINBASE_WEBHOOK_SECRET
    );

    if (event.type === 'charge:confirmed') {
      const { ticketId, eventId, userId } = event.data.metadata;

      // 1. Update payment status
      await prisma.payment.update({
        where: { externalId: event.data.id },
        data: { status: 'settled' }
      });

      // 2. Update ticket status
      await prisma.ticket.update({
        where: { id: ticketId },
        data: { status: 'minted' }
      });

      // 3. Mint NFT
      const mintingService = new NFTMintingService();
      await mintingService.mintTicket({
        ticketId,
        eventId,
        userId,
        contractAddress: process.env.NFT_CONTRACT_ADDRESS
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 400 });
  }
}
```

**Step 3: Create NFT Minting Service**

Create `/lib/services/NFTMintingService.ts`:
```typescript
import { ethers } from 'ethers';
import { prisma } from '@/lib/db/prisma';
import UnchainedTicketsABI from '@/contracts/UnchainedTickets.json';

export class NFTMintingService {
  private provider: ethers.Provider;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_BASE_RPC_URL);
    this.wallet = new ethers.Wallet(process.env.MINTING_WALLET_PRIVATE_KEY, this.provider);
    this.contract = new ethers.Contract(
      process.env.NFT_CONTRACT_ADDRESS,
      UnchainedTicketsABI,
      this.wallet
    );
  }

  async mintTicket({ ticketId, eventId, userId }: MintParams) {
    // Get user's wallet address
    const userWallet = await prisma.userWallet.findFirst({
      where: { userId, isPrimary: true },
      include: { wallet: true }
    });

    if (!userWallet) {
      throw new Error('User has no connected wallet');
    }

    // Mint NFT
    const tx = await this.contract.mintEventTicket(
      eventId,
      userWallet.wallet.address,
      1 // quantity
    );

    const receipt = await tx.wait();

    // Save to database
    await prisma.nFTMint.create({
      data: {
        ticketId,
        contractId: 1, // Assumes single contract in DB
        tokenId: `${eventId}`, // Token ID = Event ID for ERC-1155
        txHash: receipt.transactionHash,
        mintedAt: new Date(),
        ownerWalletId: userWallet.walletId
      }
    });

    return receipt;
  }
}
```

#### 2.2 Database Schema Updates

Add to `prisma/schema.prisma`:
```prisma
model Charge {
  id          String        @id @default(cuid())
  chargeId    String        @unique // Coinbase Commerce charge ID
  ticketId    String
  userId      Int
  status      String        // pending, confirmed, failed
  amount      String
  currency    String
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  ticket      Ticket        @relation(fields: [ticketId], references: [id])
  user        User          @relation(fields: [userId], references: [id])
}

model TicketNFT {
  id          Int           @id @default(autoincrement())
  ticketId    String        @unique
  tokenId     String
  contractAddress String
  ownerAddress String
  mintedAt    DateTime
  createdAt   DateTime      @default(now())

  ticket      Ticket        @relation(fields: [ticketId], references: [id])
}
```

Run migration:
```bash
npx prisma migrate dev --name add_charge_and_ticket_nft
```

#### 2.3 Deliverables
- ✅ Coinbase Commerce charges created on real purchases
- ✅ Webhook handler processing payment confirmations
- ✅ NFT minting service operational
- ✅ Database tracking charges and NFTs
- ✅ End-to-end flow: Payment → Confirmation → NFT mint

---

### Phase 3: Production Infrastructure (2-3 days)

#### 3.1 Database Setup

**Option A: Vercel Postgres (Recommended)**
- **Cost:** Free tier (256 MB), then $0.25/GB beyond
- **Pros:** Integrated with Vercel, automatic backups, managed
- **Setup:**
  1. Go to Vercel dashboard → Storage → Create Database → Postgres
  2. Copy `POSTGRES_PRISMA_URL` to `.env.production`
  3. Run migrations: `npx prisma migrate deploy`

**Option B: Supabase**
- **Cost:** Free tier (500 MB), then $25/month Pro
- **Pros:** More storage, built-in auth (optional), dashboard
- **Setup:**
  1. Create project at supabase.com
  2. Copy connection string to `.env.production`
  3. Run migrations: `npx prisma migrate deploy`

#### 3.2 Vercel Deployment

**Step 1: Install Vercel CLI**
```bash
npm install -g vercel
vercel login
```

**Step 2: Configure Environment Variables**
Add to Vercel dashboard (Settings → Environment Variables):
```env
# Database
DATABASE_URL="postgresql://..."

# Authentication
JWT_SECRET="<production-secret-32-chars>"
ADMIN_PASSWORD="<production-password-12-chars>"

# Blockchain
NEXT_PUBLIC_BASE_RPC_URL="https://api.developer.coinbase.com/rpc/v1/base/..."
NFT_CONTRACT_ADDRESS="0x..."
MINTING_WALLET_PRIVATE_KEY="0x..."

# Payments
COINBASE_COMMERCE_API_KEY="..."
COINBASE_WEBHOOK_SECRET="..."

# OnchainKit
NEXT_PUBLIC_ONCHAINKIT_API_KEY="..."
NEXT_PUBLIC_CHAIN_ID=8453

# App
NEXT_PUBLIC_APP_URL="https://tickets.unchained.xyz"
NEXT_PUBLIC_API_BASE_URL="https://tickets.unchained.xyz"
```

**Step 3: Deploy**
```bash
# From project root
vercel --prod

# Or push to GitHub and enable auto-deploy
git push origin main
```

**Step 4: Verify Deployment**
- Check health endpoint: `https://tickets.unchained.xyz/api/health`
- Test wallet connection
- Test event loading
- Verify CSP headers in browser dev tools

#### 3.3 Monitoring Setup

**Sentry Error Tracking**
```bash
npm install @sentry/nextjs

# Initialize
npx @sentry/wizard -i nextjs
```

Update `.env.production`:
```env
NEXT_PUBLIC_SENTRY_DSN="https://..."
SENTRY_AUTH_TOKEN="..."
```

#### 3.4 Optional: Custom Domain

**Setup (if you have a domain):**
1. Vercel dashboard → Project → Settings → Domains
2. Add domain: `tickets.unchained.xyz`
3. Update DNS records (Vercel will provide values)
4. SSL automatically provisioned

**Cost:** $10-15/year for domain (optional)

#### 3.5 Deliverables
- ✅ Production database configured and migrated
- ✅ App deployed to Vercel
- ✅ All environment variables set
- ✅ SSL/HTTPS enabled
- ✅ Error monitoring active (Sentry)
- ✅ Custom domain configured (optional)

---

### Phase 4: Testing & Launch (2-3 days)

#### 4.1 End-to-End Testing

**Test Checklist:**
- [ ] **Wallet Connection**
  - Smart Wallet creation
  - External wallet connection (MetaMask, Coinbase Wallet)
  - Auto-disconnect after 30 min idle
  - Manual disconnect via avatar dropdown

- [ ] **Event Discovery**
  - Events load correctly
  - Search functionality works
  - Filters apply (status badges)
  - Event details page displays

- [ ] **Ticket Purchase Flow**
  1. [ ] Select event
  2. [ ] Choose ticket quantity
  3. [ ] Click "Purchase NFT Tickets"
  4. [ ] Coinbase Commerce modal opens
  5. [ ] Complete payment (USDC or ETH)
  6. [ ] Payment confirmation received
  7. [ ] Webhook processes payment
  8. [ ] NFT minted to user wallet
  9. [ ] Ticket appears in "My Tickets"

- [ ] **QR Code Check-in**
  - [ ] Generate QR code for ticket
  - [ ] Scan QR code
  - [ ] Verify ticket validity
  - [ ] Mark ticket as used
  - [ ] Prevent duplicate scans

- [ ] **Security**
  - [ ] Rate limiting on auth endpoints
  - [ ] CSP headers present
  - [ ] CORS restricted to allowed origins
  - [ ] JWT tokens expire after 7 days
  - [ ] No hardcoded secrets in codebase

#### 4.2 Performance Optimization

**Lighthouse Audit Target: 90+**
```bash
# Run Lighthouse
npm install -g lighthouse
lighthouse https://tickets.unchained.xyz --view
```

**Optimize:**
- [ ] Image optimization (Next.js Image component)
- [ ] Code splitting (dynamic imports)
- [ ] Bundle size analysis (`npm run build`)
- [ ] Database query optimization (Prisma indexes)
- [ ] CDN for static assets (Vercel Edge)

#### 4.3 Cross-Browser Testing

**Test Matrix:**
- [ ] Chrome (desktop + mobile)
- [ ] Safari (desktop + iOS)
- [ ] Firefox
- [ ] Edge

**Wallet Testing:**
- [ ] Coinbase Wallet
- [ ] MetaMask
- [ ] Rainbow Wallet
- [ ] Smart Wallet (OnchainKit)

#### 4.4 Hackathon Submission

**Prepare:**
1. **Demo Video** (2-3 minutes)
   - Show wallet connection
   - Browse events
   - Complete purchase flow
   - Display NFT ticket
   - Scan QR code for check-in

2. **README Updates**
   - Add live demo link
   - Add demo video link
   - Update feature list
   - Add architecture diagram

3. **GitHub Polish**
   - Clean up commit history
   - Add screenshots to README
   - Update badges (build status, license)
   - Add "Built for Coinbase Hackathon" badge

4. **Submit to Hackathon**
   - Follow Coinbase hackathon submission guidelines
   - Include all required links (demo, repo, video)
   - Write compelling project description

#### 4.5 Deliverables
- ✅ All features tested end-to-end
- ✅ Lighthouse score 90+ (performance, accessibility)
- ✅ Cross-browser compatibility verified
- ✅ Demo video created
- ✅ Documentation updated
- ✅ Hackathon submission complete

---

## 💰 Cost Breakdown

### Initial Setup Costs
| Item | Cost | Notes |
|------|------|-------|
| Base ETH (for gas) | $25-50 | Contract deployment + initial minting |
| Domain (optional) | $10-15/year | tickets.unchained.xyz |
| **Total Initial** | **$35-75** | One-time |

### Monthly Operating Costs (Starting)
| Service | Free Tier | Paid Tier | Recommendation |
|---------|-----------|-----------|----------------|
| Vercel Hosting | Free | $20/mo Pro | Start free, upgrade at 100k requests/mo |
| Database (Vercel Postgres) | 256 MB free | $0.25/GB | Start free, upgrade when needed |
| Database (Supabase alt) | 500 MB free | $25/mo Pro | Alternative to Vercel Postgres |
| Sentry Error Tracking | 5k events/mo | $26/mo Team | Start free |
| **Total Monthly (Starting)** | **$0-10** | Free tiers sufficient for launch |

### When Revenue Starts (Estimated)
| Service | Cost | Notes |
|---------|------|-------|
| Vercel Pro | $20/mo | After 100k requests/month |
| Database | $10-20/mo | As data grows |
| Sentry Team | $26/mo | When monitoring needs grow |
| Gas Fees | Variable | ~$0.50-2 per NFT mint on Base |
| **Total Monthly (Scaled)** | **$56-66/mo** | + gas fees per transaction |

**Revenue Model:**
- Ticket sales: 2-5% platform fee
- Example: 1000 tickets @ $50 avg = $50k sales → $1-2.5k platform revenue
- **Break-even:** ~50-100 tickets sold per month

---

## 🚀 Launch Timeline

### Week 1 (Days 1-7)
**Focus: Smart Contract + Payments**
- Days 1-2: Smart contract development & testing
- Days 3-4: Deploy to Base mainnet & verify
- Days 5-6: Coinbase Commerce integration
- Day 7: NFT minting service + webhook handler

### Week 2 (Days 8-14)
**Focus: Production Deployment**
- Days 8-9: Database setup & migration
- Days 10-11: Vercel deployment & configuration
- Day 12: Monitoring setup (Sentry)
- Days 13-14: End-to-end testing

### Week 3 (Days 15-21)
**Focus: Polish & Submit**
- Days 15-16: Performance optimization
- Days 17-18: Cross-browser testing & bug fixes
- Day 19: Demo video creation
- Day 20: Documentation polish
- Day 21: Hackathon submission 🎉

**Total Timeline:** 3 weeks to production-ready hackathon submission

---

## 🎯 Success Criteria

### MVP Launch Requirements
- ✅ Users can connect wallets (Coinbase Wallet, MetaMask, Smart Wallet)
- ✅ Users can browse and search events
- ✅ Users can purchase tickets with USDC/ETH via Coinbase Commerce
- ✅ NFT tickets minted to user wallets on successful payment
- ✅ QR codes generated for ticket check-in
- ✅ Admin can scan QR codes to validate tickets
- ✅ Production deployed to Vercel with HTTPS
- ✅ Error monitoring active

### Hackathon Submission Requirements
- ✅ Live demo URL
- ✅ Demo video (2-3 minutes)
- ✅ GitHub repository (public)
- ✅ README with setup instructions
- ✅ Built on Base blockchain
- ✅ Uses OnchainKit for wallet integration
- ✅ Uses Coinbase Commerce for payments

### Post-Launch Metrics (Track)
- Wallet connections
- Ticket purchases
- NFTs minted
- Error rates
- Performance scores (Lighthouse)
- User feedback

---

## 📝 Next Steps

### Immediate Actions (This Week)
1. **Generate smart contract** using OpenZeppelin Wizard
2. **Deploy to Base Sepolia** for testing
3. **Create NFT minting service** (`lib/services/NFTMintingService.ts`)
4. **Integrate Coinbase Commerce API** (replace mock charges)

### Need Help With
- Smart contract customization (transfer restrictions, metadata)
- Hardhat configuration for Base network
- Webhook signature verification
- Gas optimization strategies

### Resources
- **OpenZeppelin Wizard:** https://wizard.openzeppelin.com/#erc1155
- **Base Docs:** https://docs.base.org
- **Coinbase Commerce API:** https://docs.cloud.coinbase.com/commerce/docs
- **OnchainKit Docs:** https://docs.base.org/onchainkit
- **Vercel Deployment:** https://vercel.com/docs

---

## 🔗 Quick Links

### Development
- **Local:** http://localhost:3000
- **Prisma Studio:** `npx prisma studio`
- **Database:** http://localhost:5433 (PostgreSQL)

### Production (After Deployment)
- **Live App:** https://tickets.unchained.xyz
- **API Health:** https://tickets.unchained.xyz/api/health
- **BaseScan Contract:** https://basescan.org/address/[CONTRACT_ADDRESS]

### External Services
- **Coinbase Commerce Dashboard:** https://commerce.coinbase.com
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Sentry Dashboard:** https://sentry.io

---

**Last Updated:** October 5, 2025
**Status:** Ready for Phase 1 (Smart Contract Development)
**Goal:** Production launch in 2-3 weeks for Coinbase Hackathon 🚀
