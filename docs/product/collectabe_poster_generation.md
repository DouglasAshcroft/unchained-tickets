Claude’s Plan
Stability AI Concert Poster Generation Integration Plan (Enhanced)
Overview
Build a complete venue-facing AI poster generation system with iterative refinement capabilities. Venues can generate initial posters from pre-configured styles, then provide custom refinement guidance to perfect the artwork through multiple iterations.
Key Enhancement: Refinement Guidance System
Venues can:
Generate initial posters from 6 pre-configured styles
Review generated posters
Provide text-based refinement instructions (e.g., "make it darker", "add more blue", "include guitars")
Get back modified versions while preserving the original
Iterate multiple times until satisfied
Approve final version for NFT minting
Current State Analysis
✅ Already Built (Partially):
PosterGenerationService.ts - Service with refineGeneration() at line 356
/api/posters/generate - Basic generation endpoint
PosterWorkflowManager.tsx - UI component (missing refinement UI)
API key in .env (line 143)
❌ Critical Issues:
API key validation bug (line 258): apiKey.includes('sk-') blocks ALL valid keys
Using outdated API: stable-diffusion-xl-1024-v1-0 (2023) instead of v2beta Ultra/Core (2024)
No refinement API endpoint - refineGeneration() service exists but no /api/posters/refine route
No refinement UI - PosterWorkflowManager missing "Refine" button and dialog
No image-to-image support for iterative refinement
No tests for any poster generation code
Missing parameters: aspect_ratio, seed, output_format, negative_prompt
API Migration: v1 → v2beta
Current (Outdated):
// Line 271-299
'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image'
New (Recommended):
// Use v2beta with Ultra or Core model
'https://api.stability.ai/v2beta/stable-image/generate/ultra'
// OR for faster/cheaper
'https://api.stability.ai/v2beta/stable-image/generate/core'
Key Parameters to Add:
aspect_ratio: "1:1" (posters), "16:9", "2:3" etc.
seed: 0-4294967295 (for reproducibility)
output_format: "png" or "jpeg"
negative_prompt: Separate parameter (not in main prompt)
image: Base64 input for image-to-image refinement
strength: 0.0-1.0 (denoise level for img2img)
Implementation Plan (TDD Approach)
Phase 1: Fix Critical Bugs & Upgrade API (2-3 hours)
1.1 Fix API Key Validation Bug
File: lib/services/PosterGenerationService.ts:258 Current Bug:
if (!apiKey || apiKey.includes('your_') || apiKey.includes('sk-')) {
  // This ALWAYS triggers for valid Stability keys (all start with 'sk-')
Fix:
if (!apiKey || apiKey === 'your_api_key_here' || apiKey.length < 20) {
  // Dev mode: use placeholder
}
1.2 Upgrade to v2beta API
File: lib/services/PosterGenerationService.ts:253-322 Changes:
Update endpoint URL to v2beta
Change request body structure to match v2beta format
Add new parameters: aspect_ratio, seed, output_format
Split negative_prompt into separate parameter
Update response parsing (v2beta uses different structure)
New Request Format:
{
  prompt: string,
  negative_prompt: string,
  aspect_ratio: "1:1" | "16:9" | "2:3" | "3:2" | "4:5" | "5:4",
  seed: number (0-4294967295),
  output_format: "png" | "jpeg",
  model: "ultra" | "core" | "sd3"
}
1.3 Add Model Selection
Enhancement: Let venues choose quality vs speed
Ultra: Highest quality ($0.040/image, ~30s) - Best for final approved posters
Core: Balanced ($0.030/image, ~10s) - Good for initial generation
SD3: Budget option ($0.020/image, ~5s) - Fast iteration
Phase 2: Build Refinement System (4-5 hours)
2.1 Add Image-to-Image Support
New Function: lib/services/PosterGenerationService.ts
async function generateWithImageToImage(
  prompt: string,
  negativePrompt: string,
  baseImageUrl: string,
  strength: number = 0.5,
  requestId: number
): Promise<string>
v2beta Image-to-Image Endpoint:
POST https://api.stability.ai/v2beta/stable-image/generate/ultra
Request Body:
{
  prompt: string,
  negative_prompt: string,
  image: string, // Base64 data URI
  strength: 0.5,  // 0.0 = identical to input, 1.0 = ignore input
  seed: number,
  output_format: "png"
}
2.2 Enhanced refineGeneration() Function
Update: lib/services/PosterGenerationService.ts:356-443 Changes:
Accept refinementInstructions parameter (plain English)
Accept baseVariantId to get original image
Use image-to-image API with original poster as input
Combine original prompt + refinement instructions
Set strength based on how drastic the changes are
Store refinement history (chain of variants)
New Signature:
export async function refineGeneration(
  baseVariantId: number,      // Original variant to refine
  refinementInstructions: string,  // "make it darker, add more purple"
  strength?: number,          // Override auto-calculated strength
  model?: 'ultra' | 'core'    // Model to use for refinement
): Promise<GenerateResult>
2.3 Intelligent Prompt Building for Refinement
New Function: buildRefinementPrompt() Analyzes refinement instructions to:
Detect color changes → adjust color keywords in prompt
Detect style changes → adjust style modifiers
Detect composition changes → adjust layout terms
Calculate appropriate strength parameter (0.3-0.7 range)
Examples:
// Light refinement (strength: 0.3)
"make the colors slightly brighter"

// Medium refinement (strength: 0.5)
"add guitars in the foreground, change background to purple"

// Heavy refinement (strength: 0.7)
"completely different style, make it grunge instead of vintage"
2.4 Create Refinement API Endpoint
New File: app/api/posters/refine/route.ts
POST /api/posters/refine
Body: {
  variantId: number,           // Variant to refine
  refinementInstructions: string, // Plain English guidance
  strength?: number,           // Optional override
  model?: 'ultra' | 'core'
}
Response: {
  success: true,
  newVariant: {
    id: number,
    variantName: string,
    imageUrl: string,
    parentVariantId: number,  // Link to original
    refinementPrompt: string
  }
}
Following pattern from: app/api/posters/generate/route.ts
2.5 Add Refinement UI Component
New File: components/dashboard/venue/PosterRefinementDialog.tsx Features:
Modal dialog triggered by "Refine" button
Textarea for refinement instructions
Placeholder suggestions: "Try: 'add more vibrant colors', 'include instruments', 'darker atmosphere'"
Strength slider (optional advanced control)
Model selector (Ultra vs Core)
Loading state during generation
Preview of before/after side-by-side
"Keep This Version" vs "Try Again" buttons
Component Structure:
interface PosterRefinementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  variant: PosterVariant;  // Original variant
  onRefinementComplete: (newVariant: PosterVariant) => void;
}
2.6 Update PosterWorkflowManager
File: components/dashboard/venue/PosterWorkflowManager.tsx Add:
"Refine" button next to each variant (line ~545)
State for refinement dialog: const [refiningVariant, setRefiningVariant] = useState<PosterVariant | null>(null)
Import and render PosterRefinementDialog
Handler: handleRefineVariant(variant)
Show refinement history tree (parent → child variants)
Badge showing "Refined from X" on refined variants
Phase 3: Comprehensive Tests (TDD - 5-6 hours)
3.1 Service Layer Tests
New File: lib/services/__tests__/PosterGenerationService.test.ts Test Groups: A. API Key Validation (Fix Verification)
✅ Valid key (sk-6nVSA9...) → uses real API
✅ Missing key → uses placeholder
✅ Invalid key (your_api_key) → uses placeholder
B. v2beta API Integration
✅ Generates with Ultra model
✅ Generates with Core model
✅ Sends correct aspect_ratio parameter
✅ Sends separate negative_prompt
✅ Includes seed for reproducibility
✅ Returns PNG in base64 format
✅ Handles API errors gracefully
✅ Falls back to placeholder on timeout
C. Prompt Building (6 Styles)
✅ Vintage style includes psychedelic keywords
✅ Modern style includes geometric keywords
✅ Grunge style includes distressed keywords
✅ Neon style includes synthwave keywords
✅ Minimalist style includes clean typography
✅ Psychedelic style includes trippy visuals
✅ Custom prompt appends to base prompt
✅ Negative prompt excludes text/watermarks
D. Tier-Specific Enhancements
✅ GA tier: standard colors, 1.0x rarity
✅ Premium tier: metallic highlights, 1.5x rarity
✅ VIP tier: gold accents, 2.0x rarity
✅ Unknown tier defaults to GA
E. Refinement System
✅ refineGeneration() uses image-to-image API
✅ Combines original prompt + refinement instructions
✅ Calculates strength from instruction complexity
✅ Creates new variant linked to parent
✅ Preserves original variant (doesn't overwrite)
✅ Stores refinement prompt in database
✅ Handles missing base variant gracefully
F. Variant Management
✅ generatePosterVariants() creates DB records
✅ approvePosterVariant() updates isApproved
✅ getEventPosterVariants() returns sorted list
✅ getApprovedPosterForTicketType() filters correctly
✅ checkPosterWorkflowComplete() validates all tiers
Mock Strategy:
// Mock fetch for Stability.ai API
global.fetch = jest.fn((url) => {
  if (url.includes('v2beta/stable-image/generate')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        image: 'base64ImageData...',
        seed: 12345,
        finish_reason: 'SUCCESS'
      })
    });
  }
});

