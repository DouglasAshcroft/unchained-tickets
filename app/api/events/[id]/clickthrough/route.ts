/**
 * POST /api/events/[id]/clickthrough
 *
 * Track a click-through for an external event
 */

import { NextRequest, NextResponse } from 'next/server';
import { valueTrackingService } from '@/lib/services/ValueTrackingService';
import { cookies } from 'next/headers';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = parseInt(params.id, 10);
    if (isNaN(eventId)) {
      return NextResponse.json(
        { error: 'Invalid event ID' },
        { status: 400 }
      );
    }

    // Get session ID
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'No session found' },
        { status: 400 }
      );
    }

    // Track click-through
    await valueTrackingService.trackClickThrough(eventId, sessionId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Click-through tracking error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to track click-through' },
      { status: 500 }
    );
  }
}
