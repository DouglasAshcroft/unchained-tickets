import { NextRequest, NextResponse } from 'next/server';
import { refineGeneration } from '@/lib/services/PosterGenerationService';
import { verifyAuth } from '@/lib/utils/auth';

/**
 * POST /api/posters/refine
 * Regenerate a poster with a refined prompt
 *
 * Required: Venue staff authentication
 *
 * Body:
 * {
 *   requestId: number  // ID of previous generation request
 *   newPrompt: string  // Refined prompt
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const _authUser = await verifyAuth(request);

    const body = await request.json();
    const { requestId, newPrompt } = body;

    // Validate required fields
    if (!requestId || !newPrompt) {
      return NextResponse.json(
        { error: 'Missing required fields: requestId, newPrompt' },
        { status: 400 }
      );
    }

    // TODO: Verify user has venue staff access

    // Refine generation
    const result = await refineGeneration(requestId, newPrompt);

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

    console.error('[POST /api/posters/refine] Error:', error);
    return NextResponse.json(
      { error: 'Failed to refine poster generation' },
      { status: 500 }
    );
  }
}
