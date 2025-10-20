import { prisma } from '@/lib/db/prisma';
import type { Event, EventTicketType } from '@prisma/client';

/**
 * PosterGenerationService
 * Handles AI-powered concert poster generation for collectable NFT reveals
 * Uses Replicate API with Stable Diffusion XL for high-quality poster art
 */

// Poster style presets optimized for concert posters
export const POSTER_STYLES = {
  vintage: {
    name: 'Vintage Concert Poster',
    description: '1960s-70s psychedelic rock poster aesthetic',
    stylePrompt: 'vintage 1960s psychedelic concert poster, bold typography, vibrant colors, retro printing techniques, ornate decorative elements',
  },
  modern: {
    name: 'Modern Geometric',
    description: 'Clean, contemporary design with geometric shapes',
    stylePrompt: 'modern minimalist concert poster, geometric shapes, bold typography, contemporary design, clean lines, vibrant gradients',
  },
  grunge: {
    name: 'Grunge/Alternative',
    description: '90s grunge and alternative rock aesthetic',
    stylePrompt: 'grunge concert poster, distressed textures, torn paper effects, bold punk typography, high contrast, gritty urban style',
  },
  neon: {
    name: 'Neon Synthwave',
    description: 'Retro-futuristic neon and synthwave vibes',
    stylePrompt: 'synthwave concert poster, neon colors, retro futuristic, grid patterns, sunset gradients, 1980s aesthetic, glowing effects',
  },
  minimalist: {
    name: 'Minimalist',
    description: 'Clean and simple with focus on typography',
    stylePrompt: 'minimalist concert poster, clean typography, simple color palette, negative space, elegant design, Swiss design influence',
  },
  psychedelic: {
    name: 'Psychedelic',
    description: 'Trippy, colorful, mind-bending visuals',
    stylePrompt: 'psychedelic concert poster, trippy visuals, flowing organic shapes, kaleidoscope patterns, vibrant rainbow colors, surreal imagery',
  },
} as const;

export type PosterStyle = keyof typeof POSTER_STYLES;

// Tier-specific color schemes and enhancements
const TIER_ENHANCEMENTS = {
  'General Admission': {
    colors: 'vibrant standard color palette',
    effects: 'clean finish',
    rarityMultiplier: 1.0,
  },
  'VIP': {
    colors: 'rich gold and silver accents, premium color palette',
    effects: 'metallic sheen, luxury finish',
    rarityMultiplier: 2.0,
  },
  'Premium': {
    colors: 'bold vivid colors with metallic highlights',
    effects: 'enhanced details, premium quality',
    rarityMultiplier: 1.5,
  },
} as const;

interface GeneratePosterParams {
  eventId: number;
  venueId: number;
  ticketTypeIds: number[];
  style: PosterStyle;
  customPrompt?: string;
}

interface GenerateResult {
  success: boolean;
  requestId?: number;
  variants?: Array<{
    ticketTypeId: number | null;
    variantName: string;
    imageUrl: string;
    rarityMultiplier: number;
  }>;
  error?: string;
}

/**
 * Build optimized prompt from event details and style
 */
export async function buildPromptFromEvent(
  event: Event & { artists?: Array<{ artist: { name: string; genre?: string | null } | null }> },
  ticketType: EventTicketType | null,
  style: PosterStyle,
  customPrompt?: string
): Promise<string> {
  const styleConfig = POSTER_STYLES[style];

  // Extract artist names and genre
  const artistNames = event.artists
    ?.map(a => a.artist?.name)
    .filter(Boolean)
    .join(' & ') || 'Live Concert';

  const genre = event.artists?.[0]?.artist?.genre || 'music';

  // Get tier-specific enhancements
  const tierName = ticketType?.name || 'General Admission';
  const tierEnhancement = TIER_ENHANCEMENTS[tierName as keyof typeof TIER_ENHANCEMENTS]
    || TIER_ENHANCEMENTS['General Admission'];

  // Build comprehensive prompt
  const parts = [
    // Core style
    styleConfig.stylePrompt,

    // Event-specific details
    `concert featuring ${artistNames}`,
    `${genre} music event`,

    // Tier-specific enhancements
    tierEnhancement.colors,
    tierEnhancement.effects,

    // Quality modifiers
    'professional poster design',
    'high quality artwork',
    'suitable for print',
    '4K resolution',
  ];

  // Add custom prompt if provided
  if (customPrompt?.trim()) {
    parts.push(customPrompt.trim());
  }

  // Negative prompt to avoid unwanted elements
  const negativePrompt = 'text, words, letters, watermark, logo, signature, blurry, low quality, distorted faces';

  return `${parts.join(', ')}. Negative prompt: ${negativePrompt}`;
}

