'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import EventCard from '@/components/EventCard';
import api from '@/lib/api/client';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ArtistDetailPage({ params }: PageProps) {
  const { slug } = use(params);

  const { data, isLoading, error } = useQuery({
    queryKey: ['artist', slug],
    queryFn: () => api.getArtistBySlug(slug),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-lg text-gray-400">Loading artist...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !data?.artist) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
          <Card className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Artist Not Found</h2>
            <p className="text-gray-400 mb-6">This artist could not be found.</p>
            <Link href="/events">
              <Button>Back to Events</Button>
            </Link>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const { artist, events = [] } = data;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <Link href="/events" className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6">
          ← Back to Events
        </Link>

        {/* Artist Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            {artist.name}
          </h1>

          <div className="flex flex-wrap gap-4 text-gray-300">
            {artist.genre && (
              <div className="flex items-center gap-2">
                <span className="text-xl">🎵</span>
                <span className="capitalize">{artist.genre}</span>
              </div>
            )}
            {artist.website && (
              <div>
                <a
                  href={artist.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300"
                >
                  🌐 Website
                </a>
              </div>
            )}
          </div>

          {artist.bio && (
            <p className="mt-4 text-gray-400 max-w-3xl">{artist.bio}</p>
          )}

          {/* Social Links */}
          {(artist.spotifyUrl || artist.instagramHandle || artist.twitterHandle) && (
            <div className="mt-4 flex gap-3">
              {artist.spotifyUrl && (
                <a
                  href={artist.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg border border-white/10 hover:border-green-500/50 hover:bg-green-500/10 transition-colors"
                >
                  🎧 Spotify
                </a>
              )}
              {artist.instagramHandle && (
                <a
                  href={`https://instagram.com/${artist.instagramHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg border border-white/10 hover:border-pink-500/50 hover:bg-pink-500/10 transition-colors"
                >
                  📷 Instagram
                </a>
              )}
              {artist.twitterHandle && (
                <a
                  href={`https://twitter.com/${artist.twitterHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10 transition-colors"
                >
                  🐦 Twitter
                </a>
              )}
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <section>
          <h2 className="text-2xl font-bold mb-6">
            {events.length > 0 ? 'Upcoming Shows' : 'No Upcoming Shows'}
          </h2>

          {events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event: any) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <p className="text-gray-400">No upcoming shows for this artist.</p>
              <Link href="/events" className="mt-4 inline-block">
                <Button>Browse All Events</Button>
              </Link>
            </Card>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
