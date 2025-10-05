import { NextRequest, NextResponse } from 'next/server';
import { eventService } from '@/lib/services/EventService';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const genre = searchParams.get('genre') || undefined;

    const artists = await eventService.getAllArtists({ genre });

    return NextResponse.json(artists);
  } catch (error: any) {
    console.error('Get artists error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
