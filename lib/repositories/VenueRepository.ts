import { prisma } from '@/lib/db/prisma';

export class VenueRepository {
  async findById(id: number) {
    return await prisma.venue.findUnique({
      where: { id },
    });
  }

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
      select: {
        id: true,
        name: true,
        slug: true,
        imageUrl: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        state: true,
        postalCode: true,
        capacity: true,
        _count: {
          select: { events: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }
}

export const venueRepository = new VenueRepository();