/**
 * Generate poster variants for all tiers of an event
 */
export async function generatePosterVariants(
  params: GeneratePosterParams
): Promise<GenerateResult> {
  try {
    const { eventId, venueId, ticketTypeIds, style, customPrompt } = params;

    // Validate Replicate API token
    const apiToken = process.env.REPLICATE_API_TOKEN;
    if (!apiToken) {
      return {
        success: false,
        error: 'AI poster generation is not configured. Please add REPLICATE_API_TOKEN to environment variables.',
      };
    }

    // Fetch event with artists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        artists: {
          include: {
            artist: true,
          },
        },
        ticketTypes: {
          where: {
            id: ticketTypeIds.length > 0 ? { in: ticketTypeIds } : undefined,
          },
        },
      },
    });

    if (!event) {
      return { success: false, error: 'Event not found' };
    }

    const variants: GenerateResult['variants'] = [];

    // Generate poster for each tier
    for (const ticketType of event.ticketTypes) {
      const prompt = await buildPromptFromEvent(event, ticketType, style, customPrompt);

      // Create generation request record
      const request = await prisma.posterGenerationRequest.create({
        data: {
          eventId,
          venueId,
          ticketTypeId: ticketType.id,
          prompt,
          provider: 'replicate-sdxl',
          status: 'pending',
          estimatedCostCents: 1, // ~$0.0025 per image
        },
      });

      // In production, this would call Replicate API
      // For MVP, we'll use a placeholder that simulates the generation
      const imageUrl = await generateWithReplicate(prompt, request.id);

      // Update request status
      await prisma.posterGenerationRequest.update({
        where: { id: request.id },
        data: {
          status: 'completed',
          resultImageUrl: imageUrl,
          completedAt: new Date(),
        },
      });

      // Get tier rarity multiplier
      const tierName = ticketType.name;
      const rarityMultiplier = TIER_ENHANCEMENTS[tierName as keyof typeof TIER_ENHANCEMENTS]?.rarityMultiplier || 1.0;

      // Create poster variant (not approved yet - venue must review)
      const variant = await prisma.eventPosterVariant.create({
        data: {
          eventId,
          ticketTypeId: ticketType.id,
          variantName: `${ticketType.name} - ${POSTER_STYLES[style].name}`,
          imageUrl,
          rarityMultiplier,
          generationPrompt: prompt,
          isApproved: false,
        },
      });

      variants.push({
        ticketTypeId: variant.ticketTypeId,
        variantName: variant.variantName,
        imageUrl: variant.imageUrl,
        rarityMultiplier: variant.rarityMultiplier,
      });
    }

    return {
      success: true,
      variants,
    };
  } catch (error) {
    console.error('[PosterGenerationService] Error generating posters:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate posters',
    };
  }
}

/**
 * Call Replicate API to generate image
 * Uses Stable Diffusion XL model for high-quality results
 */
async function generateWithReplicate(prompt: string, requestId: number): Promise<string> {
  const apiToken = process.env.REPLICATE_API_TOKEN;

  // For MVP/dev mode, return a placeholder
  // In production, this would make actual API call
  if (!apiToken || apiToken.includes('your_replicate_api_token')) {
    console.log(`[PosterGeneration] DEV MODE - Would generate with prompt: ${prompt.substring(0, 100)}...`);
    // Return a data URI placeholder for development
    return generatePlaceholderImage(requestId);
  }

  try {
    // Production implementation would use Replicate SDK:
    // import Replicate from 'replicate';
    // const replicate = new Replicate({ auth: apiToken });
    // const output = await replicate.run("stability-ai/sdxl:latest", { input: { prompt } });
    // return output[0]; // URL of generated image

    // For now, return placeholder
    return generatePlaceholderImage(requestId);
  } catch (error) {
    console.error('[PosterGeneration] Replicate API error:', error);
    throw new Error('Failed to generate image with AI');
  }
}

/**
 * Generate a placeholder image for development
 */
