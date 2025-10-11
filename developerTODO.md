# Developer TODO: Production Deployment Checklist

This document outlines all external requirements, configurations, and tasks needed to move from development to a production-ready and deployed Unchained ticketing application.

---

## 🎨 Recent UX Improvements (October 2025)

### Completed
- [x] **Concert/Music-Related Images**: Updated seed data with 15 Unsplash concert photos and 8 venue images
- [x] **ViewDetails Button**: Always visible with toast error handling ("we are still waiting on the event details")
- [x] **Location Filter on Venues Page**: Added location selector to venues page
- [x] **Image Optimization**: Added fetchpriority="high" for first 3 carousel items, lazy loading for others
- [x] **Carousel Button UX**: Widened buttons (w-12), positioned outside edges, opacity-20 with hover/active states
- [x] **Smooth Carousel Transitions**: Implemented seamless looping for continuous scroll feel
- [x] **Featured Resistance Theme**: Added highlighted container for onboarded venues/artists
- [x] **Genre Ordering**: Reordered by music industry popularity (Rock, Pop, Hip-Hop first; Dream Pop now 20th)
- [x] **Layout Restructure**: Moved Featured section under header, controls below

### In Progress / Blocked
- [ ] **Genre Picker Navigation**: Component created but not rendering (see TODO in `components/GenrePicker.tsx`)
  - Issues: Conditional rendering logic, data loading timing
  - TODO added for future review and fix

### Pending Performance
- [ ] **Lighthouse Score Improvement**: Currently 40/100, target 90+
  - Address LCP (Largest Contentful Paint)
  - Reduce CLS (Cumulative Layout Shift)
  - Optimize remaining images

### Technical Debt
- [ ] **Embla Carousel Research**: Consider replacing custom carousel components (TODO in `components/GenreCarousel.tsx`)
- [ ] **Venue API Routes**: Consolidate [venueId] and slug-based routes (cleaned up conflicting directories)

---

## 🎛️ Venue Dashboard Roadmap (Dev)

- [x] Scaffold `/dashboard/venue` with mock data and base layout
- [ ] Wire dashboard to real event/venue/payout APIs once RBAC is live
- [ ] Enforce role-based access on the server (client gate added; still need API guard)
- [ ] Connect poster workflow actions to upload + approval services
- [ ] Surface Base Paymaster fee savings in revenue widgets
      Create a demo of your Coinbase Smart wallet integration, post on social (Warpcast and/or X) and tag Coinbase Wallet and/or Base to get a $1,000 credit bonus
      unchainedtickets@gmail.com

Douglasashcroftjackson@gmail.com

4f86c9a3-dcd7-4561-a487-6e0795dd857d

Unchained Tickets

https://github.com/DouglasAshcroft/unchained-tickets

Unchained is a NFT ticketing platform that is aiming to disrupt traditional ticket monopolies with anti-scalping royalties and collectible digital stubs. To maximize adoption, we're launching Unchained on Base's ecosystem using the onchain kit and leveraging Base’s built-in social distribution and creating a simplified user centric design process with Coinbase's user-friendly wallet innovations to allow easy adoption by those that aren't familiar with crypto assets.

@UnchainedTicket

## Limits set on the RPC to limit single user purchases. Limits on event tickets to prevent bulk purchase by wholesalers.

## 🔐 1. API Keys & Environment Variables

### Required API Keys

#### **Coinbase/Base Ecosystem**

