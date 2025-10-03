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
}

export const venueRepository = new VenueRepository();
