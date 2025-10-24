import Link from 'next/link';
import { notFound } from 'next/navigation';

import { eventService } from '@/lib/services/EventService';
import { sanitizePosterImageUrl } from '@/lib/utils/posterImage';
import { EventHeader } from './components/EventHeader';
import { EventDetails } from './components/EventDetails';
import { CollectiblePosterInfo } from './components/CollectiblePosterInfo';
import { EventNotFound } from './components/EventNotFound';
import PurchasePanel from './PurchasePanel';

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

    const posterImageSrc = sanitizePosterImageUrl(event.posterImageUrl);

    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
          <Link
            href="/events"
            className="inline-flex items-center text-acid-400 hover:text-hack-green mb-6 transition-colors"
          >
            ← Back to Events
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <EventHeader
              posterImageSrc={posterImageSrc}
              eventTitle={event.title}
            />

            <div className="space-y-6">
              <EventDetails
                title={event.title}
                primaryArtist={event.primaryArtist}
                supportingArtists={event.supportingArtists}
                eventDate={eventDate}
                venue={event.venue}
                externalLink={event.externalLink}
                mapsLink={event.mapsLink}
              />

              <PurchasePanel
                eventId={event.id}
                eventTitle={event.title}
                availableTickets={event.availableTickets ?? 0}
                ticketTypes={event.ticketTypes ?? []}
              />
            </div>
          </div>

          <CollectiblePosterInfo ticketTypes={event.ticketTypes ?? []} />
        </main>
      </div>
    );
  } catch (error) {
    console.error('Event not found', error);
    return <EventNotFound />;
  }
}
