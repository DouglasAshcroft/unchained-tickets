# AI Concert Poster Generation

**Status**: ✅ Implemented
**Version**: 1.0
**API Provider**: Stability AI (v2beta)
**Model**: Stable Diffusion 3.5 Large

---

## Overview

Venues can generate unique, collectible concert posters for each ticket tier using AI. These posters become NFT artwork that ticket holders receive when they attend the event.

### Key Features

- ✨ **6 Pre-configured Styles** - Vintage, Modern, Grunge, Neon, Minimalist, Psychedelic
- 🎨 **Iterative Refinement** - Improve posters with plain English instructions
- ⚡ **Model Selection** - Choose between Ultra (quality) and Core (speed)
- 🎭 **Tier-Specific Enhancements** - Automatic visual upgrades for Premium/VIP tiers
- 🔄 **Multiple Iterations** - Refine as many times as needed
- 💾 **Full Audit Trail** - Track all generation attempts and refinements

---

## Complete Workflow

### Step 1: Create Event
Navigate to **Events → Create New Event** and fill in basic details, schedule, and ticket tiers.

### Step 2: Generate Initial Posters

1. **Select Ticket Tiers**
   - Check which tiers need posters (usually all)
   - Each tier gets a unique poster variant

2. **Choose Style**
   - **Vintage Concert Poster** - 1960s-70s psychedelic rock aesthetic
   - **Modern Geometric** - Clean contemporary design with gradients
   - **Grunge/Alternative** - 90s distressed textures and punk typography
   - **Neon Synthwave** - Retro-futuristic 1980s with neon colors
   - **Minimalist** - Swiss design with clean typography
   - **Psychedelic** - Trippy visuals with flowing shapes

3. **Add Custom Prompt** (Optional)
   ```
   Examples:
   - "include electric guitars"
   - "sunset colors and stage lighting"
   - "city skyline in background"
   - "band logo in corner"
   ```

4. **Click "Generate Posters"**
   - Wait 10-30 seconds per poster
   - AI combines style + event details + custom prompt
   - Each tier gets automatic enhancements:
     - **General Admission**: Standard vibrant palette (1.0x rarity)
     - **Premium**: Metallic highlights (1.5x rarity)
     - **VIP**: Gold/silver accents, luxury finish (2.0x rarity)

### Step 3: Review & Refine

After generation, you'll see a gallery of poster variants.

**For each poster:**

1. **Preview** the generated artwork
2. **Refine** if needed (see Refinement Guide below)
3. **Approve** when satisfied
4. **Delete** and regenerate if necessary

### Step 4: Refinement (Iterative Improvement)

If a poster isn't quite right, click **"✨ Refine This Poster"**

#### Refinement Dialog

1. **Original Poster Preview** - See what you're starting with

2. **Refinement Instructions** (Plain English)
   ```
   Good examples:
   ✅ "Make it darker and more moody"
   ✅ "Add more vibrant colors, especially blue and purple"
   ✅ "Include electric guitars in the foreground"
   ✅ "Change to warmer tones, sunset vibes"
   ✅ "Add stage lighting effects from above"
   ✅ "Make it more minimalist and clean"

   Too vague:
   ❌ "Make it better"
   ❌ "Fix it"

   Too technical:
   ❌ "Apply Gaussian blur with sigma=2.5"
   ❌ "Use RGB(120, 45, 200)"
   ```

3. **Quick Suggestions** - Click to insert common refinements:
   - "Make it darker and more moody"
   - "Add more vibrant colors"
   - "Include electric guitars in the foreground"
   - "Change to warmer tones, sunset vibes"
   - "Add stage lighting effects"
   - "Make it more minimalist and clean"
   - "Increase the psychedelic elements"
   - "Add city skyline in the background"

4. **Model Selection**
   - **Core** (Recommended for iteration)
     - Balanced quality
     - ~10 seconds generation
     - $0.03 per poster
     - Good for trying ideas

   - **Ultra** (Recommended for finals)
     - Highest quality
     - Best text rendering
     - ~30 seconds generation
     - $0.04 per poster
     - Use for approved versions

5. **Advanced Options** (Optional)
   - **Strength Slider**: Override auto-calculated refinement strength
     - 0.0 = Subtle tweaks (minor changes)
     - 0.5 = Balanced (default)
     - 1.0 = Major changes (almost new poster)
   - Leave at "Auto" for best results

6. **Click "Generate Refined Version"**
   - New variant appears in gallery
   - Original is preserved
   - Can refine the refined version
   - Unlimited iterations

### Step 5: Approval & Finalization

