'use client';

import { memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from './ui/Card';

interface Event {
  id: number;
  title: string;
  startsAt: string;
  posterImageUrl?: string;
  externalLink?: string;
  mapsLink?: string;
  venue?: {
    id: number;
    name: string;
    slug: string;
    city?: string;
    state?: string;
  };
  primaryArtist?: {
    id: number;
    name: string;
    slug: string;
  };
}

interface EventCardProps {
  event: Event;
}

function EventCard({ event }: EventCardProps) {
  if (!event) return null;

  const when = new Date(event.startsAt).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  const venueName = event?.venue?.name ?? 'Unknown venue';
  const venueLocation = event?.venue?.city && event?.venue?.state
    ? `${event.venue.city}, ${event.venue.state}`
    : '';

  return (
    <Card className="h-full min-h-[420px] flex flex-col" accentLeft data-testid={`event-card-${event.id}`}>
      <div className="flex flex-1 flex-col">
        <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-lg bg-zinc-800">
          {event.posterImageUrl ? (
            <Image
              src={event.posterImageUrl}
              alt={event.title || 'Event poster'}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              <span className="text-4xl">🎵</span>
            </div>
          )}
        </div>

        <h2 className="mb-2 text-center text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
          {event.title ?? 'Untitled Event'}
        </h2>

        <p className="mb-1 text-center text-sm text-gray-400">{when}</p>

        <p className="mb-1 text-center text-sm font-semibold text-gray-300">{venueName}</p>

        {venueLocation && (
          <p className="mb-3 text-center text-xs text-gray-500">{venueLocation}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {event.externalLink && (
          <a
            href={event.externalLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center px-3 py-2 text-sm rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/5 transition-colors"
          >
            View Details
          </a>
        )}

        {event.mapsLink && (
          <a
            href={event.mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 px-3 py-2 text-sm rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/5 transition-colors"
            aria-label={`Directions to ${venueName}`}
          >
            📍 Directions
          </a>
        )}
      </div>

      <Link
        href={`/events/${event.id}`}
        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm border transition-colors bg-blue-600 hover:bg-blue-700 text-white border-blue-600 w-full"
        data-testid={`purchase-${event.id}`}
      >
        Purchase NFT Tickets
      </Link>
    </Card>
  );
}

export default memo(EventCard);
