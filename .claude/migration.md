Migration Strategy: Unchained → Base OnchainKit/MiniKit

Executive Summary

After analyzing your current Unchained architecture and Base's ecosystem, I recommend
a hybrid incremental migration approach using OnchainKit with Next.js (not MiniKit),
combined with TypeScript adoption. This maximizes your existing work while positioning
you for future success.

---

🎯 Key Recommendation: OnchainKit (not MiniKit)

Use OnchainKit because:

- MiniKit is specifically for Farcaster social apps running inside frames - too
  constraining for your full ticketing platform
- OnchainKit provides flexible React components for general Web3 apps with wallet,
  identity, transactions, and payments
- You maintain full control over your UI/UX and routing
- Better fit for your event discovery, venue management, and NFT ticketing features

---

📊 Current Architecture Assessment

What You've Built (Strong Foundation)

✅ Frontend (React + Vite + Tailwind)

- 119 source files with well-organized component structure
- Comprehensive test suite (unit, integration, accessibility, performance)
- Providers for Auth, API, Search, Theme
- Lazy loading and code splitting

✅ Backend (Express + PostgreSQL + Prisma)

- Production-ready middleware (security, rate limiting, monitoring, compression)
- Complete data model (Users, Events, Venues, Artists, Tickets, NFTs, Payments)
- JWT auth with role-based access control (RBAC)
- Comprehensive test coverage (integration + unit)
- API versioning and health checks

✅ Domain Logic

- Event/venue/artist discovery with fuzzy search
- Ticket reservation system
- NFT minting infrastructure
- Payment processing foundation
- Analytics and waitlist functionality

---

🚀 Recommended Migration Strategy

Phase 1: Foundation (Week 1-2)

Goal: Set up Next.js + TypeScript + OnchainKit without breaking existing work

1. Create New Next.js App with OnchainKit
   npm create onchain@latest unchained-v2
   cd unchained-v2
2. Configure Project Structure
   unchained-v2/
   ├── app/ # Next.js App Router
   │ ├── api/ # API routes (replaces Express)
   │ ├── (routes)/ # Page routes
   │ └── layout.tsx # Root layout with OnchainKit provider
   ├── components/ # Migrated React components
   │ ├── ui/ # Your existing UI components
   │ ├── features/ # Events, Tickets, Venues
   │ └── providers/ # Migrated context providers
   ├── lib/
   │ ├── db/ # Prisma client
   │ ├── services/ # Business logic from backend
   │ └── utils/
   ├── prisma/ # Copy your existing schema
   └── **tests**/ # Migrated test suite
3. Database Setup


    - Copy prisma/schema.prisma directly (no changes needed)
    - Copy migration files
    - Run migrations against new DB instance

---

Phase 2: Backend Migration (Week 2-3)

Goal: Move Express API to Next.js API Routes

1. API Routes Pattern
   // app/api/events/route.ts
   import { NextRequest, NextResponse } from 'next/server';
   import { EventService } from '@/lib/services/EventService';

export async function GET(request: NextRequest) {
const events = await EventService.getEvents();
return NextResponse.json(events);
} 2. Migrate in This Order - ✅ Health endpoints → app/api/health/route.ts - ✅ Auth endpoints → app/api/auth/\*/route.ts - ✅ Events/Venues/Artists → Respective route handlers - ✅ Search → app/api/search/route.ts 3. Reuse Your Services - Copy backend/server/src/services/ → lib/services/ - Copy backend/server/src/repositories/ → lib/repositories/ - Convert to TypeScript incrementally (add .ts extension, add types gradually) 4. Middleware Migration
// middleware.ts (Next.js middleware)
// Migrate your security, rate limiting, logging

---

Phase 3: Frontend Component Migration (Week 3-4)

Goal: Move React components to Next.js with minimal changes

1. Component Migration Strategy

# Start with leaf components (no dependencies)

