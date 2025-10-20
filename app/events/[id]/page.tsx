import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Card } from "@/components/ui/Card";
import { eventService } from "@/lib/services/EventService";
import PurchasePanel from "./PurchasePanel";
import { sanitizePosterImageUrl } from "@/lib/utils/posterImage";

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

    const eventDate = event.startsAt.toLocaleString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

    const venueName = event.venue?.name ?? "Unknown venue";
    const venueLocation =
      event.venue?.city && event.venue?.state
        ? `${event.venue.city}, ${event.venue.state}`
        : "";
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
            <div className="relative aspect-square overflow-hidden rounded-lg bg-ink-800">
              <Image
                src={posterImageSrc}
                alt={event.title || "Event poster"}
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
                      <div className="text-sm text-grit-400">
                        {venueLocation}
                      </div>
                    )}
                  </div>
                </div>

                {/* TODO Phase 3.3: Add description field to Event schema */}
              </div>

              {event.supportingArtists &&
                event.supportingArtists.length > 0 && (
                  <div>
                    <h3 className="brand-heading text-lg mb-3 text-bone-100">
                      Supporting Artists
                    </h3>
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

          {/* Collectible Poster System Info */}
          <Card className="mt-8 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-acid-400/10 border-indigo-500/30">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-20 h-20 rounded-lg bg-gradient-to-br from-indigo-600/30 to-purple-600/30 border border-indigo-500/40 flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-indigo-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>

                <div className="flex-1">
                  <h3 className="brand-heading text-xl mb-2 text-indigo-300">
                    Exclusive Collectible Concert Poster
                  </h3>
                  <p className="text-bone-100 mb-4">
                    Your NFT ticket includes an exclusive collectible concert
                    poster that reveals after you attend the event. Each ticket
                    tier unlocks unique artwork with different rarity levels.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {event.ticketTypes && event.ticketTypes.length > 0 ? (
                      event.ticketTypes.map((ticketType) => {
                        const rarityMultiplier =
                          ticketType.name.toLowerCase().includes("vip")
                            ? 2.0
                            : ticketType.name.toLowerCase().includes("premium")
                              ? 1.5
                              : 1.0;

                        const rarityLabel =
                          rarityMultiplier >= 2.0
                            ? "VIP"
                            : rarityMultiplier >= 1.5
                              ? "Premium"
                              : "Standard";

                        const rarityColor =
                          rarityMultiplier >= 2.0
                            ? "text-yellow-400 border-yellow-400/30 bg-yellow-400/10"
                            : rarityMultiplier >= 1.5
                              ? "text-purple-400 border-purple-400/30 bg-purple-400/10"
                              : "text-blue-400 border-blue-400/30 bg-blue-400/10";

                        return (
                          <div
                            key={ticketType.id}
                            className={`p-3 rounded-lg border ${rarityColor}`}
                          >
                            <div className="font-semibold text-sm mb-1">
                              {ticketType.name}
                            </div>
                            <div className="text-xs opacity-80">
                              {rarityLabel} • {rarityMultiplier}x Rarity
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="col-span-3 text-sm text-grit-400">
                        Tier information will be available soon
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-indigo-500/20">
                    <div className="flex items-center gap-2 text-sm text-grit-300">
                      <svg
                        className="w-4 h-4 text-acid-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>
                        Poster reveals after event check-in (Proof of
                        Attendance)
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-grit-300 mt-2">
                      <svg
                        className="w-4 h-4 text-acid-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                        />
                      </svg>
                      <span>Higher tiers unlock rarer, more valuable artwork</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </main>
      </div>
    );
  } catch (error) {
    console.error("Event not found", error);
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
          <Card className="text-center py-12">
            <h2 className="brand-heading text-2xl mb-4">Event Not Found</h2>
            <p className="text-grit-300 mb-6">
              This event could not be found or has been removed.
            </p>
            <Link href="/events" className="inline-flex">
              <span className="px-4 py-2 rounded-lg border border-acid-400 text-acid-400 hover:bg-acid-400/10 transition-colors">
                Back to Events
              </span>
            </Link>
          </Card>
        </main>
      </div>
    );
  }
}
