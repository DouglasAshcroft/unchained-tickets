import { NextRequest, NextResponse } from 'next/server';
import { refineGeneration } from '@/lib/services/PosterGenerationService';
import { verifyAuth } from '@/lib/utils/auth';

/**
 * POST /api/posters/refine
 * Refine an existing poster variant with plain English instructions
 *
 * Required: Venue staff authentication
 *
 * Body:
 * {
 *   variantId: number              // ID of the variant to refine
 *   refinementInstructions: string // Plain English guidance (e.g., "make it darker, add more purple")
 *   strength?: number              // Optional: Override auto-calculated strength (0.0-1.0)
 *   model?: 'ultra' | 'core'       // Optional: Model to use (default: 'core')
 * }
 *
 * Response:
 * {
 *   success: true,
 *   variant: {
 *     ticketTypeId: number,
 *     variantName: string,
 *     imageUrl: string,
 *     rarityMultiplier: number
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const _authUser = await verifyAuth(request);

    const body = await request.json();
    const { variantId, refinementInstructions, strength, model } = body;

    // Validate required fields
    if (!variantId || typeof variantId !== 'number') {
      return NextResponse.json(
        { error: 'Missing or invalid variantId' },
        { status: 400 }
      );
    }

    if (!refinementInstructions || typeof refinementInstructions !== 'string' || refinementInstructions.trim().length === 0) {
      return NextResponse.json(
        { error: 'Missing or invalid refinementInstructions. Provide plain English guidance for how to modify the poster.' },
        { status: 400 }
      );
    }

    // Validate optional strength parameter
    if (strength !== undefined && (typeof strength !== 'number' || strength < 0 || strength > 1)) {
      return NextResponse.json(
        { error: 'strength must be a number between 0.0 and 1.0' },
        { status: 400 }
      );
    }

    // Validate optional model parameter
    if (model !== undefined && model !== 'ultra' && model !== 'core') {
      return NextResponse.json(
        { error: 'model must be either "ultra" or "core"' },
        { status: 400 }
      );
    }

    // TODO: Verify user has venue staff access for this event
    // For now, we'll allow any authenticated user (MVP)

    console.log(`[POST /api/posters/refine] Refining variant ${variantId} with instructions: "${refinementInstructions.substring(0, 50)}..."`);

    // Refine the poster
    const result = await refineGeneration(
      variantId,
      refinementInstructions,
      strength,
      model || 'core'
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error?.includes('not found') ? 404 : 500 }
      );
    }

    return NextResponse.json({
      success: true,
      variant: result.variants?.[0],
    });
  } catch (error: any) {
    if (error.message === 'No token provided' || error.message === 'Invalid token') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.error('[POST /api/posters/refine] Error:', error);
    return NextResponse.json(
      { error: 'Failed to refine poster' },
      { status: 500 }
    );
  }
}
