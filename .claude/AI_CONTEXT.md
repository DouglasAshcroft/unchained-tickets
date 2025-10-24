# Unchained Tickets - AI Context Document

**Quick Reference for AI Coding Assistants**
**Last Updated:** 2025-10-23
**Version:** 1.0

---

## Project Overview

**What:** Full-stack NFT ticketing platform for live events on blockchain
**Why:** Eliminate ticket fraud, enable royalties on resales, provide digital collectibles
**How:** ERC1155 smart contracts on Base Network + Next.js full-stack app

### Core Value Proposition
- **For Fans:** Authentic tickets, collectible NFTs, perks tracking
- **For Venues:** Fraud prevention, secondary market royalties, data insights
- **For Artists:** Direct fan connection, ongoing revenue, community building

---

## Tech Stack at a Glance

```
Frontend:    Next.js 15 (App Router) + React 19 + TypeScript 5 + Tailwind CSS 4
Backend:     Next.js API Routes + PostgreSQL + Prisma ORM
Blockchain:  Solidity (ERC1155) on Base Network (Coinbase L2)
Web3:        Wagmi 2 + Viem 2 + OnchainKit (Coinbase)
Payments:    Stripe + Coinbase Commerce + On-ramp
Auth:        JWT + Bcrypt (currently localStorage, migrating to cookies)
Testing:     Vitest + React Testing Library + Playwright (planned)
Deployment:  Vercel + Docker (PostgreSQL) + Base Network
Monitoring:  Sentry + Vercel Speed Insights
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                         │
│  Next.js App Router • React Components • Wallet Connection       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
         ┌──────────▼────────┐   ┌────▼──────────────┐
         │   Next.js API     │   │  Smart Contract   │
         │      Routes       │   │   (Base Network)  │
         │   (Server-side)   │   │                   │
         └────────┬──────────┘   └────────┬──────────┘
                  │                       │
         ┌────────▼────────┐             │
         │   PostgreSQL    │             │
         │  (Prisma ORM)   │             │
         └─────────────────┘             │
                                         │
         ┌───────────────────────────────▼──────────────┐
         │        External Services                     │
         │  • Coinbase (Onramp, Paymaster)              │
         │  • Stripe (Card Payments)                    │
         │  • Email Service (SendGrid/Resend)           │
         │  • Serper (Search)                           │
         │  • OpenStreetMap (Geocoding)                 │
         └──────────────────────────────────────────────┘
```

### Key Architectural Patterns

**Layered Architecture:**
```
┌─────────────────────────────────────────────────┐
│         Presentation Layer (Components)          │
│              /app, /components                   │
├─────────────────────────────────────────────────┤
│         Business Logic Layer (Services)          │
│              /lib/services                       │
├─────────────────────────────────────────────────┤
│         Data Access Layer (Repositories)         │
│            /lib/repositories                     │
├─────────────────────────────────────────────────┤
│            Database (PostgreSQL)                 │
│              Prisma Client                       │
└─────────────────────────────────────────────────┘
```

---

## File Structure Guide

### Directory Layout

