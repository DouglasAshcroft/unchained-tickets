'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Lazy load the heavy dashboard component
const VenueDashboard = dynamic(
  () => import('./VenueDashboard').then((mod) => ({ default: mod.VenueDashboard })),
  {
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-ink-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-resistance-500 mb-4"></div>
          <p className="text-bone-100">Loading Dashboard...</p>
        </div>
      </div>
    ),
    ssr: false, // Dashboard requires client-side features
  }
);

// Lazy load other heavy dashboard components
export const VenueSeatMapManager = dynamic(
  () => import('./VenueSeatMapManager').then((mod) => ({ default: mod.VenueSeatMapManager })),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-resistance-500"></div>
      </div>
    ),
    ssr: false,
  }
);

export const VenueOnboardingPanel = dynamic(
  () => import('./VenueOnboardingPanel').then((mod) => ({ default: mod.VenueOnboardingPanel })),
  {
    loading: () => (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-resistance-500"></div>
      </div>
    ),
  }
);

export { VenueDashboard };

/**
 * Lazy-loaded Venue Dashboard wrapper with loading states
 *
 * This component delays loading heavy dashboard code until needed,
 * improving initial page load performance.
 *
 * Usage:
 * ```tsx
 * import { VenueDashboard } from '@/components/dashboard/venue/VenueDashboardLazy';
 *
 * export default function DashboardPage() {
 *   return <VenueDashboard />;
 * }
 * ```
 */
export default VenueDashboard;
