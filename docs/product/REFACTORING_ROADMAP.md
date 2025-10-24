# Unchained Tickets - Comprehensive Refactoring Roadmap

**Status:** In Progress - Sprint 1 Complete ✅
**Timeline:** 4-6 weeks (Post-Hackathon)
**Last Updated:** 2025-10-24
**Priority:** High - Technical Debt Reduction

## Recent Progress

### Sprint 1: NewEventPage Step Components ✅ COMPLETED (2025-10-24)
**Completed Work**: Extracted and tested 5 wizard step components using TDD methodology
- ✅ BasicsStep component (27 tests passing)
- ✅ ScheduleStep component (31 tests passing)
- ✅ TicketsStep component (29 tests passing)
- ✅ PostersStep component (25 tests passing)
- ✅ ReviewStep component (27 tests passing)
- ✅ Total: 139 tests passing, 805 lines production code, 1,497 lines test code
- ✅ Zero linting errors, full TypeScript type safety, WCAG 2.1 AA accessibility
- ✅ See [SPRINT_1_COMPLETION.md](./SPRINT_1_COMPLETION.md) for full details

**Next Steps**: Sprint 2 options:
1. Custom hooks for NewEventPage (useEventFormState, useEventValidation, useWizardNavigation)
2. OR proceed with blockchain integration (higher business value)

---

## Executive Summary

This roadmap addresses **200+ optimization opportunities** identified across the Unchained Tickets codebase. The refactoring will reduce technical debt, improve code maintainability, enhance performance, and establish comprehensive test coverage.

### Critical Findings
- **10+ major DRY violations** affecting 50+ files
- **15 monolithic components** (largest: 2,400 lines)
- **47 TODO comments** blocking production features
- **69 console.log statements** requiring proper logging
- **3 unused dependencies** wasting ~3MB bundle size
- **Security issues**: localStorage tokens, missing auth checks
- **Type safety**: 50+ instances of `any` type

### Expected Impact
- **Code reduction:** -30% (remove duplication)
- **Test coverage:** 40% → 80%
- **Bundle size:** -15% reduction
- **Lighthouse score:** 70 → 90+
- **TypeScript compliance:** 100% strict mode

---

## Phase 1: Foundation & Quick Wins

**Duration:** 2-3 days
**Can Run in Parallel:** Yes
**Priority:** Critical

### 1.1 Dependency Cleanup

**Problem:** Unused and miscategorized packages bloating bundle

**Actions:**
- [ ] Remove unused packages:
  - `qr` (^0.5.2) - redundant with react-qr-code
  - `sonner` (^2.0.7) - redundant with react-hot-toast
  - `react-idle-timer` (^5.7.2) - not used anywhere
  - **Estimated savings:** ~3MB uncompressed

- [ ] Move to devDependencies (production install optimization):
  - `@next/eslint-plugin-next`
  - `@types/bcrypt`
  - `@types/jsonwebtoken`
  - `eslint`
  - `eslint-config-next`

- [ ] Add missing dependency:
  - `fuse.js` - referenced in next.config.ts but not in package.json

- [ ] Update outdated packages (23 patch versions):
  ```bash
  npm update @prisma/client @sentry/nextjs @tailwindcss/postcss
  npm update @tanstack/react-query lucide-react viem typescript
  ```

**Testing:**
- Verify build succeeds: `npm run build`
- Check bundle analyzer for size reduction
- Run full test suite: `npm test`

---

### 1.2 Dead Code Removal

**Problem:** Backup files, commented code, and console statements cluttering codebase

**Actions:**
- [ ] Delete backup file: `/app/events/page_old_backup.tsx`
- [ ] Remove commented-out imports:
  - `/app/api/checkout/create-charge/route.ts:5` - NFTMintingService
  - `/app/api/checkout/create-charge/route.ts:52` - _maxMintRetries
  - `/app/api/perks/redeem/route.ts:4` - consumePerk

- [ ] Implement proper logging service (replace 69 console statements):
  - Create `/lib/utils/logger.ts` with Winston/Pino
  - Configure Sentry integration for error logs
  - Replace all `console.log`, `console.error`, `console.warn`
  - Keep `console.info` in development only

**File Targets for Console Cleanup:**
- `/app/api/perks/redeem/route.ts`
- `/app/api/checkout/card-charge/route.ts`
- `/app/api/onramp/session/route.ts`
- All 29 API routes

**Testing:**
- Verify logging works in dev and production
- Test log aggregation in Sentry
- Ensure no console statements in production build

---

### 1.3 Type Safety Foundation

**Problem:** Excessive use of `any` defeating TypeScript's purpose

**Actions:**
- [ ] Create comprehensive type definitions in `/lib/types/`:
  ```typescript
  // /lib/types/index.ts
  export interface MetadataAttribute {
    trait_type: string;
    value: string | number;
    display_type?: string;
  }

  export interface NFTMetadata {
    name: string;
    description: string;
    image: string;
    attributes: MetadataAttribute[];
  }

  export interface UserResponse {
    id: string;
    email: string;
    role: UserRole;
    profile?: UserProfile;
  }

  export interface ErrorResponse {
    error: string;
    details?: unknown;
    code?: string;
  }
  ```

- [ ] Replace all `any` types in `/lib/api/client.ts` (lines 90, 102, 114, 138, 289)
- [ ] Create error type classes in `/lib/utils/errors/`:
  ```typescript
  export class ApiError extends Error {
    constructor(
      message: string,
      public code: string,
      public statusCode: number,
      public details?: unknown
    ) {
      super(message);
      this.name = 'ApiError';
    }
  }
  ```

- [ ] Fix typed-array errors in components
- [ ] Remove all `as any` type assertions

**Testing:**
- TypeScript strict mode: `npx tsc --noEmit --skipLibCheck`
- Write unit tests for type definitions
- Ensure compile-time type safety

---

## Phase 2: Extract Reusable Patterns

**Duration:** 4-5 days
**Can Run in Parallel:** Yes (hooks + components)
**Priority:** High

### 2.1 Create Custom Hooks

**Problem:** Duplicated state management logic across 4+ profile sections

**Actions:**
- [ ] **`/lib/hooks/useEditableSection.ts`** (affects 4 components)
  ```typescript
  export function useEditableSection<T>(
    initialData: T,
    onUpdate: (data: T) => Promise<boolean>
  ) {
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<T>(initialData);

    const handleSave = async () => {
      setSaving(true);
      const success = await onUpdate(formData);
      setSaving(false);
      if (success) setEditing(false);
    };

    const handleCancel = () => {
      setFormData(initialData);
      setEditing(false);
    };

    return { editing, saving, formData, setFormData, handleSave, handleCancel, setEditing };
  }
  ```
  **Refactor these components:**
  - `/components/profile/PersonalInfoSection.tsx` (lines 16-180)
  - `/components/profile/LocationSection.tsx` (lines 17-197)
  - `/components/profile/MusicPreferencesSection.tsx` (lines 44-225)
  - `/components/profile/SettingsSection.tsx` (lines 32-249)

- [ ] **`/lib/hooks/useApiErrorHandler.ts`** - Centralized error handling
- [ ] **`/lib/hooks/useFormValidation.ts`** - Zod validation wrapper
- [ ] **`/lib/hooks/useProfileData.ts`** - Profile fetching (ProfilePage:328)
- [ ] **`/lib/hooks/useAdvocacyStats.ts`** - Advocacy data fetching
- [ ] **`/lib/hooks/useVenueStaff.ts`** - Staff membership data
- [ ] **`/lib/hooks/useTicketEnrichment.ts`** - On-chain data fetching (MyTicketsPage:102)
- [ ] **`/lib/hooks/useCheckoutFlow.ts`** - Purchase orchestration (OnrampPurchaseFlow:356)

**TDD Approach:**
- Write unit tests for each hook before implementation
- Test success/error cases
- Test loading states
- Mock API calls with vitest

**Testing:**
```bash
npm run test -- useEditableSection.test.ts
npm run test:coverage
```

---

### 2.2 Create UI Component Library

**Problem:** Repeated styling patterns across 24+ files

