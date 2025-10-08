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
    const { location, minCapacity } = filters ?? {};

    return await prisma.venue.findMany({
      where: {
        ...(location && {
          OR: [
            { city: { contains: location, mode: 'insensitive' } },
            { state: { contains: location, mode: 'insensitive' } },
            { addressLine1: { contains: location, mode: 'insensitive' } },
          ],
        }),
        ...(typeof minCapacity === 'number' && {
          capacity: { gte: minCapacity },
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
