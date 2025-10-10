import { EventStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

interface EventFilters {
  search?: string;
}

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
}

export const eventRepository = new EventRepository();
