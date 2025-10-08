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

export default function VenueDetailPage({ params }: PageProps) {
  const { slug } = use(params);

  const { data, isLoading, error } = useQuery({
    queryKey: ['venue', slug],
    queryFn: () => api.getVenueBySlug(slug),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-lg text-grit-300">Loading venue...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !data?.venue) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
          <Card className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Venue Not Found</h2>
            <p className="text-gray-400 mb-6">This venue could not be found.</p>
            <Link href="/events">
              <Button>Back to Events</Button>
            </Link>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const { venue, events = [] } = data;
  const fullAddress = [venue.addressLine1, venue.addressLine2, venue.city, venue.state, venue.postalCode]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <Link href="/venues" className="inline-flex items-center text-acid-400 hover:brightness-110 mb-6 transition-all">
          ← Back to Venues
        </Link>

        {/* Venue Header */}
        <div className="mb-8">
          <h1 className="brand-heading text-4xl font-bold mb-3 bg-gradient-to-r from-resistance-500 via-hack-green to-acid-400 bg-clip-text text-transparent">
            {venue.name}
          </h1>

          <div className="flex flex-wrap gap-4 text-grit-300">
            {venue.city && venue.state && (
              <div className="flex items-center gap-2">
                <span className="text-xl">📍</span>
                <span>{venue.city}, {venue.state}</span>
              </div>
            )}
            {venue.capacity && (
              <div className="flex items-center gap-2">
                <span className="text-xl">👥</span>
                <span>Capacity: {venue.capacity.toLocaleString()}</span>
              </div>
            )}
          </div>

          {venue.description && (
            <p className="mt-4 text-grit-400 max-w-3xl">{venue.description}</p>
          )}

          {fullAddress && (
            <div className="mt-4">
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(fullAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 hover:border-acid-400/50 hover:bg-acid-400/10 transition-colors"
              >
                📍 Get Directions
              </a>
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <section>
          <h2 className="text-2xl font-bold mb-6">
            {events.length > 0 ? 'Upcoming Events' : 'No Upcoming Events'}
          </h2>

          {events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event: any) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <p className="text-grit-400">No upcoming events at this venue.</p>
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