```
unchained-tickets/
├── app/                        # Next.js App Router (pages + API routes)
│   ├── (pages)                 # User-facing pages
│   │   ├── page.tsx            # Home page
│   │   ├── events/             # Event browsing and details
│   │   ├── venues/             # Venue pages
│   │   ├── artists/            # Artist profiles
│   │   ├── my-tickets/         # Ticket viewing/QR codes
│   │   ├── profile/            # User profile management
│   │   ├── dashboard/          # User & venue dashboards
│   │   ├── staff/              # Staff tools (scanner)
│   │   ├── advocate/           # Advocacy program
│   │   └── legal/              # Terms, Privacy, etc.
│   │
│   └── api/                    # Backend API routes
│       ├── auth/               # Login, register, sessions
│       ├── checkout/           # Payment processing
│       ├── tickets/            # Ticket operations
│       ├── events/             # Event CRUD
│       ├── posters/            # Poster generation/upload
│       ├── advocacy/           # Referral program
│       ├── metadata/           # NFT metadata endpoints
│       └── webhooks/           # External service webhooks
│
├── components/                 # React components (74 files)
│   ├── ui/                     # Base UI components
│   ├── layout/                 # Navbar, Footer, etc.
│   ├── profile/                # Profile-specific components
│   ├── dashboard/venue/        # Venue dashboard components
│   ├── checkout/               # Purchase flow components
│   ├── advocacy/               # Advocacy components
│   └── ...                     # Other feature components
│
├── lib/                        # Business logic and utilities
│   ├── services/               # Business logic (18 services)
│   │   ├── AuthService.ts      # Authentication
│   │   ├── EventService.ts     # Event management
│   │   ├── TicketService.ts    # Ticket operations
│   │   ├── NFTMintingService.ts # Blockchain NFT operations
│   │   ├── EmailService.ts     # Email notifications
│   │   ├── PosterGenerationService.ts # AI poster gen
│   │   └── ...                 # 12 more services
│   │
│   ├── repositories/           # Data access layer
│   │   ├── UserRepository.ts
│   │   ├── EventRepository.ts
│   │   └── VenueRepository.ts
│   │
│   ├── hooks/                  # React custom hooks
│   │   ├── useAuth.ts
│   │   ├── useWalletAuth.ts
│   │   └── useIdleTimer.ts
│   │
│   ├── utils/                  # Utility functions
│   │   ├── auth.ts             # Auth utilities
│   │   ├── apiError.ts         # Error handling
│   │   ├── rateLimit.ts        # Rate limiting
│   │   └── ...
│   │
│   ├── validators/             # Zod schemas
│   ├── config/                 # Configuration files
│   ├── constants/              # Constants
│   ├── types/                  # TypeScript types
│   └── db/                     # Database client
│
├── contracts/                  # Solidity smart contracts
│   └── UnchainedTickets.sol    # Main ERC1155 contract
│
├── prisma/                     # Database schema and migrations
│   ├── schema.prisma           # Database models
│   ├── migrations/             # Migration files
│   └── seed.ts                 # Seed data
│
├── docs/                       # Documentation
│   ├── AI_CONTEXT.md           # This file
│   ├── product/                # Product planning
│   │   └── REFACTORING_ROADMAP.md # Refactoring plan
│   ├── engineering/            # Engineering docs
│   ├── operations/             # Ops and deployment
│   └── setup/                  # Setup guides
│
├── scripts/                    # Operational scripts
│   └── ops/                    # Setup and teardown scripts
│
├── tests/                      # Test files
│   └── ...                     # Unit, integration, E2E tests
│
├── public/                     # Static assets
│
└── [config files]              # Various config files
    ├── package.json
    ├── tsconfig.json
    ├── next.config.ts
    ├── tailwind.config.ts
    ├── vitest.config.mts
    └── hardhat.config.cjs
```

---

## Key Patterns & Conventions

### 1. Service Layer Pattern

**All business logic lives in services:**

```typescript
// lib/services/TicketService.ts
export class TicketService {
  static async getTicketsByUser(userId: string) {
    // Business logic here
  }

  static async validateTicket(ticketId: string) {
    // Validation logic here
  }
}
```

**Usage in API routes:**
```typescript
// app/api/tickets/[id]/route.ts
import { TicketService } from '@/lib/services/TicketService';

export async function GET(request: NextRequest) {
  const ticket = await TicketService.getTicketById(id);
  return NextResponse.json(ticket);
}
```

### 2. Repository Pattern (Data Access)

**Repositories handle all database operations:**

```typescript
// lib/repositories/UserRepository.ts
export class UserRepository {
  static async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  static async create(data: CreateUserInput) {
    return prisma.user.create({ data });
  }
}
```

### 3. API Route Structure

**Standard pattern (to be refactored with middleware):**

```typescript
// app/api/[resource]/route.ts
export async function POST(request: NextRequest) {
  try {
    // 1. Parse and validate input
    const body = await request.json();
    const validatedData = schema.parse(body);

    // 2. Verify authentication (if needed)
    const user = await verifyAuth(request);

    // 3. Call service
    const result = await SomeService.doSomething(validatedData);

    // 4. Return response
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    // Error handling
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500 }
    );
  }
}
```

### 4. Component Patterns

**Profile section components (to be refactored with useEditableSection):**
```typescript
const [editing, setEditing] = useState(false);
const [saving, setSaving] = useState(false);

const handleSave = async () => {
  setSaving(true);
  const success = await onUpdate(formData);
  setSaving(false);
  if (success) setEditing(false);
};
```

### 5. Styling Conventions

**Tailwind utility classes:**
- Use semantic color names: `bg-ink-800`, `text-bone-100`, `border-grit-500`
- Custom colors defined in `tailwind.config.ts`
- Custom animations: `neon-pulse`, `flicker`

**Common patterns:**
- Container: `bg-ink-800/50 border border-grit-500/30 rounded-lg p-6`
- Button: `px-4 py-2 bg-resistance-500 hover:brightness-110 rounded-lg`