components/ui/Button.jsx → components/ui/Button.tsx
components/ui/Card.jsx → components/ui/Card.tsx
components/ui/Badge.jsx → components/ui/Badge.tsx

# Then feature components

components/EventCard.jsx → components/features/events/EventCard.tsx
components/TicketViewCard.jsx → components/features/tickets/TicketViewCard.tsx 2. Route Migration
Old Vite Route → New Next.js Route
/ → app/(home)/page.tsx
/Home/Events/TicketView/:slug → app/events/[slug]/page.tsx
/Home/Venues/:slug → app/venues/[slug]/page.tsx
/Home/Artists/:slug → app/artists/[slug]/page.tsx 3. Provider Consolidation
// app/layout.tsx
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { AuthProvider } from '@/components/providers/AuthProvider';

export default function RootLayout({ children }) {
return (
<OnchainKitProvider
        chain={base}
        apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
      >
<AuthProvider>
{children}
</AuthProvider>
</OnchainKitProvider>
);
}

---

Phase 4: TypeScript Conversion (Week 4-6)

Goal: Add type safety incrementally

1. Start with New Code


    - All new files in .ts/.tsx
    - Let TypeScript infer types initially

2. Convert Core Types First
   // lib/types/index.ts
   export interface Event {
   id: number;
   title: string;
   startsAt: Date;
   venue: Venue;
   artists: Artist[];
   }

export interface Ticket {
id: string;
eventId: number;
status: TicketStatus;
// ...from your Prisma schema
} 3. Gradual File Conversion - Rename .jsx → .tsx one at a time - Add // @ts-check to .js files to catch issues - Use any temporarily, refine later - Convert in order: utilities → services → components

---

Phase 5: OnchainKit Integration (Week 6-7)

Goal: Add Web3 features using OnchainKit

1. Wallet Connection
   import { ConnectWallet } from '@coinbase/onchainkit/wallet';

// In your Navbar
<ConnectWallet /> 2. Identity Components
import { Identity, Avatar, Name, Badge } from '@coinbase/onchainkit/identity';

// Show user's basename and avatar
<Identity address={userAddress}>
<Avatar />
<Name />
<Badge />
</Identity> 3. Transaction Handling
import { Transaction } from '@coinbase/onchainkit/transaction';

// For NFT ticket minting
<Transaction
contracts={[{
address: NFT_CONTRACT_ADDRESS,
abi: ticketNFTAbi,
functionName: 'mintTicket',
args: [eventId, ticketId]
}]}
/> 4. Payment Flow (USDC)
import { Checkout } from '@coinbase/onchainkit/checkout';

// For ticket purchases
<Checkout
    chargeHandler={createCharge}
    onSuccess={handlePurchaseSuccess}
  />

---

Phase 6: Testing Migration (Week 7-8)

Goal: Port and enhance your test suite

1. Testing Setup
   npm install -D vitest @testing-library/react @testing-library/jest-dom
2. Port Tests in Batches


    - Copy __tests__ directory structure
    - Convert test files to TypeScript
    - Update import paths
    - Add Next.js specific test utilities

3. Add E2E Tests
   npm install -D playwright

# Add tests for critical flows

---

Phase 7: Deployment (Week 8)

Goal: Deploy to production

1. Vercel Deployment (Recommended for Next.js)
   vercel deploy


    - Automatic CI/CD from GitHub
    - Edge functions for API routes
    - Built-in analytics and monitoring

2. Database Migration


    - Use Vercel Postgres or Supabase
    - Run migrations
    - Update connection strings

---

🎯 TypeScript Benefits for Your Project

Immediate Wins

1. Catch Errors Early - No more runtime errors from typos in event properties
2. Better Autocomplete - IntelliSense for your Event/Ticket/Venue types
3. Safer Refactoring - Rename fields confidently across 119 files
4. API Contract - Frontend/backend type safety with shared types
5. Documentation - Types serve as inline documentation

Example: Before/After

