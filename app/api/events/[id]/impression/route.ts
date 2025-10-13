/**
 * POST /api/events/[id]/impression
 *
 * Track an impression for an external event
 */

import { NextRequest, NextResponse } from 'next/server';
import { valueTrackingService } from '@/lib/services/ValueTrackingService';
import { cookies } from 'next/headers';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const eventId = parseInt(id, 10);
    if (isNaN(eventId)) {
      return NextResponse.json(
        { error: 'Invalid event ID' },
        { status: 400 }
      );
    }

    // Get or create session ID
    const cookieStore = await cookies();
    let sessionId = cookieStore.get('session_id')?.value;

    if (!sessionId) {
      sessionId = generateSessionId();
    }

    // Get referrer
    const referrer = request.headers.get('referer') || undefined;

    // Track impression
    await valueTrackingService.trackImpression(eventId, sessionId, referrer);

    const response = NextResponse.json({ success: true });

    // Set session cookie if new
    if (!cookieStore.get('session_id')?.value) {
      response.cookies.set('session_id', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    return response;
  } catch (error: any) {
    console.error('Impression tracking error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to track impression' },
      { status: 500 }
    );
  }
}

function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
