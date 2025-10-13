/**
 * Venue Impact Page
 *
 * Shows marketing value and advocacy stats for a specific venue
 */

import { prisma } from '@/lib/db/prisma';
import { notFound } from 'next/navigation';
import { valueTrackingService } from '@/lib/services/ValueTrackingService';
import Link from 'next/link';

export default async function VenueImpactPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const venue = await prisma.venue.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      city: true,
      state: true,
    },
  });

  if (!venue) {
    notFound();
  }

  const marketingValue = await valueTrackingService.getVenueMarketingValue(venue.name);

  // Get events for this venue
  const events = await prisma.event.findMany({
    where: {
      venueId: venue.id,
      eventSource: { in: ['serper', 'manual'] },
    },
    select: {
      id: true,
      title: true,
      impressions: true,
      clickThroughs: true,
      advocacyCount: true,
      estimatedAdValue: true,
    },
    orderBy: { advocacyCount: 'desc' },
    take: 10,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/venues/${slug}`}
            className="text-purple-600 hover:text-purple-700 text-sm font-medium mb-4 inline-block"
          >
            ← Back to Venue
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {venue.name}
          </h1>
          <p className="text-lg text-gray-600">
            {venue.city}, {venue.state}
          </p>
        </div>

        {/* Marketing Value Overview */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg p-8 text-white mb-8">
          <h2 className="text-2xl font-bold mb-2">Free Marketing Value</h2>
          <p className="opacity-90 mb-6">
            Estimated value of impressions and advocacy provided by Unchained fans
          </p>

          <div className="text-5xl font-bold mb-2">
            ${marketingValue?.estimatedAdValue?.toFixed(2) || '0.00'}
          </div>
          <p className="text-sm opacity-75">
            Based on {marketingValue?.totalImpressions.toLocaleString() || 0} impressions
            and {marketingValue?.totalClicks.toLocaleString() || 0} clicks
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-purple-600 mb-1">
              {marketingValue?.totalImpressions.toLocaleString() || 0}
            </div>
            <div className="text-sm text-gray-600">Total Impressions</div>
            <div className="text-xs text-gray-500 mt-2">
              Worth ${((marketingValue?.totalImpressions || 0) / 1000 * 5).toFixed(2)} (CPM model)
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {marketingValue?.totalClicks.toLocaleString() || 0}
            </div>
            <div className="text-sm text-gray-600">Click-Throughs</div>
            <div className="text-xs text-gray-500 mt-2">
              Worth ${((marketingValue?.totalClicks || 0) * 0.5).toFixed(2)} (CPC model)
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-green-600 mb-1">
              {marketingValue?.totalAdvocates.toLocaleString() || 0}
            </div>
            <div className="text-sm text-gray-600">Fan Advocates</div>
            <div className="text-xs text-gray-500 mt-2">
              Fans asking for fair ticketing
            </div>
          </div>
        </div>

        {/* Top Events */}
        {events.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Top Events by Advocacy</h2>
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{event.title}</h3>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                      {event.advocacyCount} advocates
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">{event.impressions.toLocaleString()}</span> impressions
                    </div>
                    <div>
                      <span className="font-medium">{event.clickThroughs.toLocaleString()}</span> clicks
                    </div>
                    <div>
                      <span className="font-medium">${Number(event.estimatedAdValue).toFixed(2)}</span> value
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-8 bg-purple-600 rounded-xl shadow-lg p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Switch to Fair Ticketing?</h2>
          <p className="mb-6 opacity-90 max-w-2xl mx-auto">
            Your fans are asking for it. Lower fees, NFT protection, and better data ownership.
            Join venues who are already making the switch.
          </p>
          <a
            href="mailto:venues@unchained.tickets"
            className="inline-block px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Contact Sales
          </a>
        </div>

        {/* Methodology */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">How We Calculate Value</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Impressions:</strong> $5 per 1,000 views (industry CPM standard)</li>
            <li>• <strong>Clicks:</strong> $0.50 per click-through (CPC model)</li>
            <li>• <strong>Advocacy:</strong> Grassroots marketing value from fan outreach</li>
            <li>• All value is provided for free as part of the Unchained platform</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
