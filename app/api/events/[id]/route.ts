import { NextRequest, NextResponse } from 'next/server';
import { eventService } from '@/lib/services/EventService';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = parseInt(params.id, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const event = await eventService.getEventById(id);

    return NextResponse.json(event);
  } catch (error: any) {
    if (error.message === 'Event not found') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    console.error('Get event error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
