import { VenueDashboard } from '@/components/dashboard/venue/VenueDashboard';
import { VenueDashboardGate } from '@/components/dashboard/venue/VenueDashboardGate';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { mockVenueDashboard } from '@/lib/mocks/venueDashboard';
import { venueDashboardService } from '@/lib/services/VenueDashboardService';

export const metadata = {
  title: 'Venue Dashboard · Unchained',
};

export default async function VenueDashboardPage() {
  let data = mockVenueDashboard;

  try {
    // TODO: replace hard-coded ID with authenticated venue context once RBAC is in place
    data = await venueDashboardService.getDashboardData(1);
  } catch (error) {
    console.error('Failed to load venue dashboard data, falling back to mock payload', error);
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
