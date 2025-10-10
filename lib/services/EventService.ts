import { EventStatus, TicketStatus } from '@prisma/client';
import { eventRepository } from '@/lib/repositories/EventRepository';
import { venueRepository } from '@/lib/repositories/VenueRepository';
import { artistRepository } from '@/lib/repositories/ArtistRepository';
import type {
  EventCreateInput,
  EventUpdateInput,
} from '@/lib/validators/eventSchemas';

interface EventFilters {
  search?: string;
}

const normalizeNullableString = (value?: string | null) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
};

export class EventService {
  async getEvents(filters: EventFilters = {}) {
    return await eventRepository.findMany(filters);
  }

  async getEventById(id: number) {
    const event = await eventRepository.findById(id);
    if (!event) {
      throw new Error('Event not found');
    }
    const supportingArtists = event.artists
      .filter((link) => !link.isPrimary && link.artist)
      .map((link) => ({
        id: link.artist.id,
        name: link.artist.name,
        slug: link.artist.slug,
        genre: link.artist.genre,
      }));

    const ticketStatusesConsideredSold = new Set<TicketStatus>([
      'minted',
      'transferred',
      'used',
      'revoked',
    ]);

    const totalTickets = event.tickets?.length ?? 0;
    const soldTickets = event.tickets?.filter((ticket) =>
      ticketStatusesConsideredSold.has(ticket.status)
    ).length ?? 0;
    const availableTickets = Math.max(totalTickets - soldTickets, 0);

    return {
      ...event,
      supportingArtists,
      totalTickets,
      soldTickets,
      availableTickets,
    };
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

  async createEvent(data: EventCreateInput) {
    const venue = await venueRepository.findById(data.venueId);
    if (!venue) {
      throw new Error('Venue not found');
    }

    const startsAt = new Date(data.startsAt);
    const endsAt = data.endsAt ? new Date(data.endsAt) : null;

    if (Number.isNaN(startsAt.getTime())) {
      throw new Error('Invalid start date');
    }

    if (endsAt && Number.isNaN(endsAt.getTime())) {
      throw new Error('Invalid end date');
    }

    if (endsAt && endsAt < startsAt) {
      throw new Error('Event end time must be after the start time');
    }

    if (
      data.status &&
      ![EventStatus.draft, EventStatus.published].includes(data.status)
    ) {
      throw new Error('New events can only be draft or published');
    }

    const posterImageUrl = normalizeNullableString(data.posterImageUrl);
    const externalLink = normalizeNullableString(data.externalLink);
    const mapsLink = normalizeNullableString(data.mapsLink);

    const artistId =
      data.primaryArtistId !== undefined ? data.primaryArtistId ?? null : null;

    const created = await eventRepository.create({
      title: data.title.trim(),
      startsAt,
      endsAt,
      venueId: data.venueId,
      artistId,
      posterImageUrl,
      externalLink,
      mapsLink,
      status: data.status ?? EventStatus.draft,
    });

    if (!created) {
      throw new Error('Event creation failed');
    }

    return created;
  }

  async updateEvent(id: number, data: EventUpdateInput) {
    const existing = await eventRepository.findById(id);
    if (!existing) {
      throw new Error('Event not found');
    }

    if (data.venueId !== undefined) {
      const venue = await venueRepository.findById(data.venueId);
      if (!venue) {
        throw new Error('Venue not found');
      }
    }

    const nextStartsAt =
      data.startsAt !== undefined
        ? new Date(data.startsAt)
        : existing.startsAt;

    const nextEndsAt =
      data.endsAt !== undefined
        ? data.endsAt === null
          ? null
          : new Date(data.endsAt)
        : existing.endsAt ?? null;

    if (Number.isNaN(nextStartsAt.getTime())) {
      throw new Error('Invalid start date');
    }

    if (nextEndsAt && Number.isNaN(nextEndsAt.getTime())) {
      throw new Error('Invalid end date');
    }

    if (nextEndsAt && nextEndsAt < nextStartsAt) {
      throw new Error('Event end time must be after the start time');
    }

    const posterImageUrl = normalizeNullableString(data.posterImageUrl);
    const externalLink = normalizeNullableString(data.externalLink);
    const mapsLink = normalizeNullableString(data.mapsLink);
    const artistId =
      data.primaryArtistId !== undefined ? data.primaryArtistId ?? null : undefined;

    const updated = await eventRepository.update(id, {
      title: data.title?.trim(),
      startsAt: data.startsAt ? new Date(data.startsAt) : undefined,
      endsAt:
        data.endsAt !== undefined
          ? data.endsAt === null
            ? null
            : new Date(data.endsAt)
          : undefined,
      venueId: data.venueId,
      artistId,
      posterImageUrl,
      externalLink,
      mapsLink,
      status: data.status,
    });

    if (!updated) {
      throw new Error('Event update failed');
    }

    return updated;
  }
}

export const eventService = new EventService();