1. **Review all variants** for all tiers
2. **Approve one poster per tier**
3. **Cannot proceed** until all tiers have approved posters
4. **Approved posters** become NFT artwork

---

## Style Guide

### 1. Vintage Concert Poster

**Aesthetic**: 1960s-70s psychedelic rock
**Keywords**: Bold typography, vibrant colors, retro printing, ornate elements
**Best For**: Classic rock, indie folk, blues, jam bands
**Color Palette**: Warm oranges, yellows, reds, psychedelic patterns
**Typography**: Hand-drawn, flowing, ornate

**Example Prompts**:
- "vintage 1960s concert poster for {artist}"
- "psychedelic rock poster style"
- "retro printing techniques with vibrant colors"

### 2. Modern Geometric

**Aesthetic**: Clean contemporary design
**Keywords**: Geometric shapes, bold typography, gradients, clean lines
**Best For**: Electronic, pop, hip-hop, indie pop
**Color Palette**: Bold primary colors, vibrant gradients
**Typography**: Sans-serif, geometric, contemporary

**Example Prompts**:
- "modern minimalist concert poster"
- "geometric shapes and gradients"
- "contemporary design with bold typography"

### 3. Grunge/Alternative

**Aesthetic**: 90s grunge and alternative rock
**Keywords**: Distressed textures, torn paper, punk typography, high contrast
**Best For**: Alternative, punk, metal, grunge, indie rock
**Color Palette**: Dark grays, blacks, reds, high contrast
**Typography**: Distressed, punk, stencil-style

**Example Prompts**:
- "grunge concert poster with distressed textures"
- "90s alternative rock aesthetic"
- "punk typography and torn paper effects"

### 4. Neon Synthwave

**Aesthetic**: Retro-futuristic 1980s
**Keywords**: Neon colors, grid patterns, sunset gradients, glowing effects
**Best For**: Electronic, synthwave, retro-pop, EDM
**Color Palette**: Neon pink, cyan, purple, orange gradients
**Typography**: Chrome, neon glow, futuristic

**Example Prompts**:
- "synthwave concert poster with neon colors"
- "1980s retro futuristic aesthetic"
- "neon grid patterns and sunset gradients"

### 5. Minimalist

**Aesthetic**: Clean and simple Swiss design
**Keywords**: Typography focus, negative space, simple colors, elegant
**Best For**: Jazz, classical, acoustic, singer-songwriter
**Color Palette**: Monochrome or limited palette (2-3 colors)
**Typography**: Clean sans-serif, hierarchy, spacing

**Example Prompts**:
- "minimalist concert poster with clean typography"
- "Swiss design influence with negative space"
- "elegant simple design"

### 6. Psychedelic

**Aesthetic**: Mind-bending trippy visuals
**Keywords**: Flowing shapes, kaleidoscope patterns, vibrant rainbow colors, surreal
**Best For**: Jam bands, EDM, experimental, psychedelic rock
**Color Palette**: Rainbow spectrum, vibrant multi-color
**Typography**: Flowing, liquid, distorted

**Example Prompts**:
- "psychedelic concert poster with trippy visuals"
- "kaleidoscope patterns and flowing shapes"
- "surreal imagery with rainbow colors"

---

## Refinement Tips & Techniques

### Color Adjustments

**Make it Darker**:
```
"make it darker and more moody"
"reduce brightness, add shadows"
"darker atmosphere with deeper colors"
```

**Make it Brighter**:
```
"increase brightness and vibrancy"
"lighter, more energetic colors"
"add more light and glow effects"
```

**Change Color Scheme**:
```
"change to blue and purple tones"
"warmer colors, sunset vibes"
"cooler palette with cyan and blue"
"add more red and orange"
```

### Composition Changes

**Add Elements**:
```
"add electric guitars in the foreground"
"include city skyline in the background"
"add stage lighting from above"
"include band instruments"
"add crowd silhouettes at bottom"
```

**Remove/Simplify**:
```
"make it more minimalist"
"remove background elements, focus on typography"
"simplify composition"
"cleaner, less busy design"
```

### Style Modifications

**Increase Effect Intensity**:
```
"make it more psychedelic"
"increase grunge and distressed effects"
"more neon glow"
"enhance vintage aesthetic"
```

**Blend Styles**:
```
"add some grunge texture to this modern design"
"mix vintage aesthetic with neon colors"
"modern composition with psychedelic colors"
```

### Common Refinement Patterns

**First Generation Too Busy**:
```
Refinement: "make it more minimalist, remove background elements"
Strength: 0.5
```

**Colors Not Right**:
```
Refinement: "change to warmer tones with orange and red, sunset vibes"
Strength: 0.4
```