**Actions:**
- [ ] **`/components/ui/SectionCard.tsx`** (replaces 24 instances)
  ```typescript
  interface SectionCardProps {
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
  }

  export function SectionCard({ title, icon, children, className }: SectionCardProps) {
    return (
      <div className={clsx(
        "bg-ink-800/50 border border-grit-500/30 rounded-lg p-6",
        className
      )}>
        <div className="flex items-center gap-2 mb-4">
          {icon}
          <h2 className="text-xl font-semibold text-bone-100">{title}</h2>
        </div>
        {children}
      </div>
    );
  }
  ```

- [ ] **`/components/ui/EditButton.tsx`** (standardize 8+ edit buttons)
- [ ] **`/components/ui/SaveButton.tsx`** (standardize save buttons)
- [ ] **`/components/ui/CancelButton.tsx`** (standardize cancel buttons)

- [ ] **`/components/ui/EntityCard.tsx`** - Generic card component
  - Replace `EventCard.tsx`, `ArtistCard.tsx`, `VenueCard.tsx`
  - Accept: image, title, subtitle, details, action button as props

- [ ] **`/components/ui/HighlightText.tsx`** - Safe text highlighting
  - Replace regex-based highlighting in SearchBar.tsx:241
  - Use `react-highlight-words` library
  - Prevent XSS vulnerabilities

**TDD Approach:**
- Component tests with @testing-library/react
- Accessibility tests with jest-axe
- Visual regression tests (optional)
- Storybook for component documentation (optional)

**Testing:**
```bash
npm run test -- SectionCard.test.tsx
npm run test -- EntityCard.test.tsx
```

---

### 2.3 API Route Middleware

**Problem:** Duplicated error handling and validation across 29 API routes

**Actions:**
- [ ] **`/lib/middleware/withApiErrorHandler.ts`**
  ```typescript
  export function withApiErrorHandler<T>(
    handler: (req: NextRequest) => Promise<T>
  ) {
    return async (req: NextRequest) => {
      try {
        const result = await handler(req);
        return NextResponse.json(result, { status: 200 });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return NextResponse.json(
            { error: 'Invalid input', details: error.issues },
            { status: 400 }
          );
        }
        logger.error('API Error:', error);
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        );
      }
    };
  }
  ```

- [ ] **`/lib/middleware/withAuth.ts`** - Authentication wrapper
- [ ] **`/lib/middleware/withRoleVerification.ts`** - Generic role checker
  ```typescript
  export function verifyRole(allowedRoles: UserRole[]) {
    return async (request: NextRequest): Promise<AuthUser> => {
      const user = await verifyAuth(request);
      if (!allowedRoles.includes(user.role)) {
        throw new ApiError(
          `Access denied. Required roles: ${allowedRoles.join(', ')}`,
          'FORBIDDEN',
          403
        );
      }
      return user;
    };
  }
  ```
  - Refactor: `verifyAdmin`, `verifyArtist`, `verifyVenue` in `/lib/utils/auth.ts:35-73`

- [ ] **`/lib/middleware/withValidation.ts`** - Zod schema validation

**TDD Approach:**
- Integration tests for each middleware
- Test auth success/failure cases
- Test validation with invalid data
- Test error response formats

**Refactor these 29 API routes:**
- `/app/api/auth/login/route.ts`
- `/app/api/auth/register/route.ts`
- `/app/api/checkout/create-charge/route.ts`
- ... (all 29 POST routes)

---

## Phase 3: Refactor Monolithic Components

**Duration:** 6-8 days
**Can Run in Parallel:** Yes (multiple components)
**Priority:** High

### 3.1 Break Down NewEventPage (2,400 lines → 6 components)

**File:** `/app/events/new/page.tsx`

**Problem:**
- Multi-step wizard with 5 major steps
- 20+ state variables
- 15+ handler functions
- Complex validation (90+ lines)
- TODO comment at line 2: "Break into smaller components"

**New Structure:**
```
app/events/new/
├── page.tsx                        # Wizard orchestrator (~200 lines)
├── components/
│   ├── EventBasicsStep.tsx         # Basic info, artist selection
│   ├── EventScheduleStep.tsx       # Dates, venue, maps
│   ├── EventTicketsStep.tsx        # Ticket tiers and perks
│   ├── EventPostersStep.tsx        # Poster generation
│   └── EventReviewStep.tsx         # Final review
└── hooks/
    ├── useEventFormState.ts        # Form state management
    └── useEventValidation.ts       # Step validation logic
```

**Actions:**
- [ ] Extract form state to `useEventFormState` hook
- [ ] Extract validation to `useEventValidation` hook
- [ ] Create individual step components
- [ ] Update wizard orchestrator to use new components
- [ ] Test each step independently

**TDD Approach:**
- Test form validation for each step
- Test navigation between steps
- Test data persistence across steps
- Integration test for complete wizard flow
- Test error handling and recovery

**Testing:**
```bash
npm run test -- EventBasicsStep.test.tsx
npm run test -- useEventFormState.test.ts
npm run test -- EventWizard.integration.test.tsx
```

---

### 3.2 Refactor PosterWorkflowManager (582 lines → 5 components)

**File:** `/components/dashboard/venue/PosterWorkflowManager.tsx`

**Problem:**
- 4 distinct workflow steps mixed in one component
- Multiple state variables for different concerns
- Image handling mixed with UI

**New Structure:**
```
components/dashboard/venue/
├── PosterWorkflowManager.tsx       # Orchestrator (~150 lines)
└── poster-workflow/
    ├── PosterMethodSelector.tsx    # Choose generation vs upload
    ├── PosterGenerationStep.tsx    # AI generation interface
    ├── PosterUploadStep.tsx        # File upload interface
    ├── PosterReviewGrid.tsx        # Approval interface
    └── usePosterWorkflow.ts        # State and API management
```

**Actions:**
- [ ] Extract workflow state to `usePosterWorkflow` hook
- [ ] Create step components
- [ ] Implement step transitions
- [ ] Test each workflow step

**TDD Approach:**
- Mock API calls (poster generation, upload)
- Test each step in isolation
- Test error recovery
- Test image preview and validation

---

### 3.3 Split MyTicketsPage (647 lines → 6 components)

**File:** `/app/my-tickets/page.tsx`

**Problem:**
- Complex on-chain enrichment logic (lines 73-112)
- QR code state management mixed with UI
- Perk and collectible logic intertwined
- 3+ levels of nested conditionals

**New Structure:**
```
app/my-tickets/
├── page.tsx                        # Main orchestrator (~200 lines)
├── components/
│   ├── TicketCard.tsx              # Individual ticket display
│   ├── TicketPerksSection.tsx      # Perk tracking
│   ├── CollectiblePosterSection.tsx # Poster reveal
│   ├── TicketQRCodeSection.tsx     # QR code display
│   └── TicketFilters.tsx           # Filtering UI
└── hooks/
    ├── useTicketEnrichment.ts      # On-chain data fetching
    └── useTicketValidation.ts      # Validation logic
```

**Actions:**
- [ ] Extract enrichment logic to hook (lines 73-112)
- [ ] Create TicketCard component
- [ ] Create specialized sections (perks, QR, poster)
- [ ] Simplify main page component
- [ ] Fix TODO at line 229: "Implement blockchain NFT fetching"

**TDD Approach:**
- Mock blockchain calls
- Test ticket enrichment logic
- Test QR code generation
- Test perk consumption validation
- Test collectible poster reveal

**Key Refactoring:**
```typescript
// Before (line 168)
new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

// After
const DEFAULT_EVENT_DAYS_AHEAD = 30;
addDays(new Date(), DEFAULT_EVENT_DAYS_AHEAD).toISOString()
```

---

### 3.4 Refactor VenueDashboard (395 lines → 6 files)

**File:** `/components/dashboard/venue/VenueDashboard.tsx`

**Problem:**
- Multiple sub-components defined in same file
- Global window manipulation for slug passing
- Mix of data transformation and rendering

**Actions:**
- [ ] Extract `StatsGrid` to separate file
- [ ] Extract `EventColumn` to separate file
- [ ] Extract `PosterQueue` to separate file
- [ ] Extract `PayoutsList` to separate file
- [ ] Extract `SupportPanel` to separate file
- [ ] Create `VenueDashboardHeader` component
- [ ] Create `useVenueChecklist` hook
- [ ] Remove window global manipulation

