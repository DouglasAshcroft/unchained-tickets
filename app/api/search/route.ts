import { NextRequest, NextResponse } from 'next/server';
import { eventService } from '@/lib/services/EventService';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('search') || searchParams.get('q') || '';

    if (!query.trim()) {
      return NextResponse.json({ results: [] });
    }

    const results = await eventService.searchEvents(query.trim());

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
