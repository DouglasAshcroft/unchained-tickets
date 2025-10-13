import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { VenueSelector } from '@/components/admin/VenueSelector';

export default async function VenueSelectPage() {
  // TODO: Get authenticated user from session
  // For demo purposes, we'll use the admin user
  const adminUser = await prisma.user.findUnique({
    where: { email: 'admin@unchained.xyz' },
    select: { id: true, role: true },
  });

  if (!adminUser) {
    redirect('/');
  }

  // Only allow admin and dev users
  if (adminUser.role !== 'admin' && adminUser.role !== 'dev') {
    redirect('/dashboard');
  }

  // Fetch all venues with event counts
  const venues = await prisma.venue.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      city: true,
      state: true,
      capacity: true,
      imageUrl: true,
      _count: {
        select: {
          events: true,
        },
      },
      events: {
        select: {
          status: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  // Add stats for each venue
  const venuesWithStats = venues.map((venue) => {
    const published = venue.events.filter((e) => e.status === 'published').length;
    const drafts = venue.events.filter((e) => e.status === 'draft').length;
    const completed = venue.events.filter((e) => e.status === 'completed').length;

    return {
      ...venue,
      events: undefined, // Remove events array
      stats: {
        published,
        drafts,
        completed,
      },
    };
  });

  return <VenueSelector venues={venuesWithStats} userId={adminUser.id} />;
}
