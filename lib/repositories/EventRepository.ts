import { EventStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

interface EventFilters {
  search?: string;
  city?: string;
  state?: string;
  genre?: string;
  featured?: boolean;
}

// Pagination interface for future use
// interface PaginationOptions {
//   page?: number;
//   limit?: number;
// }

interface CreateEventData {
  title: string;
  startsAt: Date;
  endsAt?: Date | null;
  venueId: number;
  artistId?: number | null;
  posterImageUrl?: string | null;
  externalLink?: string | null;
  mapsLink?: string | null;
  status?: EventStatus;
}

interface UpdateEventData {
  title?: string;
  startsAt?: Date;
  endsAt?: Date | null;
  venueId?: number;
  artistId?: number | null;
  posterImageUrl?: string | null;
  externalLink?: string | null;
  mapsLink?: string | null;
  status?: EventStatus;
}

export class EventRepository {
  async findMany(filters: EventFilters = {}) {
    const { search } = filters;

    const events = await prisma.event.findMany({
      where: search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { venue: { name: { contains: search, mode: "insensitive" } } },
              {
                primaryArtist: {
                  name: { contains: search, mode: "insensitive" },
                },
              },
            ],
          }
        : {},
      select: {
        id: true,
        title: true,
        startsAt: true,
        createdAt: true,
        posterImageUrl: true,
        externalLink: true,
        mapsLink: true,
        venue: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            state: true,
          },
        },
      },
      orderBy: { startsAt: "asc" },
      take: 50,
    });

    return events;
  }

  async findByIds(ids: number[]) {
    if (ids.length === 0) {
      return [];
    }

    return await prisma.event.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        title: true,
        status: true,
        startsAt: true,
        endsAt: true,
        posterImageUrl: true,
        externalLink: true,
        venue: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            state: true,
          },
        },
        primaryArtist: {
          select: {
            id: true,
            name: true,
            slug: true,
            genre: true,
          },
        },
      },
    });
  }

  async findById(id: number) {
    return await prisma.event.findUnique({
      where: { id },
      include: {
        venue: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            state: true,
            capacity: true,
            addressLine1: true,
            latitude: true,
            longitude: true,
          },
        },
        primaryArtist: {
          select: {
            id: true,
            name: true,
            slug: true,
            genre: true,
          },
        },
        artists: {
          include: {
            artist: {
              select: {
                id: true,
                name: true,
                slug: true,
                genre: true,
              },
            },
          },
        },
        tickets: {
          select: {
            id: true,
            status: true,
            priceCents: true,
            currency: true,
            seatSection: true,
            seatRow: true,
            seat: true,
            ticketTypeId: true,
            reservedSeatId: true,
          },
        },
        ticketTypes: {
          select: {
            id: true,
            name: true,
            description: true,
            pricingType: true,
            priceCents: true,
            currency: true,
            capacity: true,
            salesStart: true,
            salesEnd: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            perks: {
              select: {
                id: true,
                name: true,
                description: true,
                instructions: true,
                quantity: true,
                createdAt: true,
                updatedAt: true,
              },
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        seatMapAssignments: {
          include: {
            seatMap: {
              select: {
                id: true,
                name: true,
                description: true,
                status: true,
                version: true,
              },
            },
            reservedSeats: {
              select: {
                id: true,
                status: true,
                ticketTypeId: true,
                seatPosition: {
                  select: {
                    id: true,
                    seatNumber: true,
                    displayLabel: true,
                    row: {
                      select: {
                        id: true,
                        name: true,
                        label: true,
                        section: {
                          select: {
                            id: true,
                            name: true,
                            label: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async create(data: CreateEventData) {
    const created = await prisma.event.create({
      data: {
        title: data.title,
        startsAt: data.startsAt,
        endsAt: data.endsAt ?? null,
        venueId: data.venueId,
        artistId: data.artistId ?? null,
        posterImageUrl: data.posterImageUrl ?? null,
        externalLink: data.externalLink ?? null,
        mapsLink: data.mapsLink ?? null,
        status: data.status ?? EventStatus.draft,
      },
    });

    return await this.findById(created.id);
  }

  async update(id: number, data: UpdateEventData) {
    await prisma.event.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.startsAt !== undefined && { startsAt: data.startsAt }),
        ...(data.endsAt !== undefined && { endsAt: data.endsAt }),
        ...(data.venueId !== undefined && { venueId: data.venueId }),
        ...(data.artistId !== undefined && { artistId: data.artistId }),
        ...(data.posterImageUrl !== undefined && {
          posterImageUrl: data.posterImageUrl,
        }),
        ...(data.externalLink !== undefined && {
          externalLink: data.externalLink,
        }),
        ...(data.mapsLink !== undefined && { mapsLink: data.mapsLink }),
        ...(data.status !== undefined && { status: data.status }),
      },
    });

    return await this.findById(id);
  }

  async findByVenueId(venueId: number, limit = 50) {
    return await prisma.event.findMany({
      where: { venueId },
      orderBy: { startsAt: "asc" },
      include: {
        venue: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            state: true,
          },
        },
        primaryArtist: {
          select: {
            id: true,
            name: true,
            slug: true,
            genre: true,
          },
        },
        artists: {
          include: {
            artist: {
              select: {
                id: true,
                name: true,
                slug: true,
                genre: true,
              },
            },
          },
        },
      },
      take: limit,
    });
  }

  async findByArtistId(artistId: number, limit = 50) {
    return await prisma.event.findMany({
      where: {
        OR: [{ artistId }, { artists: { some: { artistId } } }],
      },
      orderBy: { startsAt: "asc" },
      include: {
        venue: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            state: true,
          },
        },
        primaryArtist: {
          select: {
            id: true,
            name: true,
            slug: true,
            genre: true,
          },
        },
        artists: {
          include: {
            artist: {
              select: {
                id: true,
                name: true,
                slug: true,
                genre: true,
              },
            },
          },
        },
      },
      take: limit,
    });
  }

  async search(query: string, limit = 10) {
    return await prisma.event.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { venue: { name: { contains: query, mode: "insensitive" } } },
          { primaryArtist: { name: { contains: query, mode: "insensitive" } } },
          {
            artists: {
              some: {
                artist: { name: { contains: query, mode: "insensitive" } },
              },
            },
          },
        ],
      },
      include: {
        venue: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            state: true,
          },
        },
        primaryArtist: {
          select: {
            id: true,
            name: true,
            slug: true,
            genre: true,
          },
        },
        artists: {
          include: {
            artist: {
              select: {
                id: true,
                name: true,
                slug: true,
                genre: true,
              },
            },
          },
        },
      },
      take: limit,
      orderBy: { startsAt: "asc" },
    });
  }

  async findByGenreAndLocation(filters: {
    genre?: string;
    city?: string;
    state?: string;
    limit?: number;
  }) {
    const { genre, city, state, limit = 5 } = filters;

    const where: any = {
      status: EventStatus.published,
      startsAt: { gte: new Date() },
    };

    if (city || state) {
      where.venue = {};
      if (city) where.venue.city = city;
      if (state) where.venue.state = state;
    }

    // If genre is specified and not "All Events", filter by genre
    if (genre && genre.toLowerCase() !== "all events" && genre !== "all-events") {
      where.primaryArtist = {
        genre: { equals: genre, mode: "insensitive" },
      };
    }
    // If genre is "All Events", don't filter by genre (show all)

    return await prisma.event.findMany({
      where,
      select: {
        id: true,
        title: true,
        startsAt: true,
        createdAt: true,
        posterImageUrl: true,
        externalLink: true,
        mapsLink: true,
        featured: true,
        venue: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            state: true,
          },
        },
        primaryArtist: {
          select: {
            id: true,
            name: true,
            slug: true,
            genre: true,
          },
        },
      },
      orderBy: { startsAt: "asc" },
      take: limit,
    });
  }

  async findFeaturedEvents(filters: {
    city?: string;
    state?: string;
    limit?: number;
  }) {
    const { city, state, limit = 5 } = filters;

    const where: any = {
      status: EventStatus.published,
      featured: true,
      startsAt: { gte: new Date() },
      OR: [
        { featuredUntil: null },
        { featuredUntil: { gte: new Date() } },
      ],
    };

    if (city || state) {
      where.venue = {};
      if (city) where.venue.city = city;
      if (state) where.venue.state = state;
    }

    return await prisma.event.findMany({
      where,
      select: {
        id: true,
        title: true,
        startsAt: true,
        createdAt: true,
        posterImageUrl: true,
        externalLink: true,
        mapsLink: true,
        featured: true,
        featuredUntil: true,
        venue: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            state: true,
          },
        },
        primaryArtist: {
          select: {
            id: true,
            name: true,
            slug: true,
            genre: true,
          },
        },
      },
      orderBy: [
        { featuredUntil: "asc" },
        { startsAt: "asc" },
      ],
      take: limit,
    });
  }

  async getAvailableGenres(filters?: { city?: string; state?: string }) {
    const { city, state } = filters || {};

    const where: any = {
      status: EventStatus.published,
      startsAt: { gte: new Date() },
    };

    if (city || state) {
      where.venue = {};
      if (city) where.venue.city = city;
      if (state) where.venue.state = state;
    }

    const events = await prisma.event.findMany({
      where,
      select: {
        primaryArtist: {
          select: {
            genre: true,
          },
        },
      },
    });

    const genreCounts = new Map<string, number>();

    // Count events with genres
    events.forEach((event) => {
      const genre = event.primaryArtist?.genre;
      if (genre) {
        genreCounts.set(genre, (genreCounts.get(genre) || 0) + 1);
      }
    });

    // Add "All Events" category with total count if there are events without genres
    const eventsWithoutGenre = events.filter(e => !e.primaryArtist?.genre).length;
    if (eventsWithoutGenre > 0 || genreCounts.size === 0) {
      genreCounts.set("All Events", events.length);
    }

    return Array.from(genreCounts.entries())
      .map(([name, count]) => ({
        name,
        count,
        slug: name.toLowerCase().replace(/\s+/g, "-"),
      }))
      .sort((a, b) => b.count - a.count);
  }

  async getAvailableCities() {
    const venues = await prisma.venue.findMany({
      where: {
        events: {
          some: {
            status: EventStatus.published,
            startsAt: { gte: new Date() },
          },
        },
      },
      select: {
        city: true,
        state: true,
        latitude: true,
        longitude: true,
        _count: {
          select: {
            events: {
              where: {
                status: EventStatus.published,
                startsAt: { gte: new Date() },
              },
            },
          },
        },
      },
      distinct: ["city", "state"],
    });

    return venues
      .filter((v) => v.city && v.state)
      .map((v) => ({
        city: v.city!,
        state: v.state!,
        latitude: v.latitude ? Number(v.latitude) : null,
        longitude: v.longitude ? Number(v.longitude) : null,
        count: v._count.events,
      }))
      .sort((a, b) => b.count - a.count);
  }
}

export const eventRepository = new EventRepository();
