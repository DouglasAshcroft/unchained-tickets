import { NextRequest, NextResponse } from 'next/server';
import { eventRepository } from '@/lib/repositories/EventRepository';
import { sanitizePosterImageUrl } from '@/lib/utils/posterImage';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const genre = searchParams.get('genre') || undefined;
    const featured = searchParams.get('featured') === 'true';
    const city = searchParams.get('city') || undefined;
    const state = searchParams.get('state') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    let events;

    if (featured) {
      // Fetch featured events with pagination
      const allFeatured = await eventRepository.findFeaturedEvents({
        city,
        state,
        limit: limit * page, // Fetch all up to current page
      });

      events = allFeatured.slice((page - 1) * limit, page * limit);

      const hasMore = allFeatured.length > page * limit;

      return NextResponse.json({
        events: events.map((event) => ({
          ...event,
          posterImageUrl: sanitizePosterImageUrl(event.posterImageUrl),
          startsAt: event.startsAt.toISOString(),
          createdAt: event.createdAt.toISOString(),
        })),
        page,
        limit,
        hasMore,
      });
    }

    if (genre) {
      // Fetch by genre with pagination
      const allEvents = await eventRepository.findByGenreAndLocation({
        genre,
        city,
        state,
        limit: limit * page,
      });

      events = allEvents.slice((page - 1) * limit, page * limit);

      const hasMore = allEvents.length > page * limit;

      return NextResponse.json({
        events: events.map((event) => ({
          ...event,
          posterImageUrl: sanitizePosterImageUrl(event.posterImageUrl),
          startsAt: event.startsAt.toISOString(),
          createdAt: event.createdAt.toISOString(),
        })),
        page,
        limit,
        hasMore,
      });
    }

    // Default: fetch all events with pagination
    const allEvents = await eventRepository.findByGenreAndLocation({
      city,
      state,
      limit: limit * page,
    });

    events = allEvents.slice((page - 1) * limit, page * limit);

    const hasMore = allEvents.length > page * limit;

    return NextResponse.json({
      events: events.map((event) => ({
        ...event,
        posterImageUrl: sanitizePosterImageUrl(event.posterImageUrl),
        startsAt: event.startsAt.toISOString(),
        createdAt: event.createdAt.toISOString(),
      })),
      page,
      limit,
      hasMore,
    });
  } catch (error: unknown) {
    console.error('Get all events error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