// Mock Prisma
jest.mock('@/lib/db/prisma', () => ({
  prisma: {
    posterGenerationRequest: { create: jest.fn(), update: jest.fn() },
    eventPosterVariant: { create: jest.fn(), findMany: jest.fn() },
    event: { findUnique: jest.fn() }
  }
}));
3.2 API Route Tests
New File: app/api/posters/__tests__/generate.test.ts
✅ POST with valid params returns variants
✅ POST without auth returns 401
✅ POST with missing fields returns 400
✅ POST with invalid style returns 400
✅ POST with model selection works
✅ GET returns available styles
✅ Service errors return 500
New File: app/api/posters/__tests__/refine.test.ts
✅ POST creates refined variant
✅ POST with invalid variantId returns 404
✅ POST without refinement text returns 400
✅ Strength parameter is respected
✅ Model parameter switches API endpoint
✅ Parent-child relationship is stored
✅ Refinement chain is tracked
New File: app/api/posters/__tests__/variants.test.ts
✅ GET returns all variants for event
✅ PUT approves variant
✅ PUT rejects/deletes variant
✅ Unauthorized access blocked
3.3 Component Tests
New File: components/dashboard/venue/__tests__/PosterRefinementDialog.test.tsx
✅ Renders when open
✅ Doesn't render when closed
✅ Textarea updates state
✅ Shows placeholder suggestions
✅ Strength slider updates value
✅ Model selector changes API call
✅ Loading state shows spinner
✅ Calls onRefine with correct params
✅ Disables submit when empty
✅ Closes on cancel
✅ Shows before/after preview
New File: components/dashboard/venue/__tests__/PosterWorkflowManager.test.tsx
✅ Loads poster styles on mount
✅ Tier selection works
✅ Custom prompt input updates
✅ Generate button triggers API call
✅ Shows loading during generation
✅ Displays variants in grid
✅ Approve button works
✅ Delete button works
✅ Refine button opens dialog
✅ Refinement creates new variant
✅ Shows parent-child relationship
✅ Progress bar calculates correctly
Phase 4: Database Schema Updates (1 hour)
4.1 Add Refinement Fields to PosterGenerationRequest
File: prisma/schema.prisma
model PosterGenerationRequest {
  // ... existing fields ...

  // New fields for v2beta
  model          String?   // 'ultra', 'core', 'sd3'
  aspectRatio    String?   // '1:1', '16:9', etc.
  seed           Int?      // For reproducibility
  outputFormat   String?   // 'png', 'jpeg'

  // Refinement tracking
  parentRequestId Int?
  parentRequest   PosterGenerationRequest? @relation("RequestRefinements", fields: [parentRequestId], references: [id])
  refinements     PosterGenerationRequest[] @relation("RequestRefinements")
  refinementInstructions String?
  strength        Float?   // img2img strength (0.0-1.0)
}
4.2 Add Refinement Fields to EventPosterVariant
model EventPosterVariant {
  // ... existing fields ...

  // Refinement chain
  parentVariantId Int?
  parentVariant   EventPosterVariant? @relation("VariantRefinements", fields: [parentVariantId], references: [id])
  refinedVariants EventPosterVariant[] @relation("VariantRefinements")
  refinementPrompt String?
  refinementCount  Int @default(0)  // How many iterations from original
}
Migration:
npx prisma migrate dev --name add_poster_refinement_fields
Phase 5: Integration into Event Creation Flow (3-4 hours)
5.1 Add Posters Step to Wizard
File: app/events/new/page.tsx Insert between Tickets and Review:
const steps = [
  { id: 'basics', name: 'Basics' },
  { id: 'schedule', name: 'Schedule' },
  { id: 'tickets', name: 'Tickets' },
  { id: 'posters', name: 'Posters' },  // NEW
  { id: 'review', name: 'Review' },
];
Add State:
const [posterVariants, setPosterVariants] = useState<PosterVariant[]>([]);
const [draftEventId, setDraftEventId] = useState<number | null>(null);
Create Draft Before Posters:
// When entering "Posters" step, save draft if not already saved
const handleEnterPostersStep = async () => {
  if (!draftEventId) {
    const draft = await createDraftEvent(formData);
    setDraftEventId(draft.id);
  }
};
Render Posters Step:
{currentStep === 'posters' && (
  <PosterWorkflowManager
    eventId={draftEventId!}
    venueId={formData.venueId}
    event={formData}
  />
)}
5.2 Validation: Block Submit Without Posters
const validatePostersStep = () => {
  const approvedCount = posterVariants.filter(v => v.isApproved).length;
  const tierCount = formData.ticketTypes.length;

  if (approvedCount < tierCount) {
    const missingTiers = formData.ticketTypes
      .filter(tier => !posterVariants.some(v => v.ticketTypeId === tier.id && v.isApproved))
      .map(t => t.name);

    return {
      posters: `All tiers must have approved posters. Missing: ${missingTiers.join(', ')}`
    };
  }

  return {};
};
Phase 6: Documentation (2 hours)
6.1 Feature Documentation
New File: docs/features/AI_POSTER_GENERATION.md Contents:
# AI Concert Poster Generation

