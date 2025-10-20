import { NextRequest, NextResponse } from 'next/server';
import { venueSupportService } from '@/lib/services/VenueSupportService';
import { getClientIp, getUserAgent } from '@/lib/utils/venueAuth';
import { verifyAdmin } from '@/lib/utils/auth';

export async function POST(request: NextRequest) {
  try {
    // Verify the user is an authenticated admin
    const admin = await verifyAdmin(request);

    const ipAddress = getClientIp(request.headers);
    const userAgent = getUserAgent(request.headers);

    await venueSupportService.endSupportSession(admin.id, ipAddress, userAgent);

    return NextResponse.json({
      success: true,
      message: 'Support session ended',
    });
  } catch (error: any) {
    console.error('Error ending support session:', error);

    if (error.message.includes('Admin access required') || error.message.includes('token')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: error.message || 'Failed to end support session' },
      { status: 500 }
    );
  }
}
