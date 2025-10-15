import Link from "next/link";
import { notFound } from "next/navigation";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import EventCard from "@/components/EventCard";
import { eventService } from "@/lib/services/EventService";

type VenueDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function VenueDetailPage(props: VenueDetailPageProps) {
  const { slug } = await props.params;

  try {
    const { venue, events } = await eventService.getVenueWithEvents(slug);

    const addressParts = [
      venue.addressLine1,
      venue.addressLine2,
      venue.city,
      venue.state,
      venue.postalCode,
    ].filter(Boolean);
    const fullAddress = addressParts.join(", ");

    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
          <Link
            href="/venues"
            className="inline-flex items-center text-acid-400 hover:brightness-110 mb-6 transition-all"
          >
            ← Back to Venues
          </Link>

          <div className="mb-8">
            <h1 className="brand-heading text-4xl font-bold mb-3 bg-gradient-to-r from-resistance-500 via-hack-green to-acid-400 bg-clip-text text-transparent">
              {venue.name}
            </h1>

            <div className="flex flex-wrap gap-4 text-grit-300">
              {venue.city && venue.state && (
                <div className="flex items-center gap-2">
                  <span className="text-xl">📍</span>
                  <span>
                    {venue.city}, {venue.state}
                  </span>
                </div>
              )}
              {typeof venue.capacity === "number" && (
                <div className="flex items-center gap-2">
                  <span className="text-xl">👥</span>
                  <span>Capacity: {venue.capacity.toLocaleString()}</span>
                </div>
              )}
            </div>

            {fullAddress && (
              <div className="mt-4">
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(
                    fullAddress
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 hover:border-acid-400/50 hover:bg-acid-400/10 transition-colors"
                >
                  📍 Get Directions
                </a>
              </div>
            )}
          </div>

          <section>
            <h2 className="text-2xl font-bold mb-6">
              {events.length > 0 ? "Upcoming Events" : "No Upcoming Events"}
            </h2>

            {events.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <p className="text-grit-400">
                  No upcoming events at this venue.
                </p>
                <Link href="/events" className="mt-4 inline-block">
                  <Button>Browse All Events</Button>
                </Link>
              </Card>
            )}
          </section>
        </main>
      </div>
    );
  } catch (error) {
    console.error("Venue not found", error);
    notFound();
  }
}
