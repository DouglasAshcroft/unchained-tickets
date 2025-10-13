'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface Venue {
  id: number;
  name: string;
  slug: string;
  city: string | null;
  state: string | null;
  capacity: number | null;
  imageUrl: string | null;
  _count: {
    events: number;
  };
  stats?: {
    published: number;
    drafts: number;
    completed: number;
  };
}

interface VenueSelectorProps {
  venues: Venue[];
  userId: number;
}

export function VenueSelector({ venues, userId }: VenueSelectorProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedVenueId, setSelectedVenueId] = useState<number | null>(null);

  // Filter and categorize venues
  const filteredVenues = useMemo(() => {
    const search = searchTerm.toLowerCase();
    return venues.filter((venue) => {
      const nameMatch = venue.name.toLowerCase().includes(search);
      const cityMatch = venue.city?.toLowerCase().includes(search);
      const stateMatch = venue.state?.toLowerCase().includes(search);
      return nameMatch || cityMatch || stateMatch;
    });
  }, [venues, searchTerm]);

  const categorizedVenues = useMemo(() => {
    const active: Venue[] = [];
    const onboarding: Venue[] = [];
    const inactive: Venue[] = [];

    filteredVenues.forEach((venue) => {
      if (venue._count.events > 0) {
        active.push(venue);
      } else if (venue._count.events === 0) {
        onboarding.push(venue);
      } else {
        inactive.push(venue);
      }
    });

    return { active, onboarding, inactive };
  }, [filteredVenues]);

  const handleSelectVenue = async (venueId: number) => {
    setLoading(true);
    setSelectedVenueId(venueId);

    try {
      const response = await fetch('/api/admin/support/venue/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, venueId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to start support session');
      }

      const { session } = await response.json();
      toast.success(`Entered support mode for ${session.venueName}`);

      // Redirect to venue dashboard
      router.push('/dashboard/venue');
      router.refresh();
    } catch (error: any) {
      console.error('Error starting support session:', error);
      toast.error(error.message || 'Failed to start support session');
      setLoading(false);
      setSelectedVenueId(null);
    }
  };

  const renderVenueCard = (venue: Venue) => (
    <button
      key={venue.id}
      onClick={() => handleSelectVenue(venue.id)}
      disabled={loading}
      className="w-full rounded-xl border border-grit-500/30 bg-ink-900/70 p-5 text-left transition-all hover:border-resistance-500/50 hover:bg-ink-800/80 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="brand-heading text-lg font-semibold text-bone-100">
            {venue.name}
          </h3>
          <p className="mt-1 text-sm text-grit-400">
            {venue.city && venue.state
              ? `${venue.city}, ${venue.state}`
              : 'Location pending'}
            {venue.capacity && ` · Capacity ${venue.capacity.toLocaleString()}`}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-grit-500/40 bg-ink-800 px-3 py-1 text-grit-300">
              {venue._count.events} {venue._count.events === 1 ? 'event' : 'events'}
            </span>
            {venue.stats && (
              <>
                {venue.stats.published > 0 && (
                  <span className="rounded-full border border-hack-green/40 bg-hack-green/10 px-3 py-1 text-hack-green">
                    {venue.stats.published} live
                  </span>
                )}
                {venue.stats.drafts > 0 && (
                  <span className="rounded-full border border-acid-400/40 bg-acid-400/10 px-3 py-1 text-acid-400">
                    {venue.stats.drafts} drafts
                  </span>
                )}
              </>
            )}
          </div>
        </div>
        {selectedVenueId === venue.id && loading && (
          <div className="flex h-10 w-10 items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-resistance-500 border-t-transparent" />
          </div>
        )}
      </div>
    </button>
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-8">
      {/* Header */}
      <header>
        <h1 className="brand-heading bg-gradient-to-r from-resistance-500 via-hack-green to-acid-400 bg-clip-text text-3xl font-bold text-transparent">
          Select Venue
        </h1>
        <p className="mt-2 text-grit-400">
          Choose a venue to access their dashboard and manage their events
        </p>
      </header>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search venues by name, city, or state..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-grit-500/30 bg-ink-900/70 px-4 py-3 text-bone-100 placeholder-grit-400 focus:border-resistance-500/50 focus:outline-none focus:ring-2 focus:ring-resistance-500/20"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-grit-400">
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Venue Categories */}
      {categorizedVenues.active.length > 0 && (
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-grit-400">
            Active Venues ({categorizedVenues.active.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {categorizedVenues.active.map(renderVenueCard)}
          </div>
        </section>
      )}

      {categorizedVenues.onboarding.length > 0 && (
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-grit-400">
            Onboarding ({categorizedVenues.onboarding.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {categorizedVenues.onboarding.map(renderVenueCard)}
          </div>
        </section>
      )}

      {categorizedVenues.inactive.length > 0 && (
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-grit-400">
            Inactive ({categorizedVenues.inactive.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {categorizedVenues.inactive.map(renderVenueCard)}
          </div>
        </section>
      )}

      {filteredVenues.length === 0 && (
        <div className="rounded-xl border border-grit-500/30 bg-ink-900/70 p-12 text-center">
          <p className="text-grit-400">No venues found matching &ldquo;{searchTerm}&rdquo;</p>
        </div>
      )}
    </div>
  );
}
