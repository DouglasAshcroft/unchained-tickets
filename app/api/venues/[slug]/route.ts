import { NextRequest, NextResponse } from 'next/server';
import { eventService } from '@/lib/services/EventService';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const params = await context.params;
    const result = await eventService.getVenueWithEvents(params.slug);

    return NextResponse.json(result);
  } catch (error: any) {
    if (error.message === 'Venue not found') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    console.error('Get venue error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