- [x] **OnchainKit API Key**

  - Get from: [Coinbase Developer Platform](https://portal.cdp.coinbase.com/)
  - Add to `.env.local`: `NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_key_here`
  - Used for: Wallet connection, identity, checkout

- [x] **Coinbase Commerce API Key** (for production payments)

  - Get from: [Coinbase Commerce](https://commerce.coinbase.com/)
  - Add to `.env.local`: `COINBASE_COMMERCE_API_KEY=your_key_here`
  - Used for: Creating charges, processing USDC payments
  - Configure webhook URL for payment confirmations

- [x] **Base RPC URL** (recommended: own RPC endpoint)
  - [Coinbase] (https://portal.cdp.coinbase.com/products/node) - 'https://api.developer.coinbase.com/rpc/v1/base'
  - Options:
    - [Alchemy](https://www.alchemy.com/) - `https://base-mainnet.g.alchemy.com/v2/YOUR-API-KEY`
    - [Infura](https://infura.io/) - `https://base-mainnet.infura.io/v3/YOUR-API-KEY`
    - [QuickNode](https://www.quicknode.com/)
  - Add to `.env.local`: `NEXT_PUBLIC_BASE_RPC_URL=your_rpc_url`
  - Used for: Blockchain interactions, transaction queries

#### **Database**

- [ ] **Production PostgreSQL Database**
  - Options:
    - [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
    - [Supabase](https://supabase.com/)
    - [Neon](https://neon.tech/)
    - [Railway](https://railway.app/)
  - Required env vars:
    ```
    DATABASE_URL="postgresql://user:password@host:5432/database"
    DIRECT_URL="postgresql://user:password@host:5432/database" # For Prisma migrations
    ```

#### **Authentication**

- [ ] **JWT Secret** (production)

  - Generate: `openssl rand -base64 32`
  - Add to `.env`: `JWT_SECRET=your_secure_random_string`
  - Used for: User session tokens

- [ ] **NextAuth Secret** (if using NextAuth.js)
  - Generate: `openssl rand -base64 32`
  - Add to `.env`: `NEXTAUTH_SECRET=your_secret`
  - Add to `.env`: `NEXTAUTH_URL=https://your-domain.com`

#### **Optional Services**

- [ ] **Email Service** (for confirmations)

  - Options: SendGrid, Resend, Postmark
  - Env vars: `EMAIL_API_KEY`, `EMAIL_FROM`

- [ ] **Storage** (for event images, NFT metadata)

  - Options: Vercel Blob, AWS S3, Cloudflare R2, IPFS (Pinata/NFT.Storage)
  - Env vars depend on provider

- [ ] **Analytics** (optional)
  - Vercel Analytics (auto-enabled on Vercel)
  - Google Analytics: `NEXT_PUBLIC_GA_ID`
  - PostHog, Mixpanel, etc.

---

## 📦 2. Smart Contract Deployment

### NFT Ticket Contract

You need to deploy an NFT contract for ticket minting on Base mainnet.

- [ ] **Write NFT Ticket Smart Contract**

  - Suggested: ERC-1155 (multi-token) or ERC-721A (gas-optimized)
  - Features needed:
    - Mint ticket NFTs with event ID and tier metadata
    - Transfer restrictions (optional: soulbound until event date)
    - Burn/redeem functionality for event entry
    - Owner/admin controls for minting
  - Tools: Hardhat, Foundry, or Remix

- [ ] **Deploy to Base Mainnet**

  - Get Base ETH for gas fees
  - Deploy using wallet (MetaMask, Coinbase Wallet)
  - Verify contract on [BaseScan](https://basescan.org/)

- [ ] **Save Contract Address & ABI**

  - Add to `.env.local`:
    ```
    NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x...
    ```
  - Save ABI to: `lib/contracts/TicketNFT.json`

- [ ] **Configure Contract Permissions**
  - Set your backend wallet as minting authority
  - Configure royalties (optional)
  - Set metadata base URI (IPFS or centralized storage)

### Backend Wallet for Minting

- [ ] **Create Backend Minting Wallet**
  - Generate secure wallet (private key stored in env)
  - Fund with Base ETH for gas
  - Add to `.env`: `MINTING_PRIVATE_KEY=0x...`
  - **CRITICAL:** Never commit this to git, use secrets management

---

## 🗄️ 3. Database Setup

### Prisma Schema Updates

- [ ] **Review Prisma Schema**

  - File: `prisma/schema.prisma`
  - Ensure all models match production requirements
  - Add indexes for performance (already done in schema)

- [ ] **Add Transaction/Charge Models**

  ```prisma
  model Charge {
    id            String   @id @default(cuid())
    chargeId      String   @unique // Coinbase Commerce charge ID
    eventId       Int
    event         Event    @relation(fields: [eventId], references: [id])
    userId        Int?
    user          User?    @relation(fields: [userId], references: [id])
    ticketTier    String
    quantity      Int
    totalPrice    Decimal  @db.Decimal(10, 2)
    status        String   @default("pending") // pending, confirmed, failed
    transactionHash String?
    createdAt     DateTime @default(now())
    updatedAt     DateTime @updatedAt

    @@index([chargeId])
    @@index([userId])
    @@index([eventId])
  }

  model TicketNFT {
    id            String   @id @default(cuid())
    ticketId      Int      @unique
    ticket        Ticket   @relation(fields: [ticketId], references: [id])
    tokenId       String   @unique // NFT token ID
    contractAddress String
    metadataUri   String
    mintedAt      DateTime @default(now())

    @@index([tokenId])
  }
  ```

- [ ] **Run Production Migrations**

  ```bash
  npx prisma migrate deploy
  npx prisma generate
  ```

- [ ] **Seed Production Database** (if needed)
  ```bash
  npm run db:seed
  ```

---

## 🔌 4. Webhook Handlers

### Coinbase Commerce Webhooks

- [ ] **Create Webhook Endpoint**

  - File: `app/api/webhooks/coinbase/route.ts`
  - Verify webhook signature
  - Handle events:
    - `charge:confirmed` - Payment successful, mint NFT
    - `charge:failed` - Payment failed, update status
    - `charge:delayed` - Payment pending
  - Add to `.env`: `COINBASE_WEBHOOK_SECRET=your_webhook_secret`

- [ ] **Configure Webhook URL in Coinbase Commerce**
  - URL: `https://your-domain.com/api/webhooks/coinbase`
  - Enable events: charge:confirmed, charge:failed
  - Save webhook secret

### Example Webhook Handler Structure

```typescript
// app/api/webhooks/coinbase/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-cc-webhook-signature");

  // Verify signature
  const isValid = verifySignature(rawBody, signature);
  if (!isValid)
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

  const event = JSON.parse(rawBody);

  // Handle charge confirmation
  if (event.type === "charge:confirmed") {
    // 1. Update charge status in database
    // 2. Mint NFT ticket
    // 3. Send confirmation email
    // 4. Create Ticket record
  }

  return NextResponse.json({ success: true });
}
```

---

## 🚀 5. Deployment Platform Setup

### Recommended: Vercel

- [ ] **Connect GitHub Repository**

  - Sign up at [Vercel](https://vercel.com/)
  - Import GitHub repo
  - Auto-deploys on push to `main` branch

- [ ] **Configure Environment Variables**

  - In Vercel dashboard → Settings → Environment Variables
  - Add all `.env.local` variables
  - Separate Production/Preview/Development environments

- [ ] **Configure Build Settings**

  - Build Command: `npm run build`
  - Output Directory: `.next`
  - Install Command: `npm install`
  - Node Version: 20.x or higher

- [ ] **Set Up Custom Domain**
  - Add custom domain in Vercel
  - Update DNS records (CNAME or A record)
  - SSL automatically provisioned

### Alternative: Railway, Render, or AWS

- [ ] **Railway**

  - Connect repo, auto-deploys
  - Built-in Postgres database
  - Simple environment variable management

- [ ] **Render**

  - Connect repo
  - Create Web Service + PostgreSQL database
  - Configure env vars

- [ ] **AWS (Advanced)**
  - Amplify for Next.js hosting
  - RDS for PostgreSQL
  - S3 for static assets
  - CloudFront for CDN

---

## 🔒 6. Security Checklist

### Environment & Secrets

- [ ] **Never commit `.env` files to Git**

  - Verify `.gitignore` includes `.env*`
  - Use Vercel/platform secrets for production

- [ ] **Rotate all development API keys**

  - Generate new keys for production
  - Revoke any exposed keys

- [ ] **Secure Backend Wallet Private Key**
  - Use secrets manager (AWS Secrets Manager, Vercel Env Vars)
  - Never log or expose in responses

### Application Security

- [ ] **Enable Rate Limiting**

  - Implement on API routes (already in backend middleware)
  - Use Vercel Edge Config or Upstash Redis

- [ ] **Add CORS Configuration**

  - Restrict API origins to your frontend domain
  - File: `next.config.js` or middleware

- [ ] **Implement CSP Headers**

  - Content Security Policy headers
  - Add to `next.config.js`:
    ```javascript
    headers: [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
        ],
      },
    ];
    ```

- [ ] **SQL Injection Protection**

  - Already protected via Prisma ORM
  - Never use raw SQL with user input

- [ ] **XSS Protection**
  - Sanitize user inputs
  - React already escapes JSX content
  - Be careful with `dangerouslySetInnerHTML`

---

## 📊 7. Monitoring & Logging

### Error Tracking

- [ ] **Set Up Sentry** (recommended)
  - Sign up at [Sentry.io](https://sentry.io/)
  - Install: `npm install @sentry/nextjs`
  - Initialize in `sentry.client.config.js` and `sentry.server.config.js`
  - Add DSN to env: `NEXT_PUBLIC_SENTRY_DSN`

### Performance Monitoring

- [ ] **Vercel Analytics** (if using Vercel)

  - Auto-enabled, no setup required
  - Web Vitals tracking

- [ ] **Database Monitoring**
  - Use provider's dashboard (Vercel Postgres, Supabase)
  - Monitor query performance
  - Set up alerts for slow queries

### Logging

- [ ] **Structured Logging**
  - Already implemented in `backend/server/src/config/logger.js`
  - Ensure it works with your deployment platform
  - Consider: Logtail, Datadog, CloudWatch

---

## 🧪 8. Testing Before Launch

### Manual Testing Checklist

- [ ] **Wallet Connection Flow**

  - Test with Coinbase Wallet
  - Test with MetaMask
  - Test on mobile (WalletConnect)

- [ ] **Event Browsing**

  - Search functionality works
  - Filters apply correctly
  - Autocomplete suggestions appear
  - No API spam (check Network tab)

- [ ] **Ticket Purchase Flow**

  - Select event → Choose tier → Set quantity
  - Click Purchase → CheckoutModal opens
  - (In production) Complete payment → Receive NFT

- [ ] **Responsive Design**

  - Test on mobile (iOS Safari, Android Chrome)
  - Test on tablet
  - Test on desktop (Chrome, Firefox, Safari)

- [ ] **Performance**
  - Run Lighthouse audit
  - Target: 90+ Performance, 100 Accessibility
  - Check Core Web Vitals

### Automated Testing

- [ ] **Run Test Suite**

  ```bash
  npm run test
  npm run test:coverage
  ```

- [ ] **E2E Tests** (optional but recommended)
  - Install Playwright: `npm install -D @playwright/test`
  - Write tests for critical flows
  - Run before each deployment

---

## 🎨 9. Content & Branding

### Required Content

- [ ] **Create Legal Pages**

  - Terms of Service (`/terms`)
  - Privacy Policy (`/privacy`)
  - Refund Policy (`/refunds`)
  - Use templates from [Termly](https://termly.io/) or [Privacy Policies](https://www.privacypolicies.com/)

- [ ] **Create Marketing Pages**

  - About page (`/about`)
  - How it Works (`/how-it-works`)
  - FAQ page (`/faq`)

- [ ] **Set Up Email Templates**
  - Purchase confirmation
  - Ticket delivery (with QR code)
  - Event reminder (24h before)

### SEO & Meta Tags

- [ ] **Add Metadata to All Pages**

  - Already in `app/layout.tsx`, but customize per page
  - Open Graph images for social sharing
  - Twitter Card metadata

- [ ] **Create `robots.txt`**

  ```
  # public/robots.txt
  User-agent: *
  Allow: /
  Sitemap: https://your-domain.com/sitemap.xml
  ```

- [ ] **Generate Sitemap**
  - Use Next.js sitemap generation
  - File: `app/sitemap.ts`

---

## 📱 10. Mobile App (Optional - Future)

If you want native mobile apps:

- [ ] **Progressive Web App (PWA)**

  - Add `manifest.json`
  - Service worker for offline support
  - Install prompt

- [ ] **React Native** (Future consideration)
  - Share business logic with web app
  - Native wallet integration

---

## 🔄 11. CI/CD Pipeline

### GitHub Actions (Recommended)

- [ ] **Create Workflow File**
  - File: `.github/workflows/deploy.yml`
  - Run tests on PR
  - Auto-deploy to Vercel on merge to `main`

Example workflow:

```yaml
name: Deploy
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "20"
      - run: npm ci
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## 📋 12. Launch Checklist

### Pre-Launch (1 Week Before)

- [ ] All API keys configured and tested
- [ ] Smart contract deployed and verified
- [ ] Database migrated and seeded
- [ ] Webhooks tested with sandbox environment
- [ ] Performance audit passed (Lighthouse 90+)
- [ ] Security audit completed
- [ ] Legal pages published
- [ ] Error monitoring active (Sentry)
- [ ] Backup strategy in place (database backups)

### Launch Day

- [ ] Deploy to production
- [ ] Verify all environment variables
- [ ] Test complete purchase flow end-to-end
- [ ] Monitor error rates in Sentry
- [ ] Check database connection and queries
- [ ] Verify webhook deliveries
- [ ] Test on multiple devices/browsers

### Post-Launch (First Week)

- [ ] Monitor application performance
- [ ] Track user feedback and errors
- [ ] Check transaction success rates
- [ ] Review API usage and costs
- [ ] Optimize slow database queries
- [ ] Marketing launch (social media, email)

---

## 🆘 Support & Resources

### Documentation Links

- [Next.js Docs](https://nextjs.org/docs)
- [OnchainKit Docs](https://onchainkit.xyz/)
- [Base Docs](https://docs.base.org/)
- [Prisma Docs](https://www.prisma.io/docs)
- [Vercel Docs](https://vercel.com/docs)

### Community

- [Base Discord](https://discord.gg/base)
- [OnchainKit GitHub](https://github.com/coinbase/onchainkit)
- Next.js Discord

### Getting Help

- Open GitHub issues for bugs
- Stack Overflow for technical questions
- Base developer community for blockchain questions

---

## 📝 Notes

### Cost Estimates (Monthly)

- **Vercel Pro**: $20/month (recommended for production)
- **Database (Vercel Postgres)**: $10-50/month depending on usage
- **Coinbase Commerce**: Free (they take a small fee per transaction)
- **RPC Provider (Alchemy/Infura)**: Free tier sufficient for start, $49+/month for scale
- **Sentry**: Free for small projects, $26+/month for teams
- **Domain**: $10-15/year

**Total Estimated**: ~$50-150/month for small-medium scale

### Scaling Considerations

- Use Redis for caching (Vercel KV, Upstash)
- Implement CDN for images (Cloudflare, Vercel Edge)
- Database connection pooling (Prisma already supports)
- Consider read replicas for high traffic

---

**Ready to Deploy?** 🚀

Work through this checklist systematically. Start with section 1 (API keys), then move through database, smart contracts, and finally deployment. Test thoroughly before going live!

**Estimated Time to Production**: 2-4 weeks (depending on smart contract complexity and testing thoroughness)
