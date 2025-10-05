import { NextRequest, NextResponse } from 'next/server';
import { eventService } from '@/lib/services/EventService';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const location = searchParams.get('location') || undefined;
    const minCapacity = searchParams.get('minCapacity')
      ? parseInt(searchParams.get('minCapacity')!)
      : undefined;

    const venues = await eventService.getAllVenues({
      location,
      minCapacity,
    });

    return NextResponse.json(venues);
  } catch (error: any) {
    console.error('Get venues error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