## Overview
Venues can generate unique, collectible concert posters for each ticket tier using AI.

## Workflow

### 1. Initial Generation
- Select ticket tiers to generate posters for
- Choose a style (Vintage, Modern, Grunge, Neon, Minimalist, Psychedelic)
- Optional: Add custom prompt details
- Click "Generate" and wait 10-30 seconds

### 2. Review & Refine
- Review generated posters
- Click "Refine" to make changes
- Provide plain English instructions:
  - "Make it darker and more moody"
  - "Add electric guitars in the foreground"
  - "Change purple to blue, keep everything else"
- Generate refined version
- Repeat until satisfied

### 3. Approval
- Click "Approve" on final version
- Approved poster becomes the collectible NFT artwork

## Styles Explained

### Vintage Concert Poster
1960s-70s psychedelic rock aesthetic with bold typography and vibrant colors.
Best for: Classic rock, indie, folk

### Modern Geometric
Clean contemporary design with geometric shapes and gradients.
Best for: Electronic, pop, hip-hop

### Grunge/Alternative
90s grunge aesthetic with distressed textures and punk typography.
Best for: Alternative, punk, metal

### Neon Synthwave
Retro-futuristic 1980s aesthetic with neon colors and grid patterns.
Best for: Electronic, synthwave, retro-pop

