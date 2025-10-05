import { eventRepository } from '@/lib/repositories/EventRepository';
import { venueRepository } from '@/lib/repositories/VenueRepository';
import { artistRepository } from '@/lib/repositories/ArtistRepository';

interface EventFilters {
  search?: string;
}

export class EventService {
  async getEvents(filters: EventFilters = {}) {
    return await eventRepository.findMany(filters);
  }

  async getEventById(id: number) {
    const event = await eventRepository.findById(id);
    if (!event) {
      throw new Error('Event not found');
    }
    return event;
  }

  async searchEvents(query: string, limit = 10) {
    const [events, venues, artists] = await Promise.all([
      eventRepository.search(query, limit),
      venueRepository.search(query, 5),
      artistRepository.search(query, 5),
    ]);

    const results = [
      ...events.map((e) => ({
        type: 'event' as const,
        id: e.id,
        title: e.title,
        venue: e.venue?.name || null,
        date: e.startsAt.toISOString(),
      })),
      ...venues.map((v) => ({
        type: 'venue' as const,
        slug: v.slug,
        name: v.name,
        city: v.city,
        state: v.state,
      })),
      ...artists.map((a) => ({
        type: 'artist' as const,
        slug: a.slug,
        name: a.name,
        genre: a.genre,
      })),
    ];

    return { results };
  }

  async getVenueWithEvents(slug: string) {
    const venue = await venueRepository.findBySlug(slug);
    if (!venue) {
      throw new Error('Venue not found');
    }

    const events = await eventRepository.findByVenueId(venue.id);
    return { venue, events };
  }

  async getArtistWithEvents(slug: string) {
    const artist = await artistRepository.findBySlug(slug);
    if (!artist) {
      throw new Error('Artist not found');
    }

    const events = await eventRepository.findByArtistId(artist.id);
    return { artist, events };
  }

  async getAllVenues(filters?: { location?: string; minCapacity?: number }) {
    const venues = await venueRepository.findAll(filters);
    return venues.map((venue) => ({
      ...venue,
      eventCount: venue.events.length,
      events: undefined, // Remove events array, just keep count
    }));
  }

  async getAllArtists(filters?: { genre?: string }) {
    const artists = await artistRepository.findAll(filters);
    return artists.map((artist) => ({
      ...artist,
      eventCount: artist.events.length,
      events: undefined, // Remove events array, just keep count
    }));
  }
}

export const eventService = new EventService();