// Before (JavaScript)
function createTicket(event, user, seat) {
// What properties does event have?
// Is seat required?
// What does this return?
return { id: uuid(), eventId: event.id, userId: user.id };
}

// After (TypeScript)
function createTicket(
event: Event,
user: User,
seat?: SeatInfo
): Ticket {
return {
id: uuid(),
eventId: event.id,
userId: user.id,
status: TicketStatus.RESERVED,
createdAt: new Date()
};
}
// Now IDE shows all available fields and catches missing required ones!

---

💰 What You Preserve (Maximum Work Salvage)

✅ 100% Reusable

- Prisma Schema - Copy as-is
- Business Logic - Services, repositories, utilities
- UI Components - React components work in Next.js
- Tests - Port with minimal changes
- Tailwind Styles - Same configuration
- API Logic - Repackage in Route Handlers

⚡ Easy Ports

- Express Middleware → Next.js middleware
- JWT Auth → NextAuth.js or custom implementation
- React Router → Next.js App Router (similar patterns)

🔄 Needs Adaptation

- Vite Config → Next.js config
- Environment Variables → .env.local with NEXT*PUBLIC* prefix for client
- Static Imports → May need 'use client' directive for client components

---

📈 Migration Effort Estimate

| Phase                     | Effort              | Risk   | Value     |
| ------------------------- | ------------------- | ------ | --------- |
| 1. Foundation Setup       | 2 days              | Low    | High      |
| 2. Backend Migration      | 5 days              | Medium | High      |
| 3. Frontend Migration     | 7 days              | Low    | High      |
| 4. TypeScript Conversion  | 10 days             | Medium | Very High |
| 5. OnchainKit Integration | 5 days              | Medium | Very High |
| 6. Testing Migration      | 5 days              | Low    | High      |
| 7. Deployment             | 2 days              | Low    | High      |
| Total                     | 36 days (7-8 weeks) |        |           |

Assumes 1 developer working full-time

---

🚨 Alternative: Quick Start Option

If you want to move faster and learn as you go:

Option B: Parallel Development

1. Keep current Vite app running
2. Build new Next.js + OnchainKit app for just the blockchain features (wallet, NFT
   minting, USDC payments)
3. iframe or subdomain integration initially
4. Migrate other features incrementally over 3-6 months

Pros: Ship Web3 features faster, learn Next.js with smaller scopeCons: Maintain two
codebases temporarily, integration complexity

---

🎓 Learning Resources

Next.js + TypeScript

- Next.js Documentation: https://nextjs.org/docs
- TypeScript Handbook: https://www.typescriptlang.org/docs/handbook/intro.html
- Next.js + Prisma Guide: https://vercel.com/guides/nextjs-prisma-postgres

OnchainKit

- Docs: https://docs.base.org/builderkits/onchainkit/getting-started
- GitHub: https://github.com/coinbase/onchainkit
- Templates: npm create onchain@latest

Best Practices

- Next.js App Router Best Practices:
  https://nextjs.org/docs/app/building-your-application
- TypeScript Best Practices 2025: https://medium.com/@nikhithsomasani/best-practices-f
  or-using-typescript-in-2025-a-guide-for-experienced-developers-4fca1cfdf052

---

✅ Final Recommendation

Primary Path: OnchainKit + Next.js + TypeScript (Incremental Migration - 8 weeks)

Why:

1. ✅ Preserves 90%+ of your work
2. ✅ Modern, industry-standard stack (Next.js is the React meta-framework)
3. ✅ TypeScript catches bugs before production
4. ✅ OnchainKit provides battle-tested Web3 components
5. ✅ Excellent Vercel deployment experience
6. ✅ Strong community and documentation
7. ✅ Your existing Postgres/Prisma setup works perfectly

Not Recommended: MiniKit - too constraining for your full-featured ticketing platform

---

Ready to proceed with Phase 1? I can help you scaffold the Next.js project and start
the migration.
