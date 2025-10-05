import { prisma } from '@/lib/db/prisma';

export class VenueRepository {
  async findBySlug(slug: string) {
    return await prisma.venue.findUnique({
      where: { slug },
    });
  }

  async search(query: string, limit = 5) {
    return await prisma.venue.findMany({
      where: { name: { contains: query, mode: 'insensitive' } },
      take: limit,
    });
  }

  async findAll(filters?: { location?: string; minCapacity?: number }) {
    return await prisma.venue.findMany({
      where: {
        ...(filters?.location && {
          location: { contains: filters.location, mode: 'insensitive' },
        }),
        ...(filters?.minCapacity && {
          capacity: { gte: filters.minCapacity },
        }),
      },
      include: {
        events: {
          select: { id: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }
}

export const venueRepository = new VenueRepository();
