import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eventService } from '@/lib/services/EventService';
import { EventCreateSchema } from '@/lib/validators/eventSchemas';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || undefined;
    const venueIdParam = searchParams.get('venueId');
    const venueId = venueIdParam ? parseInt(venueIdParam, 10) : undefined;

    const events = await eventService.getEvents({ search, venueId });

    return NextResponse.json(events);
  } catch (error: any) {
    console.error('Get events error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const eventInput = EventCreateSchema.parse(body);

    const event = await eventService.createEvent(eventInput);

    return NextResponse.json(event, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    if (error?.message === 'Venue not found') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (
      error?.message === 'Event end time must be after the start time' ||
      error?.message === 'Invalid start date' ||
      error?.message === 'Invalid end date' ||
      error?.message === 'New events can only be draft or published'
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error('Create event error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
