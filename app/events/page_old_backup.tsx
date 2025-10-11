import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { eventService } from '@/lib/services/EventService';
import EventsBrowser, { type EventListItem } from './EventsBrowser';

// Enable ISR - revalidate every 60 seconds
export const revalidate = 60;

type EventsPageProps = {
  searchParams: Promise<{
    search?: string;
  }>;
};

function serializeEvents(events: Awaited<ReturnType<typeof eventService.getEvents>>): EventListItem[] {
  return events.map((event) => ({
    id: event.id,
    title: event.title,
    startsAt: event.startsAt.toISOString(),
    createdAt: event.createdAt.toISOString(),
    posterImageUrl: event.posterImageUrl ?? null,
    externalLink: event.externalLink ?? null,
    mapsLink: event.mapsLink ?? null,
    venue: event.venue
      ? {
          id: event.venue.id,
          name: event.venue.name,
          slug: event.venue.slug,
          city: event.venue.city,
          state: event.venue.state,
        }
      : null,
  }));
}

export default async function EventsPage(props: EventsPageProps) {
  const resolvedSearchParams = await props.searchParams;
  const initialSearch = typeof resolvedSearchParams.search === 'string'
    ? resolvedSearchParams.search
    : '';
  let serializedEvents: EventListItem[] = [];
  let initialError: string | null = null;

  try {
    const events = await eventService.getEvents({ search: initialSearch || undefined });
    serializedEvents = serializeEvents(events);
  } catch (error) {
    console.error('Failed to load events', error);
    initialError = 'Events are temporarily unavailable. Please try again later.';
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <EventsBrowser
          initialEvents={serializedEvents}
          initialSearch={initialSearch}
          initialError={initialError}
        />
      </main>
      <Footer />
    </div>
  );
}