**TDD Approach:**
- Test each extracted component
- Test checklist logic
- Mock venue data
- Test loading and error states

---

### 3.5 Refactor ProfileSetupPage (409 lines → 5 steps)

**File:** `/app/profile/setup/page.tsx`

**Problem:**
- 4-step wizard with 10+ state variables
- Wallet prompt logic mixed with form
- Hardcoded 18 genre options

**Actions:**
- [ ] Create step components (WalletSetup, PersonalInfo, MusicPreferences, Location)
- [ ] Extract to `useProfileSetupForm` hook
- [ ] Move genres to `/lib/constants/genres.ts`
- [ ] Create ProfileSetupWizard orchestrator

---

### 3.6 Refactor OnrampPurchaseFlow (356 lines → 4 flows)

**File:** `/components/checkout/OnrampPurchaseFlow.tsx`

**Problem:**
- Multiple checkout flows mixed together
- Complex balance checking logic
- 7+ state variables for different concerns

**Actions:**
- [ ] Split into DirectPurchaseFlow, FundingFlow, GuestOnrampFlow
- [ ] Create `useCheckoutFlow` hook
- [ ] Create `useBalanceCheck` hook
- [ ] Simplify email and wallet validation

---

## Phase 4: Security Hardening

**Duration:** 2-3 days
**Can Run in Parallel:** No (critical path)
**Priority:** Critical

### 4.1 Auth Token Security

**Problem:** Auth tokens stored in localStorage vulnerable to XSS

**Current Implementation:** `/lib/api/client.ts:25-28`
```typescript
localStorage.setItem('auth_token', token);
```

**Actions:**
- [ ] Implement HTTP-only cookie authentication
  - Create `/app/api/auth/cookie/route.ts`
  - Update login/register routes to set cookies
  - Remove localStorage token usage

- [ ] Implement CSRF protection
  - Generate CSRF tokens on login
  - Validate tokens on state-changing operations
  - Add CSRF middleware to all POST/PUT/DELETE routes

- [ ] Add secure session management
  - Session timeout after 30 minutes idle
  - Refresh token mechanism
  - Logout endpoint that clears cookies

**Testing:**
- Security testing with OWASP ZAP
- Test CSRF protection
- Test session expiration
- Test cookie security flags (httpOnly, secure, sameSite)

---

### 4.2 Missing Authorization Checks

**Problem:** TODO comments indicate missing auth on sensitive endpoints

**Actions:**
- [ ] **Poster API Authorization** (lines 66, 44, 84, 177, 33)
  - `/app/api/posters/upload/route.ts:66` - Add venue staff verification
  - `/app/api/posters/generate/route.ts:44` - Add venue staff verification
  - `/app/api/posters/variants/route.ts:84,177` - Add venue staff verification
  - `/app/api/posters/refine/route.ts:33` - Add venue staff verification

- [ ] **Cron Job API Keys** (lines 12)
  - `/app/api/advocacy/send-emails/route.ts:12` - Add API key validation
  - `/app/api/serper/sync/route.ts:12` - Add API key validation
  - Create `/lib/middleware/withApiKey.ts`

- [ ] **Admin Endpoints** (line 7)
  - `/app/api/admin/support/venue/current/route.ts:7` - Implement JWT auth
  - Verify admin role before allowing access

**Implementation:**
```typescript
// Example: /app/api/posters/upload/route.ts
export const POST = withAuth(
  withRoleVerification(['venue', 'staff']),
  async (request: NextRequest) => {
    // ... upload logic
  }
);
```

**Testing:**
- Test unauthorized access returns 401
- Test wrong role returns 403
- Test valid auth succeeds

---

### 4.3 Environment Variable Validation

**Problem:** No validation of required environment variables on startup

**Actions:**
- [ ] Create `/lib/config/env.ts` with Zod validation
  ```typescript
  import { z } from 'zod';

  const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    MINTING_WALLET_PRIVATE_KEY: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
    NEXT_PUBLIC_API_BASE_URL: z.string().url(),
    SENTRY_DSN: z.string().url().optional(),
    // ... all required env vars
  });

  export const env = envSchema.parse(process.env);
  ```

- [ ] Add startup validation in `/instrumentation.ts`
- [ ] Ensure no private keys are ever logged
  - Add `privateKey` to list of redacted fields in logger

**Testing:**
- Test startup fails with missing required vars
- Test private key format validation
- Verify no keys in logs

---

### 4.4 Security Audit Action Items

**Additional Security Improvements:**
- [ ] Implement rate limiting on all public endpoints
  - Use existing `/lib/utils/rateLimit.ts`
  - Add to login, register, checkout endpoints

- [ ] Proxy external API calls through backend
  - Move OpenStreetMap call from client to API route
  - `/components/profile/LocationSection.tsx:40`

- [ ] Input sanitization
  - Add XSS protection to all user inputs
  - Sanitize before database writes

- [ ] Add Content Security Policy headers
  - Configure in `next.config.ts`
  - Prevent inline script execution

**Testing:**
- Penetration testing checklist
- OWASP Top 10 verification
- Security headers validation

---

## Phase 5: Performance Optimization

**Duration:** 3-4 days
**Can Run in Parallel:** Yes
**Priority:** Medium

### 5.1 React Performance Optimizations

**Problem:** Missing useCallback, memo issues, dependency array problems

**Actions:**
- [ ] **Add useCallback to handlers** (20+ locations)
  - `/components/profile/LocationSection.tsx:26` - handleGetCurrentLocation
  - All event handlers passed as props
  - All handlers in large components (MyTicketsPage, NewEventPage)

- [ ] **Fix memo components** (SearchBar, others)
  - `/components/SearchBar.tsx:119` - highlightMatch should use useCallback
  - Review all React.memo components for proper optimization

- [ ] **Fix dependency arrays** (15+ useEffect hooks)
  - `/app/my-tickets/page.tsx:113` - Missing dependencies
  - Add eslint exhaustive-deps checks
  - Review all useEffect hooks

- [ ] **Optimize list keys** (avoid index keys)
  - `/app/my-tickets/page.tsx:406` - Perk list using index
  - Use unique IDs for all list items

- [ ] **Reduce complex state mutations**
  - `/app/my-tickets/page.tsx:180-202` - Extract to reducer
  - Convert complex setState to useReducer

**Testing:**
- React DevTools Profiler analysis
- Measure render counts before/after
- Performance benchmarks

---

### 5.2 Bundle Optimization

**Problem:** Large bundle size affecting load times

**Actions:**
- [ ] Implement code splitting
  - Lazy load poster generation components
  - Lazy load QR scanner
  - Lazy load venue dashboard
  - Use Next.js dynamic imports

- [ ] Optimize images
  - Convert all `<img>` to Next.js `<Image>`
  - Add proper width/height attributes
  - Implement lazy loading for below-fold images

- [ ] Analyze bundle with `@next/bundle-analyzer`
  ```bash
  npm install --save-dev @next/bundle-analyzer
  # Add to next.config.ts
  ```

- [ ] Tree-shake unused imports
  - Review all imports for unused exports
  - Enable tree-shaking in production builds

**Testing:**
- Lighthouse performance score (target: 90+)
- Bundle size comparison before/after
- First Contentful Paint (FCP) < 1.5s
- Time to Interactive (TTI) < 3.0s

---

### 5.3 Database Optimization

**Problem:** Potential N+1 queries, missing indexes

**Actions:**
- [ ] Add database indexes
  - Review Prisma schema for missing indexes
  - Add indexes on foreign keys
  - Add indexes on frequently queried fields (email, wallet address)

- [ ] Optimize Prisma queries
  - Review all queries for N+1 problems
  - Use `include` strategically
  - Implement select for specific fields only

- [ ] Implement connection pooling
  - Configure PgBouncer for PostgreSQL
  - Adjust Prisma connection limits

- [ ] Add query performance monitoring
  - Log slow queries (>100ms)
  - Add Prisma middleware for timing

**Testing:**
- Database query analysis
- Load testing with k6 or Artillery
- Measure query times before/after

---

## Phase 6: Complete Feature TODOs