### Minimalist
Swiss design influence with clean typography and negative space.
Best for: Jazz, classical, acoustic

### Psychedelic
Trippy visuals with flowing shapes and kaleidoscope patterns.
Best for: Jam bands, EDM, experimental

## Tier Enhancements

Each tier gets automatic enhancements:

**General Admission (1.0x rarity)**
- Standard vibrant color palette
- Clean finish

**Premium (1.5x rarity)**
- Bold colors with metallic highlights
- Enhanced details

**VIP (2.0x rarity)**
- Gold and silver accents
- Metallic sheen
- Luxury finish

## Refinement Tips

### Color Changes
✅ "Make it darker"
✅ "Add more blue and purple tones"
✅ "Warmer colors, sunset vibes"
❌ "Use RGB(120, 45, 200)" (too specific)

### Composition
✅ "Add guitars in the foreground"
✅ "Include city skyline in background"
✅ "More emphasis on the band name"
❌ "Move text 20px to the left" (too precise)

### Style Adjustments
✅ "Make it more grungy"
✅ "Increase neon glow effect"
✅ "Cleaner, more minimalist"
❌ "Apply Gaussian blur filter" (too technical)

## Model Selection

**Ultra** (Recommended for finals)
- Highest quality
- Best text rendering
- ~30 seconds
- $0.040/image

