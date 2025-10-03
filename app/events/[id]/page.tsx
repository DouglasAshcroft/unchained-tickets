'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api/client';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EventDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const eventId = parseInt(id, 10);
  const [showCheckout, setShowCheckout] = useState(false);

  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => api.getEventById(eventId),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-lg text-gray-400">Loading event...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
          <Card className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Event Not Found</h2>
            <p className="text-gray-400 mb-6">This event could not be found or has been removed.</p>
            <Link href="/events">
              <Button>Back to Events</Button>
            </Link>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const eventDate = new Date(event.startsAt).toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  const venueName = event?.venue?.name ?? 'Unknown venue';
  const venueLocation = event?.venue?.city && event?.venue?.state
    ? `${event.venue.city}, ${event.venue.state}`
    : '';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        <Link href="/events" className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6">
          ← Back to Events
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Event Image */}
          <div className="relative aspect-square overflow-hidden rounded-lg bg-zinc-800">
            {event.posterImageUrl ? (
              <Image
                src={event.posterImageUrl}
                alt={event.title || 'Event poster'}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                <span className="text-6xl">🎵</span>
              </div>
            )}
          </div>

          {/* Event Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                {event.title}
              </h1>

              {event.primaryArtist && (
                <Link
                  href={`/artists/${event.primaryArtist.slug}`}
                  className="text-xl text-gray-300 hover:text-blue-400 transition-colors"
                >
                  {event.primaryArtist.name}
                </Link>
              )}
            </div>

            <div className="space-y-3 text-gray-300">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📅</span>
                <div>
                  <div className="font-semibold">Date & Time</div>
                  <div className="text-gray-400">{eventDate}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">📍</span>
                <div>
                  <div className="font-semibold">Venue</div>
                  <Link
                    href={`/venues/${event.venue?.slug}`}
                    className="text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    {venueName}
                  </Link>
                  {venueLocation && (
                    <div className="text-sm text-gray-500">{venueLocation}</div>
                  )}
                </div>
              </div>

              {event.description && (
                <div className="flex items-start gap-3">
                  <span className="text-2xl">ℹ️</span>
                  <div>
                    <div className="font-semibold">About</div>
                    <div className="text-gray-400">{event.description}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Ticket Purchase Section */}
            <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/30">
              <div className="space-y-4">
                <h3 className="text-xl font-bold">Get Your NFT Tickets</h3>
                <p className="text-gray-400 text-sm">
                  Own your tickets as NFTs on Base. Secure, transferable, and yours forever.
                </p>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Price per ticket:</span>
                    <span className="text-xl font-bold">$25 USDC</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Network:</span>
                    <span className="text-blue-400">Base</span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  className="w-full text-lg py-4"
                  onClick={() => setShowCheckout(true)}
                >
                  Purchase Tickets
                </Button>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>🔒</span>
                  <span>Powered by OnchainKit • Secure blockchain transaction</span>
                </div>
              </div>
            </Card>

            {/* External Links */}
            <div className="flex gap-3">
              {event.externalLink && (
                <a
                  href={event.externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center px-4 py-3 rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/5 transition-colors"
                >
                  View Event Details
                </a>
              )}
              {event.mapsLink && (
                <a
                  href={event.mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center px-4 py-3 rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/5 transition-colors"
                >
                  📍 Get Directions
                </a>
              )}
            </div>
          </div>
        </div>

        {/* TODO: Add Checkout Modal with OnchainKit */}
        {showCheckout && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">Purchase Tickets</h3>
                  <button
                    onClick={() => setShowCheckout(false)}
                    className="text-gray-400 hover:text-white text-2xl"
                  >
                    ×
                  </button>
                </div>

                <p className="text-gray-400">
                  OnchainKit checkout integration coming soon. This will allow you to purchase tickets with USDC on Base.
                </p>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Quantity:</span>
                    <span>1 ticket</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price:</span>
                    <span>$25 USDC</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>$25 USDC</span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => {
                    alert('Checkout will be integrated with OnchainKit in the next step!');
                    setShowCheckout(false);
                  }}
                >
                  Complete Purchase
                </Button>
              </div>
            </Card>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