**Need More Energy**:
```
Refinement: "add stage lighting effects, more dynamic composition, brighter colors"
Strength: 0.6
```

**Too Generic**:
```
Refinement: "include electric guitars and drums in foreground, make it more rock and roll"
Strength: 0.5
```

---

## Technical Details

### API Configuration

**Provider**: Stability AI
**Endpoint**: `https://api.stability.ai/v2beta/stable-image/generate/{model}`
**Model Options**:
- `ultra` - SD 3.5 Large (8B parameters, highest quality)
- `core` - SD 3.5 Large (8B parameters, balanced)

**Authentication**: API key in environment variable `STABILITY_API_KEY`

### Generation Parameters

```typescript
{
  prompt: string,              // Main generation prompt
  negative_prompt: string,     // What to avoid
  aspect_ratio: "1:1",         // Square format for NFTs
  seed: number,                // Random seed (0-4294967295)
  output_format: "png",        // PNG for quality
  model: "ultra" | "core"      // Quality level
}
```

### Image-to-Image Parameters (Refinement)

```typescript
{
  prompt: string,              // Refined prompt
  negative_prompt: string,     // What to avoid
  image: string,               // Base64 of original
  strength: number,            // 0.0-1.0 (how much to change)
  aspect_ratio: "1:1",
  seed: number,
  output_format: "png",
  model: "ultra" | "core"
}
```

### Automatic Strength Calculation

The system analyzes refinement instructions to determine optimal strength:

**Minor Tweaks (0.3)**:
- Keywords: "slightly", "a bit", "little", "subtle", "tweak", "adjust"
- Example: "slightly brighter colors"

**Balanced Changes (0.5)**:
- Default when no keywords detected
- 1-3 specific changes mentioned
- Example: "add guitars, darker background"

**Multiple Changes (0.6)**:
- 4+ color or composition mentions
- Example: "make it darker, add purple, include guitars, city skyline background"

**Major Changes (0.7)**:
- Keywords: "completely", "totally", "different", "change", "replace", "new style"
- Example: "completely different style, make it grunge instead of vintage"

### Output Format

**Resolution**: 1024x1024px
**Format**: PNG (data URI)
**Size**: ~1.2-1.8MB per poster
**Storage**: Base64 data URIs (future: IPFS/CDN)

---

## Cost Estimates

### Per Event Pricing

**Example: 3-tier event (GA, Premium, VIP)**

**Initial Generation** (Core model):
- 3 posters × $0.03 = $0.09

**Refinements** (2 iterations per tier, Core):
- 6 refinements × $0.03 = $0.18

**Final Version** (upgrade to Ultra for approved):
- 3 posters × $0.04 = $0.12

**Total**: ~$0.39 per event

### Monthly Pricing (30 events)

- Low refinement (1 per tier): ~$8/month
- Medium refinement (2-3 per tier): ~$12/month
- High refinement (4-5 per tier): ~$18/month

### Cost Optimization Tips

1. **Use Core for iteration** - Only use Ultra for final approved version
2. **Start with good custom prompt** - Reduces refinement needs
3. **Choose right style first** - Changing styles requires regeneration
4. **Batch generate** - Generate all tiers at once

---

## Troubleshooting

### Generation Fails

**Error**: "AI poster generation is not configured"
**Solution**: Add `STABILITY_API_KEY` to `.env` file
```bash
STABILITY_API_KEY=sk-your-key-here
```

**Error**: "Stability.ai API error: 401"
**Solution**: API key is invalid. Get new key from platform.stability.ai

**Error**: "Stability.ai API error: 402"
**Solution**: Account has insufficient credits. Add credits at platform.stability.ai

### Quality Issues

**Problem**: Text looks blurry or wrong
**Solution**:
- Use Ultra model for final version
- Add to refinement: "no text in image, clean design"
- AI struggles with text - keep designs text-free

**Problem**: Posters don't match event vibe
**Solution**:
- Choose different style preset
- Add specific instructions: "include [instruments/venue type]"
- Use refinement to adjust mood: "more energetic" or "more intimate"

**Problem**: Colors are off
**Solution**:
- Refine with color instructions: "warmer tones, sunset colors"
- Try different style - each has different color palette
- Use strength 0.4-0.5 for color-only changes

### Refinement Not Working as Expected

**Problem**: Refinement changes too much
**Solution**:
- Lower strength manually (Advanced Options)
- Be more specific in instructions
- Make one change at a time

**Problem**: Refinement doesn't change enough
**Solution**:
- Increase strength manually (0.6-0.7)
- Use stronger keywords: "significantly darker", "completely change"
- Add more specific details