**Core** (Good for iteration)
- Balanced quality
- Fast generation
- ~10 seconds
- $0.030/image

## Technical Details

- **Resolution**: 1024x1024px
- **Format**: PNG
- **Storage**: Base64 data URI (future: IPFS)
- **API**: Stability.ai v2beta
- **Model**: Stable Diffusion 3.5 Large

## Cost Estimates

For an event with 3 tiers:
- Initial generation: $0.09-0.12
- 2 refinements per tier: $0.18-0.24
- **Total**: ~$0.30-0.40 per event

## Troubleshooting

**"Generation failed"**
- Check STABILITY_API_KEY in .env
- Verify API key is valid on platform.stability.ai
- Check account balance

**"Posters don't match my vision"**
- Use refinement feature instead of regenerating
- Provide specific, descriptive instructions
- Try different base styles
- Adjust strength slider (lower = more similar to original)

**"Text looks blurry"**
- Use Ultra model for final version
- Avoid including text in custom prompts (AI struggles with text)
- Negative prompt already excludes text

## Future Enhancements
- IPFS/cloud storage
- More style presets
- Batch generation for multiple events
- Style mixing (blend two styles)
- Reference image upload
6.2 Update Refactoring Plan
File: docs/product/NEW_EVENT_PAGE_REFACTORING_PLAN.md Mark Phase 3 (AI Poster Generation Integration) as ✅ COMPLETE with:
Test coverage: 85%+
Features implemented
Known issues
Future roadmap
Phase 7: Manual QA & Integration Testing (2-3 hours)
7.1 Test Suite Execution
# Run all poster generation tests
npm run test -- PosterGenerationService
npm run test -- api/posters
npm run test -- PosterRefinementDialog
npm run test -- PosterWorkflowManager

