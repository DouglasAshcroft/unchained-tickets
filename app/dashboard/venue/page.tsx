import { VenueDashboard } from '@/components/dashboard/venue/VenueDashboard';
import { VenueDashboardGate } from '@/components/dashboard/venue/VenueDashboardGate';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { mockVenueDashboard } from '@/lib/mocks/venueDashboard';
import { venueDashboardService } from '@/lib/services/VenueDashboardService';
import { prisma } from '@/lib/db/prisma';

export const metadata = {
  title: 'Venue Dashboard · Unchained',
};

export default async function VenueDashboardPage() {
  let data = mockVenueDashboard;
  let error: string | null = null;

  try {
    // TODO Phase 4.1: Implement server-side auth with cookies
    // Currently using client-side JWT auth only. Need to add:
    // 1. Cookie-based session management
    // 2. Server-side auth utility to get current user
    // 3. Query user's venue from database
    // Example future implementation:
    // const user = await getServerSideUser();
    // if (user?.role === 'venue' || user?.role === 'admin' || user?.role === 'dev') {
    //   const userVenue = await prisma.venue.findFirst({ where: { ownerUserId: user.id } });
    //   if (userVenue) {
    //     data = await venueDashboardService.getDashboardData(userVenue.id);
    //   }
    // }

    // For now: load the first venue in database (dev/testing only)
    const firstVenue = await prisma.venue.findFirst({ select: { id: true } });
    if (firstVenue) {
      data = await venueDashboardService.getDashboardData(firstVenue.id);
    } else {
      throw new Error('No venues configured yet');
    }
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load venue data';
    console.warn('Venue dashboard fallback:', error);
    // Fall back to mock data
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-ink-900 via-ink-900/95 to-ink-900">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <VenueDashboardGate>
          <VenueDashboard data={data} />
        </VenueDashboardGate>
      </main>
      <Footer />
    </div>
  );
}
