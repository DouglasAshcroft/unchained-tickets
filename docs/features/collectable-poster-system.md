# Collectable Poster Reveal System - MVP Implementation

**Status**: ✅ Complete (Backend + Frontend + Event Creation Integration)
**Created**: 2025-10-19
**Last Updated**: 2025-10-20

## Overview

The Collectable Poster Reveal System is the final MVP milestone that transforms Unchained Tickets from a simple ticketing platform into a proof-of-attendance NFT collectible experience. Users who attend events can reveal exclusive tier-specific concert posters that become permanent collectibles.

**NEW**: Poster creation is now a **required step** in the event creation flow, ensuring all events have approved collectible artwork before tickets can be sold.

---

## Core Concept

### The Flow

#### For Venues (Event Creation)
1. **Create Event** → Fill in basics, schedule, venue, ticket tiers
2. **Generate Posters** → Select AI style or upload custom artwork
3. **Approve Posters** → Review and approve each tier's collectible poster
4. **Publish Event** → All tiers must have approved posters before publishing

#### For Attendees (Ticket Lifecycle)
1. **Purchase** → User buys NFT ticket (shows as mystery/unrevealed)
2. **Event Day** → Venue scans ticket, marks as USED on-chain
3. **Reveal** → NFT metadata updates to show exclusive collectible poster
4. **Collection** → User now owns a verified proof-of-attendance collectible

### Key Principles
- **Proof of Attendance Only**: ACTIVE tickets show mystery image
- **Tier-Based Rarity**: VIP tickets get rarer, more valuable posters
- **Venue Control**: Venues generate/upload posters with minimal effort
- **AI-Assisted**: Pre-configured prompts make generation easy
- **No Gas Costs**: All handled via metadata API (no contract changes needed)

---

## Technical Architecture

### Database Schema

**EventPosterVariant** - Stores poster artwork per tier
```prisma
model EventPosterVariant {
  id               Int      @id @default(autoincrement())
  eventId          Int
  ticketTypeId     Int?     // null = default for all tiers
  variantName      String   // "VIP Gold", "GA Standard"
  imageUrl         String   // Data URI or CDN URL
  rarityMultiplier Float    @default(1.0) // 1.0=GA, 1.5=Premium, 2.0=VIP
  generationPrompt String?  // AI prompt used
  isApproved       Boolean  @default(false)
  createdAt        DateTime
  updatedAt        DateTime
}
```

**PosterGenerationRequest** - Audit trail for AI generations
```prisma
model PosterGenerationRequest {
  id                 Int       @id @default(autoincrement())
  eventId            Int
  venueId            Int
  ticketTypeId       Int?
  prompt             String    // Full prompt sent to AI
  provider           String    // "replicate-sdxl"
  status             String    // pending, generating, completed, failed
  resultImageUrl     String?
  errorMessage       String?
  estimatedCostCents Int?      // Cost tracking (~$0.0025/image)
  createdAt          DateTime
  completedAt        DateTime?
}
```

---

## Services

### PosterGenerationService

**Location**: [lib/services/PosterGenerationService.ts](../../lib/services/PosterGenerationService.ts)

**Key Functions**:
- `generatePosterVariants()` - Generate AI posters for all tiers
- `refineGeneration()` - Regenerate with tweaked prompt
- `approvePosterVariant()` - Approve variant for use
- `buildPromptFromEvent()` - Smart prompt construction
- `checkPosterWorkflowComplete()` - Verify all tiers have posters

**Poster Styles** (6 presets):
1. **Vintage** - 1960s psychedelic rock aesthetic
2. **Modern** - Clean geometric contemporary
3. **Grunge** - 90s alternative distressed
4. **Neon** - Synthwave retro-futuristic
5. **Minimalist** - Swiss design typography-focused
6. **Psychedelic** - Trippy kaleidoscope patterns

**Tier Enhancements**:
- General Admission: Standard colors, 1.0x rarity
- Premium: Vivid colors with metallic highlights, 1.5x rarity
- VIP: Gold/silver accents, luxury finish, 2.0x rarity

**AI Provider**: Replicate (Stable Diffusion XL)
- Cost: ~$0.0025 per image
- Quality: 1024x1024 production-ready
- Speed: 10-30 seconds per generation
- No approval delays (instant API access)

---

## API Endpoints

### POST /api/posters/generate
Generate AI poster variants for an event

**Auth**: Venue staff required

**Request**:
```json
{
  "eventId": 123,
  "venueId": 456,
  "ticketTypeIds": [1, 2, 3],
  "style": "vintage",
  "customPrompt": "optional additional details"
}
```

