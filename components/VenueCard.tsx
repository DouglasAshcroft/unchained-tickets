'use client';

import { memo } from 'react';
import Link from 'next/link';
import { Card } from './ui/Card';

interface Venue {
  id: number;
  name: string;
  slug: string;
  location?: string;
  city?: string;
  state?: string;
  capacity?: number;
  eventCount?: number;
}

interface VenueCardProps {
  venue: Venue;
}

function VenueCard({ venue }: VenueCardProps) {
  if (!venue) return null;

  const location = venue.location ||
    (venue.city && venue.state ? `${venue.city}, ${venue.state}` : 'Location TBA');

  const eventCountText = venue.eventCount === 1
    ? '1 upcoming event'
    : `${venue.eventCount || 0} upcoming events`;

  return (
    <Card className="h-full min-h-[280px] flex flex-col" accentLeft data-testid={`venue-card-${venue.slug}`}>
      <div className="flex flex-1 flex-col">
        <div className="relative mb-3 aspect-[16/9] overflow-hidden rounded-lg bg-gradient-to-br from-resistance-500/20 via-hack-green/20 to-acid-400/20">
          <div className="absolute inset-0 flex items-center justify-center text-6xl">
            🏛️
          </div>
        </div>

        <h2 className="brand-heading mb-2 text-center text-xl text-acid-400">
          {venue.name}
        </h2>

        <p className="mb-1 text-center text-sm text-grit-300">
          {location}
        </p>

        {venue.capacity && (
          <p className="mb-2 text-center text-xs text-grit-400">
            Capacity: {venue.capacity.toLocaleString()}
          </p>
        )}

        <p className="mb-3 text-center text-sm font-semibold text-bone-100">
          {eventCountText}
        </p>
      </div>

      <Link
        href={`/venues/${venue.slug}`}
        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-heading text-sm border transition-all uppercase tracking-wider bg-resistance-500 hover:brightness-110 text-ink-900 border-resistance-500 w-full"
        data-testid={`view-venue-${venue.slug}`}
      >
        View Venue
      </Link>
    </Card>
  );
}

export default memo(VenueCard);
