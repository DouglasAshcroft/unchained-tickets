/**
 * POST /api/advocacy/submit
 *
 * Submit an advocacy request for an event
 */

import { NextRequest, NextResponse } from 'next/server';
import { advocacyService } from '@/lib/services/AdvocacyService';
import type { AdvocacySubmission } from '@/lib/types/advocacy';

export async function POST(request: NextRequest) {
  try {
    const body: AdvocacySubmission = await request.json();

    // Validate required fields
    if (!body.email || !body.eventId || !body.agreeToTerms) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if already advocated
    const hasAdvocated = await advocacyService.hasAdvocated(body.email, body.eventId);
    if (hasAdvocated) {
      return NextResponse.json(
        { error: 'You have already advocated for this event' },
        { status: 409 }
      );
    }

    // Submit advocacy
    const result = await advocacyService.submitAdvocacy(body);

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Advocacy submission error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit advocacy' },
      { status: 500 }
    );
  }
}