**Response**:
```json
{
  "success": true,
  "variants": [
    {
      "ticketTypeId": 1,
      "variantName": "VIP - Vintage Concert Poster",
      "imageUrl": "data:image/svg+xml;base64,...",
      "rarityMultiplier": 2.0
    }
  ]
}
```

---

### POST /api/posters/upload
Upload custom poster image

**Auth**: Venue staff required

**Request**:
```json
{
  "eventId": 123,
  "venueId": 456,
  "ticketTypeId": 1,
  "variantName": "VIP Custom",
  "imageDataUri": "data:image/png;base64,...",
  "rarityMultiplier": 2.0
}
```

---

### GET /api/posters/variants?eventId=123
List all poster variants for an event

**Auth**: Public (for event details), write ops require auth

**Response**:
```json
{
  "variants": [
    {
      "id": 1,
      "variantName": "VIP Gold",
      "imageUrl": "...",
      "rarityMultiplier": 2.0,
      "isApproved": true,
      "ticketType": {
        "id": 1,
        "name": "VIP"
      },
      "createdAt": "2025-10-19T..."
    }
  ]
}
```

---

### PUT /api/posters/variants
Approve or reject a poster variant

**Auth**: Venue staff required

**Request**:
```json
{
  "variantId": 1,
  "action": "approve",
  "eventId": 123
}
```

**Side Effects**:
- If all tiers now have approved posters → auto-complete `poster_workflow` checklist task

---

### POST /api/posters/refine
Regenerate poster with refined prompt

**Auth**: Venue staff required

**Request**:
```json
{
  "requestId": 42,
  "newPrompt": "more vibrant colors, add guitar silhouette"
}
```

---

## Metadata API Integration

### Proof-of-Attendance Gating

**Location**: [app/api/metadata/[tokenId]/route.ts](../../app/api/metadata/[tokenId]/route.ts)

**Logic Flow**:
```typescript
1. Fetch ticket state from blockchain (ACTIVE, USED, SOUVENIR)
2. Look up ticket tier from Charge/Ticket records
3. Determine poster to show:
   - ACTIVE (0) → Show mystery image (/assets/posters/unrevealed-ticket.svg)
   - USED (1) → Show tier-specific collectible poster
   - SOUVENIR (2) → Show tier-specific collectible poster
4. Build metadata with:
   - Dynamic name/description based on state
   - Rarity multiplier attribute
   - Revealed status
   - Proof of Attendance verification
```

**Metadata Changes**:

Before attendance (ACTIVE):
```json
{
  "name": "Event Name - Ticket",
  "description": "Attend the event to reveal your exclusive collectible poster!",
  "image": "/assets/posters/unrevealed-ticket.svg",
  "attributes": [
    { "trait_type": "Revealed", "value": "No" },
    { "trait_type": "Proof of Attendance", "value": "Pending" }
  ]
}
```

After attendance (USED/SOUVENIR):
```json
{
  "name": "Event Name - Collectible VIP Poster",
  "description": "Collectible VIP poster... Rarity multiplier: 2.0x",
  "image": "data:image/svg+xml;base64,...", // Tier-specific poster
  "attributes": [
    { "trait_type": "Revealed", "value": "Yes" },
    { "trait_type": "Rarity Multiplier", "value": 2.0 },
    { "trait_type": "Proof of Attendance", "value": "Verified" },
    { "trait_type": "Ticket Tier", "value": "VIP" }
  ]
}
```

---

## Mystery Image Asset

**Location**: [public/assets/posters/unrevealed-ticket.svg](../../public/assets/posters/unrevealed-ticket.svg)

**Design**:
- Purple gradient background (indigo → violet)
- Lock icon (symbolizes unrevealed state)
- "Unrevealed Poster" text
- "Attend Event to Unlock" subtitle
- Grid pattern and decorative stars
- Professional, enticing mystery aesthetic

**Why SVG**:
- Scalable to any size
- Small file size (inline in repo)
- No external dependencies
- Consistent rendering across platforms

---

## Venue Checklist Integration

**Task**: `poster_workflow` (currently manual)

**Auto-Completion Logic**:
```typescript
// Triggered when approving a poster variant
if (allTicketTypesHaveApprovedPosters(eventId)) {
  await prisma.venueChecklistStatus.upsert({
    where: { venueId_task: { venueId, task: 'poster_workflow' } },
    update: { completedAt: now(), completedBy: userId },
    create: { venueId, task: 'poster_workflow', completedAt: now() }
  });
}
```

**Completion Criteria**:
- ✅ Every active ticket type has at least one approved poster variant
- ✅ Posters can be AI-generated or manually uploaded
- ✅ Completion is automatic (no manual checkbox needed)

