/**
 * GET /api/advocacy/stats/[email]
 *
 * Get advocacy stats for a specific user
 */

import { NextRequest, NextResponse } from 'next/server';
import { advocacyService } from '@/lib/services/AdvocacyService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ email: string }> }
) {
  try {
    const { email: rawEmail } = await params;
    const email = decodeURIComponent(rawEmail);

    const stats = await advocacyService.getAdvocacyStats(email);

    if (!stats) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get stats' },
      { status: 500 }
    );
  }
}
