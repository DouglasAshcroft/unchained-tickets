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
}

export const artistRepository = new ArtistRepository();