**Duration:** 4-6 days
**Can Run in Parallel:** Yes (independent features)
**Priority:** High

### 6.1 NFT Minting Service Migration (Phase 3.1)

**File:** `/lib/services/NFTMintingService.ts`
**TODO:** Lines 4, 92 in `/app/api/checkout/create-charge/route.ts`

**Problem:** Current implementation uses ethers.js, needs viem migration

**Actions:**
- [ ] Rewrite NFTMintingService with viem/wagmi
  - Replace ethers.js imports with viem
  - Update wallet client initialization
  - Convert contract interactions to viem
  - Update transaction signing

- [ ] Test minting flow end-to-end
  - Test on Base Sepolia testnet
  - Verify metadata is correct
  - Verify token transfer

- [ ] Update webhooks to use new service
  - `/app/api/webhooks/coinbase-onramp/route.ts:229,240,241,305`

**Testing:**
- Integration tests with local Hardhat node
- Testnet deployment and minting
- Gas estimation validation

---

### 6.2 Email Service Integration

**File:** `/lib/services/EmailService.ts`
**TODOs:** Lines 74, 106-108, 121

**Problem:** Email service integration incomplete

**Actions:**
- [ ] Choose email provider (SendGrid, Resend, AWS SES)
- [ ] Implement email templates
  - Welcome email
  - Ticket confirmation
  - Event reminder
  - Advocacy tier achievement

- [ ] Complete EmailService methods
  - Fix `sendAdvocacyEmail` integration
  - Fix `sendEventReminder` integration
  - Add retry logic for failed sends

- [ ] Test email delivery
  - Use test mode in development
  - Verify HTML rendering
  - Test all email types

**Testing:**
- Email delivery tests
- Template rendering tests
- Verify no spam flags

---

### 6.3 Stripe Payment Methods Integration

**File:** `/components/profile/PaymentMethodsSection.tsx`
**TODO:** Lines 5, 18

**Problem:** Stripe integration needed for payment method management

**Actions:**
- [ ] Integrate Stripe Payment Methods API
- [ ] Create payment method attach/detach endpoints
- [ ] Implement Stripe Elements for card input
- [ ] Display saved payment methods
- [ ] Add default payment method selection

**Testing:**
- Test card tokenization
- Test payment method CRUD operations
- Test PCI compliance

---

### 6.4 Blockchain NFT Fetching

**File:** `/app/my-tickets/page.tsx`
**TODO:** Line 229

**Problem:** On-chain ticket fetching not implemented

**Actions:**
- [ ] Implement blockchain data fetching with viem
- [ ] Query ERC1155 balance for user wallet
- [ ] Fetch token metadata from contract
- [ ] Display on-chain vs off-chain tickets
- [ ] Handle chain switching (Base mainnet/testnet)

**Testing:**
- Test with mock contract data
- Test on testnet
- Test error handling for network issues

---

### 6.5 Additional Feature TODOs

**Lower Priority TODOs:**
- [ ] Implement Embla Carousel (`/components/GenreCarousel.tsx:3`)
- [ ] Fix GenrePicker rendering (`/components/GenrePicker.tsx:3-8`)
- [ ] Complete geolocation functionality (`/components/profile/LocationSection.tsx:5`)
- [ ] Add Event description field to schema (`/app/events/[id]/page.tsx:110`)
- [ ] Add Artist schema fields (`/app/artists/[slug]/page.tsx:75,78`)
- [ ] Review advocacy tier rewards (`/lib/config/advocacyTiers.ts:7`)
- [ ] Implement real leaderboard data (`/app/advocate/leaderboard/page.tsx:7`)
- [ ] Add staff user ID to scanning (`/lib/services/TicketScanService.ts:137`)
- [ ] Implement error tracking service (`/lib/utils/apiError.ts:192`)
- [ ] Fix user auth in venue dashboard (`/app/dashboard/venue/page.tsx:22,83`)
- [ ] Fix checklist completion flow (`/app/venues/[slug]/checklist/[task]/route.ts:12`)

---

### 6.6 Venue Capacity Management & Onboarding Integration

**Status:** Planned (Technical Debt)
**TODO:** Lines added to roadmap 2025-10-23
**Priority:** Medium
**Complexity:** ⭐⭐ MEDIUM

**Problem:** Event capacity is currently set manually in the database. It should be configured during venue onboarding and optionally imported from external APIs.

**Current State (Temporary - Hackathon Demo):**
- Capacity manually set in EventTicketType table per event
- No connection to venue's actual capacity
- No API integration for venue data
- No validation against venue's physical limits

**Proper Implementation:**

**1. Venue Onboarding Flow**
When venue signs up:
- Set default venue capacity (Venue.capacity field)
- Options:
  - Manual entry (for small venues, clubs)
  - Import from external API (Google Places, Yelp, venue-specific APIs)
  - Fetch from venue management system (if applicable)
- Store capacity metadata:
  - Total capacity
  - Standing room capacity
  - Seated capacity
  - VIP/special sections capacity
  - Fire marshal limits

**2. Event Creation Improvements**
When creating an event (app/events/new/page.tsx):
- Pre-fill ticket tier capacities from Venue.capacity
- Show venue capacity as guideline
- Allow per-tier capacity override (GA: 80, VIP: 20)
- Validate: Sum of tier capacities ≤ venue capacity
- Warning if exceeding venue limit
- Option to override with justification (outdoor events, etc.)

**3. External API Integration Options**

**Google Places API:**
```typescript
// Fetch venue data by place_id
const venueData = await fetch(
  `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${API_KEY}`
);
// Extract capacity hints from venue type, reviews, etc.
```

**Ticketmaster API:**
- If venue already lists events on Ticketmaster
- Fetch historical capacity data
- Use as baseline for Unchained events

**Eventbrite API:**
- Similar to Ticketmaster
- Fetch venue metadata
- Import capacity limits

**Venue-Specific APIs:**
- Some venues have their own APIs (stadiums, large venues)
- Direct integration for real-time capacity data

**4. Capacity Validation & Warnings**

**During Event Creation:**
```typescript
// Example validation
if (totalTierCapacity > venue.capacity) {
  showWarning(
    `Total capacity (${totalTierCapacity}) exceeds venue limit (${venue.capacity}).
    Please adjust tier capacities or verify with venue.`
  );
}

// Fire marshal compliance
if (totalTierCapacity > venue.fireCodeLimit) {
  showError(
    `Cannot exceed fire code limit of ${venue.fireCodeLimit} attendees.
    This is a safety requirement.`
  );
}
```

**During Ticket Sales:**
- Real-time capacity checks (already implemented)
- Cross-event capacity checks (if venue has multiple concurrent events)
- Reserved vs. available capacity tracking

**Actions:**
- [ ] **Add capacity fields to Venue model:**
  ```prisma
  model Venue {
    // ... existing fields
    defaultCapacity      Int?         // Total venue capacity
    standingCapacity     Int?         // Standing room only
    seatedCapacity       Int?         // Seated capacity
    fireCodeLimit        Int?         // Legal maximum (fire marshal)
    capacitySource       CapacitySource? // manual, api, imported
    capacityLastUpdated  DateTime?
  }

  enum CapacitySource {
    manual       // Venue owner entered manually
    google_places
    ticketmaster
    eventbrite
    venue_api
    imported     // CSV/bulk import
  }
  ```

- [ ] **Update venue onboarding checklist:**
  - Add capacity configuration step
  - Show external API import options
  - Validate capacity is set before allowing event creation

- [ ] **Improve event creation form (app/events/new/page.tsx):**
  - Pre-fill tier capacities from venue default
  - Show venue capacity in sidebar
  - Real-time validation as user adjusts tiers
  - Warning UI for capacity mismatches

- [ ] **Build external API integrations:**
  - Google Places API service (/lib/services/GooglePlacesService.ts)
  - Ticketmaster API service (optional)
  - Venue data import UI

- [ ] **Add capacity override workflow:**
  - Allow venue to override capacity per event
  - Require justification (outdoor event, temporary seating, etc.)
  - Log overrides for safety compliance

**UI/UX Considerations:**
- **Venue Onboarding:**
  - Step: "Set Venue Capacity"
  - Options: Manual entry, Import from Google, Skip (set later)
  - Helpful hints: "Your capacity affects how many tickets can be sold"

