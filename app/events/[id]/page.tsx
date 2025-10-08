'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckoutModal } from '@/components/CheckoutModal';
import { toast } from 'react-hot-toast';
import api from '@/lib/api/client';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EventDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const eventId = parseInt(id, 10);
  const router = useRouter();
  const [showCheckout, setShowCheckout] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedTier, setSelectedTier] = useState('ga');

  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => api.getEventById(eventId),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-lg text-grit-300">Loading event...</div>
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
            <h2 className="brand-heading text-2xl mb-4">Event Not Found</h2>
            <p className="text-grit-300 mb-6">This event could not be found or has been removed.</p>
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
        <Link href="/events" className="inline-flex items-center text-acid-400 hover:text-hack-green mb-6 transition-colors">
          ← Back to Events
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Event Image */}
          <div className="relative aspect-square overflow-hidden rounded-lg bg-ink-800">
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
              <div className="absolute inset-0 flex items-center justify-center text-grit-400">
                <span className="text-6xl">🎵</span>
              </div>
            )}
          </div>

          {/* Event Details */}
          <div className="space-y-6">
            <div>
              <h1 className="brand-heading text-4xl mb-3 bg-gradient-to-r from-resistance-500 via-hack-green to-acid-400 bg-clip-text text-transparent">
                {event.title}
              </h1>

              {event.primaryArtist && (
                <Link
                  href={`/artists/${event.primaryArtist.slug}`}
                  className="text-xl text-bone-100 hover:text-acid-400 transition-colors"
                >
                  {event.primaryArtist.name}
                </Link>
              )}
            </div>

            <div className="space-y-3 text-bone-100">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📅</span>
                <div>
                  <div className="font-semibold">Date & Time</div>
                  <div className="text-grit-300">{eventDate}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">📍</span>
                <div>
                  <div className="font-semibold">Venue</div>
                  <Link
                    href={`/venues/${event.venue?.slug}`}
                    className="text-grit-300 hover:text-acid-400 transition-colors"
                  >
                    {venueName}
                  </Link>
                  {venueLocation && (
                    <div className="text-sm text-grit-400">{venueLocation}</div>
                  )}
                </div>
              </div>

              {event.description && (
                <div className="flex items-start gap-3">
                  <span className="text-2xl">ℹ️</span>
                  <div>
                    <div className="font-semibold">About</div>
                    <div className="text-grit-300">{event.description}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Supporting Artists */}
            {event.supportingArtists && event.supportingArtists.length > 0 && (
              <div>
                <h3 className="brand-heading text-lg mb-3 text-bone-100">Supporting Artists</h3>
                <div className="flex flex-wrap gap-2">
                  {event.supportingArtists.map((artist: any) => (
                    <Link
                      key={artist.id}
                      href={`/artists/${artist.slug}`}
                      className="px-3 py-1 rounded-full border border-acid-400/30 text-sm text-acid-400 hover:bg-acid-400/10 transition-colors"
                    >
                      {artist.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Ticket Purchase Section */}
            <Card className="bg-gradient-to-br from-resistance-500/10 to-acid-400/10 border-resistance-500/30">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="brand-heading text-xl">Get Your NFT Tickets</h3>
                  <div className="text-sm">
                    <span className="text-grit-400">Available: </span>
                    <span className="text-acid-400 font-bold">{event.availableTickets || 0}</span>
                  </div>
                </div>
                <p className="text-grit-300 text-sm">
                  Own your tickets as NFTs on Base. Secure, transferable, and yours forever.
                </p>

                {/* Ticket Tiers */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-bone-100">Select Tier</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedTier('ga')}
                      className={`p-3 rounded-lg border transition-all ${
                        selectedTier === 'ga'
                          ? 'border-acid-400 bg-acid-400/10'
                          : 'border-grit-500/30 hover:border-grit-500/50'
                      }`}
                    >
                      <div className="font-semibold text-bone-100">General Admission</div>
                      <div className="text-sm text-grit-300">$0.25 USDC</div>
                    </button>
                    <button
                      onClick={() => setSelectedTier('vip')}
                      className={`p-3 rounded-lg border transition-all ${
                        selectedTier === 'vip'
                          ? 'border-acid-400 bg-acid-400/10'
                          : 'border-grit-500/30 hover:border-grit-500/50'
                      }`}
                    >
                      <div className="font-semibold text-bone-100">VIP</div>
                      <div className="text-sm text-grit-300">$0.50 USDC</div>
                    </button>
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-bone-100">Quantity</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="w-10 h-10 rounded-lg border border-grit-500/30 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      −
                    </button>
                    <span className="flex-1 text-center text-xl font-bold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(8, quantity + 1))}
                      disabled={quantity >= 8}
                      className="w-10 h-10 rounded-lg border border-grit-500/30 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Price Summary */}
                <div className="space-y-2 pt-2 border-t border-grit-500/30">
                  <div className="flex justify-between items-center">
                    <span className="text-grit-300">Price per ticket:</span>
                    <span className="text-lg font-bold text-acid-400">
                      ${selectedTier === 'vip' ? '0.50' : '0.25'} USDC
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-grit-300">Quantity:</span>
                    <span className="text-bone-100">{quantity}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-grit-400">Network:</span>
                    <span className="text-acid-400">Base</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-grit-500/30">
                    <span className="font-bold text-bone-100">Total:</span>
                    <span className="text-2xl font-bold text-acid-400">
                      ${(selectedTier === 'vip' ? 0.50 : 0.25) * quantity} USDC
                    </span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  className="w-full text-lg py-4"
                  onClick={() => setShowCheckout(true)}
                >
                  Purchase {quantity} Ticket{quantity > 1 ? 's' : ''}
                </Button>

                <div className="flex items-center gap-2 text-xs text-grit-400">
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

        {/* OnchainKit Checkout Modal */}
        <CheckoutModal
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
          eventId={eventId}
          eventTitle={event.title}
          ticketTier={selectedTier === 'vip' ? 'VIP' : 'General Admission'}
          quantity={quantity}
          totalPrice={(selectedTier === 'vip' ? 0.50 : 0.25) * quantity}
          onSuccess={(transactionId) => {
            toast.success('NFT Ticket Minted! Check your wallet.', { duration: 3000 });
            console.log('Transaction completed:', transactionId);
            // Redirect to My Tickets page after short delay
            setTimeout(() => {
              router.push('/my-tickets');
            }, 2000);
          }}
        />
      </main>

      <Footer />
    </div>
  );
}
