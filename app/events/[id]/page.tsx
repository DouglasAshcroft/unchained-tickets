import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';
import { eventService } from '@/lib/services/EventService';
import PurchasePanel from './PurchasePanel';
import { sanitizePosterImageUrl } from '@/lib/utils/posterImage';

// Enable ISR - revalidate every 5 minutes
export const revalidate = 300;

type EventDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EventDetailPage(props: EventDetailPageProps) {
  const { id } = await props.params;
  const eventId = Number(id);
  if (Number.isNaN(eventId)) {
    notFound();
  }

  try {
    const event = await eventService.getEventById(eventId);

    const eventDate = event.startsAt.toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

    const venueName = event.venue?.name ?? 'Unknown venue';
    const venueLocation = event.venue?.city && event.venue?.state
      ? `${event.venue.city}, ${event.venue.state}`
      : '';
    const posterImageSrc = sanitizePosterImageUrl(event.posterImageUrl);

    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
          <Link
            href="/events"
            className="inline-flex items-center text-acid-400 hover:text-hack-green mb-6 transition-colors"
          >
            ← Back to Events
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-ink-800">
              <Image
                src={posterImageSrc}
                alt={event.title || 'Event poster'}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>

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
                    <div className="font-semibold">Date &amp; Time</div>
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

                {/* TODO Phase 3.3: Add description field to Event schema */}
              </div>

              {event.supportingArtists && event.supportingArtists.length > 0 && (
                <div>
                  <h3 className="brand-heading text-lg mb-3 text-bone-100">Supporting Artists</h3>
                  <div className="flex flex-wrap gap-2">
                    {event.supportingArtists.map((artist) => (
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

              <PurchasePanel
                eventId={event.id}
                eventTitle={event.title}
                availableTickets={event.availableTickets ?? 0}
                ticketTypes={event.ticketTypes ?? []}
              />

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
        </main>

        <Footer />
      </div>
    );
  } catch (error) {
    console.error('Event not found', error);
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
          <Card className="text-center py-12">
            <h2 className="brand-heading text-2xl mb-4">Event Not Found</h2>
            <p className="text-grit-300 mb-6">This event could not be found or has been removed.</p>
            <Link href="/events" className="inline-flex">
              <span className="px-4 py-2 rounded-lg border border-acid-400 text-acid-400 hover:bg-acid-400/10 transition-colors">
                Back to Events
              </span>
            </Link>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }
}