---

## Environment Variables

Added to [.env.example](../../.env.example):

```bash
# AI Poster Generation (Replicate API)
# Get your API token from: https://replicate.com/account/api-tokens
REPLICATE_API_TOKEN=your_replicate_api_token_here
NEXT_PUBLIC_POSTER_GENERATION_ENABLED=true
```

**Setup Instructions**:
1. Sign up at [replicate.com](https://replicate.com)
2. Go to Account → API Tokens
3. Create new token
4. Add to `.env` file
5. No credit card required for first $5 worth of generations (~2000 images)

**Dev Mode**:
- If `REPLICATE_API_TOKEN` is not set or contains placeholder text
- Service falls back to SVG placeholders
- System still works end-to-end for testing
- No actual API calls or costs

---

## Frontend Components (Completed ✅)

### Event Creation Wizard - Poster Step ✅ **[PRIMARY WORKFLOW]**
**Purpose**: Integrated poster creation during event setup (REQUIRED before publish)

**Features**:
- ✅ 5-step wizard: Basics → Schedule → Tickets → **Posters** → Review
- ✅ Style picker with 6 preset AI options
- ✅ One-click generation for all ticket tiers
- ✅ Manual upload option for each tier
- ✅ Rarity badge display (VIP 2.0x, Premium 1.5x, Standard 1.0x)
- ✅ Inline approval workflow per tier
- ✅ Visual progress tracking (green = approved, default = pending)
- ✅ Validation: Blocks "Next" until all tiers approved
- ✅ Warning banner shows missing approvals
- ✅ Responsive grid layout (2 cols mobile, 5 cols desktop)

**Location**: [app/events/new/page.tsx](../../app/events/new/page.tsx) (lines 1727-2042)

**Why This Approach**:
- Prevents venues from forgetting to set up posters
- Ensures every ticket sold has a collectible ready to reveal
- Natural integration into event setup flow
- No manual follow-up needed after event creation

---

### PosterWorkflowManager Component ✅ **[LEGACY/OPTIONAL]**
**Purpose**: Venue dashboard interface for managing existing event posters

**Features**:
- ✅ Style picker (6 preset options)
- ✅ AI generation button with loading state
- ✅ Upload custom image option
- ✅ Variant gallery with approve/reject actions
- ✅ Refine prompt interface
- ✅ Real-time preview

**Location**: [components/dashboard/venue/PosterWorkflowManager.tsx](../../components/dashboard/venue/PosterWorkflowManager.tsx)

**Note**: This component is now primarily used for updating posters on existing events. New events use the integrated wizard step.

---

### Updated Components

**My Tickets Page** ✅:
- ✅ Display rarity multiplier on revealed tickets
- ✅ Visual distinction for collectible posters
- ✅ "Collectible Poster Locked" section for ACTIVE tickets
- ✅ "Collectible Poster" section with proof-of-attendance for USED/SOUVENIR
- ✅ Clean status indicators (no emoji badges per user request)

**Event Detail Page** ✅:
- ✅ Collectible poster info section
- ✅ "Attend to reveal your collectible!" messaging
- ✅ Showcase all ticket tiers with rarity levels
- ✅ Lock icon visual indicator
- ✅ Proof of attendance explanation

**Venue Dashboard** ✅:
- ✅ Integrate PosterWorkflowManager
- ✅ Show poster completion status
- ✅ Expandable workflow panel
- ✅ Quick access to poster management (for existing events)

---

## Cost Analysis

### Per-Event Costs (AI Generation)

**Scenario: Event with 3 tiers (GA, Premium, VIP)**
- 3 poster variants × $0.0025 = **$0.0075** total
- Refinements: $0.0025 per regeneration (optional)

**Monthly at Scale**:
- 100 events/month × 3 tiers = 300 images
- 300 × $0.0025 = **$0.75/month**

**Extremely affordable** - less than $10/month even at 1000+ events/month

---

## Migration Path

### From Current State → Poster System

**No Breaking Changes**:
- Existing tickets continue to work
- Metadata API remains backward compatible
- Old events without posters fall back to event.posterImageUrl

**Gradual Rollout**:
1. New events can opt-in to poster system
2. Existing events can retroactively add posters
3. Venues can test with one event before rolling out

---

## Testing Checklist

### Backend (Completed ✅)
- [x] Database schema migration applied
- [x] Prisma client generated
- [x] API endpoints created
- [x] Metadata API proof-of-attendance gating implemented
- [x] Unrevealed poster asset added

### Integration Tests (Pending)
- [ ] Generate posters for event with 3 tiers
- [ ] Upload custom poster variant
- [ ] Approve variant → checklist auto-completes
- [ ] Mint ticket → metadata shows mystery image
- [ ] Scan ticket (mark USED) → metadata shows collectible
- [ ] Batch transform to SOUVENIR → metadata persists reveal

### End-to-End User Flow (Pending)
- [ ] Venue creates event
- [ ] Venue generates posters (AI)
- [ ] Venue approves posters
- [ ] User purchases ticket (ACTIVE)
- [ ] NFT shows mystery image in wallet
- [ ] User attends event
- [ ] Venue scans ticket → state changes to USED
- [ ] NFT updates to show collectible poster
- [ ] Rarity multiplier visible on OpenSea/marketplaces

---

## Security Considerations

**API Key Protection**:
- ✅ REPLICATE_API_TOKEN stored in .env (never committed)
- ✅ Only server-side API calls
- ✅ No client-side exposure

**Venue Authorization** (Pending):
- ⚠️ TODO: Verify venue staff access before generation
- ⚠️ TODO: Ensure user can only generate for their venues
- ⚠️ TODO: Rate limiting on generation endpoint (prevent abuse)

**Image Storage**:
- ✅ Data URIs supported (base64 inline)
- 🔄 TODO: Migrate to IPFS for permanent storage
- 🔄 TODO: CDN integration for performance

---

## Future Enhancements

### Post-MVP Features

**1. IPFS Pinning**
- Permanent decentralized storage
- Immutable poster URLs
- Better for NFT marketplaces

**2. Multiple Variants Per Tier**
- Generate 3-5 options per tier
- Venues pick favorite
- Or: Random assignment for uniqueness

**3. Animated Posters**
- GIF/video collectibles for VIP tiers
- Higher rarity multipliers (5x, 10x)
- Premium tier differentiation

**4. Community Voting**
- Fans vote on poster designs pre-event
- Winning design used for collectibles
- Social engagement boost

**5. Poster Trading Marketplace**
- Filter by rarity, tier, artist
- Trade/sell collectibles
- Royalties on secondary sales

**6. Achievement Badges**
- Collect full tier set (GA + Premium + VIP)
- Attend X events by same artist
- Venue-specific collections

**7. Custom Artist Collaboration**
- Direct artist upload interface
- Artist signature on poster
- Artist royalties from collectibles

---

## Documentation References

**Related Files**:
- Schema: [prisma/schema.prisma](../../prisma/schema.prisma)
- Service: [lib/services/PosterGenerationService.ts](../../lib/services/PosterGenerationService.ts)
- Metadata API: [app/api/metadata/[tokenId]/route.ts](../../app/api/metadata/[tokenId]/route.ts)
- Environment: [.env.example](../../.env.example)

**External Resources**:
- [Replicate API Docs](https://replicate.com/docs)
- [Stable Diffusion XL Model](https://replicate.com/stability-ai/sdxl)
- [OpenSea Metadata Standards](https://docs.opensea.io/docs/metadata-standards)
- [ERC-1155 Spec](https://eips.ethereum.org/EIPS/eip-1155)

---

## Support & Troubleshooting

### Common Issues

**"AI poster generation is not configured"**
- Check `REPLICATE_API_TOKEN` is set in `.env`
- Verify token doesn't contain placeholder text
- Confirm token has API credits remaining

**"Metadata still shows mystery image after scan"**
- Verify ticket state changed on-chain (check contract)
- Ensure approved poster variant exists for ticket tier
- Check metadata API logs for errors

**"Checklist not auto-completing"**
- Verify ALL active ticket types have approved posters
- Check `VenueChecklistStatus` table for completion record
- Ensure `eventId` passed to approve endpoint

**"Generated posters look low quality"**
- Adjust prompt in refinement interface
- Try different style presets
- Ensure 1024x1024 minimum resolution

---

## Metrics to Track

**Success Indicators**:
- % of events with approved posters
- Average generation time per poster
- User engagement with revealed collectibles
- Secondary marketplace activity (if trading enabled)
- Venue satisfaction with poster quality
- Cost per poster over time

**Analytics to Add**:
- Poster generation requests per venue
- Approval rate (approved/generated)
- Refinement frequency (iterations before approval)
- Most popular poster styles
- Rarity distribution in circulation

---

## Contributors

- Initial implementation: 2025-10-19
- Feature design: Unchained Tickets team
- AI integration: Replicate (Stable Diffusion XL)

---

**Status**: ✅ Backend Complete | ✅ Frontend Complete | 📋 Testing Pending | ⚠️ Pre-existing lint errors prevent build