# Coverage report
npm run test:coverage -- --collectCoverageFrom='lib/services/PosterGenerationService.ts'
7.2 Manual E2E Workflow Test
✅ Start new event creation
✅ Fill basics, schedule, tickets (3 tiers: GA, Premium, VIP)
✅ Advance to Posters step (draft auto-saved)
✅ Select "Vintage" style
✅ Add custom prompt: "include electric guitars"
✅ Generate posters for all 3 tiers
✅ Wait for generation (~30-60 seconds total)
✅ Review generated posters
✅ Click "Refine" on VIP poster
✅ Enter: "make it darker, more purple, add stage lighting"
✅ Generate refined version
✅ Compare before/after
✅ Approve refined VIP poster
✅ Approve GA and Premium posters as-is
✅ Advance to Review step
✅ Submit event
✅ Verify posters appear in database
✅ Check NFT metadata includes poster URLs
7.3 Edge Case Testing
✅ Generate with no custom prompt
✅ Try all 6 styles
✅ Refine multiple times (3+ iterations)
✅ Switch between Ultra and Core models
✅ Test with API key missing (placeholder mode)
✅ Test with invalid API key (error handling)
✅ Delete variant after refinement
✅ Approve, then unapprove
✅ Create event with 1 tier, 5 tiers
✅ Mobile responsive testing
File Structure After Implementation
lib/
  services/
    PosterGenerationService.ts          (MAJOR UPDATE)
    __tests__/
      PosterGenerationService.test.ts   (NEW - 500+ lines)

app/
  api/
    posters/
      generate/route.ts                 (UPDATE - add model param)
      refine/route.ts                   (NEW)
      variants/route.ts                 (VERIFY)
      upload/route.ts                   (EXISTS)
      __tests__/
        generate.test.ts                (NEW)
        refine.test.ts                  (NEW)
        variants.test.ts                (NEW)

  events/
    new/
      page.tsx                          (UPDATE - add posters step)

components/
  dashboard/
    venue/
      PosterWorkflowManager.tsx         (UPDATE - add refine button)
      PosterRefinementDialog.tsx        (NEW)
      __tests__/
        PosterWorkflowManager.test.tsx  (NEW)
        PosterRefinementDialog.test.tsx (NEW)

prisma/
  schema.prisma                         (UPDATE - add refinement fields)
  migrations/
    YYYYMMDDHHMMSS_add_poster_refinement_fields/ (NEW)

docs/
  features/
    AI_POSTER_GENERATION.md             (NEW)
  product/
    NEW_EVENT_PAGE_REFACTORING_PLAN.md  (UPDATE)

.env                                    (VERIFY - has API key)
.env.example                            (UPDATE - document key)
Detailed Changes Summary
API Migration Changes
Aspect	Old (v1)	New (v2beta)
Endpoint	/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image	/v2beta/stable-image/generate/ultra
Model	SDXL 1.0 (2023)	SD 3.5 Large (2024)
Prompt	Single text field	prompt + negative_prompt
Parameters	cfg_scale, steps, samples	aspect_ratio, seed, output_format
Response	artifacts[].base64	image (direct base64)
Quality	Good	Excellent
Speed	~30s	Ultra: ~30s, Core: ~10s
Cost	$0.002	Ultra: $0.040, Core: $0.030
New Functions
PosterGenerationService.ts:
// NEW
async function generateWithImageToImage(...): Promise<string>
function buildRefinementPrompt(basePrompt: string, instructions: string): { prompt: string, strength: number }
function calculateRefinementStrength(instructions: string): number

// UPDATED
async function generateWithStabilityAI(..., model: 'ultra' | 'core'): Promise<string>
async function refineGeneration(baseVariantId, instructions, strength?, model?): Promise<GenerateResult>
New API Routes:
POST /api/posters/refine
GET /api/posters/styles (exists, verify)
GET /api/posters/variants (exists, verify)
PUT /api/posters/variants (exists, verify)
New React Components:
PosterRefinementDialog
  - RefinementInstructionsInput
  - StrengthSlider
  - ModelSelector
  - BeforeAfterPreview
