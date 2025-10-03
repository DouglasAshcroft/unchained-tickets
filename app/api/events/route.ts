import { NextRequest, NextResponse } from 'next/server';
import { eventService } from '@/lib/services/EventService';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || undefined;

    const events = await eventService.getEvents({ search });

    return NextResponse.json(events);
  } catch (error: any) {
    console.error('Get events error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
