/**
 * POST /api/serper/sync
 *
 * Sync events from Serper API (for cron job or manual trigger)
 */

import { NextRequest, NextResponse } from 'next/server';
import { serperService } from '@/lib/services/SerperService';

export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication/API key validation
    const { query, location } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter required' },
        { status: 400 }
      );
    }

    const syncedCount = await serperService.syncEventsToDatabase(query, location);

    return NextResponse.json({
      success: true,
      syncedCount,
      message: `Synced ${syncedCount} events from Serper`,
    });
  } catch (error: any) {
    console.error('Serper sync error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync events' },
      { status: 500 }
    );
  }
}
