import { NextRequest, NextResponse } from 'next/server';
import { venueSupportService } from '@/lib/services/VenueSupportService';
import { getClientIp, getUserAgent } from '@/lib/utils/venueAuth';

export async function POST(request: NextRequest) {
  try {
    // TODO: Get authenticated user ID from session/JWT
    // For now, we'll expect it in the request body
    const body = await request.json();
    const { userId, venueId } = body;

    if (!userId || !venueId) {
      return NextResponse.json(
        { error: 'Missing userId or venueId' },
        { status: 400 }
      );
    }

    const ipAddress = getClientIp(request.headers);
    const userAgent = getUserAgent(request.headers);

    const session = await venueSupportService.startSupportSession({
      adminUserId: userId,
      venueId,
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      session,
    });
  } catch (error: any) {
    console.error('Error starting support session:', error);

    if (error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: error.message || 'Failed to start support session' },
      { status: 500 }
    );
  }
}
