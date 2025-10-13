import { redirect } from 'next/navigation';
import { VenueDashboard } from '@/components/dashboard/venue/VenueDashboard';
import { VenueDashboardGate } from '@/components/dashboard/venue/VenueDashboardGate';
import { SupportModeBanner } from '@/components/admin/SupportModeBanner';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { mockVenueDashboard } from '@/lib/mocks/venueDashboard';
import { venueDashboardService } from '@/lib/services/VenueDashboardService';
import { venueSupportService } from '@/lib/services/VenueSupportService';
import { getVenueAccess } from '@/lib/utils/venueAuth';
import { prisma } from '@/lib/db/prisma';

export const metadata = {
  title: 'Venue Dashboard · Unchained',
};

export default async function VenueDashboardPage() {
  let data = mockVenueDashboard;
  let error: string | null = null;
  let supportSession: any = null;

  try {
    // TODO: Get authenticated user from session
    // For demo purposes, we'll use the admin user
    const user = await prisma.user.findUnique({
      where: { email: 'admin@unchained.xyz' },
      select: { id: true, role: true },
    });

    if (!user) {
      redirect('/');
    }

    // Get venue access information
    const access = await getVenueAccess(user.id);

    // Admin or Dev user
    if (user.role === 'admin' || user.role === 'dev') {
      // Check for active support session
      if (access.inSupportMode && access.venueId) {
        // Get support session details
        supportSession = await venueSupportService.getCurrentSupportSession(user.id);

        // Load supported venue's data
        data = await venueDashboardService.getDashboardData(access.venueId);
      } else {
        // No active session - redirect to venue selector
        redirect('/dashboard/venue/select');
      }
    }
    // Regular venue user
    else if (user.role === 'venue') {
      if (access.venueId) {
        data = await venueDashboardService.getDashboardData(access.venueId);
      } else {
        throw new Error('No venue associated with your account');
      }
    }
    // Unauthorized role
    else {
      redirect('/dashboard');
    }
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load venue data';
    console.warn('Venue dashboard error:', error);
    // Fallback to first venue for development
    const firstVenue = await prisma.venue.findFirst({ select: { id: true } });
    if (firstVenue) {
      data = await venueDashboardService.getDashboardData(firstVenue.id);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-ink-900 via-ink-900/95 to-ink-900">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <VenueDashboardGate>
          <div className="space-y-6">
            {/* Support Mode Banner */}
            {supportSession && (
              <SupportModeBanner
                venueName={supportSession.venueName}
                userId={1} // TODO: Get from session
                startedAt={supportSession.startedAt}
              />
            )}

            {/* Dashboard */}
            <VenueDashboard data={data} />
          </div>
        </VenueDashboardGate>
      </main>
      <Footer />
    </div>
  );
}
