import { NextRequest, NextResponse } from 'next/server';
import { registerTiersOnChain } from '@/lib/services/OnChainEventService';

/**
 * POST /api/events/:id/register-tiers
 *
 * Registers all ticket tiers for an event on the blockchain smart contract
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const eventId = parseInt(id, 10);

    if (isNaN(eventId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid event ID' },
        { status: 400 }
      );
    }

    const results = await registerTiersOnChain(eventId);

    // Check if any tier registration failed
    const hasFailures = results.some(r => !r.success);

    return NextResponse.json(results, {
      status: hasFailures ? 207 : 200, // 207 Multi-Status for partial success
    });
  } catch (error) {
    console.error('[register-tiers] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
