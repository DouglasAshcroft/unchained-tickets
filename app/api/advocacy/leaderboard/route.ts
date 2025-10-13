/**
 * GET /api/advocacy/leaderboard
 *
 * Get advocacy leaderboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { advocacyService } from '@/lib/services/AdvocacyService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const leaderboard = await advocacyService.getLeaderboard(limit);

    return NextResponse.json(leaderboard);
  } catch (error: any) {
    console.error('Leaderboard error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get leaderboard' },
      { status: 500 }
    );
  }
}