function generatePlaceholderImage(requestId: number): string {
  // Create a simple SVG placeholder that indicates it's AI-generated
  const svg = `
<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad${requestId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:rgb(139,69,255);stop-opacity:1" />
      <stop offset="100%" style="stop-color:rgb(255,20,147);stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#grad${requestId})"/>
  <text x="512" y="450" font-family="Arial, sans-serif" font-size="48" fill="white" text-anchor="middle" font-weight="bold">
    AI Generated Poster
  </text>
  <text x="512" y="520" font-family="Arial, sans-serif" font-size="32" fill="white" text-anchor="middle">
    Request #${requestId}
  </text>
  <text x="512" y="600" font-family="Arial, sans-serif" font-size="24" fill="rgba(255,255,255,0.7)" text-anchor="middle">
    Collectible Concert Art
  </text>
</svg>`;

  // Return as data URI
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * Refine an existing generation with a new prompt
 */
export async function refineGeneration(
  requestId: number,
  newPrompt: string
): Promise<GenerateResult> {
  try {
    const request = await prisma.posterGenerationRequest.findUnique({
      where: { id: requestId },
      include: {
        event: {
          include: {
            artists: {
              include: {
                artist: true,
              },
            },
          },
        },
      },
    });

    if (!request) {
      return { success: false, error: 'Generation request not found' };
    }

    // Create new request with refined prompt
    const newRequest = await prisma.posterGenerationRequest.create({
      data: {
        eventId: request.eventId,
        venueId: request.venueId,
        ticketTypeId: request.ticketTypeId,
        prompt: newPrompt,
        provider: request.provider,
        status: 'pending',
        estimatedCostCents: 1,
      },
    });

    // Generate new image
    const imageUrl = await generateWithReplicate(newPrompt, newRequest.id);

    // Update request
    await prisma.posterGenerationRequest.update({
      where: { id: newRequest.id },
      data: {
        status: 'completed',
        resultImageUrl: imageUrl,
        completedAt: new Date(),
      },
    });

    // Get ticket type for rarity multiplier
    const ticketType = request.ticketTypeId
      ? await prisma.eventTicketType.findUnique({ where: { id: request.ticketTypeId } })
      : null;

    const tierName = ticketType?.name || 'General Admission';
    const rarityMultiplier = TIER_ENHANCEMENTS[tierName as keyof typeof TIER_ENHANCEMENTS]?.rarityMultiplier || 1.0;

    // Create new variant
    const variant = await prisma.eventPosterVariant.create({
      data: {
        eventId: request.eventId,
        ticketTypeId: request.ticketTypeId,
        variantName: `${tierName} - Refined`,
        imageUrl,
        rarityMultiplier,
        generationPrompt: newPrompt,
        isApproved: false,
      },
    });

    return {
      success: true,
      variants: [{
        ticketTypeId: variant.ticketTypeId,
        variantName: variant.variantName,
        imageUrl: variant.imageUrl,
        rarityMultiplier: variant.rarityMultiplier,
      }],
    };
  } catch (error) {
    console.error('[PosterGenerationService] Error refining generation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to refine generation',
    };
  }
}

/**
 * Approve a poster variant
 */
export async function approvePosterVariant(variantId: number): Promise<boolean> {
  try {
    await prisma.eventPosterVariant.update({
      where: { id: variantId },
      data: { isApproved: true },
    });
    return true;
  } catch (error) {
    console.error('[PosterGenerationService] Error approving variant:', error);
    return false;
  }
}

/**
 * Get all variants for an event
 */
export async function getEventPosterVariants(eventId: number) {
  return prisma.eventPosterVariant.findMany({
    where: { eventId },
    include: {
      ticketType: true,
    },
    orderBy: [
      { isApproved: 'desc' },
      { rarityMultiplier: 'desc' },
      { createdAt: 'desc' },
    ],
  });
}

/**
 * Get the approved poster variant for a specific ticket type
 */
export async function getApprovedPosterForTicketType(
  eventId: number,
  ticketTypeId: number | null
): Promise<string | null> {
  const variant = await prisma.eventPosterVariant.findFirst({
    where: {
      eventId,
      ticketTypeId,
      isApproved: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return variant?.imageUrl || null;
}

/**
 * Check if all ticket types for an event have approved posters
 */
export async function checkPosterWorkflowComplete(eventId: number): Promise<boolean> {
  const ticketTypes = await prisma.eventTicketType.findMany({
    where: { eventId, isActive: true },
  });

  if (ticketTypes.length === 0) {
    return false;
  }

  // Check each ticket type has at least one approved poster
  for (const ticketType of ticketTypes) {
    const approvedVariant = await prisma.eventPosterVariant.findFirst({
      where: {
        eventId,
        ticketTypeId: ticketType.id,
        isApproved: true,
      },
    });

    if (!approvedVariant) {
      return false;
    }
  }

  return true;
}
