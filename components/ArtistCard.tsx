'use client';

import { memo } from 'react';
import Link from 'next/link';
import { Card } from './ui/Card';

interface Artist {
  id: number;
  name: string;
  slug: string;
  genre?: string;
  eventCount?: number;
}

interface ArtistCardProps {
  artist: Artist;
}

function ArtistCard({ artist }: ArtistCardProps) {
  if (!artist) return null;

  const eventCountText = artist.eventCount === 1
    ? '1 upcoming show'
    : `${artist.eventCount || 0} upcoming shows`;

  return (
    <Card className="h-full min-h-[280px] flex flex-col" accentLeft data-testid={`artist-card-${artist.slug}`}>
      <div className="flex flex-1 flex-col">
        <div className="relative mb-3 aspect-square overflow-hidden rounded-lg bg-gradient-to-br from-cobalt-500/20 via-resistance-500/20 to-acid-400/20">
          <div className="absolute inset-0 flex items-center justify-center text-6xl">
            🎤
          </div>
        </div>

        <h2 className="brand-heading mb-2 text-center text-xl text-acid-400">
          {artist.name}
        </h2>

        {artist.genre && (
          <p className="mb-2 text-center text-sm text-grit-300">
            {artist.genre}
          </p>
        )}

        <p className="mb-3 text-center text-sm font-semibold text-bone-100">
          {eventCountText}
        </p>
      </div>

      <Link
        href={`/artists/${artist.slug}`}
        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-heading text-sm border transition-all uppercase tracking-wider bg-resistance-500 hover:brightness-110 text-ink-900 border-resistance-500 w-full"
        data-testid={`view-artist-${artist.slug}`}
      >
        View Artist
      </Link>
    </Card>
  );
}

export default memo(ArtistCard);
