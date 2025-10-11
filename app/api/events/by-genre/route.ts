import { NextRequest, NextResponse } from 'next/server';
import { eventRepository } from '@/lib/repositories/EventRepository';
import { sanitizePosterImageUrl } from '@/lib/utils/posterImage';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get('city') || undefined;
    const state = searchParams.get('state') || undefined;
    const limit = parseInt(searchParams.get('limit') || '5', 10);

    // Get all available genres for the location
    const availableGenres = await eventRepository.getAvailableGenres({
      city,
      state,
    });

    // Get featured events
    const featuredEvents = await eventRepository.findFeaturedEvents({
      city,
      state,
      limit,
    });

    // Get events for each genre
    const genreEvents: Record<string, any[]> = {};

    for (const genre of availableGenres) {
      const events = await eventRepository.findByGenreAndLocation({
        genre: genre.name,
        city,
        state,
        limit,
      });

      if (events.length > 0) {
        genreEvents[genre.slug] = events.map((event) => ({
          ...event,
          posterImageUrl: sanitizePosterImageUrl(event.posterImageUrl),
          startsAt: event.startsAt.toISOString(),
          createdAt: event.createdAt.toISOString(),
        }));
      }
    }

    // Sanitize featured events
    const sanitizedFeatured = featuredEvents.map((event) => ({
      ...event,
      posterImageUrl: sanitizePosterImageUrl(event.posterImageUrl),
      startsAt: event.startsAt.toISOString(),
      createdAt: event.createdAt.toISOString(),
      featuredUntil: event.featuredUntil?.toISOString() || null,
    }));

    return NextResponse.json({
      location: city && state ? { city, state } : null,
      genres: {
        featured: sanitizedFeatured,
        ...genreEvents,
      },
      availableGenres: availableGenres.map((g) => ({
        name: g.name,
        slug: g.slug,
        count: g.count,
      })),
      totalGenres: availableGenres.length,
    });
  } catch (error: any) {
    console.error('Get events by genre error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
