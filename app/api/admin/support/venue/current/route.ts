import { NextRequest, NextResponse } from 'next/server';
import { venueSupportService } from '@/lib/services/VenueSupportService';
import { getVenueAccess } from '@/lib/utils/venueAuth';

export async function GET(request: NextRequest) {
  try {
    // TODO: Get authenticated user ID from session/JWT
    // For now, we'll expect it in the query params
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const userIdNum = parseInt(userId, 10);

    const [session, access] = await Promise.all([
      venueSupportService.getCurrentSupportSession(userIdNum),
      getVenueAccess(userIdNum),
    ]);

    return NextResponse.json({
      session,
      inSupportMode: access.inSupportMode,
      venueId: access.venueId,
      userRole: access.userRole,
    });
  } catch (error: any) {
    console.error('Error getting current support session:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to get current session' },
      { status: 500 }
    );
  }
}
