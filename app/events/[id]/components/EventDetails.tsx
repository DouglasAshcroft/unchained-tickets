import Link from 'next/link';

interface Artist {
  id: number;
  name: string;
  slug: string;
  genre?: string | null;
}

interface Venue {
  name: string;
  slug: string;
  city?: string | null;
  state?: string | null;
}

interface EventDetailsProps {
  title: string;
  primaryArtist?: Artist | null;
  supportingArtists?: Artist[];
  eventDate: string;
  venue?: Venue | null;
  externalLink?: string | null;
  mapsLink?: string | null;
}

export function EventDetails({
  title,
  primaryArtist,
  supportingArtists,
  eventDate,
  venue,
  externalLink,
  mapsLink,
}: EventDetailsProps) {
  const venueName = venue?.name ?? 'Unknown venue';
  const venueLocation =
    venue?.city && venue?.state ? `${venue.city}, ${venue.state}` : '';

  return (
    <div className="space-y-6">
      {/* Title and Primary Artist */}
      <div>
        <h1 className="brand-heading text-4xl mb-3 bg-gradient-to-r from-resistance-500 via-hack-green to-acid-400 bg-clip-text text-transparent">
          {title}
        </h1>

        {primaryArtist && (
          <Link
            href={`/artists/${primaryArtist.slug}`}
            className="text-xl text-bone-100 hover:text-acid-400 transition-colors"
          >
            {primaryArtist.name}
          </Link>
        )}
      </div>

      {/* Date and Venue */}
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
            {venue && (
              <Link
                href={`/venues/${venue.slug}`}
                className="text-grit-300 hover:text-acid-400 transition-colors"
              >
                {venueName}
              </Link>
            )}
            {!venue && <div className="text-grit-300">{venueName}</div>}
            {venueLocation && (
              <div className="text-sm text-grit-400">{venueLocation}</div>
            )}
          </div>
        </div>
      </div>

      {/* Supporting Artists */}
      {supportingArtists && supportingArtists.length > 0 && (
        <div>
          <h3 className="brand-heading text-lg mb-3 text-bone-100">
            Supporting Artists
          </h3>
          <div className="flex flex-wrap gap-2">
            {supportingArtists.map((artist) => (
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

      {/* External Links */}
      {(externalLink || mapsLink) && (
        <div className="flex gap-3">
          {externalLink && (
            <a
              href={externalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center px-4 py-3 rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/5 transition-colors"
            >
              View Event Details
            </a>
          )}
          {mapsLink && (
            <a
              href={mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center px-4 py-3 rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/5 transition-colors"
            >
              📍 Get Directions
            </a>
          )}
        </div>
      )}
    </div>
  );
}