---

## Database Schema Summary

### Core Models (Prisma)

```typescript
User {
  id: String @id
  email: String @unique
  role: UserRole (fan, artist, venue, staff, admin)
  profile: UserProfile?
  wallets: ConnectedWallet[]
  tickets: Ticket[]
}

Event {
  id: String @id
  title: String
  date: DateTime
  venue: Venue @relation
  artist: Artist @relation
  ticketTypes: TicketType[]
  posters: EventPoster[]
}

Ticket {
  id: String @id
  tokenId: BigInt
  eventId: String
  userId: String
  tier: TicketTier (ga, vip, premium, backstage)
  nftMetadata: Json
  scans: TicketScan[]
}

Venue {
  id: String @id
  name: String
  slug: String @unique
  location: String
  staff: VenueStaff[]
  events: Event[]
}

Artist {
  id: String @id
  name: String
  slug: String @unique
  bio: String?
  events: Event[]
}
```

### Important Relationships

- User → Tickets (one-to-many)
- Event → Venue (many-to-one)
- Event → Artist (many-to-one)
- Ticket → Event (many-to-one)
- Venue → VenueStaff (one-to-many)

### Database Connection

```typescript
// lib/db/prisma.ts
import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient();
};

const prisma = globalThis.prisma ?? prismaClientSingleton();
export default prisma;
```

---

## API Routes Overview

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/wallet` - Wallet authentication

### Tickets
- `GET /api/tickets/user/:userId` - Get user tickets
- `GET /api/tickets/:id` - Get specific ticket
- `POST /api/tickets/scan` - Scan ticket QR code
- `POST /api/tickets/validate` - Validate ticket

### Events
- `GET /api/events` - List events
- `GET /api/events/:id` - Get event details
- `POST /api/events` - Create event (auth required)
- `PATCH /api/events/:id` - Update event (auth required)
- `DELETE /api/events/:id` - Delete event (auth required)

### Checkout
- `POST /api/checkout/create-charge` - Create Stripe charge
- `POST /api/checkout/card-charge` - Process card payment
- `POST /api/checkout/onramp` - Crypto on-ramp purchase

### Posters
- `POST /api/posters/generate` - AI poster generation
- `POST /api/posters/upload` - Upload poster
- `POST /api/posters/refine` - Refine generated poster
- `GET /api/posters/variants` - Get poster variants

### Advocacy
- `GET /api/advocacy/stats` - Get advocacy stats
- `POST /api/advocacy/register` - Register as advocate
- `GET /api/advocacy/leaderboard` - Get leaderboard
- `POST /api/advocacy/send-emails` - Send advocacy emails (cron)

### Metadata (ERC1155)
- `GET /api/metadata/:tokenId` - Get NFT metadata

### Webhooks
- `POST /api/webhooks/coinbase-onramp` - Coinbase webhook

---

## Common Tasks & Where to Find Things

### Adding a New API Route

1. Create route file: `app/api/[resource]/route.ts`
2. Define handler: `export async function POST(request: NextRequest)`
3. Add validation with Zod
4. Call appropriate service
5. Add tests: `tests/api/[resource].test.ts`

### Creating a New Component

1. Decide location: `components/ui/` or `components/features/[feature]/`
2. Use TypeScript for props
3. Use Tailwind for styling
4. Add tests: `tests/components/[component].test.tsx`
5. Export from barrel file if needed

### Adding a New Service

1. Create service: `lib/services/[Name]Service.ts`
2. Use static methods for stateless logic
3. Call repositories for data access
4. Add error handling
5. Add tests: `tests/services/[Name]Service.test.ts`

### Database Schema Changes

1. Update `prisma/schema.prisma`
2. Create migration: `npm run prisma:migrate`
3. Generate client: `npm run prisma:generate`
4. Update types: `lib/types/index.ts`
5. Update seed: `prisma/seed.ts` (if needed)

### Adding a New Page

1. Create page: `app/[route]/page.tsx`
2. Define metadata export
3. Use Server Components by default
4. Add 'use client' only if needed
5. Update navigation in Navbar

---

## Environment Variables

### Required Variables

```bash
# Database
DATABASE_URL="postgresql://..."

# Blockchain
NEXT_PUBLIC_CONTRACT_ADDRESS="0x..."
MINTING_WALLET_PRIVATE_KEY="0x..."
NEXT_PUBLIC_BASE_CHAIN_ID="8453"

# Authentication
JWT_SECRET="..."

