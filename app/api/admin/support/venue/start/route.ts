import { NextRequest, NextResponse } from 'next/server';
import { venueSupportService } from '@/lib/services/VenueSupportService';
import { getClientIp, getUserAgent } from '@/lib/utils/venueAuth';
import { verifyAdmin } from '@/lib/utils/auth';

export async function POST(request: NextRequest) {
  try {
    // Verify the user is an authenticated admin
    const admin = await verifyAdmin(request);

    const body = await request.json();
    const { venueId } = body;

    if (!venueId) {
      return NextResponse.json(
        { error: 'Missing venueId' },
        { status: 400 }
      );
    }

    const ipAddress = getClientIp(request.headers);
    const userAgent = getUserAgent(request.headers);

    const session = await venueSupportService.startSupportSession({
      adminUserId: admin.id,
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

    if (error.message.includes('Admin access required') || error.message.includes('token')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: error.message || 'Failed to start support session' },
      { status: 500 }
    );
  }
}
