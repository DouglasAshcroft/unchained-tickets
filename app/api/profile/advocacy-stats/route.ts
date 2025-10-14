import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/utils/auth';
import { profileService } from '@/lib/services/ProfileService';

/**
 * GET /api/profile/advocacy-stats
 * Get user's advocacy statistics
 */
export async function GET(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request);
    const stats = await profileService.getAdvocacyStats(authUser.email);

    if (!stats) {
      return NextResponse.json({
        advocacyCount: 0,
        totalVenuesReached: 0,
        currentTier: 1,
      });
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching advocacy stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch advocacy stats' },
      { status: 500 }
    );
  }
}