DRY Principles Applied
✅ Reuse Existing:
PosterWorkflowManager component structure
verifyAuth() for all API routes
Prisma models (extend, don't recreate)
Form validation patterns from eventSchemas.ts
UI components: Button, Modal, Card, LoadingSpinner
✅ Shared Logic:
Prompt building extracted to buildPromptFromEvent()
Refinement strength calculation centralized
Error handling patterns consistent across API routes
Test mocking utilities shared across test files
✅ Configuration Over Code:
Style presets in POSTER_STYLES object
Tier enhancements in TIER_ENHANCEMENTS object
Model configs: { ultra: {...}, core: {...} }
API endpoints from environment variables
TDD Workflow (Phase 2)
For each feature, follow this cycle:
1. ✅ Write test specification
     ↓
2. ✅ Write failing test (RED)
     ↓
3. ✅ Run test: npm run test
     ↓
4. ✅ Implement minimal code (GREEN)
     ↓
5. ✅ Run test: should pass
     ↓
6. ✅ Refactor code (REFACTOR)
     ↓
7. ✅ Run test: should still pass
     ↓
8. ✅ Move to next test
Example for refineGeneration():
// 1. Write failing test
describe('refineGeneration', () => {
  it('should use image-to-image API with base variant', async () => {
    // Arrange
    const baseVariant = createMockVariant();
    mockPrisma.eventPosterVariant.findUnique.mockResolvedValue(baseVariant);

    // Act
    await refineGeneration(baseVariant.id, 'make it darker');

    // Assert
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('v2beta/stable-image/generate/ultra'),
      expect.objectContaining({
        body: expect.stringContaining('"image":')
      })
    );
  });
});

// 2. Run test → ❌ FAILS (refineGeneration doesn't use img2img yet)

// 3. Implement feature
export async function refineGeneration(variantId, instructions) {
  const variant = await prisma.eventPosterVariant.findUnique({ where: { id: variantId } });
  const newPrompt = buildRefinementPrompt(variant.generationPrompt, instructions);
  const imageUrl = await generateWithImageToImage(
    newPrompt.prompt,
    variant.imageUrl,  // Pass original image
    newPrompt.strength
  );
  // ... create new variant
}

// 4. Run test → ✅ PASSES

// 5. Refactor (add types, error handling)

// 6. Run test → ✅ STILL PASSES
Estimated Timeline
Phase	Task	Time
1	Fix bugs & upgrade API	2-3 hours
2	Build refinement system	4-5 hours
3	Write comprehensive tests	5-6 hours
4	Database schema updates	1 hour
5	Integrate into event flow	3-4 hours
6	Documentation	2 hours
7	Manual QA & testing	2-3 hours
TOTAL		19-24 hours (2.5-3 days)
Success Criteria
✅ All tests pass with 85%+ coverage
✅ API key validation bug fixed
✅ Upgraded to v2beta API with Ultra/Core models
✅ Venues can generate initial posters from 6 styles
✅ Venues can refine posters with plain English instructions
✅ Image-to-image refinement preserves original while making changes
✅ Refinement chain is tracked (parent → child)
✅ Multiple iterations supported
✅ All 6 styles work correctly
✅ Custom prompts enhance generation
✅ Database stores refinement history
✅ UI shows before/after comparison
✅ No regression in existing features
✅ Mobile responsive
✅ Error handling for API failures
Risk Mitigation
Cost Control:
Ultra only for final approved versions
Core for iteration (3x cheaper than Ultra)
Warn venue before expensive operations
Track total generation cost per event
API Rate Limits:
Add exponential backoff retry logic
Queue system for bulk generation
Show estimated wait time to user
Large Images:
Document cloud storage as future enhancement
Base64 data URIs work for MVP (avg 1.4MB per poster)
Add TODO for IPFS migration
API Key Security:
Already in .env (not committed)
Server-side only (never sent to client)
Add warning if key detected in client code
Refinement Loops:
Limit refinements per variant (max 10)
Show warning after 3 refinements: "Consider trying a different style"
Track iteration count in database
Ready to implement with full refinement capabilities! 🎨🚀