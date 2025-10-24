import { EventStatus, TicketStatus } from '@prisma/client';
import { eventRepository } from '@/lib/repositories/EventRepository';
import { venueRepository } from '@/lib/repositories/VenueRepository';
import { artistRepository } from '@/lib/repositories/ArtistRepository';
import type {
  EventCreateInput,
  EventUpdateInput,
} from '@/lib/validators/eventSchemas';
import { sanitizePosterImageUrl } from '@/lib/utils/posterImage';
import { prisma } from '@/lib/db/prisma';

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
    const events = await eventRepository.findMany(filters);
    return events.map((event) => ({
      ...event,
      posterImageUrl: sanitizePosterImageUrl(event.posterImageUrl),
    }));
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

    // Calculate actual remaining capacity based on ticket type capacity limits
    const ticketTypes = event.ticketTypes || [];
    let totalCapacity = 0;
    let totalSold = 0;

    for (const ticketType of ticketTypes) {
      if (!ticketType.isActive || ticketType.capacity === null) {
        // Skip inactive or unlimited capacity tiers
        continue;
      }

      totalCapacity += ticketType.capacity;

      // Count tickets for this specific tier (excluding canceled and Genesis tickets)
      // Genesis tickets are archive/test tickets and should NOT count against capacity
      const tierTickets = event.tickets?.filter(
        (ticket) =>
          ticket.ticketTypeId === ticketType.id &&
          ticket.status !== 'canceled' &&
          !ticket.isGenesisTicket  // NEVER count Genesis tickets
      ) ?? [];

      totalSold += tierTickets.length;
    }

    const availableTickets = Math.max(totalCapacity - totalSold, 0);
    const totalTickets = totalSold; // Only count sold tickets as "total"
    const soldTickets = event.tickets?.filter((ticket) =>
      ticket.status === 'minted' || ticket.status === 'transferred' || ticket.status === 'used'
    ).length ?? 0;

    return {
      ...event,
      posterImageUrl: sanitizePosterImageUrl(event.posterImageUrl),
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
    return {
      venue,
      events: events.map((event) => ({
        ...event,
        posterImageUrl: sanitizePosterImageUrl(event.posterImageUrl),
      })),
    };
  }

  async getArtistWithEvents(slug: string) {
    const artist = await artistRepository.findBySlug(slug);
    if (!artist) {
      throw new Error('Artist not found');
    }

    const events = await eventRepository.findByArtistId(artist.id);
    return {
      artist,
      events: events.map((event) => ({
        ...event,
        posterImageUrl: sanitizePosterImageUrl(event.posterImageUrl),
      })),
    };
  }

  async getAllVenues(filters?: { location?: string; minCapacity?: number }) {
    const venues = await venueRepository.findAll(filters);
    return venues.map(({ _count, ...venue }) => ({
      ...venue,
      eventCount: _count?.events ?? 0,
    }));
  }

  async getAllArtists(filters?: { genre?: string }) {
    const artists = await artistRepository.findAll(filters);
    return artists.map(({ _count, ...artist }) => ({
      ...artist,
      eventCount: _count?.events ?? 0,
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
      !([EventStatus.draft, EventStatus.published] as string[]).includes(data.status)
    ) {
      throw new Error('New events can only be draft or published');
    }

    const posterImageUrl = normalizeNullableString(data.posterImageUrl);
    const externalLink = normalizeNullableString(data.externalLink);
    const mapsLink = normalizeNullableString(data.mapsLink);

    if (data.primaryArtistId) {
      const artist = await artistRepository.findById(data.primaryArtistId);
      if (!artist) {
        throw new Error('Artist not found');
      }
    }

    const artistId =
      data.primaryArtistId !== undefined ? data.primaryArtistId ?? null : null;

    const ticketTypesInput = data.ticketTypes ?? [];

    let seatMapId: number | null = null;
    let seatPositionIds: number[] = [];

    if (data.seatMapId) {
      const seatMap = await prisma.venueSeatMap.findFirst({
        where: { id: data.seatMapId, venueId: data.venueId },
        select: { id: true },
      });

      if (!seatMap) {
        throw new Error('Seat map not found for the selected venue');
      }

      const positions = await prisma.seatPosition.findMany({
        where: {
          row: {
            section: {
              seatMapId: seatMap.id,
            },
          },
        },
        select: { id: true },
      });

      if (positions.length === 0) {
        throw new Error('Seat map must include at least one seat');
      }

      seatMapId = seatMap.id;
      seatPositionIds = positions.map((position) => position.id);
    }

    const created = await prisma.$transaction(async (tx) => {
      const eventRecord = await tx.event.create({
        data: {
          title: data.title.trim(),
          startsAt,
          endsAt,
          venueId: data.venueId,
          artistId,
          posterImageUrl,
          externalLink,
          mapsLink,
          status: data.status ?? EventStatus.draft,
        },
      });

      if (ticketTypesInput.length > 0) {
        for (const ticketType of ticketTypesInput) {
          const createdTicketType = await tx.eventTicketType.create({
            data: {
              eventId: eventRecord.id,
              name: ticketType.name.trim(),
              description: ticketType.description?.trim() ?? null,
              pricingType: ticketType.pricingType,
              priceCents: ticketType.priceCents ?? null,
              currency: (ticketType.currency ?? 'USD').toUpperCase(),
              capacity: ticketType.capacity ?? null,
              salesStart: ticketType.salesStart
                ? new Date(ticketType.salesStart)
                : null,
              salesEnd: ticketType.salesEnd ? new Date(ticketType.salesEnd) : null,
              isActive: ticketType.isActive ?? true,
            },
          });

          if (ticketType.perks && ticketType.perks.length > 0) {
            await tx.ticketPerk.createMany({
              data: ticketType.perks.map((perk) => ({
                ticketTypeId: createdTicketType.id,
                name: perk.name.trim(),
                description: perk.description?.trim() ?? null,
                instructions: perk.instructions?.trim() ?? null,
                quantity: perk.quantity ?? 1,
              })),
            });
          }
        }
      }

      if (seatMapId) {
        const assignment = await tx.eventSeatMapAssignment.create({
          data: {
            eventId: eventRecord.id,
            seatMapId,
            isPrimary: true,
          },
        });

        if (seatPositionIds.length > 0) {
          await tx.eventReservedSeat.createMany({
            data: seatPositionIds.map((seatPositionId) => ({
              eventSeatMapAssignmentId: assignment.id,
              seatPositionId,
            })),
          });
        }
      }

      return eventRecord;
    });

    return this.getEventById(created.id);
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

    if (data.primaryArtistId !== undefined && data.primaryArtistId !== null) {
      const artist = await artistRepository.findById(data.primaryArtistId);
      if (!artist) {
        throw new Error('Artist not found');
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
