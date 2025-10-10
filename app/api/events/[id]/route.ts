import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eventService } from '@/lib/services/EventService';
import { EventUpdateSchema } from '@/lib/validators/eventSchemas';

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

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = parseInt(params.id, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const body = await request.json();
    const updatePayload = EventUpdateSchema.parse(body);

    const event = await eventService.updateEvent(id, updatePayload);

    return NextResponse.json(event);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    if (error?.message === 'Event not found' || error?.message === 'Venue not found') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (
      error?.message === 'Event end time must be after the start time' ||
      error?.message === 'Invalid start date' ||
      error?.message === 'Invalid end date'
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error('Update event error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