**Problem**: Infinite loop - keep refining
**Solution**:
- Accept "good enough" - perfection is impossible
- Try regenerating with different style
- Sometimes original is best - approve it
- Limit: System allows 10 refinements per variant

---

## Database Schema

### EventPosterVariant

```prisma
model EventPosterVariant {
  id               Int      @id @default(autoincrement())
  eventId          Int
  ticketTypeId     Int?
  variantName      String
  imageUrl         String
  rarityMultiplier Float    @default(1.0)
  generationPrompt String?
  isApproved       Boolean  @default(false)

  // Refinement tracking
  parentVariantId     Int?
  parentVariant       EventPosterVariant?
  refinedVariants     EventPosterVariant[]
  refinementPrompt    String?
  refinementCount     Int     @default(0)
  refinementStrength  Float?

  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}
```

### PosterGenerationRequest

```prisma
model PosterGenerationRequest {
  id                 Int       @id @default(autoincrement())
  eventId            Int
  venueId            Int
  ticketTypeId       Int?
  prompt             String
  provider           String
  status             String
  resultImageUrl     String?

  // v2beta parameters
  model              String?
  aspectRatio        String?
  seed               Int?
  outputFormat       String?

  // Refinement tracking
  parentRequestId        Int?
  parentRequest          PosterGenerationRequest?
  refinements            PosterGenerationRequest[]
  refinementInstructions String?
  refinementStrength     Float?

  estimatedCostCents Int?
  createdAt          DateTime  @default(now())
  completedAt        DateTime?
}
```

---

## API Endpoints

### POST /api/posters/generate

Generate initial posters for ticket tiers.

**Request**:
```json
{
  "eventId": 123,
  "venueId": 456,
  "ticketTypeIds": [1, 2, 3],
  "style": "vintage",
  "customPrompt": "include electric guitars"
}
```

**Response**:
```json
{
  "success": true,
  "variants": [
    {
      "ticketTypeId": 1,
      "variantName": "General Admission - Vintage",
      "imageUrl": "data:image/png;base64,...",
      "rarityMultiplier": 1.0
    }
  ]
}
```

### POST /api/posters/refine

Refine existing poster with instructions.

**Request**:
```json
{
  "variantId": 789,
  "refinementInstructions": "make it darker, add more purple",
  "strength": 0.5,
  "model": "core"
}
```

**Response**:
```json
{
  "success": true,
  "variant": {
    "ticketTypeId": 1,
    "variantName": "General Admission - Refined",
    "imageUrl": "data:image/png;base64,...",
    "rarityMultiplier": 1.0
  }
}
```

### GET /api/posters/variants?eventId={id}

Get all poster variants for an event.

**Response**:
```json
{
  "variants": [
    {
      "id": 789,
      "variantName": "VIP - Vintage",
      "imageUrl": "data:image/png;base64,...",
      "isApproved": true,
      "ticketType": {
        "id": 1,
        "name": "VIP Pass"
      },
      "createdAt": "2025-10-24T10:30:00Z"
    }
  ]
}
```

### PUT /api/posters/variants

Approve or reject poster variant.

**Request**:
```json
{
  "variantId": 789,
  "action": "approve",
  "eventId": 123
}
```

---

## Future Enhancements

### Phase 2 (Q1 2026)

- [ ] **IPFS Storage** - Store posters on decentralized storage
- [ ] **Batch Operations** - Generate multiple events at once
- [ ] **Style Mixing** - Blend two styles (e.g., vintage + neon)
- [ ] **Reference Images** - Upload image as style reference
- [ ] **Prompt Templates** - Save and reuse custom prompts
- [ ] **A/B Testing** - Generate multiple variants, let fans vote
- [ ] **Rarity Tiers** - Generate rare/legendary variants (1% chance)

### Phase 3 (Q2 2026)

- [ ] **Video Posters** - Animated NFT posters
- [ ] **3D Posters** - AR-compatible poster NFTs
- [ ] **Collaborative Design** - Artist + venue co-creation
- [ ] **Fan Submissions** - Community-created posters
- [ ] **Merchandise Integration** - Print-ready poster exports

---

## Support & Resources

**Documentation**: `/docs/features/AI_POSTER_GENERATION.md`
**API Reference**: `/docs/api/POSTERS.md`
**Troubleshooting**: See above
**Feature Requests**: GitHub Issues

**Contact**:
- Technical Support: support@unchained.tickets
- API Issues: api@unchained.tickets
- Billing: billing@unchained.tickets

---

**Last Updated**: October 24, 2025
**Version**: 1.0
**Status**: ✅ Production Ready
