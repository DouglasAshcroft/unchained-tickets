import { NextRequest, NextResponse } from 'next/server';
import { venueSupportService } from '@/lib/services/VenueSupportService';
import { getClientIp, getUserAgent } from '@/lib/utils/venueAuth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const ipAddress = getClientIp(request.headers);
    const userAgent = getUserAgent(request.headers);

    await venueSupportService.endSupportSession(userId, ipAddress, userAgent);

    return NextResponse.json({
      success: true,
      message: 'Support session ended',
    });
  } catch (error: any) {
    console.error('Error ending support session:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to end support session' },
      { status: 500 }
    );
  }
}