- **Event Creation:**
  - Sidebar shows: "Venue Capacity: 500"
  - Tier capacity inputs auto-suggest reasonable splits
  - Live total: "Total: 450 / 500" with progress bar
  - Red warning if exceeding capacity

- **Admin Dashboard:**
  - Venue capacity overview
  - Events by capacity utilization
  - Flag oversold events (shouldn't happen but just in case)

**Technical Considerations:**
- Google Places API has quota limits (research pricing)
- Cache venue data to avoid repeated API calls
- Handle venues with variable capacity (outdoor, flexible seating)
- Consider seasonal capacity changes (outdoor venues)

**Testing:**
- Test manual capacity entry
- Test Google Places API import
- Test event creation with various capacity scenarios
- Test capacity validation (undersold, at capacity, oversold)
- Test concurrent event capacity conflicts

**Estimated Effort:** 3-4 hours
- Venue model updates: 30 min
- Venue onboarding UI: 1 hour
- Event creation improvements: 1 hour
- Google Places integration: 1 hour
- Testing: 30 min

**Dependencies:** None (can be implemented anytime)

**Future Enhancements:**
- Real-time capacity sync for multi-vendor venues
- Capacity analytics (utilization trends, pricing optimization)
- Dynamic capacity adjustments (add/remove sections based on demand)
- Integration with venue booking systems

---

### 6.7 Ticket Reservation System with Timeout (Phase 2)

**Status:** Planned (Phase 2 - Future Enhancement)
**TODO:** Lines added to roadmap 2025-10-23
**Priority:** Medium
**Complexity:** ⭐⭐ MEDIUM

**Problem:** Users cannot "reserve" tickets during browsing/checkout flow. Tickets only assigned on final purchase, which works but lacks cart-style UX.

**Current Implementation (Phase 1 - Completed 2025-10-23):**
- ✅ Atomic seat assignment prevents duplicates
- ✅ Tickets assigned at purchase time with retry logic
- ✅ Capacity enforced via database count + validation
- ✅ Sequential numbering per tier (e.g., VIP 001, VIP 002, ...)
- ✅ Race condition handling with exponential backoff

**Phase 2 Enhancement Goals:**
- Add "reserved" status during checkout
- Implement 5-minute reservation timeout
- Background job to release expired reservations
- Update checkout flow to reserve on "Buy" click

**Actions:**
- [ ] **Add Ticket fields** (schema migration required):
  ```prisma
  reservedUntil: DateTime?  // When reservation expires
  reservedBy: String?        // Session ID or user ID
  ```

- [ ] **Create background job** (cron or queue):
  - Run every 1 minute
  - Find tickets WHERE status='pending_checkout' AND reservedUntil < now()
  - Update status to 'cancelled', clear seat assignment
  - Release seat number back to pool for reuse

- [ ] **Update checkout flow**:
  - On "Buy" click: Create ticket with status='pending_checkout', reservedUntil=now()+5min
  - On payment success: Update status to 'confirmed' or 'minted'
  - On payment failure/timeout: Status auto-cancelled by background job
  - Add reservation heartbeat (extend timeout on user activity)

- [ ] **Add reservation UI indicators**:
  - Show countdown timer during checkout
  - Display message: "This ticket is reserved for you for 4:32"
  - Show low availability warning if <5 tickets remaining
  - Notify user when timer is almost expired (30 seconds left)

- [ ] **Update TicketReservationService**:
  - Add `reserveTicket()` function for cart-style reservations
  - Add `extendReservation()` function to refresh timeout
  - Add `releaseReservation()` function for manual release
  - Update capacity checks to exclude pending_checkout tickets

**Technical Considerations:**
- Use database indexes on `(status, reservedUntil)` for efficient background job queries
- Consider using Redis for countdown timers if at scale
- Handle edge case: user completes payment after timeout (fail gracefully)
- Add Sentry alerts if background job fails (tickets stuck in pending state)

**Testing:**
- Load test with concurrent reservations (100+ simultaneous users)
- Verify timeout releases tickets correctly
- Test payment within/beyond timeout window
- Test reservation extension (user active during checkout)
- Verify seat numbers are reused after cancellation

**Estimated Effort:** 2-3 hours
**Dependencies:** None (can be implemented anytime)

---

### 6.8 Poster Storage Migration to Cloud (Phase 2)

**Status:** Planned (Phase 2 - After MVP)
**TODO:** Lines added to roadmap 2025-10-24
**Priority:** Medium
**Complexity:** ⭐⭐ MEDIUM

**Problem:** AI-generated posters currently stored as base64 data URIs in database. This works for MVP but has limitations:
- Large database size (base64 increases size by ~33%)
- Slow queries when fetching events with posters
- No CDN caching
- Difficult to serve optimized images (WebP, AVIF)

**Current Implementation (MVP):**
```typescript
// Stored in EventPosterVariant.imageUrl
imageUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg..." // ~1-2MB per poster
```

**Target Implementation (Phase 2):**
```typescript
// Stored as cloud URL
imageUrl: "https://cdn.unchained-tickets.com/posters/event-123/vip-vintage.webp"
```

**Implementation Steps:**

**1. Cloud Storage Setup:**
- Choose provider: AWS S3, Cloudinary, or Vercel Blob Storage
- Create bucket/container for posters
- Configure CDN (CloudFront, Cloudinary CDN, etc.)
- Set up environment variables

**2. Upload Service:**
```typescript
// lib/services/PosterStorageService.ts
export async function uploadPosterToCloud(
  base64Data: string,
  eventId: number,
  tierName: string
): Promise<string> {
  // 1. Decode base64 to buffer
  const buffer = Buffer.from(base64Data.split(',')[1], 'base64');

  // 2. Optimize image (convert to WebP, compress)
  const optimizedBuffer = await sharp(buffer)
    .webp({ quality: 85 })
    .toBuffer();

  // 3. Upload to cloud storage
  const key = `posters/event-${eventId}/${tierName}-${Date.now()}.webp`;
  const url = await uploadToS3(optimizedBuffer, key);

  return url;
}
```

**3. Migration Script:**
```typescript
// scripts/migrate-posters-to-cloud.ts
// Migrate existing base64 posters to cloud storage
// - Fetch all EventPosterVariant records with base64 URLs
// - Upload each to cloud storage
// - Update database with new URLs
// - Verify all images accessible
// - Delete base64 data (after backup)
```

**4. Update Generation Flow:**
```typescript
// In PosterGenerationService
const base64Image = await generateWithStabilityAI(prompt);

// NEW: Upload to cloud instead of storing base64
const cloudUrl = await uploadPosterToCloud(base64Image, eventId, tierName);

// Store cloud URL in database
imageUrl: cloudUrl  // Instead of base64Image
```

**5. Image Optimization:**
- Generate multiple sizes (thumbnail, medium, full)
- Serve WebP with PNG fallback
- Lazy loading on frontend
- CDN caching headers

**Benefits:**
- ✅ Reduced database size (URL is ~100 bytes vs 1-2MB base64)
- ✅ Faster queries (no large TEXT columns)
- ✅ CDN caching (faster load times)
- ✅ Optimized formats (WebP, AVIF)
- ✅ Easy to regenerate/replace images

**Actions:**
- [ ] Choose cloud storage provider (S3 recommended)
- [ ] Set up bucket and CDN configuration
- [ ] Create PosterStorageService with upload/delete methods
- [ ] Update PosterGenerationService to use cloud storage
- [ ] Create migration script for existing posters
- [ ] Test image serving and CDN caching
- [ ] Update frontend to handle cloud URLs
- [ ] Document cloud storage setup in README

**Estimated Effort:** 3-4 days

---

### 6.9 Ticket Waitlist & Smart Queuing (Phase 3)

**Status:** Planned (Phase 3 - Future Enhancement)
**TODO:** Lines added to roadmap 2025-10-23
**Priority:** Low
**Complexity:** ⭐⭐⭐ HIGH

**Problem:** When event sells out, interested users have no recourse. No way to capture demand or notify on cancellations/timeouts.

**Use Cases:**
- Event sells out → users can join waitlist instead of giving up
- Reservation times out → notify next person in line
- Someone cancels ticket → offer to waitlist automatically
- Venue adds more capacity → notify waitlist in order

**Implementation:**

**1. Database Schema:**
```prisma
model TicketWaitlist {
  id              Int      @id @default(autoincrement())
  eventId         Int
  ticketTypeId    Int
  userId          Int?
  email           String
  phoneNumber     String?
  notifyMethod    NotifyMethod  // email, sms, both
  position        Int           // Queue position (1 = first in line)
  notifiedAt      DateTime?     // When we sent availability notification
  expiresAt       DateTime?     // 5min window to purchase after notification
  status          WaitlistStatus // waiting, notified, purchased, expired, cancelled
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  event         Event            @relation(fields: [eventId], references: [id])
  ticketType    EventTicketType  @relation(fields: [ticketTypeId], references: [id])
  user          User?            @relation(fields: [userId], references: [id])

  @@index([eventId, ticketTypeId, status, position])
  @@index([status, expiresAt])
}

enum NotifyMethod {
  email
  sms
  both
}

enum WaitlistStatus {
  waiting      // In queue, not yet notified
  notified     // Notification sent, 5min window active
  purchased    // Successfully purchased ticket
  expired      // Notification window expired, moved to back of queue
  cancelled    // User cancelled waitlist entry
}
```

**2. Waitlist Signup Flow:**
- User tries to buy sold-out ticket → Show waitlist signup form
- Collect: email, phone (optional), notification preference
- Add to waitlist with queue position (next available number)
- Send confirmation email: "You're #42 in line for VIP tickets"

**3. Availability Notification Flow:**
When ticket becomes available (timeout, cancellation, capacity increase):
- Query: Find first person in line WHERE status='waiting'
- Update status to 'notified', set expiresAt = now() + 5min
- Reserve ticket for them (using Phase 2 reservation system)
- Send notification:
  - **Email**: "Good news! A VIP ticket is now available. You have 5 minutes to claim it."
  - **SMS** (optional): "Your ticket is ready! Click here to purchase: [link]"
- Include unique purchase link with token (pre-fills checkout, bypasses waitlist)

**4. Purchase Window Management:**
- User clicks link → Auto-add ticket to cart with 5min timer
- If they complete purchase → Update waitlist status to 'purchased'
- If timer expires → Update status to 'waiting', move to back of queue (or 'expired' to remove)
- Notify next person in line

**5. Queue Management:**
- Background job runs every minute:
  - Find expired notifications (expiresAt < now() AND status='notified')
  - Release their reservations
  - Notify next person in line
- Admin dashboard to view waitlist:
  - See all people waiting
  - Manually remove entries
  - Send bulk notifications (e.g., when capacity increases)

**Actions:**
- [ ] Create TicketWaitlist model and migration
- [ ] Build waitlist signup UI component
  - Modal/form when "Buy" clicked on sold-out tier
  - Collect email, phone, notification preference
  - Show queue position after signup
  - Allow user to cancel waitlist entry

- [ ] Implement notification service:
  - Email integration (SendGrid, Resend, AWS SES)
  - SMS integration (Twilio) - optional
  - Template for availability notification
  - Template for position updates ("You're now #5 in line")

- [ ] Create waitlist management dashboard (admin/venue):
  - View current waitlist for event
  - See queue positions and statuses
  - Manually notify users
  - Bulk add capacity and notify waitlist

- [ ] Build waitlist queue processor:
  - Background job (cron or BullMQ queue)
  - Detect ticket availability
  - Notify next person in line
  - Handle notification expiration
  - Requeue expired notifications

- [ ] Add webhook integrations:
  - Listen for ticket cancellations
  - Listen for capacity increases
  - Trigger waitlist processor on these events

- [ ] Build unique purchase link system:
  - Generate signed JWT tokens for purchase links
  - Validate token on checkout
  - Pre-fill checkout with reserved ticket
  - Expire token after 5 minutes

**UI/UX Considerations:**
- Show waitlist position prominently ("You're #12 in line")
- Update position in real-time (or on page refresh)
- Allow users to cancel waitlist entry
- Show estimated wait time (based on historical data)
- Send position update emails periodically ("You're now #5!")

**Technical Considerations:**
- Use queue system (BullMQ, Bull) for reliable processing
- Implement idempotency for notifications (don't spam users)
- Rate limit notifications to avoid triggering spam filters
- Handle edge case: multiple people in line when multiple tickets become available
- Add analytics: track waitlist conversion rate, average wait time

**Testing:**
- Test queue ordering (FIFO - first in, first out)
- Test notification delivery (email + SMS)
- Test purchase window expiration
- Load test with high waitlist volume (500+ people)
- Test edge cases (event cancelled, capacity removed, duplicate notifications)
- Verify position updates when someone ahead purchases or leaves queue

**Estimated Effort:** 1-2 days
**Dependencies:**
- Phase 2 (Reservation system) should be completed first
- Email service integration
- SMS service integration (optional)
- Queue infrastructure (BullMQ or similar)

**Future Enhancements:**
- Waitlist analytics dashboard (conversion rate, demand forecasting)
- Smart queue ordering (prioritize loyal customers, VIPs, etc.)
- Auction-style pricing when high demand (dynamic pricing for waitlist)
- Waitlist for specific seats (not just tier)

---

## Phase 7: File Structure & Organization

**Duration:** 2-3 days
**Can Run in Parallel:** Yes
**Priority:** Medium

### 7.1 Reorganize Components Directory

**Current:** 74 files in `/components`, flat structure
**Problem:** Hard to navigate, unclear component ownership

**New Structure:**
```
components/
├── ui/                           # Base UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Modal.tsx
│   ├── Input.tsx
│   ├── SectionCard.tsx (new)
│   ├── EntityCard.tsx (new)
│   └── ...
│
├── layout/                       # Layout components
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── WalletControls.tsx
│   └── ...
│
├── features/                     # Feature-specific components
│   ├── profile/
│   │   ├── PersonalInfoSection.tsx
│   │   ├── ConnectedWalletsSection.tsx
│   │   ├── PaymentMethodsSection.tsx
│   │   └── ...
│   │
│   ├── checkout/
│   │   ├── EmailInput.tsx
│   │   ├── OnrampPurchaseFlow/
│   │   │   ├── index.tsx
│   │   │   ├── DirectPurchaseFlow.tsx
│   │   │   ├── FundingFlow.tsx
│   │   │   └── GuestOnrampFlow.tsx
│   │   └── WalletSavePrompt.tsx
│   │
│   ├── advocacy/
│   │   ├── AdvocacyInterstitial.tsx
│   │   ├── TierBadge.tsx
│   │   ├── ShareButtons.tsx
│   │   └── ImpactStats.tsx
│   │
│   ├── tickets/
│   │   ├── TicketCard.tsx
│   │   ├── TicketPerksSection.tsx
│   │   ├── CollectiblePosterSection.tsx
│   │   └── TicketQRCodeSection.tsx
│   │
│   └── venue-dashboard/
│       ├── VenueDashboard.tsx
│       ├── VenueOnboardingPanel.tsx
│       ├── PosterWorkflowManager/
│       └── VenueSeatMapManager.tsx
│
└── shared/                       # Shared business components
    ├── SearchBar.tsx
    ├── EventCard.tsx
    ├── ArtistCard.tsx
    ├── VenueCard.tsx
    └── ...
```

**Actions:**
- [ ] Create new directory structure
- [ ] Move components to appropriate folders
- [ ] Update all import statements
- [ ] Update barrel exports (index.ts files)

**Testing:**
- Verify all imports work
- Run full test suite
- Check build succeeds

---

### 7.2 Extract Constants & Configuration

**Problem:** Magic numbers and hardcoded values scattered throughout

**Actions:**
- [ ] Create `/lib/constants/events.ts`
  ```typescript
  export const DEFAULT_EVENT_DAYS_AHEAD = 30;
  export const EVENT_RARITY_THRESHOLDS = {
    VIP: 2.0,
    PREMIUM: 1.5,
    STANDARD: 1.0,
  };
  ```

- [ ] Create `/lib/constants/posters.ts`
  ```typescript
  export const POSTER_STYLES = [
    'cyberpunk', 'neon', 'retro', 'minimalist', 'grunge'
  ];
  export const POSTER_DIMENSIONS = {
    width: 1080,
    height: 1920,
  };
  ```

- [ ] Create `/lib/constants/advocacy.ts`
  - Review and finalize tier reward values (TODO: advocacyTiers.ts:7)

- [ ] Create `/lib/constants/ui.ts`
  ```typescript
  export const LAYOUT_BREAKPOINTS = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  };
  export const GRID_COLUMNS = {
    mobile: 1,
    tablet: 2,
    desktop: 3,
  };
  ```

- [ ] Create `/lib/constants/genres.ts`
  - Move 18 genre options from ProfileSetupPage

**Actions:**
- [ ] Search codebase for hardcoded values
- [ ] Extract to appropriate constant files
- [ ] Update all references

---

### 7.3 Utilities Organization

**Current:** Mixed utilities in `/lib/utils/`
**Problem:** Hard to find related utilities

**New Structure:**
```
lib/utils/
├── auth/
│   ├── verifyAuth.ts
│   ├── verifyRole.ts
│   └── authHelpers.ts
│
├── formatting/
│   ├── dateFormatters.ts
│   ├── currencyFormatters.ts
│   ├── addressFormatters.ts
│   └── textFormatters.ts
│
├── validation/
│   ├── emailValidation.ts
│   ├── walletValidation.ts
│   └── formValidation.ts
│
└── errors/
    ├── ApiError.ts
    ├── handleApiError.ts
    └── errorLogger.ts
```

**Actions:**
- [ ] Create subdirectories
- [ ] Move utilities to appropriate folders
- [ ] Create barrel exports
- [ ] Update imports

---

## Phase 8: Testing & Documentation

**Duration:** 4-5 days
**Can Run in Parallel:** Yes
**Priority:** High

### 8.1 Comprehensive Test Suite

**Current State:** ~40% coverage, missing critical tests

**Test Pyramid Strategy:**
```
         /\
        /E2E\         (10% - Critical user flows)
       /------\
      /  API   \      (30% - Integration tests)
     /----------\
    / Unit Tests \    (60% - Hooks, utils, components)
   /--------------\
```

**Actions:**

#### Unit Tests (Target: 80% coverage)
- [ ] Test all custom hooks
  - `useEditableSection.test.ts`
  - `useApiErrorHandler.test.ts`
  - `useTicketEnrichment.test.ts`
  - `useCheckoutFlow.test.ts`
  - All other hooks in `/lib/hooks/`

- [ ] Test all utilities
  - Auth utilities
  - Formatting functions
  - Validation functions
  - Error handling

#### Component Tests (Target: 80% coverage)
- [ ] Test UI component library (100% coverage goal)
  - `SectionCard.test.tsx`
  - `EntityCard.test.tsx`
  - `EditButton.test.tsx`
  - All components in `/components/ui/`

- [ ] Test feature components
  - Profile sections
  - Checkout flow
  - Ticket display
  - Venue dashboard

- [ ] Accessibility tests with jest-axe
  - All UI components
  - All pages
  - Modal interactions
  - Keyboard navigation

#### Integration Tests (Target: 70% coverage)
- [ ] API route tests
  - Auth endpoints (login, register, logout)
  - Checkout endpoints (create charge, card charge)
  - Ticket endpoints (scan, validate)
  - Event endpoints (create, update, delete)
  - All 29 API routes

- [ ] Database integration tests
  - Prisma client operations
  - Transaction handling
  - Error cases

#### E2E Tests (Critical paths only)
- [ ] User flows
  - User registration and login
  - Profile setup wizard
  - Browse events and view details
  - Purchase tickets (checkout flow)
  - View tickets with QR codes
  - Scan ticket at event

- [ ] Venue flows
  - Venue dashboard access
  - Create new event
  - Generate event posters
  - View ticket sales

- [ ] Tools: Playwright or Cypress

**Testing Commands:**
```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run specific test file
npm run test -- TicketCard.test.tsx

# Watch mode for development
npm run test:watch

# E2E tests (after implementation)
npm run test:e2e
```

**Coverage Targets:**
- Overall: 80%
- Hooks: 85%
- Utils: 90%
- UI Components: 80%
- API Routes: 70%
- E2E: Critical paths covered

---

### 8.2 Documentation Updates

**Actions:**

#### API Documentation
- [ ] Document all API endpoints
  - Request/response schemas
  - Authentication requirements
  - Rate limiting
  - Error codes
  - Example requests

- [ ] Create `/docs/api/README.md`
- [ ] Generate OpenAPI/Swagger spec (optional)

#### Component Documentation
- [ ] Document component props and usage
  - JSDoc comments on all components
  - PropTypes or TypeScript interfaces
  - Usage examples

- [ ] Set up Storybook (optional)
  ```bash
  npx storybook@latest init
  ```
  - Story files for all UI components
  - Interactive component playground

#### Developer Guidelines
- [ ] Update `/docs/engineering/development-guidelines.md`
  - New project structure
  - Component organization
  - Naming conventions
  - Testing requirements
  - Git workflow

- [ ] Create architecture decision records (ADRs)
  - Document major refactoring decisions
  - Store in `/docs/architecture/`

#### Troubleshooting Guide
- [ ] Create `/docs/TROUBLESHOOTING.md`
  - Common errors and solutions
  - Development environment issues
  - Database connection problems
  - Blockchain integration issues

---

### 8.3 AI Context Document

**Create:** `/docs/AI_CONTEXT.md`

**Purpose:** Quick reference for AI coding assistants to understand the project

**Contents:**
- Project overview (what, why, how)
- Tech stack at a glance
- Architecture diagram (text-based)
- File structure guide
- Key patterns and conventions
- Database schema summary
- API routes overview
- Common tasks and where to find things
- Important gotchas
- Current TODO priorities
- How to run tests
- How to deploy

**Target:** Single page, succinct, easy to scan

---

## Risk Mitigation & Rollback Strategy

### High-Risk Changes

**1. Auth Token Migration (localStorage → cookies)**
- **Risk:** Break existing user sessions
- **Mitigation:**
  - Implement feature flag
  - Dual-mode support (read from both localStorage and cookies)
  - Gradual rollout
  - Monitor error rates
- **Rollback:** Revert to localStorage, restore previous auth flow

**2. Database Schema Changes**
- **Risk:** Data loss or corruption
- **Mitigation:**
  - Test migrations on staging database
  - Backup production database before migration
  - Write down migrations for rollback
  - Test rollback procedure
- **Rollback:** Run down migration, restore from backup

**3. NFT Minting Service Rewrite**
- **Risk:** Break ticket issuance
- **Mitigation:**
  - Extensive testing on testnet
  - Keep old service as fallback
  - Feature flag to switch between implementations
  - Monitor minting success rate
- **Rollback:** Switch feature flag back to old service

### General Rollback Strategy

**Git Branching:**
- Create branch per phase: `refactor/phase-1-foundation`
- Merge to `refactor/comprehensive-optimization` after testing
- Only merge to `main` after full QA

**Feature Flags:**
- Use environment variables for risky features
- Enable/disable without deployment

**Database Migrations:**
- Always write down migrations
- Test rollback in staging

**Deployment:**
- Deploy to staging first
- Smoke test all critical paths
- Monitor for 24 hours before production

---

## Success Metrics & KPIs

### Code Quality Metrics

| Metric | Before | Target | How to Measure |
|--------|--------|--------|----------------|
| Lines of Code | ~25,000 | ~17,500 (-30%) | `cloc` command |
| Test Coverage | 40% | 80% | `npm run test:coverage` |
| TypeScript Strict | Partial | 100% | `tsc --noEmit` |
| Bundle Size (First Load JS) | ~450 KB | ~380 KB (-15%) | Lighthouse, bundle analyzer |
| Lighthouse Performance | 70 | 90+ | Lighthouse CI |
| Lighthouse Accessibility | 85 | 95+ | Lighthouse CI |
| TODO Comments | 47 | 0 | Grep search |
| Console Statements | 69 | 0 (in production) | Grep search |
| `any` Type Usage | 50+ | 0 | TypeScript compiler |
| Largest Component | 2,400 lines | <300 lines | Line count |
| Unused Dependencies | 3 | 0 | `depcheck` |

### Performance Metrics

| Metric | Before | Target | How to Measure |
|--------|--------|--------|----------------|
| First Contentful Paint (FCP) | ~2.5s | <1.5s | Lighthouse |
| Time to Interactive (TTI) | ~5.0s | <3.0s | Lighthouse |
| Largest Contentful Paint (LCP) | ~3.5s | <2.5s | Lighthouse |
| Cumulative Layout Shift (CLS) | 0.15 | <0.1 | Lighthouse |
| Database Query Time (avg) | ~80ms | <50ms | Prisma logging |
| API Response Time (p95) | ~250ms | <150ms | Sentry performance |

### Development Velocity Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Time to Onboard New Dev | <4 hours | Documentation completeness |
| Time to Add New Component | <30 min | With component library |
| Time to Add New API Route | <15 min | With middleware |
| Time to Fix Bug (avg) | <2 hours | Better code organization |
| PR Review Time (avg) | <1 day | Smaller, focused PRs |

### Testing Metrics

| Category | Target | Measurement |
|----------|--------|-------------|
| Unit Test Coverage | 85% | Vitest coverage |
| Component Test Coverage | 80% | React Testing Library |
| Integration Test Coverage | 70% | API route tests |
| E2E Test Coverage | 100% critical paths | Playwright/Cypress |
| Accessibility Test Coverage | 100% UI components | jest-axe |

---

## Implementation Timeline

| Phase | Tasks | Duration | Dependencies | Parallel Work |
|-------|-------|----------|--------------|---------------|
| **Phase 1** | Foundation & Quick Wins | 2-3 days | None | ✓ All tasks |
| **Phase 2** | Extract Reusable Patterns | 4-5 days | Phase 1 complete | ✓ Hooks + Components |
| **Phase 3** | Refactor Monolithic Components | 6-8 days | Phase 2 (hooks/components) | ✓ Multiple components |
| **Phase 4** | Security Hardening | 2-3 days | Phase 1 complete | ✗ Critical path |
| **Phase 5** | Performance Optimization | 3-4 days | Phase 2 & 3 complete | ✓ Most tasks |
| **Phase 6** | Complete Feature TODOs | 4-6 days | Phase 4 complete | ✓ Independent features |
| **Phase 7** | File Structure & Organization | 2-3 days | Phase 3 complete | ✓ All tasks |
| **Phase 8** | Testing & Documentation | 4-5 days | All phases | ✓ Tests + Docs |

**Total Duration:** 27-37 days (4-6 weeks)

**Critical Path:** Phase 1 → Phase 4 → Phase 6 (10-12 days)

### Suggested Execution Order

**Week 1:**
- Start: Phase 1 (Foundation)
- Parallel: Phase 2 (Custom Hooks)

**Week 2:**
- Continue: Phase 2 (UI Components, Middleware)
- Start: Phase 3 (Begin refactoring largest components)

**Week 3:**
- Continue: Phase 3 (Finish component refactoring)
- Start: Phase 4 (Security Hardening) - Block other work

**Week 4:**
- Start: Phase 5 (Performance Optimization)
- Parallel: Phase 6 (Begin feature TODOs)

**Week 5:**
- Continue: Phase 6 (Complete feature TODOs)
- Start: Phase 7 (File Structure)

**Week 6:**
- Start: Phase 8 (Testing & Documentation)
- Final QA and deployment preparation

---

## Post-Refactoring Maintenance

### Ongoing Practices

**1. Code Review Standards**
- No component >300 lines
- No `any` types
- 80%+ test coverage for new code
- All new APIs must have middleware
- All new components use UI library

**2. Regular Audits**
- Monthly: Dependency updates
- Quarterly: Bundle size analysis
- Quarterly: Performance benchmarking
- Quarterly: Security audit

**3. Documentation**
- Update AI_CONTEXT.md with major changes
- Document all architectural decisions
- Keep API docs in sync with code

**4. Testing**
- Never merge without tests
- Run full suite before deploy
- Maintain 80%+ coverage

---

## Resources & References

### Tools
- **TypeScript:** https://www.typescriptlang.org/docs/
- **Vitest:** https://vitest.dev/
- **React Testing Library:** https://testing-library.com/react
- **Playwright:** https://playwright.dev/
- **Lighthouse CI:** https://github.com/GoogleChrome/lighthouse-ci
- **Bundle Analyzer:** https://www.npmjs.com/package/@next/bundle-analyzer

### Best Practices
- **React Performance:** https://react.dev/learn/render-and-commit
- **Next.js Performance:** https://nextjs.org/docs/app/building-your-application/optimizing
- **Prisma Best Practices:** https://www.prisma.io/docs/guides/performance-and-optimization
- **Security:** https://cheatsheetseries.owasp.org/

### Internal Docs
- `/docs/engineering/development-guidelines.md`
- `/docs/engineering/testing/e2e-testing-guide.md`
- `/docs/operations/security.md`

---

## Appendix: Detailed Finding

### A. DRY Violations (10+ Major Patterns)

1. **Profile Section Edit/Save Pattern** (4 components)
   - PersonalInfoSection.tsx
   - LocationSection.tsx
   - MusicPreferencesSection.tsx
   - SettingsSection.tsx

2. **Container Styling** (24 files)
   - Pattern: `bg-ink-800/50 border border-grit-500/30 rounded-lg p-6`

3. **Button Styling** (8+ instances)
   - Edit button pattern
   - Save/Discard button combo

4. **Input Field Styling** (6+ instances)
   - Repeated input className across profile sections

5. **Card Components** (3 files)
   - EventCard, ArtistCard, VenueCard

6. **API Route Error Handling** (29 files)
   - Identical try-catch-validation pattern

7. **Auth Verification Functions** (4 functions)
   - verifyAdmin, verifyArtist, verifyVenue, verifyArtistOrVenue

8. **Toast Notification Patterns** (59 occurrences)
   - Scattered error/success toasts

9. **Login/Register Duplication** (2 routes)
   - Similar validation and rate limiting

10. **Wallet Formatting** (multiple locations)
    - Address formatting and chain icon mapping

### B. Monolithic Components (15 Total)

| Component | Lines | Priority | Complexity |
|-----------|-------|----------|------------|
| NewEventPage | 2,400 | Critical | Very High |
| MyTicketsPage | 647 | High | High |
| PosterWorkflowManager | 582 | High | High |
| ProfileSetupPage | 409 | Medium | Medium |
| VenueDashboard | 395 | Medium | Medium |
| OnrampPurchaseFlow | 356 | High | High |
| ProfilePage | 328 | Medium | Medium |
| StaffScannerPage | 367 | Medium | Medium |
| EventsBrowser | 326 | Low | Medium |
| EventsPageClient | 304 | Low | Low |
| EventDetailPage | 304 | Low | Low |
| WalletMenu | 274 | Low | Low |
| SearchBar | 256 | Low | Medium |

### C. Security Issues

1. **localStorage Token Storage** - High Risk
2. **Missing Auth Checks** (6 endpoints) - High Risk
3. **No CSRF Protection** - High Risk
4. **No Environment Validation** - Medium Risk
5. **Potential XSS** (innerHTML usage) - Medium Risk
6. **Client-side External API Calls** - Low Risk

### D. Dependency Issues

**Unused:**
- qr (^0.5.2)
- sonner (^2.0.7)
- react-idle-timer (^5.7.2)

**Misplaced (should be devDependencies):**
- @next/eslint-plugin-next
- @types/bcrypt
- @types/jsonwebtoken
- eslint
- eslint-config-next

**Missing:**
- fuse.js (referenced in config)

**Outdated (23 packages):**
- See Phase 1.1 for list

---

## Questions & Contact

For questions about this roadmap:
- Review inline comments in code
- Check `/docs/AI_CONTEXT.md` for quick reference
- Consult `/docs/engineering/development-guidelines.md`
- Ask in team chat or GitHub discussions

---

**Document Version:** 1.0
**Created:** 2025-10-23
**Next Review:** After Hackathon
**Owner:** Development Team
