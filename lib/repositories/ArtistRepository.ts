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
      select: {
        id: true,
        name: true,
        slug: true,
        genre: true,
        _count: {
          select: { events: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: number) {
    return await prisma.artist.findUnique({ where: { id } });
  }
}

export const artistRepository = new ArtistRepository();
