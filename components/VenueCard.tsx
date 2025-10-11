'use client';

import { memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from './ui/Card';

interface Venue {
  id: number;
  name: string;
  slug: string;
  imageUrl?: string | null;
  location?: string | null;
  city?: string | null;
  state?: string | null;
  capacity?: number | null;
  eventCount?: number;
}

interface VenueCardProps {
  venue: Venue;
}

function VenueCard({ venue }: VenueCardProps) {
  if (!venue) return null;

  const location =
    venue.city && venue.state
      ? `${venue.city}, ${venue.state}`
      : venue.city || venue.state || 'Location TBA';

  const eventCountText = venue.eventCount === 1
    ? '1 upcoming event'
    : `${venue.eventCount || 0} upcoming events`;

  const venueImageSrc = venue.imageUrl || '/assets/textures/resistance-poster.jpg';

  return (
    <Card className="h-full min-h-[280px] flex flex-col" accentLeft data-testid={`venue-card-${venue.slug}`}>
      <div className="flex flex-1 flex-col">
        <div className="relative mb-3 aspect-[16/9] overflow-hidden rounded-lg bg-zinc-800">
          <Image
            src={venueImageSrc}
            alt={venue.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
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
