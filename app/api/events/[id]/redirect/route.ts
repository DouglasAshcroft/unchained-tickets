/**
 * GET /api/events/[id]/redirect
 *
 * Redirect to original ticket URL with tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { cookies } from 'next/headers';
import { valueTrackingService } from '@/lib/services/ValueTrackingService';

export async function GET(
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

    // Get event
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { originalTicketUrl: true },
    });

    if (!event || !event.originalTicketUrl) {
      return NextResponse.json(
        { error: 'Event or ticket URL not found' },
        { status: 404 }
      );
    }

    // Track click-through
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;

    if (sessionId) {
      await valueTrackingService.trackClickThrough(eventId, sessionId);
    }

    // Redirect to original ticket URL
    return NextResponse.redirect(event.originalTicketUrl, 302);
  } catch (error: any) {
    console.error('Redirect error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to redirect' },
      { status: 500 }
    );
  }
}
