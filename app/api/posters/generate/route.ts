import { NextRequest, NextResponse } from 'next/server';
import { generatePosterVariants, POSTER_STYLES, type PosterStyle } from '@/lib/services/PosterGenerationService';
import { verifyAuth } from '@/lib/utils/auth';

/**
 * POST /api/posters/generate
 * Generate AI poster variants for all tiers of an event
 *
 * Required: Venue staff authentication
 *
 * Body:
 * {
 *   eventId: number
 *   venueId: number
 *   ticketTypeIds: number[]
 *   style: 'vintage' | 'modern' | 'grunge' | 'neon' | 'minimalist' | 'psychedelic'
 *   customPrompt?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const _authUser = await verifyAuth(request);

    const body = await request.json();
    const { eventId, venueId, ticketTypeIds, style, customPrompt } = body;

    // Validate required fields
    if (!eventId || !venueId || !Array.isArray(ticketTypeIds)) {
      return NextResponse.json(
        { error: 'Missing required fields: eventId, venueId, ticketTypeIds' },
        { status: 400 }
      );
    }

    // Validate style
    if (!style || !(style in POSTER_STYLES)) {
      return NextResponse.json(
        { error: `Invalid style. Must be one of: ${Object.keys(POSTER_STYLES).join(', ')}` },
        { status: 400 }
      );
    }

    // TODO: Verify user has venue staff access for this venue
    // For now, we'll allow any authenticated user (MVP)

    // Generate posters
    const result = await generatePosterVariants({
      eventId,
      venueId,
      ticketTypeIds,
      style: style as PosterStyle,
      customPrompt,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      variants: result.variants,
    });
  } catch (error: any) {
    if (error.message === 'No token provided' || error.message === 'Invalid token') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.error('[POST /api/posters/generate] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate posters' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/posters/generate
 * Get available poster styles
 */
export async function GET() {
  return NextResponse.json({
    styles: Object.entries(POSTER_STYLES).map(([key, config]) => ({
      id: key,
      name: config.name,
      description: config.description,
    })),
  });
}
