import { prisma } from '@/lib/db/prisma';

export class ArtistRepository {
  async findBySlug(slug: string) {
    return await prisma.artist.findUnique({
      where: { slug },
    });
  }

  async search(query: string, limit = 5) {
    return await prisma.artist.findMany({
      where: { name: { contains: query, mode: 'insensitive' } },
      take: limit,
    });
  }

  async findAll(filters?: { genre?: string }) {
    return await prisma.artist.findMany({
      where: {
        ...(filters?.genre && {
          genre: { contains: filters.genre, mode: 'insensitive' },
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

export const artistRepository = new ArtistRepository();