# Payments
STRIPE_SECRET_KEY="sk_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."
COINBASE_API_KEY="..."

# Email
EMAIL_SERVICE_API_KEY="..."

# Monitoring
SENTRY_DSN="..."
NEXT_PUBLIC_SENTRY_DSN="..."

# Development
NEXT_PUBLIC_DEV_MODE="false"
```

### Configuration Files
- Local: `.env.local` (git-ignored)
- Example: `.env.example` (checked in)
- Production: Set in Vercel dashboard

---

## Smart Contract Overview

### UnchainedTickets.sol (ERC1155)

**Key Features:**
- Multi-token standard (multiple ticket tiers per event)
- Built-in royalty enforcement (ERC2981)
- Resale restrictions (time-based)
- Perk tracking (meals, drinks)
- Auto-conversion to souvenir NFT post-event
- Section and seat assignments

**Ticket Tiers:**
- 0: General Admission (GA)
- 1: VIP
- 2: Premium
- 3: Backstage

**Key Functions:**
- `mintTicket(to, eventId, tier, metadata)` - Mint new ticket
- `transferTicket(from, to, tokenId)` - Transfer with restrictions
- `consumePerk(tokenId, perkType)` - Redeem perk (meal/drink)
- `getTicketDetails(tokenId)` - Get ticket metadata

**Network:** Base (Coinbase Layer 2)
- Mainnet: Chain ID 8453
- Testnet (Sepolia): Chain ID 84532

---

## Important Gotchas & Known Issues

### 🚨 High Priority Issues (47 TODOs in codebase)

1. **NFT Minting Service** needs viem migration (currently uses ethers.js)
   - Files: `/app/api/checkout/create-charge/route.ts:4,92`
   - Priority: High

2. **Missing Authorization Checks** on poster endpoints
   - Files: `/app/api/posters/*/route.ts` (upload, generate, variants, refine)
   - Priority: Critical (security)

3. **Auth Tokens in localStorage** (should be HTTP-only cookies)
   - File: `/lib/api/client.ts:25-28`
   - Priority: Critical (security)

4. **Email Service Integration** incomplete
   - File: `/lib/services/EmailService.ts:74,106-108,121`
   - Priority: Medium

5. **Blockchain NFT Fetching** not implemented
   - File: `/app/my-tickets/page.tsx:229`
   - Priority: Medium

### 🔧 Technical Debt

1. **Monolithic Components** need refactoring
   - NewEventPage (2,400 lines) - Top priority
   - MyTicketsPage (647 lines)
   - PosterWorkflowManager (582 lines)

2. **Code Duplication** across profile sections
   - Edit/save pattern repeated in 4 components
   - Should extract to custom hook

3. **Type Safety Issues**
   - 50+ instances of `any` type
   - Need proper TypeScript interfaces

4. **Console Statements** (69 instances)
   - Replace with proper logging service

### ⚠️ Development Warnings

1. **Don't use `localStorage` for auth tokens** - migrating to cookies
2. **Always add tests** for new code (target: 80% coverage)
3. **Use middleware** for API routes (don't repeat error handling)
4. **No components >300 lines** (refactor if larger)
5. **TypeScript strict mode** - no `any` types allowed
6. **Run `npm run build`** before committing to catch type errors

### 🐛 Known Bugs

1. Production mode showing development tickets (MyTicketsPage:320)
2. Checklist completion patch flow needs investigation (route.ts:12)
3. User authentication not working in venue dashboard (page.tsx:22,83)

---

## How to Run Tests

### Unit Tests
```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- TicketService.test.ts

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### Component Tests
```bash
# Run component tests
npm run test -- components/

# Test specific component
npm run test -- Button.test.tsx
```

### Integration Tests
```bash
# Run API tests
npm run test -- api/

# Run specific API test
npm run test -- api/tickets.test.ts
```

### E2E Tests (Planned)
```bash
# Not yet implemented
# Will use Playwright
npm run test:e2e
```

### Type Checking
```bash
# Check TypeScript types
npx tsc --noEmit --skipLibCheck

# Watch mode
npx tsc --noEmit --watch
```

---

## How to Deploy

### Development
```bash
# Start dev server
npm run dev

# Access at http://localhost:3000
```

### Staging
```bash
# Push to staging branch
git push origin staging

# Vercel auto-deploys
# Check: https://unchained-tickets-staging.vercel.app
```

### Production
```bash
# Merge to main
git checkout main
git merge staging
git push origin main

# Vercel auto-deploys
# Check: https://unchained-tickets.vercel.app
```

### Database Migrations
```bash
# Development
npm run prisma:migrate

# Production (via Vercel)
# Runs automatically on deploy
# Or manually: npx prisma migrate deploy
```

### Smart Contract Deployment
```bash
# Compile contracts
npx hardhat compile

# Deploy to testnet (Base Sepolia)
npx hardhat run scripts/deploy.js --network base-sepolia

# Deploy to mainnet (Base)
npx hardhat run scripts/deploy.js --network base
```

---

## Current Priorities (Post-Hackathon)

### Immediate (Week 1-2)
1. ✅ Complete REFACTORING_ROADMAP.md (done)
2. ✅ Complete AI_CONTEXT.md (this file - done)
3. 🔜 Begin Phase 1: Foundation & Quick Wins
   - Remove unused dependencies
   - Implement proper logging
   - Fix TypeScript `any` types

### Short-term (Week 3-4)
4. 🔜 Phase 2: Extract Reusable Patterns
   - Create custom hooks (useEditableSection)
   - Build UI component library
   - Create API middleware

### Medium-term (Week 5-6)
5. 🔜 Phase 3: Refactor Monolithic Components
   - Break down NewEventPage (highest priority)
   - Refactor MyTicketsPage
   - Split PosterWorkflowManager

### Ongoing
6. 🔜 Phase 4: Security Hardening (critical)
7. 🔜 Phase 5: Performance Optimization
8. 🔜 Phase 6: Complete Feature TODOs
9. 🔜 Phase 7: File Organization
10. 🔜 Phase 8: Testing & Documentation

**See `/docs/product/REFACTORING_ROADMAP.md` for detailed plan**

---

## Quick Reference Commands

```bash
# Development
npm run dev                  # Start dev server
npm run dev:clean            # Clean start (stop all + reset DB)
npm run build                # Production build
npm run start                # Start production server

# Database
npm run prisma:generate      # Generate Prisma client
npm run prisma:migrate       # Run migrations
npm run prisma:studio        # Open Prisma Studio UI
npm run db:seed              # Seed database
npm run docker:reset         # Reset Docker database

# Testing
npm run test                 # Run tests
npm run test:watch           # Run tests in watch mode
npm run test:coverage        # Run tests with coverage

# Linting
npm run lint                 # Run ESLint

# Docker
npm run docker:up            # Start PostgreSQL container
npm run docker:down          # Stop PostgreSQL container
npm run docker:logs          # View PostgreSQL logs

# Hardhat (Smart Contracts)
npx hardhat compile          # Compile contracts
npx hardhat test             # Test contracts
npx hardhat node             # Start local blockchain
```

---

## Resources

### Internal Documentation
- **Refactoring Plan:** `/docs/product/REFACTORING_ROADMAP.md`
- **Development Guidelines:** `/docs/engineering/development-guidelines.md`
- **Setup Guide:** `/docs/setup/setup-guide.md`
- **API Documentation:** `/docs/api/` (to be created)

### External Resources
- **Next.js Docs:** https://nextjs.org/docs
- **React Docs:** https://react.dev
- **Prisma Docs:** https://www.prisma.io/docs
- **Wagmi Docs:** https://wagmi.sh
- **Viem Docs:** https://viem.sh
- **Base Network:** https://docs.base.org
- **OnchainKit:** https://onchainkit.xyz

---

## Tips for AI Assistants

### When Asked to Add a Feature
1. Check existing services first - don't duplicate
2. Follow the layered architecture (component → service → repository)
3. Add TypeScript types (no `any`)
4. Write tests alongside code
5. Use existing UI components from `/components/ui/`
6. Follow naming conventions (PascalCase for components, camelCase for functions)

### When Asked to Fix a Bug
1. Check the TODO list first - might be known issue
2. Look in services layer for business logic
3. Check API routes for backend issues
4. Review error handling in utils
5. Verify database schema matches expectations
6. Test fix before marking complete

### When Refactoring
1. **Don't break existing functionality** - write tests first
2. Follow patterns in REFACTORING_ROADMAP.md
3. Extract to hooks/components incrementally
4. Update imports carefully
5. Run `npm run build` to catch issues

### When Adding Tests
1. Use Vitest for unit tests
2. Use React Testing Library for components
3. Mock external services (blockchain, APIs)
4. Test success AND error cases
5. Aim for 80%+ coverage

---

**This document is a living reference. Update as the codebase evolves.**

**For detailed refactoring plan, see:** `/docs/product/REFACTORING_ROADMAP.md`
