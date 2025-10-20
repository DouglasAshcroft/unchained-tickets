"use client";

import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card } from "./ui/Card";
import { sanitizePosterImageUrl } from "@/lib/utils/posterImage";
import { toast } from "sonner";

interface Event {
  id: number;
  title: string;
  startsAt: string | Date;
  posterImageUrl?: string | null;
  externalLink?: string | null;
  mapsLink?: string | null;
  availableTickets?: number;
  featured?: boolean;
  createdAt?: string | Date;
  venue?: {
    id: number;
    name: string;
    slug: string;
    city?: string | null;
    state?: string | null;
  } | null;
  primaryArtist?: {
    id: number;
    name: string;
    slug: string;
  } | null;
}

interface EventCardProps {
  event: Event;
  priority?: boolean;
}

function ViewDetailsButton({ externalLink, eventTitle }: { externalLink?: string | null; eventTitle: string }) {
  const handleClick = (e: React.MouseEvent) => {
    if (!externalLink) {
      e.preventDefault();
      toast.error("We are still waiting on the event details", {
        description: `Details for "${eventTitle}" are not yet available.`,
      });
    }
  };

  return (
    <a
      href={externalLink || "#"}
      target={externalLink ? "_blank" : undefined}
      rel={externalLink ? "noopener noreferrer" : undefined}
      onClick={handleClick}
      className="flex-1 text-center px-3 py-2 text-sm rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/5 transition-colors cursor-pointer"
    >
      View Details
    </a>
  );
}

function EventCard({ event, priority = false }: EventCardProps) {
  if (!event) return null;

  const when = new Date(event.startsAt).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const venueName = event?.venue?.name ?? "Unknown venue";
  const venueLocation =
    event?.venue?.city && event?.venue?.state
      ? `${event.venue.city}, ${event.venue.state}`
      : "";

  const posterImageSrc = sanitizePosterImageUrl(event.posterImageUrl);

  // Determine badges
  const isSoldOut = event.availableTickets === 0;
  const isFeatured = event.featured === true;
  const isNew =
    event.createdAt &&
    new Date(event.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Created within last 7 days

  // Badge priority: SoldOut > Featured > New
  const showFeaturedBadge = isFeatured && !isSoldOut;

  return (
    <Card
      className="h-full min-h-[420px] flex flex-col"
      accentLeft
      data-testid={`event-card-${event.id}`}
      role="region"
      aria-label={`Event card for ${event.title}`}
    >
      <div className="flex flex-1 flex-col">
        <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-lg bg-zinc-800">
          <Image
            src={posterImageSrc}
            alt={event.title || "Event poster"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            priority={priority}
            loading={priority ? undefined : "lazy"}
            fetchPriority={priority ? "high" : undefined}
          />

          {/* Badges */}
          <div className="absolute top-2 right-2 flex flex-col gap-2">
            {isSoldOut && (
              <span className="px-2 py-1 text-xs font-bold uppercase tracking-wider rounded bg-signal-500 text-ink-900">
                Sold Out
              </span>
            )}
            {showFeaturedBadge && (
              <span className="px-2 py-1 text-xs font-bold uppercase tracking-wider rounded bg-acid-400 text-ink-900 shadow-lg">
                ⭐ Featured
              </span>
            )}
            {isNew && !isSoldOut && !showFeaturedBadge && (
              <span className="px-2 py-1 text-xs font-bold uppercase tracking-wider rounded bg-cobalt-500 text-bone-100">
                New
              </span>
            )}
          </div>
        </div>

        <h2 className="brand-heading mb-2 text-center text-xl text-acid-400" tabIndex={0} aria-label={event.title ?? "Untitled Event"}>
          {event.title ?? "Untitled Event"}
        </h2>

  <p className="mb-1 text-center text-sm text-grit-300" tabIndex={0} aria-label={`Event date and time: ${when}`}>{when}</p>

        <p className="mb-1 text-center text-sm font-semibold text-bone-100" tabIndex={0} aria-label={`Venue: ${venueName}`}>
          {venueName}
        </p>

        {venueLocation && (
          <p className="mb-3 text-center text-xs text-grit-400" tabIndex={0} aria-label={`Location: ${venueLocation}`}>
            {venueLocation}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <ViewDetailsButton externalLink={event.externalLink} eventTitle={event.title} />

        {event.mapsLink && (
          <a
            href={event.mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 px-3 py-2 text-sm rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-acid-400"
            aria-label={`Directions to ${venueName}`}
            tabIndex={0}
          >
             Directions
          </a>
        )}
      </div>

      {isSoldOut ? (
        <button
          disabled
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-heading text-sm border transition-all uppercase tracking-wider bg-grit-500 text-grit-300 border-grit-500 w-full cursor-not-allowed opacity-60 focus:outline-none focus:ring-2 focus:ring-acid-400"
          data-testid={`purchase-${event.id}`}
          aria-label="Sold Out"
        >
          Sold Out
        </button>
      ) : (
        <Link
          href={`/events/${event.id}`}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-heading text-sm border transition-all uppercase tracking-wider bg-resistance-500 hover:brightness-110 text-ink-900 border-resistance-500 w-full focus:outline-none focus:ring-2 focus:ring-acid-400"
          data-testid={`purchase-${event.id}`}
          aria-label="Purchase NFT Tickets"
        >
          Purchase NFT Tickets
        </Link>
      )}
    </Card>
  );
}

export default memo(EventCard);
