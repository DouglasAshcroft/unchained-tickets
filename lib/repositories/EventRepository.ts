import { prisma } from '@/lib/db/prisma';

interface EventFilters {
  search?: string;
}

export class EventRepository {
  async findMany(filters: EventFilters = {}) {
    const { search } = filters;

    const events = await prisma.event.findMany({
      where: search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { venue: { name: { contains: search, mode: 'insensitive' } } },
              { primaryArtist: { name: { contains: search, mode: 'insensitive' } } },
            ],
          }
        : {},
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
      orderBy: { startsAt: 'asc' },
      take: 50,
    });

    return events;
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
          },
        },
      },
    });
  }

  async findByVenueId(venueId: number, limit = 50) {
    return await prisma.event.findMany({
      where: { venueId },
      orderBy: { startsAt: 'asc' },
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
      orderBy: { startsAt: 'asc' },
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
          { title: { contains: query, mode: 'insensitive' } },
          { venue: { name: { contains: query, mode: 'insensitive' } } },
          { primaryArtist: { name: { contains: query, mode: 'insensitive' } } },
          {
            artists: {
              some: { artist: { name: { contains: query, mode: 'insensitive' } } },
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
      orderBy: { startsAt: 'asc' },
    });
  }
}

export const eventRepository = new EventRepository();
